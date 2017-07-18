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

    request(options)
        .then(function (parsedBody) {
            if (parsedBody.documents.length > 0) {
                var keyPhrases = parsedBody.documents[0].keyPhrases;


                session.send("You said: %s", JSON.stringify(keyWords.keyPhrases));
            } else {
                session.send("No documents returned.");
            }
            
        })
        .catch(function (err) {
            session.send("ERROR - %s", err);
        });

    
});