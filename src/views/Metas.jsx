import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  Calendar,
  Percent,
  TrendingDown
} from 'lucide-react';

export const Metas = () => {
  const { orders, goals } = useContext(AppContext);

  // Today's completed orders
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = orders.filter(o => (o.date === today || o.date === '2026-06-01') && o.status === 'Finalizado');
  
  const todayRevenue = todayCompleted.reduce((sum, o) => sum + o.total, 0);
  const ticketMedio = todayCompleted.length > 0 ? (todayRevenue / todayCompleted.length) : 0;
  
  // Delivery Conversion: (Delivery orders / Total orders) * 100
  const deliveryOrders = orders.filter(o => o.type === 'Delivery');
  const deliveryConversion = orders.length > 0 
    ? Math.round((deliveryOrders.length / orders.length) * 100) 
    : 0;

  const target = goals.dailyTarget;
  const percentMet = Math.min(100, Math.round((todayRevenue / target) * 100));

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-wider text-white">METAS E INDICADORES DE DESEMPENHO</h2>
        <p className="text-xs text-japaTextMuted">Monitore o desempenho financeiro, ticket médio e conversão de canais do restaurante.</p>
      </div>

      {/* Main progress toward today's goal */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-japaCardLight pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
            <Target size={14} className="text-japaGold" />
            Meta de Faturamento do Dia
          </h3>
          <div className="text-right">
            <span className="text-[10px] text-japaTextMuted block uppercase">Objetivo Diário</span>
            <span className="text-sm font-extrabold text-white">R$ {target.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-[9px] text-japaTextMuted block uppercase font-bold">Faturado Hoje</span>
            <span className="text-xl font-extrabold text-white font-mono">R$ {todayRevenue.toFixed(2)}</span>
            <span className="text-[9px] text-green-400 font-bold block mt-0.5">Sessão ativa</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold font-mono">
              <span className="text-japaTextMuted">Atingido:</span>
              <span className="text-japaGold">{percentMet}%</span>
            </div>
            <div className="overflow-hidden h-2.5 rounded-full bg-japaBg border border-japaCardLight">
              <div 
                style={{ width: `${percentMet}%` }} 
                className="h-full rounded-full bg-gradient-to-r from-japaRed to-japaGold glow-gold transition-all"
              />
            </div>
          </div>

          <div className="bg-japaBg/60 border border-japaCardLight p-3.5 rounded-xl text-center">
            <span className="text-[9px] text-japaTextMuted block uppercase font-bold">Déficit da Meta</span>
            <span className="text-md font-bold text-white font-mono">
              {todayRevenue >= target 
                ? 'Meta Superada! 🎉' 
                : `R$ ${(target - todayRevenue).toFixed(2)}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Core KPIs columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Ticket Médio', val: `R$ ${ticketMedio.toFixed(2)}`, desc: 'Valor médio por comanda hoje', icon: Award, color: 'text-japaGold' },
          { label: 'Conversão Delivery', val: `${deliveryConversion}%`, desc: 'Proporção de pedidos delivery', icon: Percent, color: 'text-blue-400' },
          { label: 'Conversão Balcão', val: `${100 - deliveryConversion}%`, desc: 'Pedidos presenciais ou balcão', icon: ShoppingBag, color: 'text-green-400' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-japaCard border border-japaCardLight p-4 rounded-xl flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <span className="text-[9px] text-japaTextMuted block uppercase font-bold tracking-wider">{card.label}</span>
                <span className="text-lg font-extrabold text-white font-mono block">{card.val}</span>
                <span className="text-[9px] text-japaTextMuted block">{card.desc}</span>
              </div>
              <div className={`p-2.5 rounded-lg bg-japaBg border border-japaCardLight ${card.color}`}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical goal table logs */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
          <Calendar size={14} className="text-japaGold" />
          Histórico Comparativo de Metas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-japaBg/60 border-b border-japaCardLight text-[10px] font-bold text-japaTextMuted uppercase tracking-wider">
                <th className="p-3">Data Comparativa</th>
                <th className="p-3">Meta Definida</th>
                <th className="p-3">Faturamento Realizado</th>
                <th className="p-3">% Atingimento</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-japaCardLight/30">
              {goals.history.map((hist, idx) => {
                const met = hist.total >= hist.target;
                return (
                  <tr key={idx} className="hover:bg-japaCardLight/5">
                    <td className="p-3 text-white font-mono font-medium">{hist.date}</td>
                    <td className="p-3 font-mono">R$ {hist.target.toFixed(2)}</td>
                    <td className="p-3 font-mono text-white font-bold">R$ {hist.total.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-japaGold">{hist.percent.toFixed(1)}%</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold uppercase border flex items-center gap-1 w-fit ${
                        met 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-japaRed/10 border-japaRed/20 text-japaRed'
                      }`}>
                        {met ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {met ? 'Meta Atingida' : 'Abaixo da Meta'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
