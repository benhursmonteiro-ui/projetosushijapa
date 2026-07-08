import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  ShoppingBag, 
  X, 
  Check, 
  ChevronRight, 
  Smartphone,
  DollarSign,
  Printer
} from 'lucide-react';

export const Pedidos = () => {
  const { 
    orders, 
    menu, 
    inventory, 
    createOrder, 
    updateOrderStatus,
    settings
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  
  // New Order State
  const [orderType, setOrderType] = useState('Delivery'); // Delivery, Balcão, Mesa, Retirada
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [selectedCategory, setSelectedCategory] = useState('Combos');
  const [observacoes, setObservacoes] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  // Filter orders by tab
  const tabs = ['Todos', 'Preparando', 'Prontos', 'Entrega', 'Finalizados'];
  const statusMap = {
    'Todos': null,
    'Preparando': 'Preparando',
    'Prontos': 'Pronto',
    'Entrega': 'Em entrega',
    'Finalizados': 'Finalizado'
  };

  const filteredOrders = orders.filter(o => {
    // Tab filter
    const statusFilter = statusMap[activeTab];
    if (statusFilter && o.status !== statusFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        o.id.includes(search) || 
        o.customerName.toLowerCase().includes(search) ||
        (o.phone && o.phone.includes(search))
      );
    }
    return true;
  });

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

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
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

  // Helper to check stock in cart
  const checkStockForProduct = (productId, qtyToVerify) => {
    const product = menu.find(m => m.id === productId);
    if (!product || !product.recipe) return { available: true };

    for (let step of product.recipe) {
      const ing = inventory.find(i => i.id === step.ingredientId);
      if (ing) {
        const required = step.amount * qtyToVerify;
        if (ing.qty < required) {
          return { 
            available: false, 
            ingredientName: ing.name, 
            qtyCurrent: ing.qty, 
            qtyRequired: required,
            unit: ing.unit
          };
        }
      }
    }
    return { available: true };
  };

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'Delivery' ? settings.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Check stock alerts (display warnings, but proceed for operational flexibility)
    let stockWarnings = [];
    cart.forEach(item => {
      const stockCheck = checkStockForProduct(item.id, item.quantity);
      if (!stockCheck.available) {
        stockWarnings.push(`${item.name} necessita de mais ${stockCheck.ingredientName} (${stockCheck.qtyCurrent.toFixed(1)} / ${stockCheck.qtyRequired.toFixed(1)} ${stockCheck.unit} disponíveis).`);
      }
    });

    if (stockWarnings.length > 0) {
      const proceed = window.confirm(`Atenção: Estoque insuficiente!\n\n${stockWarnings.join('\n')}\n\nDeseja realizar a venda mesmo assim?`);
      if (!proceed) return;
    }

    const createdId = createOrder({
      customerName: customerName || 'Cliente Balcão',
      phone: customerPhone,
      address: orderType === 'Delivery' ? customerAddress : '',
      channel: orderType === 'Delivery' ? 'WhatsApp' : 'Balcão',
      type: orderType,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      observacoes
    });

    const newOrderObj = {
      id: createdId,
      customerName: customerName || 'Cliente Balcão',
      phone: customerPhone,
      address: orderType === 'Delivery' ? customerAddress : '',
      type: orderType,
      items: cart,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      observacoes
    };

    // Reset Form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setObservacoes('');
    setShowNewOrderModal(false);

    // Open print preview
    setSelectedOrderForPrint(newOrderObj);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Preparando': return 'bg-japaRed/10 text-japaRed border border-japaRed/20 animate-soft-pulse';
      case 'Pronto': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Em entrega': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'Finalizado': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default: return 'bg-japaCardLight text-japaTextMuted';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title + Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">HISTÓRICO E GESTÃO DE PEDIDOS</h2>
          <p className="text-xs text-japaTextMuted">Organize, atualize e despache pedidos em tempo real.</p>
        </div>
        <button 
          onClick={() => setShowNewOrderModal(true)}
          className="bg-japaRed hover:bg-japaRedDark text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all glow-red shadow-lg shadow-japaRed/20"
        >
          <Plus size={14} />
          Novo Pedido
        </button>
      </div>

      {/* Tabs and Search Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-japaCard border border-japaCardLight p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-japaGold text-japaBg shadow-md shadow-japaGold/10' 
                  : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-japaTextMuted" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, Nome ou Telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-japaBg/60 border-b border-japaCardLight text-[10px] font-bold text-japaGold uppercase tracking-wider">
                <th className="p-4">Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Canal / Tipo</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-japaCardLight text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-japaCardLight/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">#{order.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{order.customerName}</span>
                        {order.phone && <span className="text-[10px] text-japaTextMuted">{order.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-japaBg border border-japaCardLight px-1.5 py-0.5 rounded text-white font-medium">
                          {order.channel}
                        </span>
                        <span className="text-[10px] bg-japaGold/10 text-japaGold border border-japaGold/20 px-1.5 py-0.5 rounded font-medium">
                          {order.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-japaTextMuted font-mono">{order.time}</td>
                    <td className="p-4 font-mono font-bold text-white">R$ {order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          title="Imprimir Via Cozinha"
                          className="bg-japaGold/10 hover:bg-japaGold border border-japaGold/20 hover:border-japaGold text-japaGold hover:text-japaBg p-1.5 rounded transition-all flex items-center justify-center"
                        >
                          <Printer size={12} />
                        </button>
                        {order.status === 'Preparando' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Pronto')}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded font-bold text-[10px] px-2 flex items-center gap-1 transition-all"
                          >
                            <Check size={10} /> Pronto
                          </button>
                        )}
                        {order.status === 'Pronto' && order.type === 'Delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Em entrega')}
                            className="bg-yellow-500 hover:bg-yellow-600 text-japaBg p-1 rounded font-bold text-[10px] px-2 flex items-center gap-1 transition-all"
                          >
                            Entregar
                          </button>
                        )}
                        {(order.status === 'Pronto' && order.type !== 'Delivery' || order.status === 'Em entrega') && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Finalizado')}
                            className="bg-green-500 hover:bg-green-600 text-white p-1 rounded font-bold text-[10px] px-2 flex items-center gap-1 transition-all"
                          >
                            <Check size={10} /> Finalizar
                          </button>
                        )}
                        {order.status === 'Finalizado' && (
                          <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            <Check size={12} /> Concluído
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-japaTextMuted">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ORDER DRAWER / MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
          <div className="w-full max-w-4xl bg-japaCard h-full border-l border-japaCardLight flex flex-col justify-between shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-japaCardLight flex justify-between items-center bg-japaBg/60">
              <div>
                <h3 className="text-md font-bold uppercase tracking-wider text-japaGold flex items-center gap-2">
                  <ShoppingBag size={18} />
                  Criar Novo Pedido de Venda
                </h3>
                <p className="text-[10px] text-japaTextMuted">Escolha itens, configure cliente e finalize caixa.</p>
              </div>
              <button 
                onClick={() => setShowNewOrderModal(false)}
                className="text-japaTextMuted hover:text-white p-1.5 rounded-lg hover:bg-japaCardLight/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-japaCardLight">
              
              {/* Left Side: Product Selector */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['Combos', 'Hot Rolls', 'Temakis', 'Uramakis', 'Pratos Quentes', 'Bebidas'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-japaRed text-white shadow-md shadow-japaRed/10'
                          : 'text-japaTextMuted border border-japaCardLight hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {menu
                    .filter(p => p.category === selectedCategory && p.isActive)
                    .map(product => {
                      const stockStatus = checkStockForProduct(product.id, 1);
                      return (
                        <div 
                          key={product.id} 
                          onClick={() => addToCart(product)}
                          className={`p-3.5 bg-japaBg/50 border rounded-xl hover:border-japaGold/40 hover:bg-japaCardLight/10 cursor-pointer transition-all flex flex-col justify-between ${
                            !stockStatus.available ? 'border-japaRed/15' : 'border-japaCardLight'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-white leading-tight">{product.name}</span>
                              <span className="text-xs font-bold text-japaGold font-mono shrink-0">R$ {product.price.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-japaTextMuted leading-snug">{product.description}</p>
                          </div>

                          <div className="mt-3 flex justify-between items-center pt-2 border-t border-japaCardLight/30">
                            {/* Stock Indicator */}
                            {stockStatus.available ? (
                              <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/10 px-1.5 py-0.5 rounded font-mono">
                                Em Estoque
                              </span>
                            ) : (
                              <span className="text-[9px] bg-japaRed/10 text-japaRed border border-japaRed/10 px-1.5 py-0.5 rounded font-mono">
                                Estoque Crítico
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-japaGold uppercase tracking-wider hover:underline">
                              Adicionar +
                            </span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              {/* Right Side: Customer Info & Cart Checkout Summary */}
              <div className="w-full md:w-80 overflow-y-auto p-5 bg-japaBg/20 flex flex-col justify-between gap-5 border-t border-japaCardLight md:border-t-0">
                <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    {/* Order Type */}
                    <div className="grid grid-cols-4 gap-1">
                      {['Delivery', 'Balcão', 'Mesa', 'Retirada'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setOrderType(type)}
                          className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                            orderType === type
                              ? 'bg-japaGold text-japaBg'
                              : 'bg-japaCard border border-japaCardLight text-japaTextMuted hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Customer Info Inputs */}
                    <div className="space-y-2.5">
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold">Cliente</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nome do cliente..."
                          className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold">Telefone (WhatsApp)</label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                        />
                      </div>
                      {orderType === 'Delivery' && (
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-japaTextMuted uppercase font-bold">Endereço de Entrega</label>
                          <textarea
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Rua, Número, Bairro, Complemento..."
                            rows={2}
                            className="w-full bg-japaBg border border-japaCardLight text-white p-2.5 rounded-lg focus:outline-none focus:border-japaGold text-xs resize-none"
                          />
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold">Observações / Notas da Cozinha</label>
                        <input
                          type="text"
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Ex: Sem cebolinha, shoyu extra..."
                          className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
                        />
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-japaTextMuted uppercase font-bold block border-b border-japaCardLight pb-1">
                        Itens Selecionados ({cart.reduce((s, i) => s + i.quantity, 0)})
                      </span>
                      <div className="max-h-40 overflow-y-auto divide-y divide-japaCardLight/30 pr-1">
                        {cart.length > 0 ? (
                          cart.map(item => (
                            <div key={item.id} className="py-2 flex items-center justify-between">
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                                <span className="text-[10px] text-japaGold font-mono">R$ {item.price.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <div className="flex items-center gap-1.5 bg-japaBg border border-japaCardLight rounded px-1.5 py-0.5">
                                  <button type="button" onClick={() => updateCartQty(item.id, -1)} className="text-japaTextMuted hover:text-white font-bold text-xs">-</button>
                                  <span className="text-[11px] font-bold text-white font-mono">{item.quantity}</span>
                                  <button type="button" onClick={() => updateCartQty(item.id, 1)} className="text-japaTextMuted hover:text-white font-bold text-xs">+</button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-japaTextMuted hover:text-japaRed p-1 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-[11px] text-japaTextMuted">
                            O carrinho de compras está vazio. Adicione itens clicando ao lado.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment & Submit Summary */}
                  <div className="space-y-3 pt-3 border-t border-japaCardLight">
                    <div className="space-y-0.5">
                      <label className="text-[9px] text-japaTextMuted uppercase font-bold">Método de Pagamento</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-japaGold"
                      >
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Crédito">Cartão de Crédito</option>
                        <option value="Débito">Cartão de Débito</option>
                        <option value="iFood">iFood (Online)</option>
                      </select>
                    </div>

                    <div className="space-y-1 bg-japaBg/60 p-2.5 rounded-lg border border-japaCardLight text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-japaTextMuted">Subtotal:</span>
                        <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {orderType === 'Delivery' && (
                        <div className="flex justify-between">
                          <span className="text-japaTextMuted">Taxa Entrega:</span>
                          <span className="text-white">R$ {deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold border-t border-japaCardLight/30 pt-1 mt-1 text-japaGold">
                        <span>Total Geral:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cart.length === 0}
                      className="w-full bg-japaGold hover:bg-japaGoldDark disabled:bg-japaCardLight disabled:text-japaTextMuted text-japaBg py-2.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Check size={14} />
                      Concluir & Enviar Pedido
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* KITCHEN TICKET PRINT PREVIEW MODAL */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white animate-fade-in print:absolute print:inset-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-kitchen-ticket, #printable-kitchen-ticket * {
                visibility: visible;
              }
              #printable-kitchen-ticket {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
                background: white !important;
                color: black !important;
                padding: 4mm;
                font-family: monospace;
              }
              .print-hidden {
                display: none !important;
              }
            }
          `}</style>
          
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:border-0 print:bg-white print:w-full print:max-w-none print:rounded-none">
            {/* Modal Actions Header */}
            <div className="p-4 border-b border-japaCardLight flex justify-between items-center bg-japaBg/60 print-hidden font-sans">
              <span className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <Printer size={14} /> Imprimir Cupom de Cozinha
              </span>
              <button 
                onClick={() => setSelectedOrderForPrint(null)}
                className="text-japaTextMuted hover:text-white p-1 rounded hover:bg-japaCardLight/20 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 overflow-y-auto max-h-[70vh] bg-japaBg/10 print:p-0 print:max-h-none print:bg-white flex justify-center">
              <div id="printable-kitchen-ticket" className="bg-white text-black p-6 rounded-lg w-full max-w-xs shadow-md border border-gray-200 font-mono text-xs leading-normal print:shadow-none print:border-0 print:p-0">
                
                {/* Receipt Header */}
                <div className="text-center border-b border-dashed border-gray-400 pb-3">
                  <h2 className="text-md font-bold uppercase tracking-widest">CUPOM DE COZINHA</h2>
                  <p className="text-[9px] text-gray-500 uppercase mt-0.5">Sushi Japa Food Prime</p>
                </div>
                
                {/* Receipt Metadata */}
                <div className="py-3 space-y-1 border-b border-dashed border-gray-400">
                  <div className="flex justify-between font-bold text-sm">
                    <span>PEDIDO: #{selectedOrderForPrint.id}</span>
                    <span className="uppercase">{selectedOrderForPrint.type}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Data: {selectedOrderForPrint.date}</span>
                    <span>Hora: {selectedOrderForPrint.time}</span>
                  </div>
                  <div className="text-[11px] mt-1 font-sans">
                    <span>Cliente: <strong>{selectedOrderForPrint.customerName}</strong></span>
                  </div>
                  {selectedOrderForPrint.phone && (
                    <div className="text-[10px] text-gray-600">
                      <span>WhatsApp: {selectedOrderForPrint.phone}</span>
                    </div>
                  )}
                  {selectedOrderForPrint.type === 'Delivery' && selectedOrderForPrint.address && (
                    <div className="text-[10px] text-gray-700 border-t border-gray-100 pt-1 mt-1 font-sans">
                      <span>Endereço: <strong>{selectedOrderForPrint.address}</strong></span>
                    </div>
                  )}
                </div>

                {/* Receipt Items */}
                <div className="py-3 border-b border-dashed border-gray-400">
                  <span className="text-[9px] font-bold block mb-2 uppercase text-gray-500">Itens do Pedido</span>
                  <div className="space-y-1.5">
                    {selectedOrderForPrint.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-bold font-mono">
                        <span>
                          <span className="text-sm font-black mr-2">{item.quantity}x</span> {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Receipt Observations */}
                {selectedOrderForPrint.observacoes && (
                  <div className="py-2.5 border-b border-dashed border-gray-400 bg-gray-100 p-2 rounded mt-2">
                    <span className="text-[9px] font-bold block uppercase text-red-600">OBSERVAÇÕES:</span>
                    <p className="text-xs font-bold text-black mt-0.5 uppercase">{selectedOrderForPrint.observacoes}</p>
                  </div>
                )}

                {/* Receipt Footer */}
                <div className="text-center pt-3 text-[8px] text-gray-400">
                  <span>* ENVIAR IMEDIATAMENTE PARA PRODUÇÃO *</span>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 border-t border-japaCardLight bg-japaCard flex gap-2 print-hidden font-sans">
              <button 
                onClick={() => setSelectedOrderForPrint(null)}
                className="flex-1 border border-japaCardLight text-japaTextMuted hover:text-white py-2 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Fechar
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-japaGold hover:bg-japaGoldDark text-japaBg py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Imprimir Via
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
