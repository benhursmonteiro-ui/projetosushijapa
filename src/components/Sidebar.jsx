import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Layers, 
  Coins, 
  Truck, 
  Package, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  ChefHat, 
  MessageSquare, 
  QrCode, 
  Target, 
  LogOut,
  User,
  DollarSign
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) => {
  const { currentUser, login, logout, cashier } = useContext(AppContext);

  if (!currentUser) return null;

  // List of all navigation items
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Sócio', 'Gerente', 'Caixa'] },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList, roles: ['Sócio', 'Gerente', 'Caixa'] },
    { id: 'comandas', label: 'Comandas', icon: Layers, roles: ['Sócio', 'Gerente', 'Caixa'] },
    { id: 'caixa', label: 'Fechamento Caixa', icon: Coins, roles: ['Sócio', 'Gerente', 'Caixa'] },
    { id: 'delivery', label: 'Delivery', icon: Truck, roles: ['Sócio', 'Gerente', 'Caixa', 'Entregador'] },
    { id: 'estoque', label: 'Estoque', icon: Package, roles: ['Sócio', 'Gerente'] },
    { id: 'cardapio', label: 'Cardápio', icon: BookOpen, roles: ['Sócio', 'Gerente'] },
    { id: 'funcionarios', label: 'Funcionários', icon: Users, roles: ['Sócio', 'Gerente'] },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, roles: ['Sócio', 'Gerente'] },
    { id: 'financeiro', label: 'Financeiro Geral', icon: DollarSign, roles: ['Sócio'] },
    { id: 'cozinha', label: 'Painel Cozinha', icon: ChefHat, roles: ['Sócio', 'Gerente', 'Cozinha'] },
    { id: 'qrcode', label: 'Cardápio Digital', icon: QrCode, roles: ['Sócio', 'Gerente', 'Caixa', 'Cliente'] },
    { id: 'metas', label: 'Metas & Indicadores', icon: Target, roles: ['Sócio', 'Gerente'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['Sócio'] }
  ];

  // Filter items by current user role
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  const handleRoleChange = (e) => {
    login(e.target.value);
    const newRole = e.target.value;
    if (newRole === 'Cozinha') {
      setCurrentView('cozinha');
    } else if (newRole === 'Entregador') {
      setCurrentView('delivery');
    } else if (newRole === 'Cliente') {
      setCurrentView('qrcode');
    } else {
      setCurrentView('dashboard');
    }
    setSidebarOpen(false);
  };

  const handleNavClick = (id) => {
    setCurrentView(id);
    setSidebarOpen(false); // Close sidebar on mobile after clicking
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-japaBg border-r border-japaCardLight flex flex-col justify-between h-screen shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo */}
          <div className="p-5 flex items-center gap-3 border-b border-japaCardLight">
            <div className="relative w-10 h-10 rounded-full bg-japaRed flex items-center justify-center glow-red overflow-hidden shrink-0">
              {/* Minimal SVG Logo of Sushi + Chopsticks */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 text-white fill-current">
                {/* Sun Circle */}
                <circle cx="50" cy="50" r="45" className="text-japaRed" />
                {/* Sushi Roll */}
                <circle cx="50" cy="50" r="18" fill="#121214" stroke="#FFF" strokeWidth="4" />
                <circle cx="50" cy="50" r="8" fill="#E50914" />
                {/* Chopsticks */}
                <line x1="15" y1="35" x2="85" y2="45" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
                <line x1="15" y1="50" x2="85" y2="40" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-white">
                JAPA <span className="text-japaRed">FOOD</span>
              </span>
              <span className="text-[10px] text-japaGold uppercase tracking-[0.2em] font-medium font-sans">
                Prime System
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-japaRedDark/50 to-japaRed/20 text-white border-l-4 border-japaRed pl-2 shadow-md shadow-japaRed/5' 
                      : 'text-japaTextMuted hover:text-white hover:bg-japaCardLight/40'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-japaRed' : 'text-japaTextMuted'} />
                  <span>{item.label}</span>
                  {item.id === 'cozinha' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-japaRed animate-soft-pulse glow-red" />
                  )}
                  {item.id === 'caixa' && cashier.isOpen && (
                    <span className="ml-auto text-[9px] font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                      Aberto
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="p-4 border-t border-japaCardLight space-y-3 bg-japaCard/30">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-japaGold uppercase block">
              Simulador de Acesso
            </label>
            <div className="relative">
              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                className="w-full text-xs bg-japaCard border border-japaCardLight text-japaText px-2 py-1.5 rounded-lg focus:outline-none focus:border-japaGold cursor-pointer"
              >
                <option value="Sócio">Sócio (Admin)</option>
                <option value="Gerente">Gerente</option>
                <option value="Caixa">Operador Caixa</option>
                <option value="Cozinha">Cozinha KDS</option>
                <option value="Entregador">Entregador</option>
                <option value="Cliente">Cliente (Mesa)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-japaCard/70 p-2.5 rounded-lg border border-japaCardLight">
            <div className="w-8 h-8 rounded-full bg-japaCardLight border border-japaGold/20 flex items-center justify-center shrink-0">
              <User size={16} className="text-japaGold" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
              <span className="text-[10px] text-japaTextMuted truncate">{currentUser.role}</span>
            </div>
            <button 
              onClick={logout} 
              title="Sair do sistema"
              className="text-japaTextMuted hover:text-japaRed p-1 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
