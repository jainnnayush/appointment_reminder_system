import Redis from 'ioredis';

const redisClient = new Redis({
    host: 'redis-12093.c62.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 12093,
    password: 'xtdgGwxgsr1GfZNORVih7HYQOOl2rdyI', 
    maxRetriesPerRequest: null,
});
console.log("created redis client");

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
});

export default redisClient;
