import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { sendWhatsAppMessage } from '../services/whatsappService';

export const AppContext = createContext();

// ─── System Users (real auth) ────────────────────────────────────────────────
const defaultUsers = [
  { id: 'u-1', username: 'admin',       password: 'japa2026',    name: 'Benhur',          role: 'Sócio',       partnerId: 'p-1', isPartner: true  },
  { id: 'u-2', username: 'socio2',      password: 'japa2026',    name: 'Sócio 2',         role: 'Sócio',       partnerId: 'p-2', isPartner: true  },
  { id: 'u-3', username: 'socio3',      password: 'japa2026',    name: 'Sócio 3',         role: 'Sócio',       partnerId: 'p-3', isPartner: true  },
  { id: 'u-4', username: 'socio4',      password: 'japa2026',    name: 'Sócio 4',         role: 'Sócio',       partnerId: 'p-4', isPartner: true  },
  { id: 'u-5', username: 'gerente',     password: 'gerente123',  name: 'Lucas Lima',      role: 'Gerente',     partnerId: null,  isPartner: false },
  { id: 'u-6', username: 'caixa',       password: 'caixa123',    name: 'Maria Oliveira',  role: 'Caixa',       partnerId: null,  isPartner: false },
  { id: 'u-7', username: 'cozinha',     password: 'cozinha123',  name: 'Pedro Santos',    role: 'Cozinha',     partnerId: null,  isPartner: false },
  { id: 'u-8', username: 'entregador',  password: 'moto123',     name: 'João Silva',      role: 'Entregador',  partnerId: null,  isPartner: false },
  { id: 'u-9', username: 'cliente',     password: 'cliente123',  name: 'Cliente Simulador', role: 'Cliente',    partnerId: null,  isPartner: false },
];

// ─── Partners ────────────────────────────────────────────────────────────────
const defaultPartners = [
  { id: 'p-1', name: 'Benhur',   share: 25, userId: 'u-1', color: '#E50914' },
  { id: 'p-2', name: 'Sócio 2',  share: 25, userId: 'u-2', color: '#D4AF37' },
  { id: 'p-3', name: 'Sócio 3',  share: 25, userId: 'u-3', color: '#3B82F6' },
  { id: 'p-4', name: 'Sócio 4',  share: 25, userId: 'u-4', color: '#10B981' },
];

// ─── Initial Inventory ───────────────────────────────────────────────────────
const defaultInventory = [
  { id: 'ing-1', name: 'Salmão',           qty: 15.5, min: 5.0,  unit: 'kg',  category: 'Peixes'    },
  { id: 'ing-2', name: 'Arroz Sushi',      qty: 20.0, min: 8.0,  unit: 'kg',  category: 'Grãos'     },
  { id: 'ing-3', name: 'Alga Nori',        qty: 120,  min: 30,   unit: 'un',  category: 'Outros'    },
  { id: 'ing-4', name: 'Cream Cheese',     qty: 45,   min: 10,   unit: 'un',  category: 'Laticínios'},
  { id: 'ing-5', name: 'Skin de Salmão',   qty: 4.0,  min: 1.0,  unit: 'kg',  category: 'Peixes'    },
  { id: 'ing-6', name: 'Macarrão Yakisoba',qty: 12.0, min: 3.0,  unit: 'kg',  category: 'Massas'    },
  { id: 'ing-7', name: 'Frango',           qty: 10.0, min: 3.0,  unit: 'kg',  category: 'Carnes'    },
  { id: 'ing-8', name: 'Legumes Mistos',   qty: 8.0,  min: 2.0,  unit: 'kg',  category: 'Vegetais'  },
  { id: 'ing-9', name: 'Guaraná Lata',     qty: 80,   min: 20,   unit: 'un',  category: 'Bebidas'   },
  { id: 'ing-10',name: 'Água Mineral',     qty: 50,   min: 15,   unit: 'un',  category: 'Bebidas'   },
];

// ─── Initial Menu ─────────────────────────────────────────────────────────────
const defaultMenu = [
  { id: 'prod-1', name: 'Combo Japa Prime',       price: 89.90, category: 'Combos',        isActive: true, description: '15 peças variadas de salmão premium com cream cheese e cebolinha.', recipe: [{ ingredientId: 'ing-1', amount: 0.15 }, { ingredientId: 'ing-2', amount: 0.10 }, { ingredientId: 'ing-3', amount: 1 }, { ingredientId: 'ing-4', amount: 0.2 }] },
  { id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, category: 'Hot Rolls',     isActive: true, description: 'Hot roll de salmão grelhado, cream cheese, cebolinha e molho tarê.', recipe: [{ ingredientId: 'ing-1', amount: 0.10 }, { ingredientId: 'ing-2', amount: 0.08 }, { ingredientId: 'ing-3', amount: 0.5 }, { ingredientId: 'ing-4', amount: 0.1 }] },
  { id: 'prod-3', name: 'Temaki Salmão',          price: 38.00, category: 'Temakis',       isActive: true, description: 'Cone de alga crocante recheado com arroz e cubos frescos de salmão.', recipe: [{ ingredientId: 'ing-1', amount: 0.08 }, { ingredientId: 'ing-2', amount: 0.05 }, { ingredientId: 'ing-3', amount: 0.5 }] },
  { id: 'prod-4', name: 'Uramaki Skin (8pcs)',    price: 32.00, category: 'Uramakis',      isActive: true, description: 'Arroz por fora com recheio de pele de salmão grelhada crocante e molho tarê.', recipe: [{ ingredientId: 'ing-5', amount: 0.08 }, { ingredientId: 'ing-2', amount: 0.08 }, { ingredientId: 'ing-3', amount: 0.5 }] },
  { id: 'prod-5', name: 'Yakisoba Frango',        price: 45.00, category: 'Pratos Quentes',isActive: true, description: 'Macarrão oriental frito com pedaços de peito de frango e legumes frescos ao molho shoyu.', recipe: [{ ingredientId: 'ing-6', amount: 0.20 }, { ingredientId: 'ing-7', amount: 0.15 }, { ingredientId: 'ing-8', amount: 0.10 }] },
  { id: 'prod-6', name: 'Guaraná Antarctica',     price: 6.00,  category: 'Bebidas',       isActive: true, description: 'Lata 350ml bem gelada.', recipe: [{ ingredientId: 'ing-9', amount: 1 }] },
  { id: 'prod-7', name: 'Água Mineral',           price: 4.50,  category: 'Bebidas',       isActive: true, description: 'Garrafa 500ml sem gás.', recipe: [{ ingredientId: 'ing-10', amount: 1 }] },
];

