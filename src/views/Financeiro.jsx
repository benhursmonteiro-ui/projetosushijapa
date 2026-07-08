import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import {
  DollarSign, TrendingDown, TrendingUp, Wallet, Plus, X, Trash2,
  ReceiptText, Package, ArrowDownLeft, BarChart3, ChevronDown, ChevronUp,
  Filter, Search, Calendar, ShoppingCart, Building, Wrench, Leaf, Download
} from 'lucide-react';

// ─── Helper ──────────────────────────────────────────────────────────────────
const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const EXPENSE_CATEGORIES = ['Matéria-Prima', 'Embalagens', 'Limpeza', 'Manutenção', 'Marketing', 'Aluguel', 'Energia', 'Gás', 'Internet', 'Outros'];
const INVESTMENT_CATEGORIES = ['Equipamentos', 'Reformas', 'Capital', 'Tecnologia', 'Marketing', 'Outros'];
const PAYMENT_METHODS = ['Dinheiro', 'Pix', 'Débito', 'Crédito', 'Boleto'];

const catIcon = (cat) => {
  const map = { 'Matéria-Prima': Leaf, 'Embalagens': Package, 'Equipamentos': Wrench, 'Reformas': Building };
  const Icon = map[cat] || ShoppingCart;
  return <Icon size={13} />;
};

