import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Coupon, MonitoredItem, AppNotification } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_MONITORED,
  INITIAL_NOTIFICATIONS,
} from './mockData';

import { Navbar } from './components/Navbar';
import { SearchOverview } from './components/SearchOverview';
import { ProductDetail } from './components/ProductDetail';
import { WishlistDashboard } from './components/WishlistDashboard';
import { CouponsDashboard } from './components/CouponsDashboard';
import { BarcodeModal } from './components/BarcodeModal';
import { ImageScannerModal } from './components/ImageScannerModal';
import { LinkAnalyzerModal } from './components/LinkAnalyzerModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiUrl } from './lib/apiClient';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [monitoredList, setMonitoredList] = useState<MonitoredItem[]>(INITIAL_MONITORED);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [activeTab, setActiveTab] = useState<'search' | 'wishlist' | 'coupons'>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('comparaja-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('comparaja-theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Modals
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Execute Search via Server Endpoint /api/search
  const handlePerformSearch = async (query: string, barcode?: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setActiveTab('search');

    try {
      const response = await fetch(apiUrl('/api/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, barcode }),
      });

      const resData = await response.json();
      setIsSearching(false);

      if (resData.success && resData.data) {
        const d = resData.data;

        const newProd: Product = {
          id: `prod-${Date.now()}`,
          name: d.productName || query,
          brand: d.brand || 'Marca',
          model: d.model || 'SKU',
          ean: d.ean || barcode || '7891234567890',
          category: d.category || 'Geral',
          image: d.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
          currentLowestPrice: d.offers && d.offers[0] ? d.offers[0].price : 999,
          historicalLowestPrice: d.historicalLowestPrice || (d.offers[0]?.price ? Math.round(d.offers[0].price * 0.9) : 899),
          historicalHighestPrice: d.historicalHighestPrice || (d.offers[0]?.price ? Math.round(d.offers[0].price * 1.2) : 1199),
          targetPrice: Math.round((d.offers[0]?.price || 999) * 0.95),
          isMonitored: false,
          offers: d.offers || [],
          priceHistory: d.priceHistory || [
            { date: '01/07', price: 1100, storeName: 'Amazon' },
            { date: '15/07', price: 1050, storeName: 'KaBuM!' },
            { date: '06/08', price: d.offers[0]?.price || 999, storeName: d.offers[0]?.storeName || 'Mercado Livre' }
          ]
        };

        setProducts(prev => [newProd, ...prev]);
        setSelectedProduct(newProd);
        showToast(`Busca concluída: ${newProd.offers.length} ofertas encontradas!`);
      }
    } catch (err) {
      setIsSearching(false);
      showToast('Nenhum resultado direto encontrado no servidor. Exibindo resultados locais.');
    }
  };

  // Toggle Price Monitoring
  const handleToggleMonitor = (product: Product, targetPrice: number) => {
    const existingIndex = monitoredList.findIndex(m => m.productId === product.id);

    if (existingIndex >= 0) {
      // Update target price
      const updated = [...monitoredList];
      updated[existingIndex].targetPrice = targetPrice;
      setMonitoredList(updated);
      showToast(`Meta de preço atualizada para R$ ${targetPrice.toFixed(2)}!`);
    } else {
      // Add new monitored item
      const newItem: MonitoredItem = {
        id: `mon-${Date.now()}`,
        productId: product.id,
        productTitle: product.name,
        productImage: product.image,
        currentLowestPrice: product.currentLowestPrice,
        targetPrice: targetPrice,
        collection: 'Games & Tech',
        alertFrequency: 'immediate',
        notificationsEnabled: true,
        createdAt: 'Hoje'
      };
      setMonitoredList([newItem, ...monitoredList]);

      // Add alert notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: '🔔 Alerta de Preço Ativado',
        message: `Você está monitorando ${product.name}. Avisaremos quando atingir R$ ${targetPrice.toFixed(2)}.`,
        date: 'Agora',
        type: 'price_drop',
        productId: product.id,
        read: false
      };
      setNotifications([newNotif, ...notifications]);

      showToast(`Produto adicionado à sua lista de monitoramento!`);
    }
  };

  const handleRemoveMonitor = (id: string) => {
    setMonitoredList(monitoredList.filter(m => m.id !== id));
    showToast('Monitoramento removido.');
  };

  const handleUpdateFrequency = (id: string, freq: 'immediate' | 'daily' | 'weekly') => {
    setMonitoredList(monitoredList.map(m => m.id === id ? { ...m, alertFrequency: freq } : m));
    showToast('Frequência de alertas atualizada.');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const isCurrentProductMonitored = Boolean(
    selectedProduct && monitoredList.some(m => m.productId === selectedProduct.id)
  );

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors duration-200`}>
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handlePerformSearch}
        onOpenBarcodeModal={() => setIsBarcodeOpen(true)}
        onOpenImageModal={() => setIsImageOpen(true)}
        onOpenLinkModal={() => setIsLinkOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNotificationsCount}
        isSearching={isSearching}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Views Switching */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key={selectedProduct && !isSearching ? `product-${selectedProduct.id}` : 'search-overview'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {selectedProduct && !isSearching ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar para Pesquisa & Destaques
                  </button>

                  <ProductDetail
                    product={selectedProduct}
                    onToggleMonitor={handleToggleMonitor}
                    isMonitored={isCurrentProductMonitored}
                    onOpenCouponTab={() => setActiveTab('coupons')}
                  />
                </div>
              ) : (
                <SearchOverview
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onQuickSearch={handlePerformSearch}
                  onOpenBarcodeModal={() => setIsBarcodeOpen(true)}
                  onOpenImageModal={() => setIsImageOpen(true)}
                  onOpenLinkModal={() => setIsLinkOpen(true)}
                  isSearching={isSearching}
                  searchQuery={searchQuery}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <WishlistDashboard
                monitoredList={monitoredList}
                products={products}
                onRemoveMonitor={handleRemoveMonitor}
                onUpdateFrequency={handleUpdateFrequency}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setActiveTab('search');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'coupons' && (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <CouponsDashboard coupons={coupons} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Drawers */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onScan={(code, title) => {
          handlePerformSearch(title || code, code);
        }}
      />

      <ImageScannerModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        onIdentify={(query) => {
          handlePerformSearch(query);
        }}
      />

      <LinkAnalyzerModal
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        onAnalyzeLink={(query) => {
          handlePerformSearch(query);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNotificationClick={(notif) => {
          if (notif.productId) {
            const found = products.find(p => p.id === notif.productId);
            if (found) {
              setSelectedProduct(found);
              setActiveTab('search');
            }
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 <strong className="text-slate-700 dark:text-slate-300">ComparaJá</strong> — Seu assistente pessoal de preços e cupons.</p>
          <p className="text-slate-400 dark:text-slate-500">Busca via Google Search API & Gemini 3.6 Flash AI</p>
        </div>
      </footer>
    </div>
  );
}
