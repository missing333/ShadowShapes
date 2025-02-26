let gridSize = 12; // 12x12 grid
let cellSize = 30; // Size of each cell in pixels
let grid = []; // 2D array for placed tiles
let targetShape = []; // Coordinates of the target pattern (cat)
let tiles = []; // Available Tetris tiles
let selectedTile = null; // Currently selected tile
let timer = 0; // Timer in seconds
let timerStarted = false; // Tracks if timer should run
let score = 10000; // Starting score
let gameWon = false; // Win state

function setup() {
  createCanvas(400, 550); // 360px grid (12x30) + 190px for tiles and UI
  initializeGrid();
  defineTargetShape();
  defineTiles();
}

function draw() {
  background(220);
  drawGrid();
  drawTargetShape();
  drawTiles();
  if (selectedTile) drawSelectedTile();
  updateTimer();
  displayScoreAndTimer();
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

// Define a random target shape instead of the fixed cat shape
function defineTargetShape() {
  // Clear the target shape array
  targetShape = [];

  // Define possible patterns
  const patterns = [
    // Cat pattern
    [
      [5, 4],
      [6, 4],
      [7, 4], // Head
      [5, 5],
      [6, 5],
      [7, 5], // Body
      [4, 3],
      [8, 3], // Ears
      [6, 6],
      [6, 7], // Tail
    ],
    // Heart pattern
    [
      [5, 3],
      [7, 3], // Top of heart
      [4, 4],
      [6, 4],
      [8, 4], // Middle row
      [5, 5],
      [6, 5],
      [7, 5], // Bottom row
      [6, 6], // Point
    ],
    // Smiley face
    [
      [5, 3],
      [6, 3],
      [7, 3], // Top row
      [4, 4],
      [8, 4], // Eyes
      [4, 6],
      [5, 7],
      [6, 7],
      [7, 7],
      [8, 6], // Smile
    ],
    // Simple house
    [
      [6, 2], // Roof top
      [5, 3],
      [6, 3],
      [7, 3], // Roof
      [4, 4],
      [5, 4],
      [6, 4],
      [7, 4],
      [8, 4], // Upper house
      [4, 5],
      [5, 5],
      [6, 5],
      [7, 5],
      [8, 5], // Middle house
      [4, 6],
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6], // Lower house
    ],
    // Flower
    [
      [6, 3], // Top petal
      [5, 4],
      [6, 4],
      [7, 4], // Middle row
      [6, 5], // Bottom petal
      [4, 4],
      [8, 4], // Side petals
      [6, 6],
      [6, 7], // Stem
    ],
  ];

  // Choose a random pattern
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  targetShape = randomPattern;
}

// Define 3 random Tetris tiles with shapes, positions, and colors
function defineTiles() {
  // Clear the tiles array
  tiles = [];

  // Add 3 random tiles
  for (let i = 0; i < 3; i++) {
    addNewTile();
  }

  // Position them evenly
  repositionTiles();
}

// Draw the 12x12 grid
function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      stroke(0);
      fill(grid[i][j] === 0 ? 255 : grid[i][j]); // White if empty, tile color if filled
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

// Draw the faint target shape (cat)
function drawTargetShape() {
  fill(150, 100); // Faint gray
  noStroke();
  for (let [x, y] of targetShape) {
    rect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

// Draw the available tiles below the grid
function drawTiles() {
  for (let tile of tiles) {
    fill(tile.color);
    noStroke();
    let rotatedBlocks = getRotatedBlocks(tile.blocks, tile.rotation);
    for (let [dx, dy] of rotatedBlocks) {
      rect(
        tile.posX + dx * cellSize,
        tile.posY + dy * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

// Handle tile selection and rotation
function mousePressed() {
  if (gameWon) return; // Disable interaction after winning

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
        // Right mouse button or key modifier for rotation
        if (mouseButton === RIGHT) {
          tile.rotation = (tile.rotation + 1) % 4; // Rotate 90 degrees clockwise
          return false;
        }
        // Left mouse button for dragging
        else {
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
}

// Draw the selected tile as it's dragged
function drawSelectedTile() {
  fill(selectedTile.color);
  noStroke();
  let rotatedBlocks = getRotatedBlocks(
    selectedTile.blocks,
    selectedTile.rotation
  );
  for (let [dx, dy] of rotatedBlocks) {
    rect(
      mouseX - selectedTile.offsetX + dx * cellSize,
      mouseY - selectedTile.offsetY + dy * cellSize,
      cellSize,
      cellSize
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

// Add a new random tile to replace the used one
function addNewTile() {
  // Define possible shapes
  const shapes = [
    {
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ],
      color: "red",
    }, // L-shape
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ],
      color: "blue",
    }, // T-shape
    {
      blocks: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      color: "yellow",
    }, // Square
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      color: "green",
    }, // I-shape
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      color: "purple",
    }, // Z-shape
    {
      blocks: [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 0],
      ],
      color: "orange",
    }, // S-shape
  ];

  // Choose a random shape
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

  // Add the new tile (position will be set by repositionTiles)
  tiles.push({
    blocks: randomShape.blocks,
    posX: 0, // Temporary position, will be updated by repositionTiles
    posY: 400,
    color: randomShape.color,
    rotation: 0,
  });
}

// Reposition tiles to fit in the bottom area
function repositionTiles() {
  const spacing = 300 / tiles.length;
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].posX = 50 + i * spacing;
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
function displayScoreAndTimer() {
  let timePenalty = timer > 30 ? Math.floor(timer - 30) * 50 : 0;
  let overPenalty = calculateOverPenalty();
  let currentScore = Math.max(0, score - timePenalty - overPenalty);

  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(`Time: ${timerStarted ? Math.floor(timer) : 0}s`, 10, 380);
  text(`Score: ${currentScore}`, 10, 400);
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

// Display win message
function displayWinMessage() {
  fill(0, 255, 0);
  textSize(32);
  textAlign(CENTER);
  text("You Win!", width / 2, height / 2);
}
