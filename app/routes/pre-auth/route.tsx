import { MetaFunction, LinksFunction } from "@remix-run/node";
import styles from "./pre-auth.styles.css?url";

export const meta: MetaFunction = () => [
    { title: 'Email Summarizer AI - Pre Auth' },
    { name: 'description', content: 'Email Summarizer AI - Pre Auth' }
]

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: styles }
]

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
