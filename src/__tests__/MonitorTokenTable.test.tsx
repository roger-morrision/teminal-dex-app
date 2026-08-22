import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { MonitorTokenTable } from "@/components/MonitorTokenTable";
import { SettingsProvider } from "@/settings/SettingsProvider";
import { fetchDiscovery } from "@/api/client";

jest.mock("@/api/client", () => ({ fetchDiscovery: jest.fn() }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const mockedFetch = fetchDiscovery as jest.MockedFunction<typeof fetchDiscovery>;

describe("MonitorTokenTable", () => {
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
});
