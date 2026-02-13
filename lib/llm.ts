import OpenAI from "openai";

const isLocalLM = !!process.env.LM_BASE_URL;

export const llm = new OpenAI({
  apiKey: isLocalLM
    ? process.env.LM_API_KEY
    : process.env.OPENAI_API_KEY,
  baseURL: isLocalLM
    ? process.env.LM_BASE_URL
    : undefined,
});
