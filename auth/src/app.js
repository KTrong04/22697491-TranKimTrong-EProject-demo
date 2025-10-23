const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

class App {
  constructor() {
    this.app = express();
    this.authController = new AuthController();
    this.setMiddlewares();
    this.setRoutes();
  }

  async connectDB(retries = 5, delay = 5000) {
    while (retries) {
      try {
        await mongoose.connect(config.mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");
        return;
      } catch (err) {
        retries -= 1;
        console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
        if (!retries) {
          console.error("⛔ All retries failed. Exiting...");
          throw err;
        }
        await new Promise((res) => setTimeout(res, delay)); // đợi 5s trước khi thử lại
      }
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.post("/login", (req, res) => this.authController.login(req, res));
    this.app.post("/register", (req, res) => this.authController.register(req, res));
    this.app.get("/dashboard", authMiddleware, (req, res) =>
      res.json({ message: "Welcome to dashboard" })
    );
  }

  async start() {
    await this.connectDB(); // gọi retry connectDB ở đây
    this.server = this.app.listen(3000, () =>
      console.log("🚀 Server started on port 3000")
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
