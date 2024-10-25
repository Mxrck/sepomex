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
  const { version, state, municipality } = params;
  const key = `${version}:municipality:${state}_${municipality}`;
  const _records = await redisClient.get(key);
  const records = JSON.parse(_records ?? '[]');
  const data = {
    c_estado: records[0].c_estado,
    d_estado: records[0].d_estado,
    c_mnpio: records[0].c_mnpio,
    d_mnpio: records[0].d_mnpio,
    total_records: records.length,
    postcodes: records.map((postcode: any) => {
      postcode.endpoint = `/api/${version}/cp/${postcode.d_codigo}.json`;
      return postcode;
    }),
  };
  return new Response(JSON.stringify({data, error: null}), {
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
      { $group: { _id: "$c_estado", meta: { $addToSet: { c_mnpio: "$c_mnpio" } } } },
      { $sort: { _id: 1 } },
      { $limit: 100 }, // [INFO] Solo tenemos 32 estados actualmente
    ]).toArray();
    const statePaths: any[] = records.reduce((acc: any[], record: any) => {
      const {_id, meta} = record;
      meta.forEach(({c_mnpio}: any) => {
        acc.push({params: {state: _id, version: version.version, municipality: c_mnpio}});
      });
      return acc;
    }, []);
    paths = [...paths, ...statePaths];
  }
  return paths;
}