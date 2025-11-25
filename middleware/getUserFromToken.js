import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";

/** Attaches the user to the request if a valid token is provided */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  // No token → just move on; requireUser will handle protection where needed
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next();
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = verifyToken(token);

    // Support either { id } or { userId } just in case
    const userId = payload.id ?? payload.userId;
    if (!userId) {
      return res.status(401).send("Invalid token.");
    }

    const user = await getUserById(userId);

    // If token decodes but user no longer exists (e.g., deleted)
    if (!user) {
      return res.status(401).send("Invalid token.");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Invalid token.");
  }
}
