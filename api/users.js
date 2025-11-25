// api/users.js
import express from "express";
const router = express.Router();
export default router;

import bcrypt from "bcrypt";

import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import { createUser, getUserByUsername } from "#db/queries/users";

// POST /users/register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await createUser(username, password);

      const token = createToken({ id: user.id });
      res.status(201).send(token);
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await getUserByUsername(username);
      if (!user) return res.status(400).send("Invalid username or password.");

      const matches = await bcrypt.compare(password, user.password);
      if (!matches)
        return res.status(400).send("Invalid username or password.");

      const token = createToken({ id: user.id });
      res.send(token);
    } catch (err) {
      next(err);
    }
  }
);
