import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { KeyRound, User, QrCode, ShieldCheck, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';

export const Login = ({ setCurrentView }) => {
  const { loginWithCredentials, login } = useContext(AppContext);
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd,  setShowPwd]      = useState(false);
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState('');
  const [useQrCode, setUseQrCode]   = useState(false);
  const [qrScanning, setQrScanning] = useState(false);

  const roleRedirect = (role) => {
    if (role === 'Cozinha') return 'cozinha';
    if (role === 'Entregador') return 'delivery';
    if (role === 'Cliente') return 'qrcode';
    return 'dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Small delay to feel real
    await new Promise(r => setTimeout(r, 600));
    const result = loginWithCredentials(username.trim(), password);
    setLoading(false);
    if (result.success) {
      setCurrentView(roleRedirect(result.user.role));
    } else {
      setError(result.error);
    }
  };

  const handleQuickLogin = (role) => {
    login(role);
    setCurrentView(roleRedirect(role));
  };

  const handleSimulateQrScan = () => {
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      login('Sócio');
      setCurrentView('dashboard');
    }, 2200);
  };

  // Quick access cards config
  const quickRoles = [
    { role: 'Sócio',      label: 'Sócio / Admin', hint: 'admin / japa2026',       color: 'border-japaRed/40   text-japaRed'   },
    { role: 'Gerente',    label: 'Gerente',        hint: 'gerente / gerente123',    color: 'border-japaGold/40  text-japaGold'  },
    { role: 'Caixa',      label: 'Caixa',          hint: 'caixa / caixa123',        color: 'border-blue-400/40  text-blue-400'  },
    { role: 'Cozinha',    label: 'Cozinha KDS',    hint: 'cozinha / cozinha123',    color: 'border-green-400/40 text-green-400' },
    { role: 'Entregador', label: 'Entregador',     hint: 'entregador / moto123',    color: 'border-orange-400/40 text-orange-400'},
    { role: 'Cliente',    label: 'Cliente (Mesa)', hint: 'cliente / cliente123',    color: 'border-purple-400/40 text-purple-400'},
  ];

  return (
    <div className="min-h-screen bg-japaBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-japaRed/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-japaGold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-premium rounded-2xl p-8 relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-18 h-18 rounded-full bg-japaRed flex items-center justify-center glow-red mb-4 overflow-hidden animate-soft-pulse" style={{ width: 72, height: 72 }}>
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-white fill-current">
              <circle cx="50" cy="50" r="45" className="text-japaRed" />
              <circle cx="50" cy="50" r="18" fill="#121214" stroke="#FFF" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="#E50914" />
              <line x1="15" y1="35" x2="85" y2="45" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
              <line x1="15" y1="50" x2="85" y2="40" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-white">
            JAPA <span className="text-japaRed">FOOD</span> PRIME
          </h1>
          <p className="text-xs text-japaGold uppercase tracking-[0.25em] font-medium mt-1">
            Sistema de Gestão
          </p>
          <p className="text-xs text-japaTextMuted mt-3 max-w-[280px]">
            "Controle total do seu restaurante em um só lugar."
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 bg-japaRed/10 border border-japaRed/30 text-japaRed px-3 py-2.5 rounded-lg mb-4 text-xs animate-fade-in">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* QR Code Login */}
        {useQrCode ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="border border-japaCardLight bg-japaBg/70 p-6 rounded-xl flex flex-col items-center justify-center">
              {qrScanning ? (
                <div className="w-48 h-48 bg-japaCard border-2 border-japaGold/40 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-japaRed glow-red animate-bounce" style={{ animationDuration: '1.5s' }} />
                  <QrCode size={64} className="text-japaTextMuted animate-pulse" />
                  <span className="text-[10px] text-japaGold font-bold uppercase mt-3 tracking-widest">Escaneando...</span>
                </div>
              ) : (
                <div className="w-48 h-48 bg-japaCard border-2 border-japaCardLight rounded-lg flex flex-col items-center justify-center relative hover:border-japaGold/30 transition-colors group cursor-pointer" onClick={handleSimulateQrScan}>
                  <QrCode size={80} className="text-japaGold/60 group-hover:text-japaGold transition-colors" />
                  <span className="text-[10px] text-japaTextMuted mt-2 uppercase tracking-wider">Clique para simular</span>
                </div>
              )}
            </div>
            <p className="text-xs text-japaTextMuted px-4">
              Aponte seu crachá de funcionário com o QR Code para a câmera.
            </p>
            <button onClick={() => setUseQrCode(false)} className="text-xs text-japaGold hover:underline">
              Entrar usando Usuário &amp; Senha
            </button>
          </div>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-[10px] text-japaTextMuted uppercase font-bold tracking-wider">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={14} className="text-japaTextMuted" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Ex: admin, gerente, caixa..."
                  autoComplete="username"
                  className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-japaGold text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-japaTextMuted uppercase font-bold tracking-wider">Senha</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={14} className="text-japaTextMuted" />
                </div>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Sua senha..."
                  autoComplete="current-password"
                  className="w-full bg-japaBg border border-japaCardLight text-white pl-8 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-japaGold text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-japaTextMuted hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-japaRed hover:bg-japaRedDark text-white py-2.5 rounded-lg text-xs font-bold uppercase transition-all glow-red shadow-lg shadow-japaRed/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader size={14} className="animate-spin" /> Verificando...</> : 'Acessar Painel'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setUseQrCode(true)}
                className="text-xs text-japaGold hover:underline flex items-center gap-1.5 justify-center mx-auto"
              >
                <QrCode size={12} />
                Entrar com QR Code
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Access */}
        <div className="mt-6 pt-5 border-t border-japaCardLight">
          <span className="text-[9px] font-bold text-japaTextMuted uppercase tracking-wider text-center block mb-3">
            Acesso Rápido — Demonstração
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {quickRoles.map(lvl => (
              <button
                key={lvl.role}
                id={`quick-login-${lvl.role.toLowerCase()}`}
                type="button"
                onClick={() => handleQuickLogin(lvl.role)}
                className={`bg-japaBg hover:bg-japaCardLight border ${lvl.color} text-[10px] text-white p-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all`}
              >
                <ShieldCheck size={11} />
                <span className="leading-tight text-center">{lvl.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-japaTextMuted text-center mt-2 opacity-60">
            Usuários: admin · gerente · caixa · cozinha · entregador · cliente
          </p>
        </div>

        <div className="text-center mt-5 text-[9px] text-japaTextMuted opacity-50">
          © 2026 Japa Food Prime. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};
