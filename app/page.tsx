"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { portugueseWords } from "@/lib/words"

// Letter status types
type LetterStatus = "correct" | "present" | "absent" | "unknown"

export default function TermoBot() {
  // State for the current guess
  const [currentGuess, setCurrentGuess] = useState<string>("")

  // State for all guesses and their statuses
  const [guesses, setGuesses] = useState<Array<{ word: string; statuses: LetterStatus[] }>>([])

  // State for possible solutions
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>([])

  // State for the selected letter status when adding a guess
  const [selectedStatuses, setSelectedStatuses] = useState<LetterStatus[]>(Array(5).fill("unknown"))

  // Initialize possible solutions with all 5-letter Portuguese words
  useEffect(() => {
    // Filter words to only include 5-letter words
    const fiveLetterWords = portugueseWords.filter((word) => word.length === 5)
    setPossibleSolutions(fiveLetterWords)
  }, [])

  // Handle input change for the current guess
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    // Only allow letters and limit to 5 characters
    if (/^[a-záàâãéèêíïóôõöúçñ]*$/i.test(value) && value.length <= 5) {
      setCurrentGuess(value)

      // Reset selected statuses when the word changes
      if (value.length !== currentGuess.length) {
        setSelectedStatuses(Array(5).fill("unknown"))
      }
    }
  }

  // Toggle the status of a letter
  const toggleLetterStatus = (index: number) => {
    const statuses: LetterStatus[] = ["unknown", "correct", "present", "absent"]
    const currentStatus = selectedStatuses[index]
    const currentIndex = statuses.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statuses.length

    const newSelectedStatuses = [...selectedStatuses]
    newSelectedStatuses[index] = statuses[nextIndex]
    setSelectedStatuses(newSelectedStatuses)
  }

  // Add the current guess to the list of guesses
  const addGuess = () => {
    if (currentGuess.length !== 5) return

    const newGuess = {
      word: currentGuess,
      statuses: [...selectedStatuses],
    }

    const updatedGuesses = [...guesses, newGuess]
    setGuesses(updatedGuesses)

    // Filter possible solutions based on all guesses
    const filtered = filterPossibleSolutions(updatedGuesses)
    setPossibleSolutions(filtered)

    // Reset for next guess
    setCurrentGuess("")
    setSelectedStatuses(Array(5).fill("unknown"))
  }

  // Remove a guess
  const removeGuess = (index: number) => {
    const updatedGuesses = guesses.filter((_, i) => i !== index)
    setGuesses(updatedGuesses)

    // Recalculate possible solutions
    const filtered = filterPossibleSolutions(updatedGuesses)
    setPossibleSolutions(filtered)
  }

  // Filter possible solutions based on all guesses
  const filterPossibleSolutions = (allGuesses: Array<{ word: string; statuses: LetterStatus[] }>) => {
    return portugueseWords.filter((word) => {
      // Only consider 5-letter words
      if (word.length !== 5) return false

      // Check if the word matches all constraints from guesses
      return allGuesses.every((guess) => {
        // For each position in the guess
        for (let i = 0; i < 5; i++) {
          const guessLetter = guess.word[i]
          const guessStatus = guess.statuses[i]

          // If the letter is correct, the solution must have the same letter at this position
          if (guessStatus === "correct" && word[i] !== guessLetter) {
            return false
          }

          // If the letter is present but in wrong position, the solution must contain this letter
          // but not at this position
          if (guessStatus === "present") {
            if (word[i] === guessLetter) return false // Can't be in this position
            if (!word.includes(guessLetter)) return false // Must be somewhere
          }

          // If the letter is absent, the solution must not contain this letter
          // (unless it's already accounted for in a correct or present position)
          if (guessStatus === "absent") {
            // Count how many times this letter appears as correct or present in the guess
            const correctOrPresentCount = guess.word.split("").reduce((count, letter, idx) => {
              if (letter === guessLetter && (guess.statuses[idx] === "correct" || guess.statuses[idx] === "present")) {
                return count + 1
              }
              return count
            }, 0)

            // Count how many times this letter appears in the candidate word
            const letterCount = word.split("").filter((letter) => letter === guessLetter).length

            // If the letter appears more times in the candidate than accounted for, it's invalid
            if (letterCount > correctOrPresentCount) return false
          }
        }

        return true
      })
    })
  }

  // Get the background color for a letter based on its status
  const getLetterColor = (status: LetterStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white"
      case "present":
        return "bg-yellow-500 text-white"
      case "absent":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-200"
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">TermoBot</h1>

      <div className="grid gap-8">
        {/* Input for new guess */}
        <Card>
          <CardHeader>
            <CardTitle>Add a Guess</CardTitle>
            <CardDescription>Enter your 5-letter guess and mark the feedback you received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guess">Your Guess (5 letters)</Label>
                <Input
                  id="guess"
                  value={currentGuess}
                  onChange={handleGuessChange}
                  placeholder="Enter a 5-letter word"
                  className="uppercase"
                  maxLength={5}
                />
              </div>

              {currentGuess.length === 5 && (
                <div className="space-y-2">
                  <Label>Click each letter to change its status</Label>
                  <div className="flex justify-center gap-2">
                    {currentGuess.split("").map((letter, index) => (
                      <Button
                        key={index}
                        className={`w-12 h-12 text-xl font-bold uppercase ${getLetterColor(selectedStatuses[index])}`}
                        onClick={() => toggleLetterStatus(index)}
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>Correct</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <span>Unknown</span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={addGuess} disabled={currentGuess.length !== 5} className="w-full">
                Add Guess
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous guesses */}
        {guesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Guesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guesses.map((guess, guessIndex) => (
                  <div key={guessIndex} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {guess.word.split("").map((letter, letterIndex) => (
                        <div
                          key={letterIndex}
                          className={`w-10 h-10 flex items-center justify-center text-lg font-bold uppercase ${getLetterColor(guess.statuses[letterIndex])}`}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeGuess(guessIndex)} className="ml-2">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Possible solutions */}
        <Card>
          <CardHeader>
            <CardTitle>Possible Solutions ({possibleSolutions.length})</CardTitle>
            <CardDescription>
              {possibleSolutions.length === 0
                ? "No solutions found. Try removing or adjusting your guesses."
                : possibleSolutions.length > 100
                  ? "Add more guesses to narrow down the solutions."
                  : "Here are the possible solutions based on your guesses."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {possibleSolutions.slice(0, 100).map((word, index) => (
                  <div key={index} className="bg-gray-100 p-2 text-center rounded uppercase">
                    {word}
                  </div>
                ))}
                {possibleSolutions.length > 100 && (
                  <div className="col-span-full text-center text-gray-500 mt-2">
                    ...and {possibleSolutions.length - 100} more
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
