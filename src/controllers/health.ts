export function healthController(): Response {
    return new Response(
      JSON.stringify({
        status: "ok",
        service: "notes-api",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }