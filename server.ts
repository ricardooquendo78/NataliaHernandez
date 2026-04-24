import express from "express";

import path from "path";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://nataliahernandez3112_db_user:5mDm1LW6PZN7kuor@ac-d5ynhin-shard-00-00.lzmvwzv.mongodb.net:27017,ac-d5ynhin-shard-00-01.lzmvwzv.mongodb.net:27017,ac-d5ynhin-shard-00-02.lzmvwzv.mongodb.net:27017/natalia?ssl=true&authSource=admin&replicaSet=atlas-iulro6-shard-0";

// Mongoose config
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  
  try {
    const dbUri = process.env.MONGO_URI || MONGO_URI;
    await mongoose.connect(dbUri, { family: 4 });
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
    seedDatabase();
  } catch (err: any) {
    console.error('MongoDB connection error. Por favor asegúrate de que tu IP esté permitida en MongoDB Atlas (Network Access -> Allow from Anywhere). Error:', err.message);
  }
};

connectDB();

// Schemas
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: String,
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
  email: { type: String, unique: true },
  code: String,
  expires_at: Date
}));

const Review = mongoose.model('Review', new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  date: String
}));

// Email Config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER || 'nati3112hernandez@gmail.com',
    pass: process.env.EMAIL_PASS || 'eocc sscm kstz fehv'
  },
  tls: {
    rejectUnauthorized: false // Helps in some environments
  }
});

async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromEmail = process.env.EMAIL_USER || 'nati3112hernandez@gmail.com';
  console.log(`[Email] Intentando enviar a: ${to}`);
  
  try {
    const info = await transporter.sendMail({
      from: `"Natalia Hernandez" <${fromEmail}>`,
      to,
      subject,
      html
    });
    console.log(`[Email] ✅ Enviado: ${info.response}`);
    return info;
  } catch (error: any) {
    console.error(`[Email] ❌ ERROR:`, error.message);
    throw error; // Throw so we can catch it in the routes
  }
}

function formatTimeTo12h(time24: string) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
}

