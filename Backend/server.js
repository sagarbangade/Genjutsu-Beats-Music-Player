// server.js - Complete Backend for Music Player (WITHOUT music-metadata) - WITH ALBUM ART FIX - COMPLETE CODE

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs"); // Change import to bcryptjs
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ** 1. Database Connection (MongoDB with Mongoose) **
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// ** 2. Mongoose Models **
// User Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  profilePicture: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

// Music Model
const MusicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  artist: String,
  album: String,
  genre: String,
  year: Number,
  audioFileUrl: { type: String, required: true },
  albumArtUrl: String, // Will store URL or path to album art
  uploadDate: { type: Date, default: Date.now },
});
const Music = mongoose.model("Music", MusicSchema);

// Playlist Model
const PlaylistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: String,
  coverImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
});
const Playlist = mongoose.model("Playlist", PlaylistSchema);

// PlaybackHistory Model (Optional)
const PlaybackHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music",
    required: true,
  },
  playedAt: { type: Date, default: Date.now },
});
const PlaybackHistory = mongoose.model(
  "PlaybackHistory",
  PlaybackHistorySchema
);

// ** 3. Middleware **
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Authorization Middleware (Owner-Only Access)
const authorizeOwner = (resourceType) => async (req, res, next) => {
  const resourceId = req.params.musicId || req.params.playlistId;
  const userId = req.user.userId;

  let resource;
  try {
    if (resourceType === "music") {
      resource = await Music.findById(resourceId);
    } else if (resourceType === "playlist") {
      resource = await Playlist.findById(resourceId);
    } else {
      return res
        .status(400)
        .send({ message: "Invalid resource type for authorization." });
    }

    if (!resource) {
      return res
        .status(404)
        .send({
          message: `${
            resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
          } not found.`,
        });
    }

    if (resource.userId.toString() !== userId) {
      return res
        .status(403)
        .send({ message: `Unauthorized to modify this ${resourceType}.` });
    }
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res
      .status(500)
      .send({ message: "Authorization failed.", error: error.message });
  }
};

// Multer Configuration for Music and Album Art Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destFolder = "uploads/"; // Base upload folder
    if (file.fieldname === "audioFile" || file.fieldname === "newMusicFiles") {
      // 'newMusicFiles' added here
      destFolder += "music";
    } else if (file.fieldname === "albumArt") {
      destFolder += "albumArt";
    }
    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "albumArt") {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          "Only image files are allowed for album art (jpeg, png, gif, webp)."
        )
      );
    }
  } else if (
    file.fieldname === "audioFile" ||
    file.fieldname === "newMusicFiles"
  ) {
    // 'newMusicFiles' added here
    const allowedAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
    ];
    if (
      allowedAudioTypes.includes(file.mimetype) ||
      path.extname(file.originalname).toLowerCase() === ".mp3" ||
      path.extname(file.originalname).toLowerCase() === ".wav" ||
      path.extname(file.originalname).toLowerCase() === ".ogg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Only audio files are allowed (mp3, wav, ogg, mpeg).")
      );
    }
  } else {
    cb(null, true); // For other fields if any
  }
};

const musicUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

// ** 4. API Routes **

// ** A. Authentication Routes (/api/auth) **

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .send({ message: "Username and password are required." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).send({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .send({ message: "Error registering user.", error: error.message });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const tokenPayload = { userId: user._id, username: user.username };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .send({
        message: "Login successful.",
        token: token,
        userId: user._id,
        username: user.username,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Login failed.", error: error.message });
  }
});

// Get User Profile (Protected)
app.get("/api/auth/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .send({ message: "Error fetching profile.", error: error.message });
  }
});

// ** B. Music Management Routes (/api/music) **

// Upload Music (Protected) - Handles album art upload as well - Metadata from request body
app.post(
  "/api/music/upload",
  authenticateJWT,
  musicUpload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "albumArt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (
        !req.files ||
        !req.files["audioFile"] ||
        req.files["audioFile"].length === 0
      ) {
        return res.status(400).send({ message: "No audio file uploaded." });
      }

      const audioFile = req.files["audioFile"][0];
      const albumArtFile = req.files["albumArt"]
        ? req.files["albumArt"][0]
        : null;

      const audioFileUrl = `/uploads/music/${audioFile.filename}`;
      let albumArtUrl = null;

      if (albumArtFile) {
        albumArtUrl = `/uploads/albumArt/${albumArtFile.filename}`;
      }

      const { title, artist, album, genre, year } = req.body; // Get metadata from request body

      const newMusic = new Music({
        userId: req.user.userId,
        title: title || audioFile.originalname, // Default to filename if title not provided
        artist: artist,
        album: album,
        genre: genre,
        year: year,
        audioFileUrl,
        albumArtUrl: albumArtUrl,
      });

      await newMusic.save();
      res
        .status(201)
        .send({ message: "Music uploaded successfully.", music: newMusic });
    } catch (error) {
      console.error("Upload music error:", error);
      if (error instanceof multer.MulterError) {
        return res
          .status(400)
          .send({
            message: "File upload error.",
            error: error.message,
            field: error.field,
          });
      } else {
        res
          .status(500)
          .send({ message: "Error uploading music.", error: error.message });
      }
    }
  }
);

