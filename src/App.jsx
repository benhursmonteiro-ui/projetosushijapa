import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Import all 15 views
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Pedidos } from './views/Pedidos';
import { Comandas } from './views/Comandas';
import { FechamentoCaixa } from './views/FechamentoCaixa';
import { Delivery } from './views/Delivery';
import { Estoque } from './views/Estoque';
import { Cardapio } from './views/Cardapio';
import { Funcionarios } from './views/Funcionarios';
import { Relatorios } from './views/Relatorios';
import { Cozinha } from './views/Cozinha';
import { QrCodeMenu } from './views/QrCodeMenu';
import { Metas } from './views/Metas';
import { Configuracoes } from './views/Configuracoes';
import { Financeiro } from './views/Financeiro';

function MainApp() {
  const { currentUser } = useContext(AppContext);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If no user is logged in, force Login screen
  if (!currentUser) {
    return <Login setCurrentView={setCurrentView} />;
  }

  // View Router mapping
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pedidos':
        return <Pedidos />;
      case 'comandas':
        return <Comandas />;
      case 'caixa':
        return <FechamentoCaixa />;
      case 'delivery':
        return <Delivery />;
      case 'estoque':
        return <Estoque />;
      case 'cardapio':
        return <Cardapio />;
      case 'funcionarios':
        return <Funcionarios />;
      case 'relatorios':
        return <Relatorios />;
      case 'cozinha':
        return <Cozinha />;

      case 'qrcode':
        return <QrCodeMenu />;
      case 'metas':
        return <Metas />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'financeiro':
        return <Financeiro />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-japaBg font-sans antialiased text-japaText">
      {/* Sidebar Navigation (Left) */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Layout Area (Right) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        {/* Header Top Bar */}
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* View Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-japaBg">
          <div className="mx-auto w-full max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
