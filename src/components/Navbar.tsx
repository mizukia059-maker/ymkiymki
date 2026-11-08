import React from 'react';
import {
  Menu,
  Music,
  MessageSquare,
  Mic,
  MessageCircle,
  Star,
  Store,
  Coins,
  Search,
  LogOut,
  Bell,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Radio,
  Trophy,
  Shirt,
  Flame,
  TrendingUp,
  Building2,
  Calendar,
  Award,
  Handshake,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';

export type AppSection =
  | 'foros'
  | 'audiciones'
  | 'chats'
  | 'fans'
  | 'tienda'
  | 'fashion'
  | 'lanzamientos'
  | 'premiaciones'
  | 'survival'
  | 'charts'
  | 'partners'
  | 'calendario'
  | 'colaboraciones'
  | 'logros'
  | 'moderacion'
  | 'idcard'
  | 'configuracion'
  | 'customize';

interface NavbarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  onOpenSidebar: () => void;
  onOpenCoinsModal: () => void;
  onOpenSearchModal: () => void;
  onOpenNotificationsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onSelectSection,
  onOpenSidebar,
  onOpenCoinsModal,
  onOpenSearchModal,
  onOpenNotificationsModal
}) => {
  const {
    userProfile,
    notifications,
    currentUser,
    themeMode,
    setThemeMode,
    primaryButtonColor,
    isUnlimitedBalance,
    logout
  } = useApp();

  const isTraineeOrArtist =
    userProfile.accountType === 'trainee' || userProfile.accountType === 'artista';

  const hasUnlimited = isUnlimitedBalance();

  const unreadNotifsCount = notifications.filter(
    (n) => n.recipient === currentUser && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-2 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-md">
      {/* Left Menu & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer active:scale-95"
          title="Menú de cuenta"
        >
          <Menu className="w-5 h-5" style={{ color: primaryButtonColor }} />
        </button>

        <div
          onClick={() => onSelectSection('foros')}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition"
        >
          <div
            style={{ backgroundColor: primaryButtonColor }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow"
          >
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white hidden lg:inline">
            YM-ki <span style={{ color: primaryButtonColor }}>Web</span>
          </span>
        </div>
      </div>

      {/* Center Navigation Links: Responsive scrollable container */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 px-1 max-w-[50vw] sm:max-w-none scrollbar-none">
        {/* Foros */}
        <button
          onClick={() => onSelectSection('foros')}
          style={currentSection === 'foros' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'foros'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Foros Comunitarios"
        >
          <MessageSquare
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'foros' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Foros
          </span>
        </button>

        {/* Audiciones: Only for non-fan */}
        {userProfile.accountType !== 'fan' && (
          <button
            onClick={() => onSelectSection('audiciones')}
            style={currentSection === 'audiciones' ? { backgroundColor: primaryButtonColor } : undefined}
            className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
              currentSection === 'audiciones'
                ? 'text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Centro de Audiciones"
          >
            <Mic
              className="w-4 h-4 flex-shrink-0"
              style={currentSection === 'audiciones' ? { color: '#ffffff' } : { color: primaryButtonColor }}
            />
            <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
              Audiciones
            </span>
          </button>
        )}

        {/* Charts & Rankings */}
        <button
          onClick={() => onSelectSection('charts')}
          style={currentSection === 'charts' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'charts'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Charts & Rankings Oficiales"
        >
          <TrendingUp
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'charts' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Charts
          </span>
        </button>

        {/* Survival */}
        <button
          onClick={() => onSelectSection('survival')}
          style={currentSection === 'survival' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'survival'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Survival Shows & Competencias de Talentos"
        >
          <Flame
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'survival' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Survival
          </span>
        </button>

        {/* Partners */}
        <button
          onClick={() => onSelectSection('partners')}
          style={currentSection === 'partners' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'partners'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Partners & Empresas Aliadas"
        >
          <Building2
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'partners' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Partners
          </span>
        </button>

        {/* Chats */}
        <button
          onClick={() => onSelectSection('chats')}
          style={currentSection === 'chats' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'chats'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Chats y Grupos"
        >
          <MessageCircle
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'chats' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Chats
          </span>
        </button>

        {/* Fans */}
        <button
          onClick={() => onSelectSection('fans')}
          style={currentSection === 'fans' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'fans'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Clubes de Fans"
        >
          <Star
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'fans' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Fans
          </span>
        </button>

        {/* Tienda */}
        <button
          onClick={() => onSelectSection('tienda')}
          style={currentSection === 'tienda' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'tienda'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Tienda & Outlet"
        >
          <Store
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'tienda' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Tienda
          </span>
        </button>

        {/* Fashion */}
        <button
          onClick={() => onSelectSection('fashion')}
          style={currentSection === 'fashion' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'fashion'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Sección Fashion & Revistas"
        >
          <Shirt
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'fashion' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Fashion
          </span>
        </button>

        {/* Lanzamientos */}
        <button
          onClick={() => onSelectSection('lanzamientos')}
          style={currentSection === 'lanzamientos' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'lanzamientos'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Hub de Lanzamientos Oficiales"
        >
          <Radio
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'lanzamientos' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Lanzamientos
          </span>
        </button>

        {/* Premiaciones */}
        <button
          onClick={() => onSelectSection('premiaciones')}
          style={currentSection === 'premiaciones' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'premiaciones'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Premiaciones & Votaciones"
        >
          <Trophy
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'premiaciones' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Premiaciones
          </span>
        </button>

        {/* Calendario */}
        <button
          onClick={() => onSelectSection('calendario')}
          style={currentSection === 'calendario' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'calendario'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Calendario General Automatizado"
        >
          <Calendar
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'calendario' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Calendario
          </span>
        </button>

        {/* Colaboraciones */}
        <button
          onClick={() => onSelectSection('colaboraciones')}
          style={currentSection === 'colaboraciones' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'colaboraciones'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Sistema de Colaboraciones"
        >
          <Handshake
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'colaboraciones' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Colaboraciones
          </span>
        </button>

        {/* Logros e Insignias */}
        <button
          onClick={() => onSelectSection('logros')}
          style={currentSection === 'logros' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'logros'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Vitrina de Logros & Insignias"
        >
          <Award
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'logros' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Logros
          </span>
        </button>

        {/* Panel de Moderación (Solo para Administradores y CEOs) */}
        {userProfile.accountType === 'admin' && (
          <button
            onClick={() => onSelectSection('moderacion')}
            style={currentSection === 'moderacion' ? { backgroundColor: '#e11d48' } : undefined}
            className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
              currentSection === 'moderacion'
                ? 'text-white shadow'
                : 'text-rose-400 hover:text-white hover:bg-rose-950/40'
            }`}
            title="Panel de Moderación & Denuncias"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
              Moderación
            </span>
          </button>
        )}

        {/* ID-CARD: ONLY VISIBLE FOR TRAINEES AND ARTISTAS */}
        {isTraineeOrArtist && (
          <button
            onClick={() => onSelectSection('idcard')}
            style={currentSection === 'idcard' ? { backgroundColor: primaryButtonColor } : undefined}
            className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
              currentSection === 'idcard'
                ? 'text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Mi ID-Card Oficial"
          >
            <CreditCard
              className="w-4 h-4 flex-shrink-0"
              style={currentSection === 'idcard' ? { color: '#ffffff' } : { color: primaryButtonColor }}
            />
            <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
              ID-Card
            </span>
          </button>
        )}

        {/* Configuración */}
        <button
          onClick={() => onSelectSection('configuracion')}
          style={currentSection === 'configuracion' ? { backgroundColor: primaryButtonColor } : undefined}
          className={`group relative flex items-center h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
            currentSection === 'configuracion'
              ? 'text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Página de Configuración"
        >
          <Settings
            className="w-4 h-4 flex-shrink-0"
            style={currentSection === 'configuracion' ? { color: '#ffffff' } : { color: primaryButtonColor }}
          />
          <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5">
            Configuración
          </span>
        </button>
      </nav>

      {/* Right User Bar: All buttons and icons reflect primaryButtonColor */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Global Search */}
        <button
          onClick={onOpenSearchModal}
          className="p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Buscar en la plataforma"
        >
          <Search className="w-4 h-4" style={{ color: primaryButtonColor }} />
        </button>

        {/* Theme quick toggle */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {themeMode === 'dark' ? (
            <Sun className="w-4 h-4" style={{ color: primaryButtonColor }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: primaryButtonColor }} />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotificationsModal}
          className="relative p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Bandeja de Notificaciones y Audiciones"
        >
          <Bell className="w-4 h-4" style={{ color: primaryButtonColor }} />
          {unreadNotifsCount > 0 && (
            <span
              style={{ backgroundColor: primaryButtonColor }}
              className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center text-white shadow"
            >
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Coins Wallet Badge: reflects primaryButtonColor & shows unlimited for admins/artists */}
        <div
          onClick={onOpenCoinsModal}
          style={{
            borderColor: `${primaryButtonColor}50`,
            backgroundColor: `${primaryButtonColor}18`,
            color: primaryButtonColor
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border cursor-pointer hover:opacity-90 transition select-none shadow-sm active:scale-95"
          title={hasUnlimited ? 'Coins y Gemas Ilimitadas (Admin/Artista)' : 'Ver Cartera de YM-Coins'}
        >
          <Coins className="w-4 h-4 flex-shrink-0" style={{ color: primaryButtonColor }} />
          <span className="text-xs font-black hidden sm:inline">
            {hasUnlimited ? '∞ Ilimitadas' : userProfile.coins.toLocaleString('es-MX')}
          </span>
        </div>

        {/* User Profile Button */}
        <button
          onClick={() => onSelectSection('customize')}
          className="flex items-center gap-1.5 py-1 px-1.5 rounded-full hover:bg-slate-800 transition text-left cursor-pointer active:scale-95"
          title="Personalizar perfil"
        >
          <AvatarWithFrame
            src={userProfile.avatar}
            size="sm"
            ringColor={primaryButtonColor}
            transparentFrame={userProfile.transparentFrame}
          />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" style={{ color: primaryButtonColor }} />
        </button>
      </div>
    </header>
  );
};
