import {
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";

import { env } from "cloudflare:workers";
import { describe, it, expect, beforeEach } from "vitest";

import worker from "../src/index";


beforeEach(async () => {

	await env.notes_db
		.prepare(
			"DELETE FROM notes"
		)
		.run();


	await env.NOTES_CACHE.delete(
		"all_notes"
	);

});


async function request(
	path: string,
	options?: RequestInit
) {

	const ctx = createExecutionContext();


	const response = await worker.fetch(
		new Request(
			`http://example.com${path}`,
			options
		),
		env,
		ctx
	);


	await waitOnExecutionContext(ctx);


	return response;

}



describe("Notes API Worker", () => {


	it("returns health status", async () => {

		const response =
			await request(
				"/api/health"
			);


		expect(response.status)
			.toBe(200);


		const data =
			await response.json();


		expect(data.status)
			.toBe("ok");

	});



	it("creates a note", async () => {

		const response =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Test note",
						content:"Testing D1"
					})
				}
			);



		expect(response.status)
			.toBe(201);



		const data =
			await response.json();



		expect(data.title)
			.toBe("Test note");


		expect(data.content)
			.toBe("Testing D1");

	});



	it("gets all notes", async () => {


		await request(
			"/api/notes",
			{
				method:"POST",
				headers:{
					"Content-Type":"application/json"
				},
				body:JSON.stringify({
					title:"First",
					content:"Hello"
				})
			}
		);



		const response =
			await request(
				"/api/notes"
			);



		expect(response.status)
			.toBe(200);



		const data =
			await response.json();



		expect(data.length)
			.toBe(1);


		expect(data[0].title)
			.toBe("First");

	});



	it("gets a note by id", async () => {


		const create =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Find me",
						content:"By id"
					})
				}
			);



		const created =
			await create.json();



		const response =
			await request(
				`/api/notes/${created.id}`
			);



		expect(response.status)
			.toBe(200);



		const data =
			await response.json();



		expect(data.title)
			.toBe("Find me");

	});



	it("returns 404 for missing note", async () => {


		const response =
			await request(
				"/api/notes/999"
			);



		expect(response.status)
			.toBe(404);



		const data =
			await response.json();



		expect(data.error)
			.toBe("Note not found");

	});



	it("deletes a note", async () => {


		const create =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Delete me",
						content:"Remove this"
					})
				}
			);



		const note =
			await create.json();



		const response =
			await request(
				`/api/notes/${note.id}`,
				{
					method:"DELETE"
				}
			);



		expect(response.status)
			.toBe(200);



		const check =
			await request(
				`/api/notes/${note.id}`
			);



		expect(check.status)
			.toBe(404);

	});



	it("returns MISS on first notes request", async () => {


		const response =
			await request(
				"/api/notes"
			);



		expect(response.status)
			.toBe(200);



		expect(
			response.headers.get("X-Cache")
		)
			.toBe("MISS");

	});



	it("returns HIT when notes are cached", async () => {


		await request(
			"/api/notes"
		);



		const response =
			await request(
				"/api/notes"
			);



		expect(
			response.headers.get("X-Cache")
		)
			.toBe("HIT");

	});



	it("clears cache after creating a note", async () => {


		await request(
			"/api/notes"
		);



		await request(
			"/api/notes",
			{
				method:"POST",
				headers:{
					"Content-Type":"application/json"
				},
				body:JSON.stringify({
					title:"New note",
					content:"Should invalidate cache"
				})
			}
		);



		const response =
			await request(
				"/api/notes"
			);



		expect(
			response.headers.get("X-Cache")
		)
			.toBe("MISS");



		const data =
			await response.json();



		expect(data.length)
			.toBe(1);



		expect(data[0].title)
			.toBe("New note");

	});



	it("clears cache after deleting a note", async () => {


		const create =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Temporary",
						content:"Delete me"
					})
				}
			);



		const note =
			await create.json();



		await request(
			"/api/notes"
		);



		const cached =
			await request(
				"/api/notes"
			);



		expect(
			cached.headers.get("X-Cache")
		)
			.toBe("HIT");



		await request(
			`/api/notes/${note.id}`,
			{
				method:"DELETE"
			}
		);



		const response =
			await request(
				"/api/notes"
			);



		expect(
			response.headers.get("X-Cache")
		)
			.toBe("MISS");



		const data =
			await response.json();



		expect(data.length)
			.toBe(0);

	});



	it("updates a note", async () => {


		const create =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Old title",
						content:"Old content"
					})
				}
			);
	
	
	
		const note =
			await create.json();
	
	
	
		const response =
			await request(
				`/api/notes/${note.id}`,
				{
					method:"PUT",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Updated title",
						content:"Updated content"
					})
				}
			);
	
	
	
		expect(response.status)
			.toBe(200);
	
	
	
		const updated =
			await response.json();
	
	
	
		expect(updated.title)
			.toBe("Updated title");
	
	
		expect(updated.content)
			.toBe("Updated content");
	
	});

	it("clears cache after updating a note", async () => {


		const create =
			await request(
				"/api/notes",
				{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({
						title:"Before",
						content:"Before update"
					})
				}
			);
	
	
	
		const note =
			await create.json();
	
	
	
		// populate cache
	
		await request(
			"/api/notes"
		);
	
	
		const cached =
			await request(
				"/api/notes"
			);
	
	
	
		expect(
			cached.headers.get("X-Cache")
		)
		.toBe("HIT");
	
	
	
		await request(
			`/api/notes/${note.id}`,
			{
				method:"PUT",
				headers:{
					"Content-Type":"application/json"
				},
				body:JSON.stringify({
					title:"After",
					content:"After update"
				})
			}
		);
	
	
	
		const response =
			await request(
				"/api/notes"
			);
	
	
	
		expect(
			response.headers.get("X-Cache")
		)
		.toBe("MISS");
	
	});


	it("rejects empty title", async () => {

		const response = await request(
			"/api/notes",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					title: "",
					content: "Hello"
				})
			}
		);
	
		expect(response.status).toBe(400);
	
	});


	it("rejects missing content", async () => {

		const response = await request(
			"/api/notes",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					title: "Hello"
				})
			}
		);
	
		expect(response.status).toBe(400);
	
	});


	it("rejects empty content", async () => {

		const response = await request(
			"/api/notes",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					title: "Hello",
					content: ""
				})
			}
		);
	
		expect(response.status).toBe(400);
	
	});

	it("rejects invalid update", async () => {

		const create = await request(
			"/api/notes",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					title: "A",
					content: "B"
				})
			}
		);
	
		const note = await create.json();
	
		const response = await request(
			`/api/notes/${note.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					title: "",
					content: ""
				})
			}
		);
	
		expect(response.status).toBe(400);
	
	});


});