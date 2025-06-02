"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { answers, guessable } from "@/lib/words"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"


type LetterStatus = "correct" | "existSomewhereElse" | "absent" | "trueAbsent"

export default function TermoBot() {
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

  const [currentGuess, setCurrentGuess] = useState<string>("")
  const [guesses, setGuesses] = useState<Array<{ word: string; statuses: LetterStatus[] }>>([])
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>(normalizedWords)
  const [selectedStatuses, setSelectedStatuses] = useState<LetterStatus[]>(Array(5).fill("absent"))

  const filterByGuess = (wordList: string[], guess: { word: string; statuses: LetterStatus[] }) => {
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

      return true
    });
  }

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
  }, [normalizedWords, guesses]);  // Added guesses as a dependency

  // Toggle between using all words and just answers
  const toggleWordList = () => {
    setUseAllWords(!useAllWords);
  };


  const getPrefilledStatuses = (normalizedGuess: string) => {
    const newSelectedStatuses = Array(5).fill("absent");

    for (let i = 0; i < 5; i++) {
      const currentLetter = normalizedGuess[i];

      const correctAtSamePosition = guesses.some(guess =>
        guess.word[i] === currentLetter && guess.statuses[i] === "correct"
      );

      if (correctAtSamePosition) {
        newSelectedStatuses[i] = "correct";
        continue;
      }

      const existsSomewhereElse = guesses.some(guess =>
        guess.word[i] === currentLetter && guess.statuses[i] === "existSomewhereElse"
      );
      if (existsSomewhereElse) {
        newSelectedStatuses[i] = "existSomewhereElse";
      }
    }

    return newSelectedStatuses;
  };

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    if (/^[a-záàâãéèêíïóôõöúçñ]*$/i.test(value) && value.length <= 5) {
      setCurrentGuess(value)

      if (value.length !== currentGuess.length) {
        // When the length changes, update the selected statuses based on previous guesses
        if (value.length === 5) {
          const normalizedNewGuess = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          setSelectedStatuses(getPrefilledStatuses(normalizedNewGuess));
        } else {
          setSelectedStatuses(Array(5).fill("absent"));
        }
      }
    }
  }

  const toggleLetterStatus = (index: number) => {
    const statuses: LetterStatus[] = ["absent", "correct", "existSomewhereElse"]
    const currentStatus = selectedStatuses[index]
    const currentIndex = statuses.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statuses.length

    const newSelectedStatuses = [...selectedStatuses]
    newSelectedStatuses[index] = statuses[nextIndex]
    setSelectedStatuses(newSelectedStatuses)
  }

  const addGuess = () => {
    if (currentGuess.length !== 5) return
    const normalizedGuess = currentGuess.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Replace the status of a letter to trueAbsent if all occurrences of that letter on the word are marked as absent
    const selectedStatusesSpread = [...selectedStatuses]
    // Check for trueAbsent status
    for (let i = 0; i < 5; i++) {
      const letter = normalizedGuess[i]
      const letterCount = normalizedGuess.split(letter).length - 1
      const absentCount = selectedStatusesSpread.filter((status, index) => status === "absent" && normalizedGuess[index] === letter).length
      if (absentCount === letterCount) {
        selectedStatusesSpread[i] = "trueAbsent"
      } else if (selectedStatusesSpread[i] === "trueAbsent") {
        selectedStatusesSpread[i] = "absent" // Reset to absent if not all occurrences are marked
      }
    }


    const newGuess = {
      word: normalizedGuess,
      statuses: selectedStatusesSpread as LetterStatus[]
    }
    const updatedGuesses = [...guesses, newGuess]
    setGuesses(updatedGuesses)

    const filtered = filterByGuess(possibleSolutions, newGuess)
    setPossibleSolutions(filtered)

    setCurrentGuess("")
    setSelectedStatuses(Array(5).fill("absent"))
  }

  const removeGuess = (index: number) => {
    const updatedGuesses = guesses.filter((_, i) => i !== index)
    setGuesses(updatedGuesses)

    let filtered = [...normalizedWords]
    for (const guess of updatedGuesses) {
      filtered = filterByGuess(filtered, guess)
    }
    setPossibleSolutions(filtered)
  }

  const getLetterColor = (status: LetterStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white"
      case "existSomewhereElse":
        return "bg-yellow-500 text-white"
      case "absent":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const selectWord = (normalizedWord: string) => {
    // Get the accented version if available
    const wordToUse = wordMapping[normalizedWord] || normalizedWord;
    setCurrentGuess(wordToUse);

    // Pre-fill statuses based on previous guesses
    setSelectedStatuses(getPrefilledStatuses(normalizedWord));
  }

  // Helper function to determine if the game is solved
  const isSolved = useMemo(() => {
    return possibleSolutions.length === 1 && guesses.length > 0;
  }, [possibleSolutions, guesses]);

  // Helper function to determine if the game is in a failed state
  const isFailed = useMemo(() => {
    return possibleSolutions.length === 0 && guesses.length > 0;
  }, [possibleSolutions, guesses]);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">TERMOBOT</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 text-sm sm:text-base">
          Buscador de palavras para o jogo <a href="https://term.ooo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Termo</a>
        </p>
      </div>

      <div className="grid gap-8">
        {!isSolved && !isFailed && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Palpite</CardTitle>
              <CardDescription>Digite seu palpite de 5 letras e marque o feedback que você recebeu</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className="flex justify-center gap-2">
                      {currentGuess.split("").map((letter, index) => {
                        // Try to find accented version of the guess
                        const normalizedGuess = currentGuess.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const accentedWord = wordMapping[normalizedGuess];
                        // Use accented letter if available, otherwise use the original
                        const displayLetter = accentedWord && index < accentedWord.length ? accentedWord[index] : letter;

                        return (
                          <Button
                            key={index}
                            type="button"
                            className={`w-12 h-12 text-xl font-bold uppercase ${getLetterColor(selectedStatuses[index])} hover:${getLetterColor(selectedStatuses[index])}`}
                            onClick={() => toggleLetterStatus(index)}
                          >
                            {displayLetter}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Correto</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span>Presente</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
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
        )}

        {isSolved && (
          <Card className="border-green-500 overflow-hidden">
            <CardHeader className="bg-green-50 dark:bg-green-950">
              <CardTitle className="text-green-700 dark:text-green-300">Última palavra restante</CardTitle>
              <CardDescription>Baseado nos seus palpites, só há uma possibilidade</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4">
                  <span className="text-3xl font-bold uppercase text-green-700 dark:text-green-300">
                    {wordMapping[possibleSolutions[0]] || possibleSolutions[0]}
                  </span>
                </div>
                <Button onClick={() => {
                  setGuesses([]);
                  setPossibleSolutions(normalizedWords);
                }} className="mt-4">
                  Excluir Todos os Palpites
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isFailed && (
          <Card className="border-red-500 overflow-hidden">
            <CardHeader className="bg-red-50 dark:bg-red-950">
              <CardTitle className="text-red-700 dark:text-red-300">Acabaram as Palavras</CardTitle>
              <CardDescription>Não foi possível encontrar uma palavra que corresponda a todas as dicas.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-center mb-4">Verifique se não houve algum erro ao marcar as letras.</p>
                <Button onClick={() => {
                  setGuesses([]);
                  setPossibleSolutions(normalizedWords);
                }} className="mt-2">
                  Recomeçar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {guesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Seus Palpites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guesses.map((guess, guessIndex) => (
                  <div key={guessIndex} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {guess.word.split("").map((letter, letterIndex) => {
                        // Find the accented version of the letter if it exists
                        const currentWord = wordMapping[guess.word] || guess.word;
                        const displayLetter = currentWord[letterIndex] || letter;

                        return (
                          <div
                            key={letterIndex}
                            className={`w-10 h-10 flex items-center justify-center text-lg font-bold uppercase ${getLetterColor(guess.statuses[letterIndex])}`}
                          >
                            {displayLetter}
                          </div>
                        );
                      })}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeGuess(guessIndex)} className="ml-2">
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {guesses.length > 0 && (
          <Card>
            <CardHeader>
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
            <CardContent>
              <div className="max-h-60 overflow-y-auto">
                <div className={`grid ${possibleSolutions.length === 1 ? 'place-items-center' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'} gap-2`}>
                  {possibleSolutions.slice(0, 100).map((normalizedWord, index) => (
                    <div
                      key={index}
                      className={`${possibleSolutions.length === 1
                        ? 'bg-green-100 dark:bg-green-900 p-4 text-green-700 dark:text-green-300 text-2xl font-bold'
                        : 'bg-gray-100 dark:bg-gray-700 p-2 text-black dark:text-white'
                        } text-center rounded uppercase cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                      onClick={() => !isSolved && selectWord(normalizedWord)}
                    >
                      {wordMapping[normalizedWord] || normalizedWord}
                    </div>
                  ))}
                  {possibleSolutions.length > 100 && (
                    <div className="col-span-full text-center text-gray-500 mt-2">
                      ...e mais {possibleSolutions.length - 100}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
