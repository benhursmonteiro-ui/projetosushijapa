import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Settings, 
  Trash2, 
  Check, 
  Building, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  Database
} from 'lucide-react';

export const Configuracoes = () => {
  const { settings, updateSettings, resetAllData } = useContext(AppContext);

  // Form Fields State
  const [restName, setRestName] = useState(settings.restaurantName);
  const [cnpj, setCnpj] = useState(settings.cnpj);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [fee, setFee] = useState(settings.deliveryFee);

  // Toggles
  const [allowDisc, setAllowDisc] = useState(settings.allowDiscounts);
  const [autoPrint, setAutoPrint] = useState(settings.autoPrintReceipts);
  const [sound, setSound] = useState(settings.soundNotifications);



  const [savedMessage, setSavedMessage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({
      restaurantName: restName,
      cnpj,
      phone,
      address,
      deliveryFee: Number(fee),
      allowDiscounts: allowDisc,
      autoPrintReceipts: autoPrint,
      soundNotifications: sound
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleClearSystem = () => {
    const doubleCheck = window.confirm('ATENÇÃO: Deseja redefinir todo o banco de dados do sistema? Todos os novos pedidos, comandas, movimentações de caixa e insumos cadastrados serão apagados permanentemente.');
    if (doubleCheck) {
      resetAllData();
      alert('Sistema restaurado aos dados de demonstração com sucesso!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">CONFIGURAÇÕES GERAIS DO SISTEMA</h2>
          <p className="text-xs text-japaTextMuted">Defina dados cadastrais, regras de frete e configure automações.</p>
        </div>
        {savedMessage && (
          <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Check size={12} /> Configurações Salvas!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Enterprise details & general parameters */}
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 lg:col-span-2 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5 border-b border-japaCardLight pb-2.5">
            <Building size={14} className="text-japaGold" />
            Dados da Empresa & Regras Operacionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-0.5">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold">Razão Social / Nome Fantasia</label>
              <input
                type="text"
                required
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold">CNPJ</label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold">Telefone Fixa/Celular</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold">Taxa Entrega Padrão (R$)</label>
              <input
                type="number"
                step="0.10"
                required
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
              />
            </div>
            <div className="space-y-0.5 col-span-2">
              <label className="text-[9px] text-japaTextMuted uppercase font-bold">Endereço Principal</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
              />
            </div>
          </div>

          {/* Operational toggles */}
          <div className="border-t border-japaCardLight/50 pt-4 space-y-3">
            <span className="text-[9px] font-bold text-japaGold uppercase tracking-wider block">Preferências Gerais</span>
            
            {[
              { label: 'Permitir descontos em comandas/caixas', desc: 'Ativa campo de desconto na tela de fechamento de mesa.', val: allowDisc, setVal: setAllowDisc },
              { label: 'Impressão automática de vias na cozinha', desc: 'Dispara comando de impressão automática ao fechar mesa ou aceitar delivery.', val: autoPrint, setVal: setAutoPrint },
              { label: 'Notificações sonoras do KDS', desc: 'Emite alerta acústico na entrada de novos pedidos na cozinha.', val: sound, setVal: setSound }
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{pref.label}</span>
                  <span className="text-[10px] text-japaTextMuted">{pref.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => pref.setVal(!pref.val)}
                  className="text-japaGold hover:text-japaGoldLight transition-colors"
                >
                  {pref.val ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-japaTextMuted" />}
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-japaGold hover:bg-japaGoldDark text-japaBg py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
          >
            Confirmar Alterações
          </button>
        </div>

        {/* Right: Danger Zone System actions */}
        <div className="space-y-6">

          {/* Master Reset system data */}
          <div className="bg-japaCard border border-japaRed/10 rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaRed flex items-center gap-1.5 border-b border-japaRed/10 pb-2.5">
              <ShieldAlert size={14} className="text-japaRed" />
              Zona de Perigo
            </h3>
            
            <p className="text-[11px] text-japaTextMuted leading-relaxed">
              Deseja zerar os relatórios de faturamento diário, comandas em aberto ou estoque para restaurar o sistema inicial do MVP?
            </p>

            <button
              type="button"
              onClick={handleClearSystem}
              className="w-full bg-japaRed/10 hover:bg-japaRed text-japaRed hover:text-white border border-japaRed/30 py-2.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5"
            >
              <Database size={14} />
              Resetar Banco de Dados Local
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
