// app.js
import express from "express";
const app = express();
export default app;

import morgan from "morgan";

import tracksRouter from "#api/tracks";
import playlistsRouter from "#api/playlists";
import usersRouter from "#api/users"; // 🆕 users router
import getUserFromToken from "#middleware/getUserFromToken"; // 🆕 middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 🧠 Attach user (if token present) for *all* requests
app.use(getUserFromToken);

// Public auth routes
app.use("/users", usersRouter);

// Existing routers
app.use("/tracks", tracksRouter);
app.use("/playlists", playlistsRouter);

// Error handling
app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case "22P02":
      return res.status(400).send(err.message);
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});
