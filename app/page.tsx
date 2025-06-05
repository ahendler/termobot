"use client"

import React, { useEffect, useRef } from "react";
import { useTermoBot } from "@/hooks/useTermoBot";
import { useTermoGame } from "@/hooks/useTermoGame";
import { AddGuessForm } from "@/components/game/AddGuessForm";
import { GuessHistoryList } from "@/components/game/GuessHistoryList";
import { PossibleSolutions } from "@/components/game/PossibleSolutions";
import { GameStatusCard } from "@/components/game/GameStatusCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TermoBot() {
  const [activeTab, setActiveTab] = React.useState<string>("helper");
  const gameRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentGuess,
    handleGuessChange,
    guesses,
    addGuess,
    removeGuess,
    resetGame,
    possibleSolutions,
    selectedStatuses,
    toggleLetterStatus,
    getLetterColor,
    selectWord,
    wordMapping,
    useAllWords,
    toggleWordList,
    isSolved,
    isFailed,
  } = useTermoBot();

  const {
    todaysWord,
    TermoGuesses,
    currentGuess: termoCurrentGuess,
    gameCompleted,
    gameLost,
    invalidGuess,
    resetGame: resetTermoGame,
    getLetterColor: getTermoLetterColor,
    setIsActive
  } = useTermoGame();

  // Handle tab changes to activate/deactivate game keyboard handling
  useEffect(() => {
    // Activate game keyboard handling only when the game tab is active
    setIsActive(activeTab === "game");
    
    // Focus the game div when the game tab is active
    if (activeTab === "game" && gameRef.current) {
      gameRef.current.focus();
      
      // Also focus the hidden input on mobile
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }
  }, [activeTab, setIsActive]);

  // Add a separate useEffect for focusing the input when the component mounts
  useEffect(() => {
    // Focus the hidden input when the game tab is active
    if (activeTab === "game" && hiddenInputRef.current) {
      // Use a slight delay to ensure DOM is fully rendered
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  // Function to focus the hidden input for mobile keyboards
  const focusHiddenInput = () => {
    if (hiddenInputRef.current && activeTab === "game") {
      hiddenInputRef.current.focus();
    }
  };

  // Handle input changes (to sync with the game's current guess)
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The actual typing is handled by the keyboard event listeners in useTermoGame
    // This is just to prevent the default behavior
  };

  const maxAttempts = 6;

  // Create an array structure for proper top-to-bottom rendering
  const gameRows = [];
  
  // First add completed guesses
  for (let i = 0; i < TermoGuesses.length; i++) {
    gameRows.push({
      type: "completed",
      guess: TermoGuesses[i]
    });
  }
  
  // Add current guess row if game is still active
  if (TermoGuesses.length < maxAttempts && !gameCompleted && !gameLost) {
    gameRows.push({
      type: "current",
      guess: termoCurrentGuess
    });
  }
  
  // Add remaining empty rows
  const remainingRows = maxAttempts - gameRows.length;
  for (let i = 0; i < remainingRows; i++) {
    gameRows.push({
      type: "empty"
    });
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 px-3 sm:py-8 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">TERMOBOT</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 text-sm sm:text-base">
          Buscador de palavras para o jogo <a href="https://term.ooo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Termo</a>
        </p>
      </div>

      <Tabs defaultValue="helper" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="helper">Buscador Termo</TabsTrigger>
          <TabsTrigger value="game">Jogue Termo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="helper" className="mt-0">
          <div className="grid gap-6 sm:gap-8">
            {/* Game status card (success/failure states) */}
            <GameStatusCard
              isSolved={isSolved}
              isFailed={isFailed}
              possibleSolutions={possibleSolutions}
              wordMapping={wordMapping}
              resetGame={resetGame}
            />

            {/* Add guess form */}
            {!isSolved && !isFailed && (
              <AddGuessForm
                currentGuess={currentGuess}
                handleGuessChange={handleGuessChange}
                selectedStatuses={selectedStatuses}
                toggleLetterStatus={toggleLetterStatus}
                addGuess={addGuess}
                getLetterColor={getLetterColor}
                wordMapping={wordMapping}
              />
            )}

            {/* Guesses history list */}
            <GuessHistoryList
              guesses={guesses}
              removeGuess={removeGuess}
              getLetterColor={getLetterColor}
              wordMapping={wordMapping}
            />

            {/* Possible solutions */}
            {guesses.length > 0 && (
              <PossibleSolutions
                possibleSolutions={possibleSolutions}
                wordMapping={wordMapping}
                selectWord={selectWord}
                isSolved={isSolved}
                useAllWords={useAllWords}
                toggleWordList={toggleWordList}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="game" className="mt-0">
          <div 
            ref={gameRef} 
            tabIndex={0} 
            className="outline-none"
            aria-label="Termo game board"
            onClick={focusHiddenInput}
          >
            {/* Hidden input to trigger mobile keyboard */}
            <input
              ref={hiddenInputRef}
              type="text"
              className="opacity-0 h-0 w-0 absolute -z-10"
              aria-hidden="true"
              autoComplete="off"
              value={termoCurrentGuess}
              onChange={handleHiddenInputChange}
              autoFocus={activeTab === "game"}
              inputMode="text"
            />
            
            <Card className="border rounded-lg">
              <div className="flex flex-col space-y-1.5 p-3 px-2 sm:px-2"></div>
              <CardContent className="px-4 sm:px-6">
                {/* Game board - now fills from top to bottom */}
                <div 
                  className="grid grid-cols-5 gap-2 max-w-xs mx-auto mb-6"
                  onClick={focusHiddenInput}
                >
                  {gameRows.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                      {Array(5).fill(0).map((_, col) => {
                        if (row.type === "completed") {
                          // Completed guesses with colors
                          const letter = row.guess.word[col];
                          const status = row.guess.statuses[col];
                          
                          return (
                            <div 
                              key={`cell-${rowIndex}-${col}`} 
                              className={`w-full aspect-square flex items-center justify-center text-lg font-bold
                                ${getTermoLetterColor(status)}`}
                            >
                              {letter ? letter.toUpperCase() : ""}
                            </div>
                          );
                        } else if (row.type === "current") {
                          // Current guess row being typed
                          return (
                            <div 
                              key={`current-cell-${rowIndex}-${col}`} 
                              className={`w-full aspect-square flex items-center justify-center text-lg font-bold border-2 
                                ${invalidGuess ? 'border-red-500 dark:border-red-400' : 
                                  col < row.guess.length ? 'border-blue-500 dark:border-blue-400' : 
                                  'border-gray-300 dark:border-gray-600'}`}
                            >
                              {col < row.guess.length ? row.guess[col].toUpperCase() : ""}
                            </div>
                          );
                        } else {
                          // Empty future rows
                          return (
                            <div 
                              key={`empty-cell-${rowIndex}-${col}`} 
                              className="w-full aspect-square flex items-center justify-center text-lg font-bold border-2 border-gray-300 dark:border-gray-700"
                            ></div>
                          );
                        }
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {/* Game result message */}
                {gameCompleted && (
                  <div className="text-center mb-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                    <h3 className="text-lg font-bold text-green-700 dark:text-green-300">Parabéns!</h3>
                    <p className="text-green-600 dark:text-green-400">
                      Você acertou a palavra em {TermoGuesses.length} {TermoGuesses.length === 1 ? 'tentativa' : 'tentativas'}!
                    </p>
                  </div>
                )}

                {gameLost && (
                  <div className="text-center mb-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">
                      A palavra era: <span className="font-bold">{todaysWord.toUpperCase()}</span>
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-6">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Letra na posição correta</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Letra em outra posição</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Letra ausente</span>
                  </div>
                    <div className="flex items-center gap-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black-500 border-2 border-red-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Palavra não aceita</span>
                    </div>
                </div>
                
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Use seu teclado para jogar. Digite sua palavra de 5 letras e pressione Enter para enviar.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
