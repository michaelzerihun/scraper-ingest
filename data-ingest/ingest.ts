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
    let href = $el.attr("href")?.split("#")[0];

    if (href && title) {
      candidates.push({ title, href });
    }
  });

  console.log(`Found ${candidates.length} candidates`);

  let chapter_number = 1;

  for (const cand of candidates) {
    const url = `${BASE_URL}${cand.href}`;
    console.log(`Processing: ${cand.title}`);
    console.log(`URL: ${url}`);

    try {
      const { data: html } = await axios.get(url, { timeout: 15000 });
      const $ = cheerio.load(html);

      let contentContainer = $('table[border="0"][width="100%"] td').eq(1);

      let rawContent = contentContainer.html() || contentContainer.text() || "";

      rawContent = rawContent
        .replace(/<[^>]+>/g, "\n")
        .replace(/MORALS ON THE BOOK OF JOB.*?GREGORY THE GREAT/gi, "")
        .replace(/Back to Top|Home|Previous|Next|Catholic Encyclopedia/gi, "")
        .replace(/\[\d+\]/g, "")
        .replace(/[\r\n\t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      console.log(
        `Content length: ${rawContent.length.toLocaleString()} characters`
      );

      let summary = "";

      if (rawContent.length < 800) {
        console.warn("Insufficient content, setting empty state");
        console.log("First 400 chars:", rawContent.slice(0, 400));
        rawContent = "";
      } else {
        const prompt = `Provide a concise, insightful summary (200–400 words) of this chapter from St. Gregory the Great's "Morals on the Book of Job". Focus on theological themes, biblical interpretation, and moral lessons.

Chapter content:
${rawContent.slice(0, 12000)}`;

        console.log("Generating summary...");
        const result = await model.generateContent(prompt);
        summary = result.response.text().trim();

        console.log(`Summary length: ${summary.length} characters`);
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

  console.log("Ingestion completed!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