// ─── Initial Employees ───────────────────────────────────────────────────────
const defaultEmployees = [
  { id: 'emp-1', name: 'João Silva',     role: 'Motoboy',    phone: '(11) 99999-1111', status: 'Ativo',  commission: 85.00, salesCount: 12 },
  { id: 'emp-2', name: 'Maria Oliveira', role: 'Caixa',      phone: '(11) 98888-2222', status: 'Ativo',  commission: 0.00,  salesCount: 0  },
  { id: 'emp-3', name: 'Pedro Santos',   role: 'Cozinheiro', phone: '(11) 97777-3333', status: 'Ativo',  commission: 0.00,  salesCount: 0  },
  { id: 'emp-4', name: 'Ana Costa',      role: 'Atendente',  phone: '(11) 96666-4444', status: 'Ativo',  commission: 25.00, salesCount: 5  },
  { id: 'emp-5', name: 'Lucas Lima',     role: 'Gerente',    phone: '(11) 95555-5555', status: 'Férias', commission: 0.00,  salesCount: 0  },
];

// ─── Initial Orders ──────────────────────────────────────────────────────────
const defaultOrders = [
  { id: '1261', customerName: 'Mesa 03',       phone: '',                address: '',                           channel: 'Balcão',   type: 'Mesa',      status: 'Preparando',  paymentMethod: 'Pix',     items: [{ id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 }, { id: 'prod-3', name: 'Temaki Salmão', price: 38.00, quantity: 2 }], subtotal: 165.90, deliveryFee: 0.00, total: 165.90, time: '21:40', date: '2026-06-01' },
  { id: '1260', customerName: 'Rodrigo Santos',phone: '(11) 98888-7777', address: 'Rua das Palmeiras, 450',     channel: 'iFood',    type: 'Delivery',  status: 'Preparando',  paymentMethod: 'iFood',   items: [{ id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, quantity: 2 }, { id: 'prod-6', name: 'Guaraná Antarctica', price: 6.00, quantity: 2 }], subtotal: 87.80, deliveryFee: 7.00, total: 94.80, time: '21:35', date: '2026-06-01' },
  { id: '1259', customerName: 'Mesa 08',       phone: '',                address: '',                           channel: 'Balcão',   type: 'Mesa',      status: 'Preparando',  paymentMethod: 'Crédito', items: [{ id: 'prod-5', name: 'Yakisoba Frango', price: 45.00, quantity: 1 }, { id: 'prod-7', name: 'Água Mineral', price: 4.50, quantity: 1 }], subtotal: 49.50, deliveryFee: 0.00, total: 49.50, time: '21:32', date: '2026-06-01' },
  { id: '1258', customerName: 'Julio Silva',   phone: '(11) 98765-4321', address: 'Av. Paulista, 1000 - Apto 42', channel: 'iFood',    type: 'Delivery',  status: 'Em entrega',  paymentMethod: 'iFood',   items: [{ id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 }],                                                                 subtotal: 89.90,  deliveryFee: 7.00, total: 96.90,  time: '21:30', date: '2026-06-01' },
  { id: '1257', customerName: 'Marta Oliveira',phone: '(11) 97654-3210', address: 'Rua das Flores, 123',         channel: 'WhatsApp', type: 'Delivery',  status: 'Preparando',  paymentMethod: 'Pix',     items: [{ id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, quantity: 1 }, { id: 'prod-6', name: 'Guaraná Antarctica', price: 6.00, quantity: 1 }], subtotal: 43.90, deliveryFee: 7.00, total: 50.90, time: '21:20', date: '2026-06-01' },
  { id: '1256', customerName: 'Pedro Santos',  phone: '(11) 96543-2109', address: 'Rua Acácio, 789',            channel: 'WhatsApp', type: 'Delivery',  status: 'Em entrega',  paymentMethod: 'Crédito', items: [{ id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 }, { id: 'prod-3', name: 'Temaki Salmão', price: 38.00, quantity: 1 }],      subtotal: 127.90, deliveryFee: 7.00, total: 134.90,time: '21:05', date: '2026-06-01' },
  { id: '1255', customerName: 'Ana Paula',     phone: '',                address: '',                           channel: 'Balcão',   type: 'Balcão',    status: 'Pronto',      paymentMethod: 'Débito',  items: [{ id: 'prod-5', name: 'Yakisoba Frango', price: 45.00, quantity: 1 }],                                                                    subtotal: 45.00,  deliveryFee: 0.00, total: 45.00,  time: '20:45', date: '2026-06-01' },
  { id: '1254', customerName: 'Lucas Lima',    phone: '(11) 95432-1098', address: 'Rua Japar, 250',            channel: 'WhatsApp', type: 'Retirada',  status: 'Preparando',  paymentMethod: 'Pix',     items: [{ id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, quantity: 2 }],                                                               subtotal: 75.80,  deliveryFee: 0.00, total: 75.80,  time: '20:30', date: '2026-06-01' },
  { id: '1253', customerName: 'Juliana Alves', phone: '',                address: '',                           channel: 'Balcão',   type: 'Mesa',      status: 'Finalizado',  paymentMethod: 'Dinheiro',items: [{ id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 }, { id: 'prod-7', name: 'Água Mineral', price: 4.50, quantity: 2 }],      subtotal: 98.90,  deliveryFee: 0.00, total: 98.90,  time: '19:15', date: '2026-06-01' },
];

// ─── Initial Tables ──────────────────────────────────────────────────────────
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

