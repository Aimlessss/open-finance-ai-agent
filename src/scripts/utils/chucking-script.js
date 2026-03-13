import fs from "fs";
import path from "path";

function clean(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function createChunks(doc) {
  const chunks = [];

  doc.sections.forEach(section => {
    section.blocks.forEach(block => {

      if (block.type === "text") {
        chunks.push({
          text: `${section.heading}: ${clean(block.content)}`,
          metadata: {
            section: section.heading,
            doc: doc.title,
            type: "text"
          }
        });
      }

      if (block.type === "table") {
        block.content.forEach(row => {
          chunks.push({
            text: `${section.heading} table: ${row.join(" | ")}`,
            metadata: {
              section: section.heading,
              doc: doc.title,
              type: "table"
            }
          });
        });
      }

      if (block.type === "reference") {
        chunks.push({
          text: `${section.heading} reference: ${block.text}`,
          metadata: {
            section: section.heading,
            doc: doc.title,
            type: "reference",
            url: block.url
          }
        });
      }

    });
  });

  return chunks;
}

function chunkDocument(fileName) {

  const filePath = path.resolve(
    "../../data/filtered_data/api-hub-doc-v8/lfi-integration/" + fileName
  );

  if (!fs.existsSync(filePath)) {
    console.log("File not found:", filePath);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const doc = JSON.parse(raw);

  const chunks = createChunks(doc);

  const outputPath = path.resolve(
    "../../data/chunks/" + fileName.replace(".json", "-chunks.json")
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));

  console.log("Chunks created:", outputPath, "|", chunks.length);
}

chunkDocument("key-csr-and-certs.json");