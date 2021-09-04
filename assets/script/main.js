const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const replay = $('#replay')
const score = $('#score')
const canvas = document.createElement('canvas')
$('#canvas').appendChild(canvas)


let ctx = canvas.getContext("2d");

const W = 400, H = 400, unit = 20
canvas.width = W
canvas.height = H

let snake = null
let food = null
let currentHue = 'red'
let cells, request, cnt, maxScore = 0
let n
let hx,hy,fx,fy,dtx,dty
let path = []

function clearColorSetting() {
  ctx.shadowBlur = 0
  ctx.shadowColor = "white"
  ctx.globalCompositeOperation = "source-over"
}

function clear() {
  ctx.clearRect(0, 0, W, H)
}

function clearColor(x,y) {
  ctx.clearRect(x,y,unit,unit)
}

function fillColor(x,y,color = "white") {
  ctx.fillStyle = color
  ctx.fillRect(x*unit,y*unit,unit,unit)
}

function render() {
  let ans=0
  clear()
  helpers.drawGrid()
  score.innerText = cnt < 10 ? '0'+cnt : cnt


  ctx.globalCompositeOperation = "lighter"
  ctx.shadowBlur = 20
  ctx.shadowColor = currentHue
  fillColor(fx,fy,currentHue)
  clearColorSetting()

  for(let pos of path) {
    ans += hx===pos[0] && hy===pos[1]
    fillColor(pos[0],pos[1],"rgba(225,225,225,1)")
  }
  
  ctx.shadowBlur = 20
  ctx.shadowColor = "white"
  fillColor(hx,hy)
  clearColorSetting()

  return ans<2
}

class Snake {
  reset() {
    n = 0
    path = []
  }

  start() {
    n = 1
    hx=10
    hy=11
    path.push([hx,hy])


    render()
  }

  move() {
    if(KEY.get() === null) return 0;

    switch (KEY.get()) {
      case 0:
        dtx = 0, dty = -1
        break;
      case 1:
        dtx = 1, dty = 0
        break;
      case 2:
        dtx = 0, dty = 1
        break;
      case 3:
        dtx = -1, dty = 0
        break;
      default:
        dtx = dty = 0
    }


    hx+=dtx; hy+=dty;
    hx = (hx < 0) ? cells-1 : hx
    hy = (hy < 0) ? cells-1 : hy
    hx = (hx >=cells) ? 0 : hx
    hy = (hy >=cells) ? 0 : hy

    path.push([hx,hy]);

    n+=(hx==fx && hy==fy)
    cnt+=(hx==fx && hy==fy)

    while(path.length>n) path.shift()

    if(render() == false) return -1

    if(hx==fx && hy==fy) return 1
  }
}

class Food {
  reset() {

  }

  start() {
    this.new()
    fillColor(fx,fy,currentHue)
  }
  new() {
    this.del()
    let x = rint(0,cells-1)
    let y = rint(0,cells-1)
    while(path.find((pos) => {
      return pos[0]===x && pos[1]===y
    })) {
      x = rint(0,cells-1)
      y = rint(0,cells-1)
    }

    fx=x
    fy=y

    currentHue = `hsl(${~~(Math.random() * 360)},100%,50%)`
  }

  del() {
    clearColor(fx,fy)
  }
}

let KEY = {
  cur: null,
  get() {
    return this.cur
  },
  reset() {
    this.cur = null
  },
  listen() {
    addEventListener(
      "keydown",
      (e) => {
        let x = null
        switch (e.key) {
          case "ArrowUp":
            x = 0
            break;
          case "ArrowRight":
            x = 1
            break;
          case "ArrowDown":
            x = 2
            break;
          case "ArrowLeft":
            x = 3
            break;
          default:
            x = -1
        }

        if(x == this.cur || x<0 || x>3) return;
        if(n>1 && (x+this.cur)%2==0) return;
        this.cur=x
      });
  }
}

function initialize() {
  KEY.listen()
  cells = W/unit
  setup()
  replay.addEventListener("click",setup)
}

function game() {
  let move = snake.move()
  if(move==1) food.new()
  else if(move==-1) gameOver()
}

function setup() {
  clearInterval(request)
  score.innerText = "00"
  cnt = 0
  fx=-1
  fy=-1
  if(snake) snake.reset()
  else snake = new Snake()
  if(food) food.reset()
  else food = new Food()

  KEY.reset()
  snake.start()
  food.start()

  request = setInterval(game,100)
}

function gameOver() {
  clearInterval(request)
  maxScore = max(maxScore, cnt)

  setTimeout(() => {
    clear()
  },200)

  setTimeout(() => {
    ctx.fillStyle = "#4cffd7";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Poppins, sans-serif";
    ctx.fillText("GAME OVER", W / 2, H / 2);
    ctx.font = "15px Poppins, sans-serif";
    ctx.fillText(`SCORE   ${cnt}`, W / 2, H / 2 + 60);
    ctx.fillText(`MAXSCORE   ${maxScore}`, W / 2, H / 2 + 80);
  },250)
  
}

let helpers = {
  drawGrid() {
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "#232332";
    ctx.shadowBlur = 0;

    for (let i = 1; i < cells; i++) {
      let f = unit * i;
      ctx.beginPath();
      ctx.moveTo(f, 0);
      ctx.lineTo(f, H);
      ctx.stroke();

      ctx.moveTo(0, f);
      ctx.lineTo(W, f);
      ctx.stroke();
      ctx.closePath();
    }
  }
};

initialize()

function div(x,y) {
    return Math.floor(x/y)
}
function abs(x) {
    return Math.abs(x)
}
function max(x,y) {
    return Math.max(x,y)
}
function min(x,y) {
    return Math.min(x,y)
}
function rint (min=0, max=100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
