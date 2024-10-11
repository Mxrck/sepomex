import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";
import { EXCLUDE_LATEST_VERSION } from "astro:env/server";

const mongodb = await getMongodbClient({
  host: import.meta.env.MONGODB_HOST!,
  port: import.meta.env.MONGODB_PORT!,
  database: import.meta.env.MONGODB_DATABASE!
});

export const GET: APIRoute = async ({params}) => {
  const { version, state } = params;
  const condition = version !== 'latest' ? { version: version } : { is_latest: true };
  const records = await mongodb
    .collection('postcodes')
    .find({c_estado: state, ...condition})
    .limit(0) // [WARN]: No limites porque queremos que se cargue el estado completo
    .toArray();
  const data = {
    c_estado: records[0].c_estado,
    d_estado: records[0].d_estado,
    total_records: records.length,
    municipios: Object.values(records.reduce((acc: any, postcode: any) => {
      const {c_mnpio, d_mnpio} = postcode;
      if (!acc[c_mnpio]) {
        acc[c_mnpio] = {
          c_mnpio,
          d_mnpio,
          endpoint: `/api/${version}/estado/${records[0].c_estado}/municipio/${c_mnpio}.json`
        }
      }
      return acc;
    }, {})),
    postcodes: records.map(postcode => {
      const curated: any = {...postcode};
      delete curated._id;
      delete curated.version;
      delete curated.filename;
      delete curated.is_latest;
      curated.endpoint = `/api/${version}/cp/${curated.d_codigo}.json`;
      return curated;
    }),
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
      { $group: { _id: "$c_estado" } },
      { $sort: { _id: 1 } },
      { $limit: 100 }, // [INFO] Solo tenemos 32 estados actualmente
    ]).toArray();
    const statePaths: any[] = records.map((record: any) => ({
      params: {state: record._id, version: version.version},
    }));
    paths = [...paths, ...statePaths];
  }
  return paths;
}