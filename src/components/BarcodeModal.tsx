import React, { useState } from 'react';
import { QrCode, Camera, X, CheckCircle, Sparkles, Search } from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string, productName?: string) => void;
}

const SAMPLE_BARCODES = [
  { code: '0711719572428', label: 'PlayStation 5 Slim Edição Digital', category: 'Console' },
  { code: '0195949051421', label: 'iPhone 16 Pro 256GB Titânio', category: 'Smartphone' },
  { code: '7898490165421', label: 'Air Fryer Mondial 4L Inox AFN-40', category: 'Eletrodoméstico' },
  { code: '7893299943210', label: 'Smart TV 55" LG OLED C3 120Hz', category: 'TV & Áudio' },
  { code: '7899999012345', label: 'Notebook Dell XPS 13 Intel Core i7', category: 'Informática' },
];

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, onScan }) => {
  const [manualCode, setManualCode] = useState('');
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      onClose();
    }
  };

  const handleSelectSample = (code: string, label: string) => {
    onScan(code, label);
    onClose();
  };

  const handleStartCamera = () => {
    setIsSimulatingCamera(true);
    // Simulate instant scan after 1.5 seconds
    setTimeout(() => {
      const randomSample = SAMPLE_BARCODES[Math.floor(Math.random() * SAMPLE_BARCODES.length)];
      setIsSimulatingCamera(false);
      onScan(randomSample.code, randomSample.label);
      onClose();
    }, 1500);
  };

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Scanner de Código de Barras</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Escaneie o EAN/GTIN da embalagem ou selecione abaixo</p>
          </div>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-center text-white relative overflow-hidden mb-5 border border-slate-800">
          {isSimulatingCamera ? (
            <div className="py-8 space-y-3">
              <div className="relative mx-auto w-24 h-24 border-2 border-emerald-400 border-dashed rounded-xl flex items-center justify-center animate-pulse">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981]"></div>
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-emerald-300">Lendo código de barras...</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Aponte a câmera do seu celular para o código de barras do produto para comparar instantaneamente.
              </p>
              <button
                type="button"
                onClick={handleStartCamera}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Ativar Câmera Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Code Input Form */}
        <form onSubmit={handleSubmit} className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ou digite o número do EAN / Código de barras:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ex: 0711719572428"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" /> Buscar
            </button>
          </div>
        </form>

        {/* Sample Barcodes List */}
        <div>
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Exemplos para teste rápido:</span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {SAMPLE_BARCODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectSample(item.code, item.label)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.label}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{item.code}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
