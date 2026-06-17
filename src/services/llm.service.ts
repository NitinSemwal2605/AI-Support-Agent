import { GoogleGenAI } from '@google/genai';
import { LLMProvider, LLMHistoryEntry, LLMError, RateLimitError } from '../types';

const SYSTEM_PROMPT = `You are a professional customer support agent for our e-commerce store.

Your responsibilities:
- Answer customer questions clearly, concisely, and helpfully
- Only provide information that exists in the company's knowledge base provided below
- If the answer to a question is not in the knowledge base, politely state that you don't have that specific information and suggest the customer contact support directly at support@example.com or during support hours (Monday-Friday, 9AM-6PM IST)
- Maintain conversational context across the chat history
- Be warm, professional, and customer-friendly
- Format responses with markdown where appropriate (bullet points for lists, **bold** for emphasis)
- Keep responses concise but complete — aim for 2-4 sentences for simple questions, use bullet points for complex ones
- Never make up information, pricing, or policies that aren't in the knowledge base`;

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new LLMError('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = 'gemini-2.5-flash';
  }

  async generateReply(
    history: LLMHistoryEntry[],
    userMessage: string,
    knowledgeBase: string[]
  ): Promise<string> {
    try {
      const knowledgeContext =
        knowledgeBase.length > 0
          ? `\n\n## Company Knowledge Base\n\n${knowledgeBase.join('\n\n---\n\n')}`
          : '';

      const fullSystemPrompt = SYSTEM_PROMPT + knowledgeContext;

      // Build conversation history as formatted text
      const historyText = history
        .map((h) => `${h.role === 'user' ? 'Customer' : 'Support Agent'}: ${h.content}`)
        .join('\n\n');

      const fullPrompt = historyText
        ? `${historyText}\n\nCustomer: ${userMessage}\n\nSupport Agent:`
        : `Customer: ${userMessage}\n\nSupport Agent:`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
        config: {
          systemInstruction: fullSystemPrompt,
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text;
      if (!text) {
        throw new LLMError('Empty response from AI service');
      }

      return text.trim();
    } catch (err) {
      if (err instanceof LLMError) throw err;

      const error = err as Error;
      const message = error.message || '';

      if (
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('quota') ||
        message.includes('rate_limit') ||
        message.includes('429')
      ) {
        throw new RateLimitError('AI service rate limit reached. Please try again in a moment.');
      }

      if (
        message.includes('API_KEY_INVALID') ||
        message.includes('invalid_api_key') ||
        message.includes('401') ||
        message.includes('403')
      ) {
        throw new LLMError('AI service unavailable');
      }

      if (message.includes('SAFETY')) {
        throw new LLMError('Message could not be processed due to content policy.');
      }

      console.error('Gemini API error:', error);
      throw new LLMError('AI service temporarily unavailable. Please try again.');
    }
  }
}

// Singleton export — can be swapped for OpenAIProvider or ClaudeProvider
export const llmService: LLMProvider = new GeminiProvider();
