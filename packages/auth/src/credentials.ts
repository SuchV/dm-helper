import { Session, User } from "next-auth";

export const getSession = async () => {
  await new Promise((resolve) => setTimeout(() => resolve(""), 1000));

  return {
    expires: "2035-12-31",
    user: await getUser(),
  } satisfies Session;
};

export const getUser = async () => {
  await new Promise((resolve) => setTimeout(() => resolve(""), 1000));

  return {
    id: "123",
    name: "TestUser",
    email: "example@example.com",
    image: undefined,
  } satisfies User;
};
