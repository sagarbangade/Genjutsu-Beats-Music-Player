#!/bin/bash

PROJECT_DIR="Backend"
SERVER_FILE="server.js"
PACKAGE_MANAGER="npm"

# --- 1. Project Setup and Directory Creation ---
echo "Setting up the backend project structure..."

if [ ! -d "$PROJECT_DIR" ]; then
  mkdir "$PROJECT_DIR"
fi
cd "$PROJECT_DIR" || exit 1

mkdir routes controllers models middleware config utils

# --- 2. Initialize package.json and install dependencies ---
if [ ! -f "package.json" ]; then
  $PACKAGE_MANAGER init -y
fi

echo "Installing dependencies..."
$PACKAGE_MANAGER install express mongoose bcryptjs jsonwebtoken multer cors dotenv validator morgan

# --- 3. Create .env file ---
echo "Creating .env file..."
cat <<EOF > .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/musicplayerdb # Replace with your MongoDB connection string
JWT_SECRET=YOUR_VERY_SECRET_KEY # Replace with a strong secret key
EOF

# --- 4. Create config files ---
echo "Creating config files..."
mkdir config
cat <<EOF > config/db.config.js
// config/db.config.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
EOF

cat <<EOF > config/auth.config.js
// config/auth.config.js
module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    // ... other auth configurations if needed
};
EOF

# --- 5. Create models ---
echo "Creating models..."
mkdir models

cat <<EOF > models/user.model.js
// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        private: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }
    return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
EOF

cat <<EOF > models/music.model.js
// models/music.model.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        trim: true
    },
    album: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    filePath: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {
    timestamps: true
});

const Music = mongoose.model('Music', musicSchema);
module.exports = Music;
EOF

cat <<EOF > models/playlist.model.js
// models/playlist.model.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    music: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'
    }],
}, {
    timestamps: true
});

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;
EOF

# --- 6. Create middleware ---
echo "Creating middleware..."
mkdir middleware

cat <<EOF > middleware/auth.middleware.js
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
EOF

cat <<EOF > middleware/error.middleware.js
// middleware/error.middleware.js
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).send({
        message: err.message,
    });
};
EOF

# --- 7. Create controllers ---
echo "Creating controllers..."
mkdir controllers

cat <<EOF > controllers/auth.controller.js
// controllers/auth.controller.js
const User = require('../models/user.model');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    // Client-side logout is usually sufficient.
    res.send({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    res.send(req.user);
};
EOF

cat <<EOF > controllers/music.controller.js
// controllers/music.controller.js
const Music = require('../models/music.model');
const fs = require('fs');

exports.uploadMusic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No audio file uploaded.' });
        }

        const music = new Music({
            title: req.body.title,
            artist: req.body.artist,
            album: req.body.album,
            genre: req.body.genre,
            filePath: req.file.path,
            uploadedBy: req.user._id
        });
        await music.save();
        res.status(201).send(music);
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).send({ error: error.message });
    }
};

