-- ==========================================
-- SCRIPT DE BANCO DE DADOS: SUSHI JAPA PRIME
-- Cole este script no painel SQL Editor do Supabase
-- ==========================================

-- 1. TABELA DE USUÁRIOS (SISTEMA)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  partner_id TEXT,
  is_partner BOOLEAN DEFAULT false
);

-- 2. TABELA DE SÓCIOS
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  share NUMERIC(5, 2) NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  color TEXT NOT NULL
);

-- 3. TABELA DE ESTOQUE (INSUMOS)
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qty NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  min NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL,
  category TEXT NOT NULL
);

-- 4. TABELA DE CARDÁPIO (PRODUTOS)
CREATE TABLE IF NOT EXISTS menu (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  recipe JSONB DEFAULT '[]'::jsonb
);

-- 5. TABELA DE FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  sales_count INT NOT NULL DEFAULT 0
);

-- 6. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  channel TEXT NOT NULL, -- Balcão, iFood, WhatsApp
  type TEXT NOT NULL, -- Mesa, Delivery, Balcão, Retirada
  status TEXT NOT NULL DEFAULT 'Preparando', -- Preparando, Pronto, Em entrega, Finalizado
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  waiter_id TEXT REFERENCES employees(id) ON DELETE SET NULL
);

-- 7. TABELA DE MESAS / COMANDAS
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Livre', -- Livre, Ocupada, Conta Solicitada
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  opened_at TEXT,
  waiter_id TEXT REFERENCES employees(id) ON DELETE SET NULL
);

-- 8. TABELA DE CONFIGURAÇÕES (ÚNICA LINHA)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  restaurant_name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  address TEXT,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  logo_url TEXT,
  allow_discounts BOOLEAN DEFAULT true,
  auto_print_receipts BOOLEAN DEFAULT false,
  sound_notifications BOOLEAN DEFAULT true,
  auto_backup BOOLEAN DEFAULT true,
  whatsapp_templates JSONB NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 9. TABELA DE CAIXA ATIVO (ÚNICA LINHA)
CREATE TABLE IF NOT EXISTS cashier (
  id INT PRIMARY KEY DEFAULT 1,
  is_open BOOLEAN DEFAULT false,
  opened_by TEXT,
  opened_at TEXT,
  initial_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 10. TABELA DE HISTÓRICO DE FECHAMENTO DE CAIXA
CREATE TABLE IF NOT EXISTS cashier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closed_at TEXT NOT NULL,
  opened_by TEXT,
  closed_by TEXT,
  initial_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  expected_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  actual_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  difference NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  sales_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 11. TABELA DE METAS (ÚNICA LINHA)
CREATE TABLE IF NOT EXISTS goals (
  id INT PRIMARY KEY DEFAULT 1,
  daily_target NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 12. TABELA DE DESPESAS (FINANCEIRO)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  responsible TEXT NOT NULL,
  partner_id TEXT,
  supplier TEXT NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  attachment TEXT
);

-- 13. TABELA DE INVESTIMENTOS (FINANCEIRO)
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  responsible TEXT NOT NULL,
  partner_id TEXT,
  notes TEXT
);

-- 14. TABELA DE RETIRADAS (FINANCEIRO)
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  reason TEXT NOT NULL
);

-- 15. TABELA DE LOGS DO WHATSAPP
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Enviado',
  time TEXT NOT NULL
);

-- 16. TABELA DE LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  "user" TEXT NOT NULL,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL
);

-- ============================================================================
-- SEED DATA (POPULAR DADOS PADRÕES DO SISTEMA)
-- ============================================================================

