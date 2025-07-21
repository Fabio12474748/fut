const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');

// UI
const menu = document.getElementById('menu');
const gameUI = document.getElementById('gameUI');

let mode, intervalo, tempoRestante, placar;
let teclas = {};

// Áudio
const clickS = new Audio('sounds/click.mp3');
const goalS = new Audio('sounds/goal.mp3');
const crowdS = new Audio('sounds/crowd.mp3');
crowdS.loop = true;

// Jogadores
class Jogador {
  constructor(x, y, cor, kontrollado, isIA=false) {
    this.x=x; this.y=y; this.raio=15; this.cor=cor;
    this.vel=4; this.ia=isIA; this.ctrl=kontrollado;
  }
  update() {
    if (this.ctrl) {
      if (teclas["ArrowUp"]) this.y -= this.vel;
      if (teclas["ArrowDown"]) this.y += this.vel;
      if (teclas["ArrowLeft"]) this.x -= this.vel;
      if (teclas["ArrowRight"]) this.x += this.vel;
    } else if (this.ia) {
      // IA básica: move em direção à bola no eixo Y
      if (bola.y < this.y) this.y -= this.vel;
      if (bola.y > this.y) this.y += this.vel;
    }
    this.x = Math.min(Math.max(this.raio, this.x), canvas.width - this.raio);
    this.y = Math.min(Math.max(this.raio, this.y), canvas.height - this.raio);
  }
}

// Bola & limite
let jogador1, jogador2, bola;

function desenharCampo() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='green'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='white'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(400,200,70,0,2*Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(400,0); ctx.lineTo(400,400); ctx.stroke();
  ctx.fillStyle='white'; ctx.fillRect(0,150,10,100); ctx.fillRect(790,150,10,100);
  [jogador1, jogador2].forEach(p => desenharBola(p));
  desenharBola(bola);
}

function desenharBola(o) {
  ctx.beginPath(); ctx.arc(o.x,o.y,o.raio,0,2*Math.PI);
  ctx.fillStyle=o.cor; ctx.fill();
}

function mover() {
  jogador1.update(); jogador2.update();
  bola.x += bola.vx; bola.y += bola.vy;
  bola.vx *= 0.985; bola.vy *= 0.985;

  if (bola.x < bola.raio || bola.x>canvas.width-bola.raio) bola.vx*=-1;
  if (bola.y < bola.raio || bola.y>canvas.height-bola.raio) bola.vy*=-1;

  [jogador1, jogador2].forEach(p => {
    let dx=bola.x-p.x, dy=bola.y-p.y, dist=Math.hypot(dx,dy);
    if (dist < bola.raio+p.raio) {
      let ang=Math.atan2(dy,dx);
      let força=5;
      bola.vx=Math.cos(ang)*força + p.vel*Math.cos(ang);
      bola.vy=Math.sin(ang)*força + p.vel*Math.sin(ang);
    }
  });
}

function checaGol() {
  if (bola.x - bola.raio <= 0 && bola.y>=150 && bola.y<=250) marca('vermelho');
  if (bola.x + bola.raio >= canvas.width && bola.y>=150 && bola.y<=250) marca('azul');
}

function marca(time) {
  placar[time]++;
  goalS.play();
  reset();
  document.getElementById('placar').innerText =
    `Azul ${placar.azul} x ${placar.vermelho} Vermelho`;
}

function reset() {
  jogador1.x=150; jogador1.y=200;
  jogador2.x=650; jogador2.y=200;
  bola.x=400; bola.y=200; bola.vx=bola.vy=0;
}

function rodar() {
  mover();
  checaGol();
  desenharCampo();
  intervalo = requestAnimationFrame(rodar);
}

function iniciaTempo() {
  tempoRestante = 60;
  document.getElementById('tempo').innerText = `Tempo: ${tempoRestante}`;
  const t = setInterval(()=>{
    tempoRestante--;
    document.getElementById('tempo').innerText = `Tempo: ${tempoRestante}`;
    if (tempoRestante<=0) {
      clearInterval(t);
      cancelAnimationFrame(intervalo);
      crowdS.pause();
      alert(`Fim! Placar: Azul ${placar.azul} x ${placar.vermelho} Vermelho`);
      backToMenu();
    }
  },1000);
}

function startGame(sel) {
  clickS.play();
  mode = sel;
  const c1 = document.getElementById('skin1').value;
  const c2 = document.getElementById('skin2').value;
  placar = { azul: 0, vermelho: 0 };
  jogador1 = new Jogador(150,200,c1,true,false);
  jogador2 = new Jogador(650,200,c2, sel==='human-vs-human', sel==='human-vs-ia');
  bola = { x:400, y:200, raio:10, cor:'white', vx:0, vy:0 };

  menu.style.display='none';
  gameUI.style.display='block';
  crowdS.play();
  rodar();
  iniciaTempo();
}

function backToMenu() {
  clickS.play();
  cancelAnimationFrame(intervalo);
  crowdS.pause();
  menu.style.display='block';
  gameUI.style.display='none';
}

document.addEventListener('keydown',e=>teclas[e.key]=true);
document.addEventListener('keyup',e=>teclas[e.key]=false);
