const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.'
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };