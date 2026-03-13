import fs from "fs";
import path from "path";
import axios from "axios";

const graphPath = "../../data/graph/integration-overview-doc-graph.json";

//remove file path '/crawled' later on
const outputDir = "../../data/unfiltered_data/api-hub-doc-v8/crawled";

const graph = JSON.parse(fs.readFileSync(graphPath));

const visited = new Set();

async function crawl(url) {

  if (visited.has(url)) return;
  visited.add(url);

  try {

    const res = await axios.get(url);

    const fileName = url
      .split("/")
      .pop()
      .replace(/\+/g, "-")
      .toLowerCase();

    const filePath = path.resolve(`${outputDir}/${fileName}.html`);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    fs.writeFileSync(filePath, res.data);

    console.log("Downloaded:", fileName);

  } catch (err) {
    console.log("Failed:", url);
  }
}

async function startCrawler() {

  for (const doc in graph) {

    const edges = graph[doc];

    for (const ref of edges) {

      await crawl(ref.url);

    }
  }

}

startCrawler();