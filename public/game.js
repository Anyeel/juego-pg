let y;
let speed;
let redCircles = [];
let yellowCoins = [];
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  y = height / 2;
  speed = 20;
}

function draw() {
  background(220);

  if (!gameOver) {
    // Dibujar el círculo principal en color verde
    fill(0, 255, 0);
    ellipse(width / 2, y, 50, 50);

    // Crear un nuevo círculo rojo (obstáculo) al azar
    if (frameCount % 20 === 0) {
      redCircles.push({ x: width, y: random(height) });
    }

    // Crear un nuevo círculo amarillo (moneda) al azar
    if (frameCount % 50 === 0) {
      yellowCoins.push({ x: width, y: random(height) });
    }

    // Dibujar y mover los círculos rojos (obstáculos)
    for (let i = redCircles.length - 1; i >= 0; i--) {
      fill(255, 0, 0);
      noStroke();
      ellipse(redCircles[i].x, redCircles[i].y, 30, 30);
      redCircles[i].x -= 5;

      // Detectar colisión con el círculo verde
      if (collideCircleCircle(width / 2, y, 50, redCircles[i].x, redCircles[i].y, 30)) {
        console.log("Colisión con obstáculo!");
        gameOver = true; // Terminar el juego
        let playerName = prompt("Juego terminado. Ingresa tu nombre (3 letras):");
        playerName = playerName.slice(0, 3).toUpperCase();
        saveScore(playerName, score);
      }

      // Eliminar los círculos que salen del marco
      if (redCircles[i].x < -15) {
        redCircles.splice(i, 1);
      }
    }

    // Dibujar y mover los círculos amarillos (monedas)
    for (let i = yellowCoins.length - 1; i >= 0; i--) {
      fill(255, 255, 0);
      noStroke();
      ellipse(yellowCoins[i].x, yellowCoins[i].y, 20, 20);
      yellowCoins[i].x -= 5;

      // Detectar colisión con el círculo verde
      if (collideCircleCircle(width / 2, y, 50, yellowCoins[i].x, yellowCoins[i].y, 20)) {
        score++;
        console.log("Moneda recogida! Puntuación: " + score);
        yellowCoins.splice(i, 1);
      } else {
        // Mover las monedas que no han colisionado
        yellowCoins[i].x -= 5;

        // Eliminar las monedas que salen del marco
        if (yellowCoins[i].x < -10) {
          yellowCoins.splice(i, 1);
        }
      }
    }

    // Mostrar el puntaje en la pantalla
    fill(0);
    textSize(24);
    text("Puntuación: " + score, 10, 30);
  } else {
    // Mostrar el mensaje de "Game Over" y el puntaje final
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 20);
    textSize(24);
    text("Puntuación final: " + score, width / 2, height / 2 + 20);
  }
}

function keyPressed() {
  if (!gameOver) {
    if (key === 'w') {
      y -= speed;
    } else if (key === 's') {
      y += speed; 
    }

    // Asegurarse de que el círculo no se salga del marco
    y = constrain(y, 0, height);
  }
}

function saveScore(name, score) {
  fetch('http://localhost:3000/scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name, score: score })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Puntaje guardado:', data);
  })
  .catch((error) => {
    console.error('Error al guardar el puntaje:', error);
  });
}
