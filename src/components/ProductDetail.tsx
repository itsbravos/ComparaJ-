import React, { useState } from 'react';
import { Product, StoreOffer, SortOption } from '../types';
import { PriceChart } from './PriceChart';
import {
  ExternalLink,
  ShieldCheck,
  Truck,
  Star,
  Bell,
  CheckCircle,
  Tag,
  TrendingDown,
  Info,
  Layers,
  Sparkles,
  ArrowUpDown,
  Zap,
  Copy,
  Check,
  Heart
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onToggleMonitor: (product: Product, targetPrice: number) => void;
  isMonitored: boolean;
  onOpenCouponTab?: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onToggleMonitor,
  isMonitored,
  onOpenCouponTab
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [identicalOnly, setIdenticalOnly] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState<number>(
    product.targetPrice || Math.round(product.currentLowestPrice * 0.95)
  );
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Filter and sort offers
  let filteredOffers = [...product.offers];
  if (identicalOnly) {
    filteredOffers = filteredOffers.filter(o => o.isIdentical);
  }

  filteredOffers.sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_shipping') {
      return (a.price + a.shippingPrice) - (b.price + b.shippingPrice);
    }
    if (sortBy === 'rating_desc') {
      return b.rating - a.rating;
    }
    if (sortBy === 'delivery_asc') {
      return a.deliveryDays - b.deliveryDays;
    }
    return 0;
  });

  const bestOffer = filteredOffers[0] || product.offers[0];

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleSaveTargetPrice = () => {
    onToggleMonitor(product, targetPriceInput);
    setShowTargetModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Product Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Image */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center relative group">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-64 object-contain rounded-lg transition transform group-hover:scale-105 duration-300"
            />
            {product.currentLowestPrice <= product.historicalLowestPrice && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Menor Preço Histórico
              </span>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg">{product.brand}</span>
              <span>•</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">{product.category}</span>
              {product.model && (
                <>
                  <span>•</span>
                  <span>Mod: {product.model}</span>
                </>
              )}
              {product.ean && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-400 dark:text-slate-500">EAN: {product.ean}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
                {product.description}
              </p>
            )}

            {/* Price Box */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">A partir de</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    R$ {product.currentLowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {bestOffer?.originalPrice && (
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                      R$ {bestOffer.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {bestOffer?.pixDiscountPrice && (
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    💡 R$ {bestOffer.pixDiscountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no PIX ({bestOffer.storeName})
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTargetModal(true)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer ${
                    isMonitored
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {isMonitored ? 'Monitorando (Editar Alerta)' : 'Monitorar Preço'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Price Alert Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Definir Alerta de Preço</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Avisaremos imediatamente quando este produto atingir seu preço-alvo.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preço Atual Menor:</label>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  R$ {product.currentLowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Seu Preço Alvo (R$):</label>
                <input
                  type="number"
                  step="10"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTargetPrice}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Salvar Alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers List & Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comparação de Preços entre Lojas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{filteredOffers.length} ofertas encontradas no mercado</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer dark:bg-slate-900"
              >
                <option value="price_asc" className="dark:bg-slate-900 dark:text-slate-200">Menor Preço</option>
                <option value="price_shipping" className="dark:bg-slate-900 dark:text-slate-200">Menor Preço + Frete</option>
                <option value="rating_desc" className="dark:bg-slate-900 dark:text-slate-200">Melhor Avaliada</option>
                <option value="delivery_asc" className="dark:bg-slate-900 dark:text-slate-200">Entrega Mais Rápida</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <label className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={identicalOnly}
                onChange={(e) => setIdenticalOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
              />
              <span>Somente Produto Idêntico</span>
            </label>
          </div>
        </div>

        {/* Offers Cards */}
        <div className="space-y-3">
          {filteredOffers.map((offer, index) => (
            <div
              key={offer.id || index}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                index === 0
                  ? 'border-emerald-500 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Store & Match status */}
              <div className="space-y-2 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{offer.storeName}</span>
                  {index === 0 && (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      Melhor Oferta
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {offer.isIdentical ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-medium border border-emerald-100 dark:border-emerald-900">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Produto Idêntico (EAN)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-medium border border-amber-100 dark:border-amber-900">
                      <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Similar / Kit
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{offer.rating}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">({offer.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {offer.originalPrice && offer.originalPrice > offer.price && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                      R$ {offer.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {offer.pixDiscountPrice && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-500" /> R$ {offer.pixDiscountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no PIX
                  </p>
                )}

                {offer.installmentText && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{offer.installmentText}</p>
                )}
              </div>

              {/* Shipping & Coupon */}
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>
                    Frete:{' '}
                    {offer.shippingPrice === 0 ? (
                      <strong className="text-emerald-600 dark:text-emerald-400">Grátis</strong>
                    ) : (
                      `R$ ${offer.shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400">Entrega estimativa: <strong className="text-slate-700 dark:text-slate-200">{offer.deliveryDays} dias úteis</strong></p>

                {offer.couponCode && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleCopyCoupon(offer.couponCode!)}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 font-mono text-[11px] font-bold transition cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{offer.couponCode}</span>
                      <span className="text-[10px] font-sans font-normal text-indigo-900 dark:text-indigo-200">({offer.couponDiscount})</span>
                      {copiedCoupon === offer.couponCode ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* External Direct Button */}
              <div className="pt-2 md:pt-0">
                <a
                  href={offer.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Ir para a Loja</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price History Component */}
      <PriceChart
        data={product.priceHistory}
        currentLowestPrice={product.currentLowestPrice}
        historicalLowestPrice={product.historicalLowestPrice}
        historicalHighestPrice={product.historicalHighestPrice}
      />
    </div>
  );
};
