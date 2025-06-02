"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { portugueseWords } from "@/lib/words"


type LetterStatus = "correct" | "existSomewhereElse" | "absent" | "trueAbsent"

export default function TermoBot() {
  // Create a mapping of normalized words to original words with accents
  const wordMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    portugueseWords.forEach(word => {
      const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      mapping[normalized] = word;
    });
    return mapping;
  }, []);

  // Create a list of normalized words for processing
  const normalizedWords = useMemo(() => {
    return Object.keys(wordMapping);
  }, [wordMapping]);

  const [currentGuess, setCurrentGuess] = useState<string>("")
  const [guesses, setGuesses] = useState<Array<{ word: string; statuses: LetterStatus[] }>>([])
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>(normalizedWords)
  const [selectedStatuses, setSelectedStatuses] = useState<LetterStatus[]>(Array(5).fill("absent"))

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    if (/^[a-záàâãéèêíïóôõöúçñ]*$/i.test(value) && value.length <= 5) {
      setCurrentGuess(value)

      if (value.length !== currentGuess.length) {
        // When the length changes, update the selected statuses based on previous guesses
        const newSelectedStatuses = Array(5).fill("absent");
        
        if (value.length === 5) {
          const normalizedNewGuess = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          // Pre-fill based on previous guesses
          for (let i = 0; i < 5; i++) {
            const currentLetter = normalizedNewGuess[i];
            
            // Check if this letter at this position was marked as "correct" in any previous guess
            const correctAtSamePosition = guesses.some(guess => 
              guess.word[i] === currentLetter && guess.statuses[i] === "correct"
            );
            
            if (correctAtSamePosition) {
              newSelectedStatuses[i] = "correct";
              continue;
            }
            
            // Check if this letter was marked as "existSomewhereElse" in any previous guess
            const existsSomewhereElse = guesses.some(guess =>
              guess.word[i] === currentLetter && guess.statuses[i] === "existSomewhereElse"
            );
            if (existsSomewhereElse) {
              newSelectedStatuses[i] = "existSomewhereElse";
            }
          }
        }
        
        setSelectedStatuses(newSelectedStatuses);
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
      const guessPresentCounts: Record<string, number> = {}
      const wordPresentCounts: Record<string, number> = {}
      for (let i = 0; i < 5; i++) {
        const letter = guess.word[i];
        if (guess.statuses[i] === "existSomewhereElse" || guess.statuses[i] === "correct") {
          guessPresentCounts[letter] = (guessPresentCounts[letter] || 0) + 1;
        }
        if (word.includes(letter)) {
          wordPresentCounts[letter] = (wordPresentCounts[letter] || 0) + 1;
        }
      }
      for (const letter in guessPresentCounts) {
        if ((wordPresentCounts[letter] || 0) < guessPresentCounts[letter]) {
          return false;
        }
      }

      return true
    });
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

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">TERMOBOT</h1>

      <div className="grid gap-8">
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
              <CardTitle>Soluções Possíveis ({possibleSolutions.length})</CardTitle>
              <CardDescription>
                {possibleSolutions.length === 0
                  ? "Nenhuma solução encontrada. Tente remover ou ajustar seus palpites."
                  : possibleSolutions.length > 100
                    ? "Adicione mais palpites para reduzir as soluções."
                    : "Aqui estão as soluções possíveis com base nos seus palpites."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {possibleSolutions.slice(0, 100).map((normalizedWord, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 text-center rounded uppercase text-black dark:text-white">
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
