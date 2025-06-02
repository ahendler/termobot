# [TERMOBOT](https://termobot.uk) - A word finder for the [Termo](https://term.ooo) game

TERMOBOT is a web app designed to help finding possible solutions for [Termo](https://term.ooo), a Portuguese version of the popular word game Wordle.


## How to Use

1. **Enter your guess**: Type a 5-letter Portuguese word in the input field
2. **Mark the feedback**: Click on each letter to toggle its status:
   - 🟩 Green: Letter is correct and in the right position
   - 🟨 Yellow: Letter is in the word but in a different position
   - ⬛ Gray: Letter is not in the word or not in this specific position
3. **Add the guess**: Click "Adicionar Palpite" to add your guess to the list
4. **View possible solutions**: The app will display all words that match your feedback
5. **Continue guessing**: Click on a suggested word to use it as your next guess or enter a new guess manually

## Word Lists

The word lists were extracted from the original Termo game.
- **Answers**: 5-letter words that can be the solution of the day (~1000 words)
- **Guessable**: All 5-letter words that can be used as guesses, excluding the answers (~5000 words)

## Development

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```
3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)


## TODO:
- Validate word checking logic
- Clean code and remove unused imports
- Add github link on footer
- Add Best guess functionality