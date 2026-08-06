import React, { useState } from 'react';
import { Coupon } from '../types';
import { Tag, Check, Copy, ShieldCheck, Sparkles, Filter, Search, Loader2 } from 'lucide-react';

interface CouponsDashboardProps {
  coupons: Coupon[];
  onAddCoupon?: (newCoupon: Coupon) => void;
}

export const CouponsDashboard: React.FC<CouponsDashboardProps> = ({ coupons, onAddCoupon }) => {
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Coupon Tester Modal state
  const [showAiTester, setShowAiTester] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testStore, setTestStore] = useState('KaBuM!');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const stores = ['Todas', ...Array.from(new Set(coupons.map(c => c.storeName)))];
  const categories = ['Todas', ...Array.from(new Set(coupons.map(c => c.category)))];

  const filteredCoupons = coupons.filter(c => {
    const matchesStore = selectedStore === 'Todas' || c.storeName === selectedStore;
    const matchesCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discountText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesCategory && matchesSearch;
  });

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode.trim()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testCode.trim(), storeName: testStore }),
      });

      const resData = await response.json();
      setTesting(false);
      if (resData.success && resData.data) {
        setTestResult(resData.data);
      }
    } catch (err) {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Banco de Cupons Verificados</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50">
              {coupons.length} disponíveis
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Copie cupons testados diariamente para economizar em suas compras online.
          </p>
        </div>

        <button
          onClick={() => setShowAiTester(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Validar Cupom por IA</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por loja ou código..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Store Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Loja:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer dark:bg-slate-800"
            >
              {stores.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Categoria:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer dark:bg-slate-800"
            >
              {categories.map(c => <option key={c} value={c} className="dark:bg-slate-900">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm transition duration-200 flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{coupon.storeName}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 text-[10px] font-bold">
                  {coupon.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-lg leading-snug">{coupon.discountText}</h3>
                {coupon.terms && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{coupon.terms}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Verificado • Válido até {coupon.expiryDate}</span>
              </div>
            </div>

            {/* Code & Copy button */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wider pl-1">
                {coupon.code}
              </span>
              <button
                onClick={() => handleCopy(coupon)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  copiedId === coupon.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                {copiedId === coupon.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tester Modal */}
      {showAiTester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Validador de Cupons por IA</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Informe o código e a loja. O Gemini AI analisará as regras e a aplicabilidade.
            </p>

            <form onSubmit={handleTestCoupon} className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loja:</label>
                <select
                  value={testStore}
                  onChange={(e) => setTestStore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="KaBuM!" className="dark:bg-slate-900">KaBuM!</option>
                  <option value="Amazon Brasil" className="dark:bg-slate-900">Amazon Brasil</option>
                  <option value="Magazine Luiza" className="dark:bg-slate-900">Magazine Luiza</option>
                  <option value="Mercado Livre" className="dark:bg-slate-900">Mercado Livre</option>
                  <option value="Fast Shop" className="dark:bg-slate-900">Fast Shop</option>
                  <option value="Shopee" className="dark:bg-slate-900">Shopee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Código do Cupom:</label>
                <input
                  type="text"
                  required
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="Ex: CUPOM10OFF"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analisando regras com Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Checar Validade do Cupom
                  </>
                )}
              </button>
            </form>

            {testResult && (
              <div className="bg-indigo-50/70 dark:bg-indigo-950/60 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Status: {testResult.status}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{testResult.discountText}</span>
                </div>
                <p className="text-xs text-indigo-900 dark:text-indigo-300">{testResult.explanation}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowAiTester(false);
                setTestResult(null);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
