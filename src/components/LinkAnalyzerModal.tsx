import React, { useState } from 'react';
import { Link as LinkIcon, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { apiUrl } from '../lib/apiClient';

interface LinkAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeLink: (query: string, extractedData?: any) => void;
}

export const LinkAnalyzerModal: React.FC<LinkAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeLink,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(apiUrl('/api/extract-price'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const resData = await response.json();
      setLoading(false);

      if (resData.success && resData.data) {
        const query = resData.data.searchQuery || resData.data.productName || 'Produto de Loja';
        onAnalyzeLink(query, resData.data);
        onClose();
      } else {
        setErrorMsg('Não foi possível extrair informações desta URL.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Erro de rede ao analisar o link.');
    }
  };

  const SAMPLE_LINKS = [
    { store: 'KaBuM!', url: 'https://www.kabum.com.br/produto/516000/console-playstation-5-slim-edicao-digital-1tb', name: 'PlayStation 5 Slim' },
    { store: 'Amazon', url: 'https://www.amazon.com.br/dp/B0CL5K9812/ref=ce_smartphone_iphone16pro', name: 'iPhone 16 Pro 256GB' },
    { store: 'Magalu', url: 'https://www.magazineluiza.com.br/air-fryer-mondial-4l-inox-afn-40-bi/p/2312000/', name: 'Air Fryer Mondial 4L' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Busca por Link da Loja</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cole o link de um produto em qualquer e-commerce</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            URL do Produto (Amazon, KaBuM, Magalu, Mercado Livre, etc):
          </label>
          <div className="space-y-3">
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.loja.com.br/produto-exemplo"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Extraindo ofertas com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Localizar Equivalentes em Outras Lojas
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mb-4 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900">
            {errorMsg}
          </div>
        )}

        <div>
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Ou experimente estes links de teste:</span>
          <div className="space-y-1.5">
            {SAMPLE_LINKS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{sample.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] truncate max-w-[240px] block">
                    {sample.url}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50 text-[10px] font-bold">
                  {sample.store}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
