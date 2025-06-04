import React from "react";
import { Button } from "@/components/ui/button";
import { LetterStatus } from "@/hooks/useTermoGame";

interface LetterButtonProps {
  letter: string;
  displayLetter: string;
  status: LetterStatus;
  index: number;
  onClick: (index: number) => void;
  getLetterColor: (status: LetterStatus) => string;
}

export function LetterButton({
  letter,
  displayLetter,
  status,
  index,
  onClick,
  getLetterColor,
}: LetterButtonProps) {
  const colorClass = getLetterColor(status);
  
  return (
    <Button
      type="button"
      className={`w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold uppercase ${colorClass} hover:${colorClass}`}
      onClick={() => onClick(index)}
    >
      {displayLetter}
    </Button>
  );
}