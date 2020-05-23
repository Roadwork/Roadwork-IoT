# Roadwork IoT

Roadwork IoT is a technical implementation of the [following blog post by Xavier Geerinck](https://xaviergeerinck.com/post/iot/digital-twin-dapr/). Its main purpose is to provide a Digital Twin abstraction layer on an IoT Processor utilizing the Dapr framework and their virtual actors.

![](./documentation-digital-twin-dapr-architecture.svg)

## IoT Hubs

The following IoT Hubs are supported. 

> Note: for ease of development, currently on Azure IoT Hub is supported.

### Azure IoT Hub

#### Dev Kits

One of the ideal kits to utilize to test with a real device is the [MXChip IoT Devkit](https://microsoft.github.io/azure-iot-developer-kit)

> Note: do install Arduino as installer and not as Windows App

#### Development

For development we want to be able to test on a live system, when utilizing Azure IoT Hub we can create a Free Tier (non upgreadable) that offers 8.000 messages / day. This way we are able to send a message every 5 seconds on a demo device.

A good sample is the "DevKit State" sample, providing an overview of the different sensors.