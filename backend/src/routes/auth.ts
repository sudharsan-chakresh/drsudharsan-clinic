import express from "express";
import { randomBytes } from "crypto";
import { query } from "../db";
import { hashPassword, verifyPassword } from "../auth";

export const authRouter = express.Router();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

const tokens = new Map<string, number>();

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

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

authRouter.get("/users", async (req, res) => {
  try {
    const result = await query("SELECT id, email, name, role, phone, created_at FROM users");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

authRouter.post("/users", async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role required" });
    }

    const created_at = new Date().toISOString();
    const hashedPassword = hashPassword(password);
    await query(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [email, hashedPassword, name, role, phone || null, created_at]
    );
    res.json({ success: true, message: "User created" });
  } catch (error: any) {
    if (error.message.includes("unique constraint") || error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

authRouter.get("/users/:id", async (req, res) => {
  try {
    const result = await query("SELECT id, email, name, role, phone, created_at FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

authRouter.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) tokens.delete(token);
  res.json({ success: true, message: "Logged out" });
});

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, guardian, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    const created_at = new Date().toISOString();
    const hashedPassword = hashPassword(password);
    await query(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [email, hashedPassword, name, "Patient", phone || null, created_at]
    );
    res.json({ success: true, message: "Registration successful" });
  } catch (error: any) {
    if (error.message.includes("unique constraint") || error.code === "23505") {
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
