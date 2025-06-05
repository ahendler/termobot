import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GameStatusCardProps {
  isSolved: boolean;
  isFailed: boolean;
  possibleSolutions: string[];
  wordMapping: Record<string, string>;
  resetGame: () => void;
}

export function GameStatusCard({
  isSolved,
  isFailed,
  possibleSolutions,
  wordMapping,
  resetGame,
}: GameStatusCardProps) {
  if (!isSolved && !isFailed) return null;

  if (isSolved) {
    return (
      <Card className="border-green-500 overflow-hidden">
        <CardHeader className="bg-green-50 dark:bg-green-950 px-4 sm:px-6">
          <CardTitle className="text-green-700 dark:text-green-300">Última palavra restante</CardTitle>
          <CardDescription>Baseado nos seus palpites, só há uma possibilidade</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4">
              <span className="text-2xl sm:text-3xl font-bold uppercase text-green-700 dark:text-green-300">
                {wordMapping[possibleSolutions[0]] || possibleSolutions[0]}
              </span>
            </div>
            <Button onClick={resetGame} className="mt-4">
              Excluir Todos os Palpites
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFailed) {
    return (
      <Card className="border-red-500 overflow-hidden">
        <CardHeader className="bg-red-50 dark:bg-red-950 px-4 sm:px-6">
          <CardTitle className="text-red-700 dark:text-red-300">Acabaram as Palavras</CardTitle>
          <CardDescription>Não foi possível encontrar uma palavra que corresponda a todas as dicas.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-center mb-4">Verifique se não houve algum erro ao marcar as letras.</p>
            <Button onClick={resetGame} className="mt-2">
              Recomeçar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}