let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 596;
document.body.appendChild(canvas);

// Loading things into the game
let bgReady = false;
let bgImage = new Image();
bgImage.onload = function () {
  bgReady = true;
};
bgImage.src = "images/background.png";

// Player image
let playerReady = false;
let playerImage = new Image();
playerImage.onload = function () {
  playerReady = true;
};
playerImage.src = "images/player.png";

// Opponent image
let opponentReady = false;
let opponentImage = new Image();
opponentImage.onload = function () {
  opponentReady = true;
};
opponentImage.src = "images/opponent.png";

let keysDown = {};
let dribbling = new Audio("sounds/dribbling.wav");
let isGamePaused = false;
let opponentArray = [];
let playerScore = 0;
let swishSound = new Audio('sounds/swish.wav');
let gameOver = false;
let timer = 21;

// Add event listeners for keydown and keyup
addEventListener(
  "keydown",
  function (e) {
    if (gameOver && e.keyCode === 82) { // 'R' key to restart
      playerScore = 0;
      isGamePaused = false;
      gameOver = false;
      reset();
    } else {
      dribbling.play();
      keysDown[e.keyCode] = true;
    }
  },
  false
);

addEventListener(
  "keyup",
  function (e) {
    dribbling.pause();
    console.log(e.keyCode + " up");
    delete keysDown[e.keyCode];
  },
  false
);

// Game objects
let player = {
  speed: 256, // movement in pixels per second
  x: 0, 
  y: 0, 
};

let hoop = {
  x: 850,
  y: 250, 
  width: 50, 
  height: 50 
};

let addOpponent = function () {
  let newOpponent = {
    speed: 100 + Math.random() * 250, // movement in pixels per second
    x: 32 + Math.random() * (canvas.width - 240),
    y: 32 + Math.random() * (441 - 96),
    direction: 1  // 1 for moving down, -1 for moving up
  };
  opponentArray.push(newOpponent);
};

let update = function (modifier) {
  console.log(opponentArray.length);
  if (isGamePaused) {
    return; // Do not update if the game is paused
  }

  timer -= modifier;
  console.log(modifier)

  if (timer <= 0) {
    isGamePaused = true;
    gameOver = true;
  }

  if (87 in keysDown && player.y > 70) {
    // holding up key
    player.y -= player.speed * modifier;
  }
  if (83 in keysDown && player.y < 441) {
    // holding down key
    player.y += player.speed * modifier;
  }
  if (65 in keysDown && player.x > 80) {
    // holding left key
    player.x -= player.speed * modifier;
  }
  if (68 in keysDown && player.x < 880) {
    // holding right key
    player.x += player.speed * modifier;
  }

  if (
    player.x < hoop.x + hoop.width &&
    player.x + 30 > hoop.x &&  
    player.y < hoop.y + hoop.height &&
    player.y + 30 > hoop.y    
  ) {
    swishSound.play();
    ++playerScore;
    console.log("Player scored a point");
    reset();
  }

  opponentArray.forEach((opponent) => {
    opponent.y += opponent.speed * modifier * opponent.direction;
    if (opponent.y < 70) {
      opponent.y = 70;
      opponent.direction = 1;
    } else if (opponent.y > 441) {  // assuming opponent height is 64
      opponent.y = 441;
      opponent.direction = -1;
    }

    if (
      player.x <= opponent.x + 32 &&
      opponent.x <= player.x + 32 &&
      player.y <= opponent.y + 32 &&
      opponent.y <= player.y + 32
    ) {
      console.log("Player collided with opponent");
      isGamePaused = true;
      gameOver = true;
      
    }
  });
};

let gameOverFunction = function() {
  opponentArray = [];
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "48px Helvetica";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

  ctx.font = "24px Helvetica";
  ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 50);
};

let reset = function () {
  addOpponent();

  timer = 21;
  player.x = 174;
  player.y = 246;

  opponentArray.forEach((opponent) => {
    let opponentMinX = player.x + 100; // Minimum x position is 100 pixels ahead of the player
    let opponentMaxX = canvas.width - 100; // Ensure the opponent doesn't spawn too close to the right edge
    let opponentMinY = 70; // Minimum y position (top boundary)
    let opponentMaxY = canvas.height - 64 - 70; // Ensure the opponent doesn't spawn too close to the bottom edge

    // Ensure opponentMinX is not greater than opponentMaxX
    if (opponentMinX > opponentMaxX) {
      opponentMinX = canvas.width - 100;
    }

    opponent.x = opponentMinX + Math.random() * (opponentMaxX - opponentMinX);
    opponent.y = opponentMinY + Math.random() * (opponentMaxY - opponentMinY);
  });
};

let render = function () {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }

  if (playerReady) {
    let playerWidth = playerImage.width / 2;
    let playerHeight = playerImage.height / 2;
    ctx.drawImage(playerImage, player.x, player.y, playerWidth, playerHeight);
  }

  if (opponentReady) {
    opponentArray.forEach((opponent) => {
      let opponentWidth = opponentImage.width / 4;
      let opponentHeight = opponentImage.height / 4;
      ctx.drawImage(opponentImage, opponent.x, opponent.y, opponentWidth, opponentHeight);
    });
  }

  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Player Score: " + playerScore, 32, 32);
  ctx.fillText("Time Remaining: " + Math.floor(timer), 250, 32);

  if (gameOver) {
    gameOverFunction();
  }
};



let main = function () {
  
  let now = Date.now();
  let delta = now - then;
  update(delta / 1000);
  render();
  then = now;
  // Request to do this again ASAP
  requestAnimationFrame(main);
};

let then = Date.now();

reset();

main(); // call the main game loop
