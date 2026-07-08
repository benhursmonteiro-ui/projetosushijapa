import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Plus, 
  UtensilsCrossed, 
  ArrowRightLeft, 
  FileText, 
  CheckCircle,
  X,
  PlusCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export const Comandas = () => {
  const { 
    tables, 
    menu, 
    addItemsToTable, 
    transferTable, 
    requestTableBill, 
    closeTableAccount,
    employees
  } = useContext(AppContext);

  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Modals operations state
  const [transferTargetId, setTransferTargetId] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Combos');
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  const activeTable = tables.find(t => t.id === selectedTable);
  const subtotal = activeTable ? activeTable.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateCartQty = (productId, amount) => {
    setCart(prev => prev.map(i => {
      if (i.id === productId) {
        const nQty = i.quantity + amount;
        return nQty > 0 ? { ...i, quantity: nQty } : i;
      }
      return i;
    }));
  };

  const handleAddItemsSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    addItemsToTable(selectedTable, cart);
    setCart([]);
    setShowAddItemsModal(false);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferTargetId) return;
    transferTable(selectedTable, transferTargetId);
    setSelectedTable(transferTargetId);
    setShowTransferModal(false);
  };

  const handleCloseBillSubmit = (e) => {
    e.preventDefault();
    closeTableAccount(selectedTable, paymentMethod);
    setShowPaymentModal(false);
    setSelectedTable(null);
  };

  const handleOpenNewTable = () => {
    // Open table with a dummy salad/water to start or just open item modal directly
    setCart([]);
    setShowAddItemsModal(true);
  };

  const getTableStatusClass = (status) => {
    switch (status) {
      case 'Ocupada': return 'bg-japaRed border border-japaRed/30 text-white glow-red';
      case 'Conta Solicitada': return 'bg-japaGold border border-japaGold/30 text-japaBg font-bold animate-soft-pulse';
      default: return 'bg-japaCard border border-japaCardLight text-japaTextMuted hover:border-japaGold/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title & Slogan */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">SISTEMA DE COMANDAS & MESAS</h2>
          <p className="text-xs text-japaTextMuted">Monitore o consumo das mesas, adicione pratos e encerre contas.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-japaCard border border-japaCardLight" />Livre</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-japaRed" />Ocupada</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-japaGold animate-soft-pulse" />Conta Solicitada</span>
        </div>
      </div>

      {/* Main Grid: Left side Tables - Right side Details Panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tables Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
          {tables.map(table => {
            const tableSubtotal = table.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`h-28 rounded-xl flex flex-col justify-between p-4 transition-all duration-300 ${getTableStatusClass(table.status)} ${
                  selectedTable === table.id ? 'ring-2 ring-white ring-offset-2 ring-offset-japaBg' : ''
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-lg font-extrabold font-mono">Mesa {table.number}</span>
                  <UtensilsCrossed size={14} className={table.status === 'Livre' ? 'opacity-20' : 'opacity-80'} />
                </div>
                <div className="text-left w-full leading-tight">
                  <span className="text-[9px] block opacity-60 uppercase font-bold tracking-wider">
                    {table.status}
                  </span>
                  {table.status !== 'Livre' && (
                    <span className="text-xs font-bold font-mono">
                      R$ {tableSubtotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Table Detail Sidebar Card */}
        <div className="w-full lg:w-96 bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-lg shrink-0">
          {activeTable ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header Details */}
              <div className="flex justify-between items-center border-b border-japaCardLight pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Mesa {activeTable.number}</h3>
                  <span className="text-[10px] text-japaTextMuted uppercase font-bold">
                    Status: <strong className={activeTable.status === 'Ocupada' ? 'text-japaRed' : 'text-japaGold'}>{activeTable.status}</strong>
                  </span>
                </div>
                {activeTable.openedAt && (
                  <span className="text-[10px] bg-japaBg border border-japaCardLight text-japaTextMuted px-2 py-0.5 rounded font-mono">
                    Abertura: {activeTable.openedAt}
                  </span>
                )}
              </div>

              {/* Items List inside Comanda */}
              <div className="space-y-2">
                <span className="text-[10px] text-japaTextMuted uppercase font-bold tracking-wider block">Consumo Atual</span>
                <div className="max-h-60 overflow-y-auto divide-y divide-japaCardLight/30 pr-1">
                  {activeTable.items.length > 0 ? (
                    activeTable.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                          <span className="text-[10px] text-japaTextMuted font-mono">
                            {item.quantity}x de R$ {item.price.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white font-mono shrink-0 ml-2">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-japaTextMuted">
                      Mesa vazia. Clique abaixo para lançar itens.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="space-y-3 pt-4 border-t border-japaCardLight">
                {activeTable.status === 'Livre' ? (
                  <button
                    onClick={handleOpenNewTable}
                    className="w-full bg-japaRed hover:bg-japaRedDark text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 glow-red shadow-lg shadow-japaRed/10"
                  >
                    <PlusCircle size={14} />
                    Abrir Comanda / Lançar
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setCart([]); setShowAddItemsModal(true); }}
                        className="bg-japaBg hover:bg-japaCardLight border border-japaCardLight hover:border-japaGold/40 text-[11px] text-white p-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus size={12} />
                        Lançar Pratos
                      </button>
                      <button
                        onClick={() => setShowTransferModal(true)}
                        className="bg-japaBg hover:bg-japaCardLight border border-japaCardLight hover:border-japaGold/40 text-[11px] text-white p-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <ArrowRightLeft size={12} />
                        Transferir
                      </button>
                    </div>

                    <div className="bg-japaBg/60 p-3 rounded-lg border border-japaCardLight flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-japaTextMuted">Valor Parcial:</span>
                      <span className="text-japaGold text-sm">R$ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {activeTable.status === 'Ocupada' && (
                        <button
                          onClick={() => requestTableBill(activeTable.id)}
                          className="bg-japaGold/10 hover:bg-japaGold/20 border border-japaGold/30 text-japaGold p-2.5 rounded-lg text-[11px] font-extrabold uppercase transition-all flex items-center justify-center gap-1"
                        >
                          <FileText size={12} />
                          Pedir Conta
                        </button>
                      )}
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className={`p-2.5 rounded-lg text-[11px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 ${
                          activeTable.status === 'Conta Solicitada'
                            ? 'bg-green-500 hover:bg-green-600 text-white font-bold grid-cols-2 col-span-2'
                            : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400'
                        }`}
                      >
                        <CheckCircle size={12} />
                        Fechar Conta
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-japaTextMuted flex flex-col items-center gap-3">
              <UtensilsCrossed size={36} className="text-japaTextMuted/30" />
              <span className="text-xs">Selecione uma mesa ao lado para gerenciar comandas.</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD ITEMS / LANÇAR PRATOS */}
      {showAddItemsModal && activeTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-3xl bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <Plus size={16} /> Lançar Itens na Mesa {activeTable.number}
              </h3>
              <button onClick={() => setShowAddItemsModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-japaCardLight">
              {/* Product List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {['Combos', 'Hot Rolls', 'Temakis', 'Uramakis', 'Pratos Quentes', 'Bebidas'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase whitespace-nowrap ${
                        selectedCategory === cat ? 'bg-japaRed text-white' : 'text-japaTextMuted border border-japaCardLight hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menu.filter(p => p.category === selectedCategory && p.isActive).map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className="p-3 bg-japaBg border border-japaCardLight hover:border-japaGold/40 rounded-lg cursor-pointer transition-all flex justify-between items-center text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{prod.name}</span>
                        <span className="text-[10px] text-japaTextMuted">R$ {prod.price.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-japaGold uppercase">Lançar +</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart List */}
              <div className="w-full md:w-64 pl-4 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-japaTextMuted uppercase border-b border-japaCardLight pb-1 block">Carrinho de Lançamento</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.length > 0 ? (
                      cart.map(item => (
                        <div key={item.id} className="text-xs flex items-center justify-between">
                          <span className="text-white truncate max-w-[120px]">{item.name}</span>
                          <div className="flex items-center gap-1.5 bg-japaBg border border-japaCardLight rounded px-1 py-0.5 scale-90">
                            <button type="button" onClick={() => updateCartQty(item.id, -1)} className="text-japaTextMuted hover:text-white font-bold text-xs">-</button>
                            <span className="text-[10px] font-bold text-white font-mono">{item.quantity}</span>
                            <button type="button" onClick={() => updateCartQty(item.id, 1)} className="text-japaTextMuted hover:text-white font-bold text-xs">+</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[10px] text-japaTextMuted">Carrinho vazio</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-japaCardLight/30 mt-3">
                  <div className="flex justify-between text-xs font-mono font-bold text-japaGold">
                    <span>Lançando:</span>
                    <span>R$ {cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleAddItemsSubmit}
                    disabled={cart.length === 0}
                    className="w-full bg-japaGold hover:bg-japaGoldDark disabled:bg-japaCardLight text-japaBg py-2 rounded-lg text-xs font-bold uppercase transition-all"
                  >
                    Confirmar Lançamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER TABLE */}
      {showTransferModal && activeTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <ArrowRightLeft size={16} /> Transferir Mesa {activeTable.number}
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold">Transferir para a Mesa Destino:</label>
                <select
                  required
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-japaGold"
                >
                  <option value="">Selecione uma mesa livre...</option>
                  {tables.filter(t => t.status === 'Livre').map(t => (
                    <option key={t.id} value={t.id}>Mesa {t.number}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!transferTargetId}
                className="w-full bg-japaGold hover:bg-japaGoldDark disabled:bg-japaCardLight text-japaBg py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Executar Transferência
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOSE ACCOUNT / FECHAR CONTA */}
      {showPaymentModal && activeTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                <CheckCircle size={16} /> Fechar Conta da Mesa {activeTable.number}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleCloseBillSubmit} className="space-y-4">
              <div className="bg-japaBg/60 p-3.5 rounded-lg border border-japaCardLight space-y-1 text-center font-mono">
                <span className="text-[10px] text-japaTextMuted uppercase font-bold block">Total a Pagar</span>
                <span className="text-xl font-extrabold text-japaGold">R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2.5 py-2 rounded-lg focus:outline-none"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Crédito">Cartão de Crédito</option>
                  <option value="Débito">Cartão de Débito</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Confirmar Recebimento & Liberar Mesa
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
