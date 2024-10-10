import {createClient, RedisFlushModes} from "redis";

let Client: ReturnType<typeof createClient>;
const redisClients = new Map<string, typeof Client>();

type ClientOptions = {
    host: string,
    port: string|number,
}
const DEFAULT_CLIENT_OPTIONS = {
    host: '127.0.0.1',
    port: 6379,
}
export const getClient = async(options: ClientOptions = DEFAULT_CLIENT_OPTIONS): Promise<typeof Client> => {
    const {host, port} = options;
    const url = `redis://${host}:${port}`;
    if(redisClients.has(url)) {
        return redisClients.get(url)!;
    }
    const client = createClient({ url });
    await client.connect();
    const onError = (err: Error) => {
        console.error('Redis error:', err);
        redisClients.delete(url);
        client.off('error', onError);
        getClient(options);
    };
    client.on('error', onError);
    redisClients.set(url, client);
    return client;
}

export const flushAll = async(options: ClientOptions = DEFAULT_CLIENT_OPTIONS) => {
    const client = await getClient(options);
    return client.flushDb(RedisFlushModes.SYNC)
}