import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return Response.redirect(
    "https://github.com/austinkong/atto/releases/latest/download/atto-linux.AppImage",
    302
  )
};
