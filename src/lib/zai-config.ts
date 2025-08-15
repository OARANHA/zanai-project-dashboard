export interface ZAIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export const ZAI_DEFAULT_CONFIG: Partial<ZAIConfig> = {
  model: 'glm-4.5-flash',  // ← LINHA ALTERADA PARA O MODELO CORRETO
  maxTokens: 2000,
  temperature: 0.7,
};

export function getZAIConfig(): ZAIConfig {
  const apiKey = process.env.ZAI_API_KEY;
  const baseUrl = process.env.ZAI_BASE_URL;
  
  if (!apiKey) {
    throw new Error('ZAI_API_KEY environment variable is required');
  }

  return {
    apiKey,
    baseUrl,
    ...ZAI_DEFAULT_CONFIG,
  };
}

export function validateZAIConfig(config: ZAIConfig): boolean {
  return !!config.apiKey;
}