// Get All Music for User (Protected) - with optional filtering, sorting, pagination
app.get("/api/music", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sortBy, filterBy, searchQuery, page = 1, limit = 10 } = req.query;

    let query = { userId: userId };

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { artist: { $regex: searchQuery, $options: "i" } },
      ];
    }

    let sortOptions = {};
    if (sortBy) {
      if (sortBy === "uploadDate" || sortBy === "-uploadDate")
        sortOptions.uploadDate = sortBy === "uploadDate" ? 1 : -1;
      if (sortBy === "title" || sortBy === "-title")
        sortOptions.title = sortBy === "title" ? 1 : -1;
    } else {
      sortOptions = { uploadDate: -1 };
    }

    const skip = (page - 1) * limit;
    const musicList = await Music.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Music.countDocuments(query);

    res
      .status(200)
      .send({
        music: musicList,
        totalCount,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      });
  } catch (error) {
    console.error("Get music list error:", error);
    res
      .status(500)
      .send({ message: "Error fetching music list.", error: error.message });
  }
});

// Get Specific Music Track (Protected)
app.get("/api/music/:musicId", authenticateJWT, async (req, res) => {
  try {
    const musicId = req.params.musicId;
    const musicTrack = await Music.findById(musicId);
    if (!musicTrack) {
      return res.status(404).send({ message: "Music track not found." });
    }
    res.status(200).send(musicTrack);
  } catch (error) {
    console.error("Get music detail error:", error);
    res
      .status(500)
      .send({ message: "Error fetching music details.", error: error.message });
  }
});

// Delete Music Track (Protected, Owner-Only)
app.delete(
  "/api/music/:musicId",
  authenticateJWT,
  authorizeOwner("music"),
  async (req, res) => {
    try {
      const musicId = req.params.musicId;
      const deletedMusic = await Music.findByIdAndDelete(musicId);
      if (!deletedMusic) {
        return res.status(404).send({ message: "Music track not found." });
      }
      // Consider deleting the actual audio file from storage if needed.
      res.status(200).send({ message: "Music track deleted successfully." });
    } catch (error) {
      console.error("Delete music error:", error);
      res
        .status(500)
        .send({ message: "Error deleting music track.", error: error.message });
    }
  }
);

// ** C. Playlist Management Routes (/api/playlists) **

