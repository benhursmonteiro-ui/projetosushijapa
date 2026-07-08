import express from 'express';
import db from '../db/index.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { addAuditEntry } from '../services/audit.js';

const router = express.Router();

// Listar logs de auditoria
router.get('/', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_log ORDER BY date DESC, time DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar auditoria.' });
  }
});

// Adicionar log de auditoria avulso (para ações frontend que não têm rota específica)
router.post('/', authMiddleware, async (req, res) => {
  const { module, action } = req.body;
  if (!module || !action) {
    return res.status(400).json({ error: 'Módulo e ação são obrigatórios.' });
  }
  try {
    const entry = await addAuditEntry(module, action, req.user);
    
    // Broadcast via WebSocket
    const io = req.app.get('io');
    if (io && entry) {
      io.emit('audit_log_created', entry);
    }
    
    res.json({ success: true, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar log de auditoria.' });
  }
});

export default router;
