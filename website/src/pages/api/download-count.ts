import { getDownloadCount } from "../../lib/downloads";

export const prerender = false;

// Prefer as a separate endpoint so /download page can be statically generated
export async function GET() {
  const downloads = await getDownloadCount();

  return new Response(String(downloads), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
