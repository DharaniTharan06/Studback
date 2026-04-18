import { NextRequest, NextResponse } from "next/server";
const routes =
  /^(users\/(register|login|logout|refresh-token|change-pwd|current-user|update\/(details|avatar|cover-image)|history|c\/[^/]+)|videos(?:\/[^/]+|\/toggle\/publish\/[^/]+)?|comments\/(?:[^/]+|c\/[^/]+)|likes\/(?:videos|comments|tweets|toggle\/[vct]\/[^/]+)|playlist(?:\/[^/]+|\/user\/[^/]+|\/(?:add|remove)\/[^/]+\/[^/]+)?|tweets(?:\/[^/]+|\/user\/[^/]+)?|subscriptions\/[cu]\/[^/]+|dashboard\/(stats|videos)|healthcheck)$/;
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (
    path.some(
      (segment) =>
        segment === "." || segment === ".." || /[\\/?#]/.test(segment)
    )
  )
    return NextResponse.json(
      { message: "Endpoint not found" },
      { status: 404 }
    );
  const route = path.join("/");
  if (!routes.test(route))
    return NextResponse.json(
      { message: "Endpoint not found" },
      { status: 404 }
    );
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin)
      return NextResponse.json(
        { message: "Invalid request origin" },
        { status: 403 }
      );
  }
  const base = process.env.BACKEND_API_URL ?? "http://localhost:5000/api/v1";
  const headers = new Headers();
  for (const key of ["cookie", "content-type"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  try {
    const options: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(
        route === "videos" && request.method === "POST" ? 600000 : 30000
      ),
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      options.body = request.body;
      options.duplex = "half";
    }
    const upstream = await fetch(
      `${base.replace(/\/$/, "")}/${route}${request.nextUrl.search}`,
      options
    );
    const responseHeaders = new Headers({
      "cache-control": "no-store",
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    });
    for (let cookie of upstream.headers.getSetCookie()) {
      if (process.env.NODE_ENV === "development")
        cookie = cookie.replace(/;\s*Secure/gi, "");
      responseHeaders.append("set-cookie", cookie);
    }
    if (route === "users/login" || route === "users/refresh-token") {
      const body = await upstream.json();
      if (body.data) {
        delete body.data.accesstoken;
        delete body.data.refreshtoken;
      }
      return NextResponse.json(body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Studback is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
