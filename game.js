let gridSize = 25; // 25x25 grid
let cellSize = 21; // Adjusted cell size to fit the larger grid
let grid = []; // 2D array for placed tiles
let targetShape = []; // Coordinates of the target pattern (cat)
let tiles = []; // Available Tetris tiles
let selectedTile = null; // Currently selected tile
let timer = 0; // Timer in seconds
let timerStarted = false; // Tracks if timer should run
let score = 10000; // Starting score
let gameWon = false; // Win state

// Global variables to store the selected animal and its colors
let selectedAnimal = null;
let animalColors = null;

// DOM elements
let winModal;
let leaderboardModal;
let finalScoreElement;
let playerInitialsInput;
let playerEmailInput;
let submitScoreButton;
let playAgainButton;
let leaderboardEntriesElement;
let closeLeaderboardButton;
let gameContainer;
let currentPlayerRank = null;
let timeDisplay;
let scoreDisplay;
let modalOverlay;
let instructionsButton;
let instructionsModal;
let closeInstructionsButton;

function setup() {
  // Update canvas size to fit the larger grid and cell size (25*21 = 525px for grid)
  const canvas = createCanvas(525, 675);
  gameContainer = document.getElementById("game-container");
  canvas.parent(gameContainer);

  // Initialize DOM elements
  winModal = document.getElementById("win-modal");
  leaderboardModal = document.getElementById("leaderboard-modal");
  finalScoreElement = document.getElementById("final-score");
  playerInitialsInput = document.getElementById("player-initials");
  playerEmailInput = document.getElementById("player-email");
  submitScoreButton = document.getElementById("submit-score");
  playAgainButton = document.getElementById("play-again");
  leaderboardEntriesElement = document.getElementById("leaderboard-entries");
  closeLeaderboardButton = document.getElementById("close-leaderboard");

  // New elements
  timeDisplay = document.getElementById("time-display");
  scoreDisplay = document.getElementById("score-display");
  modalOverlay = document.getElementById("modal-overlay");
  instructionsButton = document.getElementById("instructions-button");
  instructionsModal = document.getElementById("instructions-modal");
  closeInstructionsButton = document.getElementById("close-instructions");

  // Add event listeners
  submitScoreButton.addEventListener("click", submitScore);
  playAgainButton.addEventListener("click", resetGame);
  closeLeaderboardButton.addEventListener("click", closeLeaderboard);
  instructionsButton.addEventListener("click", showInstructions);
  closeInstructionsButton.addEventListener("click", closeInstructions);

  // Setup modal interactions
  setupModalInteractions();

  initializeGrid();
  defineTargetShape();
  defineTiles();
}

function draw() {
  background("#f0f4f8"); // Light blue-gray background
  drawGrid();
  drawTargetShape();
  drawTiles();
  if (selectedTile) drawSelectedTile();
  updateTimer();
  updateScoreAndTimerDisplay();
  if (gameWon) displayWinMessage(); 
}

// Initialize the grid (all cells empty)
function initializeGrid() {
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = 0; // 0 = empty
    }
  }
}

