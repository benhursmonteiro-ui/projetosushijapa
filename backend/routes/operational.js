import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ─── USERS ───
router.get('/users', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, name, role, partner_id, is_partner FROM users');
    res.json(result.rows.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      partnerId: u.partner_id,
      isPartner: u.is_partner
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

router.post('/users', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const { username, password, name, role, partnerId, isPartner } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = `u-${Date.now()}`;
    await db.query(
      'INSERT INTO users (id, username, password, name, role, partner_id, is_partner) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, username, hashedPassword, name, role, partnerId || null, isPartner || false]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// ─── PARTNERS ───
router.get('/partners', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM partners');
    res.json(result.rows.map(p => ({
      id: p.id,
      name: p.name,
      share: Number(p.share),
      userId: p.user_id,
      color: p.color
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter sócios.' });
  }
});

router.put('/partners/:id', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const { id } = req.params;
  const { name, share, userId, color } = req.body;
  try {
    await db.query(
      'UPDATE partners SET name = COALESCE($1, name), share = COALESCE($2, share), user_id = COALESCE($3, user_id), color = COALESCE($4, color) WHERE id = $5',
      [name, share, userId, color, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar sócio.' });
  }
});

// ─── INVENTORY ───
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inventory');
    res.json(result.rows.map(ing => ({
      id: ing.id,
      name: ing.name,
      qty: Number(ing.qty),
      min: Number(ing.min),
      unit: ing.unit,
      category: ing.category
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter estoque.' });
  }
});

router.post('/inventory', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { name, qty, min, unit, category } = req.body;
  if (!name || qty === undefined || min === undefined || !unit || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  const id = `ing-${Date.now()}`;
  try {
    await db.query(
      'INSERT INTO inventory (id, name, qty, min, unit, category) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, Number(qty), Number(min), unit, category]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao inserir item no estoque.' });
  }
});

router.put('/inventory/:id', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { id } = req.params;
  const { qty, min, name, unit, category } = req.body;
  try {
    await db.query(
      'UPDATE inventory SET qty = COALESCE($1, qty), min = COALESCE($2, min), name = COALESCE($3, name), unit = COALESCE($4, unit), category = COALESCE($5, category) WHERE id = $6',
      [qty !== undefined ? Number(qty) : null, min !== undefined ? Number(min) : null, name, unit, category, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar estoque.' });
  }
});

// ─── MENU ───
router.get('/menu', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM menu');
    res.json(result.rows.map(m => ({
      id: m.id,
      name: m.name,
      price: Number(m.price),
      category: m.category,
      isActive: m.is_active,
      description: m.description,
      recipe: m.recipe
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter cardápio.' });
  }
});

router.post('/menu', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { name, price, category, description, recipe } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  const id = `prod-${Date.now()}`;
  try {
    await db.query(
      'INSERT INTO menu (id, name, price, category, is_active, description, recipe) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, Number(price), category, true, description || '', JSON.stringify(recipe || [])]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar item do cardápio.' });
  }
});

router.put('/menu/:id', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { id } = req.params;
  const { name, price, category, isActive, description, recipe } = req.body;
  try {
    await db.query(
      'UPDATE menu SET name = COALESCE($1, name), price = COALESCE($2, price), category = COALESCE($3, category), is_active = COALESCE($4, is_active), description = COALESCE($5, description), recipe = COALESCE($6, recipe) WHERE id = $7',
      [
        name,
        price !== undefined ? Number(price) : null,
        category,
        isActive,
        description,
        recipe ? JSON.stringify(recipe) : null,
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar item do cardápio.' });
  }
});

// ─── EMPLOYEES ───
router.get('/employees', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employees');
    res.json(result.rows.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      phone: e.phone,
      status: e.status,
      commission: Number(e.commission),
      salesCount: e.sales_count
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter funcionários.' });
  }
});

router.post('/employees', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { name, role, phone, status } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  const id = `emp-${Date.now()}`;
  try {
    await db.query(
      'INSERT INTO employees (id, name, role, phone, status, commission, sales_count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, role, phone || '', status || 'Ativo', 0.00, 0]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar funcionário.' });
  }
});

router.put('/employees/:id', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, status, commission, salesCount } = req.body;
  try {
    await db.query(
      'UPDATE employees SET name = COALESCE($1, name), role = COALESCE($2, role), phone = COALESCE($3, phone), status = COALESCE($4, status), commission = COALESCE($5, commission), sales_count = COALESCE($6, sales_count) WHERE id = $7',
      [
        name,
        role,
        phone,
        status,
        commission !== undefined ? Number(commission) : null,
        salesCount !== undefined ? Number(salesCount) : null,
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar funcionário.' });
  }
});

// ─── SETTINGS ───
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas.' });
    }
    const s = result.rows[0];
    res.json({
      restaurantName: s.restaurant_name,
      cnpj: s.cnpj,
      phone: s.phone,
      address: s.address,
      deliveryFee: Number(s.delivery_fee),
      logoUrl: s.logo_url,
      allowDiscounts: s.allow_discounts,
      autoPrintReceipts: s.auto_print_receipts,
      soundNotifications: s.sound_notifications,
      autoBackup: s.auto_backup,
      whatsappTemplates: s.whatsapp_templates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter configurações.' });
  }
});

router.put('/settings', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  const {
    restaurantName,
    cnpj,
    phone,
    address,
    deliveryFee,
    logoUrl,
    allowDiscounts,
    autoPrintReceipts,
    soundNotifications,
    autoBackup,
    whatsappTemplates
  } = req.body;
  try {
    await db.query(
      `UPDATE settings SET 
        restaurant_name = COALESCE($1, restaurant_name),
        cnpj = COALESCE($2, cnpj),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        delivery_fee = COALESCE($5, delivery_fee),
        logo_url = COALESCE($6, logo_url),
        allow_discounts = COALESCE($7, allow_discounts),
        auto_print_receipts = COALESCE($8, auto_print_receipts),
        sound_notifications = COALESCE($9, sound_notifications),
        auto_backup = COALESCE($10, auto_backup),
        whatsapp_templates = COALESCE($11, whatsapp_templates)
      WHERE id = 1`,
      [
        restaurantName,
        cnpj,
        phone,
        address,
        deliveryFee !== undefined ? Number(deliveryFee) : null,
        logoUrl,
        allowDiscounts,
        autoPrintReceipts,
        soundNotifications,
        autoBackup,
        whatsappTemplates ? JSON.stringify(whatsappTemplates) : null
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

// ─── GOALS ───
router.get('/goals', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM goals WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metas não encontradas.' });
    }
    const g = result.rows[0];
    res.json({
      dailyTarget: Number(g.daily_target),
      history: g.history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter metas.' });
  }
});

router.put('/goals', authMiddleware, requireRole(['Sócio', 'Gerente']), async (req, res) => {
  const { dailyTarget, history } = req.body;
  try {
    await db.query(
      'UPDATE goals SET daily_target = COALESCE($1, daily_target), history = COALESCE($2, history) WHERE id = 1',
      [dailyTarget !== undefined ? Number(dailyTarget) : null, history ? JSON.stringify(history) : null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar metas.' });
  }
});

// Resetar banco de dados para os valores padrão
router.post('/reset', authMiddleware, requireRole(['Sócio']), async (req, res) => {
  try {
    // 1. Limpar tabelas transacionais
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM expenses');
    await db.query('DELETE FROM investments');
    await db.query('DELETE FROM withdrawals');
    await db.query('DELETE FROM audit_log');
    await db.query('DELETE FROM whatsapp_logs');
    await db.query('DELETE FROM cashier_history');

    // 2. Restaurar dados padrões nas tabelas de registro único (id=1)
    await db.query(`
      UPDATE cashier SET 
        is_open = true, 
        opened_by = 'Benhur', 
        opened_at = '2026-06-01 17:00', 
        initial_balance = 500.00, 
        transactions = '[{"type": "suprimento", "amount": 100.00, "reason": "Troco inicial extra", "time": "17:30", "user": "Benhur"}, {"type": "sangria", "amount": 50.00, "reason": "Compra de gelo emergencial", "time": "19:00", "user": "Benhur"}]'::jsonb
      WHERE id = 1
    `);

    await db.query(`
      UPDATE goals SET 
        daily_target = 10000.00, 
        history = '[{"date": "2026-05-31", "target": 8000.00, "total": 7450.00, "percent": 93}, {"date": "2026-05-30", "target": 8000.00, "total": 9850.00, "percent": 123}, {"date": "2026-05-29", "target": 8000.00, "total": 8200.00, "percent": 102.5}, {"date": "2026-05-28", "target": 8000.00, "total": 7500.00, "percent": 93.7}, {"date": "2026-05-27", "target": 8000.00, "total": 9100.00, "percent": 113.7}]'::jsonb
      WHERE id = 1
    `);

    await db.query(`
      UPDATE settings SET 
        restaurant_name = 'Sushi Japa Food Prime',
        cnpj = '12.345.678/0001-90',
        phone = '(11) 98765-4321',
        address = 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP',
        delivery_fee = 7.00,
        logo_url = '',
        allow_discounts = true,
        auto_print_receipts = false,
        sound_notifications = true,
        auto_backup = true,
        whatsapp_templates = '{"received": "Olá *{cliente}*! Recebemos seu pedido *#{id}*. Já está em preparação em nossa cozinha! 🍣", "ready": "Olá *{cliente}*! Boas notícias: seu pedido *#{id}* ficou pronto! 🛵", "delivered": "Olá *{cliente}*! Seu pedido *#{id}* foi finalizado. Agradecemos a preferência! 🙏"}'::jsonb
      WHERE id = 1
    `);

    // 3. Resetar mesas para o estado padrão
    const defaultTables = Array.from({ length: 12 }, (_, i) => ({
      id: `mesa-${i + 1}`,
      number: String(i + 1).padStart(2, '0'),
      status: i === 2 ? 'Ocupada' : i === 4 ? 'Conta Solicitada' : 'Livre',
      items: i === 2 ? [
        { id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, quantity: 2 },
        { id: 'prod-6', name: 'Guaraná Antarctica', price: 6.00, quantity: 1 }
      ] : i === 4 ? [
        { id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 },
        { id: 'prod-7', name: 'Água Mineral', price: 4.50, quantity: 1 }
      ] : [],
      openedAt: i === 2 ? '19:40' : i === 4 ? '19:10' : null,
      waiterId: i === 2 ? 'emp-4' : i === 4 ? 'emp-4' : null
    }));

    for (const t of defaultTables) {
      await db.query(
        'UPDATE tables SET status = $1, items = $2, opened_at = $3, waiter_id = $4 WHERE id = $5',
        [t.status, JSON.stringify(t.items), t.openedAt, t.waiterId, t.id]
      );
    }

    // 4. Resetar também o estoque e funcionários para os originais (opcional, mas bom manter coerência)
    await db.query('DELETE FROM inventory');
    await db.query("INSERT INTO inventory (id, name, qty, min, unit, category) VALUES \
      ('ing-1', 'Salmão', 15.5, 5.0, 'kg', 'Peixes'), \
      ('ing-2', 'Arroz Sushi', 20.0, 8.0, 'kg', 'Grãos'), \
      ('ing-3', 'Alga Nori', 120, 30, 'un', 'Outros'), \
      ('ing-4', 'Cream Cheese', 45, 10, 'un', 'Laticínios'), \
      ('ing-5', 'Skin de Salmão', 4.0, 1.0, 'kg', 'Peixes'), \
      ('ing-6', 'Macarrão Yakisoba', 12.0, 3.0, 'kg', 'Massas'), \
      ('ing-7', 'Frango', 10.0, 3.0, 'kg', 'Carnes'), \
      ('ing-8', 'Legumes Mistos', 8.0, 2.0, 'kg', 'Vegetais'), \
      ('ing-9', 'Guaraná Lata', 80, 20, 'un', 'Bebidas'), \
      ('ing-10', 'Água Mineral', 50, 15, 'un', 'Bebidas') \
      ON CONFLICT (id) DO NOTHING");

    await db.query('DELETE FROM employees');
    await db.query("INSERT INTO employees (id, name, role, phone, status, commission, sales_count) VALUES \
      ('emp-1', 'João Silva', 'Motoboy', '(11) 99999-1111', 'Ativo', 85.00, 12), \
      ('emp-2', 'Maria Oliveira', 'Caixa', '(11) 98888-2222', 'Ativo', 0.00, 0), \
      ('emp-3', 'Pedro Santos', 'Cozinheiro', '(11) 97777-3333', 'Ativo', 0.00, 0), \
      ('emp-4', 'Ana Costa', 'Atendente', '(11) 96666-4444', 'Ativo', 25.00, 5), \
      ('emp-5', 'Lucas Lima', 'Gerente', '(11) 95555-5555', 'Férias', 0.00, 0) \
      ON CONFLICT (id) DO NOTHING");

    // Recriar ordens iniciais para exibição de relatórios/faturamento no dashboard
    await db.query("INSERT INTO orders (id, customer_name, phone, address, channel, type, status, payment_method, items, subtotal, delivery_fee, total, time, date, waiter_id) VALUES \
      ('1253', 'Juliana Alves', '', '', 'Balcão', 'Mesa', 'Finalizado', 'Dinheiro', '[{\"id\": \"prod-1\", \"name\": \"Combo Japa Prime\", \"price\": 89.90, \"quantity\": 1}, {\"id\": \"prod-7\", \"name\": \"Água Mineral\", \"price\": 4.50, \"quantity\": 2}]'::jsonb, 98.90, 0.00, 98.90, '19:15', '2026-06-01', 'emp-4'), \
      ('1254', 'Lucas Lima', '(11) 95432-1098', 'Rua Japar, 250', 'WhatsApp', 'Retirada', 'Preparando', 'Pix', '[{\"id\": \"prod-2\", \"name\": \"Hot Filadélfia (10pcs)\", \"price\": 37.90, \"quantity\": 2}]'::jsonb, 75.80, 0.00, 75.80, '20:30', '2026-06-01', NULL), \
      ('1255', 'Ana Paula', '', '', 'Balcão', 'Balcão', 'Pronto', 'Débito', '[{\"id\": \"prod-5\", \"name\": \"Yakisoba Frango\", \"price\": 45.00, \"quantity\": 1}]'::jsonb, 45.00, 0.00, 45.00, '20:45', '2026-06-01', NULL), \
      ('1256', 'Pedro Santos', '(11) 96543-2109', 'Rua Acácio, 789', 'WhatsApp', 'Delivery', 'Em entrega', 'Crédito', '[{\"id\": \"prod-1\", \"name\": \"Combo Japa Prime\", \"price\": 89.90, \"quantity\": 1}, {\"id\": \"prod-3\", \"name\": \"Temaki Salmão\", \"price\": 38.00, \"quantity\": 1}]'::jsonb, 127.90, 7.00, 134.90, '21:05', '2026-06-01', NULL), \
      ('1257', 'Marta Oliveira', '(11) 97654-3210', 'Rua das Flores, 123', 'WhatsApp', 'Delivery', 'Preparando', 'Pix', '[{\"id\": \"prod-2\", \"name\": \"Hot Filadélfia (10pcs)\", \"price\": 37.90, \"quantity\": 1}, {\"id\": \"prod-6\", \"name\": \"Guaraná Antarctica\", \"price\": 6.00, \"quantity\": 1}]'::jsonb, 43.90, 7.00, 50.90, '21:20', '2026-06-01', NULL), \
      ('1258', 'Julio Silva', '(11) 98765-4321', 'Av. Paulista, 1000 - Apto 42', 'iFood', 'Delivery', 'Em entrega', 'iFood', '[{\"id\": \"prod-1\", \"name\": \"Combo Japa Prime\", \"price\": 89.90, \"quantity\": 1}]'::jsonb, 89.90, 7.00, 96.90, '21:30', '2026-06-01', NULL), \
      ('1259', 'Mesa 08', '', '', 'Balcão', 'Mesa', 'Preparando', 'Crédito', '[{\"id\": \"prod-5\", \"name\": \"Yakisoba Frango\", \"price\": 45.00, \"quantity\": 1}, {\"id\": \"prod-7\", \"name\": \"Água Mineral\", \"price\": 4.50, \"quantity\": 1}]'::jsonb, 49.50, 0.00, 49.50, '21:32', '2026-06-01', 'emp-4'), \
      ('1260', 'Rodrigo Santos', '(11) 98888-7777', 'Rua das Palmeiras, 450', 'iFood', 'Delivery', 'Preparando', 'iFood', '[{\"id\": \"prod-2\", \"name\": \"Hot Filadélfia (10pcs)\", \"price\": 37.90, \"quantity\": 2}, {\"id\": \"prod-6\", \"name\": \"Guaraná Antarctica\", \"price\": 6.00, \"quantity\": 2}]'::jsonb, 87.80, 7.00, 94.80, '21:35', '2026-06-01', NULL), \
      ('1261', 'Mesa 03', '', '', 'Balcão', 'Mesa', 'Preparando', 'Pix', '[{\"id\": \"prod-1\", \"name\": \"Combo Japa Prime\", \"price\": 89.90, \"quantity\": 1}, {\"id\": \"prod-3\", \"name\": \"Temaki Salmão\", \"price\": 38.00, \"quantity\": 2}]'::jsonb, 165.90, 0.00, 165.90, '21:40', '2026-06-01', 'emp-4')");

    const io = req.app.get('io');
    if (io) {
      io.emit('database_reset');
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao resetar banco de dados:', err);
    res.status(500).json({ error: 'Erro ao resetar banco de dados.' });
  }
});

export default router;
