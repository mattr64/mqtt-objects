require('dotenv').config();
const config = require('./config.json');  // Import config JSON file
const mqtt = require('mqtt');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');

const app = express();
const port = 3000;

// Setup connection to local mongoDB
MongoClient.connect(`mongodb://${config.db_username}:${config.db_password}@localhost:27017/${config.db_name}`, function(err, mongoClient) {  // Changed variable name to mongoClient
  if (err) throw err;
  const db = client.db(config.db_name);

  // Setup MQTT connection - though this will be on port 443...
  const mqttClient  = mqtt.connect('mqtt://localhost:1883');

  mqttClient.on('connect', function () {
    mqttClient.subscribe('queue1', function (err) {  // Use new variable name here too
      if (err) throw err;
    });
  });

  client.on('message', function (topic, message) {
    const payload = message.toString();
    // Store the message into MongoDB
    db.collection("queue1").insertOne({message: payload, timestamp: new Date()}, function(err, res) {
      if (err) throw err;
      console.log("Message inserted");
    });
  });

  // API endpoint to fetch data
  app.get('/getData', async (req, res) => {
    const results = await db.collection('queue1').find().toArray();
    res.json(results);
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
});
