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
  drawTargetShape();
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
      name: "Cat",
      colors: ["#2c3e50", "#34495e", "#ecf0f1", "#f39c12"], // Dark body, lighter details, white face, orange eyes
      pattern: [
        [5, 1],
        [8, 1], // Ear tips
        [4, 2],
        [5, 2],
        [6, 2],
        [7, 2],
        [8, 2],
        [9, 2], // Head top with ears
        [4, 3],
        [5, 3],
        [6, 3],
        [7, 3],
        [8, 3],
        [9, 3], // Head middle
        [5, 4],
        [6, 4],
        [7, 4],
        [8, 4], // Head bottom
        [6, 5],
        [7, 5], // Neck
        [5, 6],
        [6, 6],
        [7, 6],
        [8, 6], // Body top
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7],
        [8, 7],
        [9, 7], // Body middle
        [3, 8],
        [4, 8],
        [5, 8],
        [7, 8],
        [8, 8],
        [9, 8],
        [10, 8], // Body bottom
        [3, 9],
        [4, 9],
        [9, 9],
        [10, 9], // Legs top
        [2, 10],
        [4, 10],
        [9, 10],
        [11, 10], // Paws
        [6, 8],
        [6, 9],
        [7, 9], // Tail base
        [7, 10],
        [8, 10], // Tail end
      ],
    },
    {
      name: "Shark",
      colors: ["#3498db", "#2980b9", "#bdc3c7", "#e74c3c"], // Blue body, dark blue details, white teeth, red fin
      pattern: [
        [10, 2], // Fin tip
        [9, 3],
        [10, 3], // Fin top
        [3, 4],
        [4, 4],
        [5, 4],
        [6, 4],
        [7, 4],
        [8, 4],
        [9, 4], // Head top
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 5],
        [6, 5],
        [7, 5],
        [8, 5],
        [9, 5],
        [10, 5], // Head with fin
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
        [6, 6],
        [7, 6],
        [8, 6],
        [9, 6],
        [10, 6], // Body top
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7],
        [8, 7],
        [9, 7], // Body middle
        [4, 8],
        [5, 8],
        [6, 8],
        [7, 8],
        [8, 8], // Body bottom
        [5, 9],
        [6, 9],
        [7, 9], // Tail base
        [4, 10],
        [8, 10], // Tail fins
      ],
    },
    {
      name: "Rabbit",
      colors: ["#bdc3c7", "#ecf0f1", "#95a5a6", "#7f8c8d"], // Light gray body, white ears, gray feet
      pattern: [
        [6, 1],
        [9, 1], // Ear tips
        [6, 2],
        [7, 2],
        [8, 2],
        [9, 2], // Ears
        [7, 3],
        [8, 3], // Head top
        [6, 4],
        [7, 4],
        [8, 4],
        [9, 4], // Head
        [6, 5],
        [7, 5],
        [8, 5],
        [9, 5], // Upper body
        [5, 6],
        [6, 6],
        [7, 6],
        [8, 6],
        [9, 6],
        [10, 6], // Middle body
        [5, 7],
        [6, 7],
        [7, 7],
        [8, 7],
        [9, 7],
        [10, 7], // Lower body
        [6, 8],
        [7, 8],
        [8, 8],
        [9, 8], // Bottom
        [6, 9],
        [9, 9], // Feet
      ],
    },
    {
      name: "Turtle",
      colors: ["#8FBC8F", "#3CB371", "#2E8B57", "#BDB76B"], // PaleGreen, MediumSeaGreen, SeaGreen, DarkKhaki
      pattern: [
        [5, 1],
        [6, 1],
        [7, 1],
        [8, 1], // Shell Top
        [4, 2],
        [5, 2],
        [6, 2],
        [7, 2],
        [8, 2],
        [9, 2], // Shell Middle
        [4, 3],
        [5, 3],
        [6, 3],
        [7, 3],
        [8, 3],
        [9, 3], // Shell Bottom
        [3, 4],
        [4, 4],
        [5, 4],
        [6, 4],
        [7, 4],
        [8, 4],
        [9, 4],
        [10, 4], // Body Top
        [3, 5],
        [4, 5],
        [5, 5],
        [6, 5],
        [7, 5],
        [8, 5],
        [9, 5],
        [10, 5], // Body Middle
        [4, 6],
        [5, 6],
        [6, 6],
        [7, 6],
        [8, 6],
        [9, 6], // Body Bottom
        [5, 7],
        [8, 7], // Front Legs
        [5, 8],
        [8, 8], // Back Legs
        [6, 9],
        [7, 9], // Head
      ],
    },
  ];

  // Choose a random animal pattern
  const randomIndex = Math.floor(Math.random() * animalPatterns.length);
  const selectedPattern = animalPatterns[randomIndex];

  // Store the selected animal name and colors globally
  selectedAnimal = selectedPattern.name;
  animalColors = selectedPattern.colors;

  // Set the target shape to the selected pattern
  targetShape = selectedPattern.pattern;

  // Log the selected animal for debugging
  console.log("Selected animal:", selectedAnimal);
  console.log("Animal colors:", animalColors);
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
  const targetColor = color(100, 100, 100, 50); // Light gray with transparency
  const targetStrokeColor = color(150, 150, 150); // Darker gray for outline

  for (let [x, y] of targetShape) {
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
      // Get current blocks before rotation
      const oldBlocks = getRotatedBlocks(
        selectedTile.blocks,
        selectedTile.rotation
      );

      // Rotate
      selectedTile.rotation = (selectedTile.rotation + 1) % 4;

      // Get new blocks after rotation
      const newBlocks = getRotatedBlocks(
        selectedTile.blocks,
        selectedTile.rotation
      );

      // Adjust offset to keep the tile centered under cursor
      adjustOffsetAfterRotation(selectedTile, oldBlocks, newBlocks);

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
          // Rotate the tile and update the original tile in the tiles array
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
  const startY = gridSize * cellSize + 20; // 20px padding below grid

  // Calculate spacing between tiles based on available width
  const spacing = gridWidth / tiles.length;

  // Position each tile
  for (let i = 0; i < tiles.length; i++) {
    // Center the tiles horizontally
    tiles[i].posX = i * spacing + spacing / 2 - cellSize;
    tiles[i].posY = startY;
  }
}

