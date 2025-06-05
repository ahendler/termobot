import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LetterButton } from "./LetterButton";
import { LetterStatus } from "@/hooks/useTermoBot";

interface AddGuessFormProps {
  currentGuess: string;
  handleGuessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatuses: LetterStatus[];
  toggleLetterStatus: (index: number) => void;
  addGuess: () => void;
  getLetterColor: (status: LetterStatus) => string;
  wordMapping: Record<string, string>;
}

export function AddGuessForm({
  currentGuess,
  handleGuessChange,
  selectedStatuses,
  toggleLetterStatus,
  addGuess,
  getLetterColor,
  wordMapping,
}: AddGuessFormProps) {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Adicionar Palpite</CardTitle>
        <CardDescription>Digite seu palpite de 5 letras e marque o feedback que você recebeu</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="guess">Seu Palpite (5 letras)</Label>
            <Input
              id="guess"
              value={currentGuess}
              onChange={handleGuessChange}
              placeholder="Digite uma palavra de 5 letras"
              className="uppercase"
              maxLength={5}
            />
          </div>

          {currentGuess.length === 5 && (
            <div className="space-y-2">
              <Label>Clique em cada letra para alterar seu status</Label>
              <div className="flex justify-center gap-1 sm:gap-2">
                {currentGuess.split("").map((letter, index) => {
                  // Try to find accented version of the guess
                  const normalizedGuess = currentGuess.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  const accentedWord = wordMapping[normalizedGuess];
                  // Use accented letter if available, otherwise use the original
                  const displayLetter = accentedWord && index < accentedWord.length ? accentedWord[index] : letter;

                  return (
                    <LetterButton
                      key={index}
                      letter={letter}
                      displayLetter={displayLetter}
                      status={selectedStatuses[index]}
                      index={index}
                      onClick={toggleLetterStatus}
                      getLetterColor={getLetterColor}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                  <span>Correto</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                  <span>Presente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 rounded-full"></div>
                  <span>Ausente</span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={addGuess} disabled={currentGuess.length !== 5} className="w-full">
            Adicionar Palpite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}