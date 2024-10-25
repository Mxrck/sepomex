import type {APIRoute} from "astro";

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({data: null, error: 'Not found'}), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
}