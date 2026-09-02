const prisma = require('../db/prisma');

// GET ALL
const getAllApplications = async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      include: { department: true }
    });
    res.json({ success: true, data: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
const createApplication = async (req, res) => {
  try {
    const { name, url, departmentId, monitoringType } = req.body;

    let targetDepartmentId = departmentId ? parseInt(departmentId) : null;

    // Jika departmentId tidak dikirim, cari department pertama atau buat default
    if (!targetDepartmentId) {
      let dept = await prisma.department.findFirst();
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: 'Diskominfo' }
        });
      }
      targetDepartmentId = dept.id;
    }

    const newApp = await prisma.application.create({
      data: {
        name,
        url,
        monitoringType: monitoringType || 'HTTP',
        departmentId: targetDepartmentId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Aplikasi berhasil ditambahkan.',
      data: newApp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, departmentId, monitoringType } = req.body;

    const updatedApp = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        url, 
        departmentId: departmentId ? parseInt(departmentId) : undefined, 
        monitoringType 
      }
    });

    res.json({ success: true, message: 'Aplikasi berhasil diperbarui.', data: updatedApp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.application.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Aplikasi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getAllApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
};