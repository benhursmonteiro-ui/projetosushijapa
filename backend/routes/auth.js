import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-jwt-super-segura-aqui';

// Login com credenciais completas (username + password)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      partnerId: user.partner_id,
      isPartner: user.is_partner
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: payload
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao autenticar.' });
  }
});

// Obter dados do usuário logado via token
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
