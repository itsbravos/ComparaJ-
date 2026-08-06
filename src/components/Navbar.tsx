import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  QrCode,
  Camera,
  Link as LinkIcon,
  Bell,
  Sparkles,
  Heart,
  Tag,
  Compass,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'wishlist' | 'coupons';
  setActiveTab: (tab: 'search' | 'wishlist' | 'coupons') => void;
  onSearch: (query: string) => void;
  onOpenBarcodeModal: () => void;
  onOpenImageModal: () => void;
  onOpenLinkModal: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  isSearching?: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSearch,
  onOpenBarcodeModal,
  onOpenImageModal,
  onOpenLinkModal,
  onOpenNotifications,
  unreadCount,
  isSearching = false,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setActiveTab('search');
    }
  };

  const tabs: { id: 'search' | 'wishlist' | 'coupons'; label: string; icon: React.ReactNode }[] = [
    { id: 'search', label: 'Comparar', icon: <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> },
    { id: 'wishlist', label: 'Monitorados', icon: <Heart className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'coupons', label: 'Cupons', icon: <Tag className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center p-2 shadow-md shadow-emerald-600/25 ring-1 ring-emerald-500/30 group-hover:scale-105 transition duration-200 shrink-0">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                  {/* Stylized 'C' letter curve */}
                  <path
                    d="M25 11.5C22.8 9.5 18.8 9.2 15 12C11 15 10.5 21 13.8 24.8C17 28.5 22.8 28.8 26.2 25.8"
                    stroke="currentColor"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Internal price trend arrow */}
                  <path
                    d="M16 20L20 16L24 19.5L29 14.5"
                    stroke="#A7F3D0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M25 14.5H29V18.5"
                    stroke="#A7F3D0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Compara<span className="text-emerald-600 dark:text-emerald-400">Já</span></span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 text-[10px] font-bold">
                    IA 3.6
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Actions (Theme Toggle + Notifications) */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar with Camera, Barcode, Link shortcuts */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-auto w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Busque por produto, marca, modelo ou e-commerce..."
                className="w-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-2xl pl-10 pr-28 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5" />

              {/* Action Buttons Inside Input */}
              <div className="absolute right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-600/60 shadow-xs">
                <button
                  type="button"
                  onClick={onOpenBarcodeModal}
                  title="Scanner de Código de Barras"
                  className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenImageModal}
                  title="Identificar por Foto / Câmera (IA)"
                  className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenLinkModal}
                  title="Cole o Link de uma Loja"
                  className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Nav Tabs, Theme Toggle & Desktop Notifications */}
          <div className="flex items-center gap-2 justify-center">
            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 relative">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 z-10 ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Theme Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="hidden md:flex items-center justify-center p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Desktop Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="hidden md:flex relative p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
