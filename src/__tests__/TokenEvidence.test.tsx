import { render } from "@testing-library/react-native";
import {
  EarlyBuyerEvidence,
  SecurityHistoryEvidence,
} from "../../app/token/[address]";
import { SettingsProvider } from "@/settings/SettingsProvider";
import type { SecurityHistoryResponse, SnipersResponse } from "@/api/schema";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const address = "11111111111111111111111111111111";
const snipers: SnipersResponse = {
  snipers: [{ address, boughtAt: 1_787_369_431_000, delaySec: 4.5 }],
  ts: 1_787_369_432_000,
};
const history: SecurityHistoryResponse = {
  snapshots: [
    {
      id: "snapshot",
      source: "provider",
      observedAt: 1_787_369_431_000,
      evidence: {
        mintAuthority: null,
        freezeAuthority: address,
        isMintRenounced: true,
        isFreezeRenounced: false,
        holderCount: null,
        buyTax: null,
        sellTax: null,
        isHoneypot: null,
        isLpLocked: null,
        devHoldingsPct: null,
        topHolderPct: null,
        liquidityLockPct: null,
        securityRiskFlags: [],
      },
    },
  ],
  count: 1,
  dataQuality: "provider_backed",
  synthetic: false,
};

describe("Token evidence disclosures", () => {
  it("shows an observed early buyer without claiming malicious intent", async () => {
    const screen = await render(
      <SettingsProvider>
        <EarlyBuyerEvidence data={snipers} />
      </SettingsProvider>,
    );
    expect(screen.getByText("4.5s after pair")).toBeTruthy();
    expect(screen.getByText(/not proof of malicious intent/)).toBeTruthy();
  });

  it("shows historical authority evidence without claiming continuous safety", async () => {
    const screen = await render(
      <SettingsProvider>
        <SecurityHistoryEvidence data={history} />
      </SettingsProvider>,
    );
    expect(screen.getByText("provider_backed")).toBeTruthy();
    expect(
      screen.getByText(/mint renounced · freeze authority present/),
    ).toBeTruthy();
    expect(
      screen.getByText(/not continuous coverage or a guarantee of safety/),
    ).toBeTruthy();
  });
});
