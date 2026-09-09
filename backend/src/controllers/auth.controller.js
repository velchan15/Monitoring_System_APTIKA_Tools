const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Cari user beserta relasi role dan department
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        department: true
      }
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Payload token mencakup ID, email, nama role, dan departmentId
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role.name,
        departmentId: user.departmentId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        department: user.department ? user.department.name : null
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, roleId, departmentId } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        departmentId: departmentId || null
      },
      include: {
        role: true,
        department: true
      }
    });

    return res.status(201).json({
      message: 'Registrasi user berhasil',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { login, register };