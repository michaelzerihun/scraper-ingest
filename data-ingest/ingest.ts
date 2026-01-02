import * as cheerio from "cheerio";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://www.ecatholic2000.com/job/";
const INDEX_URL = `${BASE_URL}untitled-53.shtml`;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function delay(ms = 1400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Starting ingestion...");

  const { data: indexHtml } = await axios.get(INDEX_URL, { timeout: 10000 });
  const $index = cheerio.load(indexHtml);

  const candidates: { title: string; href: string }[] = [];
  $index('a[href^="untitled-"]').each((_, el) => {
    const $el = $index(el);
    const title = $el.text().trim();
    const href = $el.attr("href")?.split("#")[0];
    if (href && title) {
      candidates.push({ title, href });
    }
  });

  console.log(`Found ${candidates.length} candidates`);

  let chapter_number = 1;
  for (const cand of candidates) {
    const url = `${BASE_URL}${cand.href}`;
    console.log(`\nProcessing: ${cand.title}`);
    console.log(`URL: ${url}`);

    try {
      const { data: html } = await axios.get(url, { timeout: 15000 });
      const $ = cheerio.load(html);
      const contentContainer = $('table[border="0"][width="100%"] td').eq(1);
      let rawContent = contentContainer.html() || contentContainer.text() || "";

      // Enhanced cleaning
      rawContent = rawContent
        .replace(/<[^>]+>/g, "\n") // Remove HTML tags
        .replace(/MORALS ON THE BOOK OF JOB.*?GREGORY THE GREAT/gi, "") // Remove headers
        .replace(/Back to Top|Home|Previous|Next|Catholic Encyclopedia/gi, "") // Remove nav
        .replace(/\[\d+\]/g, "") // Remove footnotes
        .replace(/Copyright.*$/gis, "") // Remove copyright sections
        .replace(/[\r\n\t]+/g, "\n") // Normalize newlines
        .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
        .trim();

      // Strip title if it appears at the start (exact or slight variation)
      const titleLower = cand.title.toLowerCase().trim();
      const contentLower = rawContent.toLowerCase().trim();
      if (contentLower.startsWith(titleLower)) {
        rawContent = rawContent.slice(cand.title.length).trim();
      } else if (
        contentLower === titleLower ||
        contentLower.replace(/[^a-z0-9]/g, "") ===
          titleLower.replace(/[^a-z0-9]/g, "")
      ) {
        rawContent = ""; // Treat as only title if slight variation
      }

      console.log(
        `Cleaned content length: ${rawContent.length.toLocaleString()} characters`
      );

      let summary = "";
      const isJunk = rawContent.includes(".side_menu");
      const isOnlyTitle =
        rawContent.trim().length === 0 ||
        rawContent.trim().toLowerCase() === titleLower;
      const isCopyright = rawContent.toLowerCase().includes("copyright");

      // Detection without char limit: Skip if junk, only title, or pure copyright (after stripping)
      if (
        isJunk ||
        isOnlyTitle ||
        (isCopyright &&
          rawContent.replace(/copyright.*$/gis, "").trim().length === 0)
      ) {
        console.warn(
          "Empty, only title, copyright, or junk content detected, setting empty state"
        );
        console.log("Content:", rawContent.slice(0, 400));
        rawContent = "";
      } else if (rawContent.length > 0) {
        const prompt = `Ignore any copyright notices, chapter titles, or navigation elements. Focus solely on summarizing the main content: the theological themes, biblical interpretations, and moral lessons from St. Gregory the Great's commentary on the Book of Job. Provide a concise, insightful summary (200–400 words). If the content is very short or insubstantial, provide a shorter summary accordingly. If there's nothing substantive to summarize, return an empty string.
Chapter content:
${rawContent.slice(0, 30000)}`; // Increased limit for longer chapters

        console.log("Generating summary...");
        const result = await model.generateContent(prompt);
        summary = result.response.text().trim();

        if (summary === "") {
          console.warn("AI returned empty summary, treating as no content");
          rawContent = "";
        } else {
          console.log(`Summary length: ${summary.length} characters`);
        }
      } else {
        console.warn("No content after cleaning, setting empty state");
      }

      const { error } = await supabase.from("chapters").upsert(
        {
          chapter_number,
          title: cand.title,
          content: rawContent,
          summary,
        },
        { onConflict: "chapter_number" }
      );

      if (error) {
        console.error("Supabase upsert error:", error.message);
      } else {
        console.log("→ Successfully saved/updated");
      }

      chapter_number++;
      await delay();
    } catch (err: any) {
      console.error("Error processing:", err.message);
      if (err.response) console.error("Response:", err.response.data);
    }
  }

  console.log("\nIngestion completed!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
