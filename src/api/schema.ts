import { z } from 'zod';

const transactionCount = z.object({ buys: z.number(), sells: z.number() }).catch({ buys: 0, sells: 0 });

export const tokenSchema = z.object({
  id: z.string(), symbol: z.string(), name: z.string(), address: z.string(), pairAddress: z.string(),
  dex: z.string(), quoteSymbol: z.string(), price: z.number(), marketCap: z.number().nullable(),
  liquidity: z.number(), volume24h: z.number(), volume1h: z.number(), change24h: z.number(),
  change1h: z.number(), txns5m: transactionCount, ageLabel: z.string(), ageMinutes: z.number(),
  imageUrl: z.string().url().optional(), source: z.string().optional(), dataQuality: z.string().optional(),
  sourceFetchedAt: z.number().optional(), holderCount: z.number().nullable().optional(),
  topHolderPct: z.number().nullable().optional(), sniperPct: z.number().nullable().optional(),
}).passthrough();

export type MarketToken = z.infer<typeof tokenSchema>;

export const trendingSchema = z.object({
  tokens: z.array(tokenSchema),
  source: z.string().default('unknown'),
  dataQuality: z.string().default('unknown'),
  fetchedAt: z.number().optional(),
  error: z.string().optional(),
  freshness: z.object({ isStale: z.boolean().optional(), ageMs: z.number().nullable().optional() }).passthrough().optional(),
}).passthrough();

export type TrendingResponse = z.infer<typeof trendingSchema>;
