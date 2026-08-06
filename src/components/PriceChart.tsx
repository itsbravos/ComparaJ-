import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { PriceHistoryPoint } from '../types';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface PriceChartProps {
  data: PriceHistoryPoint[];
  currentLowestPrice: number;
  historicalLowestPrice: number;
  historicalHighestPrice: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  currentLowestPrice,
  historicalLowestPrice,
  historicalHighestPrice,
}) => {
  const isLowest = currentLowestPrice <= historicalLowestPrice;

  const formattedData = data.map((item) => ({
    ...item,
    formattedPrice: `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  }));

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const avgPrice = Math.round(data.reduce((acc, d) => acc + d.price, 0) / (data.length || 1));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg">Histórico de Preço (Últimos 90 dias)</h3>
            {isLowest && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <TrendingDown className="w-3 py-0.5 h-3" /> Menor preço histórico!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe a variação do valor nas lojas parceiras
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block">Menor registrado</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">R$ {minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block">Média no período</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">R$ {avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block">Maior registrado</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm">R$ {maxPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#475569' }} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              domain={['dataMin - 50', 'dataMax + 50']}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `R$${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as PriceHistoryPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                      <p className="font-medium text-slate-300">{data.date}</p>
                      <p className="text-emerald-400 font-bold text-sm">
                        R$ {data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-slate-400">Loja: <span className="text-white font-medium">{data.storeName}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
        <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Dica ComparaJá:</strong> O preço atual (R$ {currentLowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) está{' '}
          {currentLowestPrice < avgPrice ? (
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">abaixo da média dos últimos meses! Boa oportunidade de compra.</span>
          ) : (
            <span>próximo da média. Defina um alerta de preço para ser avisado se baixar mais.</span>
          )}
        </span>
      </div>
    </div>
  );
};
