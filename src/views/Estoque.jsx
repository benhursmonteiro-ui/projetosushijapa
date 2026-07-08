import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Search, 
  X, 
  Scale, 
  FolderPlus,
  RefreshCw
} from 'lucide-react';

export const Estoque = () => {
  const { inventory, updateInventoryItem, addInventoryItem } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Add Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMin, setNewItemMin] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCategory, setNewItemCategory] = useState('Peixes');

  // Edit Item State
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editQtyValue, setEditQtyValue] = useState('');

  const categories = ['Todos', 'Peixes', 'Grãos', 'Laticínios', 'Massas', 'Carnes', 'Vegetais', 'Bebidas', 'Outros'];

  // Filters
  const filteredInventory = inventory.filter(item => {
    // Category filter
    if (activeCategory !== 'Todos' && item.category !== activeCategory) return false;

    // Search filter
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return true;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemMin) return;

    addInventoryItem({
      name: newItemName,
      qty: Number(newItemQty),
      min: Number(newItemMin),
      unit: newItemUnit,
      category: newItemCategory
    });

    setNewItemName('');
    setNewItemQty('');
    setNewItemMin('');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItemId || editQtyValue === '') return;
    updateInventoryItem(selectedItemId, Number(editQtyValue));
    setShowEditModal(false);
  };

  const handleOpenEdit = (item) => {
    setSelectedItemId(item.id);
    setEditQtyValue(item.qty);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">CONTROLE DE INVENTÁRIO & ESTOQUE</h2>
          <p className="text-xs text-japaTextMuted">Monitore insumos, cadastre ingredientes e ajuste quantidades.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-japaRed hover:bg-japaRedDark text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all glow-red"
        >
          <Plus size={14} />
          Cadastrar Insumo
        </button>
      </div>

      {/* Categories Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-japaCard border border-japaCardLight p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-japaGold text-japaBg' 
                  : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-japaTextMuted" />
          </div>
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
          />
        </div>
      </div>

      {/* Inventory Table List */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-japaBg/60 border-b border-japaCardLight text-[10px] font-bold text-japaGold uppercase tracking-wider">
                <th className="p-4">Insumo</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Quantidade Atual</th>
                <th className="p-4">Estoque Mínimo</th>
                <th className="p-4">Status Alerta</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-japaCardLight/30">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => {
                  const isLowStock = item.qty <= item.min;
                  return (
                    <tr key={item.id} className="hover:bg-japaCardLight/5 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Package size={14} className="text-japaGold" />
                        {item.name}
                      </td>
                      <td className="p-4">
                        <span className="bg-japaBg border border-japaCardLight px-2 py-0.5 rounded text-[10px] text-white">
                          {item.category}
                        </span>
                      </td>
                      <td className={`p-4 font-mono font-bold ${isLowStock ? 'text-japaRed' : 'text-white'}`}>
                        {item.qty} {item.unit}
                      </td>
                      <td className="p-4 font-mono text-japaTextMuted">
                        {item.min} {item.unit}
                      </td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="text-[10px] bg-japaRed/10 text-japaRed border border-japaRed/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-soft-pulse flex items-center gap-1 w-fit">
                            <AlertTriangle size={10} /> Estoque Baixo
                          </span>
                        ) : (
                          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider w-fit">
                            Seguro
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="bg-japaBg hover:bg-japaCardLight border border-japaCardLight hover:border-japaGold/40 text-white p-1 rounded font-bold text-[10px] px-2 flex items-center gap-1 transition-all mx-auto"
                        >
                          <Edit2 size={10} /> Ajustar Estoque
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-japaTextMuted">
                    Nenhum ingrediente ou insumo localizado no banco.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRAR INSUMO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <FolderPlus size={16} /> Cadastrar Novo Insumo
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="space-y-0.5">
                <label className="text-[9px] text-japaTextMuted uppercase font-bold">Nome do Insumo</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Cream Cheese, Salmão Fresh..."
                  className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Unidade Medida</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="L">Litro (L)</option>
                    <option value="g">Grama (g)</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Categoria</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Peixes">Peixes</option>
                    <option value="Grãos">Grãos</option>
                    <option value="Laticínios">Laticínios</option>
                    <option value="Massas">Massas</option>
                    <option value="Carnes">Carnes</option>
                    <option value="Vegetais">Vegetais</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Qtd em Estoque</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none text-xs font-mono"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Estoque Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none text-xs font-mono"
                  />
                </div>
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

      {/* MODAL: AJUSTAR QUANTIDADE ESTOQUE */}
      {showEditModal && selectedItemId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <RefreshCw size={16} /> Lançar Inventário Físico
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold block">
                  Nova Quantidade Fiel em Estoque ({inventory.find(i => i.id === selectedItemId)?.unit}):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale size={14} className="text-japaTextMuted" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editQtyValue}
                    onChange={(e) => setEditQtyValue(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Atualizar Saldo
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
