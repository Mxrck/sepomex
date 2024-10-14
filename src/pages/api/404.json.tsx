import type {APIRoute} from "astro";

export const GET: APIRoute = async () => {
  const data = {
    error: 'Not found',
    data: null,
  };
  return new Response(JSON.stringify({data}), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
}