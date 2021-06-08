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
  //? [0]에 왜 null을 넣었을까?
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

const player = {
  //내려오는 테트리스 블록
  pos: { x: 0, y: 1 }, //좌우 위치
  matrix: null, //블록
  color: null, //색상
};

let rand;
rand = Math.floor(Math.random() * pieces.length); //전체 테트리스 블록 중에 랜덤으로 뽑음 / 배열이므로 Math.floor
player.matrix = pieces[rand]; //랜덤으로 블록 할당
player.color = colors[rand + 1]; //랜덤으로 색상 할당

function drawMatrix(matrix, x, y) {
  //내려오는 블록 그려주기
  for (let i = 0; i < matrix.length; i++) {
    //i는 블록한줄
    for (let j = 0; j < matrix[i].length; j++) {
      //j는 i내부의 요소 하나하나 / 테트리스 블록은 배열안에 배열들로 이루어져 있으므로 이중for문이 필요
      if (matrix[i][j]) {
        //블록이 있으면
        ctx.fillRect(x + j, y + i, 1, 1); //블록 그려주기(x좌표,y좌표,width,height) / x+j는 좌우의 위치를 고려해서 블록을 그려줘야 하기 때문. y+i는 높이를 고려해서 블록을 그려줘야 하기 때문
      }
    }
  }
}

function rotateMatrix(matrix, dir) {
  //블록을 회전시키는 함수
  let newMatrix = []; //회전된(변형된) 블록이 들어갈 빈배열

  for (let i of matrix) newMatrix.push([]); //!matrix의 요소수(i갯수)만큼 빈배열을 생성해 놓는다

  if (dir === 1) {
    //블록을 시계방향으로 회전시킴
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        newMatrix[j][matrix.length - i - 1] = matrix[i][j]; //
      }
    }
  } else {
    //블록을 회전시킴(반시계방향으로) -> 맵의 양 옆 벽에 부딪혔을 때 블록을 그대로 유지하게 함!
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        newMatrix[matrix.length - j - 1][i] = matrix[i][j];
      }
    }
  }

  return newMatrix; //회전된 블록 반환
}

