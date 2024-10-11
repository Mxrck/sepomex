import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";
import {getClient as getRedisClient} from "@/lib/utils-redis.ts";
import { EXCLUDE_LATEST_VERSION } from "astro:env/server";

const redisClient = await getRedisClient({
  host: import.meta.env.REDIS_HOST!,
  port: import.meta.env.REDIS_PORT!,
});

const mongodb = await getMongodbClient({
  host: import.meta.env.MONGODB_HOST!,
  port: import.meta.env.MONGODB_PORT!,
  database: import.meta.env.MONGODB_DATABASE!
});

export const GET: APIRoute = async ({params}) => {
  const { version, postcode } = params;
  const key = `${version}:${postcode}`;
  const records = await redisClient.get(key);
  const _postcodes = JSON.parse(records ?? '[]');
  const data = {
    total_records: _postcodes.length,
    postcodes: _postcodes,
  };
  return new Response(JSON.stringify({data}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const getStaticPaths = async () => {
  const collection = mongodb.collection('versions');
  const versions = collection.find({}).limit(100);
  const data: any[] = await versions.toArray();
  if (!EXCLUDE_LATEST_VERSION) {
    data.push({version: 'latest'});
  }
  let paths: any[] = [];
  for await (const version of data) {
    const records = await mongodb.collection('postcodes').aggregate([
      version.version !== 'latest' ? { $match: { version: version.version } } : { $match: { is_latest: true } },
      { $group: { _id: "$d_codigo" } },
      { $sort: { _id: 1 } },
      { $limit: 99999 }, // todo)): Deberíamos iterarlo?
    ]).toArray();
    const postcodes: any[] = records.map((record: any) => ({
      params: {postcode: record._id, version: version.version},
    }));
    paths = [...paths, ...postcodes];
  }
  return paths;
}