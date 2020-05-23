const { EventHubConsumerClient } = require('@azure/event-hubs');
const fetch = require('node-fetch');

const DAPR_PORT = process.env.DAPR_PORT || 3500;
const CONNECTION_STRING = process.env.CONNECTION_STRING || process.argv[2];

// class Actor {
//     static async actorExists(actorName) {
//         await fetch(`http://localhost:${DAPR_PORT}/v1.0/actors/${actorType}/${deviceId}`, {
//             method: 'POST'
//         });
//     }
// }

class Processor {
    static processError(err) {
        console.log(err.message);
    }
    
    static async processEvents(events) {
        for (const message of events) {
            const deviceId = message.systemProperties['iothub-connection-device-id'];
    
            if (!deviceId) {
                console.warn(`Received unsupported message`);
                console.warn(message);
            }
    
            const lastUpdated = message.systemProperties['iothub-enqueuedtime'] || (new Date()).getTime();
            const actorType = 'RoadworkTwinActor'; // Roadwork Twin Device
    
            const wrapper = { };
            wrapper.LastUpdated = lastUpdated.toString();
            wrapper.Source = "azure-iothub";
            wrapper.DeviceId = deviceId;
            wrapper.State = JSON.stringify(message.body);
    
            // POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
            console.log(`[${(new Date()).toISOString()}][${deviceId}] Updating State`);

            try {
                // https://github.com/dapr/docs/blob/v0.7.0/reference/api/actors_api.md#invoke-actor-method
                const res = await fetch(`http://localhost:${DAPR_PORT}/v1.0/actors/${actorType}/${deviceId}/method/SaveData`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(wrapper)
                });
    
                let json;
                switch (res.status) {
                    case 200:
                        // console.log(`Processed Message: ${JSON.stringify(wrapper)}`);
                        break;
                    case 500:
                        json = await res.json();
                        console.log(`Failed processing message: ${JSON.stringify(json)}`);
                        break;
                    case 404:
                    default:
                        json = await res.json();
                        console.log(`Could not find actor for device ${deviceId}`)
                        break;
                }

                console.log(`[${(new Date()).toISOString()}][${deviceId}] Updated State`);
            } catch (e) {
                console.error(`[${deviceId}] ${e.message}`)
                process.exit();
            }  
        }
    }
}

async function main() {
    if (!CONNECTION_STRING) {
        throw new Error('CONNECTION_STRING_NOT_DEFINED');
    }

    console.log('Utilizing Connection String: ' + CONNECTION_STRING)

    const client = new EventHubConsumerClient("$Default", CONNECTION_STRING);
    client.subscribe({ processEvents: Processor.processEvents, processError: Processor.processError });
    console.log('Susbcribed, awaiting messages');
}

main().catch((e) => console.error(e));