// ─── Settings ────────────────────────────────────────────────────────────────
const defaultSettings = {
  restaurantName: 'Sushi Japa Food Prime',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP',
  deliveryFee: 7.00,
  logoUrl: '',
  allowDiscounts: true,
  autoPrintReceipts: false,
  soundNotifications: true,
  autoBackup: true,
  whatsappTemplates: {
    received: 'Olá *{cliente}*! Recebemos seu pedido *#{id}*. Já está em preparação em nossa cozinha! 🍣',
    ready: 'Olá *{cliente}*! Boas notícias: seu pedido *#{id}* ficou pronto! 🛵',
    delivered: 'Olá *{cliente}*! Seu pedido *#{id}* foi finalizado. Agradecemos a preferência! 🙏'
  }
};

// ─── Cashier ─────────────────────────────────────────────────────────────────
const defaultCashier = {
  isOpen: true,
  openedBy: 'Benhur',
  openedAt: '2026-06-01 17:00',
  initialBalance: 500.00,
  transactions: [
    { type: 'suprimento', amount: 100.00, reason: 'Troco inicial extra', time: '17:30', user: 'Benhur' },
    { type: 'sangria',    amount: 50.00,  reason: 'Compra de gelo emergencial', time: '19:00', user: 'Benhur' }
  ],
  history: [
    { closedAt: '2026-05-31 23:30', openedBy: 'Maria Oliveira', closedBy: 'Lucas Lima', initialBalance: 500.00, expectedBalance: 2450.00, actualBalance: 2450.00, difference: 0, salesTotal: 1950.00 }
  ]
};

// ─── Goals ───────────────────────────────────────────────────────────────────
const defaultGoals = {
  dailyTarget: 10000.00,
  history: [
    { date: '2026-05-31', target: 8000.00, total: 7450.00,  percent: 93    },
    { date: '2026-05-30', target: 8000.00, total: 9850.00,  percent: 123   },
    { date: '2026-05-29', target: 8000.00, total: 8200.00,  percent: 102.5 },
    { date: '2026-05-28', target: 8000.00, total: 7500.00,  percent: 93.7  },
    { date: '2026-05-27', target: 8000.00, total: 9100.00,  percent: 113.7 },
  ]
};

// ─── Expenses (Despesas detalhadas) ──────────────────────────────────────────
const defaultExpenses = [
  {
    id: 'exp-1',
    date: '2026-06-01',
    time: '09:30',
    responsible: 'Benhur',
    partnerId: 'p-1',
    supplier: 'Feira Livre Central',
    category: 'Matéria-Prima',
    paymentMethod: 'Dinheiro',
    notes: 'Compra semanal de hortifrúti',
    items: [
      { product: 'Tomate',   qty: 5,  unit: 'kg', unitPrice: 6.00,  total: 30.00  },
      { product: 'Cebola',   qty: 3,  unit: 'kg', unitPrice: 4.50,  total: 13.50  },
      { product: 'Limão',    qty: 2,  unit: 'kg', unitPrice: 8.00,  total: 16.00  },
      { product: 'Coentro',  qty: 1,  unit: 'maço', unitPrice: 2.50, total: 2.50  },
    ],
    total: 62.00,
    attachment: null
  },
  {
    id: 'exp-2',
    date: '2026-06-01',
    time: '11:00',
    responsible: 'Benhur',
    partnerId: 'p-1',
    supplier: 'Peixaria do João',
    category: 'Matéria-Prima',
    paymentMethod: 'Pix',
    notes: 'Reposição de salmão fresco',
    items: [
      { product: 'Salmão Fresco', qty: 10, unit: 'kg', unitPrice: 65.00, total: 650.00 },
    ],
    total: 650.00,
    attachment: null
  },
  {
    id: 'exp-3',
    date: '2026-05-31',
    time: '14:00',
    responsible: 'Sócio 2',
    partnerId: 'p-2',
    supplier: 'Distribuidora Alfa',
    category: 'Embalagens',
    paymentMethod: 'Débito',
    notes: 'Caixas e sacolas para delivery',
    items: [
      { product: 'Caixa delivery P', qty: 200, unit: 'un', unitPrice: 0.80, total: 160.00 },
      { product: 'Caixa delivery G', qty: 100, unit: 'un', unitPrice: 1.20, total: 120.00 },
      { product: 'Sacola kraft',     qty: 500, unit: 'un', unitPrice: 0.30, total: 150.00 },
    ],
    total: 430.00,
    attachment: null
  }
];

// ─── Investments (Investimentos) ──────────────────────────────────────────────
const defaultInvestments = [
  { id: 'inv-1', date: '2026-05-15', description: 'Forno combinado Tramontina', category: 'Equipamentos', value: 4800.00, responsible: 'Benhur', partnerId: 'p-1', notes: 'Substituição do forno antigo' },
  { id: 'inv-2', date: '2026-05-01', description: 'Reforma do salão principal',  category: 'Reformas',     value: 8500.00, responsible: 'Sócio 2', partnerId: 'p-2', notes: 'Pintura e novos revestimentos' },
  { id: 'inv-3', date: '2026-04-20', description: 'Capital de giro Q2',         category: 'Capital',      value: 5000.00, responsible: 'Benhur', partnerId: 'p-1', notes: 'Aporte inicial segundo trimestre' },
];

