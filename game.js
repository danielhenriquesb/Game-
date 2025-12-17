const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TILE = 32;
const BULLET_DAMAGE = 50;
const ENEMY_DAMAGE = 15;
const SOLDIER_DAMAGE = 36;
const MAGE_DAMAGE = 200; // Hit kill (200% da vida dos goblins)
let gameRunning = true;

// Limitação de soldados
const MAX_SOLDIERS = 100;

/* MAPA 15x15 EXEMPLO */
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const worldW = map[0].length * TILE;
const worldH = map.length * TILE;

/* CARREGAR IMAGENS */
const playerSprite = new Image();
playerSprite.src = 'player.png';
const enemySprite = new Image();
enemySprite.src = 'enemy.png';
const soldierSprite = new Image();
soldierSprite.src = 'invocacao.png';

// SWORD - ESPADA GIRATÓRIA
const swordSprite = new Image();
swordSprite.src = 'sword.png';

let sword = {
  active: false,
  radius: 50,
  angle: 0,
  rotationSpeed: 0.05,
  size: 25,
  damage: 10000, // Hit kill (10000 de dano)
  x: 0,
  y: 0,
  speed: 6, // Velocidade de perseguição
  targetEnemy: null, // Inimigo alvo atual
  trail: [], // Array para partículas do rastro
  trailParticles: 15, // Quantidade de partículas do rastro
  hitCooldown: 0, // Cooldown para evitar múltiplos hits no mesmo frame
  returnDelay: 0, // Delay para voltar ao jogador
  
  // NOVAS PROPRIEDADES PARA PERSECUÇÃO
  detectionRadius: 500, // Raio de detecção de inimigos
  orbitRadius: 50, // Raio de órbita quando não perseguindo
  orbitSpeed: 0.08, // Velocidade de órbita
  isReturning: false, // Se está voltando ao jogador
  returnSpeed: 8, // Velocidade de retorno ao jogador
  attackMode: 'orbit', // 'orbit' ou 'pursuit'
  
  updateAnimation: function() {
    // Atualizar ângulo para efeito visual (sempre girando)
    this.angle += this.rotationSpeed;
  },
  
  findNearestEnemy: function() {
    let nearest = null;
    let minDist = Infinity;
    
    enemies.forEach(e => {
      if (e.life <= 0) return;
      
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const d = Math.hypot(dx, dy);
      
      if (d < this.detectionRadius && d < minDist) {
        minDist = d;
        nearest = e;
      }
    });
    
    return nearest;
  },
  
  moveToTarget: function(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 0) {
      // Normalizar direção e mover
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }
};

// Adicionar sprites para os itens
const herbSprite = new Image();
herbSprite.src = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
const bulletSprite = new Image();
bulletSprite.src = 'https://cdn-icons-png.flaticon.com/512/2303/2303971.png';
const soulSprite = new Image();
soulSprite.src = 'https://cdn-icons-png.flaticon.com/512/2737/2737417.png';

let playerImageLoaded = false;
let enemyImageLoaded = false;
let soldierImageLoaded = false;

playerSprite.onload = function() {
  playerImageLoaded = true;
  console.log("Player sprite carregado");
};

enemySprite.onload = function() {
  enemyImageLoaded = true;
  console.log("Enemy sprite carregado");
};

soldierSprite.onload = function() {
  soldierImageLoaded = true;
  console.log("Soldier sprite carregado (1346x897)");
};

/* SPAWN EM TILE LIVRE */
function getRandomFreePosition(size){
  let x, y;
  do{
    const tx = Math.floor(Math.random()*map[0].length);
    const ty = Math.floor(Math.random()*map.length);
    if(map[ty][tx]===0){
      x = tx*TILE + (TILE-size)/2;
      y = ty*TILE + (TILE-size)/2;
      break;
    }
  } while(true);
  return {x, y};
}

/* SISTEMA DE LOOT - COLETA AUTOMÁTICA */
let lootItems = [];
let inventory = {
  herbs: 0,
  bullets: 100,
  attackSouls: 40,  // Iniciar com 40 soldados de ataque
  mageSouls: 10     // Iniciar com 10 soldados mago
};

// Função para dropar loot quando inimigo morre
function dropLoot(enemyX, enemyY) {
  if (Math.random() < 0.7) {
    const rand = Math.random();
    if (rand < 0.4) {
      lootItems.push({
        x: enemyX,
        y: enemyY,
        type: 'herb',
        collected: false,
        sprite: herbSprite,
        size: 20
      });
    } else if (rand < 0.7) {
      lootItems.push({
        x: enemyX,
        y: enemyY,
        type: 'bullets',
        quantity: 30,
        collected: false,
        sprite: bulletSprite,
        size: 20
      });
    } else {
      // Probabilidade de spawn de almas: 50% ataque, 20% mago
      const soulRand = Math.random();
      if (soulRand < 0.5) {
        // Alma de Ataque (50%)
        lootItems.push({
          x: enemyX,
          y: enemyY,
          type: 'attackSoul',
          collected: false,
          sprite: soulSprite,
          size: 20
        });
      } else if (soulRand < 0.7) {
        // Alma de Mago (20%)
        lootItems.push({
          x: enemyX,
          y: enemyY,
          type: 'mageSoul',
          collected: false,
          sprite: soulSprite,
          size: 20
        });
      }
      // 30% restante: não dropa alma
    }
  }
}

/* SISTEMA DE SPAWN DE INIMIGOS */
const MAX_ENEMIES = 200;
const ENEMY_SPAWN_COUNT = 10;
const ENEMY_SPAWN_INTERVAL = 10000;
let enemySpawnTimer = 0;
let enemiesKilled = 0;

function spawnEnemies(count) {
  const currentEnemies = enemies.filter(e => e.life > 0).length;
  const availableSlots = MAX_ENEMIES - currentEnemies;
  
  if (availableSlots <= 0) return;
  
  const spawnCount = Math.min(count, availableSlots);
  
  for (let i = 0; i < spawnCount; i++) {
    const pos = getRandomFreePosition(20);
    enemies.push({
      x: pos.x,
      y: pos.y,
      size: 20,
      drawWidth: 32,
      drawHeight: 40,
      speed: 0.5,
      life: 100,
      maxLife: 100,
      stuckTimer: 0,
      attackCooldown: 0,
      wasAlive: true,
      targetedBy: null,
      
      spriteWidth: 192,
      spriteHeight: 160,
      frameWidth: 24,
      frameHeight: 40,
      
      currentFrame: 0,
      animationFrame: 0,
      animationSpeed: 10,
      lastDirection: 'down',
      moving: true,
      
      updateAnimation: function(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          this.lastDirection = dx > 0 ? 'right' : 'left';
        } else {
          this.lastDirection = dy > 0 ? 'down' : 'up';
        }
        
        if (this.moving) {
          this.animationFrame++;
          if (this.animationFrame >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % 8;
            this.animationFrame = 0;
          }
        } else {
          this.currentFrame = 0;
        }
      },
      
      getAnimationRow: function() {
        switch(this.lastDirection) {
          case 'down': return 0;
          case 'up': return 1;
          case 'left': return 2;
          case 'right': return 3;
          default: return 0;
        }
      },
      
      findNearestTarget: function() {
        let nearest = player;
        let minDist = Math.hypot(player.x - this.x, player.y - this.y);
        
        soldiers.forEach(s => {
          if (s.life <= 0) return;
          const d = Math.hypot(s.x - this.x, s.y - this.y);
          if (d < minDist) {
            minDist = d;
            nearest = s;
          }
        });
        
        return nearest;
      }
    });
  }
}

