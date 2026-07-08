import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  DollarSign, 
  Truck, 
  Award,
  ChevronRight,
  Utensils,
  Clock
} from 'lucide-react';

export const Dashboard = () => {
  const { orders, cashier, goals, menu } = useContext(AppContext);

  // 1. Calculate live values
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today || o.date === '2026-06-01'); // include fallback demo date
  const completedOrders = todayOrders.filter(o => o.status === 'Finalizado');
  const activeOrders = todayOrders.filter(o => o.status !== 'Finalizado' && o.status !== 'Cancelado');

  const faturamentoDiario = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPedidosConcluidos = completedOrders.length;
  const totalPedidosAtivos = activeOrders.length;

  // Calculate current cash: opening balance + cash sales + suprimentos - sangrias
  const cashSales = completedOrders
    .filter(o => o.paymentMethod.toLowerCase() === 'dinheiro')
    .reduce((sum, o) => sum + o.total, 0);

  const suprimentos = cashier.transactions
    .filter(t => t.type === 'suprimento')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const sangrias = cashier.transactions
    .filter(t => t.type === 'sangria')
    .reduce((sum, t) => sum + t.amount, 0);

  const caixaAtual = cashier.isOpen 
    ? (cashier.initialBalance + cashSales + suprimentos - sangrias) 
    : 0;

  // Profit estimation (around 45% margin)
  const lucroEstimado = faturamentoDiario * 0.45;
  const ticketMedio = totalPedidosConcluidos > 0 ? (faturamentoDiario / totalPedidosConcluidos) : 0;

  // 2. Vendas por Forma de Pagamento
  const payments = { dinheiro: 0, pix: 0, debito: 0, credito: 0, ifood: 0 };
  completedOrders.forEach(o => {
    const method = o.paymentMethod.toLowerCase();
    if (method === 'dinheiro') payments.dinheiro += o.total;
    else if (method === 'pix') payments.pix += o.total;
    else if (method === 'débito' || method === 'debito') payments.debito += o.total;
    else if (method === 'crédito' || method === 'credito') payments.credito += o.total;
    else if (method === 'ifood') payments.ifood += o.total;
  });

  const totalPayments = Object.values(payments).reduce((sum, v) => sum + v, 0) || 1; // avoid division by 0
  const paymentPercentages = {
    dinheiro: Math.round((payments.dinheiro / totalPayments) * 100),
    pix: Math.round((payments.pix / totalPayments) * 100),
    debito: Math.round((payments.debito / totalPayments) * 100),
    credito: Math.round((payments.credito / totalPayments) * 100),
    ifood: Math.round((payments.ifood / totalPayments) * 100)
  };

  // 3. Vendas por Horário (Mock/Filtro das vendas reais de hoje)
  const hourlyData = { '17:00': 0, '18:00': 0, '19:00': 0, '20:00': 0, '21:00': 0, '22:00': 0 };
  completedOrders.forEach(o => {
    const hour = o.time.split(':')[0];
    const key = `${hour}:00`;
    if (hourlyData.hasOwnProperty(key)) {
      hourlyData[key] += o.total;
    } else {
      // Fallback distribution
      hourlyData['20:00'] += o.total;
    }
  });

  // 4. Metas Diárias
  const metaDiaria = goals.dailyTarget;
  const percentMeta = Math.min(100, Math.round((faturamentoDiario / metaDiaria) * 100));

  // 5. Mais Vendidos
  const productSales = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, qty]) => {
      const match = menu.find(m => m.name === name) || {};
      return { name, qty, price: match.price || 0 };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Page Title & Slogan */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">DASHBOARD OPERACIONAL</h2>
          <p className="text-xs text-japaTextMuted">“Gestão inteligente para restaurantes japoneses modernos.”</p>
        </div>
        <div className="flex items-center gap-1.5 bg-japaRed/10 border border-japaRed/20 text-japaRed px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
          <TrendingUp size={14} className="text-japaRed" />
          Faturamento do Dia
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Faturamento', value: `R$ ${faturamentoDiario.toFixed(2)}`, desc: 'Vendas concluídas hoje', color: 'border-japaGold', icon: TrendingUp, iconColor: 'text-japaGold' },
          { label: 'Pedidos Concluídos', value: totalPedidosConcluidos, desc: 'Entregues/Finalizados', color: 'border-japaCardLight', icon: ShoppingBag, iconColor: 'text-blue-400' },
          { label: 'Pedidos em Preparo', value: totalPedidosAtivos, desc: 'Fila de produção ativa', color: 'border-japaCardLight', icon: Clock, iconColor: 'text-japaRed' },
          { label: 'Caixa Atual (Físico)', value: `R$ ${caixaAtual.toFixed(2)}`, desc: 'Dinheiro físico + fundo', color: 'border-japaCardLight', icon: Wallet, iconColor: 'text-green-400' },
          { label: 'Lucro Estimado', value: `R$ ${lucroEstimado.toFixed(2)}`, desc: 'Margem est. de 45%', color: 'border-japaGold', icon: DollarSign, iconColor: 'text-japaGold' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`bg-japaCard border-l-4 ${card.color} rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-japaTextMuted uppercase font-bold tracking-wider">{card.label}</span>
                  <span className="text-lg font-extrabold text-white mt-1">{card.value}</span>
                </div>
                <div className={`p-2 rounded-lg bg-japaBg border border-japaCardLight ${card.iconColor}`}>
                  <Icon size={16} />
                </div>
              </div>
              <span className="text-[9px] text-japaTextMuted mt-3 block">{card.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Goal & Indicators + Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Indicator Card */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
              <Award size={14} className="text-japaGold" />
              Meta de Faturamento Diário
            </h3>
            <span className="text-xs font-bold text-white">R$ {metaDiaria.toLocaleString('pt-BR')}</span>
          </div>

          <div className="space-y-4">
            {/* Visual Gauge */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full bg-japaRed/10 text-japaRed border border-japaRed/20">
                    Progresso Atual
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold inline-block text-japaGold">
                    {percentMeta}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-japaBg border border-japaCardLight">
                <div 
                  style={{ width: `${percentMeta}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-japaRed to-japaGold glow-gold transition-all duration-500" 
                />
              </div>
            </div>

            <div className="bg-japaBg/60 p-3 rounded-lg border border-japaCardLight text-center space-y-1">
              <span className="text-[10px] text-japaTextMuted block">Falta para atingir a meta</span>
              <span className="text-md font-bold text-white">
                {faturamentoDiario >= metaDiaria 
                  ? 'Meta Atingida! Parabéns! 🎉' 
                  : `R$ ${(metaDiaria - faturamentoDiario).toFixed(2)}`
                }
              </span>
            </div>
            
            <div className="flex justify-between text-[10px] text-japaTextMuted">
              <span>Ticket Médio: <strong>R$ {ticketMedio.toFixed(2)}</strong></span>
              <span>Pedidos Totais: <strong>{totalPedidosConcluidos + totalPedidosAtivos}</strong></span>
            </div>
          </div>
        </div>

        {/* Sales by Hour (SVG Line Chart) */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-japaGold" />
            Faturamento por Horário (Pico)
          </h3>
          <div className="h-44 w-full flex items-end justify-between px-2 pt-4 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-japaCardLight/30 border-dashed" />
            <div className="absolute inset-x-0 top-2/4 border-t border-japaCardLight/30 border-dashed" />
            <div className="absolute inset-x-0 top-3/4 border-t border-japaCardLight/30 border-dashed" />
            
            {Object.entries(hourlyData).map(([hour, val]) => {
              // Find max for scaling
              const maxVal = Math.max(...Object.values(hourlyData), 100);
              const heightPercent = Math.max(10, Math.min(90, (val / maxVal) * 90));
              return (
                <div key={hour} className="flex flex-col items-center gap-2 group relative z-10">
                  <div className="text-[9px] text-japaGold font-bold absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity bg-japaBg border border-japaCardLight px-1 rounded">
                    R${val.toFixed(0)}
                  </div>
                  <div 
                    style={{ height: `${heightPercent}px` }} 
                    className="w-5 bg-gradient-to-t from-japaRedDark/60 to-japaRed hover:to-japaGold rounded-t transition-all duration-300 glow-red hover:glow-gold cursor-pointer" 
                  />
                  <span className="text-[9px] text-japaTextMuted font-mono">{hour.split(':')[0]}h</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments Breakdown (Ring/Pie SVG Chart) */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold mb-3 flex items-center gap-1.5">
            <Wallet size={14} className="text-japaGold" />
            Formas de Pagamento (Hoje)
          </h3>
          <div className="flex items-center gap-4 py-2">
            {/* SVG Segmented Circle */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#121214" strokeWidth="3" />
                
                {/* Dynamically drawing segments based on percentages */}
                {/* Segment 1: Pix (Red) */}
                <circle 
                  cx="18" cy="18" r="15.91" fill="none" stroke="#E50914" strokeWidth="3.5" 
                  strokeDasharray={`${paymentPercentages.pix} ${100 - paymentPercentages.pix}`} 
                  strokeDashoffset="0" 
                />
                {/* Segment 2: Card (Dourado) */}
                <circle 
                  cx="18" cy="18" r="15.91" fill="none" stroke="#D4AF37" strokeWidth="3.5" 
                  strokeDasharray={`${paymentPercentages.credito + paymentPercentages.debito} ${100 - (paymentPercentages.credito + paymentPercentages.debito)}`} 
                  strokeDashoffset={`-${paymentPercentages.pix}`} 
                />
                {/* Segment 3: Dinheiro (Green) */}
                <circle 
                  cx="18" cy="18" r="15.91" fill="none" stroke="#10B981" strokeWidth="3.5" 
                  strokeDasharray={`${paymentPercentages.dinheiro} ${100 - paymentPercentages.dinheiro}`} 
                  strokeDashoffset={`-${paymentPercentages.pix + paymentPercentages.credito + paymentPercentages.debito}`} 
                />
                {/* Segment 4: iFood (Orange) */}
                <circle 
                  cx="18" cy="18" r="15.91" fill="none" stroke="#F59E0B" strokeWidth="3.5" 
                  strokeDasharray={`${paymentPercentages.ifood} ${100 - paymentPercentages.ifood}`} 
                  strokeDashoffset={`-${paymentPercentages.pix + paymentPercentages.credito + paymentPercentages.debito + paymentPercentages.dinheiro}`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-extrabold text-white">R$ {faturamentoDiario.toFixed(0)}</span>
                <span className="text-[8px] text-japaTextMuted uppercase">Faturamento</span>
              </div>
            </div>

            {/* Labels */}
            <div className="flex-1 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E50914]" />Pix</span>
                <span className="font-mono text-white">{paymentPercentages.pix}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D4AF37]" />Cartões</span>
                <span className="font-mono text-white">{paymentPercentages.credito + paymentPercentages.debito}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" />Dinheiro</span>
                <span className="font-mono text-white">{paymentPercentages.dinheiro}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />iFood</span>
                <span className="font-mono text-white">{paymentPercentages.ifood}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Best Selling & Delivery Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
              <Utensils size={14} className="text-japaGold" />
              Produtos Mais Vendidos (Hoje)
            </h3>
            <span className="text-[10px] text-japaTextMuted">Ordenado por quantidade</span>
          </div>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-japaBg/60 border border-japaCardLight">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-japaRed/10 border border-japaRed/20 flex items-center justify-center font-bold text-xs text-japaRed">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-white">{prod.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-japaTextMuted font-mono">Qtd: <strong className="text-white">{prod.qty}</strong></span>
                    <span className="text-xs text-japaGold font-bold font-mono">R$ {(prod.qty * prod.price).toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-japaTextMuted">
                Ainda não foram registrados pedidos finalizados hoje.
              </div>
            )}
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
              <Truck size={14} className="text-japaGold" />
              Canais de Delivery
            </h3>
            <span className="text-[10px] text-japaTextMuted">Canais ativos</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'iFood', count: todayOrders.filter(o => o.channel === 'iFood').length, color: 'text-red-400 bg-red-400/5' },
              { name: 'WhatsApp', count: todayOrders.filter(o => o.channel === 'WhatsApp').length, color: 'text-green-400 bg-green-400/5' },
              { name: 'Balcão/Mesa', count: todayOrders.filter(o => o.channel === 'Balcão').length, color: 'text-japaGold bg-japaGold/5' }
            ].map((chan, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-japaBg/60 border border-japaCardLight">
                <span className="text-xs font-semibold text-white">{chan.name}</span>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${chan.color} border border-current/10`}>
                  {chan.count} {chan.count === 1 ? 'Pedido' : 'Pedidos'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
