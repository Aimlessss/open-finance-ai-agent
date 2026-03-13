import fs from "fs";
import path from "path";

const docsDir = path.resolve("../../../data/filtered_data");
const outputPath = path.resolve("../../../data/graph/integration-overview-doc-graph.json");
const BASE_URL = "https://openfinanceuae.atlassian.net";

const graph = {};

function normalizeUrl(url) {

  if (!url) return null;

  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("/wiki")) {
    return BASE_URL + url;
  }

  return null;
}

function processDoc(doc) {

  if (!graph[doc.title]) {
    graph[doc.title] = [];
  }

  doc.sections.forEach(section => {
    section.blocks.forEach(block => {

        if (block.type === "reference") {
            const normalized = normalizeUrl(block.url);
            if (normalized) {
                graph[doc.title].push({
                title: block.text,
                url: normalized
                });
            }
        }
    });
  });
}

function walkDirectory(dir) {

  const files = fs.readdirSync(dir);

  files.forEach(file => {

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    }

    if (file.endsWith(".json")) {
      const raw = fs.readFileSync(fullPath, "utf8");
      const doc = JSON.parse(raw);

      processDoc(doc);
    }

  });

}

function saveGraph() {

  const graphDir = path.dirname(outputPath);

  if (!fs.existsSync(graphDir)) {
    fs.mkdirSync(graphDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
}

walkDirectory(docsDir);
saveGraph();

console.log("Graph built successfully");