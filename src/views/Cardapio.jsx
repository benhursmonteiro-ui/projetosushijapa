import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Settings,
  Utensils
} from 'lucide-react';

export const Cardapio = () => {
  const { menu, inventory, updateMenuItem, addMenuItem } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Add Item State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Combos');
  const [newRecipe, setNewRecipe] = useState([]); // [{ ingredientId, amount }]
  const [selectedIngId, setSelectedIngId] = useState('');
  const [selectedIngQty, setSelectedIngQty] = useState('');

  const categories = ['Todos', 'Combos', 'Hot Rolls', 'Temakis', 'Uramakis', 'Pratos Quentes', 'Bebidas'];

  const filteredMenu = menu.filter(item => {
    if (activeCategory !== 'Todos' && item.category !== activeCategory) return false;
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleToggleActive = (id, currentStatus) => {
    updateMenuItem(id, { isActive: !currentStatus });
  };

  const handlePriceChange = (id, newPriceVal) => {
    if (!newPriceVal || Number(newPriceVal) <= 0) return;
    updateMenuItem(id, { price: Number(newPriceVal) });
  };

  const handleAddRecipeItem = () => {
    if (!selectedIngId || !selectedIngQty) return;
    const ing = inventory.find(i => i.id === selectedIngId);
    if (!ing) return;

    setNewRecipe(prev => {
      const existingIdx = prev.findIndex(r => r.ingredientId === selectedIngId);
      if (existingIdx > -1) {
        return prev.map((r, idx) => idx === existingIdx ? { ...r, amount: Number(selectedIngQty) } : r);
      }
      return [...prev, { ingredientId: selectedIngId, name: ing.name, amount: Number(selectedIngQty), unit: ing.unit }];
    });

    setSelectedIngId('');
    setSelectedIngQty('');
  };

  const handleRemoveRecipeItem = (ingId) => {
    setNewRecipe(prev => prev.filter(r => r.ingredientId !== ingId));
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    addMenuItem({
      name: newName,
      price: Number(newPrice),
      description: newDesc,
      category: newCategory,
      recipe: newRecipe.map(({ ingredientId, amount }) => ({ ingredientId, amount }))
    });

    // Reset Form
    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setNewRecipe([]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">GESTÃO DO CARDÁPIO DIGITAL</h2>
          <p className="text-xs text-japaTextMuted">Cadastre pratos, ajuste preços de venda e defina receitas de baixa automática.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-japaRed hover:bg-japaRedDark text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all glow-red"
        >
          <Plus size={14} />
          Cadastrar Produto
        </button>
      </div>

      {/* Categories & Search */}
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

        {/* Search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-japaTextMuted" />
          </div>
          <input
            type="text"
            placeholder="Buscar prato ou bebida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
          />
        </div>
      </div>

      {/* Menu List Table */}
      <div className="bg-japaCard border border-japaCardLight rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-japaBg/60 border-b border-japaCardLight text-[10px] font-bold text-japaGold uppercase tracking-wider">
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Preço (R$)</th>
                <th className="p-4">Receita (Estoque)</th>
                <th className="p-4">Status Canal</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-japaCardLight/30">
              {filteredMenu.length > 0 ? (
                filteredMenu.map(prod => (
                  <tr key={prod.id} className={`hover:bg-japaCardLight/5 transition-colors ${!prod.isActive ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">{prod.name}</span>
                        <span className="text-[10px] text-japaTextMuted max-w-sm truncate">{prod.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-japaBg border border-japaCardLight px-2 py-0.5 rounded text-[10px] text-white">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-white max-w-[100px]">
                        R$ 
                        <input
                          type="number"
                          step="0.10"
                          defaultValue={prod.price.toFixed(2)}
                          onBlur={(e) => handlePriceChange(prod.id, e.target.value)}
                          className="bg-japaBg/50 border border-japaCardLight text-white px-1.5 py-0.5 rounded text-xs w-16 focus:outline-none focus:border-japaGold font-mono text-right"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {prod.recipe && prod.recipe.length > 0 ? (
                          prod.recipe.map((step, idx) => {
                            const ing = inventory.find(i => i.id === step.ingredientId);
                            return (
                              <span key={idx} className="text-[9px] bg-japaCardLight/60 text-japaTextMuted px-1.5 py-0.5 rounded border border-japaCardLight/30">
                                {ing?.name || 'Insumo'}: {step.amount} {ing?.unit}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[9px] text-japaTextMuted italic">Sem receita vinculada</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(prod.id, prod.isActive)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                          prod.isActive 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : 'bg-japaRed/10 border-japaRed/20 text-japaRed'
                        }`}
                      >
                        {prod.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {prod.isActive ? 'Visível' : 'Pausado'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] text-japaTextMuted">Editar receita nas configs</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-japaTextMuted">
                    Nenhum produto cadastrado no cardápio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRAR PRODUTO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-japaCard border border-japaCardLight rounded-xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-japaCardLight pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-japaGold flex items-center gap-1.5">
                <Utensils size={16} /> Cadastrar Produto no Cardápio
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-japaTextMuted hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Nome do Prato/Bebida</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Niguiri Salmão (6pcs)..."
                    className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="39,90"
                    className="w-full bg-japaBg border border-japaCardLight text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-japaGold text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5 col-span-2">
                  <label className="text-[9px] text-japaTextMuted uppercase font-bold">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs bg-japaBg border border-japaCardLight text-white px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Combos">Combos</option>
                    <option value="Hot Rolls">Hot Rolls</option>
                    <option value="Temakis">Temakis</option>
                    <option value="Uramakis">Uramakis</option>
                    <option value="Pratos Quentes">Pratos Quentes</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] text-japaTextMuted uppercase font-bold">Descrição Curta</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descreva os ingredientes que compõem o prato..."
                  rows={2}
                  className="w-full bg-japaBg border border-japaCardLight text-white p-2 rounded-lg focus:outline-none focus:border-japaGold text-xs resize-none"
                />
              </div>

              {/* Recipe builder section */}
              <div className="border border-japaCardLight bg-japaBg/60 p-3 rounded-lg space-y-3">
                <span className="text-[9px] font-bold text-japaGold uppercase block border-b border-japaCardLight/50 pb-1.5">Receita de Baixa de Estoque</span>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[8px] text-japaTextMuted uppercase font-bold">Insumo</label>
                    <select
                      value={selectedIngId}
                      onChange={(e) => setSelectedIngId(e.target.value)}
                      className="w-full text-[10px] bg-japaCard border border-japaCardLight text-white px-1.5 py-1 rounded-md focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {inventory.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-20 space-y-0.5">
                    <label className="text-[8px] text-japaTextMuted uppercase font-bold">Qtd Baixa</label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedIngQty}
                      onChange={(e) => setSelectedIngQty(e.target.value)}
                      placeholder="0,1"
                      className="w-full bg-japaCard border border-japaCardLight text-white p-1 rounded-md focus:outline-none text-[10px] font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRecipeItem}
                    className="bg-japaGold hover:bg-japaGoldDark text-japaBg font-bold text-[10px] py-1.5 px-3 rounded uppercase shrink-0"
                  >
                    Vincular
                  </button>
                </div>

                {/* Added Recipe Items List */}
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {newRecipe.map((rec, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] bg-japaCard/70 p-1.5 rounded border border-japaCardLight/40">
                      <span className="text-white font-medium">{rec.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-japaGold">{rec.amount} {rec.unit}</span>
                        <button type="button" onClick={() => handleRemoveRecipeItem(rec.ingredientId)} className="text-japaRed hover:text-red-400">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-japaGold hover:bg-japaGoldDark text-japaBg py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                Confirmar Lançamento de Produto
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
