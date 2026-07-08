import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  ShoppingBag,
  Award
} from 'lucide-react';

export const Relatorios = () => {
  const { orders, menu } = useContext(AppContext);
  const [period, setPeriod] = useState('Mensal'); // Diário, Semanal, Mensal

  const completedOrders = orders.filter(o => o.status === 'Finalizado');

  // Calculations
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;
  
  // Categorized breakdown
  const categorySales = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const match = menu.find(m => m.name === item.name) || {};
      const cat = match.category || 'Outros';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Export to Excel / CSV function
  const handleExportCSV = () => {
    if (completedOrders.length === 0) {
      alert('Nenhum dado disponível para exportação.');
      return;
    }

    // Build CSV Content (in UTF-8 with BOM to support Portuguese accents in Excel)
    let csvContent = "\uFEFF";
    csvContent += "ID Pedido;Cliente;Tipo;Canal;Meio Pagamento;Data;Hora;Subtotal;Taxa;Total;Itens\n";
    
    completedOrders.forEach(o => {
      const itemNames = o.items.map(i => `${i.name} (${i.quantity}x)`).join(', ');
      csvContent += `${o.id};${o.customerName};${o.type};${o.channel};${o.paymentMethod};${o.date};${o.time};${o.subtotal.toFixed(2)};${o.deliveryFee.toFixed(2)};${o.total.toFixed(2)};"${itemNames}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_japa_${period.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">CENTRAL DE INTELIGÊNCIA & RELATÓRIOS</h2>
          <p className="text-xs text-japaTextMuted">Audite resultados operacionais, faturamento e exporte relatórios consolidados.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-japaGold hover:bg-japaGoldDark text-japaBg px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-md"
        >
          <Download size={14} />
          Exportar Planilha (Excel/CSV)
        </button>
      </div>

      {/* Period Filter Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-japaCard border border-japaCardLight p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-1">
          {['Diário', 'Semanal', 'Mensal'].map(per => (
            <button
              key={per}
              onClick={() => setPeriod(per)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                period === per 
                  ? 'bg-japaRed text-white shadow-md' 
                  : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/30'
              }`}
            >
              {per}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-japaTextMuted">
          <Calendar size={14} className="text-japaGold" />
          <span>Período Ativo: <strong>{period === 'Diário' ? 'Hoje' : period === 'Semanal' ? 'Últimos 7 dias' : 'Este Mês'}</strong></span>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Faturamento Total Período', val: `R$ ${totalRevenue.toFixed(2)}`, desc: 'Vendas brutas concluídas', icon: DollarSign, color: 'text-japaGold' },
          { label: 'Pedidos Atendidos', val: completedOrders.length, desc: 'Comanda finalizada/entregue', icon: ShoppingBag, color: 'text-blue-400' },
          { label: 'Ticket Médio Final', val: `R$ ${averageTicket.toFixed(2)}`, desc: 'Média gasta por comanda', icon: Award, color: 'text-green-400' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-japaCard border border-japaCardLight p-4.5 rounded-xl flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <span className="text-[9px] text-japaTextMuted uppercase font-bold tracking-wider">{card.label}</span>
                <span className="text-lg font-extrabold text-white font-mono block">{card.val}</span>
                <span className="text-[9px] text-japaTextMuted block">{card.desc}</span>
              </div>
              <div className={`p-2.5 rounded-lg bg-japaBg border border-japaCardLight ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphical Breakdown Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Category Share List */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 lg:col-span-2 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5 border-b border-japaCardLight pb-2.5">
            <BarChart3 size={14} className="text-japaGold" />
            Distribuição de Faturamento por Categoria
          </h3>
          <div className="space-y-4">
            {Object.entries(categorySales).map(([cat, val], idx) => {
              const sharePercent = totalRevenue > 0 ? Math.round((val / totalRevenue) * 100) : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{cat}</span>
                    <div className="font-mono text-japaTextMuted">
                      <strong className="text-white">R$ {val.toFixed(2)}</strong> ({sharePercent}%)
                    </div>
                  </div>
                  <div className="h-2 w-full bg-japaBg border border-japaCardLight rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${sharePercent}%` }} 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        idx === 0 ? 'from-japaRed to-japaRed/70' :
                        idx === 1 ? 'from-japaGold to-japaGold/70' :
                        'from-blue-500 to-blue-500/70'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(categorySales).length === 0 && (
              <div className="text-center py-8 text-xs text-japaTextMuted">Sem dados operacionais registrados.</div>
            )}
          </div>
        </div>

        {/* Sales List Overview */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-3.5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Histórico Detalhado Simplificado</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {completedOrders.map(o => (
              <div key={o.id} className="p-2.5 bg-japaBg/60 border border-japaCardLight rounded-lg text-[11px] flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Pedido #{o.id} ({o.customerName})</span>
                  <span className="text-japaTextMuted font-mono text-[9px]">{o.date} às {o.time}</span>
                </div>
                <span className="font-mono font-bold text-japaGold">R$ {o.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
