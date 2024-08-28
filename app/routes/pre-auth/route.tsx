import { MetaFunction, LinksFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import styles from "./pre-auth.styles.css?url";
import { storage } from "~/services/auth.server";
import jwt from "jsonwebtoken";
import db from "~/services/db.server";

export const meta: MetaFunction = () => [
    { title: 'Email Summarizer AI - Pre Auth' },
    { name: 'description', content: 'Email Summarizer AI - Pre Auth' }
]

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: styles }
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const sessionSecret = process.env.JWT_SECRET as string;
    const session = await storage.getSession(request.headers.get("Cookie"));
    const token = session.get("auth_session") as string;

    if (token) {
        const payload = jwt.verify(token, sessionSecret) as { email: string };
        const user = await db.users.findUnique({ where: { email: payload.email } });
        if (user) {
            return redirect('/home');
        }
    }

    return null;
}

export default function PreAuth() {
    return (
        <div className="body">
            <h1 className="heading">Email Summarizer AI</h1>
            <p className="subheading">
                Email Summarizer AI needs to connect to your Google or Microsoft account
                to help you assist with your emails. To get started, we would like to ask
                your permission for following:
            </p>
            <ul className="list">
                <li>Lorem ipsum dolor</li>
                <li>Lorem ipsum dolor</li>
                <li>Lorem ipsum dolor</li>
                <li>Lorem ipsum dolor</li>
                <li>Lorem ipsum dolor</li>
                <li>Lorem ipsum dolor</li>
            </ul>
            <a href="/nylas/auth" className="cta-btn">Connect My Account</a>
        </div>
    )
}
