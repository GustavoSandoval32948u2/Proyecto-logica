let firstClick = false;
let score = 0;
let level = 1;
let totalPairs = 6; // Fácil
const basePointsPerPair = 100;
let pointsPerPair = basePointsPerPair / totalPairs;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let flipSpeed = 500; // Velocidad de volteo en milisegundos
let timer = null;
let startTime = null;
let lives = 10;

document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const scoreContainer = document.getElementById("score");
    const messageContainer = document.getElementById("message-container");
    const retryButton = document.getElementById("retry-button");
    const prevLevelButton = document.getElementById("prev-level-button");
    const nextLevelButton = document.getElementById("next-level-button");
    const startButton = document.getElementById("start-button");
    const levelInfo = document.getElementById("level-info");
    const timeContainer = document.getElementById("time");
    const livesContainer = document.getElementById("lives");

    levelInfo.innerText = `Nivel: ${getLevelName(level)}`;

    createBoard();

    startButton.addEventListener("click", () => {
        revealAllCards();
        setTimeout(() => {
            hideAllCards();
            startGameTimer();
            startButton.style.display = 'none';
        }, 1000);
    });

    gameBoard.addEventListener("click", (event) => {
        if (lockBoard || startButton.style.display !== 'none') return;
        const clickedCard = event.target.closest('.card');

        if (!clickedCard || clickedCard.classList.contains('flipped')) return;

        flipCard(clickedCard);

        if (!firstCard) {
            firstCard = clickedCard;
        } else {
            secondCard = clickedCard;
            checkForMatch();
        }
    });

    retryButton.addEventListener("click", () => {
        resetGame();
    });

    prevLevelButton.addEventListener("click", () => {
        if (level > 1) {
            level--;
            startNewLevel();
        }
    });

    nextLevelButton.addEventListener("click", () => {
        if (level < 3) {
            level++;
            startNewLevel();
        }
    });

    function startGameTimer() {
        startTime = new Date();
        timer = setInterval(updateTimer, 1000);
    }

    function stopGameTimer() {
        clearInterval(timer);
        timer = null;
    }

    function updateTimer() {
        const now = new Date();
        const elapsedTime = Math.floor((now - startTime) / 1000);
        timeContainer.innerText = `Tiempo: ${elapsedTime}s`;
    }

    function endGame() {
        messageContainer.innerHTML = '<h2>¡Felicitaciones! Has completado el nivel.</h2>';
        retryButton.style.display = "block";
        stopGameTimer();
    }

    function loseGame() {
        messageContainer.innerHTML = '<h2 class="lose">¡Has perdido! Inténtalo de nuevo.</h2>';
        messageContainer.classList.add('lose'); // Cambio el color a rojo
        retryButton.style.display = "block";
        stopGameTimer();
    }

    function resetGame() {
        score = 0;
        lives = getInitialLives(level);
        scoreContainer.innerText = `Puntuación: ${score}`;
        livesContainer.innerText = `Vidas: ${lives}`;
        messageContainer.innerHTML = '';
        retryButton.style.display = "none";
        startButton.style.display = "block";
        firstClick = false;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        stopGameTimer();
        timeContainer.innerText = '';
        createBoard(); // Crear nuevamente el tablero
    }

    function startNewLevel() {
        updateLevelSettings();
        levelInfo.innerText = `Nivel: ${getLevelName(level)}`;
        resetGame();
    }

    function updateLevelSettings() {
        switch (level) {
            case 1:
                totalPairs = 6; // Fácil
                break;
            case 2:
                totalPairs = 8; // Medio
                break;
            case 3:
                totalPairs = 8; // Difícil (Reducido de 10 a 8 pares)
                break;
        }
        pointsPerPair = basePointsPerPair / totalPairs;
        flipSpeed = Math.max(100, 500 - (level - 1) * 50); // Incrementar la velocidad en cada nivel, hasta un mínimo de 100ms
        prevLevelButton.style.display = level > 1 ? "block" : "none";
    }

    function getLevelName(level) {
        switch (level) {
            case 1:
                return 'Fácil';
            case 2:
                return 'Medio';
            case 3:
                return 'Difícil';
        }
    }

    function getInitialLives(level) {
        switch (level) {
            case 1:
                return 10;
            case 2:
                return 12;
            case 3:
                return 14;
        }
    }

    function createBoard() {
        gameBoard.innerHTML = ''; // Limpiar el tablero
        const cardValues = generateCardValues(totalPairs);
        cardValues.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="front"></div>
                <div class="back">${value}</div>
            `;
            gameBoard.appendChild(card);
        });
        const columns = (level === 3) ? totalPairs * 2 : Math.ceil(Math.sqrt(totalPairs * 2));
        gameBoard.style.gridTemplateColumns = `repeat(${columns}, 50px)`;
    }

    function revealAllCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('flipped'));
    }

    function hideAllCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped'));
    }

    function generateCardValues(pairsCount) {
        const values = [];
        
        for (let i = 0; i < pairsCount; i++) {
            const letter1 = String.fromCharCode(65 + i);
            const letter2 = String.fromCharCode(65 + i); // Mismo par de letras
            
            if (level === 1) {
                values.push(letter1, letter2); // Crear pares de letras simples para nivel 1
            } else if (level === 2 || level === 3) {
                const combinedLetter = `${letter1}${letter2}`;
                values.push(combinedLetter, combinedLetter); // Añadir la combinación y su par para nivel 2 y 3
            }
        }
        
        if (level === 2) {
            values.push("AB", "CD", "EF", "GH"); // Agregar combinaciones de letras para nivel 2
        } else if (level === 3) {
            for (let i = 0; i < pairsCount; i++) {
                    const letter1 = String.fromCharCode(65 + i);
                    const letter2 = String.fromCharCode(65 + i + 1);
                    values.push(letter1, letter1, letter2, letter2); // Intercale pares de letras y pares de letras combinadas para nivel 3
                }
            }
            
            return shuffleArray(values);
        }
    
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        function flipCard(card) {
            card.classList.add('flipped');
        }
    
        function checkForMatch() {
            if (firstCard.querySelector('.back').textContent === secondCard.querySelector('.back').textContent) {
                disableCards();
                incrementScore();
                if (score >= 100) {
                    endGame();
                }
            } else {
                loseLife();
                unflipCards();
            }
        }
    
        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            resetBoard();
        }
    
        function incrementScore() {
            const targetScore = 100; // Ajustado para sumar hasta 100 al encontrar todos los pares
            const increment = targetScore / (totalPairs);
            score = Math.min(score + increment, targetScore);
            scoreContainer.innerText = `Puntuación: ${Math.round(score)}`;
            if (score >= targetScore) {
                endGame();
            }
        }
    
        function loseLife() {
            lives--;
            livesContainer.innerText = `Vidas: ${lives}`;
            if (lives <= 0) {
                loseGame();
            }
        }
    
        function unflipCards() {
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, flipSpeed); // Tiempo corto para mostrar la carta antes de voltearla
        }
    
        function resetBoard() {
            [firstCard, secondCard] = [null, null];
            lockBoard = false;
        }
    
        resetGame();
    });
    