// Define a random target shape for the larger grid
function defineTargetShape() {
  // Clear the target shape array
  targetShape = [];

  // Define animal patterns with their names and colors
  const animalPatterns = [
    {
      name: "Elephant",
      colors: ["#34495e", "#7f8c8d", "#ecf0f1", "#e67e22"], // Dark body, gray details, white tusks, orange accents
      pattern: [
        // Body (15x12) - dark body color (0)
        ...[...Array(15)].flatMap((_, i) => [...Array(12)].map((_, j) => [i + 5, j + 7, 0])),
        
        // Head (8x8) - dark body color (0)
        ...[...Array(8)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 8, j + 3, 0])),
        
        // Trunk (3x6) - gray details (1)
        [11, 2, 1], [12, 2, 1], [13, 2, 1],
        [13, 1, 1], [14, 1, 1], [15, 1, 1],
        
        // Ears (6x8 each) - gray details (1)
        ...[...Array(6)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 5, j + 3, 1])), // Left ear
        ...[...Array(6)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 13, j + 3, 1])), // Right ear
        
        // Tusks - white (2)
        [9, 9, 2], [10, 9, 2], [8, 10, 2], [9, 10, 2],
        [14, 9, 2], [15, 9, 2], [14, 10, 2], [15, 10, 2],
        
        // Legs - gray details (1)
        [6, 19, 1], [7, 19, 1], [8, 19, 1],
        [16, 19, 1], [17, 19, 1], [18, 19, 1],
        [6, 18, 1], [7, 18, 1], [8, 18, 1],
        [16, 18, 1], [17, 18, 1], [18, 18, 1],
        
        // Eyes - orange accents (3)
        [10, 5, 3], [14, 5, 3]
      ]
    },
    {
      name: "Dragon",
      colors: ["#2ecc71", "#27ae60", "#f1c40f", "#e74c3c"], // Green body, dark green details, yellow wings, red accents
      pattern: [
        // Body (15x10) - green body (0)
        ...[...Array(15)].flatMap((_, i) => [...Array(10)].map((_, j) => [i + 5, j + 8, 0])),
        
        // Head (7x6) - dark green details (1)
        ...[...Array(7)].flatMap((_, i) => [...Array(6)].map((_, j) => [i + 3, j + 5, 1])),
        
        // Wings (8x12 each) - yellow wings (2)
        ...[...Array(8)].flatMap((_, i) => [...Array(12)].map((_, j) => [i + 4, j + 3, 2])), // Left wing
        ...[...Array(8)].flatMap((_, i) => [...Array(12)].map((_, j) => [i + 13, j + 3, 2])), // Right wing
        
        // Tail (3x8) - dark green details (1)
        [18, 15, 1], [19, 16, 1], [20, 17, 1],
        [19, 15, 1], [20, 16, 1], [21, 17, 1],
        [20, 15, 1], [21, 16, 1], [22, 17, 1],
        
        // Spikes - red accents (3)
        [3, 5, 3], [4, 4, 3], [5, 3, 3],
        [6, 3, 3], [7, 2, 3], [8, 2, 3],
        [9, 2, 3], [10, 2, 3], [11, 2, 3],
        
        // Eyes - red accents (3)
        [5, 6, 3], [7, 6, 3]
      ]
    },
    {
      name: "Lion",
      colors: ["#e67e22", "#d35400", "#f39c12", "#6c3483"], // Orange body, dark orange mane, yellow details, purple accents
      pattern: [
        // Body (15x10) - orange body (0)
        ...[...Array(15)].flatMap((_, i) => [...Array(10)].map((_, j) => [i + 5, j + 10, 0])),
        
        // Head (8x8) - orange body (0)
        ...[...Array(8)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 8, j + 5, 0])),
           [16, 7, 0], [16, 8, 0], [16, 9, 0], 

        // Mane (15x15) - dark orange mane (1)
        ...[...Array(15)].flatMap((_, i) => [...Array(15)].map((_, j) => {
          const x = i + 5;
          const y = j + 3;
          // Create circular mane pattern
          const centerX = 12;
          const centerY = 10;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 8 && distance > 5 ? [x, y, 1] : null;
        })).filter(coord => coord !== null),
        
        // Tail - yellow details (2)
        [18, 15, 2], [19, 16, 2], [20, 17, 2],
        [19, 15, 2], [20, 16, 2], [21, 17, 2],
        
        // Legs - dark orange (1)
        [6, 19, 1], [7, 19, 1], [8, 19, 1],
        [16, 19, 1], [17, 19, 1], [18, 19, 1],
        [6, 18, 1], [7, 18, 1], [8, 18, 1],
        [16, 18, 1], [17, 18, 1], [18, 18, 1],
        
        // Eyes - purple accents (3)
        [10, 7, 3], [14, 7, 3],
        
        // Nose - yellow details (2)
        [12, 8, 2], [12, 9, 2]
      ]
    },
    {
      name: "Tree",
      colors: ["#795548", "#4CAF50", "#8BC34A", "#FFC107"], // Brown trunk, dark green foliage, light green highlights, yellow accents
      pattern: [
        // Trunk - brown (0)
        ...[...Array(4)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 10, j + 14, 0])),
        
        // Foliage base - dark green (1)
        ...[...Array(12)].flatMap((_, i) => [...Array(12)].map((_, j) => {
          const x = i + 6;
          const y = j + 4;
          // Create circular foliage pattern
          const centerX = 12;
          const centerY = 10;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 6 ? [x, y, 1] : null;
        })).filter(coord => coord !== null),
        
        // Foliage highlights - light green (2)
        ...[...Array(8)].flatMap((_, i) => [...Array(8)].map((_, j) => {
          const x = i + 8;
          const y = j + 6;
          // Create smaller circular pattern for highlights
          const centerX = 12;
          const centerY = 10;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 3 ? [x, y, 2] : null;
        })).filter(coord => coord !== null),
        
        // Fruits/flowers - yellow accents (3)
        [8, 8, 3], [10, 6, 3], [14, 7, 3], [16, 9, 3], [9, 12, 3]
      ]
    },
    {
      name: "House",
      colors: ["#E57373", "#FFECB3", "#90CAF9", "#81C784"], // Red roof, beige walls, blue windows, green accents
      pattern: [
        // Walls - beige (1)
        ...[...Array(14)].flatMap((_, i) => [...Array(10)].map((_, j) => [i + 5, j + 12, 1])),
        
        // Roof - red (0)
        ...[...Array(16)].flatMap((_, i) => {
          const height = Math.floor(8 * (1 - Math.abs(i - 7.5) / 8));
          return [...Array(height)].map((_, j) => [i + 4, j + 4 + (8 - height), 0]);
        }),
        
        // Windows - blue (2)
        ...[...Array(3)].flatMap((_, i) => [...Array(3)].map((_, j) => [i + 7, j + 14, 2])),
        ...[...Array(3)].flatMap((_, i) => [...Array(3)].map((_, j) => [i + 14, j + 14, 2])),
        
        // Door - green (3)
        ...[...Array(3)].flatMap((_, i) => [...Array(5)].map((_, j) => [i + 10, j + 17, 3])),
        
        // Chimney - red (0)
        ...[...Array(2)].flatMap((_, i) => [...Array(4)].map((_, j) => [i + 16, j + 6, 0]))
      ]
    },
    {
      name: "Sandcastle",
      colors: ["#E0C097", "#D4B483", "#C19A6B", "#7FB3D5"], // Light sand, medium sand, dark sand, blue accents
      pattern: [
        // Main castle body - light sand (0)
        ...[...Array(16)].flatMap((_, i) => [...Array(10)].map((_, j) => [i + 4, j + 12, 0])),
        
        // Towers - medium sand (1)
        ...[...Array(4)].flatMap((_, i) => [...Array(14)].map((_, j) => [i + 4, j + 8, 1])),
        ...[...Array(4)].flatMap((_, i) => [...Array(14)].map((_, j) => [i + 16, j + 8, 1])),
        
        // Tower tops - dark sand (2)
        ...[...Array(6)].flatMap((_, i) => [...Array(2)].map((_, j) => [i + 3, j + 6, 2])),
        ...[...Array(6)].flatMap((_, i) => [...Array(2)].map((_, j) => [i + 15, j + 6, 2])),
        
        // Flags and decorations - blue (3)
        [5, 4, 3], [6, 3, 3], [7, 4, 3],
        [17, 4, 3], [18, 3, 3], [19, 4, 3],
        [8, 10, 3], [12, 10, 3], [16, 10, 3],
        
        // Windows - dark sand (2)
        [6, 14, 2], [10, 14, 2], [14, 14, 2],
        [6, 18, 2], [10, 18, 2], [14, 18, 2]
      ]
    },
    {
      name: "Mouse",
      colors: ["#616161", "#424242", "#FFC107", "#4CAF50"], // Gray body, dark gray stripes, yellow eyes, green accents
      pattern: [
        // Body - gray (0)
        ...[...Array(12)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 6, j + 12, 0])),
        
        // Head - gray (0)
        ...[...Array(8)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 8, j + 6, 0])),
        
        // Ears - dark gray (1)
        ...[...Array(3)].flatMap((_, i) => [...Array(3)].map((_, j) => [i + 7, j + 3, 1])),
        ...[...Array(3)].flatMap((_, i) => [...Array(3)].map((_, j) => [i + 14, j + 3, 1])),
        
        // Tail - gray with dark gray stripes (0 and 1)
        [18, 12, 0], [19, 11, 0], [20, 10, 0], [21, 9, 0],
        [19, 12, 1], [20, 11, 1], [21, 10, 1],
        
        // Stripes - dark gray (1)
        [8, 14, 1], [10, 15, 1], [12, 14, 1], [14, 15, 1],
        [9, 10, 1], [13, 10, 1],
        
        // Eyes - yellow (2)
        [9, 8, 2], [14, 8, 2],
        
        // Nose and whiskers - green (3)
        [11, 9, 3], [12, 9, 3],
        [7, 10, 3], [6, 10, 3], [16, 10, 3], [17, 10, 3]
      ]
    },
    {
      name: "Butterfly",
      colors: ["#9C27B0", "#7B1FA2", "#FFC107", "#4CAF50"], // Purple wings, dark purple details, yellow body, green accents
      pattern: [
        // Left wing bottom - purple (0)
        ...[...Array(10)].flatMap((_, i) => [...Array(20)].map((_, j) => {
          const x = i + 3;
          const y = j + 5;
          // Create wing shape
          const centerX = 10;
          const centerY = 17;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 5 && x <= 10 ? [x, y, 0] : null;
        })).filter(coord => coord !== null),
        
        // Left wing top - purple (0)
        ...[...Array(10)].flatMap((_, i) => [...Array(20)].map((_, j) => {
          const x = i + 2;
          const y = j + 5;
          // Create wing shape
          const centerX = 6;
          const centerY = 10;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 5 && x <= 10 ? [x, y, 0] : null;
        })).filter(coord => coord !== null),


        // Right wing bottom - purple (0)
        ...[...Array(10)].flatMap((_, i) => [...Array(20)].map((_, j) => {
          const x = i + 12;
          const y = j + 5;
          // Create wing shape
          const centerX = 13;
          const centerY = 17;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 5 && x >= 13 ? [x, y, 0] : null;
        })).filter(coord => coord !== null),
        
        // Right wing top - purple (0)
        ...[...Array(10)].flatMap((_, i) => [...Array(20)].map((_, j) => {
          const x = i + 12;
          const y = j + 5;
          // Create wing shape
          const centerX = 17;
          const centerY = 10;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          return distance <= 5 && x >= 12 ? [x, y, 0] : null;
        })).filter(coord => coord !== null),

        
        // Wing patterns - dark purple (1)
        [5, 8, 1], [6, 10, 1], [7, 12, 1], [8, 14, 1],
        [19, 8, 1], [18, 10, 1], [17, 12, 1], [16, 14, 1],
        
        // Body - yellow (2)
        ...[...Array(2)].flatMap((_, i) => [...Array(15)].map((_, j) => [i + 11, j + 6, 2])),
        
        // Antennae - green (3)
        [11, 5, 3], [10, 4, 3], [10, 3, 3],
        [12, 5, 3], [13, 4, 3], [13, 3, 3]
      ]
    },
    {
      name: "Castle",
      colors: ["#607D8B", "#455A64", "#CFD8DC", "#FF5722"], // Main walls, dark details, light accents, orange/red accents
      pattern: [
        // Main castle body - main walls (0)
        ...[...Array(16)].flatMap((_, i) => [...Array(14)].map((_, j) => [i + 4, j + 8, 0])),
        
        // Castle towers - dark details (1)
        ...[...Array(4)].flatMap((_, i) => [...Array(16)].map((_, j) => [i + 4, j + 6, 1])),
        ...[...Array(4)].flatMap((_, i) => [...Array(16)].map((_, j) => [i + 16, j + 6, 1])),
        
        // Castle battlements - main walls (0)
        [4, 5, 0], [6, 5, 0], [8, 5, 0], [10, 5, 0], [12, 5, 0], [14, 5, 0], [16, 5, 0], [18, 5, 0], [20, 5, 0],
        
        // Castle gate - dark details (1)
        ...[...Array(4)].flatMap((_, i) => [...Array(6)].map((_, j) => [i + 10, j + 16, 1])),
        
        // Windows - light accents (2)
        [6, 10, 2], [6, 14, 2], [18, 10, 2], [18, 14, 2],
        [10, 10, 2], [14, 10, 2],
        
        // Flags - orange/red accents (3)
        [4, 4, 3], [5, 3, 3], [6, 4, 3],
        [18, 4, 3], [19, 3, 3], [20, 4, 3]
      ]
    },
    {
      name: "Rocket",
      colors: ["#F44336", "#9E9E9E", "#2196F3", "#FFEB3B"], // Red body, gray details, blue windows, yellow flames
      pattern: [
        // Rocket body - red (0)
        ...[...Array(8)].flatMap((_, i) => [...Array(8)].map((_, j) => [i + 8, j + 12, 0])),
        
        // Rocket nose cone - red (0)
        ...[...Array(8)].flatMap((_, i) => {
          const width = Math.floor(8 * (i / 8));
          return [...Array(width)].map((_, j) => [j + 8 + (8 - width) / 2, i + 4, 0]);
        }),
        
        // Rocket fins - gray (1)
        ...[...Array(4)].flatMap((_, i) => [...Array(6)].map((_, j) => [i + 4, j + 14, 1])),
        ...[...Array(4)].flatMap((_, i) => [...Array(6)].map((_, j) => [i + 16, j + 14, 1])),
        
        // Windows - blue (2)
        [11, 8, 2], [12, 8, 2], 
        [10, 10, 2], [11, 10, 2], [12, 10, 2], [13, 10, 2],
        
        // Flames - yellow (3)
        ...[...Array(6)].flatMap((_, i) => {
          const width = Math.floor(6 * (1 - i / 6));
          return [...Array(width)].map((_, j) => [j + 9 + (6 - width) / 2, i + 20, 3]);
        })
      ]
    },
    {
      name: "Fish",
      colors: ["#03A9F4", "#0288D1", "#FFECB3", "#FF5722"], // Blue body, dark blue details, light yellow fins, orange accents
      pattern: [
        // Fish body - blue (0)
        ...[...Array(14)].flatMap((_, i) => {
          const height = Math.floor(8 * (1 - Math.abs(i - 7) / 8));
          return [...Array(height)].map((_, j) => [i + 6, j + 8 + (8 - height) / 2, 0]);
        }),
        
        // Fish tail - dark blue (1)
        ...[...Array(6)].flatMap((_, i) => {
          const height = Math.floor(8 * (i / 6));
          return [...Array(height)].map((_, j) => [i + 20, j + 8 + (8 - height) / 2, 1]);
        }),
        
        // Fish fins - light yellow (2)
        [10, 6, 2], [11, 5, 2], [12, 6, 2],
        [10, 16, 2], [11, 17, 2], [12, 16, 2],
        [16, 8, 2], [17, 7, 2], [16, 15, 2], [17, 16, 2],
        
        // Fish eye and details - orange (3)
        [7, 10, 3], [8, 10, 3],
        [9, 12, 3], [10, 13, 3], [11, 12, 3]
      ]
    },
    {
      name: "Cactus",
      colors: ["#4CAF50", "#388E3C", "#8BC34A", "#FFC107"], // Green body, dark green details, light green highlights, yellow flowers
      pattern: [
        // Main cactus body - green (0)
        ...[...Array(6)].flatMap((_, i) => [...Array(20)].map((_, j) => [i + 9, j + 4, 0])),
        [10, 3, 0], [11, 3, 0], [12, 3, 0], [13, 3, 0], 
        
        // Left arm - green (0)
        ...[...Array(6)].flatMap((_, i) => [...Array(4)].map((_, j) => [i + 3, j + 10, 0])),
        ...[...Array(3)].flatMap((_, i) => [...Array(4)].map((_, j) => [i + 3, j + 6, 0])),
        
        // Right arm - green (0)
        ...[...Array(6)].flatMap((_, i) => [...Array(4)].map((_, j) => [i + 15, j + 12, 0])),
        ...[...Array(3)].flatMap((_, i) => [...Array(6)].map((_, j) => [i + 18, j + 6, 0])),
        
        // Cactus details - dark green (1)
        [8, 8, 1], [8, 12, 1], [8, 16, 1], [8, 20, 1],
        [15, 8, 1], [15, 12, 1], [15, 16, 1], [15, 20, 1],
        [5, 10, 1], [5, 14, 1], [20, 12, 1], [20, 16, 1],
        
        // Cactus highlights - light green (2)
        [10, 8, 2], [10, 12, 2], [10, 16, 2], [10, 20, 2],
        [13, 8, 2], [13, 12, 2], [13, 16, 2], [13, 20, 2],
        
        // Flowers - yellow (3)
        [8, 5, 3], [11, 4, 3], [14, 5, 3],
        [2, 6, 3], [4, 3, 3], [6, 4, 3],
        [18, 7, 3], [20, 5, 3], [22, 6, 3]
      ]
    },
    {
      name: "Sailboat",
      colors: ["#795548", "#5D4037", "#FFFFFF", "#03A9F4"], // Brown hull, dark brown details, white sails, blue water/accents
      pattern: [
        // Boat hull - brown (0)
        ...[...Array(16)].flatMap((_, i) => [...Array(4)].map((_, j) => [i + 4, j + 18, 0])),
        
        // Hull details - dark brown (1)
        [6, 17, 1], [8, 17, 1], [10, 17, 1], [12, 17, 1], [14, 17, 1], [16, 17, 1], [18, 17, 1],
        [4, 19, 1], [4, 20, 1], [19, 19, 1], [19, 20, 1],
        
        // Main sail - white (2)
        ...[...Array(10)].flatMap((_, i) => {
          const height = Math.floor(14 * (1 - i / 10));
          return [...Array(height)].map((_, j) => [i + 8, j + 4, 2]);
        }),
        
        // Small sail - white (2)
        ...[...Array(6)].flatMap((_, i) => {
          const height = Math.floor(8 * (1 - i / 6));
          return [...Array(height)].map((_, j) => [i + 14, j + 8, 2]);
        }),
        
        // Mast and details - dark brown (1)
        [12, 4, 1], [12, 5, 1], [12, 6, 1], [12, 7, 1], [12, 8, 1], [12, 9, 1], 
        [12, 10, 1], [12, 11, 1], [12, 12, 1], [12, 13, 1], [12, 14, 1], [12, 15, 1], [12, 16, 1], [12, 17, 1],
        [16, 8, 1], [16, 9, 1], [16, 10, 1], [16, 11, 1], [16, 12, 1], [16, 13, 1], [16, 14, 1], [16, 15, 1],
        
        // Water/accents - blue (3)
        [5, 21, 3], [7, 21, 3], [9, 21, 3], [11, 21, 3], [13, 21, 3], [15, 21, 3], [17, 21, 3],
        [6, 6, 3], [7, 7, 3], [18, 10, 3], [19, 11, 3]
      ]
    }
  ];

  // Choose a random animal pattern
  const randomIndex = Math.floor(Math.random() * animalPatterns.length);
  const selectedPattern = animalPatterns[randomIndex];

  // Store the selected animal name and colors globally
  selectedAnimal = selectedPattern.name;
  animalColors = selectedPattern.colors;

  // Get the pattern
  let pattern = selectedPattern.pattern;
  
  // Find the bounds of the pattern
  let minX = gridSize, maxX = 0, minY = gridSize, maxY = 0;
  for (let [x, y] of pattern) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  
  // Calculate the width and height of the pattern
  const patternWidth = maxX - minX + 1;
  const patternHeight = maxY - minY + 1;
  
  // Calculate the horizontal offset to center the pattern
  const horizontalOffset = Math.floor((gridSize - patternWidth) / 2) - minX;
  
  // Calculate the vertical offset to position the bottom edge 3 rows from the bottom
  const targetBottomY = gridSize - 4; // 3 rows from bottom (0-indexed)
  const verticalOffset = targetBottomY - maxY;
  
  // Apply both offsets to all coordinates
  pattern = pattern.map(([x, y, colorIndex]) => [
    x + horizontalOffset, 
    y + verticalOffset, 
    colorIndex
  ]);
  
  // Set the target shape to the adjusted pattern
  targetShape = pattern;

  // Log the selected animal for debugging
  console.log("Selected animal:", selectedAnimal);
  console.log("Animal colors:", animalColors);
  console.log("Pattern dimensions:", patternWidth, "x", patternHeight);
  console.log("Bottom edge positioned at row:", targetBottomY);
  console.log("Horizontal center at column:", Math.floor(gridSize / 2));
}