// ─── Withdrawals (Retiradas) ─────────────────────────────────────────────────
const defaultWithdrawals = [
  { id: 'wd-1', date: '2026-05-31', time: '22:00', partnerId: 'p-1', partnerName: 'Benhur',  value: 1500.00, reason: 'Retirada mensal pro-labore' },
  { id: 'wd-2', date: '2026-05-31', time: '22:00', partnerId: 'p-2', partnerName: 'Sócio 2', value: 1500.00, reason: 'Retirada mensal pro-labore' },
  { id: 'wd-3', date: '2026-05-31', time: '22:00', partnerId: 'p-3', partnerName: 'Sócio 3', value: 1500.00, reason: 'Retirada mensal pro-labore' },
  { id: 'wd-4', date: '2026-05-31', time: '22:00', partnerId: 'p-4', partnerName: 'Sócio 4', value: 1500.00, reason: 'Retirada mensal pro-labore' },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────
const defaultAuditLog = [
  { id: 'al-1', date: '2026-06-01', time: '17:00', user: 'Benhur',        role: 'Sócio',   module: 'Caixa',     action: 'Abriu o caixa com saldo de R$ 500,00' },
  { id: 'al-2', date: '2026-06-01', time: '17:30', user: 'Benhur',        role: 'Sócio',   module: 'Caixa',     action: 'Registrou suprimento de R$ 100,00 – Troco inicial extra' },
  { id: 'al-3', date: '2026-06-01', time: '09:30', user: 'Benhur',        role: 'Sócio',   module: 'Financeiro',action: 'Registrou despesa de R$ 62,00 – Feira Livre Central' },
  { id: 'al-4', date: '2026-06-01', time: '11:00', user: 'Benhur',        role: 'Sócio',   module: 'Financeiro',action: 'Registrou despesa de R$ 650,00 – Peixaria do João (Salmão)' },
  { id: 'al-5', date: '2026-06-01', time: '19:00', user: 'Benhur',        role: 'Sócio',   module: 'Caixa',     action: 'Registrou sangria de R$ 50,00 – Compra de gelo emergencial' },
  { id: 'al-6', date: '2026-06-01', time: '21:30', user: 'Maria Oliveira',role: 'Caixa',   module: 'Pedidos',   action: 'Criou pedido #1258 para Julio Silva – R$ 96,90 (iFood)' },
  { id: 'al-7', date: '2026-05-31', time: '14:00', user: 'Sócio 2',       role: 'Sócio',   module: 'Financeiro',action: 'Registrou despesa de R$ 430,00 – Distribuidora Alfa (Embalagens)' },
];

export const AppProvider = ({ children }) => {
  // Core state populated with default data as fallback
  const [users, setUsers]       = useState(defaultUsers);
  const [partners, setPartners] = useState(defaultPartners);
  const [currentUser, setCurrentUser] = useState(null);

  // Operational state
  const [cashier,    setCashier]    = useState(defaultCashier);
  const [menu,       setMenu]       = useState(defaultMenu);
  const [inventory,  setInventory]  = useState(defaultInventory);
  const [employees,  setEmployees]  = useState(defaultEmployees);
  const [orders,     setOrders]     = useState(defaultOrders);
  const [tables,     setTables]     = useState(defaultTables);
  const [settings,   setSettings]   = useState(defaultSettings);
  const [goals,      setGoals]      = useState(defaultGoals);
  const [whatsappLogs, setWhatsappLogs] = useState([]);

  // Financial state
  const [expenses,     setExpenses]     = useState([]);
  const [investments,  setInvestments]  = useState([]);
  const [withdrawals,  setWithdrawals]  = useState([]);
  const [auditLog,     setAuditLog]     = useState([]);

  // ─── Mappings between Database (snake_case) and UI (camelCase) ───
  const mapDbToUser = (u) => {
    if (!u) return null;
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      partnerId: u.partner_id,
      isPartner: u.is_partner
    };
  };

  const mapDbToPartner = (p) => {
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      share: Number(p.share),
      userId: p.user_id,
      color: p.color
    };
  };

  const mapPartnerToDb = (p) => {
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      share: p.share,
      user_id: p.userId,
      color: p.color
    };
  };

  const mapDbToMenu = (m) => {
    if (!m) return null;
    return {
      id: m.id,
      name: m.name,
      price: Number(m.price),
      category: m.category,
      isActive: m.is_active,
      description: m.description,
      recipe: m.recipe
    };
  };

  const mapMenuToDb = (m) => {
    if (!m) return null;
    return {
      id: m.id,
      name: m.name,
      price: m.price,
      category: m.category,
      is_active: m.isActive,
      description: m.description,
      recipe: m.recipe
    };
  };

  const mapDbToEmployee = (e) => {
    if (!e) return null;
    return {
      id: e.id,
      name: e.name,
      role: e.role,
      phone: e.phone,
      status: e.status,
      commission: Number(e.commission),
      salesCount: e.sales_count
    };
  };

  const mapEmployeeToDb = (e) => {
    if (!e) return null;
    return {
      id: e.id,
      name: e.name,
      role: e.role,
      phone: e.phone,
      status: e.status,
      commission: e.commission,
      sales_count: e.salesCount
    };
  };

  const mapDbToOrder = (o) => {
    if (!o) return null;
    return {
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
    };
  };

  const mapOrderToDb = (o) => {
    if (!o) return null;
    return {
      id: o.id,
      customer_name: o.customerName,
      phone: o.phone,
      address: o.address,
      channel: o.channel,
      type: o.type,
      status: o.status,
      payment_method: o.paymentMethod,
      items: o.items,
      subtotal: o.subtotal,
      delivery_fee: o.deliveryFee,
      total: o.total,
      time: o.time,
      date: o.date,
      waiter_id: o.waiterId
    };
  };

  const mapDbToTable = (t) => {
    if (!t) return null;
    return {
      id: t.id,
      number: t.number,
      status: t.status,
      items: t.items,
      openedAt: t.opened_at,
      waiterId: t.waiter_id
    };
  };

  const mapTableToDb = (t) => {
    if (!t) return null;
    return {
      id: t.id,
      number: t.number,
      status: t.status,
      items: t.items,
      opened_at: t.openedAt,
      waiter_id: t.waiterId
    };
  };

  const mapDbToSettings = (s) => {
    if (!s) return null;
    return {
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
    };
  };

  const mapSettingsToDb = (s) => {
    if (!s) return null;
    return {
      id: 1,
      restaurant_name: s.restaurantName,
      cnpj: s.cnpj,
      phone: s.phone,
      address: s.address,
      delivery_fee: s.deliveryFee,
      logo_url: s.logoUrl,
      allow_discounts: s.allowDiscounts,
      auto_print_receipts: s.autoPrintReceipts,
      sound_notifications: s.soundNotifications,
      auto_backup: s.autoBackup,
      whatsapp_templates: s.whatsappTemplates
    };
  };

  const mapDbToCashier = (c) => {
    if (!c) return null;
    return {
      isOpen: c.is_open,
      openedBy: c.opened_by,
      openedAt: c.opened_at,
      initialBalance: Number(c.initial_balance),
      transactions: c.transactions
    };
  };

  const mapDbToCashierHistory = (h) => {
    if (!h) return null;
    return {
      closedAt: h.closed_at,
      openedBy: h.opened_by,
      closedBy: h.closed_by,
      initialBalance: Number(h.initial_balance),
      expectedBalance: Number(h.expected_balance),
      actualBalance: Number(h.actual_balance),
      difference: Number(h.difference),
      salesTotal: Number(h.sales_total)
    };
  };

  const mapDbToGoal = (g) => {
    if (!g) return null;
    return {
      dailyTarget: Number(g.daily_target),
      history: g.history
    };
  };

  const mapDbToExpense = (e) => {
    if (!e) return null;
    return {
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
    };
  };

  const mapExpenseToDb = (e) => {
    if (!e) return null;
    return {
      id: e.id,
      date: e.date,
      time: e.time,
      responsible: e.responsible,
      partner_id: e.partnerId,
      supplier: e.supplier,
      category: e.category,
      payment_method: e.paymentMethod,
      notes: e.notes,
      items: e.items,
      total: e.total,
      attachment: e.attachment
    };
  };

  const mapDbToInvestment = (i) => {
    if (!i) return null;
    return {
      id: i.id,
      date: i.date,
      description: i.description,
      category: i.category,
      value: Number(i.value),
      responsible: i.responsible,
      partnerId: i.partner_id,
      notes: i.notes
    };
  };

  const mapInvestmentToDb = (i) => {
    if (!i) return null;
    return {
      id: i.id,
      date: i.date,
      description: i.description,
      category: i.category,
      value: i.value,
      responsible: i.responsible,
      partner_id: i.partnerId,
      notes: i.notes
    };
  };

  const mapDbToWithdrawal = (w) => {
    if (!w) return null;
    return {
      id: w.id,
      date: w.date,
      time: w.time,
      partnerId: w.partner_id,
      partnerName: w.partner_name,
      value: Number(w.value),
      reason: w.reason
    };
  };

  const mapWithdrawalToDb = (w) => {
    if (!w) return null;
    return {
      id: w.id,
      date: w.date,
      time: w.time,
      partner_id: w.partnerId,
      partner_name: w.partnerName,
      value: w.value,
      reason: w.reason
    };
  };

  // ─── Fetch Data from Supabase ───
  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) setUsers(userData.map(mapDbToUser));

      const { data: partnerData } = await supabase.from('partners').select('*');
      if (partnerData) setPartners(partnerData.map(mapDbToPartner));

      const { data: menuData } = await supabase.from('menu').select('*');
      if (menuData) setMenu(menuData.map(mapDbToMenu));

      const { data: invData } = await supabase.from('inventory').select('*');
      if (invData) setInventory(invData);

      const { data: empData } = await supabase.from('employees').select('*');
      if (empData) setEmployees(empData.map(mapDbToEmployee));

      const { data: ordersData } = await supabase.from('orders').select('*');
      if (ordersData) {
        const mappedOrders = ordersData.map(mapDbToOrder);
        setOrders(mappedOrders.sort((a, b) => b.id.localeCompare(a.id)));
      }

      const { data: tablesData } = await supabase.from('tables').select('*');
      if (tablesData) {
        const mappedTables = tablesData.map(mapDbToTable);
        setTables(mappedTables.sort((a, b) => a.number.localeCompare(b.number)));
      }

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (settingsData) setSettings(mapDbToSettings(settingsData));

      const { data: cashierData } = await supabase.from('cashier').select('*').eq('id', 1).maybeSingle();
      const { data: cashierHistData } = await supabase.from('cashier_history').select('*');
      if (cashierData) {
        const mappedHistory = cashierHistData ? cashierHistData.map(mapDbToCashierHistory) : [];
        setCashier({
          ...mapDbToCashier(cashierData),
          history: mappedHistory.sort((a, b) => b.closedAt.localeCompare(a.closedAt))
        });
      }

      const { data: goalsData } = await supabase.from('goals').select('*').eq('id', 1).maybeSingle();
      if (goalsData) setGoals(mapDbToGoal(goalsData));

      const { data: expData } = await supabase.from('expenses').select('*');
      if (expData) setExpenses(expData.map(mapDbToExpense));

      const { data: invsData } = await supabase.from('investments').select('*');
      if (invsData) setInvestments(invsData.map(mapDbToInvestment));

      const { data: wdsData } = await supabase.from('withdrawals').select('*');
      if (wdsData) setWithdrawals(wdsData.map(mapDbToWithdrawal));

      const { data: auditData } = await supabase.from('audit_log').select('*').order('date', { ascending: false }).order('time', { ascending: false }).limit(200);
      if (auditData) setAuditLog(auditData);

      const { data: wppLogs } = await supabase.from('whatsapp_logs').select('*').order('time', { ascending: false }).limit(100);
      if (wppLogs) setWhatsappLogs(wppLogs);

    } catch (err) {
      console.error('Erro ao buscar dados do Supabase:', err);
    }
  };

  // ─── Setup Subscriptions and Initial Load ───
  useEffect(() => {
    fetchData();

    // Sincronização em tempo real de pedidos
    const ordersChannel = supabase
      .channel('realtime:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newOrder = mapDbToOrder(payload.new);
          setOrders(prev => {
            if (prev.some(o => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapDbToOrder(payload.new);
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    // Sincronização em tempo real de mesas
    const tablesChannel = supabase
      .channel('realtime:tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, payload => {
        if (payload.eventType === 'UPDATE') {
          const updated = mapDbToTable(payload.new);
          setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, []);

  // ─── Audit Log Helper ───
  const addAuditEntry = async (module, action, user = null) => {
    const actor = user || currentUser;
    if (!actor) return;
    const now = new Date();
    const entry = {
      id: `al-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: actor.name,
      role: actor.role,
      module,
      action
    };
    await supabase.from('audit_log').insert(entry);
    setAuditLog(prev => [entry, ...prev]);
  };

  // ─── Auth ───
  const loginWithCredentials = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return { success: false, error: 'Usuário ou senha incorretos.' };
      }

      const safeUser = mapDbToUser(data);
      setCurrentUser(safeUser);

      // Log de Auditoria
      const now = new Date();
      const auditEntry = {
        id: `al-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        user: safeUser.name,
        role: safeUser.role,
        module: 'Login',
        action: `Entrou no sistema com perfil: ${safeUser.role}`
      };
      await supabase.from('audit_log').insert(auditEntry);
      setAuditLog(prev => [auditEntry, ...prev]);

      return { success: true, user: safeUser };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao autenticar no servidor.' };
    }
  };

  const login = async (role) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('role', role).limit(1);
      if (data && data.length > 0) {
        const safeUser = mapDbToUser(data[0]);
        setCurrentUser(safeUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      addAuditEntry('Login', `Saiu do sistema`);
    }
    setCurrentUser(null);
  };

  // ─── Financial Operations ───
  const addExpense = async (expenseData) => {
    const id = `exp-${Date.now()}`;
    const now = new Date();
    const newExpense = {
      id,
      date: expenseData.date || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      responsible: currentUser?.name || expenseData.responsible,
      partnerId: currentUser?.partnerId || null,
      ...expenseData,
    };
    await supabase.from('expenses').insert(mapExpenseToDb(newExpense));
    setExpenses(prev => [newExpense, ...prev]);
    await addAuditEntry('Financeiro', `Registrou despesa de R$ ${newExpense.total?.toFixed(2)} – ${newExpense.supplier} (${newExpense.category})`);
    return id;
  };

  const addInvestment = async (data) => {
    const id = `inv-${Date.now()}`;
    const now = new Date();
    const newInv = {
      id,
      date: data.date || now.toISOString().split('T')[0],
      responsible: currentUser?.name || data.responsible,
      partnerId: currentUser?.partnerId || null,
      ...data,
    };
    await supabase.from('investments').insert(mapInvestmentToDb(newInv));
    setInvestments(prev => [newInv, ...prev]);
    await addAuditEntry('Financeiro', `Registrou investimento de R$ ${newInv.value?.toFixed(2)} – ${newInv.description} (${newInv.category})`);
    return id;
  };

  const addWithdrawal = async (data) => {
    const id = `wd-${Date.now()}`;
    const now = new Date();
    const partner = partners.find(p => p.id === (currentUser?.partnerId || data.partnerId));
    const newWd = {
      id,
      date: data.date || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      partnerId: currentUser?.partnerId || data.partnerId,
      partnerName: partner?.name || currentUser?.name || data.partnerName,
      ...data,
    };
    await supabase.from('withdrawals').insert(mapWithdrawalToDb(newWd));
    setWithdrawals(prev => [newWd, ...prev]);
    await addAuditEntry('Financeiro', `Registrou retirada de R$ ${newWd.value?.toFixed(2)} – ${newWd.reason}`);
    return id;
  };

  const deleteExpense = async (id) => {
    const exp = expenses.find(e => e.id === id);
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    await addAuditEntry('Financeiro', `Excluiu despesa de R$ ${exp?.total?.toFixed(2)} – ${exp?.supplier}`);
  };

  const deleteInvestment = async (id) => {
    const inv = investments.find(i => i.id === id);
    await supabase.from('investments').delete().eq('id', id);
    setInvestments(prev => prev.filter(i => i.id !== id));
    await addAuditEntry('Financeiro', `Excluiu investimento: ${inv?.description}`);
  };

  const updatePartner = async (id, fields) => {
    await supabase.from('partners').update(fields).eq('id', id);
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
  };

  // ─── Cashier Operations ───
  const openCashier = async (balance, username) => {
    const now = new Date().toLocaleString('pt-BR');
    const opener = username || currentUser?.name;
    const fields = {
      is_open: true,
      opened_by: opener,
      opened_at: now,
      initial_balance: Number(balance),
      transactions: []
    };
    await supabase.from('cashier').update(fields).eq('id', 1);
    setCashier(prev => ({ ...prev, ...mapDbToCashier(fields) }));
    await addAuditEntry('Caixa', `Abriu o caixa com saldo de R$ ${Number(balance).toFixed(2)}`);
  };

  const closeCashier = async (actualCash, actualPix, actualDebit, actualCredit, actualIfood) => {
    const now = new Date().toLocaleString('pt-BR');
    const salesBreakdown = calculateSalesTotal();
    const suprimentosTotal = cashier.transactions.filter(t => t.type === 'suprimento').reduce((s, t) => s + t.amount, 0);
    const sangriasTotal    = cashier.transactions.filter(t => t.type === 'sangria').reduce((s, t) => s + t.amount, 0);
    const expectedCash     = salesBreakdown.dinheiro + cashier.initialBalance + suprimentosTotal - sangriasTotal;
    const actualTotal      = Number(actualCash) + Number(actualPix) + Number(actualDebit) + Number(actualCredit) + Number(actualIfood);
    const expectedTotal    = expectedCash + salesBreakdown.pix + salesBreakdown.debit + salesBreakdown.credit + salesBreakdown.ifood;
    const difference       = actualTotal - expectedTotal;

    const newCloseLog = {
      closed_at: now,
      opened_by: cashier.openedBy,
      closed_by: currentUser?.name,
      initial_balance: cashier.initialBalance,
      expected_balance: expectedTotal,
      actual_balance: actualTotal,
      difference,
      sales_total: salesBreakdown.total
    };

    await supabase.from('cashier_history').insert(newCloseLog);

    const updatedCashier = {
      is_open: false,
      transactions: []
    };
    await supabase.from('cashier').update(updatedCashier).eq('id', 1);

    const uiCloseLog = mapDbToCashierHistory(newCloseLog);
    setCashier(prev => ({
      ...prev,
      isOpen: false,
      transactions: [],
      history: [uiCloseLog, ...prev.history]
    }));
    await addAuditEntry('Caixa', `Fechou o caixa. Total apurado: R$ ${actualTotal.toFixed(2)} | Diferença: R$ ${difference.toFixed(2)}`);
  };

  const addCashierTransaction = async (type, amount, reason) => {
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const tx = { type, amount: Number(amount), reason, time: now, user: currentUser?.name };
    const updatedTxList = [...cashier.transactions, tx];
    
    await supabase.from('cashier').update({ transactions: updatedTxList }).eq('id', 1);
    setCashier(prev => ({ ...prev, transactions: updatedTxList }));
    
    const label = type === 'sangria' ? 'Sangria' : 'Suprimento';
    await addAuditEntry('Caixa', `Registrou ${label} de R$ ${Number(amount).toFixed(2)} – ${reason}`);
  };

  const calculateSalesTotal = () => {
    const completedOrders = orders.filter(o => o.status === 'Finalizado');
    const bd = { dinheiro: 0, pix: 0, debit: 0, credit: 0, ifood: 0, total: 0 };
    completedOrders.forEach(o => {
      const pay = o.paymentMethod.toLowerCase();
      if (pay === 'dinheiro') bd.dinheiro += o.total;
      else if (pay === 'pix') bd.pix += o.total;
      else if (pay === 'débito' || pay === 'debito') bd.debit += o.total;
      else if (pay === 'crédito' || pay === 'credito') bd.credit += o.total;
      else if (pay === 'ifood') bd.ifood += o.total;
      bd.total += o.total;
    });
    return bd;
  };

  // ─── Inventory ───
  const deductIngredientsForItems = async (items) => {
    const updatedIngredients = [];
    const nextInventory = inventory.map(ing => {
      let deduct = 0;
      items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.id);
        if (menuItem?.recipe) {
          const step = menuItem.recipe.find(r => r.ingredientId === ing.id);
          if (step) deduct += step.amount * item.quantity;
        }
      });
      if (deduct > 0) {
        const newQty = Math.max(0, Number((ing.qty - deduct).toFixed(2)));
        updatedIngredients.push({ id: ing.id, qty: newQty });
        return { ...ing, qty: newQty };
      }
      return ing;
    });

    for (const item of updatedIngredients) {
      await supabase.from('inventory').update({ qty: item.qty }).eq('id', item.id);
    }
    setInventory(nextInventory);
  };

  const updateInventoryItem = async (id, newQty) => {
    await supabase.from('inventory').update({ qty: Number(newQty) }).eq('id', id);
    setInventory(prev => prev.map(ing => ing.id === id ? { ...ing, qty: Number(newQty) } : ing));
  };

  const addInventoryItem = async (item) => {
    const id = `ing-${Date.now()}`;
    const newItem = { id, ...item, qty: Number(item.qty), min: Number(item.min) };
    await supabase.from('inventory').insert(newItem);
    setInventory(prev => [...prev, newItem]);
    await addAuditEntry('Estoque', `Adicionou item ao estoque: ${item.name} (${item.qty} ${item.unit})`);
  };

  // ─── Menu ───
  const updateMenuItem = async (id, fields) => {
    await supabase.from('menu').update(mapMenuToDb({ id, ...fields })).eq('id', id);
    setMenu(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
  };

  const addMenuItem = async (product) => {
    const id = `prod-${Date.now()}`;
    const newItem = { id, ...product, price: Number(product.price), isActive: true };
    await supabase.from('menu').insert(mapMenuToDb(newItem));
    setMenu(prev => [...prev, newItem]);
  };

  // ─── WhatsApp (Real Dispatch) ───
  const triggerWhatsAppSimulation = async (customerName, phone, orderId, type) => {
    if (!phone) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let text = '';
    if (type === 'received') text = settings.whatsappTemplates.received.replace('{cliente}', customerName).replace('{id}', orderId);
    else if (type === 'ready')    text = settings.whatsappTemplates.ready.replace('{cliente}', customerName).replace('{id}', orderId);
    else if (type === 'delivered')text = settings.whatsappTemplates.delivered.replace('{cliente}', customerName).replace('{id}', orderId);
    
    const typeLabel = type === 'received' ? 'Recebido' : type === 'ready' ? 'Pronto' : 'Entrega';
    const logId = `log-${Date.now()}`;
    
    const logEntry = {
      id: logId,
      client: customerName,
      phone,
      type: typeLabel,
      text,
      status: 'Enviando',
      time: now
    };

    setWhatsappLogs(prev => [logEntry, ...prev]);

    const result = await sendWhatsAppMessage(phone, text);
    const finalStatus = result.success ? 'Enviado' : 'Falhou';
    const finalEntry = { ...logEntry, status: finalStatus };

    await supabase.from('whatsapp_logs').insert(finalEntry);
    setWhatsappLogs(prev => prev.map(l => l.id === logId ? finalEntry : l));
  };

  // ─── Orders ───
  const createOrder = async (orderData) => {
    let maxId = 1200;
    if (orders.length > 0) {
      const ids = orders.map(o => parseInt(o.id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        maxId = Math.max(...ids);
      }
    }
    const id = String(maxId + 1);
    
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toISOString().split('T')[0];
    const newOrder = { id, ...orderData, time, date, status: orderData.status || 'Preparando' };

    await supabase.from('orders').insert(mapOrderToDb(newOrder));
    setOrders(prev => [newOrder, ...prev]);
    
    await deductIngredientsForItems(orderData.items);
    
    if (orderData.waiterId) {
      const waiter = employees.find(e => e.id === orderData.waiterId);
      if (waiter) {
        const newComm = Number((waiter.commission + orderData.subtotal * 0.05).toFixed(2));
        const newCount = waiter.salesCount + 1;
        await supabase.from('employees').update({ commission: newComm, sales_count: newCount }).eq('id', waiter.id);
        setEmployees(prev => prev.map(emp => emp.id === waiter.id ? { ...emp, commission: newComm, salesCount: newCount } : emp));
      }
    }
    
    if (orderData.phone) {
      await triggerWhatsAppSimulation(orderData.customerName, orderData.phone, id, 'received');
    }
    
    await addAuditEntry('Pedidos', `Criou pedido #${id} para ${orderData.customerName} – R$ ${orderData.total?.toFixed(2)} (${orderData.channel})`);
    return id;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return;

    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (newStatus === 'Em entrega' || newStatus === 'Pronto') {
      await triggerWhatsAppSimulation(originalOrder.customerName, originalOrder.phone, originalOrder.id, 'ready');
    } else if (newStatus === 'Finalizado') {
      await triggerWhatsAppSimulation(originalOrder.customerName, originalOrder.phone, originalOrder.id, 'delivered');
      
      if (originalOrder.type === 'Delivery') {
        const activeMotoboy = employees.find(emp => emp.role === 'Motoboy' && emp.status === 'Ativo');
        if (activeMotoboy) {
          const newComm = activeMotoboy.commission + 5.00;
          const newCount = activeMotoboy.salesCount + 1;
          await supabase.from('employees').update({ commission: newComm, sales_count: newCount }).eq('id', activeMotoboy.id);
          setEmployees(empPrev => empPrev.map(emp => emp.id === activeMotoboy.id ? { ...emp, commission: newComm, salesCount: newCount } : emp));
        }
      }
    }
    
    await addAuditEntry('Pedidos', `Atualizou status do pedido #${orderId} para: ${newStatus}`);
  };

  // ─── Tables ───
  const addItemsToTable = async (tableId, newItems) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const updatedItems = [...table.items];
    newItems.forEach(ni => {
      const idx = updatedItems.findIndex(i => i.id === ni.id);
      if (idx > -1) updatedItems[idx].quantity += ni.quantity;
      else updatedItems.push({ ...ni });
    });

    const updatedFields = {
      status: 'Ocupada',
      items: updatedItems,
      opened_at: table.openedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waiter_id: table.waiterId || 'emp-4'
    };

    await supabase.from('tables').update(updatedFields).eq('id', tableId);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, ...mapDbToTable({ id: tableId, ...updatedFields }) } : t));
  };

  const transferTable = async (fromId, toId) => {
    const fromTable = tables.find(t => t.id === fromId);
    const toTable = tables.find(t => t.id === toId);
    if (!fromTable || fromTable.items.length === 0 || !toTable) return;

    const mergedItems = [...toTable.items, ...fromTable.items];
    const openedAt = toTable.openedAt || fromTable.openedAt;
    const waiterId = toTable.waiterId || fromTable.waiterId;

    const toFields = {
      status: 'Ocupada',
      items: mergedItems,
      opened_at: openedAt,
      waiter_id: waiterId
    };
    await supabase.from('tables').update(toFields).eq('id', toId);

    const fromFields = {
      status: 'Livre',
      items: [],
      opened_at: null,
      waiter_id: null
    };
    await supabase.from('tables').update(fromFields).eq('id', fromId);

    setTables(prev => prev.map(t => {
      if (t.id === toId) return { ...t, ...mapDbToTable({ id: toId, ...toFields }) };
      if (t.id === fromId) return { ...t, ...mapDbToTable({ id: fromId, ...fromFields }) };
      return t;
    }));

    await addAuditEntry('Comandas', `Transferiu itens da Mesa ${fromTable.number} para Mesa ${toTable.number}`);
  };

  const requestTableBill = async (tableId) => {
    await supabase.from('tables').update({ status: 'Conta Solicitada' }).eq('id', tableId);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'Conta Solicitada' } : t));
  };

  const closeTableAccount = async (tableId, paymentMethod) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || table.items.length === 0) return;
    const subtotal = table.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await createOrder({
      customerName: `Mesa ${table.number}`,
      phone: '',
      address: '',
      channel: 'Balcão',
      type: 'Mesa',
      status: 'Finalizado',
      paymentMethod,
      items: table.items,
      subtotal,
      deliveryFee: 0.00,
      total: subtotal,
      waiterId: table.waiterId
    });

    const resetFields = {
      status: 'Livre',
      items: [],
      opened_at: null,
      waiter_id: null
    };
    await supabase.from('tables').update(resetFields).eq('id', tableId);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, ...mapDbToTable({ id: tableId, ...resetFields }) } : t));
  };

  // ─── Employees ───
  const addEmployee = async (emp) => {
    const id = `emp-${Date.now()}`;
    const newEmp = { id, ...emp, commission: 0.00, salesCount: 0 };
    await supabase.from('employees').insert(mapEmployeeToDb(newEmp));
    setEmployees(prev => [...prev, newEmp]);
    await addAuditEntry('Funcionários', `Cadastrou funcionário: ${emp.name} (${emp.role})`);
  };

  const updateEmployee = async (id, fields) => {
    await supabase.from('employees').update(mapEmployeeToDb({ id, ...fields })).eq('id', id);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
  };

  // ─── Settings ───
  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    await supabase.from('settings').update(mapSettingsToDb(merged)).eq('id', 1);
    setSettings(merged);
  };

  // ─── Reset / Restore Database Defaults ───
  const resetAllData = async () => {
    ['cashier','menu','inventory','employees','orders','tables','settings','goals','whatsappLogs','expenses','investments','withdrawals','auditLog','partners'].forEach(k => localStorage.removeItem(`japa_${k}`));
    
    try {
      await supabase.from('orders').delete().neq('id', '0');
      await supabase.from('expenses').delete().neq('id', '0');
      await supabase.from('investments').delete().neq('id', '0');
      await supabase.from('withdrawals').delete().neq('id', '0');
      await supabase.from('audit_log').delete().neq('id', '0');
      await supabase.from('whatsapp_logs').delete().neq('id', '0');
      
      await supabase.from('cashier').update({
        is_open: true,
        opened_by: 'Benhur',
        opened_at: '2026-06-01 17:00',
        initial_balance: 500.00,
        transactions: defaultCashier.transactions
      }).eq('id', 1);
      
      await supabase.from('goals').update({
        daily_target: 10000.00,
        history: defaultGoals.history
      }).eq('id', 1);
      
      await supabase.from('settings').update(mapSettingsToDb(defaultSettings)).eq('id', 1);
      
      for (const t of defaultTables) {
        await supabase.from('tables').update(mapTableToDb(t)).eq('id', t.id);
      }

      await fetchData();
      setCurrentUser(null);
    } catch (err) {
      console.error('Erro ao resetar banco de dados:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      // State
      currentUser, users, partners, cashier, menu, inventory, employees,
      orders, tables, settings, goals, whatsappLogs,
      expenses, investments, withdrawals, auditLog,
      // Auth
      loginWithCredentials, login, logout,
      // Financial
      addExpense, addInvestment, addWithdrawal,
      deleteExpense, deleteInvestment, updatePartner,
      // Cashier
      openCashier, closeCashier, addCashierTransaction, calculateSalesTotal,
      // Orders
      createOrder, updateOrderStatus,
      // Tables
      addItemsToTable, transferTable, requestTableBill, closeTableAccount,
      // Inventory / Menu
      updateInventoryItem, addInventoryItem, updateMenuItem, addMenuItem,
      // Employees
      addEmployee, updateEmployee,
      // Settings
      updateSettings, resetAllData,
      // Audit
      addAuditEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
};
