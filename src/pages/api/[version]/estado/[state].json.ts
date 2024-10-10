// TODO)): Todos los estados

import type {APIRoute} from "astro";
import {getClient as getMongodbClient} from "@/lib/utils-mongodb.ts";

export const GET: APIRoute = async ({params}) => {
  const { version, state } = params;
  const mongodb = await getMongodbClient({
    host: import.meta.env.MONGODB_HOST!,
    port: import.meta.env.MONGODB_PORT!,
    database: import.meta.env.MONGODB_DATABASE!
  });
  const condition = version !== 'latest' ? { version: version } : { is_latest: true };
  const records = await mongodb
    .collection('postcodes')
    .find({c_estado: state, ...condition})
    .limit(0) // [WARN]: No limites porque queremos que se cargue el estado completo
    .toArray();
  const data = {
    c_estado: records[0].c_estado,
    d_estado: records[0].d_estado,
    total_postcodes: records.length,
    postcodes: records.map(postcode => {
      const curated: any = {...postcode};
      delete curated._id;
      delete curated.version;
      delete curated.filename;
      delete curated.is_latest;
      curated.endpoint = `/api/${version}/cp/${curated.d_codigo}`;
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
  const mongodb = await getMongodbClient({
    host: import.meta.env.MONGODB_HOST!,
    port: import.meta.env.MONGODB_PORT!,
    database: import.meta.env.MONGODB_DATABASE!
  });
  const collection = mongodb.collection('versions');
  const versions = collection.find({}).limit(100);
  const data: any[] = await versions.toArray();
  data.push({version: 'latest'});
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