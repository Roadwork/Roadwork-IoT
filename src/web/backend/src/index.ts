import express = require('express');
import fetch from 'node-fetch';
import redis from 'redis';
import { promisify } from 'util';
import bodyParser from 'body-parser';
import cors from 'cors';

const redisClient = redis.createClient();
const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisKeysAsync = promisify(redisClient.keys).bind(redisClient);

const PORT = process.env.APP_HTTP_PORT || 9000;
const PORT_DAPR = process.env.DAPR_HTTP_PORT || 9500;
const app: express.Application = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', async (req, res) => {
    res.send("Hello World");
});

app.get('/actors', async (req, res) => {
    const actors = await redisKeysAsync("*");
    const actorType = "RoadworkTwinActor";
    
    let arr = [];

    for (let actor of actors) {
        let actorKeys = actor.split('||'); // 0 = daprService, 1 = actorType, 2 = actorId, 3 = stateName

        // Skip if it's not our actor type
        if (actorKeys[1] != actorType) {
            continue;
        }

        arr.push({
            meta: {
                stateKey: actor
            },
            name: actorKeys[2],
            state: await redisGetAsync(actor)
        })
    }
    
    return res.send(arr);
});

app.listen(PORT, () => console.log(`Server started at 0.0.0.0:${PORT}, Dapr at ${PORT_DAPR}`));