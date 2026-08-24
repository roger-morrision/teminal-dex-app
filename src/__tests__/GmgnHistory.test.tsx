import { fireEvent, render } from "@testing-library/react-native";
import { GmgnHistory } from "../../app/ai";
import { fetchAiGmgnHistory } from "@/api/client";
import { aiGmgnHistorySchema, type AiGmgnHistory } from "@/api/schema";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const mint = "11111111111111111111111111111111";
const data: AiGmgnHistory = {
  providerHistory: [
    {
      id: "provider-1",
      address: mint,
      symbol: "SOL",
      name: "Solana",
      provider: "gmgn",
      observedAt: 1_800_000_000_000,
      persistedAt: 1_800_000_000_100,
      priceUsd: 150,
      liquidityUsd: 2_000_000,
      volume24hUsd: 4_000_000,
      confidence: 0.9,
      quality: "provider_observed",
      mintVerified: true,
    },
  ],
  historySummary: { sweeps: 3, observations: 20, returnedObservations: 20 },
  chainPolicy: {
    chain: "solana",
    crossChainEnabled: false,
    chainQualifiedIdentityRequired: true,
  },
  executionEnabled: false,
};

describe("GMGN discovery history", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "https://terminal.example";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  it("loads the verified-owner GET route with credentials", async () => {
    jest.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data }),
    } as Response);

    await expect(fetchAiGmgnHistory()).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith(
      "https://terminal.example/api/ai/gmgn-gems",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("fails closed on forged authority, duplicate IDs, and unordered evidence", () => {
    const response = { success: true, data };
    expect(aiGmgnHistorySchema.safeParse(response).success).toBe(true);
    expect(
      aiGmgnHistorySchema.safeParse({
        ...response,
        data: { ...data, executionEnabled: true },
      }).success,
    ).toBe(false);
    const older = { ...data.providerHistory[0], id: "older", observedAt: 10, persistedAt: 11 };
    expect(
      aiGmgnHistorySchema.safeParse({
        ...response,
        data: { ...data, providerHistory: [older, data.providerHistory[0]] },
      }).success,
    ).toBe(false);
    expect(
      aiGmgnHistorySchema.safeParse({
        ...response,
        data: { ...data, providerHistory: [data.providerHistory[0], data.providerHistory[0]] },
      }).success,
    ).toBe(false);
    expect(
      aiGmgnHistorySchema.safeParse({
        ...response,
        data: { ...data, providerHistory: Array(251).fill(data.providerHistory[0]) },
      }).success,
    ).toBe(false);
  });

  it("renders read-only provider evidence without an execution action", async () => {
    const onOpen = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <GmgnHistory data={data} loading={false} onOpen={onOpen} />
      </SettingsProvider>,
    );

    expect(screen.getByText("GMGN discovery history")).toBeTruthy();
    expect(screen.getByText("MINT VERIFIED")).toBeTruthy();
    expect(screen.getByText(/20 retained observations/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Open SOL GMGN provider evidence"));
    expect(onOpen).toHaveBeenCalledWith(mint);
    expect(screen.queryByText(/buy|execute|approve transaction/i)).toBeNull();
  });
});