/* PLAYER COM ANIMAÇÃO */
const playerSpawn = getRandomFreePosition(20);
const player = {
  x: playerSpawn.x,
  y: playerSpawn.y,
  size: 20,
  drawWidth: 32,
  drawHeight: 32,
  speed: 2.5,
  vx: 0,
  vy: 0,
  dirX: 0,
  dirY: 1,
  life: 100,
  maxLife: 100,
  hitCooldown: 0,
  
  spriteWidth: 192,
  spriteHeight: 128,
  frameWidth: 192/8,
  frameHeight: 128/4,
  currentFrame: 0,
  animationFrame: 0,
  animationSpeed: 8,
  lastDirection: 'down',
  moving: false,
  
  updateAnimation: function() {
    if (this.vx === 0 && this.vy === 0) {
      this.moving = false;
      this.currentFrame = 0;
    } else {
      this.moving = true;
      this.animationFrame++;
      
      if (Math.abs(this.vx) > Math.abs(this.vy)) {
        this.lastDirection = this.vx > 0 ? 'right' : 'left';
      } else {
        this.lastDirection = this.vy > 0 ? 'down' : 'up';
      }
      
      if (this.animationFrame >= this.animationSpeed) {
        this.currentFrame = (this.currentFrame + 1) % 8;
        this.animationFrame = 0;
      }
    }
  },
  
  getAnimationRow: function() {
    switch(this.lastDirection) {
      case 'down': return 0;
      case 'up': return 1;  
      case 'left': return 2;
      case 'right': return 3;
      default: return 0;
    }
  }
};

/* INIMIGOS */
let enemies = [];

// Spawn inicial de 5 inimigos
for(let i = 0; i < 5; i++){
  const pos = getRandomFreePosition(20);
  enemies.push({
    x: pos.x,
    y: pos.y,
    size: 20,
    drawWidth: 32,
    drawHeight: 40,
    speed: 0.5,
    life: 100,
    maxLife: 100,
    stuckTimer: 0,
    attackCooldown: 0,
    wasAlive: true,
    targetedBy: null,
    
    spriteWidth: 192,
    spriteHeight: 160,
    frameWidth: 24,
    frameHeight: 40,
    
    currentFrame: 0,
    animationFrame: 0,
    animationSpeed: 10,
    lastDirection: 'down',
    moving: true,
    
    updateAnimation: function(targetX, targetY) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        this.lastDirection = dx > 0 ? 'right' : 'left';
      } else {
        this.lastDirection = dy > 0 ? 'down' : 'up';
      }
      
      if (this.moving) {
        this.animationFrame++;
        if (this.animationFrame >= this.animationSpeed) {
          this.currentFrame = (this.currentFrame + 1) % 8;
          this.animationFrame = 0;
        }
      } else {
        this.currentFrame = 0;
      }
    },
    
    getAnimationRow: function() {
      switch(this.lastDirection) {
        case 'down': return 0;
        case 'up': return 1;
        case 'left': return 2;
        case 'right': return 3;
        default: return 0;
      }
    },
    
    findNearestTarget: function() {
      let nearest = player;
      let minDist = Math.hypot(player.x - this.x, player.y - this.y);
      
      soldiers.forEach(s => {
        if (s.life <= 0) return;
        const d = Math.hypot(s.x - this.x, s.y - this.y);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      });
      
      return nearest;
    }
  });
}

/* SOLDADOS INVO CADOS */
let soldiers = [];
let soldierIdCounter = 0;
let soldiersSummoned = false;

// Projéteis mágicos
let magicProjectiles = [];

/* TIROS */
const bullets = [];

/* ATUALIZAÇÃO DA ESPADA - COMPORTAMENTO DE PERSECUÇÃO */
function updateSword() {
  if (!sword.active) {
    // Se inativa, apenas gira em volta do jogador
    sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
    sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    sword.angle += sword.orbitSpeed;
    sword.trail = []; // Limpar rastro
    sword.targetEnemy = null;
    return;
  }
  
  sword.updateAnimation();
  
  // Se está voltando ao jogador
  if (sword.isReturning) {
    const dx = player.x - sword.x;
    const dy = player.y - sword.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < sword.orbitRadius) {
      // Chegou perto do jogador, voltar a orbitar
      sword.isReturning = false;
      sword.attackMode = 'orbit';
      sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
      sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    } else {
      // Continuar voltando
      sword.x += (dx / distance) * sword.returnSpeed;
      sword.y += (dy / distance) * sword.returnSpeed;
    }
    
    // Adicionar rastro mesmo quando voltando
    addSwordTrail();
    return;
  }
  
  // Procurar inimigo mais próximo
  if (!sword.targetEnemy || sword.targetEnemy.life <= 0) {
    sword.targetEnemy = sword.findNearestEnemy();
    
    if (!sword.targetEnemy) {
      // Nenhum inimigo encontrado, voltar ao modo de órbita
      if (sword.attackMode === 'pursuit') {
        sword.isReturning = true;
      } else {
        sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
        sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
        sword.angle += sword.orbitSpeed;
      }
      addSwordTrail();
      return;
    }
    
    sword.attackMode = 'pursuit';
  }
  
  // Mover em direção ao inimigo alvo
  if (sword.targetEnemy && sword.targetEnemy.life > 0) {
    const dx = sword.targetEnemy.x - sword.x;
    const dy = sword.targetEnemy.y - sword.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 10) {
      // Atingiu o inimigo - causar dano
      const wasAlive = sword.targetEnemy.life > 0;
      sword.targetEnemy.life -= sword.damage;
      
      if (wasAlive && sword.targetEnemy.life <= 0) {
        enemiesKilled++;
        sword.targetEnemy.wasAlive = false;
        dropLoot(sword.targetEnemy.x, sword.targetEnemy.y);
        
        // Efeito visual de hit
        for (let i = 0; i < 8; i++) {
          sword.trail.push({
            x: sword.targetEnemy.x + Math.random() * 30 - 15,
            y: sword.targetEnemy.y + Math.random() * 30 - 15,
            life: 15,
            maxLife: 15,
            size: 4,
            color: 'cyan'
          });
        }
        
        console.log(`Inimigo morto pela espada! Total: ${enemiesKilled}`);
      }
      
      // Cooldown e buscar próximo inimigo
      sword.hitCooldown = 8;
      sword.targetEnemy = sword.findNearestEnemy();
      
      // Se não houver mais inimigos, voltar ao jogador
      if (!sword.targetEnemy) {
        sword.isReturning = true;
      }
    } else {
      // Continuar perseguindo
      sword.moveToTarget(sword.targetEnemy.x, sword.targetEnemy.y);
    }
  } else {
    // Inimigo morreu, buscar próximo
    sword.targetEnemy = sword.findNearestEnemy();
    if (!sword.targetEnemy) {
      sword.isReturning = true;
    }
  }
  
  // Adicionar partícula de rastro
  addSwordTrail();
  
  // Cooldown de hit
  if (sword.hitCooldown > 0) {
    sword.hitCooldown--;
  }
}

