import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NovaPay — Private Payroll on Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0c0a1a 0%, #1a0f3a 60%, #2d1b6e 100%)",
          padding: 80,
          fontFamily: "system-ui",
          color: "white",
          position: "relative",
        }}
      >
        {/* Glow accents */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 9999,
            background: "rgba(168, 85, 247, 0.25)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: 9999,
            background: "rgba(124, 58, 237, 0.2)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🛡️
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #fff, #c4b5fd)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            NovaPay
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            marginTop: 30,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 950,
            }}
          >
            Private Payroll on Solana
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#c4b5fd",
              marginTop: 24,
              maxWidth: 950,
              lineHeight: 1.3,
            }}
          >
            Pay your team without exposing salaries on-chain. Built on Cloak.
          </div>
        </div>

        {/* Footer chips */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[
            "🔐 Shielded transfers",
            "📦 Batch disbursement",
            "🔑 Viewing-key compliance",
            "✨ Stealth claim links",
          ].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 22,
                padding: "10px 20px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
