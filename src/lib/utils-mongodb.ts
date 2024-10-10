import {Db, MongoClient} from "mongodb";

const mongoClients = new Map<string, Db>();

const DefaultMongoClientOptions = {
    host: '127.0.0.1',
    port: 27017,
    database: 'sepomex',
}
type GetMogoClientOptions = { host?: string, port?: string|number, database?: string };
const getClient = async (options: GetMogoClientOptions = DefaultMongoClientOptions) => {
    const { host, port, database } = options;
    const url = `mongodb://${host}:${port}`;
    if (mongoClients.has(url)) {
        return mongoClients.get(url)!;
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(database);
    mongoClients.set(url, db);
    return db;
}

export {
    getClient
}