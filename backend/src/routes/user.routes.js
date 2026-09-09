const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/users - Mengambil daftar pengguna
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true, department: true }
    });
    
    const formatted = users.map(u => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      username: u.username || u.email.split("@")[0],
      role: u.role?.key || "operator",
      roleLabel: u.role?.name || "Operator",
      opdCode: u.department?.code || "",
      opdName: u.department?.name || "",
      isActive: u.isActive ?? true,
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("id-ID") : "-",
      createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users - Registrasi / Tambah pengguna baru
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar di sistem." });
    }

    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const targetRole = role || "operator";

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: {
          connectOrCreate: {
            where: { name: targetRole },
            create: { name: targetRole } // Otomatis membuat data role jika belum ada
          }
        }
      },
    });

    res.status(201).json({ success: true, id: newUser.id, message: "Akun berhasil dibuat" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Gagal membuat pengguna" });
  }
});

module.exports = router;