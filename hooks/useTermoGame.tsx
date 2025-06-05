import { answers } from "@/lib/words";
import { useState } from "react";

export type LetterStatus = "correct" | "existSomewhereElse" | "absent" | "trueAbsent";

export interface TermoGuess {
    word: string;
    statuses: LetterStatus[];
}
export type TermoGuesses = TermoGuess[];

export function useTermoGame() {

    const todaysseed = Buffer.from(
       new Date().toISOString().slice(0, 10)
    ).toString("base64");
    const todaysHashNumber = Array.from(todaysseed)
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const todaysWord = answers[todaysHashNumber % answers.length];
    
    // TermoGuesses and statuses of the letters in the guesses
    
    const [TermoGuesses, setTermoGuesses] = useState<TermoGuesses>([]);

    const addTermoGuess = (word: string) => {
        const todaysWordLetterCount = todaysWord.split("").reduce((acc, letter) => {
            acc[letter] = (acc[letter] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        TermoGuesses.push({
            word,
            statuses: Array.from({ length: word.length }, () => "absent"),
        });
        for (let i = 0; i < word.length; i++) {
            if (word[i] === todaysWord[i]) {
                TermoGuesses[TermoGuesses.length - 1].statuses[i] = "correct";
            }
            else if (todaysWord.includes(word[i]) && todaysWordLetterCount[word[i]] > 0) {
                TermoGuesses[TermoGuesses.length - 1].statuses[i] = "existSomewhereElse";
                todaysWordLetterCount[word[i]]--;
            }
        }
        setTermoGuesses([...TermoGuesses]);
    }

    const getLetterColor = (status: LetterStatus): string => {
        switch (status) {
            case "correct":
                return "bg-green-500 text-white";
            case "existSomewhereElse":
                return "bg-yellow-500 text-white";
            default:
                return "bg-gray-300 text-gray-700";
        }
    }
    
    return {
        todaysWord,
        TermoGuesses,
        setTermoGuesses,
        addTermoGuess,
        getLetterColor
    };
}