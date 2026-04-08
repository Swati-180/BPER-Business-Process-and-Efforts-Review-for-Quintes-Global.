require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding users.");

    await User.deleteMany({});
    
    await User.create({
      name: "Admin User",
      email: "admin@qgtools.in",
      password: "Admin@1234",
      role: "admin",
      isActive: true
    });

    await User.create({
      name: "Standard Employee",
      email: "employee@qgtools.in",
      password: "Employee@1234",
      role: "employee",
      isActive: true
    });

    console.log("Users seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding users:", err);
    process.exit(1);
  }
}

seedUsers();