// Define 3 random Tetris tiles with shapes, positions, and colors
function defineTiles() {
  // Clear the tiles array
  tiles = [];

  // Define all possible tile shapes
  const allTiles = [
    // Original 4-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      color: "#3498db", // Blue
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      color: "#e74c3c", // Red
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
      color: "#2ecc71", // Green
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ],
      color: "#f1c40f", // Yellow
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      color: "#9b59b6", // Purple
    },
    {
      blocks: [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      color: "#e67e22", // Orange
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      color: "#1abc9c", // Turquoise
    },

    // New 3-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      color: "#34495e", // Dark blue/gray
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      color: "#16a085", // Dark green
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      color: "#d35400", // Dark orange
    },

    // New 5-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
      ],
      color: "#8e44ad", // Dark purple
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      color: "#c0392b", // Dark red
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      color: "#27ae60", // Medium green
    },
    {
      blocks: [
        [2, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      color: "#f39c12", // Gold
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      color: "#7f8c8d", // Gray
    },
    {
      blocks: [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
      ],
      color: "#7f8c8d", // Gray
    },
    {
      blocks: [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
      ],
      color: "#7f8c8d", // Gray
    },
  ];

  // Randomly select 3 tiles from the available options
  const selectedIndices = [];
  while (selectedIndices.length < 3) {
    const randomIndex = Math.floor(Math.random() * allTiles.length);
    if (!selectedIndices.includes(randomIndex)) {
      selectedIndices.push(randomIndex);
    }
  }

  // Create the selected tiles
  for (const index of selectedIndices) {
    const tileTemplate = allTiles[index];
    tiles.push({
      blocks: [...tileTemplate.blocks], // Clone the blocks array
      color: tileTemplate.color,
      offsetX: 0,
      offsetY: 0,
      placed: false,
      rotation: 0,
    });
  }

  // Position them evenly
  repositionTiles();
}

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Check if the cell is part of the target shape
      const isTarget = targetShape.some(([x, y]) => x === i && y === j);

      if (grid[i][j] === 0) {
        // Empty cell
        stroke(200, 210, 220);
        strokeWeight(1);
        fill(255);
      } else {
        // Filled cell
        stroke(200, 210, 220);
        strokeWeight(1);
        
        if (isTarget) {
          // Correct placement - show green background with checkmark
          fill('#e6ffe6'); // Light green background
          rect(i * cellSize, j * cellSize, cellSize, cellSize, 3);
          
          // Draw green checkmark
          stroke('#2ecc71'); // Darker green for checkmark
          strokeWeight(3);
          const padding = cellSize * 0.2;
          const centerX = i * cellSize + cellSize / 2;
          const centerY = j * cellSize + cellSize / 2;
          
          // Draw checkmark
          beginShape();
          vertex(centerX - padding, centerY);
          vertex(centerX - padding/2, centerY + padding);
          vertex(centerX + padding, centerY - padding);
          endShape();
          
        } else {
          // Incorrect placement - show red background with X
          fill('#ffe6e6'); // Light red background
          rect(i * cellSize, j * cellSize, cellSize, cellSize, 3);
          
          // Draw red X
          stroke('#e74c3c'); // Darker red for X
          strokeWeight(3);
          const padding = cellSize * 0.2;
          const x1 = i * cellSize + padding;
          const y1 = j * cellSize + padding;
          const x2 = (i + 1) * cellSize - padding;
          const y2 = (j + 1) * cellSize - padding;
          
          // Draw X
          line(x1, y1, x2, y2);
          line(x2, y1, x1, y2);
        }
        continue;
      }
      rect(i * cellSize, j * cellSize, cellSize, cellSize, 3); // Slightly larger rounded corners
    }
  }
}

