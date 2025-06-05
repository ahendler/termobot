"use client"

import React from "react";
import { useTermoBot } from "@/hooks/useTermoBot";
import { AddGuessForm } from "@/components/game/AddGuessForm";
import { GuessHistoryList } from "@/components/game/GuessHistoryList";
import { PossibleSolutions } from "@/components/game/PossibleSolutions";
import { GameStatusCard } from "@/components/game/GameStatusCard";

export default function TermoBot() {
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

  return (
    <div className="container max-w-3xl mx-auto py-6 px-3 sm:py-8 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">TERMOBOT</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 text-sm sm:text-base">
          Buscador de palavras para o jogo <a href="https://term.ooo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Termo</a>
        </p>
      </div>

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
    </div>
  );
}
