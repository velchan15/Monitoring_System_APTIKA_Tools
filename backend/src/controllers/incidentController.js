const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mengambil seluruh daftar insiden
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: { application: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mengambil detail insiden berdasarkan ID
exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { application: true }
    });
    if (!incident) return res.status(404).json({ message: "Insiden tidak ditemukan" });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Membuat laporan insiden baru (POST /api/incidents)
exports.createIncident = async (req, res) => {
  try {
    const { appId, ticketNumber, opdName, severity, startedAt, duration, rootCause, initialNote } = req.body;
    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    
    const timeline = initialNote 
      ? [{ time: nowStr, note: initialNote }] 
      : [{ time: nowStr, note: "Insiden terdeteksi oleh sistem monitoring." }];

    const newIncident = await prisma.incident.create({
      data: {
        ticketNumber,
        appId,
        opdName,
        severity: severity || "critical",
        status: "active",
        startedAt: startedAt || nowStr,
        duration: duration || "0m",
        rootCause,
        timeline
      }
    });
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Memperbarui status / menambah catatan penanganan (PUT /api/incidents/:id/status)
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ message: "Insiden tidak ditemukan" });

    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    let updatedTimeline = [...incident.timeline];

    if (note) {
      updatedTimeline.push({ time: nowStr, note });
    } else if (status === "resolved" && incident.status !== "resolved") {
      updatedTimeline.push({ time: nowStr, note: "Insiden diselesaikan oleh operator." });
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status: status || incident.status,
        timeline: updatedTimeline,
        duration: status === "resolved" ? "Selesai" : incident.duration
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Membuat laporan insiden baru (POST /api/incidents)
exports.createIncident = async (req, res) => {
  try {
    // Ubah appId menjadi applicationId agar sesuai dengan input
    const { applicationId, ticketNumber, opdName, severity, startedAt, duration, rootCause, initialNote } = req.body;
    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    
    const timeline = initialNote 
      ? [{ time: nowStr, note: initialNote }] 
      : [{ time: nowStr, note: "Insiden terdeteksi oleh sistem monitoring." }];

    const newIncident = await prisma.incident.create({
      data: {
        ticketNumber,
        applicationId: Number(applicationId), // Hubungkan menggunakan applicationId
        opdName,
        severity: severity || "critical",
        status: "active",
        startedAt: startedAt || nowStr,
        duration: duration || "0m",
        rootCause,
        timeline
      }
    });
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};