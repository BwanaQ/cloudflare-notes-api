import { z } from "zod";

export const noteSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Title is required")
		.max(255),

	content: z
		.string()
		.trim()
		.min(1, "Content is required")
});