import Groq from "groq-sdk";

// Define the abstraction layer for AI models
// Defaulting to Groq API with Qwen model

export class AIService {
  constructor(provider = "groq") {
    this.provider = provider;
    this.client = null;
    if (this.provider === "groq") {
      this.defaultModel = "llama-3.3-70b-versatile"; 
    }
  }

  getClient() {
    if (this.client) return this.client;
    
    if (this.provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ_API_KEY is not defined in the environment variables.");
      }
      this.client = new Groq({ apiKey });
      return this.client;
    }
    
    throw new Error(`Provider ${this.provider} not implemented yet`);
  }

  async generateText({ prompt, systemPrompt = "You are a helpful AI assistant.", model }) {
    if (this.provider === "groq") {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        model: model || this.defaultModel,
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content || "";
    }
    
    // Extensibility: Add other providers here (OpenAI, Gemini, Hugging Face)
    throw new Error(`Provider ${this.provider} not implemented yet`);
  }
}

export const aiService = new AIService("groq");
