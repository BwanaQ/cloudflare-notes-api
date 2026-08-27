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

export async function getNoteById(
  id: string,
  env: Env
): Promise<Response> {

  const note = await env.notes_db
    .prepare(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      `
    )
    .bind(id)
    .first();


  if (!note) {
    return new Response(
      JSON.stringify({
        error: "Note not found",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }


  return new Response(
    JSON.stringify(note),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}


export async function deleteNote(
  id: string,
  env: Env
): Promise<Response> {

  const result = await env.notes_db
    .prepare(
      `
      DELETE FROM notes
      WHERE id = ?
      `
    )
    .bind(id)
    .run();


  if (result.meta.changes === 0) {
    return new Response(
      JSON.stringify({
        error: "Note not found",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }


  

  // Clear cached notes list
  await env.NOTES_CACHE.delete("all_notes");


  return new Response(
    JSON.stringify({
      message: "Note deleted successfully",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function updateNote(
  id: string,
  request: Request,
  env: Env
): Promise<Response> {


  const body = await request.json<{
    title: string;
    content: string;
  }>();


  const { title, content } = body;



  const result =
    await env.notes_db
      .prepare(
        `
        UPDATE notes
        SET title = ?, content = ?
        WHERE id = ?
        RETURNING *
        `
      )
      .bind(
        title,
        content,
        id
      )
      .first();



  if (!result) {

    return new Response(
      JSON.stringify({
        error:"Note not found"
      }),
      {
        status:404,
        headers:{
          "Content-Type":"application/json"
        }
      }
    );

  }



  // invalidate cache
  await env.NOTES_CACHE.delete(
    "all_notes"
  );



  return new Response(
    JSON.stringify(result),
    {
      status:200,
      headers:{
        "Content-Type":"application/json"
      }
    }
  );

}