function addSwordTrail() {
  if (!sword.active) return;
  
  sword.trail.unshift({
    x: sword.x,
    y: sword.y,
    life: 25,
    maxLife: 25,
    size: sword.attackMode === 'pursuit' ? 4 : 3,
    color: sword.attackMode === 'pursuit' ? 'cyan' : 'rgba(100, 150, 255, 0.7)'
  });
  
  // Limitar número de partículas do rastro
  if (sword.trail.length > sword.trailParticles) {
    sword.trail.pop();
  }
  
  // Atualizar vida das partículas do rastro
  sword.trail.forEach(particle => {
    particle.life--;
  });
  
  // Remover partículas mortas
  sword.trail = sword.trail.filter(p => p.life > 0);
}

/* VERIFICAR COLISÃO DA ESPADA COM INIMIGOS (backup) */
function checkSwordCollisions() {
  if (!sword.active || sword.hitCooldown > 0) return;
  
  // Verificar colisão com todos os inimigos (para casos de múltiplos inimigos próximos)
  enemies.forEach(enemy => {
    if (enemy.life <= 0) return;
    
    const dx = enemy.x - sword.x;
    const dy = enemy.y - sword.y;
    const distance = Math.hypot(dx, dy);
    const hitRadius = (enemy.size + sword.size) / 2;
    
    if (distance < hitRadius) {
      // Hit kill no inimigo
      const wasAlive = enemy.life > 0;
      enemy.life -= sword.damage;
      
      if (wasAlive && enemy.life <= 0) {
        enemiesKilled++;
        enemy.wasAlive = false;
        dropLoot(enemy.x, enemy.y);
        
        // Efeito visual de hit
        for (let i = 0; i < 5; i++) {
          sword.trail.push({
            x: enemy.x + Math.random() * 20 - 10,
            y: enemy.y + Math.random() * 20 - 10,
            life: 10,
            maxLife: 10,
            size: 2,
            color: 'white'
          });
        }
        
        console.log(`Inimigo morto pela espada! Total: ${enemiesKilled}`);
      }
      
      // Cooldown para evitar múltiplos hits no mesmo inimigo
      sword.hitCooldown = 5;
    }
  });
}

/* TOGGLE DA ESPADA */
function toggleSword() {
  sword.active = !sword.active;
  const swordBtn = document.getElementById('sword');
  
  if (sword.active) {
    swordBtn.classList.add('active-mode');
    swordBtn.title = "Espada: ATIVA (Perseguindo inimigos)";
    console.log("Espada ativada! Perseguindo inimigos...");
    
    // Inicializar posição da espada
    sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
    sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    sword.targetEnemy = sword.findNearestEnemy();
    sword.attackMode = sword.targetEnemy ? 'pursuit' : 'orbit';
    
  } else {
    swordBtn.classList.remove('active-mode');
    swordBtn.title = "Espada: DESATIVADA (Clique para ativar)";
    console.log("Espada desativada!");
    sword.targetEnemy = null;
    sword.isReturning = false;
    sword.attackMode = 'orbit';
  }
}

/* EVENT LISTENER PARA BOTÃO DA ESPADA */
document.getElementById("sword").addEventListener("pointerdown", toggleSword);

/* COLISÃO */
function isWall(px, py){
  const tx = Math.floor(px/TILE);
  const ty = Math.floor(py/TILE);
  if(ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return true;
  return map[ty][tx] === 1;
}

function canMove(x, y, s){
  return !isWall(x, y) && !isWall(x + s, y) && !isWall(x, y + s) && !isWall(x + s, y + s);
}

/* NOVO JOYSTICK (EXTERNO AO CANVAS) */
const joystick = document.getElementById("joystick");
const thumb = document.getElementById("thumb");

let dragging = false;
let joystickCenter = { x: 0, y: 0 };
let joystickMaxDistance = 40;

// Função para obter posição do toque/clique
function getPos(e) {
  return e.touches ? e.touches[0] : e;
}

// Iniciar arrasto do joystick
joystick.addEventListener("touchstart", startJoystick);
joystick.addEventListener("mousedown", startJoystick);

function startJoystick(e) {
  dragging = true;
  const rect = joystick.getBoundingClientRect();
  joystickCenter.x = rect.left + rect.width / 2;
  joystickCenter.y = rect.top + rect.height / 2;
  
  moveJoystick(e);
}

// Mover joystick
window.addEventListener("touchmove", moveJoystick);
window.addEventListener("mousemove", moveJoystick);

function moveJoystick(e) {
  if (!dragging) return;
  const pos = getPos(e);
  let dx = pos.clientX - joystickCenter.x;
  let dy = pos.clientY - joystickCenter.y;

  const dist = Math.hypot(dx, dy);
  if (dist > joystickMaxDistance) {
    dx = (dx / dist) * joystickMaxDistance;
    dy = (dy / dist) * joystickMaxDistance;
  }

  thumb.style.transform = `translate(${dx - 25}px, ${dy - 25}px)`;

  player.vx = dx / joystickMaxDistance * player.speed;
  player.vy = dy / joystickMaxDistance * player.speed;
  
  if (dist > 5) {
    player.dirX = dx / dist;
    player.dirY = dy / dist;
  }
}

// Parar joystick
window.addEventListener("touchend", endJoystick);
window.addEventListener("mouseup", endJoystick);

function endJoystick() {
  dragging = false;
  thumb.style.transform = "translate(-50%, -50%)";
  player.vx = 0;
  player.vy = 0;
}

/* ATAQUE */
function getNearestEnemy(){
  let nearest = null;
  let minDist = Infinity;
  
  enemies.forEach(e => {
    if(e.life <= 0) return;
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const d = Math.hypot(dx, dy);
    if(d < minDist){
      minDist = d;
      nearest = e;
    }
  });
  
  return nearest;
}

function shoot(){
  if(!gameRunning) return;
  
  if (inventory.bullets <= 0) {
    console.log("Sem balas no inventário!");
    return;
  }
  
  inventory.bullets--;
  updateGameUI();
  
  let dx = player.dirX;
  let dy = player.dirY;
  const target = getNearestEnemy();
  
  if(target){
    const tx = (target.x + target.size/2) - (player.x + player.size/2);
    const ty = (target.y + target.size/2) - (player.y + player.size/2);
    const d = Math.hypot(tx, ty) || 1;
    dx = tx/d;
    dy = ty/d;
  }
  
  bullets.push({
    x: player.x + player.size/2,
    y: player.y + player.size/2,
    vx: dx * 5,
    vy: dy * 5
  });
}

document.getElementById("attack").addEventListener("pointerdown", shoot);
document.addEventListener("keydown", e => {
  if(e.code === "Space") shoot();
});

/* SISTEMA DE MOVIMENTO INTELIGENTE PARA TODOS */
function moveIntelligently(entity, targetX, targetY) {
  const dx = targetX - entity.x;
  const dy = targetY - entity.y;
  const distance = Math.hypot(dx, dy) || 1;
  
  if (distance < 10) {
    entity.moving = false;
    return true;
  }
  
  const dirX = dx / distance;
  const dirY = dy / distance;
  const newX = entity.x + dirX * entity.speed;
  const newY = entity.y + dirY * entity.speed;
  
  if (canMove(newX, newY, entity.size)) {
    entity.x = newX;
    entity.y = newY;
    entity.stuckTimer = 0;
    entity.moving = true;
    return true;
  } else {
    if (!entity.stuckTimer) entity.stuckTimer = 0;
    entity.stuckTimer++;
    
    if (entity.stuckTimer > 20) {
      entity.stuckTimer = 0;
      
      const directions = [
        { dx: dirX, dy: 0 },
        { dx: 0, dy: dirY },
        { dx: -dirY, dy: dirX },
        { dx: dirY, dy: -dirX },
        { dx: -dirX, dy: 0 },
        { dx: 0, dy: -dirY },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      
      for (const dir of directions) {
        const testX = entity.x + dir.dx * entity.speed;
        const testY = entity.y + dir.dy * entity.speed;
        
        if (canMove(testX, testY, entity.size)) {
          entity.x = testX;
          entity.y = testY;
          entity.moving = true;
          return true;
        }
      }
      
      entity.moving = false;
      return false;
    }
    
    if (canMove(newX, entity.y, entity.size)) {
      entity.x = newX;
      entity.stuckTimer = 0;
      entity.moving = true;
      return true;
    } else if (canMove(entity.x, newY, entity.size)) {
      entity.y = newY;
      entity.stuckTimer = 0;
      entity.moving = true;
      return true;
    }
    
    entity.moving = false;
    return false;
  }
}

/* FUNÇÃO PARA CRIAR UM SOLDADO DE ATAQUE */
function createAttackSoldier(spawnX, spawnY) {
  soldierIdCounter++;
  const soldierId = soldierIdCounter;
  
  const soldier = {
    x: spawnX,
    y: spawnY,
    size: 20,
    drawWidth: 32,
    drawHeight: 32,
    speed: 1.5,
    life: 300,
    maxLife: 300,
    stuckTimer: 0,
    attackCooldown: 0,
    hitCooldown: 0,
    id: soldierId,
    targetEnemy: null,
    isEngaged: false,
    type: 'attack',
    
    spriteWidth: 1346,
    spriteHeight: 897,
    frameWidth: Math.floor(1346/8),
    frameHeight: Math.floor(897/4),
    
    currentFrame: 0,
    animationFrame: 0,
    animationSpeed: 8,
    lastDirection: 'down',
    moving: false,
    
    updateAnimation: function(targetX, targetY) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        this.moving = false;
        this.currentFrame = 0;
      } else {
        this.moving = true;
        this.animationFrame++;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          this.lastDirection = dx > 0 ? 'right' : 'left';
        } else {
          this.lastDirection = dy > 0 ? 'down' : 'up';
        }
        
        if (this.animationFrame >= this.animationSpeed) {
          this.currentFrame = (this.currentFrame + 1) % 8;
          this.animationFrame = 0;
        }
      }
    },
    
    getAnimationRow: function() {
      switch(this.lastDirection) {
        case 'down': return 0;
        case 'up': return 1;  
        case 'left': return 2;
        case 'right': return 3;
        default: return 0;
      }
    },
    
    findUnassignedEnemy: function() {
      let bestEnemy = null;
      let minDist = Infinity;
      let minSoldiersOnSameEnemy = Infinity;
      
      enemies.forEach(e => {
        if(e.life <= 0) return;
        
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 300) {
          let soldiersOnThisEnemy = 0;
          soldiers.forEach(s => {
            if (s !== this && s.targetEnemy === e) {
              soldiersOnThisEnemy++;
            }
          });
          
          if (soldiersOnThisEnemy < minSoldiersOnSameEnemy || 
              (soldiersOnThisEnemy === minSoldiersOnSameEnemy && distance < minDist)) {
            bestEnemy = e;
            minDist = distance;
            minSoldiersOnSameEnemy = soldiersOnThisEnemy;
          }
        }
      });
      
      if (bestEnemy) {
        this.targetEnemy = bestEnemy;
        this.isEngaged = true;
        bestEnemy.targetedBy = this.id;
      }
      
      return bestEnemy;
    },
    
    attack: function(enemy) {
      if (this.attackCooldown <= 0) {
        enemy.life -= SOLDIER_DAMAGE;
        this.attackCooldown = 40;
        
        if (enemy.life <= 0 && enemy.wasAlive) {
          enemiesKilled++;
          dropLoot(enemy.x, enemy.y);
          enemy.wasAlive = false;
          enemy.targetedBy = null;
          this.targetEnemy = null;
          this.isEngaged = false;
        }
      }
    },
    
    releaseTarget: function() {
      if (this.targetEnemy && this.targetEnemy.targetedBy === this.id) {
        this.targetEnemy.targetedBy = null;
      }
      this.targetEnemy = null;
      this.isEngaged = false;
    }
  };
  
  return soldier;
}

