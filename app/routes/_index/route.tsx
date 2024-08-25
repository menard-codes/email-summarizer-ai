import type { MetaFunction, LinksFunction } from "@remix-run/node";
import styles from "./_index.styles.css?url";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Summarizer AI" },
    { name: "description", content: "Email Summarizer AI Landing Page." },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles }
];

export default function Index() {
  return (
    <div className="body">
      <h1 className="heading">Email Summarizer AI</h1>
      <p className="subheading">Your AI assistant to get you onboarded on any Email Conversation in on time.</p>
      <a href="/pre-auth" className="cta-btn">Get Started</a>
    </div>
  );
}
