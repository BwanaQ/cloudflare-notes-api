import { healthController } from "./controllers/health";
import { createNote, getNotes, getNoteById, deleteNote, updateNote } from "./controllers/notes";

export async function router(request: Request, env:Env): Promise<Response> {

  const url = new URL(request.url);

  if (
    request.method === "GET" &&
    url.pathname === "/api/health"
  ) {
    return healthController();
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/notes"
  ) {
    return createNote(request, env);
  }
  
  if (
    request.method === "GET" &&
    url.pathname === "/api/notes"
  ) {
    return getNotes(env);
  }

  if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/notes\/\d+$/)
  ) {
  
    const id = url.pathname.split("/").pop();
  
    return getNoteById(id!, env);
  }

  if (
    request.method === "DELETE" &&
    url.pathname.match(/^\/api\/notes\/\d+$/)
  ) {
  
    const id = url.pathname.split("/").pop();
  
    return deleteNote(id!, env);
  }

  if (
    request.method === "PUT" &&
    url.pathname.match(/^\/api\/notes\/\d+$/)
  ) {
  
    const id =
      url.pathname.split("/").pop();
  
  
    return updateNote(
      id!,
      request,
      env
    );
  
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

