const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const App = require("../app");
require("dotenv").config();

chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication", function () {
  this.timeout(30000); // tăng timeout tổng cho toàn bộ suite
  let appInstance;

  before(async () => {
    appInstance = new App();
    await appInstance.connectDB();

    // Dọn dẹp database để tránh trùng user test
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log("🧹 Database cleaned before tests");
    }
  });

  after(async () => {
    // Dọn lại sau test
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await appInstance.disconnectDB();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await chai
        .request(appInstance.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username", "testuser");
    });

    it("should return an error if the username is already taken", async () => {
      const res = await chai
        .request(appInstance.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username already taken");
    });
  });

  describe("POST /login", () => {
    it("should return a JWT token for a valid user", async () => {
      const res = await chai
        .request(appInstance.app)
        .post("/login")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("should return an error for an invalid user", async () => {
      const res = await chai
        .request(appInstance.app)
        .post("/login")
        .send({ username: "invaliduser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message");
    });

    it("should return an error for an incorrect password", async () => {
      const res = await chai
        .request(appInstance.app)
        .post("/login")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message");
    });
  });
});
