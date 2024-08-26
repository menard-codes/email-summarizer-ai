import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { config, nylas } from "~/nylas.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const code = searchParams.get('code');

    if (!code) {
        throw new Response("No Authorization code returned from Nylas", { status: 400 });
    }

    const codeExhangePayload = {
        clientSecret: config.apiKey,
        clientId: config.clientId,
        redirectUri: config.callbackUri,
        code
    };

    try {
        const response = await nylas.auth.exchangeCodeForToken(codeExhangePayload);
        const { grantId } = response;
        // TODO: Save grantId to DB
        console.log('Grant ID:', grantId)
        // TODO: Setup Authentication

        return redirect("/home");
    } catch (error) {
        console.error(error);
        throw new Response("Failed to exchange authorization code for token", { status: 500 })
    }
}
