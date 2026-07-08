import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  DollarSign, 
  AlertCircle,
  FileCheck,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const FechamentoCaixa = () => {
  const { 
    cashier, 
    orders, 
    closeCashier,
    openCashier,
    currentUser
  } = useContext(AppContext);

  // Input states for physical count
  const [actualCash, setActualCash] = useState('');
  const [actualPix, setActualPix] = useState('');
  const [actualDebit, setActualDebit] = useState('');
  const [actualCredit, setActualCredit] = useState('');
  const [actualIfood, setActualIfood] = useState('');
  const [openBalanceInput, setOpenBalanceInput] = useState('500');

  // Calculate live expected totals
  const today = new Date().toISOString().split('T')[0];
  const todayCompletedOrders = orders.filter(o => (o.date === today || o.date === '2026-06-01') && o.status === 'Finalizado');

  const salesBreakdown = { dinheiro: 0, pix: 0, debit: 0, credit: 0, ifood: 0, total: 0 };
  todayCompletedOrders.forEach(o => {
    const pay = o.paymentMethod.toLowerCase();
    if (pay === 'dinheiro') salesBreakdown.dinheiro += o.total;
    else if (pay === 'pix') salesBreakdown.pix += o.total;
    else if (pay === 'débito' || pay === 'debito') salesBreakdown.debit += o.total;
    else if (pay === 'crédito' || pay === 'credito') salesBreakdown.credit += o.total;
    else if (pay === 'ifood') salesBreakdown.ifood += o.total;
    salesBreakdown.total += o.total;
  });

  const suprimentosTotal = cashier.transactions
    .filter(t => t.type === 'suprimento')
    .reduce((sum, t) => sum + t.amount, 0);

  const sangriasTotal = cashier.transactions
    .filter(t => t.type === 'sangria')
    .reduce((sum, t) => sum + t.amount, 0);

  // Expected cash physical on drawer = starting cash + cash sales + suprimentos - sangrias
  const expectedCashInDrawer = cashier.initialBalance + salesBreakdown.dinheiro + suprimentosTotal - sangriasTotal;

  // Expected totals per method
  const expectedTotals = {
    dinheiro: expectedCashInDrawer,
    pix: salesBreakdown.pix,
    debit: salesBreakdown.debit,
    credit: salesBreakdown.credit,
    ifood: salesBreakdown.ifood,
    total: expectedCashInDrawer + salesBreakdown.pix + salesBreakdown.debit + salesBreakdown.credit + salesBreakdown.ifood
  };

  // Compare actual vs expected
  const actualTotals = {
    dinheiro: Number(actualCash) || 0,
    pix: Number(actualPix) || 0,
    debit: Number(actualDebit) || 0,
    credit: Number(actualCredit) || 0,
    ifood: Number(actualIfood) || 0,
    get total() { return this.dinheiro + this.pix + this.debit + this.credit + this.ifood; }
  };

  const differences = {
    dinheiro: actualTotals.dinheiro - expectedTotals.dinheiro,
    pix: actualTotals.pix - expectedTotals.pix,
    debit: actualTotals.debit - expectedTotals.debit,
    credit: actualTotals.credit - expectedTotals.credit,
    ifood: actualTotals.ifood - expectedTotals.ifood,
    get total() { return this.dinheiro + this.pix + this.debit + this.credit + this.ifood; }
  };

  const handleCloseCashier = (e) => {
    e.preventDefault();
    if (!cashier.isOpen) return;

    const proceed = window.confirm('Deseja realmente fechar o caixa de hoje? Esta ação arquivará a sessão de vendas atual.');
    if (!proceed) return;

    closeCashier(
      actualTotals.dinheiro,
      actualTotals.pix,
      actualTotals.debit,
      actualTotals.credit,
      actualTotals.ifood
    );

    // Clear inputs
    setActualCash('');
    setActualPix('');
    setActualDebit('');
    setActualCredit('');
    setActualIfood('');
  };

  const handleOpenCashier = (e) => {
    e.preventDefault();
    openCashier(Number(openBalanceInput), currentUser.name);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-wider text-white">FECHAMENTO DE CAIXA DIÁRIO</h2>
        <p className="text-xs text-japaTextMuted">Confronte os valores físicos coletados com o faturamento do sistema.</p>
      </div>

      {cashier.isOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Side: Summary of System Balances */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5 border-b border-japaCardLight pb-2">
              <FileCheck size={14} className="text-japaGold" />
              Sintético do Caixa (Valores Esperados)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-japaBg/60 p-3 rounded-lg border border-japaCardLight">
                <span className="text-[9px] text-japaTextMuted block uppercase font-bold">Fundo de Abertura</span>
                <span className="text-sm font-bold text-white font-mono">R$ {cashier.initialBalance.toFixed(2)}</span>
                <span className="text-[8px] text-japaTextMuted block mt-1">Aberto por {cashier.openedBy}</span>
              </div>
              <div className="bg-japaBg/60 p-3 rounded-lg border border-japaCardLight">
                <span className="text-[9px] text-japaTextMuted block uppercase font-bold">Total Vendas Hoje</span>
                <span className="text-sm font-bold text-white font-mono">R$ {salesBreakdown.total.toFixed(2)}</span>
                <span className="text-[8px] text-japaTextMuted block mt-1">{todayCompletedOrders.length} Pedidos Finalizados</span>
              </div>
            </div>

            {/* Suprimentos and Sangrias detailed */}
            <div className="bg-japaBg/40 border border-japaCardLight p-3.5 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-japaGold uppercase border-b border-japaCardLight/50 pb-1.5">
                <span>Movimentações Extra</span>
                <span>Lançamentos: {cashier.transactions.length}</span>
              </div>

              {cashier.transactions.length > 0 ? (
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {cashier.transactions.map((tx, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1 text-japaTextMuted">
                        {tx.type === 'suprimento' 
                          ? <ArrowUpRight size={12} className="text-green-400" />
                          : <ArrowDownLeft size={12} className="text-japaRed" />
                        }
                        <strong className="text-[10px] font-mono">{tx.time}</strong> - {tx.reason}
                      </span>
                      <span className={`font-bold font-mono ${tx.type === 'suprimento' ? 'text-green-400' : 'text-japaRed'}`}>
                        {tx.type === 'suprimento' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-center text-japaTextMuted py-2">
                  Nenhuma sangria ou suprimento lançado nesta sessão.
                </div>
              )}
            </div>

            {/* expected breakdown list */}
            <div className="space-y-2">
              <span className="text-[10px] text-japaTextMuted uppercase font-bold tracking-wider">Detalhamento por Forma de Recebimento</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                {[
                  { label: 'Dinheiro (Gaveta)', val: expectedTotals.dinheiro },
                  { label: 'Pix', val: expectedTotals.pix },
                  { label: 'Cartão Débito', val: expectedTotals.debit },
                  { label: 'Cartão Crédito', val: expectedTotals.credit },
                  { label: 'iFood Online', val: expectedTotals.ifood }
                ].map((item, i) => (
                  <div key={i} className="bg-japaBg/60 border border-japaCardLight p-2 rounded-lg">
                    <span className="text-[8px] text-japaTextMuted block font-bold leading-tight">{item.label}</span>
                    <span className="text-xs font-bold text-white font-mono block mt-1">R$ {item.val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-japaBg/90 border border-japaCardLight p-3.5 rounded-lg font-mono">
              <span className="text-xs font-bold text-japaGold uppercase">Total Esperado em Caixa:</span>
              <span className="text-md font-extrabold text-japaGold">R$ {expectedTotals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Right Side: Physical Count input & Closure Action */}
          <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5 border-b border-japaCardLight pb-2">
              <Coins size={14} className="text-green-400" />
              Conferência Física (Contagem)
            </h3>

            <form onSubmit={handleCloseCashier} className="space-y-3.5">
              {[
                { label: 'Dinheiro (Físico em Gaveta)', val: actualCash, setVal: setActualCash, diff: differences.dinheiro },
                { label: 'Comprovantes Pix', val: actualPix, setVal: setActualPix, diff: differences.pix },
                { label: 'Lançamentos Débito', val: actualDebit, setVal: setActualDebit, diff: differences.debit },
                { label: 'Lançamentos Crédito', val: actualCredit, setVal: setActualCredit, diff: differences.credit },
                { label: 'Lançamentos iFood', val: actualIfood, setVal: setActualIfood, diff: differences.ifood }
              ].map((field, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-japaTextMuted uppercase font-bold">{field.label}</label>
                    {field.val && (
                      <span className={`text-[9.5px] font-bold font-mono ${
                        field.diff === 0 ? 'text-green-400' : field.diff > 0 ? 'text-blue-400' : 'text-japaRed'
                      }`}>
                        Diferença: {field.diff >= 0 ? '+' : ''} R$ {field.diff.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={13} className="text-japaTextMuted" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={field.val}
                      onChange={(e) => field.setVal(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                    />
                  </div>
                </div>
              ))}

              {/* General Summary of counts */}
              <div className="bg-japaBg/60 p-3 rounded-lg border border-japaCardLight space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-japaTextMuted">Total Declarado:</span>
                  <span className="text-white">R$ {actualTotals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-japaTextMuted">Total Esperado:</span>
                  <span className="text-white">R$ {expectedTotals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-japaCardLight/30 pt-1 mt-1">
                  <span className="text-japaTextMuted">Diferença Geral:</span>
                  <span className={differences.total === 0 ? 'text-green-400' : differences.total > 0 ? 'text-blue-400' : 'text-japaRed'}>
                    {differences.total >= 0 ? '+' : ''} R$ {differences.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Alert Warning if negative difference */}
              {differences.total < 0 && (
                <div className="bg-japaRed/10 border border-japaRed/20 text-japaRed p-2.5 rounded-lg text-[10px] flex items-start gap-2 leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Atenção: O valor declarado é menor do que o saldo do sistema. O fechamento registrará uma <strong>quebra de caixa de R$ {Math.abs(differences.total).toFixed(2)}</strong>.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-japaRed hover:bg-japaRedDark text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all glow-red shadow-lg shadow-japaRed/20 flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={14} />
                Fechar Caixa (Finalizar Turno)
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* CASHIER IS CLOSED - SHOW OPEN ACTION */
        <div className="bg-japaCard border border-japaCardLight rounded-xl p-8 max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-japaRed/10 rounded-full flex items-center justify-center mx-auto text-japaRed">
            <XCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white uppercase tracking-wider">O Caixa está Fechado</h3>
            <p className="text-xs text-japaTextMuted">
              Para registrar pedidos, mesas e comandas, inicie uma nova sessão abrindo o caixa diário.
            </p>
          </div>

          <form onSubmit={handleOpenCashier} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold block">Fundo de Troco Inicial (R$)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={14} className="text-japaTextMuted" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={openBalanceInput}
                  onChange={(e) => setOpenBalanceInput(e.target.value)}
                  placeholder="500,00"
                  className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} />
              Abrir Caixa Diário
            </button>
          </form>
        </div>
      )}

      {/* Cashier History List */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl p-5 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
          <History size={14} className="text-japaGold" />
          Histórico de Fechamentos Recentes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-japaBg/60 border-b border-japaCardLight text-[10px] font-bold text-japaTextMuted uppercase tracking-wider">
                <th className="p-3">Data / Hora Fechamento</th>
                <th className="p-3">Operador Abertura</th>
                <th className="p-3">Conferido Por</th>
                <th className="p-3">Troco Inicial</th>
                <th className="p-3">Total Vendas</th>
                <th className="p-3">Saldo Esperado</th>
                <th className="p-3">Saldo Físico</th>
                <th className="p-3">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-japaCardLight/30">
              {cashier.history.map((hist, idx) => (
                <tr key={idx} className="hover:bg-japaCardLight/5">
                  <td className="p-3 text-white font-mono font-medium">{hist.closedAt}</td>
                  <td className="p-3 flex items-center gap-1.5"><User size={12} className="text-japaGold" /> {hist.openedBy}</td>
                  <td className="p-3">{hist.closedBy}</td>
                  <td className="p-3 font-mono">R$ {hist.initialBalance.toFixed(2)}</td>
                  <td className="p-3 font-mono text-white">R$ {hist.salesTotal.toFixed(2)}</td>
                  <td className="p-3 font-mono">R$ {hist.expectedBalance.toFixed(2)}</td>
                  <td className="p-3 font-mono text-white font-bold">R$ {hist.actualBalance.toFixed(2)}</td>
                  <td className={`p-3 font-mono font-bold ${
                    hist.difference === 0 ? 'text-green-400' : hist.difference > 0 ? 'text-blue-400' : 'text-japaRed'
                  }`}>
                    {hist.difference >= 0 ? '+' : ''} R$ {hist.difference.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
