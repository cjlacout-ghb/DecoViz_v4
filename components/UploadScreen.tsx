
import React, { useState, useCallback } from 'react';
import { UploadIcon, XMarkIcon } from './icons';

interface UploadScreenProps {
  onAnalyze: (file: File, instructions: string) => void;
  setError: (message: string | null) => void; // New prop for setting global error
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onAnalyze, setError }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setError(null); // Clear any previous error when a valid file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Por favor, seleccioná un archivo de imagen válido (JPG, PNG, WebP)."); // Use setError
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  }, [handleDragEvents]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  }, [handleDragEvents]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleDragEvents]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFileChange(e.target.files[0])
      }
  }

  const handleSubmit = () => {
    if (image) {
      setError(null); // Clear previous errors before analysis
      onAnalyze(image, instructions);
    } else {
      setError("Por favor, subí una imagen antes de analizar."); // Use setError
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setError(null); // Clear any errors related to the removed image
  };


  return (
    <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Transforma tu espacio en un click</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Subí una foto de un ambiente. DecoViz la analiza y genera tres propuestas de rediseño profesional en estilo Moderno, Escandinavo e Industrial.
        </p>
      </div>

      {/* Removed local error display, now handled by global error in App.tsx */}

      <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragEvents}
          onDrop={handleDrop}
          className={`relative w-full border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-[#D0BFFF] bg-violet-50' : 'border-gray-300'}`}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute w-full h-full opacity-0 cursor-pointer"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleInputChange}
          />
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-64 object-contain rounded-xl" />
              <button 
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-all shadow-md"
                aria-label="Remove image"
              >
                  <XMarkIcon className="w-5 h-5"/>
              </button>
            </>
          ) : (
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center h-64 cursor-pointer p-4">
              <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-semibold">
                <span className="text-[#9966FF]">Haz clic para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, o WebP</p>
            </label>
          )}
        </div>

        <div className="mt-4">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Descripción opcional (ej: 'quiero un ambiente más luminoso')"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D0BFFF] focus:border-transparent transition-shadow"
            rows={2}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!image}
          className="mt-6 w-full bg-[#A05EEA] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
        >
          Analizar Espacio
        </button>
      </div>
    </div>
  );
};

export default UploadScreen;
