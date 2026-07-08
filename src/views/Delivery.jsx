import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Truck, 
  Clock, 
  MapPin, 
  User, 
  MessageSquare,
  Search,
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const Delivery = () => {
  const { orders, updateOrderStatus, employees, settings } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Get active delivery orders (Delivery type and not finished or canceled)
  const deliveryOrders = orders.filter(o => 
    o.type === 'Delivery' && 
    o.status !== 'Finalizado' && 
    o.status !== 'Cancelado'
  );

  const filteredDeliveries = deliveryOrders.filter(d => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      d.id.includes(search) || 
      d.customerName.toLowerCase().includes(search) || 
      (d.address && d.address.toLowerCase().includes(search))
    );
  });

  const motoboys = employees.filter(emp => emp.role === 'Motoboy' && emp.status === 'Ativo');

  // Stats
  const activeCount = deliveryOrders.length;
  const inTransitCount = deliveryOrders.filter(o => o.status === 'Em entrega').length;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">CONTROLE DE LOGÍSTICA & DELIVERY</h2>
          <p className="text-xs text-japaTextMuted">Monitore rotas de entrega, tempos médios e despache com motoboys.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-japaGold/10 border border-japaGold/20 text-japaGold px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono">
          Taxa Fixa: R$ {settings.deliveryFee.toFixed(2)}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Entregas Ativas', val: activeCount, desc: 'Fila de despacho total', icon: Truck, color: 'text-japaGold' },
          { label: 'Em Trânsito', val: inTransitCount, desc: 'Com o entregador na rua', icon: MapPin, color: 'text-blue-400' },
          { label: 'Tempo Médio', val: '35 min', desc: 'Média de aceitação à entrega', icon: Clock, color: 'text-green-400' },
          { label: 'Motoboys Ativos', val: motoboys.length, desc: 'Equipe de frota disponível', icon: User, color: 'text-purple-400' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-japaCard border border-japaCardLight p-4 rounded-xl shadow-md flex justify-between items-center">
              <div>
                <span className="text-[9px] text-japaTextMuted block uppercase font-bold tracking-wider">{card.label}</span>
                <span className="text-lg font-extrabold text-white mt-1 block">{card.val}</span>
                <span className="text-[9px] text-japaTextMuted block mt-0.5">{card.desc}</span>
              </div>
              <div className={`p-2.5 rounded-lg bg-japaBg border border-japaCardLight ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliveries Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Deliveries List Panel */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Fila de Despacho de Delivery</h3>
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search size={12} className="text-japaTextMuted" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por nome, endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-japaBg border border-japaCardLight text-white pl-7 pr-3 py-1 rounded-lg focus:outline-none focus:border-japaGold text-[11px] w-56"
              />
            </div>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map(dev => (
                <div key={dev.id} className="p-4 bg-japaBg/60 border border-japaCardLight rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">#{dev.id}</span>
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-semibold">{dev.channel}</span>
                      <span className="text-[10px] bg-japaGold/10 text-japaGold border border-japaGold/20 px-1.5 py-0.2 rounded font-semibold font-mono">R$ {dev.total.toFixed(2)}</span>
                    </div>

                    <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <User size={12} className="text-japaGold shrink-0" />
                      <span>{dev.customerName}</span>
                      {dev.phone && <span className="text-[10px] text-japaTextMuted font-mono font-normal">({dev.phone})</span>}
                    </div>

                    <div className="text-[11px] text-japaTextMuted flex items-start gap-1">
                      <MapPin size={12} className="text-japaRed shrink-0 mt-0.5" />
                      <span className="leading-snug">{dev.address || 'Endereço não informado.'}</span>
                    </div>
                  </div>

                  {/* Right: Actions / Status updates */}
                  <div className="flex flex-col sm:items-end justify-between gap-2.5 shrink-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-japaTextMuted font-mono">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        dev.status === 'Preparando' ? 'bg-japaRed/10 border-japaRed/20 text-japaRed animate-soft-pulse' :
                        dev.status === 'Pronto' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {dev.status}
                      </span>
                    </div>

                    {/* Action trigger button */}
                    <div className="flex gap-2">
                      {dev.status === 'Preparando' && (
                        <button
                          onClick={() => updateOrderStatus(dev.id, 'Pronto')}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] py-1 px-3 rounded uppercase transition-colors"
                        >
                          Pronto
                        </button>
                      )}
                      {dev.status === 'Pronto' && (
                        <button
                          onClick={() => updateOrderStatus(dev.id, 'Em entrega')}
                          className="bg-yellow-500 hover:bg-yellow-600 text-japaBg font-bold text-[10px] py-1 px-3 rounded uppercase transition-colors"
                        >
                          Despachar Motoboy
                        </button>
                      )}
                      {dev.status === 'Em entrega' && (
                        <button
                          onClick={() => updateOrderStatus(dev.id, 'Finalizado')}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] py-1 px-3 rounded uppercase transition-colors"
                        >
                          Concluir Entrega
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-japaTextMuted">
                Nenhuma entrega pendente na fila.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Motoboys & Commissions Card */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Equipe de Entregadores</h3>
          <div className="space-y-3">
            {motoboys.map(boy => (
              <div key={boy.id} className="p-3 bg-japaBg/60 border border-japaCardLight rounded-lg space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-japaCardLight/30 pb-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <User size={12} className="text-japaGold" /> {boy.name}
                  </span>
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.2 rounded uppercase font-bold">
                    Livre
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-japaTextMuted">
                  <span>Corridas hoje: <strong>{boy.salesCount}</strong></span>
                  <span>Comissão: <strong className="text-japaGold">R$ {boy.commission.toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
