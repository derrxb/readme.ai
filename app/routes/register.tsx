import { LoginForm } from "~/ui/organisms/login-form";
import type { Route } from "../+types/root";
import marketing from "../marketing/index.json";
import { authenticate, authenticator } from "~/services/authentication.server";
import { redirect, useActionData } from "react-router";
import { commitSession, getSession } from "~/services/session.server";
import { RegisterForm } from "~/ui/organisms/register-form";

export const meta = () => {
  return [
    {
      title: marketing.name,
    },
    {
      name: "description",
      content: marketing.description,
    },
  ];
};

export const loader = async (args: Route.LoaderArgs) => {
  let user = await authenticate(args.request, "/dashboard");
  if (!user) {
    return null;
  }
};

export const action = async (args: Route.ActionArgs) => {
  let headers;
  try {
    const user = await authenticator.authenticate("user-pass", args.request);

    // manually get the session
    const session = await getSession(args.request.headers.get("cookie"));
    // and store the user data
    session.set("user", user);

    // commit the session
    headers = new Headers({ "Set-Cookie": await commitSession(session) });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) throw error;

    return {
      // values: await getValuesFromRequest(request),
      errors: {
        general: (error as Error)?.message,
      },
    };
  }

  throw redirect("/dashboard", { headers });
};

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterForm errorMessage={actionData?.errors?.general} />
      </div>
    </div>
  );
}
