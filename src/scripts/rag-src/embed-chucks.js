import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { key } from "../utils/api-key.js";

// Force the SDK to use the stable 'v1' endpoint if possible
const genAI = new GoogleGenerativeAI(key);

// Try the most modern stable identifier
const modelName = "models/gemini-embedding-001"; 

const chunksPath = path.resolve("../../data/all-chunks.json");
const chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));

async function embedChunks() {
  // Use the standard getter
  const model = genAI.getGenerativeModel({ model: modelName });

  console.log(`🚀 Starting embedding for ${chunks.length} chunks...`);

  const batchSize = 100; 

  for (let i = 0; i < chunks.length; i += batchSize) {
    const currentBatch = chunks.slice(i, i + batchSize);
    
    try {
      console.log(`Processing batch: ${i} to ${Math.min(i + batchSize, chunks.length)}...`);
      
      // Using the more modern batchEmbedContents structure
      const result = await model.batchEmbedContents({
        requests: currentBatch.map((c) => ({
          model: `models/${modelName}`, // Explicitly defining the model inside the request
          content: { parts: [{ text: c.text }] },
        })),
      });

      result.embeddings.forEach((emb, index) => {
        currentBatch[index].embedding = emb.values;
      });

      console.log(`✅ Batch starting at ${i} complete.`);
      
      // Safety delay
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`❌ Error at batch ${i}:`, err.message);
      
      // If text-embedding-004 fails, the API might only want 'embedding-001'
      if (err.message.includes("404")) {
        console.log("💡 Tip: If you see 404, your API key might not have 'Generative Language API' enabled in Google Cloud Console, or the model isn't available in your region.");
        break; 
      }
    }
  }

  const outputPath = path.resolve("../../data/embeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  console.log(`\nDone! Saved to ${outputPath}`);
}

embedChunks();