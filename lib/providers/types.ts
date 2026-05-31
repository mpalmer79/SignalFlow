export type ProviderMode = "mock";

export interface ProviderResponse {
  provider: string;
  mode: ProviderMode;
  simulated: true;
  summary: string;
}

export interface FutureIntegration {
  vendor: string;
  status: "planned";
}
