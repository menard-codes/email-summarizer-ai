import "dotenv/config";
import Nylas from "nylas";

export const config = {
    clientId: process.env.NYLAS_CLIENT_ID as string,
    callbackUri: "http://localhost:5173/oauth/exchange",
    apiKey: process.env.NYLAS_API_KEY as string,
    apiUri: process.env.NYLAS_API_URI as string
};

export const nylas = new Nylas({
    apiKey: config.apiKey,
    apiUri: config.apiUri
});