async function seedDatabase() {
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    await User.create({ email: "nati3112hernandez@gmail.com", phone: "3233597721", password: "3112", name: "natalia hernandez", role: "admin" });
  } else {
    await User.updateOne({ role: "admin" }, { email: "nati3112hernandez@gmail.com", phone: "3233597721", password: "3112" });
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
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      const userJson = user.toJSON() as any;
      delete userJson.password;
      res.json(userJson);
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    const { email, phone, password, name } = req.body;
    try {
      const user = await User.create({ email, phone, password, name, role: 'premium' });
      const userJson = user.toJSON() as any;
      delete userJson.password;

      // Welcome Email
      await sendEmail({
        to: email,
        subject: "✨ Bienvenida a Natalia Hernandez",
        html: `
          <div style="font-family: sans-serif; color: #444; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #be123c; font-style: italic;">¡Hola ${name}!</h1>
            <p>Bienvenida a nuestra comunidad. Estamos felices de tenerte con nosotros.</p>
            <p>Ahora puedes agendar tus citas de pestañas de forma fácil y rápida desde nuestra plataforma.</p>
            <div style="background: #fff1f2; padding: 20px; border-radius: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Tu correo de acceso:</strong> ${email}</p>
            </div>
            <p>¡Te esperamos pronto!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">Natalia Hernandez - Especialista en Pestañas</p>
          </div>
        `
      });

      res.json(userJson);
    } catch (e) {
      res.status(400).json({ error: "El correo ya está registrado" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No existe un usuario con este correo" });
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const expires_at = new Date(Date.now() + 15 * 60000); // 15 mins
    await PasswordReset.findOneAndUpdate({ email }, { code, expires_at }, { upsert: true });

    // Send Real Email
    try {
      await sendEmail({
        to: email,
        subject: "🔑 Código de recuperación - Natalia Hernandez",
        html: `
          <div style="font-family: sans-serif; color: #444; text-align: center; padding: 40px; background: #fafafa;">
            <h2 style="color: #be123c;">Recuperación de Contraseña</h2>
            <p>Tu código de seguridad es:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1c1917; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #888;">Este código expirará en 15 minutos.</p>
          </div>
        `
      });
      res.json({ success: true, message: "Código enviado a tu correo" });
    } catch (error: any) {
      res.status(500).json({ error: "Error al enviar el correo: " + error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    const reset = await PasswordReset.findOne({ email, code });
    if (!reset) {
      return res.status(400).json({ error: "Código incorrecto" });
    }
    if (new Date(reset.expires_at as any) < new Date()) {
      return res.status(400).json({ error: "El código ha expirado" });
    }
    await User.updateOne({ email }, { password: newPassword });
    await PasswordReset.deleteOne({ email });
    res.json({ success: true, message: "Contraseña actualizada" });
  });

  app.get("/api/auth/reset-codes", async (req, res) => {
    await PasswordReset.deleteMany({ expires_at: { $lt: new Date() } });
    const codesDocs = await PasswordReset.find().sort({ expires_at: -1 }).lean();
    
    // Attach user names manually (or could use aggregate)
    const codesWithNames = await Promise.all(codesDocs.map(async doc => {
      const u = await User.findOne({ email: doc.email });
      return { ...doc, name: u?.name || '', email: doc.email };
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
      json.user_phone = a.user_id?.phone || json.casual_phone || null;
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
    const appointment = await Appointment.create({
      user_id: user_id || null, 
      casual_name, 
      casual_phone, 
      service_id, 
      date, 
      time
    });

    // Get info for email
    const user = (user_id && mongoose.isValidObjectId(user_id)) ? await User.findById(user_id) : null;
    const service = await Service.findById(service_id);
    const clientName = user?.name || casual_name || 'Cliente Casual';
    const clientEmail = user?.email;
    const serviceName = service?.name || "Servicio de Pestañas";
    const time12h = formatTimeTo12h(time);

    try {
      // Create Google Calendar Link
      const dateParts = date.replace(/-/g, '');
      const timeParts = time.replace(/:/g, '');
      const startDateTime = `${dateParts}T${timeParts}00`;
      
      // Calculate end time (2 hours later)
      const endHour = (parseInt(time.split(':')[0]) + 2).toString().padStart(2, '0');
      const endDateTime = `${dateParts}T${endHour}${time.split(':')[1]}00`;
      
      const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cita: ' + clientName)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent('Servicio: ' + serviceName + '\nTeléfono: ' + (user?.phone || casual_phone || 'No proporcionado'))}&location=${encodeURIComponent('Avenida 35 # 55 - 71 Niquia, Bello')}`;

      // Email to Admin
      await sendEmail({
        to: process.env.EMAIL_USER || "nati3112hernandez@gmail.com",
        subject: `📅 Nueva Cita: ${clientName}`,
        html: `
          <div style="font-family: sans-serif; color: #444;">
            <h2 style="color: #be123c;">¡Tienes una nueva cita!</h2>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Hora:</strong> ${time12h}</p>
            <p><strong>Teléfono:</strong> ${user?.phone || casual_phone || 'No proporcionado'}</p>
            <div style="margin-top: 25px;">
              <a href="${gCalUrl}" style="background: #1a73e8; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                📅 Añadir a Google Calendar
              </a>
            </div>
          </div>
        `
      });

      // Email to Client
      if (clientEmail) {
        await sendEmail({
          to: clientEmail,
          subject: "📅 Tu cita ha sido agendada - Natalia Hernandez",
          html: `
            <div style="font-family: sans-serif; color: #444; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
              <h2 style="color: #be123c; font-style: italic;">¡Reserva Confirmada!</h2>
              <p>Hola <strong>${clientName}</strong>, tu cita ha sido agendada correctamente.</p>
              <div style="background: #fff1f2; padding: 20px; border-radius: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceName}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Hora:</strong> ${time12h}</p>
              </div>
              <p>Recuerda llegar 5 minutos antes de tu cita. Si necesitas cancelar o reprogramar, por favor avísanos con tiempo.</p>
              <p>¡Te esperamos!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888; text-align: center;">Avenida 35 # 55 - 71 Niquia, Bello</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error("Error enviando notificaciones:", emailError);
    }

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
    res.json(await User.find({ role: 'premium' }, 'name email phone appointment_count photo_url'));
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
    const vitePkg = "vite";
    // @ts-ignore
    import(vitePkg).then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite: any) => {
        app.use(vite.middlewares);
        app.listen(3000, "0.0.0.0", () => {
          console.log("Server running on http://localhost:3000");
        });
      });
    });
  }

export default app;
