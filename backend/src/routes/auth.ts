import express from "express";
import { db } from "../db";
import { User } from "../types";

export const authRouter = express.Router();

// Login endpoint
authRouter.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as User | undefined;

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get all users (Admin only)
authRouter.get("/users", (req, res) => {
  try {
    const users = db.prepare("SELECT id, email, name, role, phone, created_at FROM users").all() as Omit<User, "password">[];
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create new user (Admin only)
authRouter.post("/users", (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role required" });
    }

    const created_at = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );

    stmt.run(email, password, name, role, phone || null, created_at);
    res.json({ success: true, message: "User created" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get user by ID
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

// Logout endpoint (client-side mainly, but good to have)
authRouter.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});
