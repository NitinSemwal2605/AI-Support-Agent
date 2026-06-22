import Groq from 'groq-sdk';
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

export class GroqProvider implements LLMProvider {
  private client: Groq;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new LLMError('GROQ_API_KEY is not configured');
    }
    this.client = new Groq({ apiKey });
    this.modelName = 'llama3-70b-8192'; // Fast and high quality model
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

      // Map history to Groq chat completions format
      const messages: any[] = [
        { role: 'system', content: fullSystemPrompt },
        ...history.map((h) => ({
          role: h.role,
          content: h.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const completion = await this.client.chat.completions.create({
        messages,
        model: this.modelName,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) {
        throw new LLMError('Empty response from AI service');
      }

      return text.trim();
    } catch (err) {
      if (err instanceof LLMError) throw err;

      const error = err as Error;
      const message = error.message || '';

      if (
        message.includes('rate_limit') ||
        message.includes('429')
      ) {
        throw new RateLimitError('AI service rate limit reached. Please try again in a moment.');
      }

      if (
        message.includes('invalid_api_key') ||
        message.includes('401') ||
        message.includes('403')
      ) {
        throw new LLMError('AI service unavailable');
      }

      console.error('Groq API error:', error);
      throw new LLMError('AI service temporarily unavailable. Please try again.');
    }
  }
}

// Singleton export — can be swapped for OpenAIProvider or ClaudeProvider
export const llmService: LLMProvider = new GroqProvider();
