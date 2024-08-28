import { redirect } from "@remix-run/node";
import { config, nylas } from "~/services/nylas.server";

export const loader = () => {
    const authUrl = nylas.auth.urlForOAuth2({
        clientId: config.clientId,
        redirectUri: config.callbackUri
    });
    
    return redirect(authUrl);
};
