import fs from "fs";
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: "http://localhost:6333"
});

const embeddings = JSON.parse(
  fs.readFileSync("../../../data/embeddings.json")
);

async function upload() {

  await client.createCollection("api_docs", {
    vectors: {
      size: embeddings[0].embedding.length,
      distance: "Cosine"
    }
  });

  const points = embeddings.map((item, i) => ({
    id: i,
    vector: item.embedding,
    payload: {
      text: item.text,
      ...item.metadata
    }
  }));

  await client.upsert("api_docs", {
    points
  });

  console.log("Vectors uploaded");

}

upload();