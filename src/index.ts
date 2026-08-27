/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { error } from "console";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/api/health"){
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

	},
} satisfies ExportedHandler<Env>;