// Draw the target shape (outline)
function drawTargetShape() {
  // Use a consistent color scheme for the target shape
  const targetColor = color(200, 200, 200, 100); // Light gray with transparency
  const targetStrokeColor = color(150, 150, 150); // Darker gray for outline

  for (let [x, y, colorIndex] of targetShape) {
    fill(targetColor);
    stroke(targetStrokeColor);
    strokeWeight(1);
    rect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

// Draw the available tiles below the grid
function drawTiles() {
  for (let tile of tiles) {
    let rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);

    // Draw shadow first
    fill(0, 0, 0, 20);
    noStroke();
    for (let [dx, dy] of rotatedBlocks) {
      rect(
        tile.posX + dx * cellSize + 2,
        tile.posY + dy * cellSize + 2,
        cellSize,
        cellSize,
        4
      );
    }

    // Draw tile
    fill(tile.color);
    stroke(255);
    strokeWeight(1);
    for (let [dx, dy] of rotatedBlocks) {
      rect(
        tile.posX + dx * cellSize,
        tile.posY + dy * cellSize,
        cellSize,
        cellSize,
        4 // Rounded corners
      );
    }
  }
}

// Update the mousePressed function to maintain position when rotating
function mousePressed() {
  if (gameWon) return; // Disable interaction after winning

  // Check if it's a right-click (button 2)
  if (mouseButton === RIGHT) {
    // If a tile is already selected, rotate it while maintaining position
    if (selectedTile) {
      // Rotate the selected tile
      selectedTile.rotation = (selectedTile.rotation + 1) % 4;
      
      // Update the original tile in the tiles array
      tiles[selectedTile.index].rotation = selectedTile.rotation;
      
      return false; // Prevent default context menu
    }

    // If no tile is selected, check if we're hovering over a tile to rotate
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      let rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);

      // Check if mouse is over any block of the tile
      for (let [dx, dy] of rotatedBlocks) {
        let x = tile.posX + dx * cellSize;
        let y = tile.posY + dy * cellSize;

        if (
          mouseX > x &&
          mouseX < x + cellSize &&
          mouseY > y &&
          mouseY < y + cellSize
        ) {
          // Rotate the tile
          tiles[i].rotation = (tile.rotation + 1) % 4;
          
          return false; // Prevent default context menu
        }
      }
    }
  }

  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    let rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);

    // Check if any block of the tile is clicked
    for (let [dx, dy] of rotatedBlocks) {
      let x = tile.posX + dx * cellSize;
      let y = tile.posY + dy * cellSize;

      if (
        mouseX > x &&
        mouseX < x + cellSize &&
        mouseY > y &&
        mouseY < y + cellSize
      ) {
        // Left mouse button for dragging
        selectedTile = {
          ...tile,
          index: i,
          offsetX: mouseX - tile.posX,
          offsetY: mouseY - tile.posY,
        };
        return false;
      }
    }
  }
}

