import assert from "assert";
import bycrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { db } from "~/infrastructure/database/index.server";
import {
  users,
  type SelectUser,
} from "~/infrastructure/database/schema.server";
import { sessionStorage } from "./session.server";

export const getHashedPassword = async (password: string) => {
  const saltRounds = 12;
  return await bycrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bycrypt.compare(password, hash);
};

export async function authenticate(request: Request, returnTo?: string) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");

  if (user) return user;
  if (returnTo) session.set("returnTo", returnTo);

  throw redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}

type UserType = Pick<SelectUser, "email" | "id">;
export let authenticator = new Authenticator<UserType | null>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    try {
      const email = String(form.get("email"));
      const password = String(form.get("password"));
      assert(email && password, "The provided credentials are invalid");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      assert(!user.length, "The provided credentials are invalid");
      assert(
        await comparePassword(password, user?.[0]?.password ?? ""),
        "The provided credentials are invalid"
      );

      return {
        id: user?.[0]?.id,
        email: user?.[0]?.email,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }),
  "user-pass"
);
