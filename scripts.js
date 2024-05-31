let firstClick = false;
let score = 0;
let level = 1;
let totalPairs = 4;
const basePointsPerPair = 100;
let pointsPerPair = basePointsPerPair / totalPairs;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let flipSpeed = 500; // Velocidad de volteo en milisegundos

document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const scoreContainer = document.getElementById("score");
    const messageContainer = document.getElementById("message-container");
    const retryButton = document.getElementById("retry-button");
    const prevLevelButton = document.getElementById("prev-level-button");
    const nextLevelButton = document.getElementById("next-level-button");
    const levelInfo = document.getElementById("level-info");

    levelInfo.innerText = `Nivel: ${getLevelName(level)}`;

    createBoard();

    gameBoard.addEventListener("click", (event) => {
        if (lockBoard) return;
        const clickedCard = event.target.closest('.card');

        if (!clickedCard || clickedCard.classList.contains('flipped')) return;

        if (!firstClick) {
            startGameTimer();
            firstClick = true;
        }

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
        // Iniciar el contador...
    }

    function endGame() {
        messageContainer.innerHTML = '<h2>¡Felicitaciones! Has completado el nivel.</h2>';
        retryButton.style.display = "block";
    }

    function resetGame() {
        score = 0;
        scoreContainer.innerText = score;
        messageContainer.innerHTML = '';
        retryButton.style.display = "none";
        firstClick = false;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
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
                totalPairs = 4; // Fácil
                break;
            case 2:
                totalPairs = 6; // Medio
                break;
            case 3:
                totalPairs = 8; // Difícil
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
        gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(totalPairs * 2))}, 100px)`;
    }

    function generateCardValues(pairs) {
        const values = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < pairs; i++) {
            const letter = letters[i % letters.length];
            values.push(letter, letter); // Crear pares de letras
        }
        return shuffle(values);
    }

    function shuffle(array) {
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
            score += pointsPerPair;
            scoreContainer.innerText = score;

            if (score >= 100) {
                endGame();
            }
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
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
});