// Add a new function to recenter a tile after rotation
function recenterTileAfterRotation(tile, originalPosX, originalPosY) {
  // Get the blocks before and after rotation
  const blocksBeforeRotation = getRotatedBlocks(tile.blocks, (tile.rotation + 3) % 4);
  const blocksAfterRotation = getRotatedBlocks(tile.blocks, tile.rotation);
  
  // Find the bounds of the tile before rotation
  let minXBefore = Infinity, maxXBefore = -Infinity, minYBefore = Infinity, maxYBefore = -Infinity;
  for (let [dx, dy] of blocksBeforeRotation) {
    minXBefore = Math.min(minXBefore, dx);
    maxXBefore = Math.max(maxXBefore, dx);
    minYBefore = Math.min(minYBefore, dy);
    maxYBefore = Math.max(maxYBefore, dy);
  }
  
  // Find the bounds of the tile after rotation
  let minXAfter = Infinity, maxXAfter = -Infinity, minYAfter = Infinity, maxYAfter = -Infinity;
  for (let [dx, dy] of blocksAfterRotation) {
    minXAfter = Math.min(minXAfter, dx);
    maxXAfter = Math.max(maxXAfter, dx);
    minYAfter = Math.min(minYAfter, dy);
    maxYAfter = Math.max(maxYAfter, dy);
  }
  
  // Calculate the offset differences to maintain the same center position
  const offsetX = ((minXBefore + maxXBefore) - (minXAfter + maxXAfter)) / 2 * cellSize;
  const offsetY = ((minYBefore + maxYBefore) - (minYAfter + maxYAfter)) / 2 * cellSize;
  
  // Apply the offset to maintain the center position
  tile.posX = originalPosX + offsetX;
  tile.posY = originalPosY + offsetY;
}

// Draw the selected tile as it's dragged
function drawSelectedTile() {
  let rotatedBlocks = getRotatedBlocks(
    selectedTile.blocks,
    selectedTile.rotation
  );

  // Draw shadow
  fill(0, 0, 0, 20);
  noStroke();
  for (let [dx, dy] of rotatedBlocks) {
    rect(
      mouseX - selectedTile.offsetX + dx * cellSize + 2,
      mouseY - selectedTile.offsetY + dy * cellSize + 2,
      cellSize,
      cellSize,
      4
    );
  }

  // Draw tile
  fill(selectedTile.color);
  stroke(255);
  strokeWeight(1);
  for (let [dx, dy] of rotatedBlocks) {
    rect(
      mouseX - selectedTile.offsetX + dx * cellSize,
      mouseY - selectedTile.offsetY + dy * cellSize,
      cellSize,
      cellSize,
      4
    );
  }
}

// Update the selected tile position while dragging
function mouseDragged() {
  if (selectedTile && !gameWon) {
    // Update the actual tile position in the tiles array
    tiles[selectedTile.index].posX = mouseX - selectedTile.offsetX;
    tiles[selectedTile.index].posY = mouseY - selectedTile.offsetY;

    // Update the selected tile's position too
    selectedTile.posX = mouseX - selectedTile.offsetX;
    selectedTile.posY = mouseY - selectedTile.offsetY;

    return false; // Prevent default behavior
  }
}

