import { getClient as getMongoClient } from "../lib/utils-mongodb";
import type { AstroIntegration } from "astro";
import {readFileSync} from 'fs';
import AdmZip from 'adm-zip';

import SepomexFiles from "../data/sepomex-files/data.json";
import path from "path";
export const SEPOMEX_FILES: Array<{day: string, month: string, year: string, filename: string, encoding: string, is_latest: boolean}> = SepomexFiles

const getSepomexFileContent = async ({filename, encoding = 'latin1'}: {filename: string, encoding?: BufferEncoding}) => {
    const filePath = path.join('src', 'data', 'sepomex-files', filename);
    if (filename.endsWith('.zip')) {
        const zip = new AdmZip(filePath);
        const entries = zip.getEntries();
        const entry = entries.find(entry => entry.entryName.endsWith('.txt')); // Get the first txt file
        if (!entry) throw new Error('No txt file found in the zip');
        return entry.getData().toString(encoding).replaceAll('\r', '').split('\n');
    }
    else if (filename.endsWith('.txt')) {
        return readFileSync(filePath, {encoding, flag: 'r'}).replaceAll('\r', '').split('\n');
    }
    throw new Error('Invalid file extension (only .zip and .txt are supported)');
}

const isPostcode = (postcode: string) : boolean => /^\d{5}$/.test(postcode)

const preloadSepomexData: () => AstroIntegration = () => ({
    name: "preload:sepomex",
    hooks: {
        "astro:config:done": async ({logger}) => {
            const {MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, DEBUG_DATA: _DEBUG_DATA, BATCH_MODE: _BATCH_MODE} = process.env;
            const DEBUG_DATA = _DEBUG_DATA === 'true';
            const BATCH_MODE = _BATCH_MODE === 'true';
            const mongodb = await getMongoClient({ host: MONGODB_HOST!, port: MONGODB_PORT!, database: MONGODB_DATABASE! });
            await mongodb.dropCollection('new_versions'); // Always drop collection to avoid data duplication on development
            if (DEBUG_DATA) {
                logger.info('Removing existing collections [DEBUG_DATA="true"]');
                await mongodb.dropCollection('postcodes'); // Drop collection to avoid data duplication on development
                await mongodb.dropCollection('versions'); // Drop collection to avoid data duplication on development
                logger.info('Removing existing collections [DEBUG_DATA=true]');
            }
            await mongodb.createCollection('postcodes');
            await mongodb.createCollection('versions');
            await mongodb.createCollection('new_versions');
            logger.info('Preloading Mongodb Data');
            const fullData = [];
            let headers: any[] = []
            const versions: any[] = []
            const preloadedVersions = await mongodb.collection('versions').find({}).limit(0).toArray();
            for (const file of SEPOMEX_FILES) {
                const {filename, encoding, is_latest} = file;
                const versionName = filename.split('.')[0];
                const version = {version: versionName, ...file}
                if (preloadedVersions.find(version => version.version === versionName)) {
                    logger.info(`Skipping preloaded version ${versionName}, use DEBUG_DATA=true to force preloading`);
                    continue;
                }
                versions.push(version);
                if (!BATCH_MODE) {
                    await mongodb.collection('versions').insertOne(version);
                }
                const lines = await getSepomexFileContent({filename, encoding: encoding as BufferEncoding});
                for await (const line of lines) {
                    if (!line.includes('|')) continue // Skip lines without valid data
                    const lineData = line.split('|')
                    if (!isPostcode(lineData[0])) { // If this is true, it's the header
                        headers = lineData.map(header => header.toLowerCase().trim()) // Normalized headers
                        continue
                    }
                    const data: any = {}
                    headers.forEach((header, index) => {
                        data[header] = lineData[index]
                    });
                    data['filename'] = filename;
                    data['version'] = version.version;
                    data['is_latest'] = is_latest;
                    if (!BATCH_MODE) {
                        await mongodb.collection('postcodes').insertOne(data);
                        continue;
                    }
                    fullData.push(data);
                }
            }
            if (BATCH_MODE) {
                if (fullData.length) await mongodb.collection('postcodes').insertMany(fullData);
                if (versions.length) await mongodb.collection('versions').insertMany(versions);
                if (versions.length) await mongodb.collection('new_versions').insertMany(versions);
            }
        },
    },
});

export default preloadSepomexData;