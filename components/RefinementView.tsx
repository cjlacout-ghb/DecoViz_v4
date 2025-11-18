

import React, { useState } from 'react';
import { Proposal, DECOR_STYLES } from '../types';
import { ArrowLeftIcon, DownloadIcon, SparklesIcon, UndoIcon } from './icons';

interface RefinementViewProps {
  proposal: Proposal;
  onBack: () => void;
  onRefine: (instructions: string) => Promise<void>;
  onGenerateNewStyle: (newStyle: string, roomTypeForNewStyle: string) => Promise<void>;
  isRefining: boolean;
  refinementError: string | null;
  originalImageBase64: string | null;
  roomType: string | null;
  onUndo: () => void; // New prop for undo action
  canUndo: boolean; // New prop to indicate if undo is possible
}

const downloadImage = (base64Image: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64Image}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const RefinementView: React.FC<RefinementViewProps> = ({ proposal, onBack, onRefine, onGenerateNewStyle, isRefining, refinementError, originalImageBase64, roomType, onUndo, canUndo }) => {
  const [instructions, setInstructions] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');

  const handleRefineClick = () => {
    if (instructions.trim()) {
      onRefine(instructions);
      setInstructions('');
    }
  };

  const handleNewStyleClick = (styleName?: string) => {
    const styleToGenerate = styleName || newStylePrompt.trim();
    if (styleToGenerate && roomType) {
        onGenerateNewStyle(styleToGenerate, roomType);
        setNewStylePrompt('');
    }
  };

  const cardClasses = "bg-gray-50 p-4 rounded-xl border border-gray-200 h-full";

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4"> {/* Group back and undo buttons */}
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Volver a las Propuestas
                </button>
                {canUndo && (
                    <button onClick={onUndo} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold" disabled={isRefining}>
                        <UndoIcon className="w-5 h-5" />
                        Deshacer
                    </button>
                )}
            </div>
            {originalImageBase64 && (
                <div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm flex items-center justify-center" // Centered for smaller images
                    title="Imagen original"
                >
                    <img src={`data:image/jpeg;base64,${originalImageBase64}`} alt="Original" className="max-w-full max-h-full object-contain" />
                    <span className="sr-only">Imagen original</span>
                </div>
            )}
        </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Side: Image and Refinement */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{proposal.style}</h2>
            <div className="relative aspect-video rounded-xl overflow-hidden group shadow-md">
                {isRefining && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-white"></div>
                        <p className="text-white mt-4 font-semibold">Rediseñando...</p>
                    </div>
                )}
                <img src={`data:image/jpeg;base64,${proposal.redesignedImage}`} alt={`Rediseño ${proposal.style}`} className="w-full h-full object-cover"/>
                <button
                    onClick={() => downloadImage(proposal.redesignedImage, `DecoViz_Rediseño_${proposal.style}_refinado.jpg`)}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-lg text-gray-700 hover:bg-white hover:text-[#9966FF] transition-all shadow-md backdrop-blur-sm"
                    title="Descargar Imagen Refinada"
                >
                    <DownloadIcon className="w-5 h-5"/>
                </button>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[#D0BFFF]"/>Ajuste Conversacional</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">Pedí cambios específicos para refinar el diseño a tu gusto.</p>
              <div className="flex gap-2">
                  <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Ej: 'Cambia el sofá a color rojo carmín'"
                      className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D0BFFF]"
                      disabled={isRefining}
                  />
                  <button onClick={handleRefineClick} disabled={isRefining || !instructions.trim()} className="px-4 py-2 bg-[#A05EEA] text-white rounded-lg font-semibold hover:bg-[#8A4CE0] disabled:bg-gray-300">
                      Refinar
                  </button>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">O probá con un estilo completamente nuevo.</p>
                {/* Predefined style buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {DECOR_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => handleNewStyleClick(style)}
                      disabled={isRefining}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-[#D0BFFF] hover:border-[#D0BFFF] hover:text-indigo-900 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {/* Custom style input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newStylePrompt}
                        onChange={(e) => setNewStylePrompt(e.target.value)}
                        placeholder="Ej: 'Estilo Art Decó'"
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D0BFFF]"
                        disabled={isRefining}
                    />
                    <button onClick={() => handleNewStyleClick()} disabled={isRefining || !newStylePrompt.trim()} className="px-4 py-2 bg-[#A05EEA] text-white rounded-lg font-semibold hover:bg-[#8A4CE0] disabled:bg-gray-300">
                        Generar
                    </button>
                </div>
              </div>
              {refinementError && <p className="text-red-600 text-sm mt-2">{refinementError}</p>}
          </div>
        </div>

        {/* Right Side: Details and Mood Board */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className={cardClasses}>
                <h3 className="font-bold text-lg text-gray-800 mb-3">Mood Board</h3>
                <div className="relative aspect-video rounded-lg overflow-hidden group bg-white">
                     <img src={`data:image/jpeg;base64,${proposal.moodBoard}`} alt={`Mood Board ${proposal.style}`} className="w-full h-full object-cover" />
                     <button
                        onClick={() => downloadImage(proposal.moodBoard, `DecoViz_MoodBoard_${proposal.style}.jpg`)}
                        className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-lg text-gray-700 hover:bg-white hover:text-[#9966FF] transition-all shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        title="Descargar Mood Board"
                     >
                        <DownloadIcon className="w-5 h-5"/>
                     </button>
                </div>
            </div>

            <div className={cardClasses}>
                <h3 className="font-bold text-lg text-gray-800 mb-3">Paleta de Colores</h3>
                <div className="flex flex-wrap gap-3">
                    {proposal.colorPalette && proposal.colorPalette.length > 0 ? (
                        proposal.colorPalette.map((color, index) => (
                            <div
                                key={index}
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                                aria-label={`Color ${color}`}
                            ></div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No disponible.</p>
                    )}
                </div>
            </div>

            <div className={cardClasses}>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Objetos Clave Utilizados</h3>
                {(proposal.objectsUsed || '').trim() !== '' ? (
                    <ul className="text-gray-700 text-sm list-disc pl-5 space-y-2 marker:text-[#A05EEA]">
                        {(proposal.objectsUsed || '').split('\n').filter(item => item.trim() !== '').map((item, index) => (
                            <li key={index}>{item.trim()}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">No hay objetos clave utilizados disponibles.</p>
                )}
            </div>

            <div className={`${cardClasses} flex-grow`}>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Sugerencias de Mobiliario y Decoración</h3>
                {(proposal.furnitureRecommendation || '').trim() !== '' ? (
                    <ul className="text-gray-700 text-sm list-disc pl-5 space-y-2 marker:text-[#A05EEA]">
                        {(proposal.furnitureRecommendation || '').split('\n').filter(item => item.trim() !== '').map((item, index) => (
                            <li key={index}>{item.trim()}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">No hay sugerencias de mobiliario disponibles.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RefinementView;