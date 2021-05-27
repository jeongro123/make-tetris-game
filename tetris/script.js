const canvas = document.getElementById("tetris"); //DOM에서 canvas 엘리먼트 참조
const ctx = canvas.getContext("2d"); //엘리먼트의 컨텍스트(렌더링될 그리기의 대상) 선택

const scale = 20;
ctx.scale(scale, scale); //x,y의 크기를 조정

const tWidth = canvas.width / scale; //220 / 20 = 11
const tHeight = canvas.height / scale; //400 / 20 = 20

//테트리스 블럭 모양
const pieces = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 2, 0, 0],
    [0, 2, 0, 0],
    [0, 2, 0, 0],
    [0, 2, 0, 0],
  ],
  [
    [0, 0, 0],
    [3, 3, 0],
    [0, 3, 3],
  ],
  [
    [0, 0, 0],
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 0, 0],
    [5, 0, 0],
    [5, 5, 0],
  ],
  [
    [0, 0, 6],
    [0, 0, 6],
    [0, 6, 6],
  ],
  [
    [0, 0, 0],
    [7, 7, 7],
    [0, 7, 0],
  ],
];
//테트리스 블럭 색상
const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];
let arena = []; //테트리스 맵

let rand;

const player = {
  //내려오는 테트리스 블록
  pos: { x: 0, y: 1 }, //좌우 위치
  matrix: null, //블록
  color: null, //색상
};

rand = Math.floor(Math.random() * pieces.length); //전체 테트리스 블록 중에 랜덤으로 뽑음 / 배열이므로 Math.floor
player.matrix = pieces[rand]; //랜덤으로 블록 할당
player.color = colors[rand + 1]; //랜덤으로 색상 할당 / 블록과 색상의 배열index가 같으므로, 항상 블록의 모양과 색상이 일치함

function drawMatrix(matrix, x, y) {
  //블록 그리는 함수
  for (let i = 0; i < matrix.length; i++) {
    //i는 블록한줄
    for (let j = 0; j < matrix[i].length; j++) {
      //j는 i의 한칸한칸 / 테트리스 블록은 배열안에 배열들로 이루어져 있으므로 이중for문이 필요
      if (matrix[i][j]) {
        //블록이 있으면
        ctx.fillRect(x + j, y + i, 1, 1); //블록 그려주기(x좌표,y좌표,width,height) / x+j는 좌우의 위치를 고려해서 블록을 그려줘야 하기 때문. y+i는 높이를 고려해서 블록을 그려줘야 하기 때문
      }
    }
  }
}

function rotateMatrix(matrix, dir) {
  //블록 회전시키는 함수
  let newMatrix = []; //회전된(변형된) 블록이 들어갈 빈배열

  for (let i in matrix) newMatrix.push([]); //!matrix의 요소수(i갯수)만큼 빈배열을 생성해 놓는다

  if (dir === 1) {
    //
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        newMatrix[j][matrix.length - i - 1] = matrix[i][j]; //
      }
    }
  } else {
    //
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        newMatrix[matrix.length - j - 1][i] = matrix[i][j];
      }
    }
  }

  return newMatrix;
}

function collides(player, arena) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      if (
        player.matrix[i][j] &&
        arena[player.pos.y + i + 1][player.pos.x + j + 1]
      ) {
        return 1;
      }
    }
  }

  return 0;
}

function mergeArena(matrix, x, y) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      arena[y + i + 1][x + j + 1] = arena[y + i + 1][x + j + 1] || matrix[i][j];
    }
  }
}

function clearBlocks() {
  for (let i = 1; i < arena.length - 2; i++) {
    let clear = 1;

    for (let j = 1; j < arena[i].length - 1; j++) {
      if (!arena[i][j]) clear = 0;
    }

    if (clear) {
      let r = new Array(tWidth).fill(0);
      r.push(1);
      r.unshift(1);

      arena.splice(i, 1);
      arena.splice(1, 0, r);
    }
  }
}

function drawArena() {
  for (let i = 1; i < arena.length - 2; i++) {
    for (let j = 1; j < arena[i].length - 1; j++) {
      if (arena[i][j]) {
        ctx.fillStyle = colors[arena[i][j]];
        ctx.fillRect(j - 1, i - 1, 1, 1);
      }
    }
  }
}

function initArena() {
  arena = [];

  const r = new Array(tWidth + 2).fill(1);
  arena.push(r);

  for (let i = 0; i < tHeight; i++) {
    let row = new Array(tWidth).fill(0);
    row.push(1);
    row.unshift(1);

    arena.push(row);
  }

  arena.push(r);
  arena.push(r);
}

function gameOver() {
  for (let j = 1; j < arena[1].length - 1; j++) {
    if (arena[1][j]) {
      return initArena();
    }
  }
  return;
}

let interval = 1000;
let lastTime = 0;
let count = 0;

function update(time = 0) {
  const dt = time - lastTime;
  lastTime = time;
  count += dt;

  if (count >= interval) {
    player.pos.y++;
    count = 0;
  }

  if (collides(player, arena)) {
    mergeArena(player.matrix, player.pos.x, player.pos.y - 1);
    clearBlocks();
    gameOver();

    player.pos.y = 1;
    player.pos.x = 0;

    rand = Math.floor(Math.random() * pieces.length);
    player.matrix = pieces[rand];
    player.color = colors[rand + 1];

    interval = 1000;
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawArena();
  ctx.fillStyle = player.color;
  drawMatrix(player.matrix, player.pos.x, player.pos.y);

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 37 && interval - 1) {
    player.pos.x--;
    if (collides(player, arena)) {
      player.pos.x++;
    }
  } else if (event.keyCode === 39 && interval - 1) {
    player.pos.x++;
    if (collides(player, arena)) {
      player.pos.x--;
    }
  } else if (event.keyCode === 40) {
    player.pos.y++;
    // count = 0;
    interval = 1; //수직강하
  } else if (event.keyCode === 38) {
    player.matrix = rotateMatrix(player.matrix, 1);
    if (collides(player, arena)) {
      player.matrix = rotateMatrix(player.matrix, -1);
    }
  }
});

initArena();
update();
