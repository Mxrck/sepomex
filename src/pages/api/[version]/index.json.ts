import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";
import { EXCLUDE_LATEST_VERSION } from "astro:env/server";

const mongodb = await getMongodbClient({
  host: import.meta.env.MONGODB_HOST!,
  port: import.meta.env.MONGODB_PORT!,
  database: import.meta.env.MONGODB_DATABASE!
});

export const GET: APIRoute = async ({params}) => {
  const { version } = params;
  const records = mongodb.collection('postcodes').aggregate([
    version !== 'latest' ? { $match: { version: version } } : { $match: { is_latest: true } },
    { $group: { _id: "$c_estado", meta: { $addToSet: {d_estado: "$d_estado", c_estado: "$c_estado"} } } },
    { $sort: { _id: 1 } },
    { $limit: 100 }, // [INFO] Solo tenemos 32 estados actualmente
  ]);
  const statesData = (await records.toArray()).map((state: any) => ({
    c_estado: state.meta[0].c_estado,
    d_estado: state.meta[0].d_estado,
    endpoint: `/api/${version}/estado/${state.meta[0].c_estado}.json`,
  }));
  const data = {
    states: statesData,
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
  const data = await versions.toArray();
  const paths = [...data.map((version: any) => ({
    params: {version: version.version}
  }))];
  if (!EXCLUDE_LATEST_VERSION) {
    paths.push({ params: {version: 'latest'} });
  }
  return paths;
}