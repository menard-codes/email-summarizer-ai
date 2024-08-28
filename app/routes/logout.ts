import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { storage } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await storage.getSession(request.headers.get("Cookie"));
    return redirect("/nylas/auth", {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    })
};