/* FUNÇÃO PARA CRIAR UM SOLDADO MAGO */
function createMageSoldier(spawnX, spawnY) {
  soldierIdCounter++;
  const soldierId = soldierIdCounter;
  
  const mage = {
    x: spawnX,
    y: spawnY,
    size: 20,
    drawWidth: 32,
    drawHeight: 32,
    speed: 1.5,
    life: 300,
    maxLife: 300,
    stuckTimer: 0,
    attackCooldown: 0,
    hitCooldown: 0,
    id: soldierId,
    targetEnemy: null,
    isEngaged: false,
    type: 'mage',
    
    spriteWidth: 1346,
    spriteHeight: 897,
    frameWidth: Math.floor(1346/8),
    frameHeight: Math.floor(897/4),
    
    currentFrame: 0,
    animationFrame: 0,
    animationSpeed: 8,
    lastDirection: 'down',
    moving: false,
    
    updateAnimation: function(targetX, targetY) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        this.moving = false;
        this.currentFrame = 0;
      } else {
        this.moving = true;
        this.animationFrame++;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          this.lastDirection = dx > 0 ? 'right' : 'left';
        } else {
          this.lastDirection = dy > 0 ? 'down' : 'up';
        }
        
        if (this.animationFrame >= this.animationSpeed) {
          this.currentFrame = (this.currentFrame + 1) % 8;
          this.animationFrame = 0;
        }
      }
    },
    
    getAnimationRow: function() {
      switch(this.lastDirection) {
        case 'down': return 0;
        case 'up': return 1;  
        case 'left': return 2;
        case 'right': return 3;
        default: return 0;
      }
    },
    
    findUnassignedEnemy: function() {
      let bestEnemy = null;
      let minDist = Infinity;
      let minSoldiersOnSameEnemy = Infinity;
      
      enemies.forEach(e => {
        if(e.life <= 0) return;
        
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 400) { // Alcance maior para magos
          let soldiersOnThisEnemy = 0;
          soldiers.forEach(s => {
            if (s !== this && s.targetEnemy === e) {
              soldiersOnThisEnemy++;
            }
          });
          
          if (soldiersOnThisEnemy < minSoldiersOnSameEnemy || 
              (soldiersOnThisEnemy === minSoldiersOnSameEnemy && distance < minDist)) {
            bestEnemy = e;
            minDist = distance;
            minSoldiersOnSameEnemy = soldiersOnThisEnemy;
          }
        }
      });
      
      if (bestEnemy) {
        this.targetEnemy = bestEnemy;
        this.isEngaged = true;
        bestEnemy.targetedBy = this.id;
      }
      
      return bestEnemy;
    },
    
    attack: function(enemy) {
      if (this.attackCooldown <= 0) {
        // Lançar projétil mágico
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.hypot(dx, dy) || 1;
        
        magicProjectiles.push({
          x: this.x + this.size/2,
          y: this.y + this.size/2,
          targetX: enemy.x,
          targetY: enemy.y,
          vx: (dx / distance) * 4,
          vy: (dy / distance) * 4,
          radius: 10,
          damage: MAGE_DAMAGE,
          owner: this.id
        });
        
        this.attackCooldown = 60; // Cooldown maior para magos
      }
    },
    
    releaseTarget: function() {
      if (this.targetEnemy && this.targetEnemy.targetedBy === this.id) {
        this.targetEnemy.targetedBy = null;
      }
      this.targetEnemy = null;
      this.isEngaged = false;
    }
  };
  
  return mage;
}

