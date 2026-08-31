import express from "express";
import { randomBytes } from "crypto";
import { db } from "../db";
import { User } from "../types";
import { hashPassword, verifyPassword } from "../auth";

export const authRouter = express.Router();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

const tokens = new Map<string, number>();

authRouter.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken();
    tokens.set(token, user.id);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

authRouter.get("/users", (req, res) => {
  try {
    const users = db.prepare("SELECT id, email, name, role, phone, created_at FROM users").all() as Omit<User, "password">[];
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

authRouter.post("/users", (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role required" });
    }

    const created_at = new Date().toISOString();
    const hashedPassword = hashPassword(password);
    const stmt = db.prepare(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );

    stmt.run(email, hashedPassword, name, role, phone || null, created_at);
    res.json({ success: true, message: "User created" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

authRouter.get("/users/:id", (req, res) => {
  try {
    const user = db.prepare("SELECT id, email, name, role, phone, created_at FROM users WHERE id = ?").get(req.params.id) as Omit<User, "password"> | undefined;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

authRouter.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) tokens.delete(token);
  res.json({ success: true, message: "Logged out" });
});

authRouter.post("/register", (req, res) => {
  try {
    const { name, email, password, guardian, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    const created_at = new Date().toISOString();
    const hashedPassword = hashPassword(password);
    const stmt = db.prepare(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );

    stmt.run(email, hashedPassword, name, "Patient", phone || null, created_at);
    res.json({ success: true, message: "Registration successful" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

export function authenticate(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = tokens.get(token);
  next();
}
