import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiUrl } from '../lib/apiClient';

interface ImageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdentify: (query: string, detectedProduct?: any) => void;
}

export const ImageScannerModal: React.FC<ImageScannerModalProps> = ({ isOpen, onClose, onIdentify }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(apiUrl('/api/identify-image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });

      const resData = await response.json();
      setLoading(false);

      if (resData.success && resData.data) {
        const query = resData.data.query || resData.data.name || 'Produto Identificado';
        onIdentify(query, resData.data);
        onClose();
      } else {
        setErrorMessage('Não foi possível reconhecer o produto. Tente outra foto mais nítida.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('Erro de conexão ao processar imagem.');
    }
  };

  const SAMPLE_PRESETS = [
    { title: 'PlayStation 5', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80', query: 'Console PlayStation 5 Slim' },
    { title: 'iPhone 16 Pro', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80', query: 'iPhone 16 Pro 256GB' },
    { title: 'Air Fryer Mondial', url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80', query: 'Air Fryer Mondial Grand Family 4L' }
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Identificador de Produto por IA</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Envie a foto do produto para encontrar ofertas equivalentes</p>
          </div>
        </div>

        {/* Dropzone or Preview */}
        <div className="mb-4">
          {selectedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group aspect-video flex items-center justify-center">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Clique para enviar uma foto</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG ou WEBP até 10MB</p>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Sample presets */}
        {!selectedImage && (
          <div className="mb-5">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Ou selecione um exemplo de foto:</span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onIdentify(preset.query);
                    onClose();
                  }}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition text-left group cursor-pointer"
                >
                  <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedImage || loading}
          onClick={handleIdentifyImage}
          className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            selectedImage && !loading
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analisando foto com Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Identificar Produto & Buscar Ofertas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
