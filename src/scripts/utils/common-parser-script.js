import fs from "fs";
import * as cheerio from "cheerio";
import path from "path";
import { arrayStrings } from "../ai-src/list-models.js";

export function commonParser() {

  const filePath = path.resolve(
    "../../data/unfiltered_data/api-hub-doc-v8/lfi-integration/key-csr-and-certs.html"
  );

  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  const doc = {
    title: $("h1").first().text().trim(),
    sections: []
  };

  let currentSection = null;

  $("h1, h2, h3, p, table, iframe, a").each((i, el) => {
    const tag = el.tagName;

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      currentSection = {
        heading: $(el).text().trim(),
        blocks: []
      };
      doc.sections.push(currentSection);
    }

    else if (tag === "p" && currentSection) {
      currentSection.blocks.push({
        type: "text",
        content: $(el).text().trim()
      });
    }

    else if (tag === "table" && currentSection) {
      const rows = [];

      $(el).find("tr").each((i, row) => {
        const cols = [];
        $(row).find("th, td").each((i, cell) => {
          cols.push($(cell).text().trim());
        });
        rows.push(cols);
      });

      currentSection.blocks.push({
        type: "table",
        content: rows
      });
    }

    else if (tag === "iframe" && currentSection) {
      const src = $(el).attr("src");

      if (src && src.includes("youtube")) {
        currentSection.blocks.push({
          type: "video",
          url: src
        });
      }
    }

    else if (tag === "a" && currentSection) {
      const href = $(el).attr("href");

      if (href && href.includes("wiki")) {
        currentSection.blocks.push({
          type: "reference",
          text: $(el).text().trim(),
          url: href
        });
      }
    }
  });

  /* create output directory */

  const outputDir = path.resolve("../../data/filtered_data/api-hub-doc-v8/lfi-integration");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  /* write JSON */

  const outputPath = path.resolve(
    "../../data/filtered_data/api-hub-doc-v8/lfi-integration/key-csr-and-certs.json"
  );

  fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2));

  console.log("JSON created:", outputPath);
}


commonParser();