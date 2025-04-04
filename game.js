let gridSize = 14; // 14x14 grid
let cellSize = 32; // Adjusted cell size to fit the grid
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
// let finalScoreElement;
// let playerInitialsInput;
// let playerEmailInput;
// let submitScoreButton;
let playAgainButton;
let leaderboardEntriesElement;
let closeLeaderboardButton;
let gameContainer;
let currentPlayerRank = null;
let modalOverlay;
let instructionsButton;
let instructionsModal;
let closeInstructionsButton;

// Add these variables at the top of the file, after the other global variables
let isDragging = false;
let clickStartTime = 0;
let startTime = 0; // Start time in milliseconds
let placedSquares = []; // Array to track placed squares with their status (correct/incorrect)

// Add variables to track game over state
let gameOver = false;
let gameOverMessage = "";

function setup() {
  // Update canvas size to fit the grid and cell size (14*32 = 448px for grid)
  const canvas = createCanvas(448, 598);
  console.log("Canvas created with dimensions:", width, "x", height);
  
  gameContainer = document.getElementById("game-container");
  canvas.parent(gameContainer);
  console.log("Canvas added to game container");

  // Set the background color once to make sure canvas is visible
  background("#f0f4f8");
  
  // Draw a test rectangle to verify canvas is working
  fill(255, 0, 0);
  rect(0, 0, 50, 50);
  console.log("Drew test rectangle");

  // Initialize DOM elements with debug info
  winModal = document.getElementById("win-modal");
  console.log("Win modal element:", winModal);
  
  modalOverlay = document.getElementById("modal-overlay");
  console.log("Modal overlay element:", modalOverlay);
  
  playAgainButton = document.getElementById("play-again");
  console.log("Play again button:", playAgainButton);
  
  leaderboardModal = document.getElementById("leaderboard-modal");
  leaderboardEntriesElement = document.getElementById("leaderboard-entries");
  closeLeaderboardButton = document.getElementById("close-leaderboard");
  instructionsButton = document.getElementById("instructions-button");
  instructionsModal = document.getElementById("instructions-modal");
  closeInstructionsButton = document.getElementById("close-instructions");

  // Add event listeners
  if (playAgainButton) {
    playAgainButton.addEventListener("click", resetGame);
    playAgainButton.addEventListener("touchend", function(e) {
      e.preventDefault(); // Prevent any default touch behavior
      resetGame();
    });
    console.log("Added play again button event listeners for both click and touch");
  } else {
    console.error("Could not find play again button");
  }
  
  if (closeLeaderboardButton) {
    closeLeaderboardButton.addEventListener("click", closeLeaderboard);
  }
  
  if (instructionsButton) {
    instructionsButton.addEventListener("click", showInstructions);
  }
  
  if (closeInstructionsButton) {
    closeInstructionsButton.addEventListener("click", closeInstructions);
  }

  // Setup modal interactions
  setupModalInteractions();

  // Initialize game state
  initializeGrid();
  defineTargetShape();
  defineTiles();
  startTime = Date.now(); // Initialize start time
  
  console.log("Setup completed");
}

function draw() {
  // Clear the background at the start of each frame
  background("#f0f4f8");

  drawGrid();
  drawTargetShape();
  drawTiles();
  
  // Draw the selected tile if it's being dragged
  if (selectedTile && isDragging) {
    drawSelectedTile();
  }
}

// Initialize the grid (all cells empty)
function initializeGrid() {
  console.log("Initializing grid with size:", gridSize);
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = 0; // 0 = empty
    }
  }
  console.log("Grid initialized:", grid.length, "x", grid[0].length);
}

