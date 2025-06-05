import { answers, guessable } from "@/lib/words";
import { useEffect, useState } from "react";

export type LetterStatus = "correct" | "existSomewhereElse" | "absent" | "trueAbsent";

export interface TermoGuess {
    word: string;
    statuses: LetterStatus[];
}
export type TermoGuesses = TermoGuess[];

export function useTermoGame() {
    const daysSinceStart = Math.floor((Date.now() - new Date("2022-01-02T00:00:00-03:00").getTime()) / 86400000);
    const todaysWord = answers[daysSinceStart % answers.length];
    
    // TermoGuesses and statuses of the letters in the guesses
    const [TermoGuesses, setTermoGuesses] = useState<TermoGuesses>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [gameCompleted, setGameCompleted] = useState<boolean>(false);
    const [gameLost, setGameLost] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [invalidGuess, setInvalidGuess] = useState<boolean>(false);
    
    const maxAttempts = 6;

    // Handle keyboard input - only when the game is active
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameCompleted || gameLost) return;
            
            // Allow only alphabet keys for letter input
            if (e.key.match(/^[a-zA-Z]$/) && currentGuess.length < 5) {
                setCurrentGuess(prev => prev + e.key.toLowerCase());
                // Reset invalid guess state when typing a new word
                if (invalidGuess) {
                    setInvalidGuess(false);
                }
            }
            // Handle backspace
            else if (e.key === "Backspace" && currentGuess.length > 0) {
                setCurrentGuess(prev => prev.slice(0, -1));
                // Reset invalid guess state when deleting
                if (invalidGuess) {
                    setInvalidGuess(false);
                }
            }
            // Handle enter key for submission
            else if (e.key === "Enter" && currentGuess.length === 5) {
                submitGuess();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentGuess, gameCompleted, gameLost, isActive, invalidGuess]);

    // Check game state after each guess
    useEffect(() => {
        // Check for win condition
        if (TermoGuesses.length > 0) {
            const lastGuess = TermoGuesses[TermoGuesses.length - 1];
            if (lastGuess.word === todaysWord) {
                setGameCompleted(true);
            } else if (TermoGuesses.length >= maxAttempts) {
                setGameLost(true);
            }
        }
    }, [TermoGuesses]);

    const submitGuess = () => {
        if (currentGuess.length !== 5) return;
        
        // Check if the word is valid (guessable)
        if (!isGuessable(currentGuess)) {
            setInvalidGuess(true);
            return;
        }
        
        addTermoGuess(currentGuess);
        setCurrentGuess("");
    };

    const addTermoGuess = (word: string) => {
        const todaysWordLetterCount = todaysWord.split("").reduce((acc, letter) => {
            acc[letter] = (acc[letter] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        // First pass: mark correct letters
        const newGuess: TermoGuess = {
            word,
            statuses: Array(5).fill("absent")
        };
        
        for (let i = 0; i < word.length; i++) {
            if (word[i] === todaysWord[i]) {
                newGuess.statuses[i] = "correct";
                todaysWordLetterCount[word[i]]--;
            }
        }
        
        // Second pass: mark letters in wrong positions
        for (let i = 0; i < word.length; i++) {
            if (newGuess.statuses[i] !== "correct" && 
                todaysWord.includes(word[i]) && 
                todaysWordLetterCount[word[i]] > 0) {
                newGuess.statuses[i] = "existSomewhereElse";
                todaysWordLetterCount[word[i]]--;
            }
        }
        
        setTermoGuesses([...TermoGuesses, newGuess]);
    }

    const resetGame = () => {
        setTermoGuesses([]);
        setCurrentGuess("");
        setGameCompleted(false);
        setGameLost(false);
        setInvalidGuess(false);
    };

    const getLetterColor = (status: LetterStatus): string => {
        switch (status) {
            case "correct":
                return "bg-green-500 text-white";
            case "existSomewhereElse":
                return "bg-yellow-500 text-white";
            default:
                return "bg-gray-500 text-white dark:bg-gray-700";
        }
    }

    const isGuessable = (word: string): boolean => {
        return guessable.includes(word) || answers.includes(word);
    }
    
    return {
        todaysWord,
        TermoGuesses,
        currentGuess,
        gameCompleted,
        gameLost,
        invalidGuess,
        setTermoGuesses,
        addTermoGuess,
        resetGame,
        getLetterColor,
        setIsActive,
        isGuessable
    };
}