// Place the tile on the grid when released
function mouseReleased() {
  if (selectedTile && !gameWon) {
    let gridX = Math.round((mouseX - selectedTile.offsetX) / cellSize);
    let gridY = Math.round((mouseY - selectedTile.offsetY) / cellSize);
    let rotatedBlocks = getRotatedBlocks(
      selectedTile.blocks,
      selectedTile.rotation
    );
    let fits = true;

    // Check if tile fits within grid
    for (let [dx, dy] of rotatedBlocks) {
      let newX = gridX + dx;
      let newY = gridY + dy;
      if (
        newX < 0 ||
        newX >= gridSize ||
        newY < 0 ||
        newY >= gridSize ||
        grid[newX][newY] !== 0
      ) {
        fits = false;
        break;
      }
    }

    if (fits) {
      // Place the tile
      for (let [dx, dy] of rotatedBlocks) {
        grid[gridX + dx][gridY + dy] = selectedTile.color;
      }

      // Remove the used tile from the tiles array
      tiles.splice(selectedTile.index, 1);

      // Add a new random tile to the bottom row
      addNewTile();

      // Reposition all tiles evenly
      repositionTiles();

      if (!timerStarted) {
        timerStarted = true;
      }
      checkWinCondition();
    } else {
      // If it doesn't fit, return the tile to its original position
      tiles[selectedTile.index].posX = selectedTile.posX;
      tiles[selectedTile.index].posY = selectedTile.posY;
    }

    selectedTile = null;
  }
}

// Add a new tile to replace a used one
function addNewTile() {
  // Define all possible tile shapes
  const allTiles = [
    // Original 4-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      color: "#3498db", // Blue
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      color: "#e74c3c", // Red
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
      color: "#2ecc71", // Green
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ],
      color: "#f1c40f", // Yellow
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      color: "#9b59b6", // Purple
    },
    {
      blocks: [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      color: "#e67e22", // Orange
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      color: "#1abc9c", // Turquoise
    },

    // New 3-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      color: "#34495e", // Dark blue/gray
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      color: "#16a085", // Dark green
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      color: "#d35400", // Dark orange
    },

    // New 5-block pieces
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
      ],
      color: "#8e44ad", // Dark purple
    },
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      color: "#c0392b", // Dark red
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      color: "#27ae60", // Medium green
    },
    {
      blocks: [
        [2, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      color: "#f39c12", // Gold
    },
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      color: "#7f8c8d", // Gray
    },
  ];

  // Choose a random tile shape
  const randomIndex = Math.floor(Math.random() * allTiles.length);
  const tileShape = allTiles[randomIndex];

  // Create a new tile
  const newTile = {
    blocks: [...tileShape.blocks], // Clone the blocks array
    color: tileShape.color,
    offsetX: 0,
    offsetY: 0,
    placed: false,
    rotation: 0,
  };

  // Add the new tile to the tiles array
  tiles.push(newTile);

  // Reposition all tiles
  repositionTiles();
}

// Update the repositionTiles function to place tiles below the grid
function repositionTiles() {
  // Calculate the total width of the grid
  const gridWidth = gridSize * cellSize;
  
  // Calculate the starting Y position (just below the grid)
  const startY = gridSize * cellSize + 40; // 40px padding below grid
  
  // Calculate the maximum width of each tile to determine proper spacing
  const tileWidths = tiles.map(tile => {
    const rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);
    let minX = Infinity, maxX = -Infinity;
    for (let [dx, dy] of rotatedBlocks) {
      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);
    }
    return (maxX - minX + 1) * cellSize;
  });
  
  // Calculate the total width needed for all tiles
  const totalTileWidth = tileWidths.reduce((sum, width) => sum + width, 0);
  
  // Calculate the spacing between tiles (equal spacing)
  const spacing = (gridWidth - totalTileWidth) / (tiles.length + 1);
  
  // Position each tile with equal spacing
  let currentX = spacing; // Start after the first spacing gap
  
  for (let i = 0; i < tiles.length; i++) {
    // Calculate the bounds of the current tile
    const rotatedBlocks = getRotatedBlocks(tiles[i].blocks, tiles[i].rotation);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let [dx, dy] of rotatedBlocks) {
      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);
      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);
    }
    
    const tileWidth = (maxX - minX + 1) * cellSize;
    const tileHeight = (maxY - minY + 1) * cellSize;
    
    // Position the tile with its center at the current X position
    const centerX = currentX + tileWidth / 2;
    
    // Calculate the center of mass of the rotated blocks
    let centerBlocksX = 0, centerBlocksY = 0;
    for (let [dx, dy] of rotatedBlocks) {
      centerBlocksX += dx;
      centerBlocksY += dy;
    }
    centerBlocksX /= rotatedBlocks.length;
    centerBlocksY /= rotatedBlocks.length;
    
    // Position the tile so that its center of mass is at the calculated position
    tiles[i].posX = centerX - centerBlocksX * cellSize;
    
    // Center the tile vertically in the bottom area
    const centerY = startY + 50; // Center of the 100px high bottom area
    tiles[i].posY = centerY - centerBlocksY * cellSize;
    
    // Move to the next position
    currentX += tileWidths[i] + spacing;
  }
}

// Rotate blocks based on rotation state (0, 1, 2, 3 = 0°, 90°, 180°, 270°)
function getRotatedBlocks(blocks, rotation) {
  if (rotation === 0) {
    return blocks.map(([x, y]) => [x, y]); // No rotation needed
  }
  
  // Calculate the center of mass
  let centerX = 0, centerY = 0;
  for (let [x, y] of blocks) {
    centerX += x;
    centerY += y;
  }
  centerX /= blocks.length;
  centerY /= blocks.length;
  
  // Rotate around the center of mass
  let rotated = blocks.map(([x, y]) => {
    // Translate to origin (relative to center of mass)
    const relX = x - centerX;
    const relY = y - centerY;
    
    // Apply rotation
    let newX, newY;
    if (rotation === 1) { // 90° clockwise
      newX = -relY;
      newY = relX;
    } else if (rotation === 2) { // 180°
      newX = -relX;
      newY = -relY;
    } else { // 270° clockwise (or 90° counterclockwise)
      newX = relY;
      newY = -relX;
    }
    
    // Translate back and round to ensure we get integer coordinates
    return [Math.round(newX + centerX), Math.round(newY + centerY)];
  });
  
  return rotated;
}

// Update the timer
function updateTimer() {
  if (timerStarted && !gameWon) {
    timer = frameCount / 60; // Seconds since first placement
  }
}

// Calculate and display score and timer
function updateScoreAndTimerDisplay() {
  let timePenalty = timer > 30 ? Math.floor(timer - 30) * 50 : 0;
  let overPenalty = calculateOverPenalty();
  let currentScore = Math.max(0, score - timePenalty - overPenalty);

  timeDisplay.textContent = `Time: ${timerStarted ? Math.floor(timer) : 0}s`;
  scoreDisplay.textContent = `Score: ${currentScore}`;
}

// Replace the old displayScoreAndTimer function
function displayScoreAndTimer() {
  updateScoreAndTimerDisplay();
}

// Calculate penalty for covering non-pattern squares
function calculateOverPenalty() {
  let penalty = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (
        grid[i][j] !== 0 &&
        !targetShape.some(([x, y]) => x === i && y === j)
      ) {
        penalty += 100;
      }
    }
  }
  return penalty;
}

