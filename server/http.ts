import { getUser, type User } from "@netlify/identity";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const conflict = (message: string) => new HttpError(409, message);

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

// Only invited, signed-in Netlify Identity users may use the API. Registration is
// invite-only and self-signup is additionally blocked by the identity event function.
export async function requireStaff(): Promise<User> {
  const user = await getUser();
  if (!user || !user.email) throw new HttpError(401, "Please sign in to continue.");
  return user;
}

// Writes are authenticated with a cookie, so reject cross-site requests.
export function requireSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = new URL(req.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "Cross-origin request refused.");
  if (req.headers.get("x-sds-client") !== "1") throw new HttpError(403, "Request refused.");
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error);
  return json({ error: "Something went wrong on the server. Your change was not saved." }, 500);
}
