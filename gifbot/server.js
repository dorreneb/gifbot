'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request-promise');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {

    //set up the service call to the cognitive services API
    var options = {
        method : 'POST',
        json : true,
        url : 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
        headers : {
            'Ocp-Apim-Subscription-Key': process.env.TEXT_ANALYTICS_KEY,
        },
        body : {
            "documents": [
                {
                    "language": "en",
                    "id": "1",
                    "text": session.message.text
                }
            ]
        }
    };

    var keyPhrases = {};
    var responseString = "Something went wrong :(";
    request(options)
        .then(function (parsedBody) { //get the key phrases from the message
            if (parsedBody.documents.length > 0) {
                keyPhrases = parsedBody.documents[0].keyPhrases;
            } else {
                responseString = "No documents returned.";
            } 
        })
        .then(function () { //if there are key phrases, call giphy to get the right gif
            if (keyPhrases) {
                responseString = JSON.stringify(keyPhrases);
            }
        })
        .catch(function (err) {
            responseString = "ERROR - " + err;
        }).then(function () { //actually send the message back to the client
            session.send(responseString);
        });

    
});