// Create Playlist (Protected) - Handles music selection and upload - Metadata from request body
app.post(
  "/api/playlists",
  authenticateJWT,
  musicUpload.array("newMusicFiles", 5),
  async (req, res) => {
    try {
      const {
        name,
        description,
        coverImageUrl,
        existingSongIds,
        newMusicTitles,
        newMusicArtists,
        newMusicAlbums,
        newMusicGenres,
        newMusicYears,
      } = req.body;
      // Metadata is now expected to be sent from the frontend for new uploads during playlist creation

      if (!name) {
        return res.status(400).send({ message: "Playlist name is required." });
      }

      const newPlaylist = new Playlist({
        userId: req.user.userId,
        name,
        description,
        coverImageUrl,
        songs: [],
      });
      await newPlaylist.save();

      let playlistSongs = [];

      // 1. Add existing songs
      if (existingSongIds) {
        let parsedExistingSongIds = [];
        try {
          parsedExistingSongIds = JSON.parse(existingSongIds);
          if (!Array.isArray(parsedExistingSongIds)) {
            return res
              .status(400)
              .send({
                message: "existingSongIds must be an array of music IDs.",
              });
          }
        } catch (error) {
          return res
            .status(400)
            .send({
              message:
                "Invalid format for existingSongIds. Must be a JSON array of music IDs.",
            });
        }

        if (parsedExistingSongIds.length > 0) {
          const validExistingSongIds = await Music.find({
            _id: { $in: parsedExistingSongIds },
            userId: req.user.userId,
          }).distinct("_id");
          playlistSongs.push(...validExistingSongIds);
        }
      }

      // 2. Handle new music file uploads - Metadata from request body
      if (req.files && req.files.length > 0) {
        const uploadedMusicFiles = req.files;
        for (let i = 0; i < uploadedMusicFiles.length; i++) {
          // Loop with index to match metadata arrays
          const musicFile = uploadedMusicFiles[i];
          const audioFileUrl = `/uploads/music/${musicFile.filename}`;

          const title = newMusicTitles
            ? Array.isArray(newMusicTitles)
              ? newMusicTitles[i]
              : newMusicTitles
            : musicFile.originalname; // Get title from array or single value or filename
          const artist = newMusicArtists
            ? Array.isArray(newMusicArtists)
              ? newMusicArtists[i]
              : newMusicArtists
            : undefined;
          const album = newMusicAlbums
            ? Array.isArray(newMusicAlbums)
              ? newMusicAlbums[i]
              : newMusicAlbums
            : undefined;
          const genre = newMusicGenres
            ? Array.isArray(newMusicGenres)
              ? newMusicGenres[i]
              : newMusicGenres
            : undefined;
          const year = newMusicYears
            ? Array.isArray(newMusicYears)
              ? parseInt(newMusicYears[i])
              : parseInt(newMusicYears)
            : undefined;

          const newMusic = new Music({
            userId: req.user.userId,
            title: title || musicFile.originalname, // Fallback to filename
            artist: artist,
            album: album,
            genre: genre,
            year: year,
            audioFileUrl: audioFileUrl,
          });
          await newMusic.save();
          playlistSongs.push(newMusic._id);
        }
      }

      const uniqueSongIds = [
        ...new Set([
          ...newPlaylist.songs.map(String),
          ...playlistSongs.map(String),
        ]),
      ];
      newPlaylist.songs = uniqueSongIds;
      await newPlaylist.save();

      const populatedPlaylist = await Playlist.findById(
        newPlaylist._id
      ).populate("songs");

      res
        .status(201)
        .send({
          message: "Playlist created successfully with music.",
          playlist: populatedPlaylist,
        });
    } catch (error) {
      console.error("Create playlist error:", error);
      if (error instanceof multer.MulterError) {
        return res
          .status(400)
          .send({
            message: "File upload error during playlist creation.",
            error: error.message,
            field: error.field,
          });
      } else {
        res
          .status(500)
          .send({ message: "Error creating playlist.", error: error.message });
      }
    }
  }
);

// Get All Playlists for User (Protected)
app.get("/api/playlists", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlists = await Playlist.find({ userId: userId });
    res.status(200).send(playlists);
  } catch (error) {
    console.error("Get playlists error:", error);
    res
      .status(500)
      .send({ message: "Error fetching playlists.", error: error.message });
  }
});

// Get Specific Playlist Details (Protected) - with songs populated
app.get("/api/playlists/:playlistId", authenticateJWT, async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await Playlist.findById(playlistId).populate("songs");
    if (!playlist) {
      return res.status(404).send({ message: "Playlist not found." });
    }
    res.status(200).send(playlist);
  } catch (error) {
    console.error("Get playlist detail error:", error);
    res
      .status(500)
      .send({
        message: "Error fetching playlist details.",
        error: error.message,
      });
  }
});

// Update Playlist Details (Protected, Owner-Only)
app.put(
  "/api/playlists/:playlistId",
  authenticateJWT,
  authorizeOwner("playlist"),
  async (req, res) => {
    try {
      const playlistId = req.params.playlistId;
      const { name, description, coverImageUrl } = req.body;
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          name,
          description,
          coverImageUrl,
        },
        { new: true }
      );
      if (!updatedPlaylist) {
        return res.status(404).send({ message: "Playlist not found." });
      }
      res
        .status(200)
        .send({
          message: "Playlist updated successfully.",
          playlist: updatedPlaylist,
        });
    } catch (error) {
      console.error("Update playlist error:", error);
      res
        .status(500)
        .send({ message: "Error updating playlist.", error: error.message });
    }
  }
);

// Delete Playlist (Protected, Owner-Only)
app.delete(
  "/api/playlists/:playlistId",
  authenticateJWT,
  authorizeOwner("playlist"),
  async (req, res) => {
    try {
      const playlistId = req.params.playlistId;
      const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
      if (!deletedPlaylist) {
        return res.status(404).send({ message: "Playlist not found." });
      }
      res.status(200).send({ message: "Playlist deleted successfully." });
    } catch (error) {
      console.error("Delete playlist error:", error);
      res
        .status(500)
        .send({ message: "Error deleting playlist.", error: error.message });
    }
  }
);

