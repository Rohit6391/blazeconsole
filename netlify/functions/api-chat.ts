/**
 * Netlify serverless function — public BlazeConsole chat API.
 *
 * Wraps the shared handler in api/chat-core.ts so the exact same logic
 * runs on Netlify and in local dev.
 */
import { handleChat } from "../../api/chat-core";

export default async (req: Request): Promise<Response> => {
  return handleChat(req);
};

export const config = {
  path: "/api/v1/chat",
};
