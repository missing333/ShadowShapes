let gridSize = 15; // 15x15 grid
let cellSize = 35; // Increase cell size from 30 to 35 pixels
let grid = []; // 2D array for placed tiles
let targetShape = []; // Coordinates of the target pattern (cat)
let tiles = []; // Available Tetris tiles
let selectedTile = null; // Currently selected tile
let timer = 0; // Timer in seconds
let timerStarted = false; // Tracks if timer should run
let score = 10000; // Starting score
let gameWon = false; // Win state

// Supabase configuration
const SUPABASE_URL = "https://nwqbnjbhvuhuushsknrf.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cWJuamJodnVodXVzaHNrbnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NDI3NTYsImV4cCI6MjA1NjExODc1Nn0.5pTKxytDPg-EesdG8bL5jyWDJtjHFVbFs-eKaLBq7Ho";
// Fix the Supabase client initialization
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  // Update canvas size to fit the larger grid and cell size (15*35 = 525px for grid)
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

  // Define possible patterns for 15x15 grid (centered) with at least 18 squares each
  const patterns = [
    // Cat pattern (enhanced)
    [
      [7, 5],
      [8, 5],
      [9, 5], // Head top
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6], // Head middle
      [6, 7],
      [7, 7],
      [8, 7],
      [9, 7],
      [10, 7], // Body upper
      [7, 8],
      [8, 8],
      [9, 8], // Body lower
      [5, 5],
      [11, 5], // Ears
      [7, 9],
      [8, 9],
      [9, 9], // Tail
    ],
    // Heart pattern (enhanced)
    [
      [6, 4],
      [7, 3],
      [8, 3],
      [9, 3],
      [10, 4], // Top of heart
      [5, 5],
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5],
      [11, 5], // Upper middle
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6],
      [11, 6], // Lower middle
      [6, 7],
      [7, 7],
      [8, 7],
      [9, 7],
      [10, 7], // Bottom upper
      [7, 8],
      [8, 8],
      [9, 8], // Bottom middle
      [8, 9], // Point
    ],
    // House pattern (enhanced)
    [
      [8, 3], // Roof top
      [7, 4],
      [8, 4],
      [9, 4], // Roof upper
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5], // Roof lower
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6],
      [11, 6], // Upper house
      [5, 7],
      [6, 7],
      [9, 7],
      [10, 7],
      [11, 7], // Middle upper house
      [5, 8],
      [6, 8],
      [7, 8],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8], // Middle lower house
      [5, 9],
      [6, 9],
      [7, 9],
      [8, 9],
      [9, 9],
      [10, 9],
      [11, 9], // Lower house
      [7, 7],
      [8, 7], // Door
    ],
    // Flower pattern (enhanced)
    [
      [8, 3], // Top petal top
      [7, 4],
      [8, 4],
      [9, 4], // Top petal bottom
      [5, 5],
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5],
      [11, 5], // Upper middle
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6], // Center
      [7, 7],
      [8, 7],
      [9, 7], // Lower middle
      [8, 8],
      [8, 9],
      [8, 10], // Stem
      [7, 9],
      [9, 9], // Leaves
    ],
    // Spaceship pattern (enhanced)
    [
      [8, 3], // Top
      [7, 4],
      [8, 4],
      [9, 4], // Upper body
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5], // Middle upper body
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6],
      [11, 6], // Middle body
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
      [8, 7],
      [9, 7],
      [10, 7],
      [11, 7],
      [12, 7], // Lower body
      [5, 8],
      [6, 8],
      [7, 8],
      [9, 8],
      [10, 8],
      [11, 8], // Engines
      [4, 9],
      [12, 9], // Engine tips
    ],
    // Star pattern (enhanced)
    [
      [8, 2], // Top point
      [8, 3],
      [8, 4], // Top connector
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
      [10, 5], // Upper body
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6],
      [11, 6], // Middle upper
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
      [8, 7],
      [9, 7],
      [10, 7],
      [11, 7],
      [12, 7], // Middle
      [5, 8],
      [6, 8],
      [7, 8],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8], // Lower body
      [4, 9],
      [12, 9], // Side points
      [3, 10],
      [13, 10], // Bottom points
    ],
    // Castle pattern (new)
    [
      [5, 3],
      [8, 3],
      [11, 3], // Tower tops
      [4, 4],
      [5, 4],
      [6, 4],
      [7, 4],
      [8, 4],
      [9, 4],
      [10, 4],
      [11, 4],
      [12, 4], // Upper wall
      [4, 5],
      [6, 5],
      [8, 5],
      [10, 5],
      [12, 5], // Battlements
      [4, 6],
      [5, 6],
      [6, 6],
      [10, 6],
      [11, 6],
      [12, 6], // Middle wall
      [4, 7],
      [5, 7],
      [6, 7],
      [10, 7],
      [11, 7],
      [12, 7], // Lower wall
      [4, 8],
      [5, 8],
      [6, 8],
      [7, 8],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8],
      [12, 8], // Base
      [7, 6],
      [8, 6],
      [9, 6],
      [7, 7],
      [8, 7],
      [9, 7], // Door
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

