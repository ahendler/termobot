import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PossibleSolutionsProps {
  possibleSolutions: string[];
  wordMapping: Record<string, string>;
  selectWord: (normalizedWord: string) => void;
  isSolved: boolean;
  useAllWords: boolean;
  toggleWordList: () => void;
}

export function PossibleSolutions({
  possibleSolutions,
  wordMapping,
  selectWord,
  isSolved,
  useAllWords,
  toggleWordList,
}: PossibleSolutionsProps) {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          Soluções Possíveis ({possibleSolutions.length})
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                type="button"
                aria-label="Informações sobre soluções possíveis"
              >
                ?
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs p-3">
              <div className="space-y-4">
                <p>O jogo term.ooo não considera todas as palavras de cinco letras do português como soluções possíveis. O conjunto de palavras aceitas é maior do que o conjunto de palavras que podem ser soluções.</p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="word-mode" className="text-sm">
                    {useAllWords ? "Usando todas as palavras" : "Usando apenas possíveis respostas"}
                  </Label>
                  <Switch
                    id="word-mode"
                    checked={useAllWords}
                    onCheckedChange={toggleWordList}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {useAllWords
                    ? "Incluindo palavras que são aceitas como palpites, mas não podem ser a solução."
                    : "Mostrando apenas palavras que podem ser a solução do dia."}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
        <CardDescription>
          {possibleSolutions.length === 0
            ? "Nenhuma solução encontrada. Tente remover ou ajustar seus palpites."
            : possibleSolutions.length === 1
              ? "Há apenas uma única solução possível."
              : possibleSolutions.length > 100
                ? "Adicione mais palpites para reduzir as soluções."
                : "Clique em uma palavra para usá-la como próximo palpite."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="max-h-60 overflow-y-auto">
          <div className={`grid ${possibleSolutions.length === 1 ? 'place-items-center' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} gap-2`}>
            {possibleSolutions.slice(0, 100).map((normalizedWord, index) => (
              <div
                key={index}
                className={`${possibleSolutions.length === 1
                  ? 'bg-green-100 dark:bg-green-900 p-4 text-green-700 dark:text-green-300 text-2xl font-bold'
                  : 'bg-gray-100 dark:bg-gray-700 p-2 text-black dark:text-white text-xs sm:text-sm'
                  } text-center rounded uppercase cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden text-ellipsis`}
                onClick={() => !isSolved && selectWord(normalizedWord)}
              >
                {wordMapping[normalizedWord] || normalizedWord}
              </div>
            ))}
            {possibleSolutions.length > 100 && (
              <div className="col-span-full text-center text-gray-500 mt-2 text-sm">
                ...e mais {possibleSolutions.length - 100}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}