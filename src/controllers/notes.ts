export async function createNote(
  request: Request,
  env: Env
): Promise<Response> {

  const body = await request.json<{
    title: string;
    content: string;
  }>();

  const { title, content } = body;

  const result = await env.notes_db
    .prepare(
      `
      INSERT INTO notes (title, content)
      VALUES (?, ?)
      RETURNING *
      `
    )
    .bind(title, content)
    .first();

  return new Response(
    JSON.stringify(result),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: 201,
    }
  );
}

export async function getNotes(
  env: Env
): Promise<Response> {

  const { results } = await env.notes_db
    .prepare(
      `
      SELECT *
      FROM notes
      ORDER BY created_at DESC
      `
    )
    .all();

  return new Response(
    JSON.stringify(results),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}