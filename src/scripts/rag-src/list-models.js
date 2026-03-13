import { GoogleGenerativeAI } from "@google/generative-ai";
import { key } from "../utils/api-key.js";

const genAI = new GoogleGenerativeAI(key);

async function listModels() {
  try {
    // This calls the metadata endpoint to see what's available to YOU
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    console.log("Available Models:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("embedContent")) {
        console.log(`✅ ${m.name} (Supports Embeddings)`);
      }
    });
  } catch (e) {
    console.error("Could not list models. Is your API key valid?", e.message);
  }
}

listModels();