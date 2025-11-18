
import React, { useState, useCallback } from 'react';
import { AppView, Proposal } from './types';
import UploadScreen from './components/UploadScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsDisplay from './components/ResultsDisplay';
import RefinementView from './components/RefinementView';
import { generateInitialProposals, refineProposal, generateNewStyle, extractColorPalette, generateTextContent } from './services/geminiService';
import { HouseIcon, XMarkIcon } from './components/icons'; // Import HouseIcon and XMarkIcon


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  // FIX: State to store detected room type
  const [roomType, setRoomType] = useState<string | null>(null); 
  // State to manage history of selected proposal for undo functionality
  const [proposalHistory, setProposalHistory] = useState<Proposal[]>([]);


  const handleAnalyze = useCallback(async (file: File, instructions: string) => {
    setImageFile(file);
    setCurrentView(AppView.LOADING);
    setError(null); // Clear any previous error

    // Read file to base64 for originalImageBase64
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageBase64((reader.result as string).split(',')[1]); // Store only the base64 part
    };
    reader.readAsDataURL(file);

    try {
      // FIX: Call generateInitialProposals and capture both proposals and roomType
      const [generatedProposals, detectedRoomType] = await generateInitialProposals(file, instructions);
      setProposals(generatedProposals);
      setRoomType(detectedRoomType); // Set the detected room type
      setCurrentView(AppView.RESULTS);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setCurrentView(AppView.UPLOAD);
    }
  }, []);

  const handleSelectProposal = (proposal: Proposal, index: number) => {
    setSelectedProposal(proposal);
    setSelectedProposalIndex(index);
    setProposalHistory([]); // Reset history for a new selection
    setCurrentView(AppView.REFINEMENT);
    setError(null); // Clear any previous error
  };

  const handleRefine = async (instructions: string) => {
    // FIX: Add roomType check
    if (!selectedProposal || !roomType) return; 
    setIsRefining(true);
    setError(null); // Clear any previous error
    try {
      const refinedImage = await refineProposal(selectedProposal.redesignedImage, instructions);

      // --- New Logic to update colors and text content ---
      const [updatedColorPalette, updatedTextContent] = await Promise.all([
        // For refinement, we use the selected proposal's style and the current instructions (which are refinement instructions)
        extractColorPalette(refinedImage, selectedProposal.style),
        // FIX: Pass roomType to generateTextContent
        generateTextContent(refinedImage, selectedProposal.style, roomType, instructions), 
      ]);
      // --- End New Logic ---

      const updatedProposal = {
        ...selectedProposal,
        redesignedImage: refinedImage,
        colorPalette: updatedColorPalette, // Update color palette
        description: updatedTextContent.description, // Update description
        objectsUsed: updatedTextContent.objectsUsed, // Update objectsUsed
        furnitureRecommendation: updatedTextContent.furnitureRecommendation, // Update furnitureRecommendation
      };

      // Before updating selectedProposal, save the current state to history
      setProposalHistory(prev => [...prev, selectedProposal]);
      setSelectedProposal(updatedProposal);

      // Update the main proposals list as well
      setProposals(prevProposals => {
        if (selectedProposalIndex === null) return prevProposals;
        const newProposals = [...prevProposals];
        newProposals[selectedProposalIndex] = updatedProposal;
        return newProposals;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to refine the image or update details.');
    } finally {
      setIsRefining(false);
    }
  };

  // FIX: Added roomTypeForNewStyle parameter
  const handleGenerateNewStyle = async (newStyle: string, roomTypeForNewStyle: string) => {
    // FIX: Check for roomTypeForNewStyle
    if (!imageFile || !roomTypeForNewStyle) return; 
    setIsRefining(true);
    setError(null); // Clear any previous error
    try {
        // When generating a new style, we don't have new specific instructions for it,
        // so we can pass an empty string or consider the newStyle as the instruction itself for text content
        // FIX: Pass roomTypeForNewStyle to generateNewStyle
        const newProposal = await generateNewStyle(imageFile, newStyle, roomTypeForNewStyle);

        // Before updating selectedProposal, save the current state to history
        if (selectedProposal) {
          setProposalHistory(prev => [...prev, selectedProposal]);
        }
        setSelectedProposal(newProposal);

        // Update the main proposals list as well
        setProposals(prevProposals => {
          if (selectedProposalIndex === null) return prevProposals;
          const updatedProposals = [...prevProposals];
          updatedProposals[selectedProposalIndex] = newProposal;
          return updatedProposals;
        });
    } catch (err: any) {
        setError(err.message || `Failed to generate style: ${newStyle}`);
    } finally {
        setIsRefining(false);
    }
  };

  const handleUndo = () => {
    if (proposalHistory.length > 0) {
      const previousProposal = proposalHistory[proposalHistory.length - 1];
      setProposalHistory(prev => prev.slice(0, prev.length - 1)); // Remove the last item from history
      setSelectedProposal(previousProposal); // Revert to the previous proposal

      // Also update the main proposals list
      setProposals(prevProposals => {
        if (selectedProposalIndex === null) return prevProposals;
        const newProposals = [...prevProposals];
        newProposals[selectedProposalIndex] = previousProposal;
        return newProposals;
      });
    }
  };

  const handleBackToResults = () => {
    setSelectedProposal(null);
    setSelectedProposalIndex(null);
    setProposalHistory([]); // Clear history when going back to results
    setCurrentView(AppView.RESULTS);
    setError(null); // Clear any previous error
  };
  
  const handleReset = () => {
    setImageFile(null);
    setOriginalImageBase64(null); // Clear original image on reset
    setProposals([]);
    setSelectedProposal(null);
    setError(null); // Clear any previous error
    setRoomType(null); // Clear room type on reset
    setProposalHistory([]); // Clear history on full reset
    setCurrentView(AppView.UPLOAD);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.UPLOAD:
        return <UploadScreen onAnalyze={handleAnalyze} setError={setError} />;
      case AppView.LOADING:
        return <LoadingIndicator />;
      case AppView.RESULTS:
        return <ResultsDisplay proposals={proposals} onSelect={handleSelectProposal} onReset={handleReset} />;
      case AppView.REFINEMENT:
        return selectedProposal ? (
          <RefinementView 
            proposal={selectedProposal} 
            onBack={handleBackToResults} 
            onRefine={handleRefine}
            onGenerateNewStyle={handleGenerateNewStyle}
            isRefining={isRefining}
            // refinementError={error} // Removed, now handled by global error display
            originalImageBase64={originalImageBase64}
            roomType={roomType} // Pass roomType to RefinementView
            onUndo={handleUndo} // Pass undo handler
            canUndo={proposalHistory.length > 0} // Pass undo capability
          />
        ) : null;
      default:
        return <UploadScreen onAnalyze={handleAnalyze} setError={setError} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#333]">
      <header className="py-4 px-6 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <HouseIcon className="w-8 h-8 text-[#C5A3FF]" /> {/* Changed color to a lighter purple */}
                <h1 className="text-2xl font-bold text-gray-800">DecoViz AI</h1>
            </div>
            {currentView !== AppView.UPLOAD && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#A05EEA] text-white rounded-lg font-semibold hover:bg-[#8A4CE0] transition-colors"
              >
                Empezar de Nuevo
              </button>
            )}
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div
              className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center justify-between shadow-md"
              role="alert"
            >
              <p className="font-medium">Error: {error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 p-1 rounded-full hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="Dismiss error"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
