import { eq } from "drizzle-orm";
import { redirect, useActionData } from "react-router";
import { db } from "~/infrastructure/database/index.server";
import { users } from "~/infrastructure/database/schema.server";
import {
  authenticate,
  getHashedPassword,
} from "~/services/authentication.server";
import { commitSession, getSession } from "~/services/session.server";
import { RegisterForm } from "~/ui/organisms/register-form";
import type { Route } from "../+types/root";
import marketing from "../marketing/index.json";

const getValuesFromRequest = async (formData: FormData) => {
  const values = Object.fromEntries(formData);

  return values;
};

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

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await authenticate(request, "/dashboard");
};

export const action = async ({ request }: Route.ActionArgs) => {
  let headers;
  const formData = await request.formData();
  try {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user?.length) {
      throw new Error("A user already exists with this email");
    }

    const newUser = await db
      .insert(users)
      .values({
        email,
        password: await getHashedPassword(password),
      })
      .returning()
      .execute();

    const session = await getSession(request.headers.get("cookie"));
    session.set("user", { email: newUser?.[0]?.email, id: newUser?.[0]?.id });

    // commit the session
    headers = new Headers({ "Set-Cookie": await commitSession(session) });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) throw error;

    return {
      values: await getValuesFromRequest(formData),
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
