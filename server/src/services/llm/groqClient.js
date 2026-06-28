import Groq from 'groq-sdk';
import env from '../../config/env.js';

let client = null;
if (env.hasLlm) {
  client = new Groq({ apiKey: env.groqApiKey });
}

export const llmEnabled = env.hasLlm;

/**
 * Call Groq's chat completions with JSON mode and parse the result.
 * Throws on transport/parse errors so callers can fall back to the mock.
 *
 * @returns {Promise<object>} parsed JSON object from the model
 */
export async function chatJSON({ system, user, temperature = 0.7, maxTokens = 4096 }) {
  if (!client) throw new Error('LLM client not configured');

  const completion = await client.chat.completions.create({
    model: env.groqModel,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty LLM response');
  return JSON.parse(content);
}
