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

    await env.NOTES_CACHE.delete("all_notes");

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

  const cacheKey = "all_notes";

  const cached =
    await env.NOTES_CACHE.get(cacheKey);

  if (cached) {

    return new Response(
      cached,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT"
        }
      }
    );
  }


  const { results } =
    await env.notes_db
      .prepare(
        `
        SELECT *
        FROM notes
        ORDER BY created_at DESC
        `
      )
      .all();


  const data =
    JSON.stringify(results);


  await env.NOTES_CACHE.put(
    cacheKey,
    data,
    {
      expirationTtl: 60
    }
  );


  return new Response(
    data,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS"
      }
    }
  );
}