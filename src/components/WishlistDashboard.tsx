import React, { useState } from 'react';
import { MonitoredItem, Product } from '../types';
import { Bell, BellOff, Trash2, ExternalLink, Plus, FolderPlus, Sparkles, TrendingDown, Target, CheckCircle2 } from 'lucide-react';

interface WishlistDashboardProps {
  monitoredList: MonitoredItem[];
  products: Product[];
  onRemoveMonitor: (id: string) => void;
  onUpdateFrequency: (id: string, freq: 'immediate' | 'daily' | 'weekly') => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDashboard: React.FC<WishlistDashboardProps> = ({
  monitoredList,
  products,
  onRemoveMonitor,
  onUpdateFrequency,
  onSelectProduct,
}) => {
  const [activeCollection, setActiveCollection] = useState<string>('Todas');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [customCollections, setCustomCollections] = useState<string[]>(['Games & Tech', 'Casa Nova', 'Black Friday']);

  const collections = ['Todas', ...customCollections];

  const filteredItems = activeCollection === 'Todas'
    ? monitoredList
    : monitoredList.filter(item => item.collection === activeCollection);

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim() && !customCollections.includes(newCollectionName.trim())) {
      setCustomCollections([...customCollections, newCollectionName.trim()]);
      setNewCollectionName('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monitoramento de Preços & Desejos</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/50">
              {monitoredList.length} itens ativos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Seu assistente pessoal ComparaJá monitora estas ofertas 24h por dia e avisa quando o preço cai.
          </p>
        </div>

        {/* Add Collection inline form */}
        <form onSubmit={handleAddCollection} className="flex gap-2">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Nova coleção (ex: Viagem)"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Criar
          </button>
        </form>
      </div>

      {/* Collection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {collections.map((coll) => (
          <button
            key={coll}
            onClick={() => setActiveCollection(coll)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCollection === coll
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {coll}
          </button>
        ))}
      </div>

      {/* Grid of Monitored Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Nenhum produto monitorado nesta coleção</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Busque um produto pelo nome, código de barras ou imagem e clique em "Monitorar Preço" para acompanhar a variação.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const originalProd = products.find(p => p.id === item.productId);
            const isTargetReached = item.currentLowestPrice <= item.targetPrice;
            const diffPercent = Math.round(((item.currentLowestPrice - item.targetPrice) / item.targetPrice) * 100);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm transition duration-200 flex flex-col justify-between space-y-4 ${
                  isTargetReached ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 dark:border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {item.collection}
                      </span>
                      <h4
                        onClick={() => originalProd && onSelectProduct(originalProd)}
                        className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition"
                      >
                        {item.productTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Target vs Current Price Bar */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Preço Menor Atual:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        R$ {item.currentLowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Sua Meta de Preço:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        R$ {item.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {isTargetReached ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Meta atingida! Ótimo momento para comprar.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                        <span>Falta baixar: <strong>{diffPercent}%</strong></span>
                        <span className="text-slate-400 dark:text-slate-500">Desde {item.createdAt}</span>
                      </div>
                    )}
                  </div>

                  {/* Frequency controls */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Frequência:</span>
                    <select
                      value={item.alertFrequency}
                      onChange={(e) => onUpdateFrequency(item.id, e.target.value as any)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="immediate" className="dark:bg-slate-900">Imediata</option>
                      <option value="daily" className="dark:bg-slate-900">Resumo Diário</option>
                      <option value="weekly" className="dark:bg-slate-900">Semanal</option>
                    </select>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => originalProd && onSelectProduct(originalProd)}
                    className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Ofertas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveMonitor(item.id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                    title="Remover monitoramento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