// Draw the 15x15 grid
function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 0) {
        // Empty cell
        stroke(200, 210, 220);
        strokeWeight(1);
        fill(255);
      } else {
        // Filled cell
        stroke(200, 210, 220);
        strokeWeight(1);
        fill(grid[i][j]);
      }
      rect(i * cellSize, j * cellSize, cellSize, cellSize, 3); // Slightly larger rounded corners
    }
  }
}

// Draw the faint target shape (cat)
function drawTargetShape() {
  noStroke();
  fill(100, 120, 200, 80); // Soft blue with transparency
  for (let [x, y] of targetShape) {
    rect(x * cellSize, y * cellSize, cellSize, cellSize, 2); // Slightly rounded corners
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
    strokeWeight(2);
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
  strokeWeight(2);
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
      color: "#FF6B6B", // Coral red
    }, // L-shape
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ],
      color: "#4FC1E9", // Sky blue
    }, // T-shape
    {
      blocks: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      color: "#FFCE54", // Soft yellow
    }, // Square
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      color: "#A0D468", // Lime green
    }, // I-shape
    {
      blocks: [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      color: "#AC92EC", // Lavender
    }, // Z-shape
    {
      blocks: [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 0],
      ],
      color: "#EC87C0", // Pink
    }, // S-shape
    {
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
      ],
      color: "#5D9CEC", // Blue
    }, // J-shape
  ];

  // Choose a random shape
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

  // Add the new tile with temporary position
  tiles.push({
    blocks: randomShape.blocks,
    posX: 0, // Will be updated by repositionTiles
    posY: gridSize * cellSize + 20, // Just below the grid
    color: randomShape.color,
    rotation: 0,
  });

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

// Display win message and show modal
function displayWinMessage() {
  // Calculate final score
  let finalScore = Math.max(
    0,
    score -
      (timer > 30 ? Math.floor(timer - 30) * 50 : 0) -
      calculateOverPenalty()
  );

  // Show win modal with overlay
  finalScoreElement.textContent = finalScore;
  winModal.style.display = "block";
  modalOverlay.style.display = "block";
}

// Submit score to Supabase
async function submitScore() {
  const initials = playerInitialsInput.value.toUpperCase();
  const email = playerEmailInput.value;

  if (!initials || !email || initials.length > 3) {
    alert("Please enter valid initials (max 3 letters) and email");
    return;
  }

  const finalScore = parseInt(finalScoreElement.textContent);

  // Show loading state
  submitScoreButton.textContent = "Submitting...";
  submitScoreButton.disabled = true;

  try {
    console.log("Submitting score:", { initials, email, score: finalScore });

    // Insert score into Supabase
    const { data, error } = await supabase.from("leaderboard").insert([
      {
        initials: initials,
        email: email,
        score: finalScore,
        pattern: JSON.stringify(targetShape), // Convert array to JSON string
        time_taken: Math.floor(timer),
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Score submitted successfully:", data);

    // Hide win modal and show leaderboard
    winModal.style.display = "none";
    await fetchAndDisplayLeaderboard(email);
    leaderboardModal.style.display = "block";
  } catch (error) {
    console.error("Error submitting score:", error);
    alert("Error submitting score: " + error.message);
  } finally {
    // Reset button state
    submitScoreButton.textContent = "Submit Score";
    submitScoreButton.disabled = false;
  }
}

// Fetch and display leaderboard
async function fetchAndDisplayLeaderboard(playerEmail = null) {
  try {
    // Get top 10 scores
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Clear existing entries
    leaderboardEntriesElement.innerHTML = "";

    // Create header
    const header = document.createElement("div");
    header.className = "leaderboard-entry leaderboard-header";
    header.innerHTML = `
      <span><strong>Rank</strong></span>
      <span><strong>Initials</strong></span>
      <span><strong>Score</strong></span>
    `;
    leaderboardEntriesElement.appendChild(header);

    // Add entries
    data.forEach((entry, index) => {
      const entryElement = document.createElement("div");
      entryElement.className = "leaderboard-entry";

      // Highlight player's entry
      if (playerEmail && entry.email === playerEmail) {
        entryElement.classList.add("highlight");
        currentPlayerRank = index + 1;
      }

      entryElement.innerHTML = `
        <span>${index + 1}</span>
        <span>${entry.initials}</span>
        <span>${entry.score}</span>
      `;

      leaderboardEntriesElement.appendChild(entryElement);
    });

    // Show player's rank if they're not in top 10
    if (playerEmail && !currentPlayerRank) {
      const { data: playerData, error: playerError } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("email", playerEmail)
        .single();

      if (!playerError && playerData) {
        // Get player's rank
        const { count, error: countError } = await supabase
          .from("leaderboard")
          .select("*", { count: "exact", head: true })
          .gt("score", playerData.score);

        if (!countError) {
          const playerRank = count + 1;

          const separator = document.createElement("div");
          separator.innerHTML = "...";
          separator.style.textAlign = "center";
          leaderboardEntriesElement.appendChild(separator);

          const playerEntry = document.createElement("div");
          playerEntry.className = "leaderboard-entry highlight";
          playerEntry.innerHTML = `
            <span>${playerRank}</span>
            <span>${playerData.initials}</span>
            <span>${playerData.score}</span>
          `;
          leaderboardEntriesElement.appendChild(playerEntry);
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
