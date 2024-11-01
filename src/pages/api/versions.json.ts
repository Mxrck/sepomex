import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";

const mongodb = await getMongodbClient({
  host: import.meta.env.MONGODB_HOST!,
  port: import.meta.env.MONGODB_PORT!,
  database: import.meta.env.MONGODB_DATABASE!
});

export const GET: APIRoute = async () => {
  const records = await mongodb.collection('versions').find({}).limit(0).toArray();
  const data = {
    versions: records.map(version => ({
      version: version.version,
      date: `${version.day}/${version.month}/${version.year}`,
      is_latest: version.is_latest,
      endpoint: `/api/${version.version}.json`,
    })),
  };
  return new Response(JSON.stringify({data, error: null}), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
}