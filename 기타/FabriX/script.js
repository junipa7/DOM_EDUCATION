// 캔버스와 컨텍스트 설정
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 변수 설정
let score = 0;
let level = 1;
let lines = 0;
let tetromino = [];
let nextTetromino = [];
let gameSpeed = 1000; // 밀리초
let gameOver = false;

// 테트로미노 모양
const tetrominoShapes = [
    // I-Shape
    [
        [1, 1, 1, 1]
    ],
    // J-Shape
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    // L-Shape
    [
        [0, 0, 1],
        [1, 1, 1]
    ],
    // O-Shape
    [
        [1, 1],
        [1, 1]
    ],
    // S-Shape
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // T-Shape
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // Z-Shape
    [
        [1, 1, 0],
        [0, 1, 1]
    ]
];

// 테트로미노 생성
function createTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
    tetromino = tetrominoShapes[randomIndex];
}

// 다음 테트로미노 생성
function createNextTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
    nextTetromino = tetrominoShapes[randomIndex];
}

// 게임 초기화
function initGame() {
    score = 0;
    level = 1;
    lines = 0;
    createTetromino();
    createNextTetromino();
    gameOver = false;
}

// 게임 그리기
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 테트로미노 그리기
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] === 1) {
                ctx.fillStyle = '#c9e4ca'; // 파스텔 톤의 칼라
                ctx.fillRect(j * 20, i * 20, 20, 20);
            }
        }
    }
    // 다음 테트로미노 그리기
    for (let i = 0; i < nextTetromino.length; i++) {
        for (let j = 0; j < nextTetromino[i].length; j++) {
            if (nextTetromino[i][j] === 1) {
                ctx.fillStyle = '#c9e4ca'; // 파스텔 톤의 칼라
                ctx.fillRect(j * 20 + 100, i * 20, 20, 20);
            }
        }
    }
}

// 키보드 이벤트 처리
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        // 왼쪽으로 이동
        for (let i = 0; i < tetromino.length; i++) {
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] === 1) {
                    if (j === 0) return;
                    tetromino[i][j] = 0;
                    tetromino[i][j - 1] = 1;
                }
            }
        }
    } else if (e.key === 'ArrowRight') {
        // 오른쪽으로 이동
        for (let i = 0; i < tetromino.length; i++) {
            for (let j = tetromino[i].length - 1; j >= 0; j--) {
                if (tetromino[i][j] === 1) {
                    if (j === tetromino[i].length - 1) return;
                    tetromino[i][j] = 0;
                    tetromino[i][j + 1] = 1;
                }
            }
        }
    } else if (e.key === 'ArrowDown') {
        // 아래로 이동
        for (let i = tetromino.length - 1; i >= 0; i--) {
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] === 1) {
                    if (i === tetromino.length - 1) return;
                    tetromino[i][j] = 0;
                    tetromino[i + 1][j] = 1;
                }
            }
        }
    } else if (e.key === 'ArrowUp') {
        // 회전
        const temp = [];
        for (let i = 0; i < tetromino[0].length; i++) {
            temp.push([]);
            for (let j = tetromino.length - 1; j >= 0; j--) {
                temp[i].push(tetromino[j][i]);
            }
        }
        tetromino = temp;
    }
});

// 게임 루프
setInterval(() => {
    if (!gameOver) {
        drawGame();
        // 게임 오버 체크
        for (let i = 0; i < tetromino.length; i++) {
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] === 1 && i === tetromino.length - 1) {
                    gameOver = true;
                }
            }
        }
        // 라인 체크
        for (let i = tetromino.length - 1; i >= 0; i--) {
            let lineFull = true;
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] === 0) {
                    lineFull = false;
                    break;
                }
            }
            if (lineFull) {
                lines++;
                score += 100;
                level++;
                gameSpeed -= 100;
                tetromino.splice(i, 1);
                createTetromino();
            }
        }
    } else {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('게임 오버', canvas.width / 2, canvas.height / 2);
    }
}, gameSpeed);

initGame();
