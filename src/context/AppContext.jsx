import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const AppContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AppProvider = ({ children }) => {
  // States
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [cashier, setCashier] = useState({
    isOpen: false,
    openedBy: '',
    openedAt: '',
    initialBalance: 0,
    transactions: [],
    history: []
  });
  const [menu, setMenu] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState({
    restaurantName: '',
    cnpj: '',
    phone: '',
    address: '',
    deliveryFee: 0,
    logoUrl: '',
    allowDiscounts: true,
    autoPrintReceipts: false,
    soundNotifications: true,
    autoBackup: true
  });
  const [goals, setGoals] = useState({ dailyTarget: 0, history: [] });

  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // Helper for Headers
  const getHeaders = () => {
    const token = localStorage.getItem('japa_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // ─── Fetch Individual Data Sections (Reusable) ───
  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/operational/inventory`, { headers: getHeaders() });
      if (res.ok) setInventory(await res.json());
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/operational/employees`, { headers: getHeaders() });
      if (res.ok) setEmployees(await res.json());
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('japa_token');
      if (!token) return;

      // 1. Validar usuário atual
      const meRes = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      } else {
        localStorage.removeItem('japa_token');
        setCurrentUser(null);
        return;
      }

      // 2. Buscar dados operacionais
      const usersRes = await fetch(`${API_URL}/operational/users`, { headers: getHeaders() });
      if (usersRes.ok) setUsers(await usersRes.json());

      const partnersRes = await fetch(`${API_URL}/operational/partners`, { headers: getHeaders() });
      if (partnersRes.ok) setPartners(await partnersRes.json());

      const menuRes = await fetch(`${API_URL}/operational/menu`, { headers: getHeaders() });
      if (menuRes.ok) setMenu(await menuRes.json());

      fetchInventory();
      fetchEmployees();

      const settingsRes = await fetch(`${API_URL}/operational/settings`, { headers: getHeaders() });
      if (settingsRes.ok) setSettings(await settingsRes.json());

      const goalsRes = await fetch(`${API_URL}/operational/goals`, { headers: getHeaders() });
      if (goalsRes.ok) setGoals(await goalsRes.json());

      // 3. Buscar pedidos e mesas
      const ordersRes = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      const tablesRes = await fetch(`${API_URL}/tables`, { headers: getHeaders() });
      if (tablesRes.ok) setTables(await tablesRes.json());

      // 4. Buscar dados financeiros
      const cashierRes = await fetch(`${API_URL}/finance/cashier`, { headers: getHeaders() });
      if (cashierRes.ok) setCashier(await cashierRes.json());

      const expRes = await fetch(`${API_URL}/finance/expenses`, { headers: getHeaders() });
      if (expRes.ok) setExpenses(await expRes.json());

      const invsRes = await fetch(`${API_URL}/finance/investments`, { headers: getHeaders() });
      if (invsRes.ok) setInvestments(await invsRes.json());

      const wdsRes = await fetch(`${API_URL}/finance/withdrawals`, { headers: getHeaders() });
      if (wdsRes.ok) setWithdrawals(await wdsRes.json());

      // 5. Buscar logs e auditoria
      const auditRes = await fetch(`${API_URL}/audit`, { headers: getHeaders() });
      if (auditRes.ok) setAuditLog(await auditRes.json());

    } catch (err) {
      console.error('Erro ao buscar dados do servidor backend:', err);
    }
  };

  // ─── Setup Socket.io and Initial Fetch ───
  useEffect(() => {
    const token = localStorage.getItem('japa_token');
    if (token) {
      fetchData();
    }

    // Inicializa conexão Socket.io
    const socket = io(SOCKET_URL);

    socket.on('order_created', (newOrder) => {
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    socket.on('table_updated', (updatedTable) => {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    });

    socket.on('table_status_changed', ({ id, status }) => {
      setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    });



    socket.on('employees_updated', () => {
      fetchEmployees();
    });

    socket.on('inventory_updated', () => {
      fetchInventory();
    });

    socket.on('database_reset', () => {
      fetchData();
      setCurrentUser(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ─── Audit Log Helper ───
  const addAuditEntry = async (module, action) => {
    try {
      const res = await fetch(`${API_URL}/audit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ module, action })
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLog(prev => [data.entry, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Auth ───
  const loginWithCredentials = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Usuário ou senha incorretos.' };
      }

      const data = await res.json();
      localStorage.setItem('japa_token', data.token);
      setCurrentUser(data.user);
      
      // Carregar todos os dados do sistema após login
      setTimeout(() => fetchData(), 50);

      return { success: true, user: data.user };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao autenticar no servidor.' };
    }
  };

  const login = async (role) => {
    try {
      const res = await fetch(`${API_URL}/auth/login-by-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('japa_token', data.token);
        setCurrentUser(data.user);
        setTimeout(() => fetchData(), 50);
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
    localStorage.removeItem('japa_token');
    setCurrentUser(null);
  };

  // ─── Financial Operations ───
  const addExpense = async (expenseData) => {
    try {
      const res = await fetch(`${API_URL}/finance/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(prev => [data.expense, ...prev]);
        addAuditEntry('Financeiro', `Registrou despesa de R$ ${data.expense.total?.toFixed(2)} – ${data.expense.supplier} (${data.expense.category})`);
        return data.expense.id;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const addInvestment = async (invData) => {
    try {
      const res = await fetch(`${API_URL}/finance/investments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(invData)
      });
      if (res.ok) {
        const data = await res.json();
        setInvestments(prev => [data.investment, ...prev]);
        addAuditEntry('Financeiro', `Registrou investimento de R$ ${data.investment.value?.toFixed(2)} – ${data.investment.description} (${data.investment.category})`);
        return data.investment.id;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const addWithdrawal = async (wdData) => {
    try {
      const res = await fetch(`${API_URL}/finance/withdrawals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(wdData)
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(prev => [data.withdrawal, ...prev]);
        addAuditEntry('Financeiro', `Registrou retirada de R$ ${data.withdrawal.value?.toFixed(2)} – ${data.withdrawal.reason}`);
        return data.withdrawal.id;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const deleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_URL}/finance/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(prev => prev.filter(e => e.id !== id));
        addAuditEntry('Financeiro', `Excluiu despesa de R$ ${data.expense?.total} – ${data.expense?.supplier}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInvestment = async (id) => {
    try {
      const res = await fetch(`${API_URL}/finance/investments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setInvestments(prev => prev.filter(i => i.id !== id));
        addAuditEntry('Financeiro', `Excluiu investimento: ${data.investment?.description}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updatePartner = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/operational/partners/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        setPartners(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Cashier Operations ───
  const openCashier = async (balance, username) => {
    try {
      const res = await fetch(`${API_URL}/finance/cashier/open`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ balance, openedBy: username })
      });
      if (res.ok) {
        const data = await res.json();
        setCashier(prev => ({ ...prev, ...data.cashier, isOpen: true }));
        addAuditEntry('Caixa', `Abriu o caixa com saldo de R$ ${Number(balance).toFixed(2)}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeCashier = async (actualCash, actualPix, actualDebit, actualCredit, actualIfood) => {
    const salesBreakdown = calculateSalesTotal();
    const suprimentosTotal = cashier.transactions.filter(t => t.type === 'suprimento').reduce((s, t) => s + t.amount, 0);
    const sangriasTotal    = cashier.transactions.filter(t => t.type === 'sangria').reduce((s, t) => s + t.amount, 0);
    const expectedCash     = salesBreakdown.dinheiro + cashier.initialBalance + suprimentosTotal - sangriasTotal;
    const actualTotal      = Number(actualCash) + Number(actualPix) + Number(actualDebit) + Number(actualCredit) + Number(actualIfood);
    const expectedTotal    = expectedCash + salesBreakdown.pix + salesBreakdown.debit + salesBreakdown.credit + salesBreakdown.ifood;
    const difference       = actualTotal - expectedTotal;

    const closeLog = {
      closedAt: new Date().toLocaleString('pt-BR'),
      openedBy: cashier.openedBy,
      closedBy: currentUser?.name,
      initialBalance: cashier.initialBalance,
      expectedBalance: expectedTotal,
      actualBalance: actualTotal,
      difference,
      salesTotal: salesBreakdown.total
    };

    try {
      const res = await fetch(`${API_URL}/finance/cashier/close`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          closedAt: closeLog.closedAt,
          openedBy: closeLog.openedBy,
          closedBy: closeLog.closedBy,
          initialBalance: closeLog.initialBalance,
          expectedBalance: closeLog.expectedBalance,
          actualBalance: closeLog.actualBalance,
          difference: closeLog.difference,
          salesTotal: closeLog.salesTotal
        })
      });

      if (res.ok) {
        setCashier(prev => ({
          ...prev,
          isOpen: false,
          transactions: [],
          history: [closeLog, ...prev.history]
        }));
        addAuditEntry('Caixa', `Fechou o caixa. Total apurado: R$ ${actualTotal.toFixed(2)} | Diferença: R$ ${difference.toFixed(2)}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addCashierTransaction = async (type, amount, reason) => {
    try {
      const res = await fetch(`${API_URL}/finance/cashier/transaction`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, amount, reason })
      });
      if (res.ok) {
        const data = await res.json();
        setCashier(prev => ({ ...prev, transactions: [...prev.transactions, data.transaction] }));
        const label = type === 'sangria' ? 'Sangria' : 'Suprimento';
        addAuditEntry('Caixa', `Registrou ${label} de R$ ${Number(amount).toFixed(2)} – ${reason}`);
      }
    } catch (err) {
      console.error(err);
    }
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
  const updateInventoryItem = async (id, newQty) => {
    try {
      const res = await fetch(`${API_URL}/operational/inventory/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ qty: Number(newQty) })
      });
      if (res.ok) {
        setInventory(prev => prev.map(ing => ing.id === id ? { ...ing, qty: Number(newQty) } : ing));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addInventoryItem = async (item) => {
    try {
      const res = await fetch(`${API_URL}/operational/inventory`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        const newItem = { id: data.id, ...item, qty: Number(item.qty), min: Number(item.min) };
        setInventory(prev => [...prev, newItem]);
        addAuditEntry('Estoque', `Adicionou item ao estoque: ${item.name} (${item.qty} ${item.unit})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Menu ───
  const updateMenuItem = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/operational/menu/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        setMenu(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addMenuItem = async (product) => {
    try {
      const res = await fetch(`${API_URL}/operational/menu`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        const newItem = { id: data.id, ...product, price: Number(product.price), isActive: true };
        setMenu(prev => [...prev, newItem]);
      }
    } catch (err) {
      console.error(err);
    }
  };



  // ─── Orders ───
  const createOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => {
          if (prev.some(o => o.id === data.order.id)) return prev;
          return [data.order, ...prev];
        });
        return data.order.id;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Tables ───
  const addItemsToTable = async (tableId, newItems) => {
    try {
      const res = await fetch(`${API_URL}/tables/${tableId}/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newItems })
      });
      if (res.ok) {
        const data = await res.json();
        setTables(prev => prev.map(t => t.id === tableId ? data.table : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const transferTable = async (fromId, toId) => {
    try {
      const res = await fetch(`${API_URL}/tables/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ fromId, toId })
      });
      if (res.ok) {
        const data = await res.json();
        setTables(prev => prev.map(t => {
          if (t.id === fromId) return data.fromTable;
          if (t.id === toId) return data.toTable;
          return t;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestTableBill = async (tableId) => {
    try {
      const res = await fetch(`${API_URL}/tables/${tableId}/bill`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (res.ok) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'Conta Solicitada' } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeTableAccount = async (tableId, paymentMethod) => {
    try {
      const res = await fetch(`${API_URL}/tables/${tableId}/close`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ paymentMethod })
      });
      if (res.ok) {
        const data = await res.json();
        setTables(prev => prev.map(t => t.id === tableId ? data.table : t));
        setOrders(prev => {
          if (prev.some(o => o.id === data.order.id)) return prev;
          return [data.order, ...prev];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Employees ───
  const addEmployee = async (emp) => {
    try {
      const res = await fetch(`${API_URL}/operational/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(emp)
      });
      if (res.ok) {
        const data = await res.json();
        const newEmp = { id: data.id, ...emp, commission: 0, salesCount: 0 };
        setEmployees(prev => [...prev, newEmp]);
        addAuditEntry('Funcionários', `Cadastrou funcionário: ${emp.name} (${emp.role})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEmployee = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/operational/employees/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Settings ───
  const updateSettings = async (newSettings) => {
    try {
      const merged = { ...settings, ...newSettings };
      const res = await fetch(`${API_URL}/operational/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        setSettings(merged);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Reset Database ───
  const resetAllData = async () => {
    try {
      const res = await fetch(`${API_URL}/operational/reset`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchData();
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Erro ao resetar dados:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      // State
      currentUser, users, partners, cashier, menu, inventory, employees,
      orders, tables, settings, goals,
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