exports.getAllMusic = async (req, res) => {
    try {
        const music = await Music.find({});
        res.send(music);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getMusicById = async (req, res) => {
    try {
        const music = await Music.findById(req.params.musicId);
        if (!music) {
            return res.status(404).send({ error: 'Music not found.' });
        }
        res.send(music);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updateMusic = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'artist', 'album', 'genre'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const music = await Music.findById(req.params.musicId);
        if (!music) {
            return res.status(404).send({ error: 'Music not found.' });
        }
        if (music.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to update this music.' });
        }

        updates.forEach((update) => music[update] = req.body[update]);
        await music.save();
        res.send(music);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.deleteMusic = async (req, res) => {
    try {
        const music = await Music.findById(req.params.musicId);
        if (!music) {
            return res.status(404).send({ error: 'Music not found.' });
        }
        if (music.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to delete this music.' });
        }

        await music.deleteOne();
        fs.unlinkSync(music.filePath);

        res.send({ message: 'Music deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.streamMusic = (req, res) => {
    const musicId = req.params.musicId;
    Music.findById(musicId)
        .then(music => {
            if (!music) {
                return res.status(404).send({ error: 'Music not found.' });
            }
            const filePath = music.filePath;
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = (end - start) + 1;
                const file = fs.createReadStream(filePath, { start, end });
                const head = {
                    'Content-Range': \`bytes ${start}-${end}/\${fileSize}\`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'audio/mpeg',
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'audio/mpeg',
                };
                res.writeHead(200, head);
                fs.createReadStream(filePath).pipe(res);
            }
        })
        .catch(error => {
            res.status(500).send({ error: error.message });
        });
};
EOF

cat <<EOF > controllers/playlist.controller.js
// controllers/playlist.controller.js
const Playlist = require('../models/playlist.model');
const Music = require('../models/music.model'); // Import Music model

exports.createPlaylist = async (req, res) => {
    try {
        const playlist = new Playlist({
            ...req.body,
            createdBy: req.user._id
        });
        await playlist.save();
        res.status(201).send(playlist);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({}).populate('music'); // Populate music details
        res.send(playlists);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId).populate('music').populate('createdBy', 'username email'); // Populate music and creator details
        if (!playlist) {
            return res.status(404).send({ error: 'Playlist not found.' });
        }
        res.send(playlist);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updatePlaylist = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const playlist = await Playlist.findById(req.params.playlistId);
        if (!playlist) {
            return res.status(404).send({ error: 'Playlist not found.' });
        }
        if (playlist.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to update this playlist.' });
        }

        updates.forEach((update) => playlist[update] = req.body[update]);
        await playlist.save();
        res.send(playlist);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId);
        if (!playlist) {
            return res.status(404).send({ error: 'Playlist not found.' });
        }
        if (playlist.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to delete this playlist.' });
        }

        await playlist.deleteOne();
        res.send({ message: 'Playlist deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.addMusicToPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId);
        const musicIdToAdd = req.body.musicId; // Expecting musicId in request body

        if (!playlist) {
            return res.status(404).send({ error: 'Playlist not found.' });
        }
        if (playlist.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to modify this playlist.' });
        }

        const music = await Music.findById(musicIdToAdd); // Check if music exists
        if (!music) {
            return res.status(404).send({ error: 'Music track not found.' });
        }

        if (!playlist.music.includes(musicIdToAdd)) {
            playlist.music.push(musicIdToAdd);
            await playlist.save();
            res.send(playlist);
        } else {
            res.status(400).send({ error: 'Music track already in playlist.' });
        }

    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.removeMusicFromPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId);
        const musicIdToRemove = req.params.musicId;

        if (!playlist) {
            return res.status(404).send({ error: 'Playlist not found.' });
        }
        if (playlist.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to modify this playlist.' });
        }

        playlist.music = playlist.music.filter(id => id.toString() !== musicIdToRemove);
        await playlist.save();
        res.send(playlist);

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};
EOF

# --- 8. Create routes ---
echo "Creating routes..."
mkdir routes

cat <<EOF > routes/auth.routes.js
// routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware.authenticate, authController.logout); // Logout needs auth to ensure token invalidation if implemented server-side
router.get('/me', authMiddleware.authenticate, authController.getMe);

module.exports = router;
EOF

cat <<EOF > routes/music.routes.js
// routes/music.routes.js
const express = require('express');
const musicController = require('../controllers/music.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});
const upload = multer({ storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

router.post('/', authMiddleware.authenticate, upload.single('audioFile'), musicController.uploadMusic);
router.get('/', musicController.getAllMusic);
router.get('/:musicId', musicController.getMusicById);
router.put('/:musicId', authMiddleware.authenticate, musicController.updateMusic);
router.delete('/:musicId', authMiddleware.authenticate, musicController.deleteMusic);
router.get('/:musicId/stream', musicController.streamMusic);

module.exports = router;
EOF

cat <<EOF > routes/playlist.routes.js
// routes/playlist.routes.js
const express = require('express');
const playlistController = require('../controllers/playlist.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware.authenticate, playlistController.createPlaylist);
router.get('/', playlistController.getAllPlaylists);
router.get('/:playlistId', playlistController.getPlaylistById);
router.put('/:playlistId', authMiddleware.authenticate, playlistController.updatePlaylist);
router.delete('/:playlistId', authMiddleware.authenticate, playlistController.deletePlaylist);
router.post('/:playlistId/music', authMiddleware.authenticate, playlistController.addMusicToPlaylist);
router.delete('/:playlistId/music/:musicId', authMiddleware.authenticate, playlistController.removeMusicFromPlaylist);

module.exports = router;
EOF

# --- 9. Create server.js ---
echo "Creating server.js..."
cat <<EOF > server.js
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const playlistRoutes = require('./routes/playlist.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);

app.use(errorMiddleware.errorHandler); // Error handling middleware

app.get('/', (req, res) => {
    res.send('Music Player Backend is running!');
});

app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
EOF

# --- 10. Create README.md ---
echo "Creating README.md..."
cat <<EOF > README.md
# Music Player Backend

Backend for a web-based music player application.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for Authentication

## Setup

1.  **Install Dependencies:** \`npm install\`
2.  **Configure .env:**
    - Set \`MONGODB_URI\` to your MongoDB connection string.
    - Set \`JWT_SECRET\` to a strong secret key.
3.  **Run the server:** \`node server.js\` or \`nodemon server.js\` for development.

## API Endpoints

(List API endpoints here as you develop them)

## File Structure

\`\`\`
(Paste the file structure from above here for clarity)
\`\`\`

## Further Development

(Notes on future features or improvements)
EOF

# --- Completion Message ---
echo -e "\nBackend project structure and files created successfully!"
echo -e "\nTo run the backend:"
echo -e "1.  Make sure MongoDB is running and update MONGODB_URI in .env if needed."
echo -e "2.  Replace 'YOUR_VERY_SECRET_KEY' in .env with a strong secret key."
echo -e "3.  Run: npm install"
echo -e "4.  Run: node server.js  (or nodemon server.js for development)"
echo -e "\nYou can now start building the frontend and connecting it to this backend API."

exit 0