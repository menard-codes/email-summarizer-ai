import { createCookieSessionStorage, redirect } from "@remix-run/node";
import jwt from "jsonwebtoken";
import db from "~/services/db.server";

const sessionSecret = process.env.JWT_SECRET;

if (!sessionSecret) {
    throw new Error('JWT_SECRET must be set');
}

export const storage = createCookieSessionStorage({
    cookie: {
        name: "auth_session",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7days
        httpOnly: true
    }
});

export const requireAuth = async (request: Request) => {
    const session = await storage.getSession(request.headers.get("Cookie"));
    const token = session.get("auth_session") as string;

    if (!token) {
        return redirect("/nylas/auth");
    }

    try {
        const payload = jwt.verify(token, sessionSecret) as {email: string};

        const userEmail = payload.email;
        if (!userEmail) {
            return redirect("/nylas/auth");
        }

        const user = await db.users.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return redirect("/nylas/auth");
        }

        return user;
    } catch (error) {
        return redirect("/nylas/auth");
    }
}
