// *** HTML ELEMENTS ***
const bingoInput = document.querySelector("#bingo-input");
const numEntries = document.querySelector(".num-entries");
const bingoForm = document.querySelector(".bingo-form");
const gameBoard = document.querySelector(".game-board");
const inputContainer = document.querySelector(".input-container");
const bingoSquares = document.querySelectorAll(".bingo-square");
const freeSpace = document.querySelector("#free-space");

// *** GLOBALS ***
const FREE_SPACE = "Free Space";
const INITIAL_BINGO_BOARD = [
  [],
  [],
  [, , { text: FREE_SPACE, selected: true }, ,],
  [],
  [],
];
const BINGO_BOARD_KEY = "bingo-board";
const NUM_ENTRIES_TO_START = 24;
let bingoBoard = [...INITIAL_BINGO_BOARD];

// *** FUNCTIONS ***
function createBingoItem(text) {
  const { row, col } = insertIntoBingoBoard(text);
  const square = document.querySelector(
    `.bingo-square[data-row="${row}"][data-col="${col}"]`
  );
  square.textContent = text;
}

function insertIntoBingoBoard(text) {
  const row = Math.floor(Math.random() * 5);
  const col = Math.floor(Math.random() * 5);

  if (bingoBoard[row][col]) {
    return insertIntoBingoBoard(text);
  } else {
    bingoBoard[row][col] = { text, selected: false };
    localStorage.setItem(BINGO_BOARD_KEY, JSON.stringify(bingoBoard));
    return { row, col };
  }
}

function incrementNumEntries() {
  const currentNumEntries = parseInt(numEntries.textContent);
  numEntries.textContent = currentNumEntries + 1;
}

function checkIsReady() {
  return bingoBoard.every((row) =>
    row.every((square) => Boolean(square?.text))
  );
}

function resetBingoBoardUI() {
  numEntries.textContent = 0;

  Array.from(bingoSquares).forEach((square, i) => {
    const isMiddleSquare = i === Math.floor(bingoSquares.length / 2);
    if (isMiddleSquare) {
      return;
    }

    square.textContent = "";
    square.classList.remove("selected");
  });
}

function resetGame() {
  bingoBoard = [...INITIAL_BINGO_BOARD];
  resetBingoBoardUI();
}

function checkForBingo() {
  const rows = bingoBoard;
  const cols = bingoBoard[0].map((_, i) => bingoBoard.map((row) => row[i]));
  const diag1 = bingoBoard.map((row, i) => row[i]);
  const diag2 = bingoBoard.map((row, i) => row[4 - i]);

  const lines = [...rows, ...cols, diag1, diag2];

  for (const line of lines) {
    if (line.every((square) => square.selected)) {
      return true;
    }
  }

  return false;
}

function hideInputContainer() {
  inputContainer.classList.add("hidden");
}

// *** EVENT LISTENERS ***
bingoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = bingoInput.value;
  if (!text) return;

  createBingoItem(text);
  incrementNumEntries();
  bingoInput.value = "";

  const isReady = checkIsReady();
  if (isReady) {
    activateBingoBoard();
    hideInputContainer();
  }
});

// *** Bingo Board ***
const addHoverClass = (square) => {
  square.classList.add("hover");
};

const removeHoverClass = (square) => {
  square.classList.remove("hover");
};

const selectSquare = (square) => {
  if (square === freeSpace) return;

  const row = parseInt(square.getAttribute("data-row"));
  const col = parseInt(square.getAttribute("data-col"));

  if (!bingoBoard[row][col]) return;

  if (square.classList.contains("selected")) {
    square.classList.remove("selected");
    bingoBoard[row][col].selected = false;
    localStorage.setItem(BINGO_BOARD_KEY, JSON.stringify(bingoBoard));
  } else {
    square.classList.add("selected");
    bingoBoard[row][col].selected = true;
    localStorage.setItem(BINGO_BOARD_KEY, JSON.stringify(bingoBoard));
  }

  if (checkForBingo()) {
    alert("BINGO!");
    resetGame();
    deactivateBingoBoard();
    inputContainer.classList.remove("hidden");
  }
};

function activateBingoBoard() {
  bingoSquares.forEach((square) => {
    square.addEventListener("mouseenter", () => addHoverClass(square));
    square.addEventListener("mouseleave", () => removeHoverClass(square));
    square.addEventListener("click", () => selectSquare(square));
  });
}

function deactivateBingoBoard() {
  bingoSquares.forEach((square) => {
    square.classList.remove("hover");
  });
}

// *** INITIALIZATION ***
// Add data rows and cols to all bingo squares
bingoSquares.forEach((square, i) => {
  square.setAttribute("data-row", Math.floor(i / 5));
  square.setAttribute("data-col", i % 5);
});

// Load bingo board from local storage
const storedBingoBoard = JSON.parse(localStorage.getItem(BINGO_BOARD_KEY));
if (storedBingoBoard) {
  numEntries.textContent = storedBingoBoard
    .flat()
    .filter((square) => square).length;
  bingoBoard = storedBingoBoard;
  bingoBoard.forEach((row, i) => {
    row.forEach((square, j) => {
      if (square) {
        const squareElement = document.querySelector(
          `.bingo-square[data-row="${i}"][data-col="${j}"]`
        );
        squareElement.textContent = square.text;
        if (square.selected) {
          squareElement.classList.add("selected");
        }
      }
    });
  });

  if (checkIsReady()) {
    activateBingoBoard();
    hideInputContainer();
  }
}
