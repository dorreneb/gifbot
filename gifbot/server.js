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
    var cogServicesOptions = {
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

    var giphyOptions = {
        method: 'GET',
        json: true,
        url: 'https://api.giphy.com/v1/gifs/search?api_key=' + process.env.GIPHY_API_KEY + '&limit=1&offset=0&rating=G&lang=en',
        
    };

    var keyPhrases = {};
    var searchTerm = "";
    var responseString = "Something went wrong :(";
    var gifCard = null;

    request(cogServicesOptions)
        .then(function (parsedBody) { //get the key phrases from the message
            if (parsedBody.documents.length > 0) {
                //extract keyphrases from body response
                keyPhrases = parsedBody.documents[0].keyPhrases;

                //assemble search term for giphy
                for (var term in keyPhrases) {
                    searchTerm += keyPhrases[term].replace(" ", "+") + "+";
                }
                giphyOptions.url += "&q=" + searchTerm.slice(0, -1);

                //call giphy API
                return request(giphyOptions);
            } else {
                responseString = "No documents returned.";
            } 
        })
        .then(function (gifBody) {
            //get url
            var embedUrl = gifBody.data[0].images.original.url;
            console.log("embed " + gifBody.data[0].images.original.url);

            var card = new builder.HeroCard(session)
                .title('How about this one?')
                .text('Seems like it could help!')
                .images([
                    builder.CardImage.create(session, embedUrl)
                ]);

            gifCard = new builder.Message(session).addAttachment(card);
        }) 
        .catch(function (err) {
            responseString = "ERROR - " + err;
        }).then(function () { //actually send the message back to the client
            if (gifCard) {
                session.send(gifCard);
            } else {
                session.send(responseString);
            }
            
        });

    
});