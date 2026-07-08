import express from 'express';
import db from '../db/index.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to map DB Cashier History to Frontend
const mapDbToCashierHistory = (h) => ({
  closedAt: h.closed_at,
  openedBy: h.opened_by,
  closedBy: h.closed_by,
  initialBalance: Number(h.initial_balance),
  expectedBalance: Number(h.expected_balance),
  actualBalance: Number(h.actual_balance),
  difference: Number(h.difference),
  salesTotal: Number(h.sales_total)
});

// Helper to map DB Cashier to Frontend
const mapDbToCashier = (c) => ({
  isOpen: c.is_open,
  openedBy: c.opened_by,
  openedAt: c.opened_at,
  initialBalance: Number(c.initial_balance),
  transactions: c.transactions
});

// ─── CASHIER ENDPOINTS ───
router.get('/cashier', authMiddleware, requireRole(['Sócio', 'Gerente', 'Caixa']), async (req, res) => {
  try {
    const cashierResult = await db.query('SELECT * FROM cashier WHERE id = 1');
    const historyResult = await db.query('SELECT * FROM cashier_history ORDER BY closed_at DESC');
    
    if (cashierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de caixa não inicializado.' });
    }

    const c = cashierResult.rows[0];
    const history = historyResult.rows.map(mapDbToCashierHistory);

    res.json({
      isOpen: c.is_open,
      openedBy: c.opened_by,
      openedAt: c.opened_at,
      initialBalance: Number(c.initial_balance),
      transactions: c.transactions,
      history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter dados do caixa.' });
  }
});

router.put('/cashier/open', authMiddleware, requireRole(['Sócio', 'Gerente', 'Caixa']), async (req, res) => {
  const { balance, openedBy, openedAt } = req.body;
  if (balance === undefined) {
    return res.status(400).json({ error: 'Saldo inicial é obrigatório.' });
  }

  try {
    const userOp = openedBy || req.user.name;
    const timeOp = openedAt || new Date().toLocaleString('pt-BR');

    await db.query(
      `UPDATE cashier SET 
        is_open = true, 
        opened_by = $1, 
        opened_at = $2, 
        initial_balance = $3, 
        transactions = '[]'::jsonb 
      WHERE id = 1`,
      [userOp, timeOp, Number(balance)]
    );

    res.json({
      success: true,
      cashier: {
        isOpen: true,
        openedBy: userOp,
        openedAt: timeOp,
        initialBalance: Number(balance),
        transactions: []
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao abrir caixa.' });
  }
});

router.put('/cashier/close', authMiddleware, requireRole(['Sócio', 'Gerente', 'Caixa']), async (req, res) => {
  const {
    closedAt,
    openedBy,
    closedBy,
    initialBalance,
    expectedBalance,
    actualBalance,
    difference,
    salesTotal
  } = req.body;

  try {
    // 1. Inserir fechamento no histórico
    await db.query(
      `INSERT INTO cashier_history 
        (closed_at, opened_by, closed_by, initial_balance, expected_balance, actual_balance, difference, sales_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        closedAt || new Date().toLocaleString('pt-BR'),
        openedBy,
        closedBy || req.user.name,
        Number(initialBalance),
        Number(expectedBalance),
        Number(actualBalance),
        Number(difference),
        Number(salesTotal)
      ]
    );

    // 2. Resetar o caixa ativo
    await db.query(
      `UPDATE cashier SET 
        is_open = false, 
        transactions = '[]'::jsonb 
      WHERE id = 1`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fechar caixa.' });
  }
});

router.post('/cashier/transaction', authMiddleware, requireRole(['Sócio', 'Gerente', 'Caixa']), async (req, res) => {
  const { type, amount, reason } = req.body;
  if (!type || amount === undefined || !reason) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const txObj = {
      type,
      amount: Number(amount),
      reason,
      time,
      user: req.user.name
    };

    await db.query(
      `UPDATE cashier SET 
        transactions = transactions || jsonb_build_array($1::jsonb) 
      WHERE id = 1`,
      [JSON.stringify(txObj)]
    );

    res.json({ success: true, transaction: txObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar movimentação no caixa.' });
  }
});

// ─── EXPENSES ENDPOINTS ───
router.get('/expenses', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY date DESC, time DESC');
    res.json(result.rows.map(e => ({
      id: e.id,
      date: e.date,
      time: e.time,
      responsible: e.responsible,
      partnerId: e.partner_id,
      supplier: e.supplier,
      category: e.category,
      paymentMethod: e.payment_method,
      notes: e.notes,
      items: e.items,
      total: Number(e.total),
      attachment: e.attachment
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter despesas.' });
  }
});

router.post('/expenses', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { date, time, responsible, supplier, category, paymentMethod, notes, items, total, attachment } = req.body;
  if (!supplier || !category || !paymentMethod || total === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const id = `exp-${Date.now()}`;
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];
  const timeStr = time || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const resp = responsible || req.user.name;
  const pId = req.user.partnerId || null;

  try {
    await db.query(
      `INSERT INTO expenses 
        (id, date, time, responsible, partner_id, supplier, category, payment_method, notes, items, total, attachment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        dateStr,
        timeStr,
        resp,
        pId,
        supplier,
        category,
        paymentMethod,
        notes || '',
        JSON.stringify(items || []),
        Number(total),
        attachment || null
      ]
    );

    res.json({
      success: true,
      expense: {
        id,
        date: dateStr,
        time: timeStr,
        responsible: resp,
        partnerId: pId,
        supplier,
        category,
        paymentMethod,
        notes,
        items,
        total: Number(total),
        attachment
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar despesa.' });
  }
});

router.delete('/expenses/:id', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { id } = req.params;
  try {
    const expResult = await db.query('SELECT total, supplier FROM expenses WHERE id = $1', [id]);
    if (expResult.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada.' });
    }
    await db.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.json({ success: true, expense: expResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir despesa.' });
  }
});

// ─── INVESTMENTS ENDPOINTS ───
router.get('/investments', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM investments ORDER BY date DESC');
    res.json(result.rows.map(i => ({
      id: i.id,
      date: i.date,
      description: i.description,
      category: i.category,
      value: Number(i.value),
      responsible: i.responsible,
      partnerId: i.partner_id,
      notes: i.notes
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter investimentos.' });
  }
});

router.post('/investments', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const { date, description, category, value, responsible, notes } = req.body;
  if (!description || !category || value === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const id = `inv-${Date.now()}`;
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];
  const resp = responsible || req.user.name;
  const pId = req.user.partnerId || null;

  try {
    await db.query(
      `INSERT INTO investments 
        (id, date, description, category, value, responsible, partner_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, dateStr, description, category, Number(value), resp, pId, notes || '']
    );

    res.json({
      success: true,
      investment: {
        id,
        date: dateStr,
        description,
        category,
        value: Number(value),
        responsible: resp,
        partnerId: pId,
        notes
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar investimento.' });
  }
});

router.delete('/investments/:id', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const { id } = req.params;
  try {
    const invResult = await db.query('SELECT description FROM investments WHERE id = $1', [id]);
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Investimento não encontrado.' });
    }
    await db.query('DELETE FROM investments WHERE id = $1', [id]);
    res.json({ success: true, investment: invResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir investimento.' });
  }
});

// ─── WITHDRAWALS ENDPOINTS ───
router.get('/withdrawals', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM withdrawals ORDER BY date DESC, time DESC');
    res.json(result.rows.map(w => ({
      id: w.id,
      date: w.date,
      time: w.time,
      partnerId: w.partner_id,
      partnerName: w.partner_name,
      value: Number(w.value),
      reason: w.reason
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter retiradas.' });
  }
});

router.post('/withdrawals', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const { date, time, partnerId, partnerName, value, reason } = req.body;
  if (value === undefined || !reason) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const id = `wd-${Date.now()}`;
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];
  const timeStr = time || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const pId = partnerId || req.user.partnerId;
  const pName = partnerName || req.user.name;

  try {
    await db.query(
      `INSERT INTO withdrawals 
        (id, date, time, partner_id, partner_name, value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, dateStr, timeStr, pId, pName, Number(value), reason]
    );

    res.json({
      success: true,
      withdrawal: {
        id,
        date: dateStr,
        time: timeStr,
        partnerId: pId,
        partnerName: pName,
        value: Number(value),
        reason
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar retirada.' });
  }
});

export default router;
