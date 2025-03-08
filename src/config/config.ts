export interface Config {
  openAIApiKey: string;
  maxConcurrentRequests: number;
  requestTimeoutMs: number;
}

export const getConfig = (): Config => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  return {
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxConcurrentRequests: Number(process.env.MAX_CONCURRENT_REQUESTS) || 5,
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 30000,
  };
};