/* SISTEMA DE INVOCAÇÕES EM MASSA */
function toggleMassSummon() {
  if (!soldiersSummoned) {
    // Verificar limite máximo de soldados
    const currentSoldiers = soldiers.length;
    if (currentSoldiers >= MAX_SOLDIERS) {
      console.log(`Limite máximo de ${MAX_SOLDIERS} soldados atingido!`);
      return;
    }
    
    const totalSouls = inventory.attackSouls + inventory.mageSouls;
    if (totalSouls <= 0) {
      console.log("Sem almas para invocar!");
      return;
    }
    
    const availableSlots = MAX_SOLDIERS - currentSoldiers;
    const soulsToSummon = Math.min(totalSouls, availableSlots);
    
    // Limpar invocações anteriores (se houver)
    soldiers.length = 0;
    
    // Criar posições circulares para spawnar os soldados
    const spawnRadius = 60;
    const angleStep = (2 * Math.PI) / soulsToSummon;
    
    // Invocar soldados de ataque primeiro
    let attackSummoned = 0;
    let mageSummoned = 0;
    
    for (let i = 0; i < soulsToSummon; i++) {
      if (inventory.attackSouls > 0 && attackSummoned < inventory.attackSouls) {
        // Invocar soldado de ataque
        const angle = i * angleStep;
        let spawnX = player.x + Math.cos(angle) * spawnRadius;
        let spawnY = player.y + Math.sin(angle) * spawnRadius;
        
        // Ajustar posição se não puder mover
        for (let attempts = 0; attempts < 8; attempts++) {
          const testAngle = angle + (attempts * Math.PI / 4);
          const testX = player.x + Math.cos(testAngle) * spawnRadius;
          const testY = player.y + Math.sin(testAngle) * spawnRadius;
          
          if (canMove(testX, testY, 20)) {
            spawnX = testX;
            spawnY = testY;
            break;
          }
        }
        
        const soldier = createAttackSoldier(spawnX, spawnY);
        soldiers.push(soldier);
        attackSummoned++;
        
      } else if (inventory.mageSouls > 0 && mageSummoned < inventory.mageSouls) {
        // Invocar soldado mago
        const angle = i * angleStep;
        let spawnX = player.x + Math.cos(angle) * spawnRadius;
        let spawnY = player.y + Math.sin(angle) * spawnRadius;
        
        // Ajustar posição se não puder mover
        for (let attempts = 0; attempts < 8; attempts++) {
          const testAngle = angle + (attempts * Math.PI / 4);
          const testX = player.x + Math.cos(testAngle) * spawnRadius;
          const testY = player.y + Math.sin(testAngle) * spawnRadius;
          
          if (canMove(testX, testY, 20)) {
            spawnX = testX;
            spawnY = testY;
            break;
          }
        }
        
        const mage = createMageSoldier(spawnX, spawnY);
        soldiers.push(mage);
        mageSummoned++;
      }
    }
    
    // Remover almas do inventário
    inventory.attackSouls -= attackSummoned;
    inventory.mageSouls -= mageSummoned;
    
    soldiersSummoned = true;
    console.log(`${attackSummoned} soldados de ataque e ${mageSummoned} magos invocados! Total: ${soldiers.length}/${MAX_SOLDIERS}`);
    
    // Atualizar botão para modo "despawn"
    document.getElementById('summon').textContent = '❌';
    document.getElementById('summon').title = 'Despawnar todas as invocações';
    
  } else {
    // Despawnar todas as invocações
    let attackCount = 0;
    let mageCount = 0;
    
    soldiers.forEach(s => {
      if (s.type === 'attack') {
        attackCount++;
      } else if (s.type === 'mage') {
        mageCount++;
      }
    });
    
    // Retornar almas ao inventário
    inventory.attackSouls += attackCount;
    inventory.mageSouls += mageCount;
    
    // Limpar soldados
    soldiers.length = 0;
    magicProjectiles.length = []; // Limpar projéteis mágicos
    
    soldiersSummoned = false;
    console.log(`${attackCount} soldados de ataque e ${mageCount} magos despawnados. Almas devolvidas.`);
    
    // Atualizar botão para modo "spawn"
    document.getElementById('summon').textContent = '👥';
    document.getElementById('summon').title = 'Invocar todas as invocações';
  }
  
  updateGameUI();
  updateSummonButton();
}

/* USO AUTOMÁTICO DE ERVA */
function checkAutoHerbUse() {
  const playerNeedsHeal = player.life <= player.maxLife * 0.5;
  
  let soldierNeedsHeal = false;
  soldiers.forEach(s => {
    if (s.life <= s.maxLife * 0.5) {
      soldierNeedsHeal = true;
    }
  });
  
  if ((playerNeedsHeal || soldierNeedsHeal) && inventory.herbs > 0) {
    useItem('herb');
    console.log("Erva usada automaticamente!");
  }
}

/* ATUALIZAR BOTÃO DE INVO CAÇÃO */
function updateSummonButton() {
  const summonBtn = document.getElementById('summon');
  const soulsDisplay = document.querySelector('.souls-display');
  
  const totalSouls = inventory.attackSouls + inventory.mageSouls;
  
  if (totalSouls > 0 || soldiersSummoned) {
    summonBtn.disabled = false;
    soulsDisplay.classList.add('active');
  } else {
    summonBtn.disabled = true;
    soulsDisplay.classList.remove('active');
  }
}

/* EVENT LISTENER PARA BOTÃO DE INVO CAÇÃO */
document.getElementById("summon").addEventListener("pointerdown", toggleMassSummon);

/* GAME OVER */
function gameOver(){
  gameRunning = false;
  setTimeout(() => {
    alert(`☠️ GAME OVER\n\n📊 Estatísticas:\n🎯 Inimigos derrotados: ${enemiesKilled}\n🌿 Ervas coletadas: ${inventory.herbs}\n🔫 Balas coletadas: ${inventory.bullets}\n👥 Soldados invocados: ${soldiers.length}`);
    location.reload();
  }, 100);
}

/* INVENTÁRIO */
function updateInventoryUI() {
  const inventoryContent = document.getElementById('inventoryContent');
  inventoryContent.innerHTML = '';
  
  if (inventory.herbs > 0) {
    const herbItem = document.createElement('div');
    herbItem.className = 'inventory-item';
    herbItem.innerHTML = `
      <div class="item-info">
        <span>🌿 Erva Medicinal</span>
        <span class="item-count">${inventory.herbs}</span>
      </div>
      <div class="item-actions">
        <button class="item-btn use" data-item="herb">Usar</button>
        <button class="item-btn drop" data-item="herb">Dropar</button>
      </div>
    `;
    inventoryContent.appendChild(herbItem);
  }
  
  if (inventory.bullets > 0) {
    const bulletItem = document.createElement('div');
    bulletItem.className = 'inventory-item bullet';
    bulletItem.innerHTML = `
      <div class="item-info">
        <span>🔫 Balas</span>
        <span class="item-count">${inventory.bullets}</span>
      </div>
      <div class="item-actions">
        <button class="item-btn drop" data-item="bullets">Dropar 10</button>
      </div>
    `;
    inventoryContent.appendChild(bulletItem);
  }
  
  if (inventory.attackSouls > 0) {
    const attackSoulItem = document.createElement('div');
    attackSoulItem.className = 'inventory-item';
    attackSoulItem.innerHTML = `
      <div class="item-info">
        <span>⚔️ Alma de Guerreiro</span>
        <span class="item-count">${inventory.attackSouls}</span>
      </div>
    `;
    inventoryContent.appendChild(attackSoulItem);
  }
  
  if (inventory.mageSouls > 0) {
    const mageSoulItem = document.createElement('div');
    mageSoulItem.className = 'inventory-item soul';
    mageSoulItem.innerHTML = `
      <div class="item-info">
        <span>🔮 Alma de Mago</span>
        <span class="item-count">${inventory.mageSouls}</span>
      </div>
    `;
    inventoryContent.appendChild(mageSoulItem);
  }
  
  if (inventory.herbs === 0 && inventory.bullets === 0 && inventory.attackSouls === 0 && inventory.mageSouls === 0) {
    inventoryContent.innerHTML = '<p style="text-align:center;color:#888;">Inventário vazio</p>';
  }
  
  document.querySelectorAll('.item-btn.use').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.getAttribute('data-item');
      useItem(item);
    });
  });
  
  document.querySelectorAll('.item-btn.drop').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.getAttribute('data-item');
      dropItem(item);
    });
  });
}

