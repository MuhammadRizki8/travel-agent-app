import mockProvider from './mockProvider';
import type Provider from './provider';

const PROVIDERS: Record<string, Provider> = {
  'mock-provider': mockProvider,
};

export function getProvider(name?: string): Provider {
  if (!name) return mockProvider;
  return PROVIDERS[name] ?? mockProvider;
}

export default getProvider;
