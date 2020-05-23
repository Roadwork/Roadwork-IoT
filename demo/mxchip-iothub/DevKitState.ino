#include "Arduino.h"
#include "AZ3166WiFi.h"
#include "DevKitMQTTClient.h"
#include "SystemVersion.h"
#include "Sensor.h"
#include "parson.h"

#define MESSAGE_MAX_LEN 512 // Max Message Length
#define INTERVAL 5000 // Interval time for sending message to IoT Hub
#define RGB_LED_BRIGHTNESS 32

DevI2C *i2c;
LSM6DSLSensor *sensor_acc_gyro;
HTS221Sensor *sensor_hum_temp;
LPS22HBSensor *sensor_pressure;
RGB_LED rgbLed;

static bool hasWifi = false;
int messageCount = 1;
int sentMessageCount = 0;
static bool messageSending = true;
static uint64_t send_interval_ms;

static int userLEDState = 0;
static int rgbLEDState = 0;
static int rgbLEDR = 0;
static int rgbLEDG = 0;
static int rgbLEDB = 0;

void blinkSendConfirmation()
{
    rgbLed.turnOff();
    rgbLed.setColor(0, 0, RGB_LED_BRIGHTNESS);
    delay(500);
    rgbLed.turnOff();
}

static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    blinkSendConfirmation();
    sentMessageCount++;
  }

  Screen.print(1, "> IoT Hub");
  char line1[20];
  sprintf(line1, "Count: %d/%d", sentMessageCount, messageCount); 
  Screen.print(2, line1);
  Screen.print(3, "");

  messageCount++;
}

static void InitWifi()
{
  Screen.print(2, "Connecting...");

  if (WiFi.begin() == WL_CONNECTED)
  {
    IPAddress ip = WiFi.localIP();
    Screen.print(1, ip.get_address());
    hasWifi = true;
    Screen.print(2, "Running... \r\n");
  }
  else
  {
    hasWifi = false;
    Screen.print(1, "No Wi-Fi\r\n ");
  }
}

void SensorInit()
{
  i2c = new DevI2C(D14, D15);

  sensor_acc_gyro = new LSM6DSLSensor(*i2c, D4, D5);
  sensor_acc_gyro->init(NULL);
  
  sensor_hum_temp = new HTS221Sensor(*i2c);
  sensor_hum_temp->init(NULL);
  
  sensor_pressure = new LPS22HBSensor(*i2c);
  sensor_pressure->init(NULL);
}