// Add Songs to Playlist (Protected, Owner-Only)
app.post(
  "/api/playlists/:playlistId/songs",
  authenticateJWT,
  authorizeOwner("playlist"),
  async (req, res) => {
    try {
      const playlistId = req.params.playlistId;
      const { songIds } = req.body;

      if (!Array.isArray(songIds)) {
        return res.status(400).send({ message: "songIds must be an array." });
      }

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).send({ message: "Playlist not found." });
      }

      const validSongIds = await Music.find({
        _id: { $in: songIds },
        userId: req.user.userId,
      }).distinct("_id");
      const invalidSongIds = songIds.filter(
        (id) => !validSongIds.map(String).includes(id)
      );

      if (invalidSongIds.length > 0) {
        return res
          .status(400)
          .send({
            message: `Invalid song IDs provided: ${invalidSongIds.join(
              ", "
            )}. Songs must exist and belong to the user.`,
          });
      }

      const updatedSongs = [
        ...new Set([
          ...playlist.songs.map(String),
          ...validSongIds.map(String),
        ]),
      ];

      playlist.songs = updatedSongs;
      await playlist.save();

      const populatedPlaylist = await Playlist.findById(playlistId).populate(
        "songs"
      );

      res
        .status(200)
        .send({
          message: "Songs added to playlist successfully.",
          playlist: populatedPlaylist,
        });
    } catch (error) {
      console.error("Add songs to playlist error:", error);
      res
        .status(500)
        .send({
          message: "Error adding songs to playlist.",
          error: error.message,
        });
    }
  }
);

// Remove Song from Playlist (Protected, Owner-Only)
app.delete(
  "/api/playlists/:playlistId/songs/:songId",
  authenticateJWT,
  authorizeOwner("playlist"),
  async (req, res) => {
    try {
      const playlistId = req.params.playlistId;
      const songId = req.params.songId;

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).send({ message: "Playlist not found." });
      }

      playlist.songs = playlist.songs.filter(
        (song) => song.toString() !== songId
      );

      await playlist.save();
      const populatedPlaylist = await Playlist.findById(playlistId).populate(
        "songs"
      );

      res
        .status(200)
        .send({
          message: "Song removed from playlist successfully.",
          playlist: populatedPlaylist,
        });
    } catch (error) {
      console.error("Remove song from playlist error:", error);
      res
        .status(500)
        .send({
          message: "Error removing song from playlist.",
          error: error.message,
        });
    }
  }
);

// ** D. Streaming Route (/api/stream) **

// Stream Music (Protected - consider if public access is needed, adjust auth middleware accordingly)
app.get("/api/stream/:musicId", authenticateJWT, async (req, res) => {
  try {
    const musicId = req.params.musicId;
    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).send({ message: "Music track not found." });
    }

    const audioPath = path.join(__dirname, music.audioFileUrl);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${music.title}.mp3"`
    );

    res.sendFile(audioPath);
  } catch (error) {
    console.error("Streaming error:", error);
    res
      .status(500)
      .send({ message: "Error streaming music.", error: error.message });
  }
});

// ** E. Playback History Routes (/api/history) - Optional Feature **

// Get Playback History (Protected)
app.get("/api/history", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await PlaybackHistory.find({ userId: userId })
      .populate("musicId")
      .sort({ playedAt: -1 })
      .limit(50);

    res.status(200).send(history);
  } catch (error) {
    console.error("Get playback history error:", error);
    res
      .status(500)
      .send({
        message: "Error fetching playback history.",
        error: error.message,
      });
  }
});

// Record Playback Event (Protected)
app.post("/api/history", authenticateJWT, async (req, res) => {
  try {
    const { musicId } = req.body;
    if (!musicId) {
      return res
        .status(400)
        .send({ message: "musicId is required to record history." });
    }

    const newHistoryEntry = new PlaybackHistory({
      userId: req.user.userId,
      musicId: musicId,
    });
    await newHistoryEntry.save();
    res.status(201).send({ message: "Playback history recorded." });
  } catch (error) {
    console.error("Record playback history error:", error);
    res
      .status(500)
      .send({
        message: "Error recording playback history.",
        error: error.message,
      });
  }
});

// Clear Playback History (Protected)
app.delete("/api/history", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    await PlaybackHistory.deleteMany({ userId: userId });
    res.status(200).send({ message: "Playback history cleared successfully." });
  } catch (error) {
    console.error("Clear playback history error:", error);
    res
      .status(500)
      .send({
        message: "Error clearing playback history.",
        error: error.message,
      });
  }
});

// ** 5. Start Server **
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
