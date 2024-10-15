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
            const _states: any = {};
            const _municipalities: any = {};
            for await (const record of records) {
                const isLatest = record.is_latest;
                const key = `${record.version}:${record.d_codigo}`;
                const keyLatest = `latest:${record.d_codigo}`;
                const keyState = `${record.version}:state:${record.c_estado}`;
                const keyStateLatest = `latest:state:${record.c_estado}`;
                const keyMunicipality = `${record.version}:municipality:${record.c_estado}_${record.c_mnpio}`;
                const keyMunicipalityLatest = `latest:municipality:${record.c_estado}_${record.c_mnpio}`;
                if (isLatest && !_postcodes[keyLatest]) {
                    _postcodes[keyLatest] = [];
                }
                if (!_postcodes[key]) {
                    _postcodes[key] = [];
                }
                if (!_states[keyState]) {
                    _states[keyState] = [];
                }
                if (!_states[keyStateLatest]) {
                    _states[keyStateLatest] = [];
                }
                if (!_municipalities[keyMunicipality]) {
                    _municipalities[keyMunicipality] = [];
                }
                if (!_municipalities[keyMunicipalityLatest]) {
                    _municipalities[keyMunicipalityLatest] = [];
                }
                const curated: any = {...record};
                delete curated._id;
                delete curated.version;
                delete curated.filename;
                delete curated.is_latest;
                _postcodes[key].push(curated);
                _states[keyState].push(curated);
                _municipalities[keyMunicipality].push(curated);
                if (isLatest) {
                    _postcodes[keyLatest].push(curated);
                    _states[keyStateLatest].push(curated);
                    _municipalities[keyMunicipalityLatest].push(curated);
                }
            }
            for (const key in _postcodes) {
                const values = _postcodes[key];
                _postcodes[key] = JSON.stringify(values);
                if (!BATCH_MODE) {
                    logger.info(`Inserting postcodes ${key} [BATCH_MODE="${BATCH_MODE}"]`);
                    redisClient.set(key, _postcodes[key]);
                }
            }
            for (const key in _states) {
                const values = _states[key];
                _states[key] = JSON.stringify(values);
                if (!BATCH_MODE) {
                    logger.info(`Inserting states ${key} [BATCH_MODE="${BATCH_MODE}"]`);
                    redisClient.set(key, _states[key]);
                }
            }
            for (const key in _municipalities) {
                const values = _municipalities[key];
                _municipalities[key] = JSON.stringify(values);
                if (!BATCH_MODE) {
                    logger.info(`Inserting municipalities ${key} [BATCH_MODE="${BATCH_MODE}"]`);
                    redisClient.set(key, _municipalities[key]);
                }
            }
            if (BATCH_MODE) {
                logger.info(`Inserting batches [BATCH_MODE="${BATCH_MODE}"]`);
                await redisClient.mSet(_postcodes);
                await redisClient.mSet(_states);
                await redisClient.mSet(_municipalities);
            }
        },
    },
});

export default preloadSepomexData;