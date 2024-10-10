import { getClient as getRedisClient, flushAll } from "../lib/utils-redis";
import { getClient as getMongoClient } from "../lib/utils-mongodb";
import type { AstroIntegration } from "astro";

const preloadSepomexData: () => AstroIntegration = () => ({
    name: "preload:redis",
    hooks: {
        "astro:config:done": async ({logger}) => {
            logger.info('Preloading Redis Data');
            const {REDIS_HOST, REDIS_PORT, DEBUG_DATA: _DEBUG_DATA, BATCH_MODE: _BATCH_MODE} = process.env;
            const {MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE} = process.env;
            const DEBUG_DATA = _DEBUG_DATA === 'true';
            const BATCH_MODE = _BATCH_MODE === 'true';
            const mongodb = await getMongoClient({ host: MONGODB_HOST!, port: MONGODB_PORT!, database: MONGODB_DATABASE! });
            const redisOptions = {
                host: REDIS_HOST!,
                port: REDIS_PORT!,
            };
            const redisClient = await getRedisClient(redisOptions);
            if (DEBUG_DATA) {
                logger.info('Flush old redis data [DEBUG_DATA="true"]');
                await flushAll(redisOptions);
            }
            logger.info('Generating keys');
            const records = await mongodb.collection('postcodes').find({}).limit(0).toArray();
            const _postcodes: any = {};
            for await (const record of records) {
                const isLatest = record.is_latest;
                const key = `${record.version}:${record.d_codigo}`;
                const keyLatest = `latest:${record.d_codigo}`;
                if (isLatest && !_postcodes[keyLatest]) {
                    _postcodes[keyLatest] = [];
                }
                if (!_postcodes[key]) {
                    _postcodes[key] = [];
                }
                const curated: any = {...record};
                delete curated._id;
                delete curated.version;
                delete curated.filename;
                delete curated.is_latest;
                _postcodes[key].push(curated);
                if (isLatest) {
                    _postcodes[keyLatest].push(curated);
                }
            }
            for (const key in _postcodes) {
                const values = _postcodes[key];
                _postcodes[key] = JSON.stringify(values);
                if (!BATCH_MODE) {
                    logger.info(`Inserting ${key} [BATCH_MODE="${BATCH_MODE}"]`);
                    redisClient.set(key, _postcodes[key]);
                }
            }
            if (BATCH_MODE) {
                logger.info(`Inserting batches [BATCH_MODE="${BATCH_MODE}"]`);
                redisClient.mSet(_postcodes);
            }
        },
    },
});

export default preloadSepomexData;