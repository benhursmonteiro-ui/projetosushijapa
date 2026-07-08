import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Bell, 
  Coins, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  X
} from 'lucide-react';

export const Header = () => {
  const { 
    cashier, 
    inventory, 
    addCashierTransaction, 
    openCashier,
    currentUser 
  } = useContext(AppContext);

  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickTxModal, setShowQuickTxModal] = useState(false);
  const [txType, setTxType] = useState('sangria'); // sangria or suprimento
  const [txAmount, setTxAmount] = useState('');
  const [txReason, setTxReason] = useState('');
  const [showOpenCashierModal, setShowOpenCashierModal] = useState(false);
  const [openBalance, setOpenBalance] = useState('500');

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Low stock ingredients check
  const lowStockItems = inventory.filter(item => item.qty <= item.min);

  const handleQuickTxSubmit = (e) => {
    e.preventDefault();
    if (!txAmount || Number(txAmount) <= 0) return;
    addCashierTransaction(txType, Number(txAmount), txReason);
    setTxAmount('');
    setTxReason('');
    setShowQuickTxModal(false);
  };

  const handleOpenCashierSubmit = (e) => {
    e.preventDefault();
    openCashier(Number(openBalance), currentUser.name);
    setShowOpenCashierModal(false);
  };

  const formattedDate = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="h-16 border-b border-japaCardLight bg-japaBg px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Date and Time */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-japaTextMuted">
          <Calendar size={14} className="text-japaGold" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-japaTextMuted">
          <Clock size={14} className="text-japaGold animate-soft-pulse" />
          <span>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Cashier Status & Notification System */}
      <div className="flex items-center gap-4">
        {/* Cashier Control Status Widget */}
        <div className="flex items-center gap-2 bg-japaCard border border-japaCardLight rounded-lg p-1.5 px-3">
          <Coins size={14} className={cashier.isOpen ? "text-green-400 animate-soft-pulse" : "text-japaRed"} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-japaTextMuted uppercase font-bold">Caixa Diário</span>
            {cashier.isOpen ? (
              <span className="text-xs font-semibold text-green-400">
                Aberto (Saldo: R$ {cashier.initialBalance.toFixed(2)})
              </span>
            ) : (
              <button 
                onClick={() => setShowOpenCashierModal(true)}
                className="text-xs font-semibold text-japaRed hover:text-japaRedDark underline transition-colors"
              >
                Caixa Fechado (Abrir)
              </button>
            )}
          </div>
          {cashier.isOpen && (
            <div className="ml-2 flex items-center gap-1 border-l border-japaCardLight pl-2">
              <button 
                onClick={() => { setTxType('suprimento'); setShowQuickTxModal(true); }}
                title="Adicionar Suprimento (Troco)"
                className="p-1 hover:bg-green-500/10 text-green-400 rounded transition-colors"
              >
                <ArrowUpRight size={14} />
              </button>
              <button 
                onClick={() => { setTxType('sangria'); setShowQuickTxModal(true); }}
                title="Efetuar Sangria (Retirada)"
                className="p-1 hover:bg-japaRed/10 text-japaRed rounded transition-colors"
              >
                <ArrowDownLeft size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-japaCardLight/40 rounded-lg text-japaTextMuted hover:text-white transition-colors relative"
          >
            <Bell size={18} />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-japaRed rounded-full glow-red animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass border border-japaCardLight rounded-lg shadow-xl overflow-hidden animate-fade-in z-30">
              <div className="p-3 bg-japaCard border-b border-japaCardLight flex justify-between items-center">
                <span className="text-xs font-bold text-japaGold uppercase tracking-wider">Alertas do Sistema</span>
                <span className="text-[10px] bg-japaRed/10 text-japaRed font-bold px-1.5 py-0.5 rounded">
                  {lowStockItems.length} Alertas
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-japaCardLight">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map(item => (
                    <div key={item.id} className="p-3 flex items-start gap-2.5 hover:bg-japaCardLight/10 transition-colors">
                      <AlertTriangle size={16} className="text-japaRed shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">Estoque Baixo: {item.name}</span>
                        <span className="text-[10px] text-japaTextMuted">
                          Qtd Atual: <strong className="text-japaRed">{item.qty} {item.unit}</strong> (Mínimo: {item.min} {item.unit})
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-japaTextMuted">
                    Nenhum alerta de estoque ou operacional pendente.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK TRANSACTION MODAL (SANGRIA / SUPRIMENTO) */}
      {showQuickTxModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-2">
                <Coins size={16} className="text-japaGold" />
                Lançar Movimentação de Caixa
              </h3>
              <button 
                onClick={() => setShowQuickTxModal(false)}
                className="text-japaTextMuted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleQuickTxSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('suprimento')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    txType === 'suprimento'
                      ? 'bg-green-500/10 border-green-500 text-green-400'
                      : 'border-japaCardLight text-japaTextMuted hover:bg-japaCardLight/20'
                  }`}
                >
                  <ArrowUpRight size={14} className="inline mr-1" />
                  Suprimento (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('sangria')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    txType === 'sangria'
                      ? 'bg-japaRed/10 border-japaRed text-japaRed glow-red'
                      : 'border-japaCardLight text-japaTextMuted hover:bg-japaCardLight/20'
                  }`}
                >
                  <ArrowDownLeft size={14} className="inline mr-1" />
                  Sangria (Retirada)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold">Valor (R$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={14} className="text-japaTextMuted" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-japaGold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold">Motivo / Descrição</label>
                <textarea
                  required
                  value={txReason}
                  onChange={(e) => setTxReason(e.target.value)}
                  placeholder="Ex: Compra de embalagens, sangria para depósito..."
                  rows={2}
                  className="w-full bg-japaBg border border-japaCardLight text-white p-3 rounded-lg focus:outline-none focus:border-japaGold text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-japaGold hover:bg-japaGoldDark text-japaBg py-2 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Confirmar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OPEN CASHIER MODAL */}
      {showOpenCashierModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold">
                Abertura de Caixa Diário
              </h3>
              <button 
                onClick={() => setShowOpenCashierModal(false)}
                className="text-japaTextMuted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleOpenCashierSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold">Saldo de Abertura (Fundo de Troco)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={14} className="text-japaTextMuted" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={openBalance}
                    onChange={(e) => setOpenBalance(e.target.value)}
                    placeholder="500,00"
                    className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-japaGold text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Abrir Caixa
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
