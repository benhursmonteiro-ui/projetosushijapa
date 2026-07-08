import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Shield, 
  Phone, 
  Check, 
  DollarSign, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';

export const Funcionarios = () => {
  const { employees, addEmployee, updateEmployee } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee fields
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Atendente'); // Caixa, Gerente, Cozinheiro, Atendente, Motoboy
  const [empPhone, setEmpPhone] = useState('');
  const [empStatus, setEmpStatus] = useState('Ativo');

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(search) || 
      emp.role.toLowerCase().includes(search) ||
      (emp.phone && emp.phone.includes(search))
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!empName || !empPhone) return;

    addEmployee({
      name: empName,
      role: empRole,
      phone: empPhone,
      status: empStatus
    });

    setEmpName('');
    setEmpPhone('');
    setShowAddModal(false);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Ativo' ? 'Férias' : currentStatus === 'Férias' ? 'Desativado' : 'Ativo';
    updateEmployee(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">GESTÃO DE COLABORADORES</h2>
          <p className="text-xs text-japaTextMuted">Cadastre funcionários, gerencie comissões acumuladas e escalas de trabalho.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-japaRed hover:bg-japaRedDark text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all glow-red"
        >
          <Plus size={14} />
          Cadastrar Funcionário
        </button>
      </div>

      {/* Roster Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-japaCard border border-japaCardLight p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-2 text-xs text-japaTextMuted">
          <Briefcase size={14} className="text-japaGold" />
          <span>Total cadastrado: <strong>{employees.length} colaboradores</strong></span>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-japaTextMuted" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
          />
        </div>
      </div>

      {/* Employees List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length > 0 ? (
          filteredDeliveriesList(filteredEmployees, handleToggleStatus)
        ) : (
          <div className="col-span-full p-8 text-center text-xs text-japaTextMuted bg-japaCard border border-japaCardLight rounded-xl">
            Nenhum funcionário ou colaborador cadastrado.
          </div>
        )}
      </div>

      {/* MODAL: CADASTRAR COLABORADOR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <Users size={16} /> Cadastrar Funcionário
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-0.5">
                <label className="text-[9px] text-japaTextMuted uppercase font-bold">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Ex: João da Silva Santos..."
                  className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Cargo / Função</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Caixa">Operador Caixa</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Cozinheiro">Cozinheiro</option>
                    <option value="Atendente">Atendente (Garçom)</option>
                    <option value="Motoboy">Motoboy</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Status Inicial</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                    className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Férias">Férias</option>
                    <option value="Desativado">Desativado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] text-japaTextMuted uppercase font-bold">Telefone Contato</label>
                <input
                  type="text"
                  required
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-japaGold hover:bg-japaGoldDark text-japaBg py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Confirmar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for list cards rendering
const filteredDeliveriesList = (list, handleToggle) => {
  return list.map(emp => (
    <div key={emp.id} className="bg-japaCard border border-japaCardLight rounded-xl p-4.5 space-y-4 shadow-md">
      <div className="flex justify-between items-start border-b border-japaCardLight/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-japaBg border border-japaCardLight flex items-center justify-center text-japaGold">
            <Shield size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-xs leading-tight">{emp.name}</span>
            <span className="text-[10px] text-japaTextMuted">{emp.role}</span>
          </div>
        </div>
        
        <button
          onClick={() => handleToggle(emp.id, emp.status)}
          className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border ${
            emp.status === 'Ativo' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            emp.status === 'Férias' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
            'bg-japaRed/10 border-japaRed/20 text-japaRed'
          }`}
        >
          {emp.status}
        </button>
      </div>

      <div className="space-y-1.5 text-xs text-japaTextMuted font-mono">
        <div className="flex items-center gap-2">
          <Phone size={12} className="text-japaGold shrink-0" />
          <span>{emp.phone}</span>
        </div>
        {emp.role === 'Motoboy' && (
          <div className="bg-japaBg/60 p-2 rounded border border-japaCardLight flex justify-between items-center text-[10px] pt-2 mt-1">
            <span>Comissões Corridas:</span>
            <span className="text-green-400 font-bold">R$ {emp.commission.toFixed(2)}</span>
          </div>
        )}
        {emp.role === 'Atendente' && (
          <div className="bg-japaBg/60 p-2 rounded border border-japaCardLight flex justify-between items-center text-[10px] pt-2 mt-1">
            <span>Comissão de Garçom (5%):</span>
            <span className="text-green-400 font-bold">R$ {emp.commission.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  ));
};