const char *readMacAddress()
{
  byte mac[6];
  WiFi.macAddress(mac);

  static char macAddress[18];
  snprintf(macAddress, sizeof(macAddress), "%02x-%02x-%02x-%02x-%02x-%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  return macAddress;
}

float readHumidity()
{
  sensor_hum_temp->reset();

  float humidity = 0;
  sensor_hum_temp->getHumidity(&humidity);

  return humidity;
}

float readTemperature()
{
  sensor_hum_temp->reset();

  float temperature = 0;
  sensor_hum_temp->getTemperature(&temperature);

  return temperature;
}

const char *readAcceleration()
{
  // sensor_acc_gyro->reset();

  uint8_t XL;
  sensor_acc_gyro->get6dOrientationXL(&XL);

  uint8_t XH;
  sensor_acc_gyro->get6dOrientationXH(&XH);

  uint8_t YL;
  sensor_acc_gyro->get6dOrientationYL(&YL);

  uint8_t YH;
  sensor_acc_gyro->get6dOrientationYH(&YH);

  uint8_t ZL;
  sensor_acc_gyro->get6dOrientationZL(&ZL);

  uint8_t ZH;
  sensor_acc_gyro->get6dOrientationZH(&ZH);

  static char result[100];
  snprintf(result, sizeof(result), "XL: %02d XH: %02d YL: %02d YH: %02d-% ZL: 02d ZH: %02d", XL, XH, YL, YH, ZL, ZH);

  return result;
}

float readPressure()
{
  float pressure = 0;

  sensor_pressure->getPressure(&pressure);

  return pressure;
}

void parseTwinMessage(DEVICE_TWIN_UPDATE_STATE updateState, const char *message)
{
    JSON_Value *root_value;
    root_value = json_parse_string(message);
    if (json_value_get_type(root_value) != JSONObject)
    {
        if (root_value != NULL)
        {
            json_value_free(root_value);
        }
        LogError("parse %s failed", message);
        return;
    }
    JSON_Object *root_object = json_value_get_object(root_value);

    if (updateState == DEVICE_TWIN_UPDATE_COMPLETE)
    {
        JSON_Object *desired_object = json_object_get_object(root_object, "desired");
        if (desired_object != NULL)
        {
          if (json_object_has_value(desired_object, "userLEDState"))
          {
            userLEDState = json_object_get_number(desired_object, "userLEDState");
          }
          if (json_object_has_value(desired_object, "rgbLEDState"))
          {
            rgbLEDState = json_object_get_number(desired_object, "rgbLEDState");
          }
          if (json_object_has_value(desired_object, "rgbLEDR"))
          {
            rgbLEDR = json_object_get_number(desired_object, "rgbLEDR");
          }
          if (json_object_has_value(desired_object, "rgbLEDG"))
          {
            rgbLEDG = json_object_get_number(desired_object, "rgbLEDG");
          }
          if (json_object_has_value(desired_object, "rgbLEDB"))
          {
            rgbLEDB = json_object_get_number(desired_object, "rgbLEDB");
          }
        }
    }
    else
    {
      if (json_object_has_value(root_object, "userLEDState"))
      {
        userLEDState = json_object_get_number(root_object, "userLEDState");
      }
      if (json_object_has_value(root_object, "rgbLEDState"))
      {
        rgbLEDState = json_object_get_number(root_object, "rgbLEDState");
      }
      if (json_object_has_value(root_object, "rgbLEDR"))
      {
        rgbLEDR = json_object_get_number(root_object, "rgbLEDR");
      }
      if (json_object_has_value(root_object, "rgbLEDG"))
      {
        rgbLEDG = json_object_get_number(root_object, "rgbLEDG");
      }
      if (json_object_has_value(root_object, "rgbLEDB"))
      {
        rgbLEDB = json_object_get_number(root_object, "rgbLEDB");
      }
    }

    if (rgbLEDState == 0)
    {
      rgbLed.turnOff();
    }
    else
    {
      rgbLed.setColor(rgbLEDR, rgbLEDG, rgbLEDB);
    }

    pinMode(LED_USER, OUTPUT);
    digitalWrite(LED_USER, userLEDState);
    json_value_free(root_value);
}

static void DeviceTwinCallback(DEVICE_TWIN_UPDATE_STATE updateState, const unsigned char *payLoad, int size)
{
  char *temp = (char *)malloc(size + 1);
  if (temp == NULL)
  {
    return;
  }
  memcpy(temp, payLoad, size);
  temp[size] = '\0';
  parseTwinMessage(updateState, temp);
  free(temp);
}

void setup()
{
  rgbLed.turnOff();
  Screen.init();
  Screen.print(0, "IoT DevKit");
  Screen.print(2, "Initializing...");

  Screen.print(3, " > Serial");
  Serial.begin(115200);

  // Initialize the WiFi module
  Screen.print(3, " > WiFi");
  hasWifi = false;
  InitWifi();
  if (!hasWifi)
  {
    return;
  }

  // Initializet the Sensors
  Screen.print(3, " > Sensors");
  SensorInit();

  // initialize the IoTHub
  Screen.print(3, " > IoT Hub");
  DevKitMQTTClient_Init(true);
  DevKitMQTTClient_SetDeviceTwinCallback(DeviceTwinCallback);
  DevKitMQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);

  send_interval_ms = SystemTickCounterRead();
}

void readMessage(int messageId, char *payload)
{
  // Create { "meta": {}, "data": {} }
  JSON_Value *root_value = json_value_init_object();
  JSON_Object *root_object = json_value_get_object(root_value);
  
  JSON_Value *meta_value = json_value_init_object();
  JSON_Object *meta_object = json_value_get_object(meta_value);

  JSON_Value *data_value = json_value_init_object();
  JSON_Object *data_object = json_value_get_object(data_value);

  char *serialized_string = NULL;

  json_object_set_number(root_object, "messageId", messageId);

  const char *mac = readMacAddress();
  json_object_set_string(meta_object, "mac", mac);

  const char *firmwareVersion = getDevkitVersion();
  json_object_set_string(meta_object, "firmwareVersion", firmwareVersion);

  const char *wifiSSID = WiFi.SSID();
  json_object_set_string(meta_object, "wifiSSID", wifiSSID);

  int wifiRSSI = WiFi.RSSI();
  json_object_set_number(meta_object, "wifiRSSI", wifiRSSI);

  float t = readTemperature();
  json_object_set_number(data_object, "temperature", t);

  float h = readHumidity();
  json_object_set_number(data_object, "humidity", h);

  float p = readPressure();
  json_object_set_number(data_object, "pressure", p);

  // Set the keys
  json_object_set_value(root_object, "meta", meta_value);
  json_object_set_value(root_object, "data", data_value);

  serialized_string = json_serialize_to_string_pretty(root_value);

  snprintf(payload, MESSAGE_MAX_LEN, "%s", serialized_string);
  json_free_serialized_string(serialized_string);
  json_value_free(root_value);
}

void loop()
{
  if (hasWifi)
  {
    if (messageSending && (int)(SystemTickCounterRead() - send_interval_ms) >= INTERVAL)
    {
      char messagePayload[MESSAGE_MAX_LEN];
      readMessage(messageCount, messagePayload);

      EVENT_INSTANCE* message = DevKitMQTTClient_Event_Generate(messagePayload, MESSAGE);
      DevKitMQTTClient_SendEventInstance(message);
      
      send_interval_ms = SystemTickCounterRead();
    }
    else
    {
      DevKitMQTTClient_Check();
    }
  }

  delay(1000);
}