// Rotate blocks based on rotation state (0, 1, 2, 3 = 0°, 90°, 180°, 270°)
function getRotatedBlocks(blocks, rotation) {
  let rotated = blocks.map(([x, y]) => [x, y]);
  for (let i = 0; i < rotation; i++) {
    rotated = rotated.map(([x, y]) => [-y, x]); // Rotate 90° clockwise
  }
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
      // Get current blocks before rotation
      const oldBlocks = getRotatedBlocks(
        selectedTile.blocks,
        selectedTile.rotation
      );

      // Rotate
      selectedTile.rotation = (selectedTile.rotation + 1) % 4;

      // Update the original tile in the tiles array
      tiles[selectedTile.index].rotation = selectedTile.rotation;

      // Get new blocks after rotation
      const newBlocks = getRotatedBlocks(
        selectedTile.blocks,
        selectedTile.rotation
      );

      // Adjust offset to keep the tile centered under cursor
      adjustOffsetAfterRotation(selectedTile, oldBlocks, newBlocks);

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
          // Rotate the tile in the tiles array
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
  // Calculate the center of the old shape
  let oldCenterX = 0,
    oldCenterY = 0;
  for (let [dx, dy] of oldBlocks) {
    oldCenterX += dx;
    oldCenterY += dy;
  }
  oldCenterX /= oldBlocks.length;
  oldCenterY /= oldBlocks.length;

  // Calculate the center of the new shape
  let newCenterX = 0,
    newCenterY = 0;
  for (let [dx, dy] of newBlocks) {
    newCenterX += dx;
    newCenterY += dy;
  }
  newCenterX /= newBlocks.length;
  newCenterY /= newBlocks.length;

  // Adjust the offset to maintain position
  tile.offsetX += (newCenterX - oldCenterX) * cellSize;
  tile.offsetY += (newCenterY - oldCenterY) * cellSize;
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
  completedShapeCanvas.style.borderRadius = "8px";
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

  /*// Add a title with the animal name
  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(selectedAnimal, shapeSize / 2, 15);*/

  // Create a color mapping for this specific animal
  const colorMapping = {};

  // Apply specific coloring rules based on the animal type
  if (selectedAnimal === "Cat") {
    // Color the cat: dark body, white face, orange eyes, lighter details
    for (let [x, y] of targetShape) {
      if (y >= 3 && y <= 5 && x >= 6 && x <= 7) {
        // Face center
        colorMapping[`${x},${y}`] = 2; // White face
      } else if ((x === 6 && y === 3) || (x === 7 && y === 3)) {
        // Eyes
        colorMapping[`${x},${y}`] = 3; // Orange eyes
      } else if (y >= 9 && y <= 10) {
        // Legs and tail
        colorMapping[`${x},${y}`] = 1; // Lighter details
      } else {
        colorMapping[`${x},${y}`] = 0; // Dark body (default)
      }
    }
  } else if (selectedAnimal === "Shark") {
    // Color the shark: blue body, dark blue details, white teeth, red fin
    for (let [x, y] of targetShape) {
      if (y <= 3 || (x >= 9 && y <= 6)) {
        // Fin
        colorMapping[`${x},${y}`] = 3; // Red fin
      } else if (y === 5 && (x === 5 || x === 6 || x === 7)) {
        // Teeth
        colorMapping[`${x},${y}`] = 2; // White teeth
      } else if (x <= 3 || x >= 9 || y >= 9) {
        // Details
        colorMapping[`${x},${y}`] = 1; // Dark blue details
      } else {
        colorMapping[`${x},${y}`] = 0; // Blue body (default)
      }
    }
  } else if (selectedAnimal === "Rabbit") {
    // Color the rabbit: body light gray, ears white, feet dark gray
    for (let [x, y] of targetShape) {
      if (y <= 3) {
        // Ears
        colorMapping[`${x},${y}`] = 1; // White ears
      } else if (y >= 9) {
        // Feet
        colorMapping[`${x},${y}`] = 3; // Dark gray feet
      } else if (y >= 4 && y <= 5 && x >= 7 && x <= 8) {
        // Face
        colorMapping[`${x},${y}`] = 1; // White face
      } else {
        colorMapping[`${x},${y}`] = 0; // Light gray body (default)
      }
    }
  } else {
    // Default coloring if animal type is not recognized
    for (let [x, y] of targetShape) {
      colorMapping[`${x},${y}`] = 0; // Use first color for everything
    }
  }

  // Draw each cell of the completed shape with appropriate colors
  for (let [x, y] of targetShape) {
    // Get the color from the mapping
    const colorIndex = colorMapping[`${x},${y}`] || 0;
    const fillColor = animalColors[colorIndex];

    // Calculate position
    const drawX = offsetX + (x - minX) * cellSizeMini;
    const drawY = offsetY + (y - minY) * cellSizeMini;

    // Draw rounded rectangle
    ctx.beginPath();
    const radius = 3;
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
    ctx.arcTo(drawX, drawY, drawX + radius, drawY, radius);
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