function useItem(itemType) {
  if (itemType === 'herb' && inventory.herbs > 0) {
    const healAmount = Math.floor(player.maxLife * 0.5);
    player.life = Math.min(player.maxLife, player.life + healAmount);
    
    soldiers.forEach(soldier => {
      soldier.life = Math.min(soldier.maxLife, soldier.life + healAmount);
    });
    
    inventory.herbs--;
    
    console.log(`Usou erva! Recuperou ${healAmount} de vida para jogador e soldados.`);
    updateInventoryUI();
    updateGameUI();
    closeInventory();
  }
}

function dropItem(itemType) {
  if (itemType === 'herb' && inventory.herbs > 0) {
    lootItems.push({
      x: player.x,
      y: player.y,
      type: 'herb',
      collected: false,
      sprite: herbSprite,
      size: 20
    });
    inventory.herbs--;
    console.log("Erva dropada no chão!");
  } else if (itemType === 'bullets' && inventory.bullets >= 10) {
    lootItems.push({
      x: player.x,
      y: player.y,
      type: 'bullets',
      quantity: 10,
      collected: false,
      sprite: bulletSprite,
      size: 20
    });
    inventory.bullets -= 10;
    console.log("10 balas dropadas no chão!");
  }
  
  updateInventoryUI();
  updateGameUI();
  closeInventory();
}

function openInventory() {
  document.getElementById('inventory').style.display = 'block';
  updateInventoryUI();
}

function closeInventory() {
  document.getElementById('inventory').style.display = 'none';
}

document.getElementById('openInventory').addEventListener('click', openInventory);
document.getElementById('closeInventory').addEventListener('click', closeInventory);

/* COLETA AUTOMÁTICA */
function checkAutoCollection() {
  lootItems.forEach((item, index) => {
    if (item.collected) return;
    
    const dx = item.x - player.x;
    const dy = item.y - player.y;
    const d = Math.hypot(dx, dy);
    
    if (d < 25) {
      collectItemAuto(item, index);
      return;
    }
  });
  
  soldiers.forEach(soldier => {
    lootItems.forEach((item, index) => {
      if (item.collected) return;
      
      const dx = item.x - soldier.x;
      const dy = item.y - soldier.y;
      const d = Math.hypot(dx, dy);
      
      if (d < 25) {
        collectItemAuto(item, index);
        return;
      }
    });
  });
}

function collectItemAuto(item, index) {
  if (item.type === 'herb') {
    inventory.herbs++;
    console.log("Erva coletada automaticamente!");
  } else if (item.type === 'bullets') {
    inventory.bullets += item.quantity;
    console.log(`${item.quantity} balas coletadas automaticamente!`);
  } else if (item.type === 'attackSoul') {
    inventory.attackSouls++;
    console.log("Alma de Guerreiro coletada automaticamente!");
  } else if (item.type === 'mageSoul') {
    inventory.mageSouls++;
    console.log("Alma de Mago coletada automaticamente!");
  }
  
  lootItems.splice(index, 1);
  updateInventoryUI();
  updateGameUI();
  updateSummonButton();
}

/* CAMERA CENTRAL */
const camera = {x: 0, y: 0};
let lastTime = 0;

/* MINIMAPA CONFIGURAÇÃO */
const minimap = {
  x: 10,
  y: 10,
  width: 150,
  height: 150,
  scale: 0.05
};

