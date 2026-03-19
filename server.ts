import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";

const MONGO_URI = "mongodb://nataliahernandez3112_db_user:5mDm1LW6PZN7kuor@ac-d5ynhin-shard-00-00.lzmvwzv.mongodb.net:27017,ac-d5ynhin-shard-00-01.lzmvwzv.mongodb.net:27017,ac-d5ynhin-shard-00-02.lzmvwzv.mongodb.net:27017/natalia?ssl=true&authSource=admin&replicaSet=atlas-iulro6-shard-0";

// Mongoose config
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error. Por favor asegúrate de que tu IP esté permitida en MongoDB Atlas (Network Access -> Allow from Anywhere). Error:', err.message);
  });

// Schemas
const User = mongoose.model('User', new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: 'premium' },
  photo_url: String,
  appointment_count: { type: Number, default: 0 }
}));

const Service = mongoose.model('Service', new mongoose.Schema({
  name: String,
  description: String,
  image_url: String,
  price: Number
}));

const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  casual_name: String,
  casual_phone: String,
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  date: String,
  time: String,
  status: { type: String, default: 'pending' },
  price_charged: Number
}));

const Availability = mongoose.model('Availability', new mongoose.Schema({
  date: { type: String, unique: true },
  slots: [String]
}));

const PasswordReset = mongoose.model('PasswordReset', new mongoose.Schema({
  phone: { type: String, unique: true },
  code: String,
  expires_at: Date
}));

const Review = mongoose.model('Review', new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  date: String
}));

async function seedDatabase() {
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    await User.create({ phone: "3233597721", password: "3112", name: "natalia hernandez", role: "admin" });
  } else {
    await User.updateOne({ role: "admin" }, { phone: "3233597721", password: "3112" });
  }

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.create({
      name: "Pestañas Clásicas", 
      description: "Técnica de aplicación pelo a pelo para un look natural y elegante. Ideal para el día a día.",
      image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800",
      price: 50000
    });
    await Service.create({
      name: "Volumen Ruso", 
      description: "Máxima densidad y drama para una mirada impactante. Perfecto para eventos especiales.",
      image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
      price: 80000
    });
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, password });
    if (user) {
      const userJson = user.toJSON() as any;
      delete userJson.password;
      res.json(userJson);
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    const { phone, password, name } = req.body;
    try {
      const user = await User.create({ phone, password, name, role: 'premium' });
      const userJson = user.toJSON() as any;
      delete userJson.password;
      res.json(userJson);
    } catch (e) {
      res.status(400).json({ error: "El teléfono ya está registrado" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: "No existe un usuario con este teléfono" });
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const expires_at = new Date(Date.now() + 15 * 60000); // 15 mins
    await PasswordReset.findOneAndUpdate({ phone }, { code, expires_at }, { upsert: true });

    console.log(`\n========================================`);
    console.log(`📲 MOCK WHATSAPP MESSAGE TO: ${phone}`);
    console.log(`Tu código de recuperación es: ${code}`);
    console.log(`========================================\n`);

    res.json({ success: true, message: "Código creado" });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { phone, code, newPassword } = req.body;
    const reset = await PasswordReset.findOne({ phone, code });
    if (!reset) {
      return res.status(400).json({ error: "Código incorrecto" });
    }
    if (new Date(reset.expires_at as any) < new Date()) {
      return res.status(400).json({ error: "El código ha expirado" });
    }
    await User.updateOne({ phone }, { password: newPassword });
    await PasswordReset.deleteOne({ phone });
    res.json({ success: true, message: "Contraseña actualizada" });
  });

  app.get("/api/auth/reset-codes", async (req, res) => {
    await PasswordReset.deleteMany({ expires_at: { $lt: new Date() } });
    const codesDocs = await PasswordReset.find().sort({ expires_at: -1 }).lean();
    
    // Attach user names manually (or could use aggregate)
    const codesWithNames = await Promise.all(codesDocs.map(async doc => {
      const u = await User.findOne({ phone: doc.phone });
      return { ...doc, name: u?.name || '' };
    }));
    
    res.json(codesWithNames);
  });

  app.put("/api/users/:id", async (req, res) => {
    const { name, phone, photo_url } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, phone, photo_url });
    res.json({ success: true });
  });

  // Services
  app.get("/api/services", async (req, res) => {
    res.json(await Service.find());
  });

  app.post("/api/services", async (req, res) => {
    await Service.create({ ...req.body, price: req.body.price || 0 });
    res.json({ success: true });
  });

  app.delete("/api/services/:id", async (req, res) => {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/services/:id", async (req, res) => {
    await Service.findByIdAndUpdate(req.params.id, { ...req.body, price: req.body.price || 0 });
    res.json({ success: true });
  });

  // Availability
  app.get("/api/availability/:date", async (req, res) => {
    const doc = await Availability.findOne({ date: req.params.date });
    res.json(doc ? doc.slots : []);
  });

  app.post("/api/availability", async (req, res) => {
    const { date, slots } = req.body;
    await Availability.findOneAndUpdate({ date }, { slots }, { upsert: true });
    res.json({ success: true });
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    const apps = await Appointment.find().populate('user_id').populate('service_id');
    // Map to expected format
    const results = apps.map((a: any) => {
      const json = a.toJSON();
      json.user_name = a.user_id?.name || json.casual_name || null;
      json.service_name = a.service_id?.name || null;
      // Flatten references for the UI
      json.user_id = a.user_id?._id || a.user_id?.id || null;
      json.service_id = a.service_id?._id || a.service_id?.id || null;
      return json;
    });
    res.json(results);
  });

  app.post("/api/appointments", async (req, res) => {
    const { user_id, casual_name, casual_phone, service_id, date, time } = req.body;
    await Appointment.create({
      user_id: user_id || null, 
      casual_name, 
      casual_phone, 
      service_id, 
      date, 
      time
    });
    res.json({ success: true });
  });

  app.put("/api/appointments/:id/complete", async (req, res) => {
    const { price_charged } = req.body;
    const app = await Appointment.findByIdAndUpdate(req.params.id, { status: 'completed', price_charged });
    if (app && app.user_id) {
      await User.findByIdAndUpdate(app.user_id, { $inc: { appointment_count: 1 } });
    }
    res.json({ success: true });
  });

  // Financials
  app.get("/api/financials", async (req, res) => {
    const rows = await Appointment.find({ status: 'completed' }, 'date price_charged');
    res.json(rows);
  });

  // Promotions
  app.get("/api/promotions", async (req, res) => {
    res.json(await User.find({ role: 'premium' }, 'name phone appointment_count photo_url'));
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    const revs = await Review.find().sort({ date: -1 }).populate('user_id');
    res.json(revs.map((r: any) => {
      const json = r.toJSON();
      json.user_name = r.user_id?.name;
      json.photo_url = r.user_id?.photo_url;
      json.user_id = r.user_id?._id || r.user_id?.id;
      return json;
    }));
  });

  app.post("/api/reviews", async (req, res) => {
    await Review.create({ ...req.body, date: new Date().toISOString() });
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE (Only in dev) ---
  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
      app.listen(3000, "0.0.0.0", () => {
        console.log("Server running on http://localhost:3000");
      });
    });
  }

export default app;
