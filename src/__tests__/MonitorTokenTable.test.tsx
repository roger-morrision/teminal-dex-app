import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { MonitorTokenTable } from "@/components/MonitorTokenTable";
import { SettingsProvider } from "@/settings/SettingsProvider";
import { fetchDiscovery } from "@/api/client";

jest.mock("@/api/client", () => ({
  ...jest.requireActual("@/api/client"),
  fetchDiscovery: jest.fn(),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const mockedFetch = fetchDiscovery as jest.MockedFunction<typeof fetchDiscovery>;

describe("MonitorTokenTable", () => {
  beforeEach(async () => {
    mockedFetch.mockReset();
    await AsyncStorage.clear();
  });

  it("keeps provider market rows explicitly monitor-only across presets", async () => {
    mockedFetch.mockResolvedValue({
      tokens: [
        {
          id: "pair",
          symbol: "DEX",
          name: "Terminal",
          address: "11111111111111111111111111111111",
          pairAddress: "pair",
          dex: "raydium",
          quoteSymbol: "SOL",
          price: 1,
          marketCap: 100,
          liquidity: 50,
          volume24h: 200,
          volume1h: 20,
          change24h: 3,
          change1h: 1,
          txns5m: { buys: 2, sells: 1 },
          ageLabel: "1h",
          ageMinutes: 60,
          source: "provider",
          dataQuality: "live",
        },
      ],
      source: "provider",
      dataQuality: "live",
      recordCount: 1,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    const screen = await render(
      <SettingsProvider>
        <QueryClientProvider client={client}>
          <MonitorTokenTable polling={false} />
        </QueryClientProvider>
      </SettingsProvider>,
    );
    await waitFor(() => expect(screen.getByText("Monitoring only")).toBeTruthy());
    expect(screen.getByText(/1\/1 records · provider · live/)).toBeTruthy();
    expect(screen.getByRole("summary").props.children).toContain("Market observations only");
    await fireEvent.press(screen.getByText("Liquidity"));
    expect(screen.getByText("Market cap")).toBeTruthy();
    expect(screen.getByLabelText("Horizontally scrollable Monitor token table")).toBeTruthy();
    screen.unmount();
    client.clear();
  });

  it("loads the next cursor page and includes later rows in filtering and sorting", async () => {
    const marketToken = (address: string, symbol: string, liquidity: number) => ({
      id: address,
      symbol,
      name: `${symbol} token`,
      address,
      pairAddress: `pair-${address}`,
      dex: "raydium",
      quoteSymbol: "SOL",
      price: 1,
      marketCap: 100,
      liquidity,
      volume24h: 200,
      volume1h: 20,
      change24h: 3,
      change1h: 1,
      txns5m: { buys: 2, sells: 1 },
      ageLabel: "1h",
      ageMinutes: 60,
      source: "provider",
      dataQuality: "live" as const,
    });
    mockedFetch
      .mockResolvedValueOnce({
        tokens: [marketToken("11111111111111111111111111111111", "FIRST", 50)],
        source: "provider",
        dataQuality: "live",
        recordCount: 2,
        pagination: { hasMore: true, nextCursor: "1" },
      })
      .mockResolvedValueOnce({
        tokens: [marketToken("11111111111111111111111111111112", "SECOND", 500)],
        source: "provider",
        dataQuality: "live",
        recordCount: 2,
        pagination: { hasMore: false, nextCursor: null },
      });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    const screen = await render(
      <SettingsProvider>
        <QueryClientProvider client={client}>
          <MonitorTokenTable polling={false} />
        </QueryClientProvider>
      </SettingsProvider>,
    );
    fireEvent.press(screen.getByLabelText("Monitor token table filters"));
    fireEvent.changeText(await screen.findByLabelText("Liquidity"), "100");
    await waitFor(() => expect(screen.queryByText("FIRST")).toBeNull());
    const more = await screen.findByLabelText("Load more monitor tokens");
    await act(async () => {
      fireEvent.press(more);
    });
    await waitFor(() => expect(screen.getByText("SECOND")).toBeTruthy());
    expect(mockedFetch).toHaveBeenLastCalledWith(
      "trending",
      "1h",
      { dex: "All", minLiquidity: "", minMarketCap: "" },
      "1",
      expect.anything(),
    );
    expect(screen.queryByLabelText("Load more monitor tokens")).toBeNull();
    expect(screen.getByText(/1\/2 records/)).toBeTruthy();
    await act(async () => {
      screen.unmount();
      client.clear();
    });
  });

  it("keeps loaded rows visible when a later page fails and retries that cursor", async () => {
    const token = (address: string, symbol: string) => ({
      id: address, symbol, name: `${symbol} token`, address, pairAddress: `pair-${address}`,
      dex: "raydium", quoteSymbol: "SOL", price: 1, marketCap: 100, liquidity: 50,
      volume24h: 200, volume1h: 20, change24h: 3, change1h: 1,
      txns5m: { buys: 2, sells: 1 }, ageLabel: "1h", ageMinutes: 60,
      source: "provider", dataQuality: "live" as const,
    });
    mockedFetch
      .mockResolvedValueOnce({
        tokens: [token("11111111111111111111111111111111", "FIRST")],
        source: "provider", dataQuality: "live", recordCount: 2,
        pagination: { hasMore: true, nextCursor: "1" },
      })
      .mockRejectedValueOnce(new Error("http://127.0.0.1:3000 secret=abc"))
      .mockResolvedValueOnce({
        tokens: [token("11111111111111111111111111111112", "SECOND")],
        source: "provider", dataQuality: "live", recordCount: 2,
        pagination: { hasMore: false, nextCursor: null },
      });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    const screen = await render(
      <SettingsProvider><QueryClientProvider client={client}><MonitorTokenTable polling={false} /></QueryClientProvider></SettingsProvider>,
    );
    const more = await screen.findByLabelText("Load more monitor tokens");
    await act(async () => { fireEvent.press(more); });
    expect(await screen.findByText(/existing rows remain available/i)).toBeTruthy();
    expect(screen.getByText("FIRST")).toBeTruthy();
    expect(screen.queryByText(/127\.0\.0\.1|secret=abc/i)).toBeNull();
    await act(async () => { fireEvent.press(screen.getByLabelText("Retry loading more monitor tokens")); });
    await waitFor(() => expect(screen.getByText("SECOND")).toBeTruthy());
    await act(async () => { screen.unmount(); client.clear(); });
  });
});
