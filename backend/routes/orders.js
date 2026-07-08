import express from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { addAuditEntry } from '../services/audit.js';

const router = express.Router();

const mapDbToOrder = (o) => ({
  id: o.id,
  customerName: o.customer_name,
  phone: o.phone,
  address: o.address,
  channel: o.channel,
  type: o.type,
  status: o.status,
  paymentMethod: o.payment_method,
  items: o.items,
  subtotal: Number(o.subtotal),
  deliveryFee: Number(o.delivery_fee),
  total: Number(o.total),
  time: o.time,
  date: o.date,
  waiterId: o.waiter_id
});

// Helper para deduzir insumos com base na receita do prato
const deductIngredientsForItems = async (items) => {
  try {
    const invRes = await db.query('SELECT id, qty FROM inventory');
    const menuRes = await db.query('SELECT id, recipe FROM menu');

    const inventory = invRes.rows;
    const menu = menuRes.rows;
    const updatedIngredients = [];

    for (const item of items) {
      const menuItem = menu.find(m => m.id === item.id);
      if (menuItem && menuItem.recipe) {
        const recipe = typeof menuItem.recipe === 'string' ? JSON.parse(menuItem.recipe) : menuItem.recipe;
        for (const step of recipe) {
          const ing = inventory.find(i => i.id === step.ingredientId);
          if (ing) {
            const deduct = step.amount * item.quantity;
            ing.qty = Math.max(0, Number((Number(ing.qty) - deduct).toFixed(2)));
            if (!updatedIngredients.some(u => u.id === ing.id)) {
              updatedIngredients.push(ing);
            }
          }
        }
      }
    }

    // Atualizar no banco
    for (const ing of updatedIngredients) {
      await db.query('UPDATE inventory SET qty = $1 WHERE id = $2', [ing.qty, ing.id]);
    }
  } catch (err) {
    console.error('Erro ao deduzir insumos:', err);
  }
};



// Listar Pedidos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows.map(mapDbToOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar pedidos.' });
  }
});

// Criar Pedido
router.post('/', authMiddleware, async (req, res) => {
  const { customerName, phone, address, channel, type, paymentMethod, items, subtotal, deliveryFee, total, waiterId } = req.body;

  if (!customerName || !channel || !type || !paymentMethod || !items || total === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    // 1. Obter próximo ID numérico sequencial
    const maxResult = await db.query('SELECT id FROM orders');
    let maxId = 1200;
    maxResult.rows.forEach(r => {
      const parsed = parseInt(r.id);
      if (!isNaN(parsed) && parsed > maxId) {
        maxId = parsed;
      }
    });
    const id = String(maxId + 1);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const status = 'Preparando';

    // 2. Inserir pedido
    await db.query(
      `INSERT INTO orders 
        (id, customer_name, phone, address, channel, type, status, payment_method, items, subtotal, delivery_fee, total, time, date, waiter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id,
        customerName,
        phone || '',
        address || '',
        channel,
        type,
        status,
        paymentMethod,
        JSON.stringify(items),
        Number(subtotal),
        Number(deliveryFee),
        Number(total),
        timeStr,
        dateStr,
        waiterId || null
      ]
    );

    const newOrder = {
      id,
      customerName,
      phone,
      address,
      channel,
      type,
      status,
      paymentMethod,
      items,
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),
      time: timeStr,
      date: dateStr,
      waiterId
    };

    // 3. Deduzir do estoque
    await deductIngredientsForItems(items);

    // 4. Se houver garçom, atualizar comissão (+ 5% do subtotal) e contador de vendas
    if (waiterId) {
      const waiterRes = await db.query('SELECT commission, sales_count FROM employees WHERE id = $1', [waiterId]);
      if (waiterRes.rows.length > 0) {
        const waiter = waiterRes.rows[0];
        const newComm = Number((Number(waiter.commission) + subtotal * 0.05).toFixed(2));
        const newCount = Number(waiter.sales_count) + 1;
        await db.query('UPDATE employees SET commission = $1, sales_count = $2 WHERE id = $3', [newComm, newCount, waiterId]);

        // Notificar via WebSocket que os funcionários foram alterados
        const io = req.app.get('io');
        if (io) {
          io.emit('employees_updated');
        }
      }
    }



    // 6. Log de Auditoria
    await addAuditEntry(
      'Pedidos',
      `Criou pedido #${id} para ${customerName} – R$ ${Number(total).toFixed(2)} (${channel})`,
      req.user
    );

    // 7. Notificar via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('order_created', newOrder);
      io.emit('inventory_updated'); // estoque foi deduzido
    }

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

// Atualizar Status do Pedido
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório.' });
  }

  try {
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const order = orderRes.rows[0];
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

    const updatedOrder = {
      ...mapDbToOrder(order),
      status
    };

    // WebSocket broadcast de atualização
    const io = req.app.get('io');
    if (io) {
      io.emit('order_updated', updatedOrder);
    }

    // Simulação do WhatsApp conforme a mudança de status
    if (status === 'Finalizado') {

      // Regra de comissão de motoboy para delivery finalizado
      if (order.type === 'Delivery') {
        const activeMotoboyRes = await db.query("SELECT id, commission, sales_count FROM employees WHERE role = 'Motoboy' AND status = 'Ativo' LIMIT 1");
        if (activeMotoboyRes.rows.length > 0) {
          const motoboy = activeMotoboyRes.rows[0];
          const newComm = Number((Number(motoboy.commission) + 5.00).toFixed(2));
          const newCount = Number(motoboy.sales_count) + 1;
          await db.query('UPDATE employees SET commission = $1, sales_count = $2 WHERE id = $3', [newComm, newCount, motoboy.id]);

          if (io) {
            io.emit('employees_updated');
          }
        }
      }
    }

    // Log de auditoria
    await addAuditEntry(
      'Pedidos',
      `Atualizou status do pedido #${id} para: ${status}`,
      req.user
    );

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
  }
});

export default router;
