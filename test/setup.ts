import { env } from "cloudflare:workers";
import migration from "../migrations/0001_create_notes.sql";


await env.notes_db
	.prepare(migration)
	.run();