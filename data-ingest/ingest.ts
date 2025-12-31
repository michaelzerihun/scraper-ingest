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

async function ingestData() {
  const { data: html } = await axios.get(INDEX_URL);
  const $ = cheerio.load(html);
  const chapterLinks: { title: string; href: string }[] = [];

  $('a[href^="untitled-"]').each((i, el) => {
    const href = $(el).attr("href")?.split("#")[0]; // Remove anchor
    const title = $(el).text().trim();
    if (href && title) {
      chapterLinks.push({ title, href });
    }
  });

  const uniqueChapters = [...new Set(chapterLinks.map((c) => c.href))].map(
    (href) => chapterLinks.find((c) => c.href === href)!
  );

  for (let i = 0; i < uniqueChapters.length; i++) {
    const chapter = uniqueChapters[i];
    const fullUrl = `${BASE_URL}${chapter.href}`;
    const { data: chapterHtml } = await axios.get(fullUrl);
    const $chapter = cheerio.load(chapterHtml);

    const contentTd = $chapter("table td").eq(1);
    let content = contentTd.text().trim().replace(/\s+/g, " ");

    content = content
      .replace(
        /Morals On The Book Of Job: Volumes 1 To 3 -Saint Gregory The Great/,
        ""
      )
      .trim();

    const prompt = `Summarize the following chapter concisely in 200-300 words: ${content.slice(
      0,
      4000
    )}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    const { error } = await supabase.from("chapters").insert({
      chapter_number: i + 1,
      title: chapter.title,
      content,
      summary,
    });

    if (error) {
      console.error(`Error inserting chapter ${chapter.title}:`, error);
    } else {
      console.log(`Inserted chapter ${i + 1}: ${chapter.title}`);
    }
  }
}

ingestData().catch(console.error);