// ─── Modal: Nova Despesa ──────────────────────────────────────────────────────
const ExpenseModal = ({ onClose, partners, currentUser, onSave }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    category: 'Matéria-Prima',
    paymentMethod: 'Pix',
    notes: '',
    partnerId: currentUser?.partnerId || partners[0]?.id || '',
    attachment: ''
  });
  const [items, setItems] = useState([{ product: '', qty: 1, unit: 'un', unitPrice: '', total: 0 }]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const setItem = (idx, k, v) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [k]: v };
      if (k === 'qty' || k === 'unitPrice') {
        const qty = k === 'qty' ? Number(v) : Number(updated[idx].qty);
        const up  = k === 'unitPrice' ? Number(v) : Number(updated[idx].unitPrice);
        updated[idx].total = qty * up;
      }
      return updated;
    });
  };

  const addItem = () => setItems(prev => [...prev, { product: '', qty: 1, unit: 'un', unitPrice: '', total: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((s, i) => s + (Number(i.total) || 0), 0);

  const handleSave = () => {
    if (!form.supplier || !form.date) return;
    const responsible = partners.find(p => p.id === form.partnerId)?.name || currentUser?.name;
    onSave({ ...form, items, total, responsible });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-japaCard border border-japaCardLight rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-japaCardLight bg-japaCard">
          <h3 className="text-sm font-bold uppercase tracking-wider text-japaRed flex items-center gap-2">
            <ReceiptText size={16} /> Registrar Despesa
          </h3>
          <button onClick={onClose} className="text-japaTextMuted hover:text-white transition-colors p-1 rounded hover:bg-japaCardLight">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Data</label>
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Responsável (Sócio)</label>
              <select value={form.partnerId} onChange={e => setField('partnerId', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Fornecedor / Local</label>
              <input type="text" placeholder="Ex: Feira Livre, Peixaria..." value={form.supplier} onChange={e => setField('supplier', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Categoria</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Forma de Pagamento</label>
              <select value={form.paymentMethod} onChange={e => setField('paymentMethod', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Observações</label>
              <input type="text" placeholder="Anotação opcional..." value={form.notes} onChange={e => setField('notes', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold block mb-1">Nota Fiscal / Comprovante (Opcional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nenhum arquivo anexado"
                  value={form.attachment}
                  readOnly
                  className="flex-1 bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const files = ['comprovante_compra.pdf', 'nota_fiscal_feira.jpg', 'cupom_fiscal_sushi.png', 'recibo_pagamento.pdf'];
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    setField('attachment', randomFile);
                  }}
                  className="bg-japaGold/10 border border-japaGold/30 text-japaGold hover:bg-japaGold hover:text-japaBg px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                >
                  Simular Anexo
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-japaGold uppercase font-bold tracking-wider">Itens da Compra</label>
              <button onClick={addItem} className="text-[10px] text-japaGold hover:underline flex items-center gap-1">
                <Plus size={11} /> Adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-1 text-[9px] text-japaTextMuted uppercase font-bold px-1">
                <span className="col-span-4">Produto</span>
                <span className="col-span-2">Qtd</span>
                <span className="col-span-2">Unid</span>
                <span className="col-span-2">V.Unit</span>
                <span className="col-span-1 text-right">Total</span>
                <span className="col-span-1"></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                  <input type="text" placeholder="Produto..." value={item.product} onChange={e => setItem(idx, 'product', e.target.value)}
                    className="col-span-4 bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-japaGold" />
                  <input type="number" min="0" step="0.01" value={item.qty} onChange={e => setItem(idx, 'qty', e.target.value)}
                    className="col-span-2 bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-japaGold" />
                  <select value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)}
                    className="col-span-2 bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-japaGold">
                    {['un','kg','g','L','mL','cx','maço','saco'].map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input type="number" min="0" step="0.01" placeholder="0,00" value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', e.target.value)}
                    className="col-span-2 bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-japaGold" />
                  <span className="col-span-1 text-right text-japaGold font-bold text-[10px] font-mono">
                    {Number(item.total || 0).toFixed(2)}
                  </span>
                  <button onClick={() => removeItem(idx)} className="col-span-1 flex justify-center text-japaRed/60 hover:text-japaRed transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={addItem}
              className="w-full bg-japaBg hover:bg-japaCardLight border border-dashed border-japaGold/40 hover:border-japaGold text-japaGold hover:text-white py-2.5 rounded-lg text-[10.5px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus size={13} /> Registrar Outro Item na Nota
            </button>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center bg-japaBg border border-japaCardLight rounded-lg px-4 py-3">
            <span className="text-xs font-bold text-japaTextMuted uppercase">Total da Despesa</span>
            <span className="text-lg font-extrabold text-japaRed font-mono">{fmt(total)}</span>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-japaCardLight bg-japaCard/50">
          <button onClick={onClose} className="flex-1 border border-japaCardLight text-japaTextMuted hover:text-white hover:border-white/20 py-2 rounded-lg text-xs font-bold uppercase transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.supplier}
            className="flex-2 flex-1 bg-japaRed hover:bg-japaRedDark text-white py-2 rounded-lg text-xs font-bold uppercase transition-all glow-red disabled:opacity-50">
            Salvar Despesa
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal: Novo Investimento ─────────────────────────────────────────────────
const InvestmentModal = ({ onClose, partners, currentUser, onSave }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Equipamentos',
    value: '',
    notes: '',
    partnerId: currentUser?.partnerId || partners[0]?.id || '',
  });
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSave = () => {
    if (!form.description || !form.value) return;
    const responsible = partners.find(p => p.id === form.partnerId)?.name || currentUser?.name;
    onSave({ ...form, value: Number(form.value), responsible });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-japaCard border border-japaCardLight rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-japaCardLight">
          <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-2">
            <TrendingUp size={16} /> Registrar Investimento
          </h3>
          <button onClick={onClose} className="text-japaTextMuted hover:text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Data', key: 'date', type: 'date' },
            { label: 'Descrição', key: 'description', type: 'text', placeholder: 'Ex: Forno combinado, Reforma do salão...' },
            { label: 'Valor (R$)', key: 'value', type: 'number', placeholder: '0,00' },
            { label: 'Observações', key: 'notes', type: 'text', placeholder: 'Detalhe opcional...' },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">{f.label}</label>
              <input type={f.type} step={f.type === 'number' ? '0.01' : undefined} min={f.type === 'number' ? '0' : undefined}
                value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setField(f.key, e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Categoria</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
                {INVESTMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold">Responsável</label>
              <select value={form.partnerId} onChange={e => setField('partnerId', e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t border-japaCardLight">
          <button onClick={onClose} className="flex-1 border border-japaCardLight text-japaTextMuted hover:text-white py-2 rounded-lg text-xs font-bold uppercase transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={!form.description || !form.value}
            className="flex-1 bg-japaGold hover:bg-japaGoldDark text-japaBg py-2 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50">
            Salvar Investimento
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal: Nova Retirada ─────────────────────────────────────────────────────
const WithdrawalModal = ({ onClose, partners, currentUser, onSave }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    reason: 'Retirada mensal pro-labore',
    partnerId: currentUser?.partnerId || partners[0]?.id || '',
  });
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSave = () => {
    if (!form.value || !form.reason) return;
    const partner = partners.find(p => p.id === form.partnerId);
    onSave({ ...form, value: Number(form.value), partnerName: partner?.name || currentUser?.name });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-japaCardLight">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <ArrowDownLeft size={16} /> Registrar Retirada
          </h3>
          <button onClick={onClose} className="text-japaTextMuted hover:text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-japaTextMuted uppercase font-bold">Sócio</label>
            <select value={form.partnerId} onChange={e => setField('partnerId', e.target.value)}
              className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-japaTextMuted uppercase font-bold">Valor (R$)</label>
            <input type="number" step="0.01" min="0" placeholder="0,00" value={form.value} onChange={e => setField('value', e.target.value)}
              className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-japaTextMuted uppercase font-bold">Data</label>
            <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
              className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-japaTextMuted uppercase font-bold">Motivo</label>
            <input type="text" value={form.reason} onChange={e => setField('reason', e.target.value)}
              className="w-full bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t border-japaCardLight">
          <button onClick={onClose} className="flex-1 border border-japaCardLight text-japaTextMuted hover:text-white py-2 rounded-lg text-xs font-bold uppercase transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={!form.value}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50">
            Salvar Retirada
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const Financeiro = () => {
  const { cashier, expenses, investments, withdrawals, orders, partners, currentUser, addExpense, addInvestment, addWithdrawal, deleteExpense, deleteInvestment } = useContext(AppContext);

  const [activeTab,  setActiveTab]  = useState('resumo');
  const [showExpMod, setShowExpMod] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [partnerDateFilterActive, setPartnerDateFilterActive] = useState(false);
  const [partnerFilterDate, setPartnerFilterDate] = useState('2026-06-01');
  const [expandedPartnerExp, setExpandedPartnerExp] = useState(null);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filterDate, setFilterDate] = useState('2026-06-01');
  const [socioViewTab, setSocioViewTab] = useState('geral');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Adiciona o cabeçalho do XML Spreadsheet 2003
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?mso-application progid="Excel.Sheet"?>\n`;
    xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`;
    xml += ` xmlns:o="urn:schemas-microsoft-com:office:office"\n`;
    xml += ` xmlns:x="urn:schemas-microsoft-com:office:excel"\n`;
    xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n`;
    xml += ` xmlns:html="http://www.w3.org/TR/REC-html40">\n`;
    
    // 1. DEFINIÇÃO DE ESTILOS DA PLANILHA (Cores premium da marca Sushi Japa)
    xml += ` <Styles>\n`;
    xml += `  <Style ss:ID="Default" ss:Name="Normal">\n`;
    xml += `   <Alignment ss:Vertical="Bottom"/>\n`;
    xml += `   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>\n`;
    xml += `  </Style>\n`;
    
    // sTitle (Título Vermelho Japa Grande)
    xml += `  <Style ss:ID="sTitle">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#800000"/>\n`;
    xml += `   <Alignment ss:Vertical="Center"/>\n`;
    xml += `  </Style>\n`;
    
    // sBold (Texto em negrito)
    xml += `  <Style ss:ID="sBold">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#000000"/>\n`;
    xml += `  </Style>\n`;

    // sItalic (Legendas em itálico)
    xml += `  <Style ss:ID="sItalic">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#595959"/>\n`;
    xml += `  </Style>\n`;

    // sHeader (Fundo Vermelho Escuro, Texto Branco Negrito)
    xml += `  <Style ss:ID="sHeader">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>\n`;
    xml += `   <Interior ss:Color="#800000" ss:Pattern="Solid"/>\n`;
    xml += `   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#800000"/>\n`;
    xml += `   </Borders>\n`;
    xml += `  </Style>\n`;

    // sHeaderGold (Fundo Dourado Japa, Texto Vermelho Japa)
    xml += `  <Style ss:ID="sHeaderGold">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#800000"/>\n`;
    xml += `   <Interior ss:Color="#D4AF37" ss:Pattern="Solid"/>\n`;
    xml += `   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>\n`;
    xml += `   </Borders>\n`;
    xml += `  </Style>\n`;

    // sSubHeader (Fundo Cinza Claro, Texto Preto Negrito)
    xml += `  <Style ss:ID="sSubHeader">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#000000"/>\n`;
    xml += `   <Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/>\n`;
    xml += `   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>\n`;
    xml += `    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>\n`;
    xml += `    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>\n`;
    xml += `   </Borders>\n`;
    xml += `  </Style>\n`;

    // sDataCell (Bordas padrão nas células)
    xml += `  <Style ss:ID="sDataCell">\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `   </Borders>\n`;
    xml += `   <Alignment ss:Vertical="Center"/>\n`;
    xml += `  </Style>\n`;

    // sDataCellBRL (Bordas padrão + Formatação de Moeda Brasileira)
    xml += `  <Style ss:ID="sDataCellBRL">\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `   </Borders>\n`;
    xml += `   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>\n`;
    xml += `   <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00;[Red]&quot;R$&quot;\ \(#,##0.00\);&quot;R$&quot;\ -"/>\n`;
    xml += `  </Style>\n`;

    // sBoldBRL (Bordas + Formatação de Moeda Brasileira em Negrito)
    xml += `  <Style ss:ID="sBoldBRL">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#800000"/>\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `   </Borders>\n`;
    xml += `   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>\n`;
    xml += `   <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00;[Red]&quot;R$&quot;\ \(#,##0.00\);&quot;R$&quot;\ -"/>\n`;
    xml += `  </Style>\n`;

    // sCalendarMonth (Meses do calendário)
    xml += `  <Style ss:ID="sCalendarMonth">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>\n`;
    xml += `   <Interior ss:Color="#800000" ss:Pattern="Solid"/>\n`;
    xml += `   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n`;
    xml += `  </Style>\n`;

    // sCalendarDayHeader (Dias da semana do calendário)
    xml += `  <Style ss:ID="sCalendarDayHeader">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#FFFFFF" ss:Bold="1"/>\n`;
    xml += `   <Interior ss:Color="#C00000" ss:Pattern="Solid"/>\n`;
    xml += `   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n`;
    xml += `  </Style>\n`;

    // sHyperlink (Estilo Link de Navegação de Abas)
    xml += `  <Style ss:ID="sHyperlink">\n`;
    xml += `   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0000FF" ss:Underline="Single"/>\n`;
    xml += `   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n`;
    xml += `   <Borders>\n`;
    xml += `    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>\n`;
    xml += `   </Borders>\n`;
    xml += `  </Style>\n`;

    xml += ` </Styles>\n`;

    // Auxiliares de formatação e escape XML
    const escapeXML = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    const formatBRL = (val) => {
      return Number(val || 0).toFixed(2).replace('.', ',');
    };

    // 2. PRIMEIRA ABA: CALENDÁRIO COM LINKS DE ATALHO
    xml += ` <Worksheet ss:Name="Calendário">\n`;
    xml += `  <Table>\n`;
    
    // Definição de Larguras das Colunas (3 blocos de 7 dias + 2 colunas separadoras)
    xml += `   <Column ss:Width="30" ss:Span="6"/>\n`; // Cols 1-7 (Bloco 1)
    xml += `   <Column ss:Width="15"/>\n`; // Col 8 (Espaço)
    xml += `   <Column ss:Width="30" ss:Span="6"/>\n`; // Cols 9-15 (Bloco 2)
    xml += `   <Column ss:Width="15"/>\n`; // Col 16 (Espaço)
    xml += `   <Column ss:Width="30" ss:Span="6"/>\n`; // Cols 17-23 (Bloco 3)
    
    // Título Principal do Painel de Atalhos
    xml += `   <Row ss:Height="30">\n`;
    xml += `    <Cell ss:MergeAcross="22" ss:StyleID="sTitle"><Data ss:Type="String">PAINEL DE ATALHOS CALENDÁRIO FINANCEIRO - ANO 2026</Data></Cell>\n`;
    xml += `   </Row>\n`;
    xml += `   <Row ss:Height="20">\n`;
    xml += `    <Cell ss:MergeAcross="22" ss:StyleID="sItalic"><Data ss:Type="String">DICA: Clique em qualquer dia de qualquer mês para navegar diretamente ao financeiro completo do dia selecionado.</Data></Cell>\n`;
    xml += `   </Row>\n`;
    xml += `   <Row ss:Height="15"/>\n`;

    const monthsNames = [
      'JANEIRO 2026', 'FEVEREIRO 2026', 'MARÇO 2026', 'ABRIL 2026', 'MAIO 2026', 'JUNHO 2026',
      'JULHO 2026', 'AGOSTO 2026', 'SETEMBRO 2026', 'OUTUBRO 2026', 'NOVEMBRO 2026', 'DEZEMBRO 2026'
    ];
    
    // Função auxiliar para retornar a matriz 6x7 de dias do mês
    const getMonthGrid = (yearVal, monthIdx) => {
      const firstDay = new Date(yearVal, monthIdx, 1);
      const startDayOfWeek = firstDay.getDay(); // 0 = Dom, 6 = Sáb
      const daysInMonth = new Date(yearVal, monthIdx + 1, 0).getDate();
      
      const grid = [];
      let currentDay = 1;
      
      for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
          if (w === 0 && d < startDayOfWeek) {
            week.push(null);
          } else if (currentDay > daysInMonth) {
            week.push(null);
          } else {
            week.push(currentDay);
            currentDay++;
          }
        }
        grid.push(week);
      }
      return grid;
    };
    
    const year = 2026;
    
    // Renderiza os meses organizados em grid de 3 colunas de meses (4 linhas no total)
    for (let q = 0; q < 4; q++) {
      const m1 = q * 3;
      const m2 = q * 3 + 1;
      const m3 = q * 3 + 2;
      
      const grid1 = getMonthGrid(year, m1);
      const grid2 = getMonthGrid(year, m2);
      const grid3 = getMonthGrid(year, m3);
      
      // Linha de Títulos dos Meses
      xml += `   <Row ss:Height="22">\n`;
      xml += `    <Cell ss:MergeAcross="6" ss:StyleID="sCalendarMonth"><Data ss:Type="String">${monthsNames[m1]}</Data></Cell>\n`;
      xml += `    <Cell><Data ss:Type="String"/></Cell>\n`;
      xml += `    <Cell ss:MergeAcross="6" ss:StyleID="sCalendarMonth"><Data ss:Type="String">${monthsNames[m2]}</Data></Cell>\n`;
      xml += `    <Cell><Data ss:Type="String"/></Cell>\n`;
      xml += `    <Cell ss:MergeAcross="6" ss:StyleID="sCalendarMonth"><Data ss:Type="String">${monthsNames[m3]}</Data></Cell>\n`;
      xml += `   </Row>\n`;
      
      // Linha de Dias da Semana
      xml += `   <Row ss:Height="18">\n`;
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      for (let m = 0; m < 3; m++) {
        weekdays.forEach(wd => {
          xml += `    <Cell ss:StyleID="sCalendarDayHeader"><Data ss:Type="String">${wd}</Data></Cell>\n`;
        });
        if (m < 2) {
          xml += `    <Cell><Data ss:Type="String"/></Cell>\n`;
        }
      }
      xml += `   </Row>\n`;
      
      // Renderiza as 6 semanas do bloco
      for (let w = 0; w < 6; w++) {
        xml += `   <Row ss:Height="20">\n`;
        
        // Mês 1
        for (let d = 0; d < 7; d++) {
          const day = grid1[w][d];
          if (day) {
            const dateStr = `${year}-${String(m1 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            xml += `    <Cell ss:StyleID="sHyperlink" ss:HRef="#'${dateStr}'!A1"><Data ss:Type="String">${String(day).padStart(2, '0')}</Data></Cell>\n`;
          } else {
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String"/></Cell>\n`;
          }
        }
        xml += `    <Cell><Data ss:Type="String"/></Cell>\n`;
        
        // Mês 2
        for (let d = 0; d < 7; d++) {
          const day = grid2[w][d];
          if (day) {
            const dateStr = `${year}-${String(m2 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            xml += `    <Cell ss:StyleID="sHyperlink" ss:HRef="#'${dateStr}'!A1"><Data ss:Type="String">${String(day).padStart(2, '0')}</Data></Cell>\n`;
          } else {
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String"/></Cell>\n`;
          }
        }
        xml += `    <Cell><Data ss:Type="String"/></Cell>\n`;
        
        // Mês 3
        for (let d = 0; d < 7; d++) {
          const day = grid3[w][d];
          if (day) {
            const dateStr = `${year}-${String(m3 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            xml += `    <Cell ss:StyleID="sHyperlink" ss:HRef="#'${dateStr}'!A1"><Data ss:Type="String">${String(day).padStart(2, '0')}</Data></Cell>\n`;
          } else {
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String"/></Cell>\n`;
          }
        }
        
        xml += `   </Row>\n`;
      }
      
      // Espaçamentos entre os blocos
      xml += `   <Row ss:Height="15"/>\n`;
      xml += `   <Row ss:Height="15"/>\n`;
    }
    
    xml += `  </Table>\n`;
    xml += ` </Worksheet>\n`;

    // 3. CONSTRUÇÃO DAS 365 ABAS DE DIAS (UMA ABA PARA CADA DIA DO ANO DE 2026)
    let currentDate = new Date(year, 0, 1);
    while (currentDate.getFullYear() === year) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const displayDate = `${dd}/${mm}/${yyyy}`;
      
      // Filtros diários de movimentações
      const dayOrders = orders.filter(o => o.status === 'Finalizado' && o.date === dateStr);
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const dayInvestments = investments.filter(i => i.date === dateStr);
      const dayWithdrawals = withdrawals.filter(w => w.date === dateStr);
      
      // Balanço financeiro diário
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      const dayExpensesTotal = dayExpenses.reduce((sum, e) => sum + e.total, 0);
      const dayInvestmentsTotal = dayInvestments.reduce((sum, i) => sum + i.value, 0);
      const dayWithdrawalsTotal = dayWithdrawals.reduce((sum, w) => sum + w.value, 0);
      const dayNetProfit = dayRevenue - dayExpensesTotal - dayWithdrawalsTotal;
      
      xml += ` <Worksheet ss:Name="${dateStr}">\n`;
      xml += `  <Table>\n`;
      xml += `   <Column ss:Width="100"/>\n`; // A: ID Pedido / Despesa / Investimento / Retirada
      xml += `   <Column ss:Width="120"/>\n`; // B: Responsável / Sócio / Cliente
      xml += `   <Column ss:Width="100"/>\n`; // C: Fornecedor / Canal / Categoria
      xml += `   <Column ss:Width="100"/>\n`; // D: Forma Pagamento / Motivo
      xml += `   <Column ss:Width="220"/>\n`; // E: Descrição / Itens da Compra
      xml += `   <Column ss:Width="80"/>\n`;  // F: Quantidade / Subtotal
      xml += `   <Column ss:Width="80"/>\n`;  // G: Unidade / Preço Unitário / Taxa
      xml += `   <Column ss:Width="95"/>\n`;  // H: Total Item / Total Geral
      
      // Linha de Título
      xml += `   <Row ss:Height="25">\n`;
      xml += `    <Cell ss:MergeAcross="7" ss:StyleID="sTitle"><Data ss:Type="String">DETALHAMENTO FINANCEIRO DIÁRIO - SUSHI JAPA PRIME</Data></Cell>\n`;
      xml += `   </Row>\n`;
      
      // Data do Relatório e Link de Retorno
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="3" ss:StyleID="sBold"><Data ss:Type="String">Data do Relatório: ${displayDate}</Data></Cell>\n`;
      xml += `    <Cell ss:MergeAcross="3" ss:StyleID="sHyperlink" ss:HRef="#'Calendário'!A1"><Data ss:Type="String">⬅ Voltar ao Calendário de Atalhos</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="15"/>\n`;
      
      // Tabela Sintética de Indicadores do Dia
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Faturamento</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Despesas</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Investimentos</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Retiradas</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Lucro Líquido</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">Fluxo de Caixa</Data></Cell>\n`;
      xml += `   </Row>\n`;
      
      xml += `   <Row ss:Height="20">\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayRevenue}</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayExpensesTotal}</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayInvestmentsTotal}</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayWithdrawalsTotal}</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayNetProfit}</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${dayNetProfit - dayWithdrawalsTotal}</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="15"/>\n`;
      
      // Distribuição de Cotas dos Sócios
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="4" ss:StyleID="sHeaderGold"><Data ss:Type="String">ÁREA DOS SÓCIOS: PARTICIPAÇÃO E COTAS DIÁRIAS (25% CADA)</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Sócio</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Participação</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Cota do Lucro</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Retiradas Realizadas</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Saldo Individual</Data></Cell>\n`;
      xml += `   </Row>\n`;
      
      partners.forEach(p => {
        const shareVal = dayNetProfit * (p.share / 100);
        const partnerWd = dayWithdrawals.filter(w => w.partnerId === p.id).reduce((s, w) => s + w.value, 0);
        const bal = shareVal - partnerWd;
        
        xml += `   <Row ss:Height="18">\n`;
        xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(p.name)}</Data></Cell>\n`;
        xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${p.share}%</Data></Cell>\n`;
        xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${shareVal}</Data></Cell>\n`;
        xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${partnerWd}</Data></Cell>\n`;
        xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${bal}</Data></Cell>\n`;
        xml += `   </Row>\n`;
      });
      xml += `   <Row ss:Height="15"/>\n`;
      
      // TABELA: GANHOS DO DIA (FATURAMENTO DE VENDAS)
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sHeader"><Data ss:Type="String">GANHOS DO DIA (FATURAMENTO DE VENDAS)</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">ID Pedido</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Cliente</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Canal</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Forma Pagto</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader" ss:MergeAcross="3"><Data ss:Type="String">Itens do Pedido</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Subtotal</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Taxa Entrega</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Total Geral</Data></Cell>\n`;
      xml += `   </Row>\n`;

      if (dayOrders.length === 0) {
        xml += `   <Row ss:Height="18">\n`;
        xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sItalic"><Data ss:Type="String">Nenhum faturamento de vendas registrado para esta data.</Data></Cell>\n`;
        xml += `   </Row>\n`;
      } else {
        dayOrders.forEach(o => {
          const itemsStr = o.items.map(i => `${i.quantity}x ${i.name}`).join(' | ');
          xml += `   <Row ss:Height="18">\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(o.id)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(o.customerName)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(o.channel)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(o.paymentMethod)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell" ss:MergeAcross="3"><Data ss:Type="String">${escapeXML(itemsStr)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${o.subtotal}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${o.deliveryFee}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${o.total}</Data></Cell>\n`;
          xml += `   </Row>\n`;
        });
      }
      xml += `   <Row ss:Height="15"/>\n`;

      // TABELA: GASTOS DE CADA SÓCIO (DESPESAS / COMPRAS / FEIRAS)
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sHeader"><Data ss:Type="String">GASTOS DE CADA SÓCIO (DESPESAS DETALHADAS / FEIRAS / NOTINHA)</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">ID Despesa</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Sócio Responsável</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Fornecedor / Credor</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Categoria / Área</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Forma Pagto</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Produto / Item Compra</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Qtd / Unidade</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">V. Unitário</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">V. Total Item</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Observações</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Nota Fiscal / Anexo</Data></Cell>\n`;
      xml += `   </Row>\n`;

      if (dayExpenses.length === 0) {
        xml += `   <Row ss:Height="18">\n`;
        xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sItalic"><Data ss:Type="String">Nenhum gasto ou feira de sócio registrado para esta data.</Data></Cell>\n`;
        xml += `   </Row>\n`;
      } else {
        dayExpenses.forEach(e => {
          if (e.items && e.items.length > 0) {
            e.items.forEach(item => {
              xml += `   <Row ss:Height="18">\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.id)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.responsible)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.supplier)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.category)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.paymentMethod)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(item.product)}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${item.qty} ${item.unit}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${item.unitPrice}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${item.total}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.notes || '-')}</Data></Cell>\n`;
              xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.attachment || '-')}</Data></Cell>\n`;
              xml += `   </Row>\n`;
            });
            // Linha de subtotalizador do gasto
            xml += `   <Row ss:Height="18">\n`;
            xml += `    <Cell ss:MergeAcross="7" ss:StyleID="sSubHeader"><Data ss:Type="String">TOTAL DESPESA ${e.id} - ${escapeXML(e.supplier)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sBoldBRL"><Data ss:Type="Number">${e.total}</Data></Cell>\n`;
            xml += `    <Cell ss:MergeAcross="1"><Data ss:Type="String"/></Cell>\n`;
            xml += `   </Row>\n`;
          } else {
            xml += `   <Row ss:Height="18">\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.id)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.responsible)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.supplier)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.category)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.paymentMethod)}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">-</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">-</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="String">-</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${e.total}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.notes || '-')}</Data></Cell>\n`;
            xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(e.attachment || '-')}</Data></Cell>\n`;
            xml += `   </Row>\n`;
          }
        });
      }
      xml += `   <Row ss:Height="15"/>\n`;

      // TABELA: INVESTIMENTOS DO DIA
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sHeaderGold"><Data ss:Type="String">INVESTIMENTOS REGISTRADOS NO DIA</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">ID Investimento</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Sócio Aportador</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader" ss:MergeAcross="2"><Data ss:Type="String">Descrição do Investimento</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Categoria</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader" ss:MergeAcross="3"><Data ss:Type="String">Notas / Observações</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Valor Aporte</Data></Cell>\n`;
      xml += `   </Row>\n`;

      if (dayInvestments.length === 0) {
        xml += `   <Row ss:Height="18">\n`;
        xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sItalic"><Data ss:Type="String">Nenhum investimento registrado para esta data.</Data></Cell>\n`;
        xml += `   </Row>\n`;
      } else {
        dayInvestments.forEach(inv => {
          xml += `   <Row ss:Height="18">\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(inv.id)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(inv.responsible)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell" ss:MergeAcross="2"><Data ss:Type="String">${escapeXML(inv.description)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(inv.category)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell" ss:MergeAcross="3"><Data ss:Type="String">${escapeXML(inv.notes || '-')}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${inv.value}</Data></Cell>\n`;
          xml += `   </Row>\n`;
        });
      }
      xml += `   <Row ss:Height="15"/>\n`;

      // TABELA: RETIRADAS DOS SÓCIOS NO DIA
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sHeader"><Data ss:Type="String">RETIRADAS DE CAPITAL DOS SÓCIOS</Data></Cell>\n`;
      xml += `   </Row>\n`;
      xml += `   <Row ss:Height="18">\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">ID Retirada</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Sócio Retirante</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader" ss:MergeAcross="7"><Data ss:Type="String">Motivo da Retirada / Pró-Labore</Data></Cell>\n`;
      xml += `    <Cell ss:StyleID="sSubHeader"><Data ss:Type="String">Valor Retirado</Data></Cell>\n`;
      xml += `   </Row>\n`;

      if (dayWithdrawals.length === 0) {
        xml += `   <Row ss:Height="18">\n`;
        xml += `    <Cell ss:MergeAcross="10" ss:StyleID="sItalic"><Data ss:Type="String">Nenhuma retirada de capital registrada para esta data.</Data></Cell>\n`;
        xml += `   </Row>\n`;
      } else {
        dayWithdrawals.forEach(w => {
          xml += `   <Row ss:Height="18">\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(w.id)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell"><Data ss:Type="String">${escapeXML(w.partnerName)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCell" ss:MergeAcross="7"><Data ss:Type="String">${escapeXML(w.reason)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="sDataCellBRL"><Data ss:Type="Number">${w.value}</Data></Cell>\n`;
          xml += `   </Row>\n`;
        });
      }
      
      xml += `  </Table>\n`;
      xml += ` </Worksheet>\n`;
      
      // Incrementa o dia para a próxima iteração
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    xml += `</Workbook>\n`;
    
    // Geração do arquivo e download do XML no navegador
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financeiro_sushi_japa_ano_${year}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showInvMod, setShowInvMod] = useState(false);
  const [showWdMod,  setShowWdMod]  = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterCat,  setFilterCat]  = useState('');
  const [expandedExp, setExpandedExp] = useState(null);

  // ─── Filtered Lists by Date ──────────────────────────────────────────────────
  const filteredRevenueOrders = useMemo(() => {
    let list = orders.filter(o => o.status === 'Finalizado');
    if (dateFilterActive && filterDate) {
      list = list.filter(o => o.date === filterDate);
    }
    return list;
  }, [orders, filterDate, dateFilterActive]);

  const filteredExpensesList = useMemo(() => {
    let list = expenses;
    if (dateFilterActive && filterDate) {
      list = list.filter(e => e.date === filterDate);
    }
    return list;
  }, [expenses, filterDate, dateFilterActive]);

  const filteredInvestmentsList = useMemo(() => {
    let list = investments;
    if (dateFilterActive && filterDate) {
      list = list.filter(i => i.date === filterDate);
    }
    return list;
  }, [investments, filterDate, dateFilterActive]);

  const filteredWithdrawalsList = useMemo(() => {
    let list = withdrawals;
    if (dateFilterActive && filterDate) {
      list = list.filter(w => w.date === filterDate);
    }
    return list;
  }, [withdrawals, filterDate, dateFilterActive]);

  // ─── Computed Totals ────────────────────────────────────────────────────────
  const totalRevenue     = useMemo(() => filteredRevenueOrders.reduce((s, o) => s + o.total, 0), [filteredRevenueOrders]);
  const totalExpenses    = useMemo(() => filteredExpensesList.reduce((s, e) => s + (e.total || 0), 0), [filteredExpensesList]);
  const totalInvestments = useMemo(() => filteredInvestmentsList.reduce((s, i) => s + (i.value || 0), 0), [filteredInvestmentsList]);
  const totalWithdrawals = useMemo(() => filteredWithdrawalsList.reduce((s, w) => s + (w.value || 0), 0), [filteredWithdrawalsList]);
  const netProfit        = totalRevenue - totalExpenses - totalWithdrawals;

  // ─── Filtered Lists for View Tables ─────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    let list = filteredExpensesList;
    return list.filter(e => {
      const matchSearch = !search || e.supplier?.toLowerCase().includes(search.toLowerCase()) || e.responsible?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || e.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [filteredExpensesList, search, filterCat]);

  // ─── KPI Cards ──────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Faturamento Total', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-green-400', border: 'border-green-400/30', bg: 'bg-green-400/5' },
    { label: 'Total de Despesas', value: fmt(totalExpenses), icon: TrendingDown, color: 'text-japaRed', border: 'border-japaRed/30', bg: 'bg-japaRed/5' },
    { label: 'Investimentos', value: fmt(totalInvestments), icon: BarChart3, color: 'text-japaGold', border: 'border-japaGold/30', bg: 'bg-japaGold/5' },
    { label: 'Retiradas', value: fmt(totalWithdrawals), icon: ArrowDownLeft, color: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/5' },
    { label: 'Lucro Líquido Est.', value: fmt(netProfit), icon: Wallet, color: netProfit >= 0 ? 'text-green-400' : 'text-japaRed', border: netProfit >= 0 ? 'border-green-400/30' : 'border-japaRed/30', bg: netProfit >= 0 ? 'bg-green-400/5' : 'bg-japaRed/5' },
  ];

  const tabs = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'despesas', label: `Despesas (${filteredExpenses.length})` },
    { id: 'investimentos', label: `Investimentos (${filteredInvestmentsList.length})` },
    { id: 'retiradas', label: `Retiradas (${filteredWithdrawalsList.length})` },
    { id: 'sociedade', label: 'Sociedade' },
  ];

  return (
    <div className="space-y-5 animate-fade-in p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">FINANCEIRO GERAL</h2>
          <p className="text-xs text-japaTextMuted">Controle completo de despesas, investimentos e retiradas dos sócios.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-sm">
            <Download size={13} /> Exportar Planilha
          </button>
          <button onClick={() => setShowExpMod(true)} className="flex items-center gap-1.5 bg-japaRed/10 border border-japaRed/30 text-japaRed hover:bg-japaRed hover:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all">
            <Plus size={13} /> Despesa
          </button>
          <button onClick={() => setShowInvMod(true)} className="flex items-center gap-1.5 bg-japaGold/10 border border-japaGold/30 text-japaGold hover:bg-japaGold hover:text-japaBg px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all">
            <Plus size={13} /> Investimento
          </button>
          <button onClick={() => setShowWdMod(true)} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all">
            <Plus size={13} /> Retirada
          </button>
        </div>
      </div>

      {/* Date Filter Calendar Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-japaCard border border-japaCardLight p-3.5 rounded-xl shadow-md print:hidden">
        <div className="flex items-center gap-2 text-xs text-white">
          <Calendar size={14} className="text-japaGold" />
          <span>Filtro de Período Financeiro:</span>
          <div className="flex bg-japaBg rounded-lg p-0.5 border border-japaCardLight ml-2">
            <button
              onClick={() => setDateFilterActive(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${!dateFilterActive ? 'bg-japaRed text-white shadow-md' : 'text-japaTextMuted hover:text-white'}`}
            >
              Acumulado (Tudo)
            </button>
            <button
              onClick={() => setDateFilterActive(true)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${dateFilterActive ? 'bg-japaRed text-white shadow-md' : 'text-japaTextMuted hover:text-white'}`}
            >
              Diário (Calendário)
            </button>
          </div>
        </div>

        {dateFilterActive && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-[10px] text-japaTextMuted uppercase font-bold">Escolha a data:</span>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-japaBg border border-japaCardLight text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-japaGold cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className={`bg-japaCard border ${k.border} rounded-xl p-4 flex flex-col gap-2 shadow-md`}>
              <div className={`w-8 h-8 rounded-lg ${k.bg} border ${k.border} flex items-center justify-center ${k.color}`}>
                <Icon size={15} />
              </div>
              <div>
                <span className="text-[9px] text-japaTextMuted uppercase font-bold tracking-wider block">{k.label}</span>
                <span className={`text-base font-extrabold font-mono ${k.color}`}>{k.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-japaCard border border-japaCardLight rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-japaRed text-white shadow-md' : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Resumo ── */}
      {activeTab === 'resumo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Expense by Category */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaRed mb-4 flex items-center gap-2"><TrendingDown size={13}/> Despesas por Categoria</h3>
            <div className="space-y-3">
              {(() => {
                const byCat = {};
                expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.total; });
                return Object.entries(byCat).sort((a,b) => b[1] - a[1]).map(([cat, val]) => {
                  const pct = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-japaTextMuted">{catIcon(cat)}{cat}</span>
                        <span className="font-mono text-white font-bold">{fmt(val)} <span className="text-japaTextMuted font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-japaBg rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-japaRed to-japaRed/60 rounded-full transition-all duration-500" />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Withdrawals by Partner */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-2"><ArrowDownLeft size={13}/> Retiradas por Sócio</h3>
            <div className="space-y-3">
              {partners.map(p => {
                const partnerWd = withdrawals.filter(w => w.partnerId === p.id).reduce((s, w) => s + w.value, 0);
                const partnerExp = expenses.filter(e => e.partnerId === p.id).reduce((s, e) => s + e.total, 0);
                return (
                  <div key={p.id} 
                    onClick={() => {
                      setSelectedPartnerId(p.id);
                      setSocioViewTab('individual');
                      setActiveTab('sociedade');
                    }}
                    className="p-3 bg-japaBg/60 border border-japaCardLight hover:border-japaGold/40 rounded-lg flex justify-between items-center cursor-pointer hover:bg-japaCardLight/10 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-japaGold transition-colors">{p.name}</span>
                        <span className="text-[9px] text-japaTextMuted block">{p.share}% participação · Compras: {fmt(partnerExp)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold font-mono text-xs block">{fmt(partnerWd)}</span>
                      <span className="text-[8px] text-japaTextMuted group-hover:text-white transition-colors">Ver Detalhes ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lucro por sócio */}
            <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <span className="text-[10px] text-green-400 uppercase font-bold block mb-1">Lucro por sócio (estimado)</span>
              {partners.map(p => (
                <div key={p.id} className="flex justify-between text-xs py-0.5">
                  <span className="text-japaTextMuted">{p.name} ({p.share}%)</span>
                  <span className="font-mono text-green-400 font-bold">{fmt(netProfit * p.share / 100)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold mb-4">Últimas Movimentações</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                ...expenses.slice(0, 5).map(e => ({ ...e, _type: 'Despesa', _color: 'text-japaRed', _val: -e.total })),
                ...investments.slice(0, 3).map(i => ({ ...i, _type: 'Investimento', _color: 'text-japaGold', _val: -i.value })),
                ...withdrawals.slice(0, 3).map(w => ({ ...w, _type: 'Retirada', _color: 'text-blue-400', _val: -w.value, supplier: w.partnerName })),
              ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((mov, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-japaBg/60 border border-japaCardLight rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-white">{mov.supplier || mov.description || mov.partnerName}</span>
                    <span className={`text-[9px] font-bold uppercase ml-2 px-1 py-0.5 rounded ${mov._color} bg-current/10`}>{mov._type}</span>
                    <span className="text-japaTextMuted text-[10px] block">{mov.date} · {mov.category || mov.reason}</span>
                  </div>
                  <span className={`font-mono font-bold ${mov._color}`}>{fmt(Math.abs(mov._val))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Caixa Diário Operacional */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-4 flex items-center gap-2">
              <DollarSign size={13}/> Caixa Diário (Operacional)
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-japaBg/60 border border-japaCardLight rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-japaTextMuted uppercase font-bold block">Status do Caixa</span>
                  <span className={`text-xs font-bold ${cashier.isOpen ? 'text-green-400 animate-soft-pulse' : 'text-japaRed'}`}>
                    {cashier.isOpen ? 'ABERTO' : 'FECHADO'}
                  </span>
                </div>
                {cashier.isOpen && (
                  <div className="text-right">
                    <span className="text-[10px] text-japaTextMuted block">Fundo Inicial</span>
                    <span className="font-mono text-white font-bold text-xs">{fmt(cashier.initialBalance)}</span>
                  </div>
                )}
              </div>

              {cashier.isOpen ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-japaBg/40 border border-japaCardLight p-2 rounded">
                      <span className="text-[9px] text-japaTextMuted block font-bold">Suprimentos (+)</span>
                      <span className="font-mono text-green-400 font-bold">
                        {fmt(cashier.transactions.filter(t => t.type === 'suprimento').reduce((s,t) => s + t.amount, 0))}
                      </span>
                    </div>
                    <div className="bg-japaBg/40 border border-japaCardLight p-2 rounded">
                      <span className="text-[9px] text-japaTextMuted block font-bold">Sangrias (-)</span>
                      <span className="font-mono text-japaRed font-bold">
                        {fmt(cashier.transactions.filter(t => t.type === 'sangria').reduce((s,t) => s + t.amount, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <span className="text-[9.5px] text-japaTextMuted uppercase font-bold block">Movimentações Lançadas</span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                      {cashier.transactions.length === 0 ? (
                        <div className="text-[10px] text-center text-japaTextMuted py-2">Nenhuma movimentação extra.</div>
                      ) : (
                        cashier.transactions.map((tx, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] p-2 bg-japaBg/40 border border-japaCardLight/30 rounded">
                            <span className="text-japaTextMuted">
                              <span className="font-bold text-white font-mono">{tx.time}</span> · {tx.reason}
                            </span>
                            <span className={`font-bold font-mono ${tx.type === 'suprimento' ? 'text-green-400' : 'text-japaRed'}`}>
                              {tx.type === 'suprimento' ? '+' : '-'} {fmt(tx.amount)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-japaTextMuted">
                  Aguardando abertura de novo caixa para exibir movimentações operacionais em tempo real.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Despesas ── */}
      {activeTab === 'despesas' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 items-center bg-japaCard border border-japaCardLight p-3 rounded-xl">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-japaTextMuted" />
              <input type="text" placeholder="Buscar fornecedor ou responsável..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-japaBg border border-japaCardLight text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-japaGold">
              <option value="">Todas as categorias</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="space-y-2">
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-xs text-japaTextMuted">Nenhuma despesa encontrada.</div>
            )}
            {filteredExpenses.map(exp => (
              <div key={exp.id} className="bg-japaCard border border-japaCardLight rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-japaCardLight/20 transition-colors"
                  onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-japaRed/10 border border-japaRed/20 flex items-center justify-center text-japaRed">
                      {catIcon(exp.category)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white">{exp.supplier}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-japaTextMuted">{exp.date}</span>
                        <span className="text-[10px] bg-japaCardLight px-1.5 py-0.5 rounded text-japaTextMuted">{exp.category}</span>
                        <span className="text-[10px] text-japaTextMuted">{exp.responsible}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-japaRed font-bold font-mono text-sm">{fmt(exp.total)}</span>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Excluir esta despesa?')) deleteExpense(exp.id); }}
                      className="text-japaTextMuted hover:text-japaRed transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                    {expandedExp === exp.id ? <ChevronUp size={14} className="text-japaTextMuted" /> : <ChevronDown size={14} className="text-japaTextMuted" />}
                  </div>
                </div>

                {/* Expanded items */}
                {expandedExp === exp.id && (
                  <div className="border-t border-japaCardLight bg-japaBg/40 p-4 animate-fade-in">
                    {exp.notes && <p className="text-[10px] text-japaTextMuted mb-3 italic">"{exp.notes}"</p>}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[9px] text-japaTextMuted uppercase border-b border-japaCardLight">
                            <th className="text-left pb-2 font-bold">Produto</th>
                            <th className="text-right pb-2 font-bold">Qtd</th>
                            <th className="text-right pb-2 font-bold">Unid</th>
                            <th className="text-right pb-2 font-bold">V.Unit</th>
                            <th className="text-right pb-2 font-bold">Total</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-1">
                          {exp.items?.map((item, i) => (
                            <tr key={i} className="border-b border-japaCardLight/30">
                              <td className="py-1.5 text-white">{item.product}</td>
                              <td className="py-1.5 text-right text-japaTextMuted">{item.qty}</td>
                              <td className="py-1.5 text-right text-japaTextMuted">{item.unit}</td>
                              <td className="py-1.5 text-right text-japaTextMuted font-mono">{fmt(item.unitPrice)}</td>
                              <td className="py-1.5 text-right text-japaGold font-bold font-mono">{fmt(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="pt-3 text-right text-[10px] text-japaTextMuted uppercase font-bold">Total:</td>
                            <td className="pt-3 text-right text-japaRed font-extrabold font-mono">{fmt(exp.total)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[9px] text-japaTextMuted">
                      <div className="flex gap-2">
                        <span>Pgto: <strong className="text-white">{exp.paymentMethod}</strong></span>
                        <span>·</span>
                        <span>Horário: <strong className="text-white">{exp.time}</strong></span>
                      </div>
                      {exp.attachment && (
                        <span className="flex items-center gap-1 bg-japaGold/10 text-japaGold px-1.5 py-0.5 rounded border border-japaGold/20 font-mono">
                          <ReceiptText size={10} /> {exp.attachment}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Investimentos ── */}
      {activeTab === 'investimentos' && (
        <div className="space-y-3">
          {filteredInvestmentsList.length === 0 && (
            <div className="text-center py-12 text-xs text-japaTextMuted">Nenhum investimento registrado.</div>
          )}
          {filteredInvestmentsList.map(inv => (
            <div key={inv.id} className="bg-japaCard border border-japaCardLight rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-japaGold/10 border border-japaGold/20 flex items-center justify-center text-japaGold">
                  <TrendingUp size={15} />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">{inv.description}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-japaTextMuted">{inv.date}</span>
                    <span className="text-[10px] bg-japaCardLight px-1.5 py-0.5 rounded text-japaTextMuted">{inv.category}</span>
                    <span className="text-[10px] text-japaTextMuted">por {inv.responsible}</span>
                  </div>
                  {inv.notes && <span className="text-[10px] text-japaTextMuted italic">"{inv.notes}"</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-japaGold font-bold font-mono text-sm">{fmt(inv.value)}</span>
                <button onClick={() => { if(window.confirm('Excluir este investimento?')) deleteInvestment(inv.id); }}
                  className="text-japaTextMuted hover:text-japaRed transition-colors p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Retiradas ── */}
      {activeTab === 'retiradas' && (
        <div className="space-y-3">
          {filteredWithdrawalsList.length === 0 && (
            <div className="text-center py-12 text-xs text-japaTextMuted">Nenhuma retirada registrada.</div>
          )}
          {filteredWithdrawalsList.map(wd => {
            const partner = partners.find(p => p.id === wd.partnerId);
            return (
              <div key={wd.id} className="bg-japaCard border border-japaCardLight rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs text-white"
                    style={{ borderColor: partner?.color || '#3B82F6', backgroundColor: `${partner?.color || '#3B82F6'}20` }}>
                    {wd.partnerName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">{wd.partnerName}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-japaTextMuted">{wd.date}</span>
                      <span className="text-[10px] text-japaTextMuted">{wd.time}</span>
                    </div>
                    <span className="text-[10px] text-japaTextMuted italic">{wd.reason}</span>
                  </div>
                </div>
                <span className="text-blue-400 font-bold font-mono text-sm">{fmt(wd.value)}</span>
              </div>
            );
          })}

          {/* Summary by partner */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-4">
            <h4 className="text-xs font-bold text-japaGold uppercase mb-3">Total por Sócio</h4>
            <div className="grid grid-cols-2 gap-2">
              {partners.map(p => {
                const total = withdrawals.filter(w => w.partnerId === p.id).reduce((s,w) => s + w.value, 0);
                return (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-japaBg/60 border border-japaCardLight rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-white">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400">{fmt(total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Sociedade ── */}
      {activeTab === 'sociedade' && (
        <div className="space-y-5">
          {/* Sub-tabs & Print Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-japaCard border border-japaCardLight p-3 rounded-xl print:hidden">
            <div className="flex gap-1.5">
              <button onClick={() => setSocioViewTab('geral')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${socioViewTab === 'geral' ? 'bg-japaGold text-japaBg shadow-md' : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/50'}`}>
                Visão Geral da Sociedade
              </button>
              <button onClick={() => setSocioViewTab('individual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${socioViewTab === 'individual' ? 'bg-japaGold text-japaBg shadow-md' : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/50'}`}>
                Relatório por Sócio
              </button>
            </div>
            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-japaCardLight border border-japaCardLight hover:border-white/20 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all">
              Imprimir Relatório
            </button>
          </div>

          {/* SUB-VIEW: Visão Geral da Sociedade */}
          {socioViewTab === 'geral' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Financial Society Indicators */}
              <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-2"><DollarSign size={13}/> Balanço Geral dos Sócios</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                  <div className="bg-japaBg/60 border border-japaCardLight p-3 rounded-lg">
                    <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Investimentos Totais</span>
                    <span className="text-sm font-extrabold text-white block mt-1">{fmt(totalInvestments)}</span>
                  </div>
                  <div className="bg-japaBg/60 border border-japaCardLight p-3 rounded-lg">
                    <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Despesas Sociais</span>
                    <span className="text-sm font-extrabold text-japaRed block mt-1">{fmt(totalExpenses)}</span>
                  </div>
                  <div className="bg-japaBg/60 border border-japaCardLight p-3 rounded-lg">
                    <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Retiradas Sócios</span>
                    <span className="text-sm font-extrabold text-blue-400 block mt-1">{fmt(totalWithdrawals)}</span>
                  </div>
                  <div className="bg-japaBg/60 border border-japaCardLight p-3 rounded-lg">
                    <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Lucro Líquido Est.</span>
                    <span className={`text-sm font-extrabold block mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-japaRed'}`}>{fmt(netProfit)}</span>
                  </div>
                </div>

                <div className="bg-japaBg/40 border border-japaCardLight p-4 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">Fluxo de Caixa da Sociedade</span>
                    <span className="text-[10px] text-japaTextMuted">Balanço líquido de lucro estimado menos retiradas dos sócios.</span>
                  </div>
                  <span className={`font-mono font-extrabold text-base ${netProfit - totalWithdrawals >= 0 ? 'text-green-400' : 'text-japaRed'}`}>
                    {fmt(netProfit - totalWithdrawals)}
                  </span>
                </div>
              </div>

              {/* Share Distribution */}
              <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Participação Societária</h3>
                <div className="space-y-2">
                  {partners.map(p => {
                    const shareVal = netProfit * (p.share / 100);
                    const partnerWd = withdrawals.filter(w => w.partnerId === p.id).reduce((s, w) => s + w.value, 0);
                    const bal = shareVal - partnerWd;
                    return (
                      <div key={p.id}
                        onClick={() => {
                          setSelectedPartnerId(p.id);
                          setSocioViewTab('individual');
                        }}
                        className="p-3 bg-japaBg/60 border border-japaCardLight hover:border-japaGold/40 rounded-lg space-y-2 cursor-pointer hover:bg-japaCardLight/10 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white flex items-center gap-2 group-hover:text-japaGold transition-colors">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.name}
                          </span>
                          <span className="text-[9px] text-japaTextMuted group-hover:text-white transition-colors">Ver Relatório ➔</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-japaTextMuted border-t border-japaCardLight/30 pt-1.5">
                          <span>Cota: <strong className="text-white font-mono">{fmt(shareVal)}</strong></span>
                          <span>Retiradas: <strong className="text-white font-mono">{fmt(partnerWd)}</strong></span>
                          <span>Saldo: <strong className={`font-mono ${bal >= 0 ? 'text-green-400' : 'text-japaRed'}`}>{fmt(bal)}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: Relatório por Sócio */}
          {socioViewTab === 'individual' && (
            <div className="space-y-4 animate-fade-in">
              {/* Partner Picker & Date Filter */}
              <div className="bg-japaCard border border-japaCardLight p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between print:hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  <div>
                    <span className="text-xs font-bold text-white block">Selecione o Sócio</span>
                    <select value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)}
                      className="mt-1 bg-japaBg border border-japaCardLight text-white px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-japaGold min-w-[160px] cursor-pointer">
                      {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  
                  {/* Local Partner Date Filter */}
                  <div className="sm:border-l sm:border-japaCardLight sm:pl-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="text-xs font-bold text-white block">Filtro de Período do Sócio</span>
                    <div className="flex bg-japaBg rounded-lg p-0.5 border border-japaCardLight mt-1 w-max">
                      <button
                        onClick={() => setPartnerDateFilterActive(false)}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${!partnerDateFilterActive ? 'bg-japaRed text-white shadow-md' : 'text-japaTextMuted hover:text-white'}`}
                      >
                        Acumulado
                      </button>
                      <button
                        onClick={() => setPartnerDateFilterActive(true)}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${partnerDateFilterActive ? 'bg-japaRed text-white shadow-md' : 'text-japaTextMuted hover:text-white'}`}
                      >
                        Diário
                      </button>
                    </div>
                  </div>

                  {partnerDateFilterActive && (
                    <div className="animate-fade-in sm:border-l sm:border-japaCardLight sm:pl-4 mt-2 sm:mt-0">
                      <span className="text-[10px] text-japaTextMuted uppercase font-bold block mb-1">Filtrar Data</span>
                      <input
                        type="date"
                        value={partnerFilterDate}
                        onChange={e => setPartnerFilterDate(e.target.value)}
                        className="bg-japaBg border border-japaCardLight text-white px-3 py-1 rounded-lg text-xs font-mono focus:outline-none focus:border-japaGold cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-japaTextMuted max-w-xs text-right hidden md:block">
                  Acompanhe em tempo real o histórico e os gastos do sócio. Clique em uma despesa para detalhar os itens.
                </p>
              </div>

              {(() => {
                const partner = partners.find(p => p.id === selectedPartnerId);
                if (!partner) return null;

                // Filtragem do faturamento do dia correspondente ao filtro local para recalcular o lucro do sócio
                const localRevenue = (() => {
                  let list = orders.filter(o => o.status === 'Finalizado');
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(o => o.date === partnerFilterDate);
                  }
                  return list.reduce((s, o) => s + o.total, 0);
                })();

                const localExpenses = (() => {
                  let list = expenses;
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(e => e.date === partnerFilterDate);
                  }
                  return list.reduce((s, e) => s + (e.total || 0), 0);
                })();

                const localWithdrawals = (() => {
                  let list = withdrawals;
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(w => w.date === partnerFilterDate);
                  }
                  return list.reduce((s, w) => s + (w.value || 0), 0);
                })();

                const localNetProfit = localRevenue - localExpenses - localWithdrawals;

                // Filtragem dos gastos do sócio selecionado com base no filtro de datas
                const pExpenses = (() => {
                  let list = expenses.filter(e => e.partnerId === partner.id || e.responsible === partner.name);
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(e => e.date === partnerFilterDate);
                  }
                  return list;
                })();

                const pInvestments = (() => {
                  let list = investments.filter(i => i.partnerId === partner.id || i.responsible === partner.name);
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(i => i.date === partnerFilterDate);
                  }
                  return list;
                })();

                const pWithdrawals = (() => {
                  let list = withdrawals.filter(w => w.partnerId === partner.id || w.partnerName === partner.name);
                  if (partnerDateFilterActive && partnerFilterDate) {
                    list = list.filter(w => w.date === partnerFilterDate);
                  }
                  return list;
                })();
                
                const totalExp = pExpenses.reduce((s, e) => s + e.total, 0);
                const totalInv = pInvestments.reduce((s, i) => s + i.value, 0);
                const totalWd = pWithdrawals.reduce((s, w) => s + w.value, 0);
                
                const shareVal = localNetProfit * (partner.share / 100);
                const balanceVal = shareVal - totalWd;

                // Combine transactions chronologically
                const timeline = [
                  ...pExpenses.map(e => ({ ...e, _type: 'Despesa', _color: 'text-japaRed', _val: -e.total, label: e.supplier, desc: e.category })),
                  ...pInvestments.map(i => ({ ...i, _type: 'Investimento', _color: 'text-japaGold', _val: -i.value, label: i.description, desc: i.category })),
                  ...pWithdrawals.map(w => ({ ...w, _type: 'Retirada', _color: 'text-blue-400', _val: -w.value, label: 'Retirada Pró-Labore', desc: w.reason })),
                ].sort((a, b) => new Date(b.date) - new Date(a.date));

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Stats Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                        <div className="bg-japaCard border border-japaCardLight p-3 rounded-lg">
                          <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Compras Feitas</span>
                          <span className="text-sm font-extrabold text-japaRed block mt-1">{fmt(totalExp)}</span>
                        </div>
                        <div className="bg-japaCard border border-japaCardLight p-3 rounded-lg">
                          <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Investimentos</span>
                          <span className="text-sm font-extrabold text-japaGold block mt-1">{fmt(totalInv)}</span>
                        </div>
                        <div className="bg-japaCard border border-japaCardLight p-3 rounded-lg">
                          <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Retiradas Realizadas</span>
                          <span className="text-sm font-extrabold text-blue-400 block mt-1">{fmt(totalWd)}</span>
                        </div>
                        <div className="bg-japaCard border border-japaCardLight p-3 rounded-lg">
                          <span className="text-[8px] text-japaTextMuted block font-bold uppercase">Saldo de Cota</span>
                          <span className={`text-sm font-extrabold block mt-1 ${balanceVal >= 0 ? 'text-green-400' : 'text-japaRed'}`}>{fmt(balanceVal)}</span>
                        </div>
                      </div>

                      {/* Complete Partner History */}
                      <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Histórico de Atividades de {partner.name}</h3>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                          {timeline.length === 0 ? (
                            <div className="text-center py-12 text-xs text-japaTextMuted">Nenhuma movimentação encontrada neste período.</div>
                          ) : (
                            timeline.map((item, idx) => (
                              <div key={idx} className="bg-japaBg/60 border border-japaCardLight rounded-lg overflow-hidden transition-all">
                                {/* Header da movimentação */}
                                <div 
                                  onClick={() => {
                                    if (item._type === 'Despesa') {
                                      setExpandedPartnerExp(expandedPartnerExp === item.id ? null : item.id);
                                    }
                                  }}
                                  className={`flex justify-between items-center p-3 text-xs font-mono transition-colors ${item._type === 'Despesa' ? 'cursor-pointer hover:bg-japaCardLight/20' : ''}`}
                                >
                                  <div>
                                    <span className="font-bold text-white block">{item.label}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] text-japaTextMuted">{item.date} {item.time && `· ${item.time}`}</span>
                                      <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${item._color} bg-current/10`}>{item._type}</span>
                                      {item._type === 'Despesa' && (
                                        <span className="text-[9px] text-japaTextMuted bg-japaCardLight px-1.5 py-0.5 rounded">{item.desc}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-right">
                                    <div>
                                      <span className={`font-bold font-mono block ${item._color}`}>{fmt(Math.abs(item._val))}</span>
                                      {item._type !== 'Despesa' && (
                                        <span className="text-[9px] text-japaTextMuted uppercase font-bold">{item.desc}</span>
                                      )}
                                    </div>
                                    {item._type === 'Despesa' && (
                                      expandedPartnerExp === item.id ? <ChevronUp size={14} className="text-japaTextMuted" /> : <ChevronDown size={14} className="text-japaTextMuted" />
                                    )}
                                  </div>
                                </div>
                                
                                {/* Visualização expandida das compras/itens da despesa */}
                                {item._type === 'Despesa' && expandedPartnerExp === item.id && (
                                  <div className="border-t border-japaCardLight/50 bg-japaBg/80 p-3.5 space-y-3.5 animate-fade-in">
                                    {item.notes && <p className="text-[10px] text-japaTextMuted italic">"{item.notes}"</p>}
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-[11px] text-left">
                                        <thead>
                                          <tr className="text-[9px] text-japaTextMuted uppercase border-b border-japaCardLight/50 pb-1">
                                            <th className="pb-1 font-bold">Produto</th>
                                            <th className="pb-1 text-right font-bold">Qtd</th>
                                            <th className="pb-1 text-right font-bold">Unid</th>
                                            <th className="pb-1 text-right font-bold">V.Unit</th>
                                            <th className="pb-1 text-right font-bold">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {item.items?.map((pItem, i) => (
                                            <tr key={i} className="border-b border-japaCardLight/20">
                                              <td className="py-1 text-white">{pItem.product}</td>
                                              <td className="py-1 text-right text-japaTextMuted">{pItem.qty}</td>
                                              <td className="py-1 text-right text-japaTextMuted">{pItem.unit}</td>
                                              <td className="py-1 text-right text-japaTextMuted font-mono">{fmt(pItem.unitPrice)}</td>
                                              <td className="py-1 text-right text-japaGold font-bold font-mono">{fmt(pItem.total)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] text-japaTextMuted">
                                      <div className="flex gap-2">
                                        <span>Forma Pgto: <strong className="text-white">{item.paymentMethod}</strong></span>
                                      </div>
                                      {item.attachment && (
                                        <span className="flex items-center gap-1 bg-japaGold/10 text-japaGold px-1.5 py-0.5 rounded border border-japaGold/20 font-mono">
                                          <ReceiptText size={10} /> {item.attachment}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Partner Overview & Profit Share */}
                    <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold">Resumo Financeiro</h3>
                      <div className="p-4 bg-japaBg/60 border border-japaCardLight rounded-lg space-y-3 font-mono">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-extrabold text-sm text-white"
                            style={{ borderColor: partner.color, backgroundColor: `${partner.color}20` }}>
                            {partner.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block font-sans">{partner.name}</span>
                            <span className="text-[9px] text-japaTextMuted block font-sans">Participação: {partner.share}%</span>
                          </div>
                        </div>

                        <div className="border-t border-japaCardLight/50 pt-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-japaTextMuted font-sans">Participação no Lucro:</span>
                            <span className="font-bold text-white">{fmt(shareVal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-japaTextMuted font-sans">Total de Retiradas:</span>
                            <span className="font-bold text-blue-400">{fmt(totalWd)}</span>
                          </div>
                          <div className="flex justify-between border-t border-japaCardLight/30 pt-2 font-bold">
                            <span className="text-japaTextMuted font-sans">Saldo Atual:</span>
                            <span className={balanceVal >= 0 ? 'text-green-400' : 'text-japaRed'}>{fmt(balanceVal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showExpMod && <ExpenseModal onClose={() => setShowExpMod(false)} partners={partners} currentUser={currentUser} onSave={addExpense} />}
      {showInvMod && <InvestmentModal onClose={() => setShowInvMod(false)} partners={partners} currentUser={currentUser} onSave={addInvestment} />}
      {showWdMod  && <WithdrawalModal onClose={() => setShowWdMod(false)} partners={partners} currentUser={currentUser} onSave={addWithdrawal} />}
    </div>
  );
};
