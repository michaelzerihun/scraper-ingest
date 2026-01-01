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

  const chapters: { number: number; title: string; href: string }[] = [];

  $index('a[href^="untitled-"]').each((_, el) => {
    const $el = $index(el);
    const title = $el.text().trim();
    let href = $el.attr("href")?.split("#")[0];

    if (href && title.startsWith("BOOK ")) {
      const romanMatch = title.match(/BOOK\s+([IVXLCDM]+)/i);
      if (romanMatch) {
        const roman = romanMatch[1].toUpperCase();
        const romanMap: Record<string, number> = {
          I: 1,
          II: 2,
          III: 3,
          IV: 4,
          V: 5,
          VI: 6,
          VII: 7,
          VIII: 8,
          IX: 9,
          X: 10,
          XI: 11,
          XII: 12,
          XIII: 13,
          XIV: 14,
          XV: 15,
          XVI: 16,
          XVII: 17,
          XVIII: 18,
          XIX: 19,
          XX: 20,
          XXI: 21,
          XXII: 22,
          XXIII: 23,
          XXIV: 24,
          XXV: 25,
          XXVI: 26,
          XXVII: 27,
          XXVIII: 28,
          XXIX: 29,
          XXX: 30,
          XXXI: 31,
          XXXII: 32,
          XXXIII: 33,
          XXXIV: 34,
          XXXV: 35,
        };
        const number = romanMap[roman];
        if (number) {
          chapters.push({ number, title, href });
        }
      }
    }
  });

  console.log(`Found ${chapters.length} chapters`);

  chapters.sort((a, b) => a.number - b.number);

  for (const chapter of chapters) {
    const url = `${BASE_URL}${chapter.href}`;
    console.log(`\nProcessing Chapter ${chapter.number} - ${chapter.title}`);
    console.log(`URL: ${url}`);

    try {
      const { data: html } = await axios.get(url, { timeout: 15000 });
      const $ = cheerio.load(html);

      let contentContainer = $('table[border="0"][width="100%"] td').eq(1);

      if (contentContainer.text().trim().length < 300) {
        console.log("Main selector low content → fallback");
        contentContainer =
          $("body")
            .find("td")
            .filter(function () {
              return $(this).text().length > 500;
            })
            .first() || $("body");
      }

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

      if (rawContent.length < 800) {
        console.warn("WARNING: Content seems too short!");
        console.log("First 400 chars:", rawContent.slice(0, 400));
      }

      const prompt = `Provide a concise, insightful summary (200–400 words) of this chapter from St. Gregory the Great's "Morals on the Book of Job". Focus on theological themes, biblical interpretation, and moral lessons.

Chapter content:
${rawContent.slice(0, 12000)}`;

      console.log("Generating summary...");
      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();

      console.log(`Summary length: ${summary.length} characters`);

      const { error } = await supabase.from("chapters").upsert(
        {
          chapter_number: chapter.number,
          title: chapter.title,
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

      await delay();
    } catch (err: any) {
      console.error("Error processing chapter:", err.message);
      if (err.response) console.error("Response:", err.response.data);
    }
  }

  console.log("\nIngestion completed!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
