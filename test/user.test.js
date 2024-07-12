const request = require("supertest");
const app = require("../index");
const serverUtils = require("../server");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
require("dotenv/config");


////test db connection
beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Health_App",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Database Connection", () => {
  test("Should connect to the database", async () => {
    await new Promise((resolve) => {
      mongoose.connection.on("connected", () => {
        resolve();
      });
    });

    expect(mongoose.connection.readyState).toBe(1);
  });
});

///test routes

describe("GET /users", () => {
  test("should return a list of users", async () => {
    const response = await request(app).get("/api/v1/users");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });
});

//2

describe("POST /users/register", () => {
  test("should register a new user", async () => {
    const newUser = {
      fullname: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
      isAdmin: false,
    };

    const response = await request(app)
      .post("/api/v1/users/register")
      .send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.fullname).toBe(newUser.fullname);
    expect(response.body.email).toBe(newUser.email);
  });
});

///3

describe("POST /users/login", () => {
  test("should return a token if login is successful", async () => {
    const existingUser = {
      email: "yazid2.firas@esprit.tn",
      password: "maman",
    };

     User.findOne = jest.fn().mockResolvedValue({
      email: existingUser.email,
      passwordHash: bcrypt.hashSync(existingUser.password, 10),
      isAdmin: false,
    });

    const response = await request(app)
      .post("/api/v1/users/login")
      .send(existingUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});

afterAll(async () => {
  await serverUtils.closeServer();
});
