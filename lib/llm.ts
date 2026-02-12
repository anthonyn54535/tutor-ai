import OpenAI from "openai";

export const llm = new OpenAI({
  apiKey: process.env.LM_API_KEY || "lm-studio",
  baseURL: process.env.LM_BASE_URL, // http://localhost:1234/v1
});
