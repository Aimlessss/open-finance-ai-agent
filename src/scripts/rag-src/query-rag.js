import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { key } from "../utils/api-key.js";

const client = new QdrantClient({
  url: "http://localhost:6333"
});

const genAI = new GoogleGenerativeAI(key);

async function ask(question) {
  // 1. USE THE EMBEDDING MODEL
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  try {
    const embed = await embedModel.embedContent(question);
    const queryVector = embed.embedding.values;

    // 2. VECTOR SEARCH (Your Qdrant logic is fine)
    const results = await client.search("api_docs", {
      vector: queryVector,
      limit: 5
    });

    const context = results.map(r => r.payload.text).join("\n\n");
    console.log("\nRetrieved Context:\n");

    results.forEach((r, i) => {
      console.log(`Result ${i + 1} (score ${r.score})`);
      console.log(r.payload.text);
      console.log("\n-------------------\n");
    });

    // 3. USE A GENERATIVE MODEL (The fix is here!)
    // Changed from gemini-embedding-2-preview to gemini-1.5-flash
    const generativeModel = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const prompt = `
  You are an assistant that answers questions using API Hub documentation.

  Use the context below to answer the question clearly and directly.

  If the answer is not in the context, say:
  "I could not find the answer in the documentation."

  Context:
  ${context}

  Question:
  ${question}

  Answer in clear technical language.
  `;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;

    console.log("\nAnswer:\n");
    console.log(response.text());

  } catch (error) {
    console.error("Error during RAG process:", error.message);
  }
}

ask("What is API Hub");