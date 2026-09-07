const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, department: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        departmentId: user.departmentId
      },
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: '1d' }
    );

    // Catat ke Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `User ${user.email} berhasil login.`
      }
    });

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          department: user.department ? user.department.name : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

module.exports = { login };