// db/queries/playlists.js
import db from "#db/client";

export async function createPlaylist(name, description, userId) {
  const sql = `
    INSERT INTO playlists
      (name, description, user_id)
    VALUES
      ($1, $2, $3)
    RETURNING *
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [name, description, userId]);
  return playlist;
}

// All playlists for a particular user
export async function getPlaylistsByUserId(userId) {
  const sql = `
    SELECT *
    FROM playlists
    WHERE user_id = $1
  `;
  const { rows: playlists } = await db.query(sql, [userId]);
  return playlists;
}

export async function getPlaylists() {
  // not used by tests anymore, but keep a generic version if you want
  const sql = `
    SELECT *
    FROM playlists
  `;
  const { rows: playlists } = await db.query(sql);
  return playlists;
}

export async function getPlaylistById(id) {
  const sql = `
    SELECT *
    FROM playlists
    WHERE id = $1
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [id]);
  return playlist;
}

// 🆕 For GET /tracks/:id/playlists
export async function getPlaylistsByTrackAndUser(trackId, userId) {
  const sql = `
    SELECT p.*
    FROM playlists p
    JOIN playlists_tracks pt ON pt.playlist_id = p.id
    WHERE pt.track_id = $1
      AND p.user_id = $2
  `;
  const { rows: playlists } = await db.query(sql, [trackId, userId]);
  return playlists;
}
