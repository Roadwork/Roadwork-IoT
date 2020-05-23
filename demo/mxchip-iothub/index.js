const { EventHubConsumerClient } = require('@azure/event-hubs');

class Processor {
  static processError(err) {
    console.log(err.message);
  }
  
  static processEvents(messages) {
    for (const message of messages) {
      console.log("Telemetry received: ");
      console.log(JSON.stringify(message.body));
      console.log("Properties (set by device): ");
      console.log(JSON.stringify(message.properties));
      console.log("System properties (set by IoT Hub): ");
      console.log(JSON.stringify(message.systemProperties));
      console.log("");
    }
  }
}


async function main() {
  const connectionString = process.argv[2];

  if (!connectionString) {
    throw new Error('CONNECTION_STRING_NOT_DEFINED');
  }
  
  const client = new EventHubConsumerClient("$Default", connectionString);
  client.subscribe({ processEvents: Processor.processEvents, processError: Processor.processError });

  console.log('Awaiting messages')
}

main().catch((e) => console.error(e));