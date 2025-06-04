import { useState, useMemo, useEffect } from "react";
import { answers, guessable } from "@/lib/words";

export type LetterStatus = "correct" | "existSomewhereElse" | "absent" | "trueAbsent";

export interface Guess {
  word: string;
  statuses: LetterStatus[];
}

export function useTermoGame() {
  const allWords = useMemo(() => [...answers, ...guessable], []);
  const [useAllWords, setUseAllWords] = useState<boolean>(false);

  const wordMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    const wordList = useAllWords ? allWords : answers;
    wordList.forEach(word => {
      const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      mapping[normalized] = word;
    });
    return mapping;
  }, [useAllWords, allWords]);

  const normalizedWords = useMemo(() => {
    return Object.keys(wordMapping);
  }, [wordMapping]);

  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>(normalizedWords);
  const [selectedStatuses, setSelectedStatuses] = useState<LetterStatus[]>(Array(5).fill("absent"));

  const filterByGuess = (wordList: string[], guess: Guess) => {
    return wordList.filter((word) => {
      // Performs simple checks
      for (let i = 0; i < 5; i++) {
        const status = guess.statuses[i];
        const guessLetter = guess.word[i];
        const wordHasGuessLetter = word.includes(guessLetter);

        if (status === "absent" && word[i] === guessLetter) {
          return false;
        }
        if (status === "correct" && word[i] !== guessLetter) {
          return false;
        }
        if (status === "existSomewhereElse" && (word[i] === guessLetter || !wordHasGuessLetter)) {
          return false;
        }
        if (status === "trueAbsent" && wordHasGuessLetter) {
          return false;
        }
      }
      // Check for excessive letters
      const guessLetterPresentCounts = guess.word.split("").reduce((acc, letter, index) => {
        const status = guess.statuses[index];
        if (status === "correct" || status === "existSomewhereElse") {
          acc[letter] = (acc[letter] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const guessLetterCounts = guess.word.split("").reduce((acc, letter) => {
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const wordLetterCounts = word.split("").reduce((acc, letter) => {
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Check if the word has enough letters to match the guess
      for (const letter in guessLetterPresentCounts) {
        if ((wordLetterCounts[letter] || 0) < guessLetterPresentCounts[letter]) {
          return false;
        }
      }

      // Check if word has more letters than the guess can handle
      for (const letter in guessLetterPresentCounts) {
        if (guessLetterPresentCounts[letter] < guessLetterCounts[letter]) {
          if ((wordLetterCounts[letter] || 0) > guessLetterPresentCounts[letter]) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Update possible solutions when word list changes
  useEffect(() => {
    if (guesses.length === 0) {
      setPossibleSolutions(normalizedWords);
    } else {
      let filtered = [...normalizedWords];
      for (const guess of guesses) {
        filtered = filterByGuess(filtered, guess);
      }
      setPossibleSolutions(filtered);
    }
  }, [normalizedWords, guesses]);

  // Toggle between using all words and just answers
  const toggleWordList = () => {
    setUseAllWords(!useAllWords);
  };

  const getPrefilledStatuses = (normalizedGuess: string) => {
    const newSelectedStatuses = Array(5).fill("absent") as LetterStatus[];

    for (let i = 0; i < 5; i++) {
      const currentLetter = normalizedGuess[i];

      const correctAtSamePosition = guesses.some(
        guess => guess.word[i] === currentLetter && guess.statuses[i] === "correct"
      );

      if (correctAtSamePosition) {
        newSelectedStatuses[i] = "correct";
        continue;
      }

      const existsSomewhereElse = guesses.some(
        guess => guess.word[i] === currentLetter && guess.statuses[i] === "existSomewhereElse"
      );
      if (existsSomewhereElse) {
        newSelectedStatuses[i] = "existSomewhereElse";
      }
    }

    return newSelectedStatuses;
  };

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (/^[a-záàâãéèêíïóôõöúçñ]*$/i.test(value) && value.length <= 5) {
      setCurrentGuess(value);

      if (value.length !== currentGuess.length) {
        // When the length changes, update the selected statuses based on previous guesses
        if (value.length === 5) {
          const normalizedNewGuess = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          setSelectedStatuses(getPrefilledStatuses(normalizedNewGuess));
        } else {
          setSelectedStatuses(Array(5).fill("absent") as LetterStatus[]);
        }
      }
    }
  };

  const toggleLetterStatus = (index: number) => {
    const statuses: LetterStatus[] = ["absent", "correct", "existSomewhereElse"];
    const currentStatus = selectedStatuses[index];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;

    const newSelectedStatuses = [...selectedStatuses];
    newSelectedStatuses[index] = statuses[nextIndex];
    setSelectedStatuses(newSelectedStatuses);
  };

  const addGuess = () => {
    if (currentGuess.length !== 5) return;
    const normalizedGuess = currentGuess.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Replace the status of a letter to trueAbsent if all occurrences of that letter on the word are marked as absent
    const selectedStatusesSpread = [...selectedStatuses];
    // Check for trueAbsent status
    for (let i = 0; i < 5; i++) {
      const letter = normalizedGuess[i];
      const letterCount = normalizedGuess.split(letter).length - 1;
      const absentCount = selectedStatusesSpread.filter(
        (status, index) => status === "absent" && normalizedGuess[index] === letter
      ).length;
      if (absentCount === letterCount) {
        selectedStatusesSpread[i] = "trueAbsent";
      } else if (selectedStatusesSpread[i] === "trueAbsent") {
        selectedStatusesSpread[i] = "absent"; // Reset to absent if not all occurrences are marked
      }
    }

    const newGuess = {
      word: normalizedGuess,
      statuses: selectedStatusesSpread
    };
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);

    const filtered = filterByGuess(possibleSolutions, newGuess);
    setPossibleSolutions(filtered);

    setCurrentGuess("");
    setSelectedStatuses(Array(5).fill("absent") as LetterStatus[]);
  };

  const removeGuess = (index: number) => {
    const updatedGuesses = guesses.filter((_, i) => i !== index);
    setGuesses(updatedGuesses);

    let filtered = [...normalizedWords];
    for (const guess of updatedGuesses) {
      filtered = filterByGuess(filtered, guess);
    }
    setPossibleSolutions(filtered);
  };

  const resetGame = () => {
    setGuesses([]);
    setPossibleSolutions(normalizedWords);
  };

  const getLetterColor = (status: LetterStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white";
      case "existSomewhereElse":
        return "bg-yellow-500 text-white";
      case "absent":
      case "trueAbsent":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const selectWord = (normalizedWord: string) => {
    // Get the accented version if available
    const wordToUse = wordMapping[normalizedWord] || normalizedWord;
    setCurrentGuess(wordToUse);

    // Pre-fill statuses based on previous guesses
    setSelectedStatuses(getPrefilledStatuses(normalizedWord));
  };

  // Helper function to determine if the game is solved
  const isSolved = useMemo(() => {
    return possibleSolutions.length === 1 && guesses.length > 0;
  }, [possibleSolutions, guesses]);

  // Helper function to determine if the game is in a failed state
  const isFailed = useMemo(() => {
    return possibleSolutions.length === 0 && guesses.length > 0;
  }, [possibleSolutions, guesses]);

  return {
    currentGuess,
    setCurrentGuess,
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
  };
}