-- Popular Usuários
INSERT INTO users (id, username, password, name, role, partner_id, is_partner) VALUES
('u-1', 'admin', 'japa2026', 'Benhur', 'Sócio', 'p-1', true),
('u-2', 'socio2', 'japa2026', 'Sócio 2', 'Sócio', 'p-2', true),
('u-3', 'socio3', 'japa2026', 'Sócio 3', 'Sócio', 'p-3', true),
('u-4', 'socio4', 'japa2026', 'Sócio 4', 'Sócio', 'p-4', true),
('u-5', 'gerente', 'gerente123', 'Lucas Lima', 'Gerente', NULL, false),
('u-6', 'caixa', 'caixa123', 'Maria Oliveira', 'Caixa', NULL, false),
('u-7', 'cozinha', 'cozinha123', 'Pedro Santos', 'Cozinha', NULL, false),
('u-8', 'entregador', 'moto123', 'João Silva', 'Entregador', NULL, false),
('u-9', 'cliente', 'cliente123', 'Cliente Simulador', 'Cliente', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Popular Sócios
INSERT INTO partners (id, name, share, user_id, color) VALUES
('p-1', 'Benhur', 25.00, 'u-1', '#E50914'),
('p-2', 'Sócio 2', 25.00, 'u-2', '#D4AF37'),
('p-3', 'Sócio 3', 25.00, 'u-3', '#3B82F6'),
('p-4', 'Sócio 4', 25.00, 'u-4', '#10B981')
ON CONFLICT (id) DO NOTHING;

-- Popular Estoque Inicial
INSERT INTO inventory (id, name, qty, min, unit, category) VALUES
('ing-1', 'Salmão', 15.5, 5.0, 'kg', 'Peixes'),
('ing-2', 'Arroz Sushi', 20.0, 8.0, 'kg', 'Grãos'),
('ing-3', 'Alga Nori', 120, 30, 'un', 'Outros'),
('ing-4', 'Cream Cheese', 45, 10, 'un', 'Laticínios'),
('ing-5', 'Skin de Salmão', 4.0, 1.0, 'kg', 'Peixes'),
('ing-6', 'Macarrão Yakisoba', 12.0, 3.0, 'kg', 'Massas'),
('ing-7', 'Frango', 10.0, 3.0, 'kg', 'Carnes'),
('ing-8', 'Legumes Mistos', 8.0, 2.0, 'kg', 'Vegetais'),
('ing-9', 'Guaraná Lata', 80, 20, 'un', 'Bebidas'),
('ing-10', 'Água Mineral', 50, 15, 'un', 'Bebidas')
ON CONFLICT (id) DO NOTHING;

-- Popular Cardápio
INSERT INTO menu (id, name, price, category, is_active, description, recipe) VALUES
('prod-1', 'Combo Japa Prime', 89.90, 'Combos', true, '15 peças variadas de salmão premium com cream cheese e cebolinha.', '[{"ingredientId": "ing-1", "amount": 0.15}, {"ingredientId": "ing-2", "amount": 0.10}, {"ingredientId": "ing-3", "amount": 1}, {"ingredientId": "ing-4", "amount": 0.2}]'::jsonb),
('prod-2', 'Hot Filadélfia (10pcs)', 37.90, 'Hot Rolls', true, 'Hot roll de salmão grelhado, cream cheese, cebolinha e molho tarê.', '[{"ingredientId": "ing-1", "amount": 0.10}, {"ingredientId": "ing-2", "amount": 0.08}, {"ingredientId": "ing-3", "amount": 0.5}, {"ingredientId": "ing-4", "amount": 0.1}]'::jsonb),
('prod-3', 'Temaki Salmão', 38.00, 'Temakis', true, 'Cone de alga crocante recheado com arroz e cubos frescos de salmão.', '[{"ingredientId": "ing-1", "amount": 0.08}, {"ingredientId": "ing-2", "amount": 0.05}, {"ingredientId": "ing-3", "amount": 0.5}]'::jsonb),
('prod-4', 'Uramaki Skin (8pcs)', 32.00, 'Uramakis', true, 'Arroz por fora com recheio de pele de salmão grelhada crocante e molho tarê.', '[{"ingredientId": "ing-5", "amount": 0.08}, {"ingredientId": "ing-2", "amount": 0.08}, {"ingredientId": "ing-3", "amount": 0.5}]'::jsonb),
('prod-5', 'Yakisoba Frango', 45.00, 'Pratos Quentes', true, 'Macarrão oriental frito com pedaços de peito de frango e legumes frescos ao molho shoyu.', '[{"ingredientId": "ing-6", "amount": 0.20}, {"ingredientId": "ing-7", "amount": 0.15}, {"ingredientId": "ing-8", "amount": 0.10}]'::jsonb),
('prod-6', 'Guaraná Antarctica', 6.00, 'Bebidas', true, 'Lata 350ml bem gelada.', '[{"ingredientId": "ing-9", "amount": 1}]'::jsonb),
('prod-7', 'Água Mineral', 4.50, 'Bebidas', true, 'Garrafa 500ml sem gás.', '[{"ingredientId": "ing-10", "amount": 1}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Popular Funcionários
INSERT INTO employees (id, name, role, phone, status, commission, sales_count) VALUES
('emp-1', 'João Silva', 'Motoboy', '(11) 99999-1111', 'Ativo', 85.00, 12),
('emp-2', 'Maria Oliveira', 'Caixa', '(11) 98888-2222', 'Ativo', 0.00, 0),
('emp-3', 'Pedro Santos', 'Cozinheiro', '(11) 97777-3333', 'Ativo', 0.00, 0),
('emp-4', 'Ana Costa', 'Atendente', '(11) 96666-4444', 'Ativo', 25.00, 5),
('emp-5', 'Lucas Lima', 'Gerente', '(11) 95555-5555', 'Férias', 0.00, 0)
ON CONFLICT (id) DO NOTHING;

-- Popular Mesas Iniciais
INSERT INTO tables (id, number, status, items, opened_at, waiter_id) VALUES
('mesa-1', '01', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-2', '02', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-3', '03', 'Ocupada', '[{"id": "prod-2", "name": "Hot Filadélfia (10pcs)", "price": 37.90, "quantity": 2}, {"id": "prod-6", "name": "Guaraná Antarctica", "price": 6.00, "quantity": 1}]'::jsonb, '19:40', 'emp-4'),
('mesa-4', '04', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-5', '05', 'Conta Solicitada', '[{"id": "prod-1", "name": "Combo Japa Prime", "price": 89.90, "quantity": 1}, {"id": "prod-7", "name": "Água Mineral", "price": 4.50, "quantity": 1}]'::jsonb, '19:10', 'emp-4'),
('mesa-6', '06', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-7', '07', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-8', '08', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-9', '09', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-10', '10', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-11', '11', 'Livre', '[]'::jsonb, NULL, NULL),
('mesa-12', '12', 'Livre', '[]'::jsonb, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Popular Configurações
INSERT INTO settings (id, restaurant_name, cnpj, phone, address, delivery_fee, logo_url, allow_discounts, auto_print_receipts, sound_notifications, auto_backup, whatsapp_templates) VALUES
(1, 'Sushi Japa Food Prime', '12.345.678/0001-90', '(11) 98765-4321', 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP', 7.00, '', true, false, true, true, 
 '{"received": "Olá *{cliente}*! Recebemos seu pedido *#{id}*. Já está em preparação em nossa cozinha! 🍣", "ready": "Olá *{cliente}*! Boas notícias: seu pedido *#{id}* ficou pronto! 🛵", "delivered": "Olá *{cliente}*! Seu pedido *#{id}* foi finalizado. Agradecemos a preferência! 🙏"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Popular Caixa Ativo Inicial
INSERT INTO cashier (id, is_open, opened_by, opened_at, initial_balance, transactions) VALUES
(1, true, 'Benhur', '2026-06-01 17:00', 500.00, 
 '[{"type": "suprimento", "amount": 100.00, "reason": "Troco inicial extra", "time": "17:30", "user": "Benhur"}, {"type": "sangria", "amount": 50.00, "reason": "Compra de gelo emergencial", "time": "19:00", "user": "Benhur"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Popular Metas Iniciais
INSERT INTO goals (id, daily_target, history) VALUES
(1, 10000.00, 
 '[{"date": "2026-05-31", "target": 8000.00, "total": 7450.00, "percent": 93}, {"date": "2026-05-30", "target": 8000.00, "total": 9850.00, "percent": 123}, {"date": "2026-05-29", "target": 8000.00, "total": 8200.00, "percent": 102.5}, {"date": "2026-05-28", "target": 8000.00, "total": 7500.00, "percent": 93.7}, {"date": "2026-05-27", "target": 8000.00, "total": 9100.00, "percent": 113.7}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Popular Histórico de Vendas Prévio em orders (Para demonstração de faturamento)
INSERT INTO orders (id, customer_name, phone, address, channel, type, status, payment_method, items, subtotal, delivery_fee, total, time, date, waiter_id) VALUES
('1253', 'Juliana Alves', '', '', 'Balcão', 'Mesa', 'Finalizado', 'Dinheiro', '[{"id": "prod-1", "name": "Combo Japa Prime", "price": 89.90, "quantity": 1}, {"id": "prod-7", "name": "Água Mineral", "price": 4.50, "quantity": 2}]'::jsonb, 98.90, 0.00, 98.90, '19:15', '2026-06-01', 'emp-4'),
('1254', 'Lucas Lima', '(11) 95432-1098', 'Rua Japar, 250', 'WhatsApp', 'Retirada', 'Preparando', 'Pix', '[{"id": "prod-2", "name": "Hot Filadélfia (10pcs)", "price": 37.90, "quantity": 2}]'::jsonb, 75.80, 0.00, 75.80, '20:30', '2026-06-01', NULL),
('1255', 'Ana Paula', '', '', 'Balcão', 'Balcão', 'Pronto', 'Débito', '[{"id": "prod-5", "name": "Yakisoba Frango", "price": 45.00, "quantity": 1}]'::jsonb, 45.00, 0.00, 45.00, '20:45', '2026-06-01', NULL),
('1256', 'Pedro Santos', '(11) 96543-2109', 'Rua Acácio, 789', 'WhatsApp', 'Delivery', 'Em entrega', 'Crédito', '[{"id": "prod-1", "name": "Combo Japa Prime", "price": 89.90, "quantity": 1}, {"id": "prod-3", "name": "Temaki Salmão", "price": 38.00, "quantity": 1}]'::jsonb, 127.90, 7.00, 134.90, '21:05', '2026-06-01', NULL),
('1257', 'Marta Oliveira', '(11) 97654-3210', 'Rua das Flores, 123', 'WhatsApp', 'Delivery', 'Preparando', 'Pix', '[{"id": "prod-2", "name": "Hot Filadélfia (10pcs)", "price": 37.90, "quantity": 1}, {"id": "prod-6", "name": "Guaraná Antarctica", "price": 6.00, "quantity": 1}]'::jsonb, 43.90, 7.00, 50.90, '21:20', '2026-06-01', NULL),
('1258', 'Julio Silva', '(11) 98765-4321', 'Av. Paulista, 1000 - Apto 42', 'iFood', 'Delivery', 'Em entrega', 'iFood', '[{"id": "prod-1", "name": "Combo Japa Prime", "price": 89.90, "quantity": 1}]'::jsonb, 89.90, 7.00, 96.90, '21:30', '2026-06-01', NULL),
('1259', 'Mesa 08', '', '', 'Balcão', 'Mesa', 'Preparando', 'Crédito', '[{"id": "prod-5", "name": "Yakisoba Frango", "price": 45.00, "quantity": 1}, {"id": "prod-7", "name": "Água Mineral", "price": 4.50, "quantity": 1}]'::jsonb, 49.50, 0.00, 49.50, '21:32', '2026-06-01', 'emp-4'),
('1260', 'Rodrigo Santos', '(11) 98888-7777', 'Rua das Palmeiras, 450', 'iFood', 'Delivery', 'Preparando', 'iFood', '[{"id": "prod-2", "name": "Hot Filadélfia (10pcs)", "price": 37.90, "quantity": 2}, {"id": "prod-6", "name": "Guaraná Antarctica", "price": 6.00, "quantity": 2}]'::jsonb, 87.80, 7.00, 94.80, '21:35', '2026-06-01', NULL),
('1261', 'Mesa 03', '', '', 'Balcão', 'Mesa', 'Preparando', 'Pix', '[{"id": "prod-1", "name": "Combo Japa Prime", "price": 89.90, "quantity": 1}, {"id": "prod-3", "name": "Temaki Salmão", "price": 38.00, "quantity": 2}]'::jsonb, 165.90, 0.00, 165.90, '21:40', '2026-06-01', 'emp-4')
ON CONFLICT (id) DO NOTHING;

-- Popular Despesas Prévias
INSERT INTO expenses (id, date, time, responsible, partner_id, supplier, category, payment_method, notes, items, total, attachment) VALUES
('exp-1', '2026-06-01', '09:30', 'Benhur', 'p-1', 'Feira Livre Central', 'Matéria-Prima', 'Dinheiro', 'Compra semanal de hortifrúti', '[{"product": "Tomate", "qty": 5, "unit": "kg", "total": 30.00, "unitPrice": 6.00}, {"product": "Cebola", "qty": 3, "unit": "kg", "total": 13.50, "unitPrice": 4.50}, {"product": "Limão", "qty": 2, "unit": "kg", "total": 16.00, "unitPrice": 8.00}, {"product": "Coentro", "qty": 1, "unit": "maço", "total": 2.50, "unitPrice": 2.50}]'::jsonb, 62.00, NULL),
('exp-2', '2026-06-01', '11:00', 'Benhur', 'p-1', 'Peixaria do João', 'Matéria-Prima', 'Pix', 'Reposição de salmão fresco', '[{"product": "Salmão Fresco", "qty": 10, "unit": "kg", "total": 650.00, "unitPrice": 65.00}]'::jsonb, 650.00, NULL),
('exp-3', '2026-05-31', '14:00', 'Sócio 2', 'p-2', 'Distribuidora Alfa', 'Embalagens', 'Débito', 'Caixas e sacolas para delivery', '[{"product": "Caixa delivery P", "qty": 200, "unit": "un", "total": 160.00, "unitPrice": 0.80}, {"product": "Caixa delivery G", "qty": 100, "unit": "un", "total": 120.00, "unitPrice": 1.20}, {"product": "Sacola kraft", "qty": 500, "unit": "un", "total": 150.00, "unitPrice": 0.30}]'::jsonb, 430.00, NULL)
ON CONFLICT (id) DO NOTHING;

-- Popular Investimentos Prévios
INSERT INTO investments (id, date, description, category, value, responsible, partner_id, notes) VALUES
('inv-1', '2026-05-15', 'Forno combinado Tramontina', 'Equipamentos', 4800.00, 'Benhur', 'p-1', 'Substituição do forno antigo'),
('inv-2', '2026-05-01', 'Reforma do salão principal', 'Reformas', 8500.00, 'Sócio 2', 'p-2', 'Pintura e novos revestimentos'),
('inv-3', '2026-04-20', 'Capital de giro Q2', 'Capital', 5000.00, 'Benhur', 'p-1', 'Aporte inicial segundo trimestre')
ON CONFLICT (id) DO NOTHING;

-- Popular Retiradas Prévias
INSERT INTO withdrawals (id, date, time, partner_id, partner_name, value, reason) VALUES
('wd-1', '2026-05-31', '22:00', 'p-1', 'Benhur', 1500.00, 'Retirada mensal pro-labore'),
('wd-2', '2026-05-31', '22:00', 'p-2', 'Sócio 2', 1500.00, 'Retirada mensal pro-labore'),
('wd-3', '2026-05-31', '22:00', 'p-3', 'Sócio 3', 1500.00, 'Retirada mensal pro-labore'),
('wd-4', '2026-05-31', '22:00', 'p-4', 'Sócio 4', 1500.00, 'Retirada mensal pro-labore')
ON CONFLICT (id) DO NOTHING;

-- Popular Caixa Histórico Prévio
INSERT INTO cashier_history (id, closed_at, opened_by, closed_by, initial_balance, expected_balance, actual_balance, difference, sales_total) VALUES
('f8f6df7f-8d9e-4e42-9952-b8832a58b6fd', '2026-05-31 23:30', 'Maria Oliveira', 'Lucas Lima', 500.00, 2450.00, 2450.00, 0.00, 1950.00)
ON CONFLICT (id) DO NOTHING;

-- Popular Logs do WhatsApp Iniciais
INSERT INTO whatsapp_logs (id, client, phone, type, text, status, time) VALUES
('log-1', 'Julio Silva', '(11) 98765-4321', 'Entrega', 'Olá Julio Silva! Recebemos seu pedido #1258...', 'Enviado', '21:30'),
('log-2', 'Marta Oliveira', '(11) 97654-3210', 'Recebido', 'Olá Marta Oliveira! Recebemos seu pedido #1257...', 'Enviado', '21:20')
ON CONFLICT (id) DO NOTHING;

-- Popular Auditoria Inicial
INSERT INTO audit_log (id, date, time, "user", role, module, action) VALUES
('al-1', '2026-06-01', '17:00', 'Benhur', 'Sócio', 'Caixa', 'Abriu o caixa com saldo de R$ 500,00'),
('al-2', '2026-06-01', '17:30', 'Benhur', 'Sócio', 'Caixa', 'Registrou suprimento de R$ 100,00 – Troco inicial extra'),
('al-3', '2026-06-01', '09:30', 'Benhur', 'Sócio', 'Financeiro', 'Registrou despesa de R$ 62,00 – Feira Livre Central'),
('al-4', '2026-06-01', '11:00', 'Benhur', 'Sócio', 'Financeiro', 'Registrou despesa de R$ 650,00 – Peixaria do João (Salmão)'),
('al-5', '2026-06-01', '19:00', 'Benhur', 'Sócio', 'Caixa', 'Registrou sangria de R$ 50,00 – Compra de gelo emergencial'),
('al-6', '2026-06-01', '21:30', 'Maria Oliveira', 'Caixa', 'Pedidos', 'Criou pedido #1258 para Julio Silva – R$ 96,90 (iFood)'),
('al-7', '2026-05-31', '14:00', 'Sócio 2', 'Sócio', 'Financeiro', 'Registrou despesa de R$ 430,00 – Distribuidora Alfa (Embalagens)')
ON CONFLICT (id) DO NOTHING;
