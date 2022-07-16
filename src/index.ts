import sqlite3 from "sqlite3";
import { open } from "sqlite";

const express = require("express");
const app = express();

async function main() {
  const db = await open({
    filename: "./sampleDatabase.db",
    driver: sqlite3.Database,
  });

  app.get("/artists-by-genre", async function (req: any, res: any) {
    const genre = await db.get(
      "SELECT * FROM genres WHERE Name = ?",
      req.query.genre
    );

    if (!genre) {
      return res.send("Genre not found");
    }

    const tracks = await db.all(
      "SELECT DISTINCT AlbumId FROM tracks WHERE GenreId = ?",
      genre.GenreId
    );
    const albumsIds = tracks.map((track) => track.AlbumId);
    const albums = await db.all(
      "SELECT ArtistId FROM albums WHERE AlbumId IN (" +
        albumsIds.join(",") +
        ")"
    );
    const artistsIds = albums.map((album) => album.ArtistId);
    const artists = await db.all(
      "SELECT * FROM artists WHERE ArtistId IN (" +
        artistsIds.join(",") +
        ") ORDER BY Name"
    );

    return res.send(artists);
  });

  app.get("/tracks-count", async function (req: any, res: any) {
    const count = await db.get("SELECT COUNT(TrackId) FROM tracks");

    return res.send(`Tracks count: ${count["COUNT(TrackId)"]}`);
  });

  app.get("/artist-albums", async function (req: any, res: any) {
    const artist = await db.get(
      "SELECT * FROM artists WHERE Name = ?",
      String(req.query.name)
    );

    if (!artist) {
      return res.send("Artist not found");
    }

    const albums = await db.all(
      "SELECT * FROM albums WHERE ArtistId = ?",
      artist.ArtistId
    );

    return res.send(albums);
  });

  app.listen(4003);
}

main();
