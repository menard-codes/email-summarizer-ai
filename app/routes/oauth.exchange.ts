import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { config, nylas } from "~/services/nylas.server";
import db from "~/services/db.server";
import jwt from "jsonwebtoken";
import { storage } from "~/services/auth.server";

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
        const { grantId, email } = response;
        const user = await db.users.findUnique({ where: { email } });
        if (!user) {
            await db.users.create({
                data: {
                    email,
                    grantId
                }
            });
        }


        const sessionSecret = process.env.JWT_SECRET;

        if (!sessionSecret) {
            console.error('sessionSecret env not defined');
            throw new Response('Internal server error', { status: 500 });
        }

        const token = jwt.sign({ email }, sessionSecret, { expiresIn: "7d" });
        const session = await storage.getSession();
        session.set("auth_session", token);

        return redirect("/home", {
            headers: {
                "Set-Cookie": await storage.commitSession(session)
            }
        });
    } catch (error) {
        console.error(error);
        throw new Response("Failed to exchange authorization code for token", { status: 500 })
    }
}
