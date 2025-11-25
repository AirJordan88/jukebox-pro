import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // Create tracks
  const tracks = [];
  for (let i = 1; i <= 20; i++) {
    const track = await createTrack("Track " + i, i * 50000);
    tracks.push(track);
  }

  // Create at least 2 users
  const alice = await createUser("alice", "password123");
  const bob = await createUser("bob", "password123");

  // Each user has a playlist with at least 5 tracks
  const alicePlaylist = await createPlaylist(
    "Alice's Favorites",
    "Alice's playlist description",
    alice.id
  );

  const bobPlaylist = await createPlaylist(
    "Bob's Favorites",
    "Bob's playlist description",
    bob.id
  );

  // Alice: first 5 tracks
  for (let i = 0; i < 5; i++) {
    await createPlaylistTrack(alicePlaylist.id, tracks[i].id);
  }

  // Bob: next 5 tracks
  for (let i = 5; i < 10; i++) {
    await createPlaylistTrack(bobPlaylist.id, tracks[i].id);
  }
}
