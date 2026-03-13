import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'premium',
    photo_url TEXT,
    appointment_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    casual_name TEXT,
    casual_phone TEXT,
    service_id INTEGER,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'pending',
    price_charged REAL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    slots TEXT -- JSON array of available hours
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    rating INTEGER,
    comment TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const admin = db.prepare("SELECT * FROM users WHERE phone = ?").get("admin");
if (!admin) {
  db.prepare("INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)").run("admin", "admin123", "Administradora", "admin");
}

// Seed default services if empty
const serviceCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
if (serviceCount.count === 0) {
  db.prepare("INSERT INTO services (name, description, image_url) VALUES (?, ?, ?)").run(
    "Pestañas Clásicas", 
    "Técnica de aplicación pelo a pelo para un look natural y elegante. Ideal para el día a día.",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800"
  );
  db.prepare("INSERT INTO services (name, description, image_url) VALUES (?, ?, ?)").run(
    "Volumen Ruso", 
    "Máxima densidad y drama para una mirada impactante. Perfecto para eventos especiales.",
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { phone, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ? AND password = ?").get(phone, password) as any;
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { phone, password, name } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)").run(phone, password, name, 'premium');
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as any;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (e) {
      res.status(400).json({ error: "El teléfono ya está registrado" });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { name, phone, photo_url } = req.body;
    db.prepare("UPDATE users SET name = ?, phone = ?, photo_url = ? WHERE id = ?").run(name, phone, photo_url, req.params.id);
    res.json({ success: true });
  });

  // Services
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { name, description, image_url } = req.body;
    db.prepare("INSERT INTO services (name, description, image_url) VALUES (?, ?, ?)").run(name, description, image_url);
    res.json({ success: true });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Availability
  app.get("/api/availability/:date", (req, res) => {
    const row = db.prepare("SELECT slots FROM availability WHERE date = ?").get(req.params.date) as any;
    res.json(row ? JSON.parse(row.slots) : []);
  });

  app.post("/api/availability", (req, res) => {
    const { date, slots } = req.body;
    db.prepare("INSERT OR REPLACE INTO availability (date, slots) VALUES (?, ?)").run(date, JSON.stringify(slots));
    res.json({ success: true });
  });

  // Appointments
  app.get("/api/appointments", (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, s.name as service_name, u.name as user_name 
      FROM appointments a 
      LEFT JOIN services s ON a.service_id = s.id 
      LEFT JOIN users u ON a.user_id = u.id
    `).all();
    res.json(appointments);
  });

  app.post("/api/appointments", (req, res) => {
    const { user_id, casual_name, casual_phone, service_id, date, time } = req.body;
    db.prepare("INSERT INTO appointments (user_id, casual_name, casual_phone, service_id, date, time) VALUES (?, ?, ?, ?, ?, ?)")
      .run(user_id || null, casual_name || null, casual_phone || null, service_id, date, time);
    res.json({ success: true });
  });

  app.put("/api/appointments/:id/complete", (req, res) => {
    const { price_charged } = req.body;
    const appointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id) as any;
    
    db.prepare("UPDATE appointments SET status = 'completed', price_charged = ? WHERE id = ?").run(price_charged, req.params.id);
    
    if (appointment.user_id) {
      db.prepare("UPDATE users SET appointment_count = appointment_count + 1 WHERE id = ?").run(appointment.user_id);
    }
    res.json({ success: true });
  });

  // Financials
  app.get("/api/financials", (req, res) => {
    const rows = db.prepare("SELECT date, price_charged FROM appointments WHERE status = 'completed'").all() as any[];
    res.json(rows);
  });

  // Promotions (Admin view of premium users)
  app.get("/api/promotions", (req, res) => {
    const users = db.prepare("SELECT id, name, phone, appointment_count FROM users WHERE role = 'premium'").all();
    res.json(users);
  });

  // Reviews
  app.get("/api/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name, u.photo_url 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id
      ORDER BY r.date DESC
    `).all();
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { user_id, rating, comment } = req.body;
    db.prepare("INSERT INTO reviews (user_id, rating, comment, date) VALUES (?, ?, ?, ?)")
      .run(user_id, rating, comment, new Date().toISOString());
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
