import express from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { addAuditEntry } from '../services/audit.js';

const router = express.Router();

const mapDbToTable = (t) => ({
  id: t.id,
  number: t.number,
  status: t.status,
  items: t.items,
  openedAt: t.opened_at,
  waiterId: t.waiter_id
});

// Listar Mesas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tables ORDER BY number ASC');
    res.json(result.rows.map(mapDbToTable));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter mesas.' });
  }
});

// Adicionar itens à mesa
router.post('/:id/items', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { newItems } = req.body;

  if (!newItems || !Array.isArray(newItems)) {
    return res.status(400).json({ error: 'Lista de itens inválida.' });
  }

  try {
    const tableRes = await db.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (tableRes.rows.length === 0) {
      return res.status(404).json({ error: 'Mesa não encontrada.' });
    }

    const table = tableRes.rows[0];
    const currentItems = table.items || [];

    newItems.forEach(ni => {
      const idx = currentItems.findIndex(i => i.id === ni.id);
      if (idx > -1) {
        currentItems[idx].quantity += ni.quantity;
      } else {
        currentItems.push({ ...ni });
      }
    });

    const nowStr = table.opened_at || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const waiterId = table.waiter_id || 'emp-4';
    const status = 'Ocupada';

    await db.query(
      'UPDATE tables SET status = $1, items = $2, opened_at = $3, waiter_id = $4 WHERE id = $5',
      [status, JSON.stringify(currentItems), nowStr, waiterId, id]
    );

    const updatedTable = {
      id,
      number: table.number,
      status,
      items: currentItems,
      openedAt: nowStr,
      waiterId
    };

    // Emitir atualização via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('table_updated', updatedTable);
    }

    res.json({ success: true, table: updatedTable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar itens à mesa.' });
  }
});

// Transferir itens de uma mesa para outra
router.post('/transfer', authMiddleware, async (req, res) => {
  const { fromId, toId } = req.body;

  if (!fromId || !toId) {
    return res.status(400).json({ error: 'ID de origem e destino são necessários.' });
  }

  try {
    const fromRes = await db.query('SELECT * FROM tables WHERE id = $1', [fromId]);
    const toRes = await db.query('SELECT * FROM tables WHERE id = $1', [toId]);

    if (fromRes.rows.length === 0 || toRes.rows.length === 0) {
      return res.status(404).json({ error: 'Uma ou ambas as mesas não foram encontradas.' });
    }

    const fromTable = fromRes.rows[0];
    const toTable = toRes.rows[0];

    if (!fromTable.items || fromTable.items.length === 0) {
      return res.status(400).json({ error: 'Mesa de origem está vazia.' });
    }

    // Mesclar itens
    const mergedItems = [...(toTable.items || [])];
    fromTable.items.forEach(ni => {
      const idx = mergedItems.findIndex(i => i.id === ni.id);
      if (idx > -1) {
        mergedItems[idx].quantity += ni.quantity;
      } else {
        mergedItems.push({ ...ni });
      }
    });

    const openedAt = toTable.opened_at || fromTable.opened_at;
    const waiterId = toTable.waiter_id || fromTable.waiter_id;

    // Atualizar destino
    await db.query(
      "UPDATE tables SET status = 'Ocupada', items = $1, opened_at = $2, waiter_id = $3 WHERE id = $4",
      [JSON.stringify(mergedItems), openedAt, waiterId, toId]
    );

    // Resetar origem
    await db.query(
      "UPDATE tables SET status = 'Livre', items = '[]'::jsonb, opened_at = NULL, waiter_id = NULL WHERE id = $1",
      [fromId]
    );

    const updatedFrom = {
      id: fromId,
      number: fromTable.number,
      status: 'Livre',
      items: [],
      openedAt: null,
      waiterId: null
    };

    const updatedTo = {
      id: toId,
      number: toTable.number,
      status: 'Ocupada',
      items: mergedItems,
      openedAt,
      waiterId
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('table_updated', updatedFrom);
      io.emit('table_updated', updatedTo);
    }

    await addAuditEntry(
      'Comandas',
      `Transferiu itens da Mesa ${fromTable.number} para Mesa ${toTable.number}`,
      req.user
    );

    res.json({ success: true, fromTable: updatedFrom, toTable: updatedTo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao transferir mesa.' });
  }
});

// Solicitar conta da mesa
router.put('/:id/bill', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT number FROM tables WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mesa não encontrada.' });
    }

    await db.query("UPDATE tables SET status = 'Conta Solicitada' WHERE id = $1", [id]);

    const io = req.app.get('io');
    if (io) {
      io.emit('table_status_changed', { id, status: 'Conta Solicitada' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao solicitar conta da mesa.' });
  }
});

// Fechar comanda e gerar pedido
router.post('/:id/close', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'Forma de pagamento é obrigatória.' });
  }

  try {
    const tableRes = await db.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (tableRes.rows.length === 0) {
      return res.status(404).json({ error: 'Mesa não encontrada.' });
    }

    const table = tableRes.rows[0];
    const items = table.items || [];

    if (items.length === 0) {
      return res.status(400).json({ error: 'Mesa não possui itens para fechamento.' });
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    // 1. Criar pedido finalizado
    const maxResult = await db.query('SELECT id FROM orders');
    let maxId = 1200;
    maxResult.rows.forEach(r => {
      const parsed = parseInt(r.id);
      if (!isNaN(parsed) && parsed > maxId) {
        maxId = parsed;
      }
    });
    const orderId = String(maxId + 1);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    await db.query(
      `INSERT INTO orders 
        (id, customer_name, phone, address, channel, type, status, payment_method, items, subtotal, delivery_fee, total, time, date, waiter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        orderId,
        `Mesa ${table.number}`,
        '',
        '',
        'Balcão',
        'Mesa',
        'Finalizado',
        paymentMethod,
        JSON.stringify(items),
        subtotal,
        0.00,
        subtotal,
        timeStr,
        dateStr,
        table.waiter_id
      ]
    );

    const newOrder = {
      id: orderId,
      customerName: `Mesa ${table.number}`,
      phone: '',
      address: '',
      channel: 'Balcão',
      type: 'Mesa',
      status: 'Finalizado',
      paymentMethod,
      items,
      subtotal,
      deliveryFee: 0.00,
      total: subtotal,
      time: timeStr,
      date: dateStr,
      waiterId: table.waiter_id
    };

    // 2. Liberar a mesa
    await db.query(
      "UPDATE tables SET status = 'Livre', items = '[]'::jsonb, opened_at = NULL, waiter_id = NULL WHERE id = $1",
      [id]
    );

    const updatedTable = {
      id,
      number: table.number,
      status: 'Livre',
      items: [],
      openedAt: null,
      waiterId: null
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('table_updated', updatedTable);
      io.emit('order_created', newOrder);
    }

    await addAuditEntry(
      'Comandas',
      `Fechou comanda da Mesa ${table.number} – Total: R$ ${subtotal.toFixed(2)}`,
      req.user
    );

    res.json({ success: true, table: updatedTable, order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fechar conta da mesa.' });
  }
});

export default router;
