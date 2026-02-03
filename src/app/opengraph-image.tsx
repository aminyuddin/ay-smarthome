import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "AY Smart Home – Smart home dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(
    join(process.cwd(), "public", "logo.png"),
    "base64"
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <img
          src={logoSrc}
          alt="AY Smart Home"
          width={340}
          height={340}
          style={{ marginBottom: 32, borderRadius: 36, flexShrink: 0 }}
        />
        <div style={{ fontSize: 72, fontWeight: 700, color: "#171717", marginBottom: 12, lineHeight: 1 }}>
          AY Smart Home
        </div>
        <div style={{ fontSize: 36, color: "#525252" }}>
          Control your Home Assistant entities
        </div>
      </div>
    ),
    { ...size }
  );
}
