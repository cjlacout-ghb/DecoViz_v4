

import React from 'react';

export const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8 text-gray-500"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

export const XMarkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const HouseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12m-4.5 9V12.75a2.25 2.25 0 0 0-2.25-2.25H15a2.25 2.25 0 0 0-2.25 2.25V21m-4.5 0V12.75a2.25 2.25 0 0 0-2.25-2.25H9a2.25 2.25 0 0 0-2.25 2.25V21" />
  </svg>
);

// FIX: Corrected the HeaderLogo component by removing the incorrect XML content
// and ensuring the `src` attribute only contains the base64 image data.
export const HeaderLogo = () => (
  <img 
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACvklEQVR4nO2Zv24UQRHHfw5I9Ak4Q1kQdY0UvDBCxISFhESKiGj4BwT8kCghE/QJkI+wEhIfIJFqNRYaXEQDQRQYEQh4LgEJCJIEQj34FvY543d3b7v7230gD5DddnZ2tmt22p3u2ZkE9n/f55vV6e/Z2dnZ7u7uRkNDQ89FhYUXJklyeXl5a9fX14+kEgn0u6nxeLy8vr7+r729vXs1NTX57+np6W8ymczW0tLir6urq9+2t7e/Sj+f+91u95Xw488H+/0+8/n8Xq/Xa7t+f39/g/n8/lX/fr/v7d3d3X+yv7//P/z6+roFAoGAn8/n/71e7/s/Pz+/f3x8fH3W1tbu1dXVF0qlUv6n/X4/Pz8/P/Hl5eXv3N3d/ZzX6/X+zcnJyS+rqqqqn3V1dfX5/Pz8R+l/T6fT/S+Wl5e/tLS0tLzX6/X+y8jI+D9hYGAA8vPz8z8/Pz9/ycnJCSqVSoVut9t5ycnJf0qlUqHdbvd1UFCQO2FhYX7k5OTkXygUCpXdbvf5uLm5+f9LS0tLL+Pj4/NXV1fXP+vr62/j4+PjS0NDQ1NTU/OXLl1a7t+/f/8qfX19/QMDAwM/Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+
"
  />
);
