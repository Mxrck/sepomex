import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";

export const GET: APIRoute = async () => {
  const mongodb = await getMongodbClient({
    host: import.meta.env.MONGODB_HOST!,
    port: import.meta.env.MONGODB_PORT!,
    database: import.meta.env.MONGODB_DATABASE!
  });
  const records = await mongodb.collection('versions').find({}).limit(0).toArray();
  const data = {
    versions: records.map(version => ({
      version: version.version,
      date: `${version.day}/${version.month}/${version.year}`,
      is_latest: version.is_latest,
      endpoint: `/api/${version.version}.json`,
    })),
  };
  return new Response(JSON.stringify({data}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}