// api/tracks.js
import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import { getTracks, getTrackById } from "#db/queries/tracks";
import { getPlaylistsByTrackAndUser } from "#db/queries/playlists";

// Public routes
router.get("/", async (req, res, next) => {
  try {
    const tracks = await getTracks();
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) return res.status(404).send("Track not found.");
    res.send(track);
  } catch (err) {
    next(err);
  }
});

// 🔒 GET /tracks/:id/playlists - playlists owned by the user containing this track
router.get("/:id/playlists", requireUser, async (req, res, next) => {
  try {
    const trackId = req.params.id;

    // First: 404 if track does not exist
    const track = await getTrackById(trackId);
    if (!track) return res.status(404).send("Track not found.");

    // Then: playlists owned by this user that contain the track
    const playlists = await getPlaylistsByTrackAndUser(trackId, req.user.id);
    res.send(playlists);
  } catch (err) {
    next(err);
  }
});
