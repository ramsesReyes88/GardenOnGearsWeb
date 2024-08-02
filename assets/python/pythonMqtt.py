import paho.mqtt.client as mqttClient
import json
from pymongo import MongoClient
import datetime

# Conexión a MongoDB
mongo_uri = "mongodb+srv://0322103800:familyguy@cluster0.5pzec4c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongo_client = MongoClient(mongo_uri)
db = mongo_client['GOGDB']  
collection = db['Lecturas']  

# Configuración del broker MQTT
broker = "broker.hivemq.com"
port = 1883
topic = "UTT/0322103800"

# Función que se ejecuta al conectar con el broker MQTT
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(topic)

# Función que se ejecuta al recibir un mensaje MQTT
def on_message(client, userdata, msg):
    print(f"Message received: {msg.payload.decode()}")
    try:
        data = json.loads(msg.payload.decode())
        temperature = data['ToC']
        humidity = data['RH']
        lux = data['Lux']

        timestamp = datetime.datetime.utcnow()
        print(f'Timestamp: {timestamp}, Temp: {temperature}, Hum: {humidity}, Lux: {lux}')

        # Insertar en MongoDB
        lectura = {
            "fecha": timestamp,
            "temperatura": temperature,
            "humedad": humidity,
            "lux": lux
        }
        collection.insert_one(lectura)
        print("Data inserted to MongoDB")
    except Exception as e:
        print("Error processing message: ", e)

# Configuración del cliente MQTT
client = mqttClient.Client()
client.on_connect = on_connect
client.on_message = on_message

# Conectar con el broker MQTT
try:
    client.connect(broker, port, 60)
    print("MQTT Client connected to broker")
except Exception as e:
    print("Error connecting to MQTT broker: ", e)

# Mantener el cliente en ejecución
client.loop_forever()
