import React from 'react';
import { Product } from '../types';
import { Sparkles, TrendingDown, ArrowRight, ShieldCheck, Tag, Loader2, QrCode, Camera, Link as LinkIcon } from 'lucide-react';

interface SearchOverviewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickSearch: (term: string) => void;
  onOpenBarcodeModal: () => void;
  onOpenImageModal: () => void;
  onOpenLinkModal: () => void;
  isSearching?: boolean;
  searchQuery?: string;
}

const QUICK_TERMS = [
  'PlayStation 5 Slim',
  'iPhone 16 Pro 256GB',
  'Air Fryer Mondial 4L',
  'Smart TV 55 LG OLED C3',
  'Notebook Dell XPS'
];

export const SearchOverview: React.FC<SearchOverviewProps> = ({
  products,
  onSelectProduct,
  onQuickSearch,
  onOpenBarcodeModal,
  onOpenImageModal,
  onOpenLinkModal,
  isSearching = false,
  searchQuery,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Bar Action Banners */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pesquisa Inteligente alimentada por IA & Google Search</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
            Encontre o menor preço em qualquer loja do Brasil em segundos
          </h1>

          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Busque por texto, escaneie o código de barras da embalagem, tire uma foto do produto ou cole um link de e-commerce. O ComparaJá rastreia os preços para você.
          </p>

          {/* Quick Method Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenBarcodeModal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Scanner Câmera
            </button>

            <button
              onClick={onOpenImageModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Foto por IA
            </button>

            <button
              onClick={onOpenLinkModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-sky-400" /> Colar Link de Loja
            </button>
          </div>
        </div>

        {/* Decorative ambient background accent */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Search Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Buscas frequentes:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_TERMS.map((term) => (
            <button
              key={term}
              onClick={() => onQuickSearch(term)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Searching Loader Overlay */}
      {isSearching && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Buscando ofertas para "{searchQuery}"...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Consultando KaBuM!, Amazon, Magalu, Mercado Livre e Fast Shop para comparar os melhores valores do mercado.
            </p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Produtos em Destaque & Monitorados</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecione para ver todas as ofertas por loja e gráfico de histórico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const isLowest = product.currentLowestPrice <= product.historicalLowestPrice;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-center relative aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-36 object-contain rounded-md group-hover:scale-105 transition duration-300"
                    />
                    {isLowest && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Menor Preço
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {product.brand} • {product.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {product.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">A partir de</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      R$ {product.currentLowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>{product.offers.length} ofertas salvas</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1 transition">
                      Ver tudo <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
