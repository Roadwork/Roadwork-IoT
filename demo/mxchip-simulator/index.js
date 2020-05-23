const Mqtt = require('azure-iot-device-mqtt').Mqtt;
const DeviceClient = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const data = require('./data.json');

async function start() {
  const connectionString = process.argv[2];

  if (!connectionString) {
    throw new Error('CONNECTION_STRING_NOT_DEFINED');
  }

  const client = DeviceClient.fromConnectionString(connectionString, Mqtt);

  let msgIdx = 0;

  while (true) {
    const msg = new Message(JSON.stringify(data[msgIdx]));
    console.log(`Sending message: ${msgIdx}`);
    console.log(msg.getData());
    await iotHubSendMessage(client, msg);
    msgIdx = (msgIdx + 1) % data.length;

    await sleep(5000);
  }
}

const sleep = async(ms) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms);
});

const iotHubSendMessage = async (client, msg) => new Promise((resolve, reject) => {
  client.sendEvent(msg, (err) => {
    if (err) {
      return reject(err);
    }

    return resolve();
  });
});

start().catch(e => console.error(e));