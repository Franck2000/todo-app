// src/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("./authMiddleware");
const logger = require("./logger");
const requestLogger = require("./requestLogger");

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);


// ========== ROUTES D'AUTHENTIFICATION ==========

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info("REGISTER_ATTEMPT", {
      ip: req.ip,
      email: email,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email et mot de passe sont obligatoires" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn("REGISTER_FAILED", {
        ip: req.ip,
        email: email,
        reason: "USER_ALREADY_EXISTS",
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    logger.info("REGISTER_SUCCESS", {
      ip: req.ip,
      email: email,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    return res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error(err);
    logger.error("REGISTER_ERROR", {
      ip: req.ip,
      error: err.message,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info("LOGIN_ATTEMPT", {
      ip: req.ip,
      email: email,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    // Générer un token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    logger.info("LOGIN_SUCCESS", {
      ip: req.ip,
      email,
      timestamp: new Date().toISOString()
    });
    return res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    logger.error("LOGIN_FAILURE", {
      ip: req.ip,
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// ========== ROUTES TÂCHES (PROTÉGÉES) ==========

// GET /api/tasks - liste des tâches de l'utilisateur
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST /api/tasks - créer une tâche
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Le titre est obligatoire" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        userId: req.userId,
      },
    });

    logger.info("TASK_CREATED", {
      ip: req.ip,
      taskId: task.id,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    logger.error("TASK_CREATE_ERROR", {
      ip: req.ip,
      error: err.message,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /api/tasks/:id - mettre à jour une tâche
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title, description, priority, status } = req.body;

    // Vérifier que la tâche appartient à l'utilisateur
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        status: status || task.status,
      },
    });

    logger.info("TASK_UPDATED", {
      ip: req.ip,
      taskId: task.id,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    logger.error("TASK_UPDATE_ERROR", {
      ip: req.ip,
      error: err.message,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE /api/tasks/:id - supprimer une tâche
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    logger.warn("TASK_DELETED", {
      ip: req.ip,
      taskId: req.params.id,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });

    return res.json({ message: "Tâche supprimée" });
  } catch (err) {
    console.error(err);
    logger.error("TASK_DELETE_ERROR", {
      ip: req.ip,
      error: err.message,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route simple pour tester que le serveur tourne
app.get("/", (req, res) => {
  res.send("API Todo en marche 🚀");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
