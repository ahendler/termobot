import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Guess, LetterStatus } from "@/hooks/useTermoGame";

interface GuessHistoryListProps {
  guesses: Guess[];
  removeGuess: (index: number) => void;
  getLetterColor: (status: LetterStatus) => string;
  wordMapping: Record<string, string>;
}

export function GuessHistoryList({
  guesses,
  removeGuess,
  getLetterColor,
  wordMapping,
}: GuessHistoryListProps) {
  if (guesses.length === 0) return null;
  
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Seus Palpites</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-2 overflow-x-auto pb-2">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} className="flex items-center gap-2 min-w-max">
              <div className="flex gap-1">
                {guess.word.split("").map((letter, letterIndex) => {
                  // Find the accented version of the letter if it exists
                  const currentWord = wordMapping[guess.word] || guess.word;
                  const displayLetter = currentWord[letterIndex] || letter;

                  return (
                    <div
                      key={letterIndex}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-bold uppercase ${getLetterColor(guess.statuses[letterIndex])}`}
                    >
                      {displayLetter}
                    </div>
                  );
                })}
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeGuess(guessIndex)} className="ml-1 sm:ml-2">
                Remover
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}