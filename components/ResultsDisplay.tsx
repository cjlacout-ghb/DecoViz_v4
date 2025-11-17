
import React, { useState } from 'react';
import { Proposal } from '../types';
import { DownloadIcon, SparklesIcon } from './icons';

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: () => void;
}

const downloadImage = (base64Image: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64Image}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      <div className="relative">
        <img src={`data:image/jpeg;base64,${proposal.redesignedImage}`} alt={`Rediseño ${proposal.style}`} className="w-full h-64 object-cover" />
        <div className="absolute top-2 right-2 flex gap-2">
            <button
                onClick={() => downloadImage(proposal.redesignedImage, `DecoViz_Rediseño_${proposal.style}.jpg`)}
                className="p-2 bg-white/80 rounded-lg text-gray-700 hover:bg-white hover:text-[#9966FF] transition-all shadow-md backdrop-blur-sm"
                title="Descargar Imagen"
            >
                <DownloadIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-gray-800">{proposal.style}</h3>
        <p className="mt-2 text-gray-600 text-sm flex-grow">{proposal.description}</p>
        <button
            onClick={onSelect}
            className="mt-6 w-full bg-[#A05EEA] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[#8A4CE0] transition-transform transform hover:scale-105"
        >
            Ver Detalles y Refinar
        </button>
      </div>
    </div>
  );
};


interface ResultsDisplayProps {
  proposals: Proposal[];
  onSelect: (proposal: Proposal, index: number) => void;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ proposals, onSelect, onReset }) => {
  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">No se encontraron propuestas.</h2>
        <button onClick={onReset} className="mt-4 px-6 py-2 bg-[#A05EEA] text-white rounded-lg hover:bg-[#8A4CE0]">
          Inténtalo de nuevo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800">¡Acá tenés tus propuestas!</h2>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Explorá los diferentes estilos que creamos para vos. Seleccioná uno para ver más detalles, la lista de muebles o refinarlo a tu gusto.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {proposals.map((p, index) => (
          <ProposalCard key={p.style} proposal={p} onSelect={() => onSelect(p, index)} />
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;