function drawMinimap() {
  const { x, y, width, height, scale } = minimap;
  
  // Fundo do minimapa
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  
  // Desenhar paredes do mapa
  for(let ty = 0; ty < map.length; ty++) {
    for(let tx = 0; tx < map[0].length; tx++) {
      if(map[ty][tx] === 1) {
        ctx.fillStyle = '#555';
        ctx.fillRect(x + tx * scale, y + ty * scale, scale, scale);
      }
    }
  }
  
  // Desenhar inimigos (pontos vermelhos)
  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    if(e.life <= 0) return;
    const enemyMapX = x + (e.x / TILE) * scale;
    const enemyMapY = y + (e.y / TILE) * scale;
    ctx.beginPath();
    ctx.arc(enemyMapX, enemyMapY, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Desenhar soldados (pontos azuis)
  ctx.fillStyle = 'blue';
  soldiers.forEach(s => {
    if(s.life <= 0) return;
    const soldierMapX = x + (s.x / TILE) * scale;
    const soldierMapY = y + (s.y / TILE) * scale;
    ctx.beginPath();
    ctx.arc(soldierMapX, soldierMapY, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Desenhar espada (ponto ciano se ativa)
  if (sword.active) {
    ctx.fillStyle = 'cyan';
    const swordMapX = x + (sword.x / TILE) * scale;
    const swordMapY = y + (sword.y / TILE) * scale;
    ctx.beginPath();
    ctx.arc(swordMapX, swordMapY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Desenhar jogador (ponto branco)
  ctx.fillStyle = 'white';
  const playerMapX = x + (player.x / TILE) * scale;
  const playerMapY = y + (player.y / TILE) * scale;
  ctx.beginPath();
  ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* GERENCIAMENTO DE INTERFACE */
const statusBtn = document.getElementById('statusBtn');
const statusPanel = document.getElementById('statusPanel');
const lifeValue = document.getElementById('lifeValue');
const ammoValue = document.getElementById('ammoValue');
const soulsValue = document.getElementById('soulsValue');
const killedCount = document.getElementById('killedCount');
const herbsCount = document.getElementById('herbsCount');
const bulletsCount = document.getElementById('bulletsCount');
const soldiersCount = document.getElementById('soldiersCount');
const enemiesAlive = document.getElementById('enemiesAlive');
const spawnTimer = document.getElementById('spawnTimer');

statusBtn.addEventListener('click', function() {
  statusPanel.classList.toggle('show');
});

function updateGameUI() {
  const aliveEnemies = enemies.filter(e => e.life > 0).length;
  const aliveSoldiers = soldiers.filter(s => s.life > 0).length;
  const timeToSpawn = Math.max(0, Math.floor((ENEMY_SPAWN_INTERVAL - enemySpawnTimer)/1000));
  const totalSouls = inventory.attackSouls + inventory.mageSouls;
  
  lifeValue.textContent = Math.max(player.life, 0);
  ammoValue.textContent = inventory.bullets;
  soulsValue.textContent = totalSouls;
  killedCount.textContent = enemiesKilled;
  herbsCount.textContent = inventory.herbs;
  bulletsCount.textContent = inventory.bullets;
  soldiersCount.textContent = aliveSoldiers;
  enemiesAlive.textContent = aliveEnemies;
  spawnTimer.textContent = timeToSpawn;
  
  const lifeDisplay = document.querySelector('.life-display');
  const ammoDisplay = document.querySelector('.ammo-display');
  const soulsDisplay = document.querySelector('.souls-display');
  
  if (player.life < 30) {
    lifeDisplay.classList.add('low');
  } else {
    lifeDisplay.classList.remove('low');
  }
  
  if (inventory.bullets < 20) {
    ammoDisplay.classList.add('low');
  } else {
    ammoDisplay.classList.remove('low');
  }
  
  if (totalSouls > 0) {
    soulsDisplay.classList.add('active');
  } else {
    soulsDisplay.classList.remove('active');
  }
  
  // Atualizar tooltip da espada
  const swordBtn = document.getElementById('sword');
  const modeText = sword.active ? 
    (sword.attackMode === 'pursuit' ? 'PERSEGUINDO INIMIGOS' : 'ÓRBITA') : 
    'DESATIVADA';
  swordBtn.title = `Espada: ${modeText}`;
}

/* ATUALIZAÇÃO DOS PROJÉTEIS MÁGICOS */
function updateMagicProjectiles() {
  for (let i = magicProjectiles.length - 1; i >= 0; i--) {
    const proj = magicProjectiles[i];
    
    // Mover projétil
    proj.x += proj.vx;
    proj.y += proj.vy;
    
    // Verificar se atingiu o alvo
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const distanceToTarget = Math.hypot(dx, dy);
    
    if (distanceToTarget < 20) {
      // Atingiu o alvo - causar dano em área
      const explosionRadius = 60; // 3x maior que ataque normal
      
      enemies.forEach(e => {
        if (e.life <= 0) return;
        
        const distToExplosion = Math.hypot(e.x - proj.x, e.y - proj.y);
        if (distToExplosion < explosionRadius) {
          e.life -= proj.damage;
          
          if (e.life <= 0 && e.wasAlive) {
            enemiesKilled++;
            dropLoot(e.x, e.y);
            e.wasAlive = false;
            e.targetedBy = null;
          }
        }
      });
      
      // Remover projétil
      magicProjectiles.splice(i, 1);
      continue;
    }
    
    // Verificar se saiu dos limites
    if (proj.x < 0 || proj.x > worldW || proj.y < 0 || proj.y > worldH) {
      magicProjectiles.splice(i, 1);
    }
  }
}

function update(currentTime = 0){
  if(!gameRunning) return;
  
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  player.updateAnimation();
  
  enemySpawnTimer += deltaTime;
  if(enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
    spawnEnemies(ENEMY_SPAWN_COUNT);
    enemySpawnTimer = 0;
  }
  
  const nx = player.x + player.vx;
  const ny = player.y + player.vy;
  
  if(canMove(nx, player.y, player.size)) player.x = nx;
  if(canMove(player.x, ny, player.size)) player.y = ny;
  
  // Atualizar inimigos
  enemies.forEach(e => {
    if(e.life <= 0) return;
    
    const target = e.findNearestTarget();
    e.updateAnimation(target.x, target.y);
    moveIntelligently(e, target.x, target.y);
    
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const distance = Math.hypot(dx, dy);
    
    if(distance < 20 && e.attackCooldown <= 0){
      target.life -= ENEMY_DAMAGE;
      e.attackCooldown = 40;
      
      if(target === player && player.life <= 0) {
        gameOver();
      }
    }
    
    if (e.attackCooldown > 0) e.attackCooldown--;
  });
  
  // Atualizar soldados
  soldiers.forEach((s, sIndex) => {
    if (s.life <= 0) {
      s.releaseTarget();
      soldiers.splice(sIndex, 1);
      return;
    }
    
    if (s.targetEnemy && (s.targetEnemy.life <= 0 || s.targetEnemy.targetedBy !== s.id)) {
      s.releaseTarget();
    }
    
    const targetEnemy = s.targetEnemy || s.findUnassignedEnemy();
    
    if (targetEnemy) {
      s.updateAnimation(targetEnemy.x, targetEnemy.y);
      
      // Magos se aproximam mas mantêm distância
      if (s.type === 'mage') {
        const dx = targetEnemy.x - s.x;
        const dy = targetEnemy.y - s.y;
        const d = Math.hypot(dx, dy);
        
        if (d > 100) { // Magos atacam de longe (3x mais que ataque normal)
          moveIntelligently(s, targetEnemy.x, targetEnemy.y);
        } else if (d < 80) {
          // Recuar um pouco se muito perto
          const retreatX = s.x - dx/d * s.speed * 0.5;
          const retreatY = s.y - dy/d * s.speed * 0.5;
          if (canMove(retreatX, retreatY, s.size)) {
            s.x = retreatX;
            s.y = retreatY;
          }
        }
        
        if (d < 120 && s.attackCooldown <= 0) {
          s.attack(targetEnemy);
        }
      } else {
        // Soldados de ataque se aproximam normalmente
        moveIntelligently(s, targetEnemy.x, targetEnemy.y);
        
        const dx = targetEnemy.x - s.x;
        const dy = targetEnemy.y - s.y;
        const d = Math.hypot(dx, dy);
        if (d < 25 && s.attackCooldown <= 0) {
          s.attack(targetEnemy);
        }
      }
    } else {
      s.updateAnimation(player.x, player.y);
      const dx = player.x - s.x;
      const dy = player.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      
      if (d > 50) {
        moveIntelligently(s, player.x, player.y);
      } else {
        s.moving = false;
      }
    }
    
    if (s.attackCooldown > 0) s.attackCooldown--;
    if (s.hitCooldown > 0) s.hitCooldown--;
  });
  
  // Atualizar tiros
  bullets.forEach((b, bi) => {
    b.x += b.vx;
    b.y += b.vy;
    
    if (b.x < 0 || b.x > worldW || b.y < 0 || b.y > worldH) {
      bullets.splice(bi, 1);
      return;
    }
    
    enemies.forEach((e, ei) => {
      if(e.life > 0 && b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size){
        const wasAlive = e.life > 0;
        e.life -= BULLET_DAMAGE;
        
        if(wasAlive && e.life <= 0){
          enemiesKilled++;
          e.wasAlive = false;
          console.log(`Inimigo morto! Total: ${enemiesKilled}`);
          dropLoot(e.x, e.y);
        }
        
        bullets.splice(bi, 1);
      }
    });
  });
  
  // Atualizar projéteis mágicos
  updateMagicProjectiles();
  
  if(player.hitCooldown > 0) player.hitCooldown--;
  
  // Verificar uso automático de erva
  checkAutoHerbUse();
  
  // Coleta automática de itens
  checkAutoCollection();
  
  // Atualizar espada
  updateSword();
  
  camera.x = player.x - canvas.width/2 + player.size/2;
  camera.y = player.y - canvas.height/2 + player.size/2;
  camera.x = Math.max(0, Math.min(camera.x, worldW - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, worldH - canvas.height));
  
  draw();
  requestAnimationFrame(update);
}

function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      ctx.fillStyle = map[y][x] === 1 ? "#555" : "#222";
      ctx.fillRect(x * TILE - camera.x, y * TILE - camera.y, TILE, TILE);
    }
  }
  
  // Desenhar itens no chão
  lootItems.forEach(item => {
    if (item.collected) return;
    
    const drawX = item.x - camera.x - item.size/2;
    const drawY = item.y - camera.y - item.size/2;
    
    if (item.sprite.complete && item.sprite.naturalHeight !== 0) {
      ctx.drawImage(item.sprite, drawX, drawY, item.size, item.size);
    } else {
      if (item.type === 'herb') {
        ctx.fillStyle = '#4CAF50';
      } else if (item.type === 'bullets') {
        ctx.fillStyle = '#2196F3';
      } else if (item.type === 'attackSoul') {
        ctx.fillStyle = '#4CAF50';
      } else if (item.type === 'mageSoul') {
        ctx.fillStyle = '#9C27B0';
      }
      ctx.fillRect(drawX, drawY, item.size, item.size);
      
      if (item.type === 'bullets') {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.quantity, drawX + item.size/2, drawY + item.size/2 + 3);
      }
    }
    
    if (item.type === 'herb') {
      ctx.strokeStyle = '#4CAF50';
    } else if (item.type === 'bullets') {
      ctx.strokeStyle = '#2196F3';
    } else if (item.type === 'attackSoul') {
      ctx.strokeStyle = '#4CAF50';
    } else if (item.type === 'mageSoul') {
      ctx.strokeStyle = '#9C27B0';
      ctx.shadowColor = '#9C27B0';
      ctx.shadowBlur = 10;
    }
    
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX - 2, drawY - 2, item.size + 4, item.size + 4);
    ctx.shadowBlur = 0;
  });
  
  // Desenhar soldados
  soldiers.forEach(s => {
    if (s.life <= 0) return;
    
    if(soldierImageLoaded){
      const sx = Math.floor(s.currentFrame * s.frameWidth);
      const sy = Math.floor(s.getAnimationRow() * s.frameHeight);
      const drawX = s.x - camera.x - (s.drawWidth - s.size)/2;
      const drawY = s.y - camera.y - (s.drawHeight - s.size)/2;
      
      ctx.drawImage(
        soldierSprite,
        sx, sy, s.frameWidth, s.frameHeight,
        drawX, drawY, s.drawWidth, s.drawHeight
      );
    } else {
      ctx.fillStyle = s.type === 'mage' ? "purple" : "blue";
      ctx.fillRect(s.x - camera.x, s.y - camera.y, s.size, s.size);
    }
    
    // Barra de vida (vermelha para magos)
    ctx.fillStyle = "black";
    ctx.fillRect(s.x - camera.x, s.y - camera.y - 8, s.size, 4);
    ctx.fillStyle = s.type === 'mage' ? "red" : "cyan";
    ctx.fillRect(s.x - camera.x, s.y - camera.y - 8, (s.life/s.maxLife) * s.size, 4);
  });
  
  // Desenhar projéteis mágicos
  ctx.fillStyle = "purple";
  ctx.strokeStyle = "white";
  magicProjectiles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Efeito brilhante
    ctx.shadowColor = 'purple';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y - camera.y, p.radius/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  
  /* DESENHAR RASTRO DA ESPADA */
  if (sword.active && sword.trail.length > 1) {
    // Desenhar linha conectando as partículas do rastro
    for (let i = 0; i < sword.trail.length - 1; i++) {
      const current = sword.trail[i];
      const next = sword.trail[i + 1];
      
      const alpha = current.life / current.maxLife * 0.5;
      const color = current.color || 'rgba(100, 150, 255, 0.5)';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(current.x - camera.x, current.y - camera.y);
      ctx.lineTo(next.x - camera.x, next.y - camera.y);
      ctx.stroke();
    }
    
    // Desenhar partículas do rastro
    sword.trail.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const color = particle.color || 'rgba(100, 150, 255, 0.5)';
      
      // Partícula central
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Brilho externo
      ctx.shadowColor = sword.attackMode === 'pursuit' ? 'cyan' : 'rgba(100, 150, 255, 0.7)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
  
  /* DESENHAR ESPADA */
  const drawSwordX = sword.x - camera.x;
  const drawSwordY = sword.y - camera.y;
  
  // Brilho quando ativa
  if (sword.active) {
    ctx.shadowColor = sword.attackMode === 'pursuit' ? 'cyan' : 'blue';
    ctx.shadowBlur = sword.attackMode === 'pursuit' ? 20 : 15;
  }
  
  // Desenhar sprite ou fallback
  if (swordSprite.complete) {
    ctx.save();
    ctx.translate(drawSwordX, drawSwordY);
    ctx.rotate(sword.angle + Math.PI / 4); // Rotação de 45° para alinhar
    ctx.drawImage(swordSprite, -sword.size/2, -sword.size/2, sword.size, sword.size);
    ctx.restore();
  } else {
    // Fallback visual
    ctx.fillStyle = sword.active ? 
      (sword.attackMode === 'pursuit' ? 'cyan' : 'blue') : 
      'gray';
    
    ctx.beginPath();
    ctx.arc(drawSwordX, drawSwordY, sword.size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar cruz da espada
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drawSwordX - sword.size/3, drawSwordY);
    ctx.lineTo(drawSwordX + sword.size/3, drawSwordY);
    ctx.moveTo(drawSwordX, drawSwordY - sword.size/3);
    ctx.lineTo(drawSwordX, drawSwordY + sword.size/3);
    ctx.stroke();
    
    // Indicador de perseguição
    if (sword.attackMode === 'pursuit' && sword.targetEnemy) {
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(drawSwordX, drawSwordY);
      ctx.lineTo(sword.targetEnemy.x - camera.x, sword.targetEnemy.y - camera.y);
      ctx.stroke();
    }
  }
  
  ctx.shadowBlur = 0; // Resetar brilho
  
  if(playerImageLoaded){
    const sx = player.currentFrame * player.frameWidth;
    const sy = player.getAnimationRow() * player.frameHeight;
    const drawX = player.x - camera.x - (player.drawWidth - player.size)/2;
    const drawY = player.y - camera.y - (player.drawHeight - player.size)/2;
    
    ctx.drawImage(
      playerSprite,
      sx, sy, player.frameWidth, player.frameHeight,
      drawX, drawY, player.drawWidth, player.drawHeight
    );
  } else {
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.size, player.size);
  }
  
  enemies.forEach(e => {
    if(e.life <= 0) return;
    
    if(enemyImageLoaded){
      const sx = e.currentFrame * e.frameWidth;
      const sy = e.getAnimationRow() * e.frameHeight;
      const drawX = e.x - camera.x - (e.drawWidth - e.size)/2;
      const drawY = e.y - camera.y - (e.drawHeight - e.size)/2;
      
      ctx.drawImage(
        enemySprite,
        sx, sy, e.frameWidth, e.frameHeight,
        drawX, drawY, e.drawWidth, e.drawHeight
      );
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(e.x - camera.x, e.y - camera.y, e.size, e.size);
    }
    
    ctx.fillStyle = "black";
    ctx.fillRect(e.x - camera.x, e.y - camera.y - 8, e.size, 4);
    ctx.fillStyle = "green";
    ctx.fillRect(e.x - camera.x, e.y - camera.y - 8, (e.life/e.maxLife) * e.size, 4);
  });
  
  ctx.fillStyle = "yellow";
  ctx.strokeStyle = "orange";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x - camera.x, b.y - camera.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // Desenhar minimapa
  drawMinimap();
  
  updateGameUI();
}

/* INICIALIZAR POSIÇÃO DA ESPADA */
sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;

// Iniciar o jogo
update();
updateSummonButton();
