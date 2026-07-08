import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  Search, 
  Smartphone,
  CheckCheck
} from 'lucide-react';

export const Whatsapp = () => {
  const { whatsappLogs, settings, updateSettings } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  // States for templates
  const [tplReceived, setTplReceived] = useState(settings.whatsappTemplates.received);
  const [tplReady, setTplReady] = useState(settings.whatsappTemplates.ready);
  const [tplDelivered, setTplDelivered] = useState(settings.whatsappTemplates.delivered);

  const [saved, setSaved] = useState(false);

  const handleSaveTemplates = (e) => {
    e.preventDefault();
    updateSettings({
      whatsappTemplates: {
        received: tplReceived,
        ready: tplReady,
        delivered: tplDelivered
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filteredLogs = whatsappLogs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.client.toLowerCase().includes(search) || 
      log.phone.includes(search) || 
      log.text.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-wider text-white">AUTOMAÇÃO DO WHATSAPP DE CLIENTES</h2>
        <p className="text-xs text-japaTextMuted">Monitore os alertas de status enviados automaticamente para os smartphones dos clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: WhatsApp logs list */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 lg:col-span-2 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
              <MessageSquare size={14} className="text-japaGold" />
              Logs de Disparos em Tempo Real
            </h3>
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search size={12} className="text-japaTextMuted" />
              </div>
              <input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-japaBg border border-japaCardLight text-white pl-7 pr-3 py-1 rounded-lg focus:outline-none focus:border-japaGold text-[11px] w-52 font-sans"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <div key={log.id} className="p-3 bg-japaBg/60 border border-japaCardLight rounded-xl flex items-start gap-3 text-xs">
                  {/* Smartphone Icon */}
                  <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center shrink-0">
                    <Smartphone size={14} />
                  </div>
                  
                  {/* Msg Body */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-white">{log.client} <strong className="text-japaTextMuted font-mono font-normal">({log.phone})</strong></span>
                      <span className="text-japaTextMuted font-mono">{log.time}</span>
                    </div>
                    <p className="bg-japaBg border border-japaCardLight/30 p-2 rounded text-[11px] text-green-300 font-sans italic leading-relaxed">
                      {log.text}
                    </p>
                    <div className="flex justify-between items-center text-[9px] pt-1">
                      <span className="text-japaGold font-semibold uppercase">{log.type}</span>
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <CheckCheck size={12} /> Enviado
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-japaTextMuted">
                Nenhuma mensagem WhatsApp disparada recentemente.
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick configurations */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-japaCardLight pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
              <Settings size={14} className="text-japaGold" />
              Templates de Alerta
            </h3>
            {saved && <span className="text-[9px] text-green-400 font-bold">Salvo!</span>}
          </div>

          <form onSubmit={handleSaveTemplates} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold block">1. Pedido Recebido</label>
              <textarea
                value={tplReceived}
                onChange={(e) => setTplReceived(e.target.value)}
                rows={2}
                className="w-full bg-japaBg border border-japaCardLight text-white p-2 rounded-lg text-[11px] resize-none focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold block">2. Pedido Pronto (Despachado)</label>
              <textarea
                value={tplReady}
                onChange={(e) => setTplReady(e.target.value)}
                rows={2}
                className="w-full bg-japaBg border border-japaCardLight text-white p-2 rounded-lg text-[11px] resize-none focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold block">3. Pedido Concluído (Fidelização)</label>
              <textarea
                value={tplDelivered}
                onChange={(e) => setTplDelivered(e.target.value)}
                rows={2}
                className="w-full bg-japaBg border border-japaCardLight text-white p-2 rounded-lg text-[11px] resize-none focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-japaGold hover:bg-japaGoldDark text-japaBg py-2 rounded-lg text-xs font-bold uppercase transition-all"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
