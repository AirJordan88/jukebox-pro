// api/playlists.js
import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

import {
  createPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";

// 🔒 All /playlists routes require a logged-in user
router.use(requireUser);

// Preload playlist by :id
router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");
  req.playlist = playlist;
  next();
});

// Helper to enforce ownership
function requirePlaylistOwner(req, res, next) {
  if (req.playlist.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }
  next();
}

// GET /playlists - playlists owned by the user
router.get("/", async (req, res, next) => {
  try {
    const playlists = await getPlaylistsByUserId(req.user.id);
    res.send(playlists);
  } catch (err) {
    next(err);
  }
});

// POST /playlists - create playlist owned by the user
router.post(
  "/",
  requireBody(["name", "description"]),
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const playlist = await createPlaylist(
        name,
        description,
        req.user.id // 👈 owner
      );
      res.status(201).send(playlist);
    } catch (err) {
      next(err);
    }
  }
);

// GET /playlists/:id - 403 if not owner
router.get("/:id", requirePlaylistOwner, (req, res) => {
  res.send(req.playlist);
});

// GET /playlists/:id/tracks - 403 if not owner
router.get("/:id/tracks", requirePlaylistOwner, async (req, res, next) => {
  try {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

// POST /playlists/:id/tracks - 403 if not owner
router.post(
  "/:id/tracks",
  requirePlaylistOwner,
  requireBody(["trackId"]),
  async (req, res, next) => {
    try {
      const { trackId } = req.body;
      const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
      res.status(201).send(playlistTrack);
    } catch (err) {
      next(err);
    }
  }
);