// Check if the player has won
function checkWinCondition() {
  let allCovered = targetShape.every(([x, y]) => grid[x][y] !== 0);
  if (allCovered) {
    gameWon = true;
    score = Math.max(
      0,
      score -
        (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
        calculateOverPenalty()
    );
  }
}

// Display win message and show the completed animal shape
function displayWinMessage() {
  // Calculate final score
  let finalScore = Math.max(
    0,
    score -
      (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
      calculateOverPenalty()
  );

  // Create the completed animal shape with the current animal's colors
  const completedShapeCanvas = drawCompletedShape();

  // Clear any previous animal display
  const previousAnimal = document.getElementById("completed-animal-win");
  if (previousAnimal) {
    previousAnimal.remove();
  }

  // Add ID to the canvas for easy reference
  completedShapeCanvas.id = "completed-animal-win";

  // Find the win modal title
  const winModalTitle = winModal.querySelector("h2");

  // Insert the canvas after the title
  winModalTitle.insertAdjacentElement("afterend", completedShapeCanvas);

  // Update the win modal title to include the animal name
  winModalTitle.textContent = `${selectedAnimal} Completed!`;

  // Show win modal with overlay
  finalScoreElement.textContent = finalScore;
  winModal.style.display = "block";
  modalOverlay.style.display = "block";

  // Log the animal and colors for debugging
  console.log("Win modal - Animal:", selectedAnimal);
  console.log("Win modal - Colors:", animalColors);

  // Prevent immediate closing if user was clicking when they won
  setTimeout(() => {
    modalOverlay.addEventListener("click", function checkClick(event) {
      if (event.target === modalOverlay) {
        closeAllModals();
        modalOverlay.removeEventListener("click", checkClick);
      }
    });
  }, 100);
}

// Submit score to leaderboard
async function submitScore() {
  const initials = playerInitialsInput.value.toUpperCase();
  const email = playerEmailInput.value;

  // Validate inputs
  if (!initials || initials.length > 3) {
    alert("Please enter 1-3 letters for your initials.");
    return;
  }

  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  // Calculate final score
  let finalScore = Math.max(
    0,
    score -
      (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
      calculateOverPenalty()
  );

  // Show loading state
  submitScoreButton.textContent = "Submitting...";
  submitScoreButton.disabled = true;

  try {
    // Insert score into Supabase
    const { data, error } = await supabase.from("leaderboard").insert([
      {
        initials: initials,
        score: finalScore,
        email: email,
        animal: selectedAnimal, // Store the animal type
      },
    ]);

    if (error) throw error;

    // Hide win modal and show leaderboard
    winModal.style.display = "none";

    // Fetch and display leaderboard
    await fetchLeaderboard(email);

    // Show leaderboard modal
    leaderboardModal.style.display = "block";
    modalOverlay.style.display = "block";
  } catch (error) {
    console.error("Error submitting score:", error);
    alert("Error submitting score. Please try again.");
  } finally {
    // Reset button state
    submitScoreButton.textContent = "Submit Score";
    submitScoreButton.disabled = false;
  }
}

// Fetch leaderboard data from Supabase
async function fetchLeaderboard(playerEmail = null) {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch top 10 scores for today
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .gte("created_at", today)
      .lt("created_at", today + "T23:59:59")
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Clear previous entries
    leaderboardEntriesElement.innerHTML = "";

    // Create a header for the leaderboard
    const header = document.createElement("div");
    header.className = "leaderboard-header";
    header.innerHTML = `
      <span>Rank</span>
      <span>Player</span>
      <span>Animal</span>
      <span>Score</span>
    `;
    leaderboardEntriesElement.appendChild(header);

    // Add the completed animal shape to the leaderboard modal
    const completedShapeCanvas = drawCompletedShape();

    // Clear any previous animal display
    const previousAnimal = document.getElementById(
      "completed-animal-leaderboard"
    );
    if (previousAnimal) {
      previousAnimal.remove();
    }

    // Add ID to the canvas for easy reference
    completedShapeCanvas.id = "completed-animal-leaderboard";

    // Find the leaderboard modal title
    const leaderboardTitle = document.querySelector("#leaderboard-modal h2");

    // Insert the canvas after the title
    leaderboardTitle.insertAdjacentElement("afterend", completedShapeCanvas);

    // Update the leaderboard title to include the animal name
    leaderboardTitle.textContent = `Today's ${selectedAnimal} Leaderboard`;

    // Reset current player rank
    currentPlayerRank = null;

    // Display leaderboard entries
    if (data.length === 0) {
      const noEntries = document.createElement("div");
      noEntries.className = "no-entries";
      noEntries.textContent = "No scores yet today. Be the first!";
      leaderboardEntriesElement.appendChild(noEntries);
    } else {
      data.forEach((entry, index) => {
        const rank = index + 1;

        // Check if this is the current player's entry
        const isCurrentPlayer = playerEmail && entry.email === playerEmail;
        if (isCurrentPlayer) {
          currentPlayerRank = rank;
        }

        const entryElement = document.createElement("div");
        entryElement.className = `leaderboard-entry${
          isCurrentPlayer ? " highlight" : ""
        }`;
        entryElement.innerHTML = `
          <span>${rank}</span>
          <span>${entry.initials}</span>
          <span>${entry.animal || "Unknown"}</span>
          <span>${entry.score}</span>
        `;
        leaderboardEntriesElement.appendChild(entryElement);
      });

      // If player is not in top 10 but we have their email, fetch their rank
      if (playerEmail && !currentPlayerRank) {
        const { data: playerData, error: playerError } = await supabase
          .from("leaderboard")
          .select("*")
          .eq("email", playerEmail)
          .gte("created_at", today)
          .lt("created_at", today + "T23:59:59")
          .order("created_at", { ascending: false })
          .limit(1);

        if (!playerError && playerData.length > 0) {
          // Get player's rank
          const { count, error: countError } = await supabase
            .from("leaderboard")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today)
            .lt("created_at", today + "T23:59:59")
            .gt("score", playerData[0].score);

          if (!countError) {
            const playerRank = count + 1;

            // Add separator
            const separator = document.createElement("div");
            separator.className = "leaderboard-separator";
            separator.innerHTML = "...";
            separator.style.textAlign = "center";
            leaderboardEntriesElement.appendChild(separator);

            const playerEntry = document.createElement("div");
            playerEntry.className = "leaderboard-entry highlight";
            playerEntry.innerHTML = `
              <span>${playerRank}</span>
              <span>${playerData[0].initials}</span>
              <span>${playerData[0].animal || "Unknown"}</span>
              <span>${playerData[0].score}</span>
            `;
            leaderboardEntriesElement.appendChild(playerEntry);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    leaderboardEntriesElement.innerHTML = "<p>Error loading leaderboard</p>";
  }
}

// Close leaderboard modal
function closeLeaderboard() {
  leaderboardModal.style.display = "none";
  modalOverlay.style.display = "none";
}

// Reset game
function resetGame() {
  // Hide modals and overlay
  winModal.style.display = "none";
  leaderboardModal.style.display = "none";
  modalOverlay.style.display = "none"; // Make sure overlay is hidden

  // Reset game state
  grid = [];
  tiles = [];
  selectedTile = null;
  timer = 0;
  timerStarted = false;
  score = 10000;
  gameWon = false;
  frameCount = 0;

  // Clear inputs
  playerInitialsInput.value = "";
  playerEmailInput.value = "";

  // Initialize new game
  initializeGrid();
  defineTargetShape();
  defineTiles();
}

// Add functions for instructions
function showInstructions() {
  instructionsModal.style.display = "block";
  modalOverlay.style.display = "block";
}

function closeInstructions() {
  instructionsModal.style.display = "none";
  modalOverlay.style.display = "none";
}

// Update the keyPressed function to use the same adjustment
function keyPressed() {
  // Check if 'R' key is pressed
  if (key === "r" || key === "R") {
    // If a tile is selected, rotate it
    if (selectedTile) {
      // Rotate
      selectedTile.rotation = (selectedTile.rotation + 1) % 4;

      // Update the original tile in the tiles array
      tiles[selectedTile.index].rotation = selectedTile.rotation;

      return false; // Prevent default behavior
    }

    // If no tile is selected, check if we're hovering over a tile to rotate
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      let rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);

      // Check if mouse is over any block of the tile
      for (let [dx, dy] of rotatedBlocks) {
        let x = tile.posX + dx * cellSize;
        let y = tile.posY + dy * cellSize;

        if (
          mouseX > x &&
          mouseX < x + cellSize &&
          mouseY > y &&
          mouseY < y + cellSize
        ) {
          // Rotate the tile
          tiles[i].rotation = (tile.rotation + 1) % 4;
          
          return false; // Prevent default behavior
        }
      }
    }
  }
  return true;
}

// Add a new function to adjust the offset after rotation
function adjustOffsetAfterRotation(tile, oldBlocks, newBlocks) {
  // Find the bounds of the old shape
  let minXOld = Infinity, maxXOld = -Infinity, minYOld = Infinity, maxYOld = -Infinity;
  for (let [dx, dy] of oldBlocks) {
    minXOld = Math.min(minXOld, dx);
    maxXOld = Math.max(maxXOld, dx);
    minYOld = Math.min(minYOld, dy);
    maxYOld = Math.max(maxYOld, dy);
  }
  
  // Find the bounds of the new shape
  let minXNew = Infinity, maxXNew = -Infinity, minYNew = Infinity, maxYNew = -Infinity;
  for (let [dx, dy] of newBlocks) {
    minXNew = Math.min(minXNew, dx);
    maxXNew = Math.max(maxXNew, dx);
    minYNew = Math.min(minYNew, dy);
    maxYNew = Math.max(maxYNew, dy);
  }
  
  // Calculate the offset differences to maintain the same center position
  const offsetXDiff = ((minXOld + maxXOld) - (minXNew + maxXNew)) / 2 * cellSize;
  const offsetYDiff = ((minYOld + maxYOld) - (minYNew + maxYNew)) / 2 * cellSize;
  
  // Adjust the offset to maintain position
  tile.offsetX += offsetXDiff;
  tile.offsetY += offsetYDiff;
  
  // Also adjust the actual position of the tile in the tiles array
  if (tile.index !== undefined) {
    tiles[tile.index].posX += offsetXDiff;
    tiles[tile.index].posY += offsetYDiff;
  }
}

// Add event listeners for modal interactions
function setupModalInteractions() {
  // Get all modals
  const modals = [winModal, leaderboardModal, instructionsModal, modalOverlay];

  // Add click event listener to the modal overlay
  modalOverlay.addEventListener("click", function (event) {
    // Only close if the click was directly on the overlay (not on modal content)
    if (event.target === modalOverlay) {
      closeAllModals();
    }
  });

  // Add keydown event listener for Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  // Prevent clicks inside modals from closing them
  modals.forEach((modal) => {
    modal.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });
}

// Function to close all modals
function closeAllModals() {
  winModal.style.display = "none";
  leaderboardModal.style.display = "none";
  instructionsModal.style.display = "none";
  modalOverlay.style.display = "none";
}

// Draw the completed shape with animal-appropriate colors
function drawCompletedShape() {
  // Create a new canvas element for the completed shape
  const completedShapeCanvas = document.createElement("canvas");
  const shapeSize = 150; // Size of the mini display
  completedShapeCanvas.width = shapeSize;
  completedShapeCanvas.height = shapeSize;
  completedShapeCanvas.style.display = "block";
  completedShapeCanvas.style.margin = "0 auto 20px auto";
  completedShapeCanvas.style.borderRadius = "10px";
  completedShapeCanvas.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

  // Get the 2D context for drawing
  const ctx = completedShapeCanvas.getContext("2d");

  // Find the bounds of the target shape to center it
  let minX = gridSize,
    minY = gridSize,
    maxX = 0,
    maxY = 0;
  for (let [x, y] of targetShape) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  // Calculate the width and height of the shape
  const shapeWidth = maxX - minX + 1;
  const shapeHeight = maxY - minY + 1;

  // Calculate the cell size to fit the shape in the canvas
  const cellSizeMini =
    Math.min(shapeSize / shapeWidth, shapeSize / shapeHeight) * 0.9; // 90% to add some margin

  // Calculate the offset to center the shape
  const offsetX = (shapeSize - shapeWidth * cellSizeMini) / 2;
  const offsetY = (shapeSize - shapeHeight * cellSizeMini) / 2;

  // Fill the background
  ctx.fillStyle = "#f0f4f8";
  ctx.fillRect(0, 0, shapeSize, shapeSize);

  // Draw each cell of the completed shape with appropriate colors
  for (let [x, y, colorIndex = 0] of targetShape) {
    // Get the color from the animal colors array using the colorIndex
    const fillColor = animalColors[colorIndex];

    // Calculate position
    const drawX = offsetX + (x - minX) * cellSizeMini;
    const drawY = offsetY + (y - minY) * cellSizeMini;

    // Draw rounded rectangle
    ctx.beginPath();
    const radius = 2;
    ctx.moveTo(drawX + radius, drawY);
    ctx.lineTo(drawX + cellSizeMini - radius, drawY);
    ctx.arcTo(
      drawX + cellSizeMini,
      drawY,
      drawX + cellSizeMini,
      drawY + radius,
      radius
    );
    ctx.lineTo(drawX + cellSizeMini, drawY + cellSizeMini - radius);
    ctx.arcTo(
      drawX + cellSizeMini,
      drawY + cellSizeMini,
      drawX + cellSizeMini - radius,
      drawY + cellSizeMini,
      radius
    );
    ctx.lineTo(drawX + radius, drawY + cellSizeMini);
    ctx.arcTo(
      drawX,
      drawY + cellSizeMini,
      drawX,
      drawY + cellSizeMini - radius,
      radius
    );
    ctx.lineTo(drawX, drawY + radius);
    ctx.arcTo(
      drawX,
      drawY,
      drawX + radius,
      drawY,
      radius
    );
    ctx.closePath();

    // Set fill and stroke styles
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = "#333333"; // Darker outline for better visibility
    ctx.lineWidth = 1;

    // Apply fill and stroke
    ctx.fill();
    ctx.stroke();
  }

  return completedShapeCanvas;
}
