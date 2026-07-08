import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ChefHat, Clock, Check, BellRing } from 'lucide-react';

export const Cozinha = () => {
  const { orders, updateOrderStatus, settings, createOrder } = useContext(AppContext);
  const [ticker, setTicker] = useState(0);

  const handleGenerateExamples = () => {
    // Order 1: Mesa 03
    createOrder({
      customerName: 'Mesa 03',
      phone: '',
      address: '',
      channel: 'Balcão',
      type: 'Mesa',
      status: 'Preparando',
      paymentMethod: 'Pix',
      items: [
        { id: 'prod-1', name: 'Combo Japa Prime', price: 89.90, quantity: 1 },
        { id: 'prod-3', name: 'Temaki Salmão', price: 38.00, quantity: 2 }
      ],
      subtotal: 165.90,
      deliveryFee: 0.00,
      total: 165.90
    });

    // Order 2: Delivery Rodrigo
    createOrder({
      customerName: 'Rodrigo Santos',
      phone: '(11) 98888-7777',
      address: 'Rua das Palmeiras, 450 - Apto 101',
      channel: 'iFood',
      type: 'Delivery',
      status: 'Preparando',
      paymentMethod: 'iFood',
      items: [
        { id: 'prod-2', name: 'Hot Filadélfia (10pcs)', price: 37.90, quantity: 2 },
        { id: 'prod-6', name: 'Guaraná Antarctica', price: 6.00, quantity: 2 }
      ],
      subtotal: 87.80,
      deliveryFee: 7.00,
      total: 94.80
    });

    // Order 3: Mesa 08
    createOrder({
      customerName: 'Mesa 08',
      phone: '',
      address: '',
      channel: 'Balcão',
      type: 'Mesa',
      status: 'Preparando',
      paymentMethod: 'Crédito',
      items: [
        { id: 'prod-5', name: 'Yakisoba Frango', price: 45.00, quantity: 1 },
        { id: 'prod-7', name: 'Água Mineral', price: 4.50, quantity: 1 }
      ],
      subtotal: 49.50,
      deliveryFee: 0.00,
      total: 49.50
    });
  };

  // Tick every second to update preparation timers
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get active kitchen preparation orders (status === 'Preparando')
  const preparingOrders = orders.filter(o => o.status === 'Preparando');

  // Calculates minutes elapsed since a mock time or order time
  const getElapsedMinutes = (orderTime) => {
    // Simple math simulation based on time string (e.g. 21:30)
    const [h, m] = orderTime.split(':').map(Number);
    const now = new Date();
    const orderDate = new Date();
    orderDate.setHours(h, m, 0, 0);

    // If order was from yesterday or future mock
    if (orderDate > now) {
      // simulate 5-15 mins ago
      return Math.max(1, (10 + (parseInt(orderTime.slice(-1)) || 5)) % 25);
    }
    const diffMs = now - orderDate;
    return Math.max(1, Math.round(diffMs / 60000));
  };

  const getTimerColorClass = (mins) => {
    if (mins >= 20) return 'text-japaRed animate-pulse font-extrabold';
    if (mins >= 12) return 'text-japaGold font-bold';
    return 'text-green-400 font-semibold';
  };

  const handleSetReady = (id) => {
    updateOrderStatus(id, 'Pronto');
    // Simulated audio ping if enabled
    if (settings.soundNotifications && typeof Audio !== 'undefined') {
      try {
        // Play simple beep or simulate it
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(0.1);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">PAINEL DE PRODUÇÃO DA COZINHA (KDS)</h2>
          <p className="text-xs text-japaTextMuted">Tela dedicada para os sushimen visualizarem itens pendentes e cronometrarem preparos.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleGenerateExamples}
            className="bg-japaGold/10 hover:bg-japaGold border border-japaGold/30 hover:text-japaBg text-japaGold px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
          >
            Gerar Comandas de Exemplo
          </button>
          <div className="flex items-center gap-1.5 bg-japaRed/10 border border-japaRed/20 text-japaRed px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
            <ChefHat size={14} className="text-japaRed" />
            Fila de Preparo: {preparingOrders.length}
          </div>
        </div>
      </div>

      {/* Production Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {preparingOrders.length > 0 ? (
          preparingOrders.map(order => {
            const elapsedMins = getElapsedMinutes(order.time);
            return (
              <div 
                key={order.id} 
                className={`bg-japaCard border-t-4 rounded-xl p-4 flex flex-col justify-between shadow-lg h-[260px] ${
                  elapsedMins >= 20 ? 'border-japaRed glow-red' : 'border-japaCardLight'
                }`}
              >
                {/* Card Header */}
                <div className="border-b border-japaCardLight/50 pb-2 flex justify-between items-start">
                  <div className="leading-tight">
                    <span className="font-mono font-bold text-white text-xs">Pedido #{order.id}</span>
                    <span className="text-[10px] text-japaTextMuted block uppercase font-bold mt-0.5">
                      {order.type} {order.type === 'Mesa' && `(${order.customerName})`}
                    </span>
                  </div>
                  
                  {/* Cronometer */}
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <Clock size={12} className={elapsedMins >= 20 ? 'text-japaRed animate-spin' : 'text-japaTextMuted'} />
                    <span className={getTimerColorClass(elapsedMins)}>{elapsedMins} min</span>
                  </div>
                </div>

                {/* Items details list */}
                <div className="flex-1 overflow-y-auto py-2.5 space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-white p-1 rounded bg-japaBg/30">
                      <span className="font-bold">{item.name}</span>
                      <span className="bg-japaGold text-japaBg font-bold px-1.5 py-0.2 rounded font-mono text-[11px]">
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>

                {/* Card Footer action */}
                <button
                  onClick={() => handleSetReady(order.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold uppercase py-2 rounded-lg text-[10px] tracking-wider transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={12} />
                  Marcar como Pronto
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center text-japaTextMuted bg-japaCard border border-japaCardLight rounded-xl flex flex-col items-center gap-2">
            <ChefHat size={32} className="text-japaTextMuted/20" />
            <span className="text-xs">Nenhum prato pendente de preparação. Aguardando comandas! 🍣</span>
          </div>
        )}
      </div>
    </div>
  );
};
