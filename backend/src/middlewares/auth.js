const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };