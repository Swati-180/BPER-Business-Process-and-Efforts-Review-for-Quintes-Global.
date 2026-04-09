const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'tower_lead', 'supervisor', 'employee'],
    default: 'employee'
  },
<<<<<<< HEAD
  requestedRole: {
    type: String,
    enum: ['admin', 'tower_lead', 'supervisor', 'employee'],
    default: 'employee'
  },
=======
  requestedRole: { type: String, default: null }, // Stores raw frontend request
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'active'
  },
  employeeId: { type: String, default: '' },
>>>>>>> target/main
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'EperDepartment', default: null },
  tower: { type: mongoose.Schema.Types.ObjectId, ref: 'EperTower', default: null },
  grade: { type: String, default: '' },
  reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
<<<<<<< HEAD
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null }
=======
  isActive: { type: Boolean, default: true }
>>>>>>> target/main
}, { collection: 'eper_users', timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
<<<<<<< HEAD
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
=======
  if (!this.isModified('password')) {
    if (next) return next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  if (next && typeof next === 'function') next();
>>>>>>> target/main
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
