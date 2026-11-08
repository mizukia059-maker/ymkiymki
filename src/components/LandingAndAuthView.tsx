import React, { useState } from 'react';
import { Music, Mic, Heart, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingAndAuthView: React.FC = () => {
  const { login, register, allProfiles, showToast } = useApp();
  const [viewState, setViewState] = useState<'landing' | 'auth'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regDob, setRegDob] = useState('2004-06-15');
  const [regError, setRegError] = useState('');

  const cleanRegUsername = regUsername.trim();
  const isUsernameTaken =
    cleanRegUsername.length > 0 &&
    Object.keys(allProfiles).some(
      (u) => u.trim().toLowerCase() === cleanRegUsername.toLowerCase()
    );

  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) return;
    setLoginError('');
    const clean = loginIdentifier.split('@')[0].trim();
    const res = await login(clean, loginPassword.trim());
    if (res && !res.success) {
      setLoginError(res.error || 'Credenciales incorrectas');
    }
  };

  const handleFounderQuickFill = (username: string, pass: string) => {
    setLoginIdentifier(username);
    setLoginPassword(pass);
    setLoginError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanRegUsername) return;

    if (cleanRegUsername.length < 3) {
      setRegError('El nombre de usuario debe tener al menos 3 caracteres.');
      showToast('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (isUsernameTaken) {
      setRegError(`El nombre de usuario "${cleanRegUsername}" ya está en uso. Por favor elige otro.`);
      showToast(`El nombre de usuario "${cleanRegUsername}" ya existe. Elige uno diferente.`);
      return;
    }

    setRegError('');
    const res = await register(cleanRegUsername, regNickname.trim() || cleanRegUsername, regDob);
    if (res && !res.success && res.error) {
      setRegError(res.error);
    }
  };

  if (viewState === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
        {/* Background gradient decorative orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand */}
        <header className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Music className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              YM-ki <span className="text-indigo-400">Web</span>
            </span>
          </div>
          <button
            onClick={() => {
              setViewState('auth');
              setAuthTab('login');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow active:scale-95 cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </header>

        {/* Center Hero */}
        <main className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto z-10 space-y-6 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Plataforma Artística Oficial
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            YM-ki Web
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-serif italic max-w-2xl leading-relaxed">
            "Tu voz tiene el poder de conmover al mundo; atrévete a cruzar el umbral y deja que tu talento hable."
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Foros comunitarios, clubes de fans oficiales, tienda de merch y audiciones directas ante la mesa de CEOs de YM-ki Entertainment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={() => {
                setViewState('auth');
                setAuthTab('register');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Audicionar en YM-ki
            </button>

            <button
              onClick={() => {
                setViewState('auth');
                setAuthTab('login');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 shadow-xl transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-pink-500" /> Entrar como Fan
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} YM-ki Entertainment. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <Music className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">YM-ki Web</h2>
          <p className="text-xs text-slate-400">Accede a tu cuenta o regístrate en la comunidad</p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setAuthTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authTab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* LOGIN FORM */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Founder & CEO Fast-Access Badges */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Acceso CEOs Fundadores:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Credenciales Activas</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFounderQuickFill('ceo_miki', 'MikiLeader2026!')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-xs font-bold text-indigo-200 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">👑 CEO Miki</span>
                  <span className="text-[10px] text-indigo-400 opacity-80 group-hover:opacity-100 ml-1">Cargar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFounderQuickFill('ceo_yako', 'YakoVisionary2026!')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-xs font-bold text-purple-200 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">⚡ CEO Yako</span>
                  <span className="text-[10px] text-purple-400 opacity-80 group-hover:opacity-100 ml-1">Cargar</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Contraseñas de CEO listas. También acepta clave general: <code className="text-amber-300 font-mono">ymki2026!</code></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de usuario o Correo:
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Ingresa tu usuario (ej: ceo_miki o tu nombre)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Entrar a YM-ki <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {regError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nombre de usuario (ID único):
                </label>
                {cleanRegUsername.length >= 3 && (
                  isUsernameTaken ? (
                    <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> No disponible (en uso)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disponible ✓
                    </span>
                  )
                )}
              </div>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => {
                  setRegUsername(e.target.value);
                  if (regError) setRegError('');
                }}
                placeholder="Elige tu nombre de usuario..."
                className={`w-full bg-slate-800 border rounded-xl p-3 text-xs text-white outline-none transition ${
                  isUsernameTaken
                    ? 'border-red-500/80 focus:border-red-500'
                    : cleanRegUsername.length >= 3
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : 'border-slate-700 focus:border-indigo-500'
                }`}
                required
              />
              {isUsernameTaken && (
                <p className="text-[11px] text-red-400 mt-1">
                  Este nombre de usuario ya pertenece a otra cuenta. Nadie puede ponerse un nombre existente.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nickname / Nombre Artístico:
              </label>
              <input
                type="text"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                placeholder="Tu apodo público o de aspirante..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de Nacimiento (mínimo 8 años):
              </label>
              <input
                type="date"
                value={regDob}
                onChange={(e) => setRegDob(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUsernameTaken || cleanRegUsername.length < 3}
              className={`w-full py-3 font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isUsernameTaken || cleanRegUsername.length < 3
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-pink-600 hover:bg-pink-500 text-white active:scale-95'
              }`}
            >
              Registrarse y Comenzar <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <button
          onClick={() => setViewState('landing')}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 pt-2 block"
        >
          ← Volver a la página principal
        </button>
      </div>
    </div>
  );
};
