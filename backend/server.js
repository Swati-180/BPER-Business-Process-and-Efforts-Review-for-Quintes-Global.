require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
<<<<<<< HEAD
app.use('/api/admin', require('./routes/adminRoutes'));
=======
>>>>>>> target/main
app.use('/api/eper/activities', require('./routes/activityRoutes'));
app.use('/api/eper/wdt', require('./routes/wdtRoutes'));
app.use('/api/eper/sixbysix', require('./routes/sixBySixRoutes'));
app.use('/api/eper/fitment', require('./routes/fitmentRoutes'));
app.use('/api/eper/reports', require('./routes/reportsRoutes'));
app.use('/api/eper/ai', require('./routes/aiRoutes'));
app.use('/api/eper/settings', require('./routes/settingsRoutes'));

<<<<<<< HEAD
// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 ePER Backend running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
=======
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // In-memory fallback if no Mongo running
    let mongod = null;
    try {
       await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
       console.log('✅ Connected to MongoDB via MONGO_URI');
    } catch(err) {
       console.log('⚠️ Failed connecting to local MongoDB! Launching in-memory DB...');
       mongod = await MongoMemoryServer.create();
       mongoUri = mongod.getUri();
       await mongoose.connect(mongoUri);
       console.log('✅ Connected to In-Memory MongoDB');
       
       // Because it's an empty DB, auto-seed the users
       const User = require('./models/User');
await User.create({name: 'Admin', email: 'admin@qgtools.in', password: 'Admin@1234', role: 'admin', status: 'active', isActive: true});
await User.create({name: 'Employee', email: 'employee@qgtools.in', password: 'Employee@1234', role: 'employee', status: 'active', isActive: true});
       console.log('✅ Dummy Auth Users Auto-Seeded.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 ePER Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
>>>>>>> target/main

module.exports = app;
