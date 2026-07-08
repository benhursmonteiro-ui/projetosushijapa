import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  QrCode, 
  Smartphone, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  ArrowRight,
  Info,
  UtensilsCrossed,
  Star,
  Bell,
  User,
  Users,
  Receipt,
  Search,
  MessageSquare,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

const ADDITIONS_LIST = [
  { id: 'add-cream', name: 'Cream Cheese Extra', price: 4.50 },
  { id: 'add-tare', name: 'Molho Tarê Extra', price: 3.00 },
  { id: 'add-gengibre', name: 'Gengibre Extra', price: 2.00 },
  { id: 'add-cebolinha', name: 'Cebolinha Extra', price: 1.50 },
];

export const QrCodeMenu = () => {
  const { menu, tables, createOrder, addItemsToTable, closeTableAccount, addAuditEntry } = useContext(AppContext);
  
  // Table Selection & Alerts State
  const [selectedTableNum, setSelectedTableNum] = useState('08');
  const [alerts, setAlerts] = useState([
    { id: 1, table: '03', type: 'atendimento', message: 'Mesa 03 solicitou atendimento.', time: '20:30', active: true },
    { id: 2, table: '05', type: 'conta', message: 'Mesa 05 solicitou fechamento da comanda.', time: '20:41', active: true }
  ]);
  const [reviews, setReviews] = useState([
    { id: 1, table: '02', score: 5, comment: 'Comida excelente e pedido super rápido!', time: '20:10' },
    { id: 2, table: '11', score: 4, comment: 'Ambiente agradável e cardápio digital fácil de usar.', time: '20:25' }
  ]);

  // Channel & Delivery state
  const [orderChannel, setOrderChannel] = useState('Mesa'); // Mesa | Delivery
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState('Pix');

  // Phone App Simulator Navigation State
  const [phoneScreen, setPhoneScreen] = useState('channel-select'); // channel-select | welcome | menu | detail | cart | split | pay | rating | success
  
  // Menu Category Filter and Search
  const [phoneCategory, setPhoneCategory] = useState('Combos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product Detail Configuration
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailObs, setDetailObs] = useState('');
  const [detailAdditions, setDetailAdditions] = useState([]); // selected addition IDs

  // Phone Cart (Current order batch)
  const [phoneCart, setPhoneCart] = useState([]);
  
  // Bill Splitting State
  const [splitMode, setSplitMode] = useState('unica'); // unica | igual | produto
  const [splitPeopleCount, setSplitPeopleCount] = useState(2);
  const [splitProductsPaid, setSplitProductsPaid] = useState({}); // productId -> people index paying

  // Simulated Rating Scores
  const [ratingScores, setRatingScores] = useState({ service: 5, food: 5, ambience: 5 });
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Active Table Comanda data (from AppContext)
  const tableId = `mesa-${parseInt(selectedTableNum)}`;
  const tableData = useMemo(() => {
    return tables.find(t => t.id === tableId) || { status: 'Livre', items: [], openedAt: null };
  }, [tables, tableId]);

  // Helper values
  const phoneCategories = ['Combos', 'Hot Rolls', 'Temakis', 'Pratos Quentes', 'Bebidas'];

  // Add item to simulator cart
  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setDetailQty(1);
    setDetailObs('');
    setDetailAdditions([]);
    setPhoneScreen('detail');
  };

  const toggleAddition = (addId) => {
    setDetailAdditions(prev => 
      prev.includes(addId) ? prev.filter(id => id !== addId) : [...prev, addId]
    );
  };

  const handleAddToCart = () => {
    const selectedAdds = ADDITIONS_LIST.filter(a => detailAdditions.includes(a.id));
    const additionTotal = selectedAdds.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = selectedProduct.price + additionTotal;
    
    const newCartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      basePrice: selectedProduct.price,
      unitPrice,
      quantity: detailQty,
      observations: detailObs,
      additions: selectedAdds,
      totalPrice: unitPrice * detailQty
    };

    setPhoneCart(prev => {
      // Check if exact same product with same additions and observations exists
      const existingIdx = prev.findIndex(item => 
        item.id === newCartItem.id && 
        item.observations === newCartItem.observations &&
        JSON.stringify(item.additions) === JSON.stringify(newCartItem.additions)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newCartItem.quantity;
        updated[existingIdx].totalPrice = updated[existingIdx].unitPrice * updated[existingIdx].quantity;
        return updated;
      }
      return [...prev, newCartItem];
    });

    setPhoneScreen('menu');
  };

  const updateCartItemQty = (index, delta) => {
    setPhoneCart(prev => prev.map((item, i) => {
      if (i === index) {
        const nQty = item.quantity + delta;
        return nQty > 0 ? { ...item, quantity: nQty, totalPrice: item.unitPrice * nQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = phoneCart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Send Order to Kitchen and add to Table Comanda
  const handleCheckout = () => {
    if (phoneCart.length === 0) return;

    if (orderChannel === 'Delivery') {
      setPhoneScreen('delivery-details');
      return;
    }

    // 1. Register items in table comanda (AppContext)
    const formattedComandaItems = phoneCart.map(item => {
      const addsText = item.additions.map(a => a.name).join(', ');
      const nameWithDetails = item.name + 
        (addsText ? ` (${addsText})` : '') + 
        (item.observations ? ` [Obs: ${item.observations}]` : '');
      return {
        id: item.id,
        name: nameWithDetails,
        price: item.unitPrice,
        quantity: item.quantity
      };
    });
    addItemsToTable(tableId, formattedComandaItems);

    // 2. Register kitchen order in system (AppContext)
    const orderItems = phoneCart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      // Pass observations and additions as a combined note
      notes: (item.additions.map(a => a.name).join(', ') + 
              (item.observations ? ` | Obs: ${item.observations}` : ''))
    }));

    const now = new Date();
    const orderId = createOrder({
      customerName: `Mesa ${selectedTableNum}`,
      phone: '',
      address: '',
      channel: 'Balcão', // Digital Mesa orders flow into system
      type: 'Mesa',
      status: 'Preparando',
      paymentMethod: 'Dinheiro', // placeholder till closed
      items: orderItems,
      subtotal: cartTotal,
      deliveryFee: 0.00,
      total: cartTotal,
      waiterId: tableData.waiterId || 'emp-4'
    });

    setPhoneCart([]);
    setPhoneScreen('success');
    
    // Auto transition out of success after 3 seconds back to menu
    setTimeout(() => {
      setPhoneScreen('menu');
    }, 3000);
  };

  const handleDeliveryCheckout = () => {
    if (phoneCart.length === 0) return;
    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const orderItems = phoneCart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      notes: (item.additions.map(a => a.name).join(', ') + 
              (item.observations ? ` | Obs: ${item.observations}` : ''))
    }));

    createOrder({
      customerName: deliveryName,
      phone: deliveryPhone,
      address: deliveryAddress,
      channel: 'Cardápio Digital',
      type: 'Delivery',
      status: 'Preparando',
      paymentMethod: deliveryPaymentMethod,
      items: orderItems,
      subtotal: cartTotal,
      deliveryFee: 7.00,
      total: cartTotal + 7.00
    });

    setPhoneCart([]);
    setPhoneScreen('success');

    setTimeout(() => {
      setPhoneScreen('rating');
    }, 3000);
  };

  // Waiter Call Action
  const handleCallWaiter = () => {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newAlert = {
      id: Date.now(),
      table: selectedTableNum,
      type: 'atendimento',
      message: `Mesa ${selectedTableNum} solicitou atendimento.`,
      time: timeStr,
      active: true
    };
    setAlerts(prev => [newAlert, ...prev]);
    addAuditEntry('Comandas', `Mesa ${selectedTableNum} chamou atendimento pelo celular.`);
    alert('Chamado enviado! O garçom está a caminho.');
  };

  // Request Bill Action
  const handleRequestBill = () => {
    if (tableData.items.length === 0) {
      alert('Esta mesa não possui consumo registrado para solicitar conta.');
      return;
    }
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newAlert = {
      id: Date.now(),
      table: selectedTableNum,
      type: 'conta',
      message: `Mesa ${selectedTableNum} solicitou fechamento da comanda (Divisão: ${splitMode.toUpperCase()}).`,
      time: timeStr,
      active: true
    };
    setAlerts(prev => [newAlert, ...prev]);
    addAuditEntry('Caixa', `Mesa ${selectedTableNum} solicitou a conta via Cardápio Digital.`);
    setPhoneScreen('pay');
  };

  // Simulate Payment & Closing Table
  const handleSimulatePayment = (paymentMethod) => {
    // Closes table command and frees the table in context
    closeTableAccount(tableId, paymentMethod);
    setPhoneScreen('rating');
  };

  // Submit Customer Survey
  const handleScoreChange = (type, val) => {
    setRatingScores(prev => ({ ...prev, [type]: val }));
  };

  const handleSubmitRating = () => {
    const avgScore = Math.round((ratingScores.service + ratingScores.food + ratingScores.ambience) / 3);
    const newReview = {
      id: Date.now(),
      table: orderChannel === 'Delivery' ? 'Delivery' : selectedTableNum,
      score: avgScore,
      comment: ratingFeedback || 'Avaliação enviada sem comentários.',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setReviews(prev => [newReview, ...prev]);
    setRatingFeedback('');
    setPhoneScreen(orderChannel === 'Delivery' ? 'channel-select' : 'welcome');
  };

  // Resolve comanda bill calculations
  const comandaSubtotal = tableData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Clear Operator alert log
  const handleResolveAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-wider text-white">AUTO-ATENDIMENTO DE MESA (CARDÁPIO DIGITAL)</h2>
        <p className="text-xs text-japaTextMuted">Jornada completa do cliente: QR Code exclusivo, pedidos na mesa, fechamento dividido e avaliações.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start justify-center">
        
        {/* Left Side: System Operator Console (7/12 width) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Active Table Status Console */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-japaCardLight pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                  <UtensilsCrossed size={14} className="text-japaGold" />
                  Mesa Simulada no QR Code
                </h3>
                <span className="text-[10px] text-japaTextMuted">Simule o cliente escaneando o QR Code físico correspondente à mesa.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-bold">Escolha a Mesa:</span>
                <select
                  value={selectedTableNum}
                  onChange={(e) => {
                    setSelectedTableNum(e.target.value);
                    setPhoneScreen('channel-select');
                    setPhoneCart([]);
                  }}
                  className="bg-japaBg border border-japaCardLight text-white rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:border-japaGold cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(num => (
                    <option key={num} value={num}>Mesa {num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-japaBg/60 border border-japaCardLight p-3.5 rounded-xl flex flex-col justify-center items-center text-center relative">
                <div className="w-20 h-20 bg-white p-1 rounded-lg flex items-center justify-center relative shadow">
                  <QrCode size={70} className="text-japaBg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-japaRed border border-white flex items-center justify-center text-white text-[7px] font-bold">JP</div>
                  </div>
                </div>
                <span className="text-[9px] text-japaGold uppercase font-bold tracking-wider mt-2">Mesa {selectedTableNum}</span>
              </div>

              <div className="bg-japaBg/60 border border-japaCardLight p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-japaTextMuted uppercase font-bold block">Status da Comanda</span>
                  <span className={`text-xs font-bold block mt-1 ${tableData.status === 'Livre' ? 'text-green-400' : 'text-japaRed animate-soft-pulse'}`}>
                    {tableData.status === 'Livre' ? 'COMANDA LIVRE' : 'MESA OCUPADA / ABERTA'}
                  </span>
                  {tableData.openedAt && (
                    <span className="text-[9.5px] text-japaTextMuted block mt-1">Abertura: <strong>{tableData.openedAt}</strong></span>
                  )}
                </div>
                <div className="border-t border-japaCardLight/40 pt-2 mt-2">
                  <span className="text-[9px] text-japaTextMuted block">Consumo Acumulado</span>
                  <span className="text-sm font-extrabold text-white font-mono">{fmt(comandaSubtotal)}</span>
                </div>
              </div>

              <div className="bg-japaBg/60 border border-japaCardLight p-4 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] text-japaTextMuted uppercase font-bold block mb-1">Itens Lançados na Comanda</span>
                <div className="flex-1 max-h-24 overflow-y-auto space-y-1 pr-1">
                  {tableData.items.length === 0 ? (
                    <div className="text-[10px] text-japaTextMuted py-4 text-center">Nenhum item consumido ainda nesta mesa.</div>
                  ) : (
                    tableData.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] py-0.5 border-b border-japaCardLight/20">
                        <span className="text-white truncate max-w-[120px]">{item.name}</span>
                        <span className="font-mono text-japaTextMuted font-bold">
                          {item.quantity}x <span className="text-japaGold font-normal">{fmt(item.price)}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Waiter Request & Cashier Request alerts */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaRed flex items-center gap-1.5 border-b border-japaCardLight pb-2">
              <Bell size={14} className="text-japaRed" />
              Painel de Atendimentos Recebidos (Garçom / Caixa)
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-xs text-japaTextMuted py-6 text-center">Nenhuma solicitação de mesa ativa no momento.</div>
              ) : (
                alerts.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 bg-japaBg/60 border border-japaCardLight rounded-xl text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-japaBg border ${a.type === 'conta' ? 'border-japaGold/40 text-japaGold' : 'border-japaRed/40 text-japaRed'}`}>
                        <Bell size={13} />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{a.message}</span>
                        <span className="text-[9px] text-japaTextMuted">Chamado recebido às {a.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResolveAlert(a.id)}
                      className="bg-japaCardLight hover:bg-white hover:text-japaBg border border-japaCardLight px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                    >
                      Concluir
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Reviews Rating Log */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-japaCardLight pb-2">
              <MessageSquare size={14} className="text-blue-400" />
              Feed de Avaliações dos Clientes (Mesa)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="text-xs text-japaTextMuted py-8 text-center col-span-2">Nenhuma avaliação enviada ainda.</div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="p-3 bg-japaBg/60 border border-japaCardLight rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white uppercase text-[10px]">Mesa {r.table}</span>
                      <span className="text-[9px] text-japaTextMuted font-mono">{r.time}</span>
                    </div>
                    <div className="flex text-japaGold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} fill={i < r.score ? 'currentColor' : 'none'} className="shrink-0" />
                      ))}
                    </div>
                    <p className="text-[10px] text-japaTextMuted italic leading-relaxed">"{r.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Smartphone Frame Simulator (5/12 width) */}
        <div className="xl:col-span-5 flex justify-center">
          
          {/* Smartphone Mockup Frame */}
          <div className="w-80 h-[590px] bg-[#161618] rounded-[40px] p-3.5 shadow-2xl border-[5px] border-[#2e2f32] flex flex-col relative shrink-0">
            {/* Notch / Speaker */}
            <div className="absolute top-4.5 left-1/2 transform -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-center gap-1.5">
              <span className="w-12 h-1 bg-[#18181c] rounded-full" />
              <span className="w-2 h-2 bg-[#25252b] rounded-full" />
            </div>

            {/* Smartphone Display Screen Content */}
            <div className="flex-1 rounded-[30px] overflow-hidden bg-japaBg flex flex-col justify-between relative border border-black/80 z-10 font-sans shadow-inner select-none">
              
              {/* Smartphone StatusBar */}
              <div className="h-10 bg-japaCard border-b border-japaCardLight/30 pt-4 px-4.5 flex justify-between items-center text-[10px] text-japaTextMuted shrink-0">
                <span className="font-bold text-white font-mono">20:35</span>
                {phoneScreen === 'channel-select' ? (
                  <span className="bg-japaCardLight text-white border border-japaCardLight/50 font-extrabold px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase">
                    Auto-Atendimento
                  </span>
                ) : orderChannel === 'Delivery' ? (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-extrabold px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase">
                    Delivery
                  </span>
                ) : (
                  <span className="bg-japaRed/10 text-japaRed border border-japaRed/20 font-extrabold px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase">
                    Mesa {selectedTableNum}
                  </span>
                )}
              </div>

              {/* DYNAMIC SCREEN SWITCHER */}
              
              {/* VIEW: Channel Select (Delivery or Establishment) */}
              {phoneScreen === 'channel-select' && (
                <div className="flex-1 p-5 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-japaCard to-japaBg animate-fade-in">
                  <div className="w-16 h-16 bg-japaGold/10 border border-japaGold/20 text-japaGold rounded-full flex items-center justify-center animate-soft-pulse">
                    <ShoppingBag size={30} />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-japaGold uppercase tracking-widest">Sushi Japa Prime</h4>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Como deseja pedir hoje?</h3>
                    <p className="text-[9.5px] text-japaTextMuted leading-normal">Escolha a melhor opção para sua refeição.</p>
                  </div>

                  <div className="w-full space-y-3">
                    {/* Option: Comer no Estabelecimento */}
                    <button
                      onClick={() => {
                        setOrderChannel('Mesa');
                        setPhoneScreen('welcome');
                      }}
                      className="w-full bg-japaCard border border-japaCardLight hover:border-japaRed/50 p-4 rounded-xl text-left flex items-center gap-3 transition-all hover:bg-japaCardLight/10 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-japaRed/10 border border-japaRed/20 text-japaRed flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UtensilsCrossed size={18} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-white block group-hover:text-japaRed transition-colors">Comer no Estabelecimento</span>
                        <span className="text-[9px] text-japaTextMuted block">Mesa {selectedTableNum} • Comanda Integrada</span>
                      </div>
                    </button>

                    {/* Option: Pedir para Delivery */}
                    <button
                      onClick={() => {
                        setOrderChannel('Delivery');
                        setPhoneScreen('menu');
                      }}
                      className="w-full bg-japaCard border border-japaCardLight hover:border-blue-500/50 p-4 rounded-xl text-left flex items-center gap-3 transition-all hover:bg-japaCardLight/10 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag size={18} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-white block group-hover:text-blue-400 transition-colors">Pedir para Delivery</span>
                        <span className="text-[9px] text-japaTextMuted block">Receber em casa • Taxa R$ 7,00</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: Welcome Page */}
              {phoneScreen === 'welcome' && (
                <div className="flex-1 p-5 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-japaCard to-japaBg">
                  <div className="w-16 h-16 bg-japaRed/10 border border-japaRed/20 text-japaRed rounded-full flex items-center justify-center animate-soft-pulse">
                    <UtensilsCrossed size={30} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-japaGold uppercase tracking-widest">Sushi Japa Food</h4>
                    <h3 className="text-md font-extrabold text-white uppercase tracking-wider">Bem-Vindo à Mesa {selectedTableNum}!</h3>
                    <p className="text-[10px] text-japaTextMuted px-4 leading-normal">
                      Acesse nosso cardápio digital, faça pedidos diretamente e solicite atendimento direto do seu celular.
                    </p>
                  </div>

                  <div className="w-full bg-japaCard border border-japaCardLight p-3.5 rounded-xl text-[10px] space-y-1 font-mono text-left">
                    <div className="flex justify-between text-japaTextMuted"><span>Mesa Ativa:</span><span className="text-white font-bold">Mesa {selectedTableNum}</span></div>
                    <div className="flex justify-between text-japaTextMuted"><span>Status:</span><span className={tableData.status === 'Livre' ? 'text-green-400 font-bold' : 'text-japaRed font-bold'}>{tableData.status === 'Livre' ? 'Comanda Aberta' : 'Consumindo'}</span></div>
                    <div className="flex justify-between text-japaTextMuted"><span>Acesso:</span><span className="text-white">20:35</span></div>
                  </div>

                  <button
                    onClick={() => setPhoneScreen('menu')}
                    className="w-full bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 glow-red"
                  >
                    Acessar Cardápio
                    <ArrowRight size={11} />
                  </button>
                </div>
              )}

              {/* VIEW: Menu Catalog browsing */}
              {phoneScreen === 'menu' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-japaBg animate-fade-in">
                  {/* Digital Catalog Header */}
                  <div className="p-3 bg-japaCard border-b border-japaCardLight/30 flex items-center justify-between shrink-0">
                    <div className="leading-tight">
                      <h4 className="text-[11px] font-bold text-white uppercase">Sushi Japa Prime</h4>
                      <span className="text-[8px] text-japaGold uppercase tracking-widest font-medium">
                        {orderChannel === 'Delivery' ? 'Cardápio Delivery' : `Cardápio Mesa ${selectedTableNum}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setPhoneScreen('cart')}
                        className="relative p-1 bg-japaBg border border-japaCardLight rounded-lg text-white hover:text-japaGold transition-colors"
                      >
                        <ShoppingBag size={12} />
                        {phoneCart.length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-japaRed text-white text-[7px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-japaBg">
                            {phoneCart.reduce((s,i) => s + i.quantity, 0)}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="p-2 shrink-0">
                    <div className="relative">
                      <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-japaTextMuted" />
                      <input 
                        type="text" 
                        placeholder="Buscar prato..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-japaCard border border-japaCardLight text-white pl-7 pr-3 py-1.5 rounded-lg text-[9px] focus:outline-none focus:border-japaGold"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex gap-1.5 px-2 pb-2 overflow-x-auto shrink-0 scrollbar-none">
                    {phoneCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPhoneCategory(cat)}
                        className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase whitespace-nowrap transition-all ${
                          phoneCategory === cat 
                            ? 'bg-japaRed text-white shadow-md' 
                            : 'bg-japaCard border border-japaCardLight/30 text-japaTextMuted hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards Grid List */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                    {menu
                      .filter(p => p.category === phoneCategory && p.isActive && 
                             (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())))
                      .map(prod => (
                        <div 
                          key={prod.id} 
                          onClick={() => handleOpenDetail(prod)}
                          className="p-2.5 bg-japaCard border border-japaCardLight/40 hover:border-japaGold/30 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:bg-japaCardLight/10"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-white block truncate leading-tight">{prod.name}</span>
                              {prod.price < 35 && (
                                <span className="bg-green-500/10 text-green-400 text-[6.5px] font-bold px-1 rounded uppercase tracking-wider border border-green-500/20 shrink-0">Promo</span>
                              )}
                            </div>
                            <p className="text-[8.5px] text-japaTextMuted line-clamp-2 leading-normal mt-0.5">{prod.description}</p>
                            <span className="text-[9.5px] text-japaGold font-bold font-mono block mt-1">{fmt(prod.price)}</span>
                          </div>
                          
                          <div className="w-10 h-10 bg-japaBg/60 border border-japaCardLight/40 rounded-lg flex items-center justify-center text-japaGold shrink-0 font-extrabold text-[9px] uppercase tracking-wider">
                            Ver
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Floating Action Mobile Panel */}
                  <div className="p-2.5 bg-japaCard border-t border-japaCardLight/30 grid grid-cols-2 gap-2 shrink-0">
                    {orderChannel === 'Delivery' ? (
                      <>
                        <button
                          onClick={() => setPhoneScreen('channel-select')}
                          className="bg-japaBg hover:bg-japaCardLight border border-japaCardLight text-white font-bold py-2 rounded-lg text-[8px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                        >
                          ← Mudar Modo
                        </button>
                        <button
                          onClick={() => setPhoneScreen('cart')}
                          className="bg-japaGold/10 border border-japaGold/30 text-japaGold hover:bg-japaGold hover:text-japaBg font-bold py-2 rounded-lg text-[8px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                        >
                          <ShoppingBag size={10} />
                          Ver Carrinho
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleCallWaiter}
                          className="bg-japaBg hover:bg-japaCardLight border border-japaCardLight text-white font-bold py-2 rounded-lg text-[8px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                        >
                          <Bell size={10} className="text-japaRed" />
                          Chamar Garçom
                        </button>
                        <button
                          onClick={() => setPhoneScreen('split')}
                          className="bg-japaGold/10 border border-japaGold/30 text-japaGold hover:bg-japaGold hover:text-japaBg font-bold py-2 rounded-lg text-[8px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                        >
                          <Receipt size={10} />
                          Pedir Conta
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: Product Details Configuration (Obs + Additions) */}
              {phoneScreen === 'detail' && selectedProduct && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2">
                      <button 
                        onClick={() => setPhoneScreen('menu')}
                        className="text-[9px] text-japaTextMuted hover:text-white uppercase font-bold"
                      >
                        ← Voltar ao Cardápio
                      </button>
                      <h3 className="text-xs font-bold text-white mt-1 uppercase">{selectedProduct.name}</h3>
                      <span className="text-[10px] text-japaGold font-bold font-mono">{fmt(selectedProduct.price)}</span>
                    </div>

                    {/* Desc */}
                    <p className="text-[9px] text-japaTextMuted leading-relaxed">{selectedProduct.description}</p>

                    {/* Additions list */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-japaGold uppercase font-bold tracking-wider block">Adicionais Pagos</span>
                      <div className="space-y-1.5">
                        {ADDITIONS_LIST.map(add => (
                          <div 
                            key={add.id}
                            onClick={() => toggleAddition(add.id)}
                            className={`p-2 rounded-lg border text-[9.5px] flex justify-between items-center cursor-pointer transition-all ${
                              detailAdditions.includes(add.id)
                                ? 'bg-japaRed/10 border-japaRed/50 text-white'
                                : 'bg-japaCard border-japaCardLight/30 text-japaTextMuted hover:text-white'
                            }`}
                          >
                            <span>{add.name}</span>
                            <span className="font-mono font-bold text-japaGold">+{fmt(add.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Observations input */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-japaTextMuted uppercase font-bold block">Observações do Item</span>
                      <textarea
                        rows="2"
                        placeholder="Ex: Sem cebolinha, molho tarê à parte, etc..."
                        value={detailObs}
                        onChange={e => setDetailObs(e.target.value)}
                        className="w-full bg-japaCard border border-japaCardLight rounded-lg text-[9.5px] p-2 text-white placeholder-japaTextMuted focus:outline-none focus:border-japaGold"
                      />
                    </div>
                  </div>

                  {/* Quantity picker & Footer Add button */}
                  <div className="border-t border-japaCardLight/30 pt-3 mt-3 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center bg-japaCard border border-japaCardLight rounded-lg px-2 py-1 gap-3">
                      <button 
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                        className="text-white hover:text-japaRed font-extrabold text-[12px]"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-extrabold text-white text-xs font-mono w-4 text-center">{detailQty}</span>
                      <button 
                        onClick={() => setDetailQty(detailQty + 1)}
                        className="text-white hover:text-japaRed font-extrabold text-[12px]"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white font-bold py-2 rounded-lg text-[9px] uppercase tracking-wider transition-all flex justify-between px-3"
                    >
                      <span>Adicionar</span>
                      <span className="font-mono">
                        {fmt((selectedProduct.price + ADDITIONS_LIST.filter(a => detailAdditions.includes(a.id)).reduce((s,a)=>s+a.price,0)) * detailQty)}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: Shopping Cart Summary list */}
              {phoneScreen === 'cart' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2 flex justify-between items-center">
                      <button 
                        onClick={() => setPhoneScreen('menu')}
                        className="text-[9px] text-japaTextMuted hover:text-white uppercase font-bold"
                      >
                        ← Adicionar Itens
                      </button>
                      <span className="text-[10px] text-white font-bold uppercase">Meu Carrinho</span>
                    </div>

                    {/* Cart Items list */}
                    {phoneCart.length === 0 ? (
                      <div className="text-center py-12 text-xs text-japaTextMuted space-y-2">
                        <ShoppingBag size={20} className="mx-auto text-japaTextMuted" />
                        <p>Seu carrinho está vazio.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {phoneCart.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-japaCard border border-japaCardLight/50 rounded-xl space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-white block leading-tight">{item.name}</span>
                                {item.additions.length > 0 && (
                                  <span className="text-[7.5px] text-japaGold block mt-0.5">
                                    + {item.additions.map(a => a.name).join(', ')}
                                  </span>
                                )}
                                {item.observations && (
                                  <span className="text-[7.5px] text-japaTextMuted italic block mt-0.5">
                                    Obs: "{item.observations}"
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-white font-bold font-mono shrink-0">{fmt(item.totalPrice)}</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-japaCardLight/20 pt-1.5 mt-1.5">
                              <button 
                                onClick={() => updateCartItemQty(idx, -item.quantity)} // removes completely
                                className="text-japaRed/70 hover:text-japaRed flex items-center gap-1 text-[8px] uppercase font-bold"
                              >
                                <Trash2 size={9} /> Excluir
                              </button>
                              
                              <div className="flex items-center bg-japaBg border border-japaCardLight/50 rounded px-1.5 py-0.5 gap-2">
                                <button onClick={() => updateCartItemQty(idx, -1)} className="text-japaTextMuted hover:text-white font-bold text-[9px]">-</button>
                                <span className="font-extrabold text-white text-[9.5px] font-mono">{item.quantity}</span>
                                <button onClick={() => updateCartItemQty(idx, 1)} className="text-japaTextMuted hover:text-white font-bold text-[9px]">+</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checkout calculations & Finalize button */}
                  {phoneCart.length > 0 && (
                    <div className="border-t border-japaCardLight/30 pt-3 mt-3 space-y-2 shrink-0 text-[10px] font-bold font-mono">
                      {orderChannel === 'Delivery' ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-japaTextMuted">Subtotal:</span>
                            <span className="text-white">{fmt(cartTotal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-japaTextMuted">Taxa de Entrega:</span>
                            <span className="text-blue-400">{fmt(7.00)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-japaCardLight/20 pt-1.5 mt-1">
                            <span className="text-japaTextMuted">Total Geral:</span>
                            <span className="text-japaGold">{fmt(cartTotal + 7.00)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-japaTextMuted">Total do Pedido:</span>
                          <span className="text-japaGold">{fmt(cartTotal)}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 glow-red mt-1"
                      >
                        Finalizar Pedido
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: Delivery Details Input */}
              {phoneScreen === 'delivery-details' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2 flex justify-between items-center">
                      <button 
                        onClick={() => setPhoneScreen('cart')}
                        className="text-[9px] text-japaTextMuted hover:text-white uppercase font-bold"
                      >
                        ← Voltar ao Carrinho
                      </button>
                      <span className="text-[10px] text-white font-bold uppercase">Dados de Entrega</span>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold block">Nome Completo *</label>
                        <input 
                          type="text"
                          placeholder="Ex: João da Silva"
                          value={deliveryName}
                          onChange={e => setDeliveryName(e.target.value)}
                          className="w-full bg-japaCard border border-japaCardLight rounded-lg text-[9.5px] p-2 text-white placeholder-japaTextMuted focus:outline-none focus:border-japaGold"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold block">Telefone / WhatsApp *</label>
                        <input 
                          type="text"
                          placeholder="Ex: (11) 99999-9999"
                          value={deliveryPhone}
                          onChange={e => setDeliveryPhone(e.target.value)}
                          className="w-full bg-japaCard border border-japaCardLight rounded-lg text-[9.5px] p-2 text-white placeholder-japaTextMuted focus:outline-none focus:border-japaGold"
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold block">Endereço de Entrega *</label>
                        <textarea 
                          rows="2"
                          placeholder="Ex: Rua das Flores, 123 - Apto 42"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          className="w-full bg-japaCard border border-japaCardLight rounded-lg text-[9.5px] p-2 text-white placeholder-japaTextMuted focus:outline-none focus:border-japaGold resize-none"
                        />
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-japaTextMuted uppercase font-bold block">Forma de Pagamento *</label>
                        <select
                          value={deliveryPaymentMethod}
                          onChange={e => setDeliveryPaymentMethod(e.target.value)}
                          className="w-full bg-japaCard border border-japaCardLight text-white rounded-lg text-[9.5px] p-2 focus:outline-none focus:border-japaGold cursor-pointer"
                        >
                          <option value="Pix">Pix</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Crédito">Cartão de Crédito</option>
                          <option value="Débito">Cartão de Débito</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-japaCardLight/30 pt-3 mt-3 shrink-0">
                    <button
                      disabled={!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()}
                      onClick={handleDeliveryCheckout}
                      className={`w-full font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                        (deliveryName.trim() && deliveryPhone.trim() && deliveryAddress.trim())
                          ? 'bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white glow-red cursor-pointer' 
                          : 'bg-japaCard border border-japaCardLight/30 text-japaTextMuted cursor-not-allowed'
                      }`}
                    >
                      Confirmar Pedido ({fmt(cartTotal + 7.00)})
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: Bill Splitting Selector */}
              {phoneScreen === 'split' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2">
                      <button 
                        onClick={() => setPhoneScreen('menu')}
                        className="text-[9px] text-japaTextMuted hover:text-white uppercase font-bold"
                      >
                        ← Voltar ao Cardápio
                      </button>
                      <h3 className="text-xs font-bold text-white mt-1 uppercase">Solicitar Conta</h3>
                    </div>

                    {/* Split Modes Selector */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] text-japaTextMuted uppercase font-bold tracking-wider block">Como deseja pagar?</span>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {/* Unique account */}
                        <div 
                          onClick={() => setSplitMode('unica')}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            splitMode === 'unica' 
                              ? 'bg-japaRed/10 border-japaRed/50 text-white' 
                              : 'bg-japaCard border-japaCardLight/30 text-japaTextMuted hover:text-white'
                          }`}
                        >
                          <Receipt size={16} className={splitMode === 'unica' ? 'text-japaRed' : 'text-japaTextMuted'} />
                          <div className="text-left">
                            <span className="text-[10px] font-bold block">Pagar Conta Única</span>
                            <span className="text-[8.5px] text-japaTextMuted block">Fechamento do valor integral na comanda.</span>
                          </div>
                        </div>

                        {/* Split Equally */}
                        <div 
                          onClick={() => setSplitMode('igual')}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            splitMode === 'igual' 
                              ? 'bg-japaRed/10 border-japaRed/50 text-white' 
                              : 'bg-japaCard border-japaCardLight/30 text-japaTextMuted hover:text-white'
                          }`}
                        >
                          <Users size={16} className={splitMode === 'igual' ? 'text-japaRed' : 'text-japaTextMuted'} />
                          <div className="text-left flex-1">
                            <span className="text-[10px] font-bold block">Dividir Igualmente</span>
                            <span className="text-[8.5px] text-japaTextMuted block">Dividir o valor total por número de pessoas.</span>
                          </div>
                        </div>

                        {/* Split by Product */}
                        <div 
                          onClick={() => setSplitMode('produto')}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            splitMode === 'produto' 
                              ? 'bg-japaRed/10 border-japaRed/50 text-white' 
                              : 'bg-japaCard border-japaCardLight/30 text-japaTextMuted hover:text-white'
                          }`}
                        >
                          <User size={16} className={splitMode === 'produto' ? 'text-japaRed' : 'text-japaTextMuted'} />
                          <div className="text-left">
                            <span className="text-[10px] font-bold block">Pagar por Produto</span>
                            <span className="text-[8.5px] text-japaTextMuted block">Escolha quais itens você consumiu para pagar.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mode Specific Configurations */}
                    {splitMode === 'igual' && (
                      <div className="bg-japaCard border border-japaCardLight/50 p-3 rounded-xl space-y-3 animate-fade-in text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-japaTextMuted uppercase font-bold">Número de Pessoas</span>
                          <div className="flex items-center bg-japaBg border border-japaCardLight rounded px-1.5 py-0.5 gap-2">
                            <button onClick={() => setSplitPeopleCount(Math.max(2, splitPeopleCount - 1))} className="text-white font-bold">-</button>
                            <span className="font-extrabold text-white font-mono">{splitPeopleCount}</span>
                            <button onClick={() => setSplitPeopleCount(splitPeopleCount + 1)} className="text-white font-bold">+</button>
                          </div>
                        </div>
                        <div className="border-t border-japaCardLight/20 pt-2 flex justify-between font-mono font-bold text-[10.5px]">
                          <span className="text-japaTextMuted">Valor por Pessoa:</span>
                          <span className="text-japaGold">{fmt(comandaSubtotal / splitPeopleCount)}</span>
                        </div>
                      </div>
                    )}

                    {splitMode === 'produto' && (
                      <div className="bg-japaCard border border-japaCardLight/50 p-3 rounded-xl space-y-2.5 animate-fade-in text-xs">
                        <span className="text-[9px] text-japaTextMuted uppercase font-bold block">Selecione seus itens:</span>
                        <div className="max-h-28 overflow-y-auto space-y-1">
                          {tableData.items.map((item, idx) => {
                            const isPaid = !!splitProductsPaid[idx];
                            return (
                              <div 
                                key={idx}
                                onClick={() => setSplitProductsPaid(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className={`p-1.5 rounded flex justify-between items-center cursor-pointer text-[9.5px] ${isPaid ? 'bg-japaRed/10 text-white' : 'text-japaTextMuted hover:text-white'}`}
                              >
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-mono font-bold">{fmt(item.price * item.quantity)}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="border-t border-japaCardLight/20 pt-2 flex justify-between font-mono font-bold text-[10.5px]">
                          <span className="text-japaTextMuted">Meu Subtotal:</span>
                          <span className="text-japaGold">
                            {fmt(tableData.items.reduce((sum, item, idx) => sum + (splitProductsPaid[idx] ? (item.price * item.quantity) : 0), 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Request Closing Button */}
                  <div className="border-t border-japaCardLight/30 pt-3 mt-3 space-y-3 shrink-0">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span className="text-japaTextMuted">Total da Comanda:</span>
                      <span className="text-white">{fmt(comandaSubtotal)}</span>
                    </div>

                    <button
                      onClick={handleRequestBill}
                      className="w-full bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 glow-red"
                    >
                      Pedir Conta
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: Payment Method Selection */}
              {phoneScreen === 'pay' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase">Fechar Comanda</h3>
                      <span className="text-[9px] text-japaTextMuted">Conta solicitada. Selecione a forma de pagamento para simular o caixa recebendo.</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px] bg-japaCard border border-japaCardLight p-3 rounded-xl">
                      <div className="flex justify-between text-japaTextMuted"><span>Total Mesa:</span><span className="text-white">{fmt(comandaSubtotal)}</span></div>
                      <div className="flex justify-between text-japaTextMuted"><span>Divisão:</span><span className="text-japaGold uppercase font-bold">{splitMode}</span></div>
                      {splitMode === 'igual' && (
                        <div className="flex justify-between text-japaTextMuted"><span>Divisão Pessoas:</span><span className="text-white">{splitPeopleCount}x {fmt(comandaSubtotal/splitPeopleCount)}</span></div>
                      )}
                      {splitMode === 'produto' && (
                        <div className="flex justify-between text-japaTextMuted"><span>Seu pagamento:</span><span className="text-white">{fmt(tableData.items.reduce((sum, item, idx) => sum + (splitProductsPaid[idx] ? (item.price * item.quantity) : 0), 0))}</span></div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-japaTextMuted uppercase font-bold tracking-wider block">Escolha a Forma</span>
                      {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map(method => (
                        <button
                          key={method}
                          onClick={() => handleSimulatePayment(method)}
                          className="w-full bg-japaCard border border-japaCardLight hover:border-japaGold/40 text-white font-bold py-2 rounded-xl text-[9.5px] uppercase transition-all flex items-center justify-center gap-1.5"
                        >
                          Pagar via {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: Customer Ratings Star Rating Survey */}
              {phoneScreen === 'rating' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden bg-japaBg animate-fade-in p-3.5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Header */}
                    <div className="border-b border-japaCardLight/30 pb-2 text-center">
                      <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce">
                        <Check size={16} />
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase">Pagamento Confirmado!</h3>
                      <p className="text-[8.5px] text-japaTextMuted leading-normal">Sua comanda foi liquidada. Por favor, nos avalie:</p>
                    </div>

                    {/* Star inputs */}
                    <div className="space-y-3 bg-japaCard border border-japaCardLight p-3.5 rounded-xl">
                      {[
                        { label: 'Qualidade da Comida', key: 'food' },
                        { label: 'Atendimento e Rapidez', key: 'service' },
                        { label: 'Ambiente e Limpeza', key: 'ambience' }
                      ].map(starInput => (
                        <div key={starInput.key} className="space-y-1 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-white uppercase">{starInput.label}</span>
                          <div className="flex gap-2 text-japaGold">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button 
                                key={i}
                                onClick={() => handleScoreChange(starInput.key, i + 1)}
                                className="hover:scale-110 transition-transform focus:outline-none"
                              >
                                <Star 
                                  size={16} 
                                  fill={i < ratingScores[starInput.key] ? 'currentColor' : 'none'} 
                                  className="shrink-0"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback comment input */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-japaTextMuted uppercase font-bold block">Feedback opcional</span>
                      <textarea
                        rows="2"
                        placeholder="Deixe um elogio ou sugestão de melhoria..."
                        value={ratingFeedback}
                        onChange={e => setRatingFeedback(e.target.value)}
                        className="w-full bg-japaCard border border-japaCardLight rounded-lg text-[9.5px] p-2 text-white placeholder-japaTextMuted focus:outline-none focus:border-japaGold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitRating}
                    className="w-full bg-gradient-to-r from-japaRed to-japaRedDark hover:from-japaRedDark text-white font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 glow-red shrink-0"
                  >
                    Enviar Avaliação
                  </button>
                </div>
              )}

              {/* VIEW: Order submitted batch loader screen */}
              {phoneScreen === 'success' && (
                <div className="flex-1 p-5 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in bg-japaBg">
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {orderChannel === 'Delivery' ? 'Pedido Recebido!' : 'Pedido Adicionado!'}
                  </h4>
                  <p className="text-[9px] text-japaTextMuted leading-relaxed px-4">
                    {orderChannel === 'Delivery' 
                      ? 'Seu pedido para entrega foi enviado e já está sendo preparado na nossa cozinha! 🛵' 
                      : 'Os itens foram adicionados à comanda da sua mesa. Já estamos preparando na cozinha! 🍣'}
                  </p>
                </div>
              )}

              {/* Smartphone Home indicators */}
              <div className="h-4 bg-japaCard shrink-0 flex items-center justify-center">
                <span className="w-20 h-1 bg-white/20 rounded-full" />
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
