

import React, { useState, useEffect } from 'react';

const messages = [
  "Analizando la estructura de tu espacio...",
  "Consultando a nuestros diseñadores virtuales...",
  "Generando paletas de colores...",
  "Buscando mobiliario adecuado...",
  "Aplicando retoques finales...",
  "Finalizando opciones para vos..."
];

const LoadingIndicator: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#D0BFFF]"></div>
            <h2 className="text-2xl font-semibold text-gray-700 mt-8">Estamos diseñando tu nuevo espacio</h2>
            <p className="text-gray-500 mt-2 transition-opacity duration-500">{messages[messageIndex]}</p>
        </div>
    );
};

export default LoadingIndicator;