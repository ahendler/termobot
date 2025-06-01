"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { portugueseWords } from "@/lib/words"

// Tipos de status das letras
type LetterStatus = "correct" | "present" | "absent" | "unknown"

export default function TermoBot() {
  // Estado para o palpite atual
  const [currentGuess, setCurrentGuess] = useState<string>("")

  // Estado para todos os palpites e seus status
  const [guesses, setGuesses] = useState<Array<{ word: string; statuses: LetterStatus[] }>>([])

  // Estado para soluções possíveis
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>([])

  // Estado para o status selecionado da letra ao adicionar um palpite
  const [selectedStatuses, setSelectedStatuses] = useState<LetterStatus[]>(Array(5).fill("unknown"))

  // Inicializa soluções possíveis com todas as palavras portuguesas de 5 letras
  useEffect(() => {
    // Filtra palavras para incluir apenas palavras de 5 letras
    const fiveLetterWords = portugueseWords.filter((word) => word.length === 5)
    setPossibleSolutions(fiveLetterWords)
  }, [])

  // Lidar com a mudança de entrada para o palpite atual
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    // Permite apenas letras e limita a 5 caracteres
    if (/^[a-záàâãéèêíïóôõöúçñ]*$/i.test(value) && value.length <= 5) {
      setCurrentGuess(value)

      // Redefine os status selecionados quando a palavra muda
      if (value.length !== currentGuess.length) {
        setSelectedStatuses(Array(5).fill("unknown"))
      }
    }
  }

  // Alterna o status de uma letra
  const toggleLetterStatus = (index: number) => {
    const statuses: LetterStatus[] = ["unknown", "correct", "present", "absent"]
    const currentStatus = selectedStatuses[index]
    const currentIndex = statuses.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statuses.length

    const newSelectedStatuses = [...selectedStatuses]
    newSelectedStatuses[index] = statuses[nextIndex]
    setSelectedStatuses(newSelectedStatuses)
  }

  // Adiciona o palpite atual à lista de palpites
  const addGuess = () => {
    if (currentGuess.length !== 5) return

    const newGuess = {
      word: currentGuess,
      statuses: [...selectedStatuses],
    }

    const updatedGuesses = [...guesses, newGuess]
    setGuesses(updatedGuesses)

    // Filtra soluções possíveis com base em todos os palpites
    const filtered = filterPossibleSolutions(updatedGuesses)
    setPossibleSolutions(filtered)

    // Redefine para o próximo palpite
    setCurrentGuess("")
    setSelectedStatuses(Array(5).fill("unknown"))
  }

  // Remove um palpite
  const removeGuess = (index: number) => {
    const updatedGuesses = guesses.filter((_, i) => i !== index)
    setGuesses(updatedGuesses)

    // Recalcula soluções possíveis
    const filtered = filterPossibleSolutions(updatedGuesses)
    setPossibleSolutions(filtered)
  }

  // Filtra soluções possíveis com base em todos os palpites
  const filterPossibleSolutions = (allGuesses: Array<{ word: string; statuses: LetterStatus[] }>) => {
    return portugueseWords.filter((word) => {
      // Considere apenas palavras de 5 letras
      if (word.length !== 5) return false

      // Verifica se a palavra corresponde a todas as restrições dos palpites
      return allGuesses.every((guess) => {
        // Para cada posição no palpite
        for (let i = 0; i < 5; i++) {
          const guessLetter = guess.word[i]
          const guessStatus = guess.statuses[i]

          // Se a letra estiver correta, a solução deve ter a mesma letra nesta posição
          if (guessStatus === "correct" && word[i] !== guessLetter) {
            return false
          }

          // Se a letra estiver presente mas na posição errada, a solução deve conter esta letra
          // mas não nesta posição
          if (guessStatus === "present") {
            if (word[i] === guessLetter) return false // Não pode estar nesta posição
            if (!word.includes(guessLetter)) return false // Deve estar em algum lugar
          }

          // Se a letra estiver ausente, a solução não deve conter esta letra
          // (a menos que já esteja contabilizada em uma posição correta ou presente)
          if (guessStatus === "absent") {
            // Conta quantas vezes esta letra aparece como correta ou presente no palpite
            const correctOrPresentCount = guess.word.split("").reduce((count, letter, idx) => {
              if (letter === guessLetter && (guess.statuses[idx] === "correct" || guess.statuses[idx] === "present")) {
                return count + 1
              }
              return count
            }, 0)

            // Conta quantas vezes esta letra aparece na palavra candidata
            const letterCount = word.split("").filter((letter) => letter === guessLetter).length

            // Se a letra aparecer mais vezes no candidato do que o contabilizado, é inválido
            if (letterCount > correctOrPresentCount) return false
          }
        }

        return true
      })
    })
  }

  // Obtém a cor de fundo para uma letra com base em seu status
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
      <h1 className="text-3xl font-bold text-center mb-8">TERMOBOT</h1>

      <div className="grid gap-8">
        {/* Entrada for novo palpite */}
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
                    {currentGuess.split("").map((letter, index) => (
                      <Button
                      key={index}
                      type="button" 
                      className={`w-12 h-12 text-xl font-bold uppercase ${getLetterColor(selectedStatuses[index])} hover:${getLetterColor(selectedStatuses[index])}`}
                      onClick={() => toggleLetterStatus(index)}
                      >
                      {letter}
                      </Button>
                    ))}
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
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <span>Desconhecido</span>
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

        {/* Palpites anteriores */}
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
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Soluções possíveis - Only show after first guess */}
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
                  {possibleSolutions.slice(0, 100).map((word, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 text-center rounded uppercase text-black dark:text-white">
                      {word}
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
