/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


 /*
 Device Side Program
 ***********************
 Device-side programming consists of three parts:
    1) Connecting to the IoT service (MQTT broker)
    2) Subscribing events from devices
    3) Publishing commands to devices
*********************
*/


var flagTwitterBot = false;
var myTwitterTag = "#iottesttry";


// Use sctrict mode
'use strict';

//------------------------------------------------------------------------------
// Change variable values in this section to customize emitted data
//------------------------------------------------------------------------------

//read the id of the IoT foundation org out of a local .env file
//format of .env file: iotf_org=<id of IoT Foundation organization>
require('dotenv').load();

// Note that the following configuration must match with the parameters that
// the device was registered with. This device registration can
// either be done in the dashboard of the IoT Foundation service or via its
// API
var iotfConfig = {
    "org" : process.env.iotf_org,
    "id" : process.env.iotf_appid,
    "auth-key" : process.env.iotf_apikey,
    "auth-token" : process.env.iotf_authtoken
};

var QosLevel = 0; //default value

//where send commands (target device that receive the commands)
var myTargetDeviceType = process.env.iotf_targetDeviceType;
var myTargetDeviceId = process.env.iotf_targetDeviceID;
//command name define
var blinkCommand = "blink";
var showTwitText = "showtwittext";



// ** Setup all the required node modules we'll need **
var express = require('express'); //express framework
var app = express(); //Init the app as an express application
//serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
var cfenv = require('cfenv'); //helps to access the CloudFoundry environment:
var appEnv = cfenv.getAppEnv(); //get the application env from CloudFoundry

console.log('');
console.log('--- DEBUG appENV: ---');
console.log(appEnv);
console.log('');

//The ibmiotf package simplifies intractions with the IoT Platform Service
var Iotf = require("ibmiotf");

/**** Start the express server ****/
 var port = appEnv.port;

 app.listen(port, function() {
     console.log("Server started on http://" + appEnv.bind + ":" + port);
  }).on('error', function(err) {
    if (err.errno === 'EADDRINUSE') {
        console.log('Server not started, port ' + appEnv.url + ' is busy');
    } else {
        console.log(err);
    }
});
/****/

/* ******* (1) Connecting to the IoT service (MQTT broker) */
/* ******************************************************* */

console.log('');
console.log('--- DEBUG iotConfig: ---');
console.log(iotfConfig);
console.log('');

// Create a client (used to send data and receive commands)
var iotfClient = new Iotf.IotfApplication(iotfConfig);

// Connect to the initialized iotf service
iotfClient.connect();

// Handle errors coming from the iotf service
iotfClient.on("error", function (err) {
    // console.log("Error received while connecting to IoTF service: " + err.message);
    if (err.message.indexOf('authorized') > -1) {
        console.log('');
        console.log("Make sure the device is registered in the IotF org with the following configuration:")
        console.log(iotfConfig);
        console.log('');
    }
    process.exit( );
});

// callback function called when the client connect to IOT platform service
iotfClient.on("connect", function () {
    console.log("ApplicationSide Program is connected to the IoT Foundation service");
    console.log("QoS level set to: " + QosLevel);

/* ******* (2) Subscribing events from devices or from the MQTT broker */
/* ********************************************* */

    //subscribe to 'status' topic\event from all device types and devices.
    iotfClient.subscribeToDeviceEvents("+","+","status"); //default QoS: 0
    console.log("Subscribed to 'status' event from all device types and devices");

    //subscribe to 'infoboard' events for all device types and devices
    iotfClient.subscribeToDeviceEvents("+","+","infoboard");
    console.log("Subscribed to 'infoboard' event from all device types and devices");

    /* ******* (3) Publishing commands to devices */
    /* ******************************************************* */
    /* Send command to device */
    var myData={'DelaySeconds' : 10};
    myData = JSON.stringify(myData);
    iotfClient.publishDeviceCommand(myTargetDeviceType, myTargetDeviceId, blinkCommand, "json", myData);
    console.log("Send Command: " + blinkCommand + " to device: " + myTargetDeviceType + " --> " + myTargetDeviceId);
    /* ******* */

    /* on connect of IOTF, I initialize the tweetBot */
    if(flagTwitterBot == true) {
      twitterBot();
    }

});


//callback of the events (Handling events from devices)
//this function is called when the Device emits an event. The rules (when call this function)
//are defined by the subcription (all devices, only a specific events and so on )
var payloadStatusObj = {};
iotfClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    if(eventType == "status") {
        console.log("\n******* APPLICATION SIDE: listened 'status' topic ****** \n");
        console.log("Device STATUS: " + payload)
        console.log("\n*********************************************************");
     
        payloadStatusObj = JSON.parse(payload);
    }
    else if(eventType == "infoboard") {
        var payloadToJsonObj = JSON.parse(payload);
        console.log("Device INFO of: " + deviceType + " --> " + deviceId);
        console.log("Num PIN: " + payloadToJsonObj.d.pinsboard);
        console.log("Voltage: " + payloadToJsonObj.d.voltageboard)
    }
    else { //generic message of the event
        console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
    }
});





/***** Twitter bot ******/
/************************/
var TwitterPackage = require('twitter');
var secret = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET ,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

function twitterBot () {
  console.log("init TweetBot");
  var Twitter = new TwitterPackage(secret);
  Twitter.stream('statuses/filter', {track: myTwitterTag}, function(stream) {
    stream.on('data', function(tweet) {
      console.log(tweet.text);
      /* Send command to device */
      var myData={'tweettext' : tweet.text};
      myData = JSON.stringify(myData);
      iotfClient.publishDeviceCommand(myTargetDeviceType, myTargetDeviceId, showTwitText, "json", myData);
      /* ******* */
    });

    stream.on('error', function(error) {
      console.log(error);
    });
  });
}
/********/





/**** status REST API *****/
	app.get('/api/status', function(req, res) {
    var resultObj = payloadStatusObj;
    createJsonSuccessAndReturnResponse(res, 'status', resultObj);
});

/*** ## COMMAND ONE api *****/
app.get('/api/commandone', function(req, res) {
  createJsonSuccessAndReturnResponse(res, 'commandone', {});

  /* >>> below you can publish(send) a command to Device <<< */


});


/*** ## COMMAND TWO api *****/
app.get('/api/commandtwo', function(req, res) {
  createJsonSuccessAndReturnResponse(res, 'commandtwo', {});

  /* >>> below you can publish(send) a command to Device <<< */


});


/*Create a generic 200 JSON message and sends it to the response */
var createJsonSuccessAndReturnResponse = function createJsonSuccessAndReturnResponse(res, action, resultObj){
  var output = {returnCode: 200, message: 'SUCCESS', status: 'OK', action:action, body:resultObj};
    //res.writeHead(200, {"Content-Type": "application/json"});
    //res.end(JSON.stringify(output));
    res.json(output);
}
