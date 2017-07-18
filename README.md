# gifbot
Gifbot is a cool little guy who fetches you gifs on request. He does this by extracting keywords from your message using the Cognitive Services Text Analytics API, then using those keywords to search giphy.

The first gif that comes back is what he'll return.

To deploy gifbot, make sure the following environment variables are set:

|Variable|Note|
|--------|----|
|MICROSOFT_APP_ID|Your bot's app id|
|MICROSOFT_APP_PASSWORD|Your bot's secret|
|TEXT_ANALYTICS_KEY|Your [Text Analytics API key](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/)|
|GIPHY_API_KEY|Your [giphy API key](https://developers.giphy.com/)|