function collides(player, arena) {
  //충격감지 "여부"
  for (let i = 0; i < player.matrix.length; i++) {
    //
    for (let j = 0; j < player.matrix[i].length; j++) {
      //
      if (
        //맵에서 내려오는 블록의 y값(pos.y)+블록의 높이(i)+1   과    맵에서 내려오는 블록의 x값(pos.x)+블록의 너비(j)+1 한 위치에 '이미쌓인블록'이 있을때
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
  //내려오는 블록 기존맵에 합치기
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      arena[y + i + 1][x + j + 1] = arena[y + i + 1][x + j + 1] || matrix[i][j]; //기존맵에 1(블록)이 안채워진곳에 내려오는블록 지정해주기
    }
  }
}

function clearBlocks() {
  //행이 꽉차면 0으로 초기화해주는 함수
  for (let i = 1; i < arena.length - 2; i++) {
    //맵을 감싼 부분을 제외하고 반복문을 돈다
    let clear = 1;

    for (let j = 1; j < arena[i].length - 1; j++) {
      if (!arena[i][j]) clear = 0; //행에서 0(빈곳)이 하나라도 있으면 clear=0
    }

    if (clear) {
      //행에 0이 하나도 없으면
      let r = new Array(tWidth).fill(0); //행 0으로 초기화
      r.push(1); //왼쪽에 1
      r.unshift(1); //오른쪽에 1

      arena.splice(i, 1); //맵의 i번째 삭제
      arena.splice(1, 0, r); //!맵의 맨위에 r을 그려줌
    }
  }
}

function drawArena() {
  //기존에 쌓인 블록 그리고, 색 입혀주기
  for (let i = 1; i < arena.length - 2; i++) {
    //행(높이)
    for (let j = 1; j < arena[i].length - 1; j++) {
      //열(너비)
      if (arena[i][j]) {
        //1~7블록 중 1개의 숫자가 있는 경우(즉, 블록이 있는경우)
        ctx.fillStyle = colors[arena[i][j]]; //블록의 색상(블록모양과 블록색상의 index가 같으므로)
        ctx.fillRect(j - 1, i - 1, 1, 1); //블록채우기 왜 -1?
      }
    }
  }
}

function initArena() {
  //맨처음 맵 초기화 -> 맵의 바깥 4면을 1로 감싸주는 기능 //!맵의 바깥 4면을 1로 감싸줘서 충격감지 가능하도록
  arena = [];

  const r = new Array(tWidth + 2).fill(1); //맵의넓이보다 2만큼 크게 1로 채운다 -> roof(맵의 위에 지붕)
  arena.push(r); //맵에 push

  for (let i = 0; i < tHeight; i++) {
    //맵의높이만큼 반복문
    let row = new Array(tWidth).fill(0); //맵 안에 각 행을 맵의너비만큼 0으로 채운다
    row.push(1); //1을 보내서 맵의 오른쪽을 감싼다
    row.unshift(1); //1을 보내서 맵의 왼쪽을 감싼다

    arena.push(row); //맵에 push
  }

  arena.push(r); //맵의 바닥에 1로 가득 채운다
  arena.push(r); //맵의 바닥에 1로 가득 채운다
}

function gameOver() {
  //맵의 높이만큼 블록이 차면 게임종료
  for (let j = 1; j < arena[1].length - 1; j++) {
    //양옆에 감싼부분 제외하고 반복문을 돈다
    if (arena[1][j]) {
      //맵안의 맨 윗줄에 블록이 있는경우
      return initArena(); //맵을 default로 초기화 한다
    }
  }
  return;
}

let interval = 1000; //1초 간격(고정값)
let lastTime = 0;
let count = 0;
//https://stackoverflow.com/questions/50311887/what-exactly-is-the-argument-in-requestanimationframe-callback
//requestAnimationFrame()안에 //* performance.now()가 있기 때문에 time=0으로 시작했어도 count가 증가하는게 가능한 것 같다(dt가 증가하므로)

function update(time = 0) {
  //실시간 진행상황 업데이트
  const dt = time - lastTime; //dt = delta time
  lastTime = time;
  count += dt;

  if (count >= interval) {
    //count가 인터벌 이상이 되면
    player.pos.y++; //내려올 블록의 y값을 올려서 블록을 한칸 내려준다
    count = 0; //count를 초기화해준다
  }

  if (collides(player, arena)) {
    //충돌감지가 되었을때
    mergeArena(player.matrix, player.pos.x, player.pos.y - 1); //그 블록을 기존맵에 합치고
    clearBlocks(); //행이 꽉찼다면 블록을 터뜨리고
    gameOver(); //열이 꽉찼다면 게임종료

    player.pos.y = 1; //위치값 초기화
    player.pos.x = 0; //위치값 초기화

    rand = Math.floor(Math.random() * pieces.length);
    player.matrix = pieces[rand]; //블록 랜덤초기화
    player.color = colors[rand + 1]; //색상 초기화

    interval = 1000; //인터벌 초기화
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height); //맵 검은배경 색상 채우기

  drawArena(); //게임진행상황 불러오기

  ctx.fillStyle = player.color; //색상 지정해주고
  drawMatrix(player.matrix, player.pos.x, player.pos.y); //내려오는 블록 정의하기

  requestAnimationFrame(update); //브라우저에게 수행하기를 원하는 애니메이션을 알리고 -> 다음 "리페인트"가 진행되기 전에 해당 애니메이션을 업데이트하는 함수를 호출
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 37 && interval - 1) {
    //왼쪽화살표키
    player.pos.x--; //내려오는 블록을 왼쪽으로 한칸 이동
    if (collides(player, arena)) {
      //충돌한 경우
      player.pos.x++; //맵안으로 밀어내기
    }
  } else if (event.keyCode === 39 && interval - 1) {
    //오른쪽화살표키
    player.pos.x++; //내려오는 블록을 오른쪽으로 한칸 이동
    if (collides(player, arena)) {
      //충돌한경우
      player.pos.x--; //맵안으로 밀어내기
    }
  } else if (event.keyCode === 40) {
    //아래쪽화살표키
    // player.pos.y++;//내려오는 블록을 아랫쪽으로 한칸 이동
    // count = 0;
    interval = 1; //!수직강하
  } else if (event.keyCode === 38) {
    //위쪽화살표키
    player.matrix = rotateMatrix(player.matrix, 1); //회전한 블록을 -> 내려오는 블록에 할당
    if (collides(player, arena)) {
      //충돌한경우
      player.matrix = rotateMatrix(player.matrix, -1); //회전못하게함
    }
  }
});

initArena(); //"계속" 맵의 바깥부분의 경계에 충돌을 감지할 수 있어야 하므로
update(); //"계속" 업데이트 해줘야 하므로

//함수10개 변수8개
