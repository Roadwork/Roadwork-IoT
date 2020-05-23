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
            const actorType = 'rw-twin-device'; // Roadwork Twin Device
    
            const wrapper = { meta: {}, state: {} };
            wrapper.meta.lastUpdated = lastUpdated;
            wrapper.meta.source = "azure-iothub";
            wrapper.meta.deviceId = deviceId;
    
            wrapper.state = message.body;
    
            // POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
            // http://localhost:3500/v1.0/actors/rw-twin-device/xavier-mxchip-mac-c89346878b8b/state
            console.log(`[${deviceId}] Updating State`);

            try {
                const res = await fetch(`http://localhost:${DAPR_PORT}/v1.0/actors/${actorType}/${deviceId}/state`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(wrapper)
                });
    
                const json = await res.json();

                console.log(json);
                console.log(res.status);
    
                switch (res.status) {
                    case 200:
                        console.log(`Processed Message: ${json}`);
                        break;
                    case 500:
                        console.log(`Failed processing message: ${message}`);
                        break;
                    case 404:
                        console.log(`Could not find actor for device ${deviceId}`)
                        break;
                }

                console.log(`[${deviceId}] Updated State`);
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