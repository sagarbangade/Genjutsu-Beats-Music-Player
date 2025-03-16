// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const trackRoutes = require("./routes/trackRoutes"); // Import track routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all origins in development, configure for production
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Routes

app.use("/api/auth", authRoutes); // Authentication routes (login, register)
app.use("/api/tracks", trackRoutes); // Track management routes (upload, get, delete)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