// Define a random target shape for the larger grid
function defineTargetShape() {
  // Clear the target shape array
  targetShape = [];

  // Define animal patterns with their names and colors
  const animalPatterns = [
    {
      name: "Dog",
      colors: ["#8B4513"], // Brown
      pattern: [
        // Body
        [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
        [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
        // Head
        [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
        [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        // Ears
        [2, 0], [3, 0], [6, 0], [7, 0],
        // Tail
        [8, 2], [9, 1], [10, 0]
      ].map(([x, y]) => [x, y, 0])
    },
    {
      name: "Fox",
      colors: ["#FF6B00"], // Orange
      pattern: [
        // Body
        [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
        [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
        // Head
        [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
        [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        // Pointed ears
        [2, 0], [3, 0], [7, 0], [8, 0],
        // Tail
        [9, 2], [10, 1], [11, 0]
      ].map(([x, y]) => [x, y, 0])
    },
    {
      name: "Duck",
      colors: ["#FFD700"], // Yellow
      pattern: [
        // Body
        [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
        [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
        // Head
        [3, 1], [4, 1], [5, 1], [6, 1],
        // Bill
        [7, 1], [8, 1],
        // Tail
        [1, 2], [1, 3],
        // Feet
        [4, 5], [5, 5]
      ].map(([x, y]) => [x, y, 0])
    },
    {
      name: "Cat",
      colors: ["#808080"], // Gray
      pattern: [
        // Body
        [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
        [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
        // Head
        [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
        [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        // Pointed ears
        [2, 0], [3, 0], [7, 0], [8, 0],
        // Tail
        [8, 2], [9, 1], [10, 0]
      ].map(([x, y]) => [x, y, 0])
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
  
  // Calculate the vertical offset to center the pattern vertically
  const verticalOffset = Math.floor((gridSize - patternHeight) / 2) - minY;
  
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
  console.log("Pattern centered at:", Math.floor(gridSize / 2));
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
    // {
    //   blocks: [
    //     [0, 0],
    //     [1, 0],
    //     [2, 0],
    //     [1, 1],
    //     [1, 2],
    //   ],
    //   color: "#7f8c8d", // Gray
    // },
    // {
    //   blocks: [
    //     [0, 0], [1, 0], [2, 0], [3, 0],
    //     [0, 1], [1, 1], [2, 1], [3, 1],
    //     [0, 2], [1, 2], [2, 2], [3, 2],
    //     [0, 3], [1, 3], [2, 3], [3, 3],
    //   ],
    //   color: "#7f8c8d", // Gray
    // },
    // {
    //   blocks: [
    //     [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    //     [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
    //     [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
    //     [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
    //     [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
    //   ],
    //   color: "#7f8c8d", // Gray
    // },
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
  console.log("Drawing grid");
  stroke(200);
  strokeWeight(1);
  
  // Draw vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    line(x, 0, x, height - 150);  // Subtract 150 to leave space for tiles
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= height - 150; y += cellSize) {
    line(0, y, width, y);
  }
  
  // Draw the current state of the grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] !== 0) {
        // Find if this square has been evaluated
        const placedSquare = placedSquares.find(square => square.x === i && square.y === j);
        
        if (placedSquare) {
          // Set background color based on placement accuracy
          if (placedSquare.isCorrect) {
            // Light green background for correct placements
            fill(200, 255, 200); // Light green
          } else {
            // Light red background for incorrect placements
            fill(255, 200, 200); // Light red
          }
          
          // Draw the background
          noStroke();
          rect(i * cellSize, j * cellSize, cellSize, cellSize);
        } else {
          // Regular tile without evaluation
          fill(grid[i][j]);
          rect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      } else {
        // Check if this is part of an isolated region
        const isolatedSquare = placedSquares.find(square => square.x === i && square.y === j && square.isIsolated);
        if (isolatedSquare) {
          // Highlight isolated regions with a pattern
          fill(255, 100, 100, 120); // Semi-transparent red
          noStroke();
          rect(i * cellSize, j * cellSize, cellSize, cellSize);
          
          // Add diagonal line pattern to make it clear
          stroke(255, 0, 0);
          strokeWeight(2);
          line(i * cellSize, j * cellSize, (i+1) * cellSize, (j+1) * cellSize);
          line((i+1) * cellSize, j * cellSize, i * cellSize, (j+1) * cellSize);
        }
      }
    }
  }
  
  // Draw checkmarks and X marks for placed squares
  for (let square of placedSquares) {
    if (square.isCorrect) {
      // Draw green checkmark for correct placement
      drawCheckmark(square.x * cellSize + cellSize/2, square.y * cellSize + cellSize/2, cellSize * 0.6);
    } else if (!square.isIsolated) {
      // Draw red X for incorrect placement
      drawXMark(square.x * cellSize + cellSize/2, square.y * cellSize + cellSize/2, cellSize * 0.6);
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
  if (gameWon || gameOver) return; // Disable interaction after winning

  console.log("Mouse pressed at:", mouseX, mouseY);
  clickStartTime = millis(); // Record when the click started
  isDragging = false; // Reset dragging state

  // Handle tile selection for potential dragging
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
        console.log("Selected tile at index:", i);
        // Store the tile for potential dragging along with its original position
        selectedTile = {
          ...tile,
          index: i,
          offsetX: mouseX - tile.posX,
          offsetY: mouseY - tile.posY,
          originalPosX: tile.posX, // Store original X position
          originalPosY: tile.posY  // Store original Y position
        };
        console.log("Tile offset:", selectedTile.offsetX, selectedTile.offsetY);
        console.log("Original position:", selectedTile.originalPosX, selectedTile.originalPosY);
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

  // Check if this is a touch interaction with offset
  const hasTouchOffset = selectedTile.touchYOffset !== undefined;

  // Calculate grid coordinates where the piece would land, accounting for touch offset
  let gridX = Math.round((mouseX - selectedTile.offsetX) / cellSize);
  let gridY;
  
  if (hasTouchOffset) {
    // Adjust for touch offset when calculating the shadow position
    gridY = Math.round(((mouseY - selectedTile.touchYOffset) - selectedTile.offsetY) / cellSize);
  } else {
    gridY = Math.round((mouseY - selectedTile.offsetY) / cellSize);
  }

  // Draw shadow at grid position
  fill(0, 0, 0, 40);
  noStroke();
  for (let [dx, dy] of rotatedBlocks) {
    let newX = gridX + dx;
    let newY = gridY + dy;
    
    // Only draw shadow if position is valid
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && grid[newX][newY] === 0) {
      rect(
        newX * cellSize,
        newY * cellSize,
        cellSize,
        cellSize,
        4
      );
    }
  }

  // Draw actual tile at mouse position with appropriate Y offset for touch
  fill(selectedTile.color);
  stroke(255);
  strokeWeight(1);
  
  // Position X is the same for both mouse and touch
  const tileX = mouseX - selectedTile.offsetX;
  
  // Position Y needs to account for touch offset if present
  const tileY = hasTouchOffset ? 
    (mouseY - selectedTile.touchYOffset) - selectedTile.offsetY : 
    mouseY - selectedTile.offsetY;
  
  for (let [dx, dy] of rotatedBlocks) {
    rect(
      tileX + dx * cellSize,
      tileY + dy * cellSize,
      cellSize,
      cellSize,
      4
    );
  }
}

// Update the selected tile position while dragging
function mouseDragged() {
  if (selectedTile && !gameWon) {
    // If we've moved more than 5 pixels, consider it a drag
    if (!isDragging && dist(mouseX, mouseY, mouseX - selectedTile.offsetX + selectedTile.posX, mouseY - selectedTile.offsetY + selectedTile.posY) > 5) {
      isDragging = true;
      console.log("Started dragging");
    }
    
    if (isDragging) {
      console.log("Dragging tile. Mouse position:", mouseX, mouseY);
      
      // Update the actual tile position in the tiles array
      tiles[selectedTile.index].posX = mouseX - selectedTile.offsetX;
      tiles[selectedTile.index].posY = mouseY - selectedTile.offsetY;

      // Update the selected tile's position too
      selectedTile.posX = mouseX - selectedTile.offsetX;
      selectedTile.posY = mouseY - selectedTile.offsetY;

      console.log("New tile position:", selectedTile.posX, selectedTile.posY);
    }
    return false; // Prevent default behavior
  }
}

// Place the tile on the grid when released
function mouseReleased() {
  if (selectedTile && !gameWon && !gameOver) {
    // Check if this was a click (short duration, minimal movement) or a drag
    const clickDuration = millis() - clickStartTime;
    
    if (!isDragging && clickDuration < 300) {
      // This was a click, not a drag - rotate the tile
      console.log("Rotating tile on click");
      selectedTile.rotation = (selectedTile.rotation + 1) % 4;
      
      // Update the original tile in the tiles array
      tiles[selectedTile.index].rotation = selectedTile.rotation;
      
      // Reset selection
      selectedTile = null;
      return false;
    }
    
    // If we were dragging, try to place the tile
    if (isDragging) {
      console.log("Mouse released after dragging. Attempting to place tile");
      
      let gridX = Math.round((mouseX - selectedTile.offsetX) / cellSize);
      let gridY = Math.round((mouseY - selectedTile.offsetY) / cellSize);
      
      console.log("Grid coordinates:", gridX, gridY);
      
      let rotatedBlocks = getRotatedBlocks(
        selectedTile.blocks,
        selectedTile.rotation
      );
      let fits = true;

      // Check if tile fits within grid
      for (let [dx, dy] of rotatedBlocks) {
        let newX = gridX + dx;
        let newY = gridY + dy;
        console.log("Checking position:", newX, newY);
        
        if (
          newX < 0 ||
          newX >= gridSize ||
          newY < 0 ||
          newY >= gridSize ||
          grid[newX][newY] !== 0
        ) {
          fits = false;
          console.log("Tile doesn't fit at:", newX, newY);
          break;
        }
      }

      if (fits) {
        console.log("Tile fits! Placing on grid");
        
        // Place the tile and check each square's accuracy
        for (let [dx, dy] of rotatedBlocks) {
          let newX = gridX + dx;
          let newY = gridY + dy;
          
          // Check if this square overlaps with the target shape
          let isCorrect = targetShape.some(([x, y]) => x === newX && y === newY);
          
          // Place the tile on the grid
          grid[newX][newY] = selectedTile.color;
          
          // Add to placedSquares with status
          placedSquares.push({
            x: newX,
            y: newY,
            isCorrect: isCorrect
          });
        }

        // Remove the used tile from the tiles array
        tiles.splice(selectedTile.index, 1);

        // Reset selection and dragging state BEFORE checking win condition
        selectedTile = null;
        isDragging = false;

        // Add a new random tile to the bottom row
        addNewTile();

        // Reposition all tiles evenly
        repositionTiles();

        if (!timerStarted) {
          timerStarted = true;
          startTime = Date.now(); // Initialize the start time
        }
        
        // Check for isolated spaces after placing the tile
        checkForIsolatedSpaces();
        
        // Only check win condition if not game over
        if (!gameOver) {
          // Check win condition after everything else is done
          checkWinCondition();
          // Debug modal state after checking win condition
          setTimeout(debugModal, 500);
        }
      } else {
        console.log("Tile doesn't fit, returning to original position");
        // If it doesn't fit, return the tile to its original position
        // Use the stored original position instead of the current position
        tiles[selectedTile.index].posX = selectedTile.originalPosX;
        tiles[selectedTile.index].posY = selectedTile.originalPosY;
        
        // Reset selection and dragging state
        selectedTile = null;
        isDragging = false;
      }
    } else {
      // If we weren't dragging, just reset the states
      selectedTile = null;
      isDragging = false;
    }
  } else {
    // Always reset states even if there's no selected tile or game is won
    selectedTile = null;
    isDragging = false;
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

// Check if the player has won
function checkWinCondition() {
  // Don't check again if already won
  if (gameWon) {
    console.log("Game already won, not checking again");
    return;
  }
  
  console.log("Checking win condition...");
  let allCovered = true;
  
  // Check each target shape cell to see if it's covered
  for (let [x, y] of targetShape) {
    if (grid[x][y] === 0) {
      allCovered = false;
      console.log(`Target cell [${x}, ${y}] is not covered.`);
      break;
    }
  }
  
  if (allCovered) {
    console.log("WIN CONDITION MET! All target cells are covered.");
    gameWon = true;
    score = Math.max(
      0,
      score -
        (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
        calculateOverPenalty()
    );
    
    // Call displayWinMessage immediately and asynchronously
    console.log("Displaying win message...");
    setTimeout(() => {
      displayWinMessage().catch(error => {
        console.error("Error displaying win message:", error);
      });
    }, 100);
  } else {
    console.log("Win condition not met yet.");
  }
}

// Display win message and show the completed animal shape
async function displayWinMessage() {
  console.log("displayWinMessage function called");
  
  try {
    let imageUrl;
    
    // Fetch appropriate image based on the selected animal
    switch(selectedAnimal) {
      case "Dog":
        console.log("Fetching dog image...");
        try {
          const dogResponse = await fetch('https://dog.ceo/api/breeds/image/random');
          const dogData = await dogResponse.json();
          if (dogData.status === "success") {
            imageUrl = dogData.message;
          } else {
            // Fallback to alternative API
            const alternativeDogResponse = await fetch('https://random.dog/woof.json');
            const alternativeDogData = await alternativeDogResponse.json();
            imageUrl = alternativeDogData.url;
          }
        } catch (dogError) {
          console.error("Error fetching dog image:", dogError);
          imageUrl = "https://images.dog.ceo/breeds/retriever-golden/n02099601_2280.jpg"; // Fallback image
        }
        break;
        
      case "Cat":
        console.log("Fetching cat image...");
        try {
          const catResponse = await fetch('https://api.thecatapi.com/v1/images/search');
          const catData = await catResponse.json();
          imageUrl = catData[0]?.url || "https://cdn2.thecatapi.com/images/8kq.jpg";
        } catch (catError) {
          console.error("Error fetching cat image:", catError);
          imageUrl = "https://cdn2.thecatapi.com/images/8kq.jpg"; // Fallback image
        }
        break;
        
      case "Duck":
        console.log("Fetching duck image...");
        try {
          imageUrl = "https://random-d.uk/api/randomimg"; // Direct image URL, no parsing needed
        } catch (duckError) {
          console.error("Error using duck image:", duckError);
          imageUrl = "https://random-d.uk/api/60.jpg"; // Fallback image
        }
        break;
        
      case "Fox":
        console.log("Fetching fox image...");
        try {
          const foxResponse = await fetch('https://randomfox.ca/floof/');
          const foxData = await foxResponse.json();
          imageUrl = foxData.image || "https://randomfox.ca/images/41.jpg";
        } catch (foxError) {
          console.error("Error fetching fox image:", foxError);
          imageUrl = "https://randomfox.ca/images/41.jpg"; // Fallback image
        }
        break;
        
      default:
        console.log("No animal type matched, using default image");
        imageUrl = "https://source.unsplash.com/300x300/?animal"; // Generic animal image
        break;
    }
    
    console.log("Image URL:", imageUrl);

    // Create an image element
    const animalImage = document.createElement('img');
    animalImage.src = imageUrl;
    animalImage.style.maxWidth = '200px';
    animalImage.style.maxHeight = '200px';
    animalImage.style.objectFit = 'contain';
    animalImage.style.margin = '0 auto 20px auto';
    animalImage.style.display = 'block';
    animalImage.style.borderRadius = '10px';
    animalImage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Add loading indication
    animalImage.onerror = () => {
      console.error("Error loading image:", imageUrl);
      // Fall back to the original pixel art if the image fails to load
      const fallbackCanvas = drawCompletedShape();
      animalImage.parentNode.replaceChild(fallbackCanvas, animalImage);
    };

    // Clear any previous animal display
    const previousAnimal = document.getElementById("completed-animal-win");
    if (previousAnimal) {
      previousAnimal.remove();
    }

    // Add ID to the image for easy reference
    animalImage.id = "completed-animal-win";

    // Find the win modal title
    const winModalTitle = winModal.querySelector("h2");

    // Insert the image after the title
    winModalTitle.insertAdjacentElement("afterend", animalImage);

    // Update the win modal title to include the animal name
    winModalTitle.textContent = `${selectedAnimal} Completed!`;

    // Show win modal with overlay
    winModal.style.display = "block";
    modalOverlay.style.display = "block";

    // Log the animal and colors for debugging
    console.log("Win modal - Animal:", selectedAnimal);
    console.log("Win modal - Colors:", animalColors);
    console.log("Win modal is now visible");

    // Prevent immediate closing if user was clicking when they won
    setTimeout(() => {
      modalOverlay.addEventListener("click", function checkClick(event) {
        if (event.target === modalOverlay) {
          closeAllModals();
          modalOverlay.removeEventListener("click", checkClick);
        }
      });
    }, 100);
  } catch (error) {
    console.error("Error in displayWinMessage:", error);
    // Fallback to the original pixel art if the image fetch fails
    const completedShapeCanvas = drawCompletedShape();
    const previousAnimal = document.getElementById("completed-animal-win");
    if (previousAnimal) {
      previousAnimal.remove();
    }
    completedShapeCanvas.id = "completed-animal-win";
    const winModalTitle = winModal.querySelector("h2");
    winModalTitle.insertAdjacentElement("afterend", completedShapeCanvas);
    winModalTitle.textContent = `${selectedAnimal} Completed!`;
    winModal.style.display = "block";
    modalOverlay.style.display = "block";
    console.log("Fallback win modal is now visible");
  }
}

// Submit score to leaderboard
async function submitScore() {
  // const initials = playerInitialsInput.value.toUpperCase();
  // const email = playerEmailInput.value;

  // // Validate inputs
  // if (!initials || initials.length > 3) {
  //   alert("Please enter 1-3 letters for your initials.");
  //   return;
  // }

  // if (!email || !email.includes("@")) {
  //   alert("Please enter a valid email address.");
  //   return;
  // }

  // // Calculate final score
  // let finalScore = Math.max(
  //   0,
  //   score -
  //     (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
  //     calculateOverPenalty()
  // );

  // // Show loading state
  // submitScoreButton.textContent = "Submitting...";
  // submitScoreButton.disabled = true;

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
    // // Reset button state
    // submitScoreButton.textContent = "Submit Score";
    // submitScoreButton.disabled = false;
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
  // Refresh the entire browser window
  window.location.reload();
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
    // Check if mouse is over any tile to rotate it
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
          console.log("Rotating tile with R key at index:", i);
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

// Add touch event handlers for mobile support
function touchStarted() {
  // Call mousePressed to handle the touch start
  mousePressed();
  
  // Add Y-offset for touch input
  if (selectedTile) {
    // Store the original position before applying touch offset if not already stored
    if (selectedTile.originalPosX === undefined) {
      selectedTile.originalPosX = selectedTile.posX;
      selectedTile.originalPosY = selectedTile.posY;
    }
    
    selectedTile.touchYOffset = 250; // Add 250px offset for touch input
    selectedTile.posY -= selectedTile.touchYOffset; // Move the piece up immediately
  }
  
  return false; // Prevent default behavior
}

function touchMoved() {
  // Only process dragging if we have a selected tile
  if (selectedTile && !gameWon && !gameOver) {
    // If we've moved more than 5 pixels, consider it a drag
    if (!isDragging) {
      const touchAdjustedY = selectedTile.touchYOffset ? mouseY - selectedTile.touchYOffset : mouseY;
      if (dist(mouseX, touchAdjustedY, selectedTile.posX + selectedTile.offsetX, selectedTile.posY + selectedTile.offsetY) > 5) {
        isDragging = true;
        console.log("Started touch dragging");
        
        // Make sure we have the original position stored
        if (selectedTile.originalPosX === undefined) {
          selectedTile.originalPosX = tiles[selectedTile.index].posX;
          selectedTile.originalPosY = tiles[selectedTile.index].posY;
          console.log("Storing original position:", selectedTile.originalPosX, selectedTile.originalPosY);
        }
      }
    }
    
    if (isDragging) {
      console.log("Touch dragging tile. Touch position:", mouseX, mouseY);
      
      // For touch, adjust the Y coordinate by touchYOffset
      const adjustedMouseY = selectedTile.touchYOffset ? mouseY - selectedTile.touchYOffset : mouseY;
      
      // Update the actual tile position in the tiles array
      tiles[selectedTile.index].posX = mouseX - selectedTile.offsetX;
      tiles[selectedTile.index].posY = adjustedMouseY - selectedTile.offsetY;

      // Update the selected tile's position too
      selectedTile.posX = mouseX - selectedTile.offsetX;
      selectedTile.posY = adjustedMouseY - selectedTile.offsetY;

      console.log("New tile position:", selectedTile.posX, selectedTile.posY);
    }
  }
  return false; // Prevent default behavior
}

function touchEnded() {
  // Store the current position before removing offset
  const finalX = selectedTile ? mouseX - selectedTile.offsetX : mouseX;
  const finalY = selectedTile && selectedTile.touchYOffset ? 
    mouseY - selectedTile.offsetY - selectedTile.touchYOffset : 
    mouseY - (selectedTile ? selectedTile.offsetY : 0);
  
  console.log("Touch ended. Final position:", finalX, finalY);
  console.log("Original position (if tile selected):", 
    selectedTile ? selectedTile.originalPosX : "N/A", 
    selectedTile ? selectedTile.originalPosY : "N/A");
  
  // Remove the touch offset before releasing
  if (selectedTile && selectedTile.touchYOffset) {
    selectedTile.posY += selectedTile.touchYOffset;
    delete selectedTile.touchYOffset;
  }
  
  // Store original mouseX/mouseY
  const originalMouseX = mouseX;
  const originalMouseY = mouseY;
  
  // Temporarily modify mouseX/mouseY to place at the final position
  mouseX = finalX + (selectedTile ? selectedTile.offsetX : 0);
  mouseY = finalY + (selectedTile ? selectedTile.offsetY : 0);
  
  // Call mouseReleased to handle the touch end
  mouseReleased();
  
  // Restore original mouseX/mouseY
  mouseX = originalMouseX;
  mouseY = originalMouseY;
  
  return false; // Prevent default behavior
}

// Add function to draw a checkmark
function drawCheckmark(x, y, size) {
  push();
  stroke(0, 180, 0); // Darker green
  strokeWeight(3);
  noFill();
  
  // Draw checkmark
  beginShape();
  vertex(x - size/2, y);
  vertex(x - size/6, y + size/3);
  vertex(x + size/2, y - size/2);
  endShape();
  pop();
}

// Add function to draw an X mark
function drawXMark(x, y, size) {
  push();
  stroke(220, 0, 0); // Darker red
  strokeWeight(3);
  
  // Draw X
  line(x - size/2, y - size/2, x + size/2, y + size/2);
  line(x + size/2, y - size/2, x - size/2, y + size/2);
  pop();
}

// Add this function for debugging modal issues
function debugModal() {
  console.log("=== DEBUG MODAL INFO ===");
  console.log("gameWon:", gameWon);
  console.log("winModal exists:", !!winModal);
  console.log("modalOverlay exists:", !!modalOverlay);
  console.log("winModal display style:", winModal ? winModal.style.display : "null");
  console.log("modalOverlay display style:", modalOverlay ? modalOverlay.style.display : "null");
  console.log("selectedAnimal:", selectedAnimal);
  
  // Check if all target cells are covered
  let targetCellsCovered = 0;
  let targetCellsTotal = targetShape.length;
  for (let [x, y] of targetShape) {
    if (grid[x][y] !== 0) {
      targetCellsCovered++;
    }
  }
  console.log(`Target cells covered: ${targetCellsCovered}/${targetCellsTotal}`);
  console.log("=====================");
}

// Calculate penalty for placing tiles outside the target shape
function calculateOverPenalty() {
  // Count how many squares are placed outside the target shape
  let overCount = 0;
  for (let square of placedSquares) {
    if (!square.isCorrect) {
      overCount++;
    }
  }
  
  // Each square outside the target shape incurs a 100-point penalty
  return overCount * 100;
}

// Function to check if the grid has isolated spaces that can't fit any tiles
function checkForIsolatedSpaces() {
  if (gameWon || gameOver) return; // Don't check if game is already over
  
  console.log("Checking for isolated spaces...");
  
  // First, find all empty cells
  const emptyCells = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }
  
  if (emptyCells.length === 0) return; // No empty cells, no need to check
  
  // Group empty cells into connected regions
  const regions = [];
  const visited = new Set();
  
  for (const [x, y] of emptyCells) {
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    
    // Start a new region with this cell
    const region = [];
    const queue = [[x, y]];
    visited.add(key);
    
    // BFS to find all connected empty cells
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      region.push([cx, cy]);
      
      // Check adjacent cells (up, right, down, left)
      const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
      for (const [dx, dy] of directions) {
        const nx = cx + dx;
        const ny = cy + dy;
        
        // Skip if out of bounds
        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
        
        // Skip if not empty or already visited
        const nKey = `${nx},${ny}`;
        if (grid[nx][ny] !== 0 || visited.has(nKey)) continue;
        
        // Add to queue and mark as visited
        queue.push([nx, ny]);
        visited.add(nKey);
      }
    }
    
    // Add this region to our list of regions
    regions.push(region);
  }
  
  console.log(`Found ${regions.length} empty regions`);
  
  // For each region, check if any tile can fit
  for (const region of regions) {
    // Skip large regions (arbitrary threshold - regions with more than 30 cells are likely still playable)
    if (region.length > 30) continue;
    
    let canFitAnyTile = false;
    
    // Try to fit each available tile in each possible position and orientation
    tilesLoop: for (const tile of tiles) {
      // Try all 4 rotations
      for (let rotation = 0; rotation < 4; rotation++) {
        const rotatedBlocks = getRotatedBlocks(tile.blocks, rotation);
        
        // Try placing at each empty cell
        for (const [x, y] of region) {
          let fits = true;
          
          // Check if all blocks of the tile fit within the region
          for (const [dx, dy] of rotatedBlocks) {
            const nx = x + dx;
            const ny = y + dy;
            
            // Check bounds and if cell is empty
            if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize || grid[nx][ny] !== 0) {
              fits = false;
              break;
            }
          }
          
          if (fits) {
            canFitAnyTile = true;
            break tilesLoop; // No need to check further
          }
        }
      }
    }
    
    // If this region can't fit any tile, set game over state
    if (!canFitAnyTile) {
      console.log(`Found isolated region of size ${region.length} that can't fit any tile`);
      gameOver = true;
      gameOverMessage = `There's an inaccessible area on the grid. No tiles can fit in the ${region.length} empty space${region.length > 1 ? 's' : ''}. Press Play Again to restart.`;
      
      // Highlight the isolated region
      highlightIsolatedRegion(region);
      
      // Show the gameOver message
      showGameOverMessage();
      return;
    }
  }
}

// Function to highlight isolated regions
function highlightIsolatedRegion(region) {
  for (const [x, y] of region) {
    // Add to placedSquares with a special flag for isolated regions
    placedSquares.push({
      x: x,
      y: y,
      isCorrect: false,
      isIsolated: true
    });
  }
}

// Function to show game over message
function showGameOverMessage() {
  // Create a modal for the game over message
  const gameOverModal = document.createElement('div');
  gameOverModal.id = 'game-over-modal';
  gameOverModal.style.position = 'fixed';
  gameOverModal.style.top = '50%';
  gameOverModal.style.left = '50%';
  gameOverModal.style.transform = 'translate(-50%, -50%)';
  gameOverModal.style.backgroundColor = '#fff';
  gameOverModal.style.padding = '20px';
  gameOverModal.style.borderRadius = '10px';
  gameOverModal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  gameOverModal.style.zIndex = '1000';
  gameOverModal.style.maxWidth = '80%';
  gameOverModal.style.textAlign = 'center';
  
  // Add message
  const messageElement = document.createElement('p');
  messageElement.textContent = gameOverMessage;
  messageElement.style.marginBottom = '20px';
  gameOverModal.appendChild(messageElement);
  
  // Add play again button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.textContent = 'Play Again';
  playAgainBtn.style.padding = '10px 20px';
  playAgainBtn.style.backgroundColor = '#3498db';
  playAgainBtn.style.color = '#fff';
  playAgainBtn.style.border = 'none';
  playAgainBtn.style.borderRadius = '5px';
  playAgainBtn.style.cursor = 'pointer';
  playAgainBtn.addEventListener('click', resetGame);
  playAgainBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    resetGame();
  });
  gameOverModal.appendChild(playAgainBtn);
  
  // Add overlay
  const overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '999';
  
  // Add to document
  document.body.appendChild(overlay);
  document.body.appendChild(gameOverModal);
}
