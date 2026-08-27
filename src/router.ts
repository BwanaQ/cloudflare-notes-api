import { healthController } from "./controllers/health";

export function router(request: Request): Response {

  const url = new URL(request.url);

  if (
    request.method === "GET" &&
    url.pathname === "/api/health"
  ) {
    return healthController();
  }

  return new Response(
    JSON.stringify({
      error: "Route not found",
    }),
    {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}