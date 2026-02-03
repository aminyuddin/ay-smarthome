import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies Home Assistant camera_proxy so the browser can load images same-origin
 * and avoid CORS when the dashboard runs on a different origin than HA.
 * Client sends entityId in query and HA URL/token in headers.
 */
export async function GET(request: NextRequest) {
  const entityId = request.nextUrl.searchParams.get("entityId");
  const haUrl = request.headers.get("x-ha-url");
  const haToken = request.headers.get("x-ha-token");

  if (!entityId?.trim() || !haUrl?.trim() || !haToken?.trim()) {
    return NextResponse.json(
      { error: "Missing entityId, x-ha-url, or x-ha-token" },
      { status: 400 }
    );
  }

  const base = haUrl.replace(/\/$/, "");
  const proxyUrl = `${base}/api/camera_proxy/${encodeURIComponent(entityId)}`;

  try {
    const res = await fetch(proxyUrl, {
      headers: { Authorization: `Bearer ${haToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "private, no-cache, max-age=0",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
