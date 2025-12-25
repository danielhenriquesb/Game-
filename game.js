const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TILE = 32;

// ========== DANO 10x MAIS FORTE ==========
const BULLET_DAMAGE = 500; // Era 50, agora 500 (10x mais forte)
const ENEMY_DAMAGE = 15;
const SOLDIER_DAMAGE = 36;
const MAGE_DAMAGE = 2000; // Era 200, agora 2000 (10x mais forte)
let gameRunning = true;

// Limitação de soldados
const MAX_SOLDIERS = 10;

// ========== CONFIGURAÇÕES DE SPAWN ==========
let enemySpawnEnabled = true;
let npcSpawnEnabled = false;
let npcs = [];
const MAX_NPCS = 10;
const NPC_SPAWN_COUNT = 10;
const NPC_SPAWN_INTERVAL = 10000;
let npcSpawnTimer = 0;
const NPC_POWER_CHANCE = 0.25;
const NPC_HEAL_THRESHOLD = 0.3; // 30% de vida para buscar cura

// ========== BOSS ==========
let boss = null;
let bossFireballs = [];
const BOSS_SPAWN_HEALTH = 5000;
const BOSS_FIREBALL_DAMAGE = 30;
const BOSS_FIREBALL_SPEED = 4;

// ========== SISTEMA DE LOG ==========
let gameLog = [];
const MAX_LOG_ENTRIES = 15;

// ========== MAPA ==========
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

// ========== CARREGAR IMAGENS ==========
const iceSprite = new Image();
iceSprite.src = 'iceslayer.png';
const swordSprite = new Image();
swordSprite.src = 'sword.png';
const npcSprite = new Image();
npcSprite.src = 'iceslayer.png';
const enemySprite = new Image();
enemySprite.src = 'redelfo.png';
const bossSprite = new Image();
bossSprite.src = 'boss.png';

let iceImageLoaded = false;
let enemyImageLoaded = false;
let bossImageLoaded = false;

iceSprite.onload = () => iceImageLoaded = true;
enemySprite.onload = () => enemyImageLoaded = true;
bossSprite.onload = () => bossImageLoaded = true;
swordSprite.onload = () => console.log("Sword sprite carregado");

// ========== FUNÇÕES BÁSICAS ==========
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

function isWall(px, py){
  const tx = Math.floor(px/TILE);
  const ty = Math.floor(py/TILE);
  if(ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return true;
  return map[ty][tx] === 1;
}

function canMove(x, y, s){
  return !isWall(x, y) && !isWall(x + s, y) && !isWall(x, y + s) && !isWall(x + s, y + s);
}

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
  
  if (Math.abs(dx) > Math.abs(dy)) {
    entity.lastDirection = dx > 0 ? 'right' : 'left';
  } else {
    entity.lastDirection = dy > 0 ? 'down' : 'up';
  }
  
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

// ========== SISTEMA DE LOG ==========
function addLog(message) {
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  gameLog.unshift(`[${time}] ${message}`);
  if (gameLog.length > MAX_LOG_ENTRIES) gameLog.pop();
  
  // Atualizar UI se existir
  const logElement = document.getElementById('gameLog');
  if (logElement) {
    logElement.innerHTML = gameLog.map(entry => `<div>${entry}</div>`).join('');
  }
}

// ========== SISTEMA DE LOOT ==========
let lootItems = [];
let inventory = {
  herbs: 0,
  bullets: 100,
  attackSouls: 10,
  mageSouls: 5
};

const herbSprite = new Image();
herbSprite.src = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
const bulletSprite = new Image();
bulletSprite.src = 'https://cdn-icons-png.flaticon.com/512/2303/2303971.png';
const soulSprite = new Image();
soulSprite.src = 'https://cdn-icons-png.flaticon.com/512/2737/2737417.png';

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
      const soulRand = Math.random();
      if (soulRand < 0.5) {
        lootItems.push({
          x: enemyX,
          y: enemyY,
          type: 'attackSoul',
          collected: false,
          sprite: soulSprite,
          size: 20
        });
      } else if (soulRand < 0.7) {
        lootItems.push({
          x: enemyX,
          y: enemyY,
          type: 'mageSoul',
          collected: false,
          sprite: soulSprite,
          size: 20
        });
      }
    }
  }
}

// ========== ANIMAÇÕES ==========
class AnimationManager {
  constructor() {
    this.spriteWidth = 182;
    this.spriteHeight = 1280;
    this.cols = 4;
    this.rows = 24;
    this.frameWidth = this.spriteWidth / this.cols;
    this.frameHeight = this.spriteHeight / this.rows;
    
    this.animations = {
      idle_down: { startRow: 0, endRow: 1, startCol: 0, endCol: 3, frames: 8, speed: 10 },
      idle_up: { startRow: 2, endRow: 2, startCol: 0, endCol: 3, frames: 4, speed: 10 },
      walk_right: { startRow: 3, endRow: 5, startCol: 0, endCol: 1, frames: 6, speed: 8 },
      walk_left: { startRow: 5, endRow: 7, startCol: 2, endCol: 3, frames: 6, speed: 8 },
      walk_down: { startRow: 8, endRow: 10, startCol: 0, endCol: 1, frames: 6, speed: 8 },
      walk_up: { startRow: 10, endRow: 12, startCol: 2, endCol: 3, frames: 6, speed: 8 },
      attack_left: { startRow: 13, endRow: 15, startCol: 0, endCol: 2, frames: 9, speed: 5 },
      attack_right: { startRow: 15, endRow: 17, startCol: 3, endCol: 1, frames: 9, speed: 5 },
      attack_down: { startRow: 18, endRow: 20, startCol: 2, endCol: 0, frames: 9, speed: 5 },
      attack_up: { startRow: 21, endRow: 23, startCol: 1, endCol: 3, frames: 9, speed: 5 }
    };
  }
  
  getAnimationState(entity) {
    if (entity.isAttacking) {
      return `attack_${entity.lastDirection}`;
    } else if (entity.moving) {
      return `walk_${entity.lastDirection}`;
    } else {
      return entity.lastDirection === 'up' ? 'idle_up' : 'idle_down';
    }
  }
  
  updateAnimation(entity) {
    const animState = this.getAnimationState(entity);
    const anim = this.animations[animState];
    
    if (!anim || !anim.frames) return;
    
    entity.animationTimer = (entity.animationTimer || 0) + 1;
    
    if (entity.animationTimer >= anim.speed) {
      entity.currentFrame = (entity.currentFrame || 0) + 1;
      
      if (entity.isAttacking && entity.currentFrame >= anim.frames) {
        entity.isAttacking = false;
        entity.currentFrame = 0;
      }
      
      if (entity.currentFrame >= anim.frames) {
        entity.currentFrame = 0;
      }
      
      entity.animationTimer = 0;
    }
  }
  
  getSpriteCoordinates(entity) {
    const animState = this.getAnimationState(entity);
    const anim = this.animations[animState];
    
    if (!anim) return { sx: 0, sy: 0 };
    
    const frame = entity.currentFrame || 0;
    const totalCols = Math.abs(anim.endCol - anim.startCol) + 1;
    
    const rowOffset = Math.floor(frame / totalCols);
    const colOffset = frame % totalCols;
    
    const row = anim.startRow + Math.min(rowOffset, anim.endRow - anim.startRow);
    let col;
    
    if (anim.startCol <= anim.endCol) {
      col = anim.startCol + colOffset;
    } else {
      col = anim.startCol - colOffset;
    }
    
    return {
      sx: col * this.frameWidth,
      sy: row * this.frameHeight,
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight
    };
  }
}

class EnemyAnimationManager extends AnimationManager {
  constructor() {
    super();
  }
}

const animationManager = new AnimationManager();
const enemyAnimationManager = new EnemyAnimationManager();

// ========== SISTEMA DE SPAWN DE INIMIGOS ==========
const MAX_ENEMIES = 200;
const ENEMY_SPAWN_COUNT = 50;
const ENEMY_SPAWN_INTERVAL = 10000;
let enemySpawnTimer = 0;
let enemiesKilled = 0;

function spawnEnemies(count) {
  const currentEnemies = enemies.filter(e => e.life > 0).length;
  const availableSlots = MAX_ENEMIES - currentEnemies;
  
  if (availableSlots <= 0) return;
  
  const spawnCount = Math.min(count, availableSlots);
  
  for (let i = 0; i < spawnCount; i++) {
    const pos = getRandomFreePosition(30);
    enemies.push({
      x: pos.x,
      y: pos.y,
      size: 30,
      drawWidth: 136,
      drawHeight: 160,
      speed: 0.5,
      life: 100,
      maxLife: 100,
      stuckTimer: 0,
      attackCooldown: 0,
      wasAlive: true,
      targetedBy: null,
      lastDirection: 'down',
      moving: true,
      isAttacking: false,
      currentFrame: 0,
      animationTimer: 0,
      attackAnimationTimer: 0,
      
      findNearestTarget: function() {
        if (boss) return boss;
        
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
        
        npcs.forEach(n => {
          if (n.life <= 0) return;
          const d = Math.hypot(n.x - this.x, n.y - this.y);
          if (d < minDist) {
            minDist = d;
            nearest = n;
          }
        });
        
        return nearest;
      }
    });
  }
}

// ========== PLAYER ==========
const playerSpawn = getRandomFreePosition(30);
const player = {
  x: playerSpawn.x,
  y: playerSpawn.y,
  size: 30,
  drawWidth: 136,
  drawHeight: 160,
  speed: 2.5,
  vx: 0,
  vy: 0,
  dirX: 0,
  dirY: 1,
  life: 100,
  maxLife: 100,
  hitCooldown: 0,
  lastDirection: 'down',
  moving: false,
  isAttacking: false,
  currentFrame: 0,
  animationTimer: 0,
  attackCooldown: 0,
  
  updateDirection: function() {
    if (this.vx === 0 && this.vy === 0) {
      this.moving = false;
      return;
    }
    
    this.moving = true;
    
    if (Math.abs(this.vx) > Math.abs(this.vy)) {
      this.lastDirection = this.vx > 0 ? 'right' : 'left';
    } else {
      this.lastDirection = this.vy > 0 ? 'down' : 'up';
    }
  }
};

// ========== INIMIGOS ==========
let enemies = [];

for(let i = 0; i < 5; i++){
  const pos = getRandomFreePosition(30);
  enemies.push({
    x: pos.x,
    y: pos.y,
    size: 30,
    drawWidth: 136,
    drawHeight: 160,
    speed: 0.5,
    life: 100,
    maxLife: 100,
    stuckTimer: 0,
    attackCooldown: 0,
    wasAlive: true,
    targetedBy: null,
    lastDirection: 'down',
    moving: true,
    isAttacking: false,
    currentFrame: 0,
    animationTimer: 0,
    attackAnimationTimer: 0,
    
    findNearestTarget: function() {
      if (boss) return boss;
      
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
      
      npcs.forEach(n => {
        if (n.life <= 0) return;
        const d = Math.hypot(n.x - this.x, n.y - this.y);
        if (d < minDist) {
          minDist = d;
          nearest = n;
        }
      });
      
      return nearest;
    }
  });
}

// ========== SOLDADOS ==========
let soldiers = [];
let soldierIdCounter = 0;
let soldiersSummoned = false;
let magicProjectiles = [];
let npcMagicProjectiles = [];

function createAttackSoldier(spawnX, spawnY) {
  soldierIdCounter++;
  const soldierId = soldierIdCounter;
  
  return {
    x: spawnX,
    y: spawnY,
    size: 30,
    drawWidth: 136,
    drawHeight: 160,
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
    lastDirection: 'down',
    moving: false,
    isAttacking: false,
    currentFrame: 0,
    animationTimer: 0,
    
    // NOVO: Propriedades para coleta inteligente
    isCollecting: false,
    targetItem: null,
    collectionCooldown: 0,
    
    findUnassignedEnemy: function() {
      if (boss) {
        const dx = boss.x - this.x;
        const dy = boss.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 300) return boss;
      }
      
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
            if (s !== this && s.targetEnemy === e) soldiersOnThisEnemy++;
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
        if (bestEnemy !== boss) bestEnemy.targetedBy = this.id;
      }
      
      return bestEnemy;
    },
    
    attack: function(enemy) {
      if (this.attackCooldown <= 0) {
        this.isAttacking = true;
        this.attackCooldown = 40;
        enemy.life -= SOLDIER_DAMAGE;
        
        if (enemy.life <= 0 && enemy.wasAlive && enemy !== boss) {
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
}

function createMageSoldier(spawnX, spawnY) {
  soldierIdCounter++;
  const soldierId = soldierIdCounter;
  
  return {
    x: spawnX,
    y: spawnY,
    size: 30,
    drawWidth: 136,
    drawHeight: 160,
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
    lastDirection: 'down',
    moving: false,
    isAttacking: false,
    currentFrame: 0,
    animationTimer: 0,
    
    // NOVO: Propriedades para coleta inteligente
    isCollecting: false,
    targetItem: null,
    collectionCooldown: 0,
    
    findUnassignedEnemy: function() {
      if (boss) {
        const dx = boss.x - this.x;
        const dy = boss.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 400) return boss;
      }
      
      let bestEnemy = null;
      let minDist = Infinity;
      let minSoldiersOnSameEnemy = Infinity;
      
      enemies.forEach(e => {
        if(e.life <= 0) return;
        
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 400) {
          let soldiersOnThisEnemy = 0;
          soldiers.forEach(s => {
            if (s !== this && s.targetEnemy === e) soldiersOnThisEnemy++;
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
        if (bestEnemy !== boss) bestEnemy.targetedBy = this.id;
      }
      
      return bestEnemy;
    },
    
    attack: function(enemy) {
      if (this.attackCooldown <= 0) {
        this.isAttacking = true;
        this.attackCooldown = 60;
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
}

// ========== TIROS ==========
const bullets = [];

// ========== ESPADA GIRATÓRIA (10x MAIS FORTE) ==========
let sword = {
  active: false,
  radius: 50,
  angle: 0,
  rotationSpeed: 0.05,
  size: 25,
  damage: 100000, // ERA 10000, AGORA 100000 (10x MAIS FORTE)
  x: 0,
  y: 0,
  speed: 6,
  targetEnemy: null,
  trail: [],
  trailParticles: 15,
  hitCooldown: 0,
  returnDelay: 0,
  detectionRadius: 500,
  orbitRadius: 50,
  orbitSpeed: 0.08,
  isReturning: false,
  returnSpeed: 8,
  attackMode: 'orbit',
  
  updateAnimation: function() {
    this.angle += this.rotationSpeed;
  },
  
  findNearestEnemy: function() {
    if (boss) {
      const dx = boss.x - this.x;
      const dy = boss.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < this.detectionRadius) return boss;
    }
    
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
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }
};

// ========== NPCs INTELIGENTES ==========
function spawnNPCs(count) {
  const currentNPCs = npcs.filter(n => n.life > 0).length;
  const availableSlots = MAX_NPCS - currentNPCs;
  
  if (availableSlots <= 0) return;
  
  const spawnCount = Math.min(count, availableSlots);
  
  for (let i = 0; i < spawnCount; i++) {
    const pos = getRandomFreePosition(30);
    const hasPower = Math.random() < NPC_POWER_CHANCE;
    
    npcs.push({
      x: pos.x,
      y: pos.y,
      size: 30,
      drawWidth: 136,
      drawHeight: 160,
      speed: hasPower ? 0.8 : 1.2,
      life: 100,
      maxLife: 100,
      hasPower: hasPower,
      targetEnemy: null,
      attackCooldown: 0,
      fleeCooldown: 0,
      stuckTimer: 0,
      lastDirection: 'down',
      moving: false,
      isAttacking: false,
      currentFrame: 0,
      animationTimer: 0,
      magicCooldown: 0,
      
      // NOVO: Inteligência para busca de cura
      seekingHerb: false,
      targetHerb: null,
      healCooldown: 0,
      
      findNearestEnemy: function() {
        if (boss) {
          const dx = boss.x - this.x;
          const dy = boss.y - this.y;
          const d = Math.hypot(dx, dy);
          if (d < 300) return boss;
        }
        
        let nearest = null;
        let minDist = Infinity;
        
        enemies.forEach(e => {
          if (e.life <= 0) return;
          const dx = e.x - this.x;
          const dy = e.y - this.y;
          const d = Math.hypot(dx, dy);
          if (d < minDist && d < 300) {
            minDist = d;
            nearest = e;
          }
        });
        
        return nearest;
      },
      
      magicAttack: function(enemy) {
        if (this.magicCooldown <= 0 && enemy) {
          this.isAttacking = true;
          this.magicCooldown = 90;
          
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          const distance = Math.hypot(dx, dy) || 1;
          
          npcMagicProjectiles.push({
            x: this.x + this.size/2,
            y: this.y + this.size/2,
            targetX: enemy.x,
            targetY: enemy.y,
            vx: (dx / distance) * 3,
            vy: (dy / distance) * 3,
            radius: 8,
            damage: 100,
            owner: 'npc'
          });
        }
      },
      
      // NOVO: Encontrar erva mais próxima
      findNearestHerb: function() {
        let nearest = null;
        let minDist = Infinity;
        
        for (let i = 0; i < lootItems.length; i++) {
          const item = lootItems[i];
          if (item.type === 'herb' && !item.collected) {
            const dx = item.x - this.x;
            const dy = item.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < minDist) {
              minDist = d;
              nearest = { item, index: i, distance: d };
            }
          }
        }
        
        return nearest;
      }
    });
  }
}

// ========== FUNÇÕES DE COLETA INTELIGENTE ==========
function findNearestItem(entity, excludedItems = []) {
  let nearest = null;
  let minDist = Infinity;
  
  for (let i = 0; i < lootItems.length; i++) {
    const item = lootItems[i];
    if (item.collected || excludedItems.includes(i)) continue;
    
    const dx = item.x - entity.x;
    const dy = item.y - entity.y;
    const d = Math.hypot(dx, dy);
    
    if (d < minDist) {
      minDist = d;
      nearest = { item, index: i, distance: d };
    }
  }
  
  return nearest;
}

function areEnemiesAlive() {
  if (boss && boss.life > 0) return true;
  
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].life > 0) return true;
  }
  
  return false;
}

function collectItemByEntity(item, index, collectorName = 'Ally') {
  if (!lootItems[index] || lootItems[index].collected) return;
  
  const collectedItem = lootItems[index];
  
  // Coletar item
  if (collectedItem.type === 'herb') {
    inventory.herbs++;
    addLog(`${collectorName} coletou erva!`);
  } else if (collectedItem.type === 'bullets') {
    inventory.bullets += collectedItem.quantity || 1;
    addLog(`${collectorName} coletou ${collectedItem.quantity || 1} balas!`);
  } else if (collectedItem.type === 'attackSoul') {
    inventory.attackSouls++;
    addLog(`${collectorName} coletou alma de guerreiro!`);
  } else if (collectedItem.type === 'mageSoul') {
    inventory.mageSouls++;
    addLog(`${collectorName} coletou alma de mago!`);
  }
  
  // Remover do chão
  collectedItem.collected = true;
  lootItems.splice(index, 1);
  
  // Atualizar UI
  updateGameUI();
  updateInventoryUI();
  updateSummonButton();
}

// ========== CONTROLES ==========
document.getElementById("toggleEnemySpawn").addEventListener("pointerdown", toggleEnemySpawn);
document.getElementById("toggleNPCSpawn").addEventListener("pointerdown", toggleNPCSpawn);
document.getElementById("bossSpawn").addEventListener("pointerdown", toggleBoss);
document.getElementById("sword").addEventListener("pointerdown", toggleSword);
document.getElementById("summon").addEventListener("pointerdown", toggleMassSummon);
document.getElementById("attack").addEventListener("pointerdown", shoot);
document.addEventListener("keydown", e => {
  if(e.code === "Space") shoot();
});

function toggleEnemySpawn() {
  enemySpawnEnabled = !enemySpawnEnabled;
  const btn = document.getElementById('toggleEnemySpawn');
  if (enemySpawnEnabled) {
    btn.classList.add('active');
    btn.title = "Spawn de Inimigos: ATIVADO";
    addLog("Spawn de inimigos ATIVADO");
  } else {
    btn.classList.remove('active');
    btn.title = "Spawn de Inimigos: DESATIVADO";
    addLog("Spawn de inimigos DESATIVADO");
  }
}

function toggleNPCSpawn() {
  npcSpawnEnabled = !npcSpawnEnabled;
  const btn = document.getElementById('toggleNPCSpawn');
  if (npcSpawnEnabled) {
    btn.classList.add('active');
    btn.title = "Spawn de NPCs: ATIVADO";
    spawnNPCs(NPC_SPAWN_COUNT);
    addLog("Spawn de NPCs ATIVADO");
  } else {
    btn.classList.remove('active');
    btn.title = "Spawn de NPCs: DESATIVADO";
    addLog("Spawn de NPCs DESATIVADO");
  }
}

function toggleBoss() {
  if (!boss) {
    spawnBoss();
    addLog("BOSS spawnado!");
  } else {
    boss = null;
    bossFireballs = [];
    document.getElementById('bossSpawn').classList.remove('active');
    document.getElementById('bossSpawn').title = 'BOSS: MORTO (Clique para spawnar)';
    document.getElementById('bossStatus').textContent = 'MORTO';
    document.getElementById('bossStatus').style.color = '#ff0000';
    addLog("BOSS eliminado!");
  }
}

function spawnBoss() {
  if (boss) return;
  
  const pos = getRandomFreePosition(60);
  boss = {
    x: pos.x,
    y: pos.y,
    size: 60,
    drawWidth: 182,
    drawHeight: 160,
    speed: 1,
    life: BOSS_SPAWN_HEALTH,
    maxLife: BOSS_SPAWN_HEALTH,
    attackCooldown: 0,
    attackInterval: 90,
    lastDirection: 'down',
    moving: true,
    isAttacking: false,
    currentFrame: 0,
    animationTimer: 0,
    attackAnimationTimer: 0,
    
    fireAttack: function() {
      if (this.attackCooldown <= 0) {
        this.isAttacking = true;
        this.attackAnimationTimer = 15;
        
        for (let i = 0; i < 3; i++) {
          const angle = Math.atan2(player.y - this.y, player.x - this.x) + (i - 1) * 0.3;
          
          bossFireballs.push({
            x: this.x + this.size/2,
            y: this.y + this.size/2,
            vx: Math.cos(angle) * BOSS_FIREBALL_SPEED,
            vy: Math.sin(angle) * BOSS_FIREBALL_SPEED,
            radius: 15,
            damage: BOSS_FIREBALL_DAMAGE,
            life: 120
          });
        }
        this.attackCooldown = this.attackInterval;
      }
    },
    
    findTarget: function() {
      return player;
    }
  };
  
  document.getElementById('bossSpawn').classList.add('active');
  document.getElementById('bossSpawn').title = 'BOSS: VIVO';
  document.getElementById('bossStatus').textContent = 'VIVO';
  document.getElementById('bossStatus').style.color = '#00ff00';
}

function toggleSword() {
  sword.active = !sword.active;
  const swordBtn = document.getElementById('sword');
  
  if (sword.active) {
    swordBtn.classList.add('active-mode');
    swordBtn.title = "Espada: ATIVA (Perseguindo inimigos)";
    sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
    sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    sword.targetEnemy = sword.findNearestEnemy();
    sword.attackMode = sword.targetEnemy ? 'pursuit' : 'orbit';
    addLog("Espada giratória ATIVADA");
  } else {
    swordBtn.classList.remove('active-mode');
    swordBtn.title = "Espada: DESATIVADA (Clique para ativar)";
    sword.targetEnemy = null;
    sword.isReturning = false;
    sword.attackMode = 'orbit';
    addLog("Espada giratória DESATIVADA");
  }
}

// ========== JOYSTICK ==========
const joystick = document.getElementById("joystick");
const thumb = document.getElementById("thumb");

let dragging = false;
let joystickCenter = { x: 0, y: 0 };
let joystickMaxDistance = 40;

function getPos(e) {
  return e.touches ? e.touches[0] : e;
}

joystick.addEventListener("touchstart", startJoystick);
joystick.addEventListener("mousedown", startJoystick);

function startJoystick(e) {
  dragging = true;
  const rect = joystick.getBoundingClientRect();
  joystickCenter.x = rect.left + rect.width / 2;
  joystickCenter.y = rect.top + rect.height / 2;
  moveJoystick(e);
}

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

window.addEventListener("touchend", endJoystick);
window.addEventListener("mouseup", endJoystick);

function endJoystick() {
  dragging = false;
  thumb.style.transform = "translate(-50%, -50%)";
  player.vx = 0;
  player.vy = 0;
}

// ========== ATAQUE DO PLAYER (10x MAIS FORTE) ==========
function getNearestEnemy(){
  if (boss) {
    const dx = boss.x - player.x;
    const dy = boss.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < 500) return boss;
  }
  
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
    addLog("Sem balas no inventário!");
    return;
  }
  
  inventory.bullets--;
  updateGameUI();
  
  // Ativar animação de ataque
  player.isAttacking = true;
  player.attackCooldown = 15;
  player.currentFrame = 0;
  player.animationTimer = 0;
  
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
  
  addLog(`Player atirou! Dano: ${BULLET_DAMAGE}`);
}

// ========== ATUALIZAÇÃO DA ESPADA ==========
function updateSword() {
  if (!sword.active) {
    sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
    sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    sword.angle += sword.orbitSpeed;
    sword.trail = [];
    sword.targetEnemy = null;
    return;
  }
  
  sword.updateAnimation();
  
  if (sword.isReturning) {
    const dx = player.x - sword.x;
    const dy = player.y - sword.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < sword.orbitRadius) {
      sword.isReturning = false;
      sword.attackMode = 'orbit';
      sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
      sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;
    } else {
      sword.x += (dx / distance) * sword.returnSpeed;
      sword.y += (dy / distance) * sword.returnSpeed;
    }
    
    addSwordTrail();
    return;
  }
  
  if (!sword.targetEnemy || (sword.targetEnemy.life <= 0 && sword.targetEnemy !== boss)) {
    sword.targetEnemy = sword.findNearestEnemy();
    
    if (!sword.targetEnemy) {
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
  
  if (sword.targetEnemy && (sword.targetEnemy.life > 0 || sword.targetEnemy === boss)) {
    const dx = sword.targetEnemy.x - sword.x;
    const dy = sword.targetEnemy.y - sword.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 10) {
      const wasAlive = sword.targetEnemy.life > 0;
      sword.targetEnemy.life -= sword.damage;
      
      if (wasAlive && sword.targetEnemy.life <= 0 && sword.targetEnemy !== boss) {
        enemiesKilled++;
        sword.targetEnemy.wasAlive = false;
        dropLoot(sword.targetEnemy.x, sword.targetEnemy.y);
        addLog(`Espada eliminou inimigo!`);
      }
      
      sword.hitCooldown = 8;
      sword.targetEnemy = sword.findNearestEnemy();
      
      if (!sword.targetEnemy) {
        sword.isReturning = true;
      }
    } else {
      sword.moveToTarget(sword.targetEnemy.x, sword.targetEnemy.y);
    }
  } else {
    sword.targetEnemy = sword.findNearestEnemy();
    if (!sword.targetEnemy) {
      sword.isReturning = true;
    }
  }
  
  addSwordTrail();
  
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
  
  if (sword.trail.length > sword.trailParticles) {
    sword.trail.pop();
  }
  
  sword.trail.forEach(particle => {
    particle.life--;
  });
  
  sword.trail = sword.trail.filter(p => p.life > 0);
}

// ========== SISTEMA DE INVOCAÇÕES EM MASSA ==========
function toggleMassSummon() {
  if (!soldiersSummoned) {
    const currentSoldiers = soldiers.length;
    if (currentSoldiers >= MAX_SOLDIERS) {
      addLog(`Limite máximo de ${MAX_SOLDIERS} soldados atingido!`);
      return;
    }
    
    const totalSouls = inventory.attackSouls + inventory.mageSouls;
    if (totalSouls <= 0) {
      addLog("Sem almas para invocar!");
      return;
    }
    
    const availableSlots = MAX_SOLDIERS - currentSoldiers;
    const mageSoulsAvailable = inventory.mageSouls;
    const magesToSummon = Math.min(3, mageSoulsAvailable, availableSlots);
    const remainingSlots = availableSlots - magesToSummon;
    const attackToSummon = Math.min(inventory.attackSouls, remainingSlots);
    const soulsToSummon = magesToSummon + attackToSummon;
    
    if (soulsToSummon <= 0) {
      addLog("Sem almas suficientes para invocar!");
      return;
    }
    
    soldiers.length = 0;
    const spawnRadius = 60;
    const angleStep = (2 * Math.PI) / soulsToSummon;
    
    let attackSummoned = 0;
    let mageSummoned = 0;
    
    // Primeiro invocar os magos (garantir 3)
    for (let i = 0; i < magesToSummon; i++) {
      const angle = i * angleStep;
      let spawnX = player.x + Math.cos(angle) * spawnRadius;
      let spawnY = player.y + Math.sin(angle) * spawnRadius;
      
      for (let attempts = 0; attempts < 8; attempts++) {
        const testAngle = angle + (attempts * Math.PI / 4);
        const testX = player.x + Math.cos(testAngle) * spawnRadius;
        const testY = player.y + Math.sin(testAngle) * spawnRadius;
        
        if (canMove(testX, testY, 30)) {
          spawnX = testX;
          spawnY = testY;
          break;
        }
      }
      
      const mage = createMageSoldier(spawnX, spawnY);
      soldiers.push(mage);
      mageSummoned++;
    }
    
    // Depois invocar os soldados de ataque
    for (let i = 0; i < attackToSummon; i++) {
      const angle = (mageSummoned + i) * angleStep;
      let spawnX = player.x + Math.cos(angle) * spawnRadius;
      let spawnY = player.y + Math.sin(angle) * spawnRadius;
      
      for (let attempts = 0; attempts < 8; attempts++) {
        const testAngle = angle + (attempts * Math.PI / 4);
        const testX = player.x + Math.cos(testAngle) * spawnRadius;
        const testY = player.y + Math.sin(testAngle) * spawnRadius;
        
        if (canMove(testX, testY, 30)) {
          spawnX = testX;
          spawnY = testY;
          break;
        }
      }
      
      const soldier = createAttackSoldier(spawnX, spawnY);
      soldiers.push(soldier);
      attackSummoned++;
    }
    
    inventory.attackSouls -= attackSummoned;
    inventory.mageSouls -= mageSummoned;
    
    soldiersSummoned = true;
    addLog(`${attackSummoned} soldados e ${mageSummoned} magos invocados!`);
    
    document.getElementById('summon').textContent = '❌';
    document.getElementById('summon').title = 'Despawnar todas as invocações';
    
  } else {
    let attackCount = 0;
    let mageCount = 0;
    
    soldiers.forEach(s => {
      if (s.type === 'attack') attackCount++;
      else if (s.type === 'mage') mageCount++;
    });
    
    inventory.attackSouls += attackCount;
    inventory.mageSouls += mageCount;
    
    soldiers.length = 0;
    magicProjectiles.length = 0;
    
    soldiersSummoned = false;
    addLog(`${attackCount} soldados e ${mageCount} magos despawnados`);
    
    document.getElementById('summon').textContent = '👥';
    document.getElementById('summon').title = 'Invocar todas as invocações';
  }
  
  updateGameUI();
  updateSummonButton();
}

// ========== ATUALIZAÇÃO DOS PROJÉTEIS ==========
function updateMagicProjectiles() {
  for (let i = magicProjectiles.length - 1; i >= 0; i--) {
    const proj = magicProjectiles[i];
    
    proj.x += proj.vx;
    proj.y += proj.vy;
    
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const distanceToTarget = Math.hypot(dx, dy);
    
    if (distanceToTarget < 20) {
      const explosionRadius = 60;
      
      if (boss && Math.hypot(boss.x - proj.x, boss.y - proj.y) < explosionRadius + boss.size/2) {
        boss.life -= proj.damage;
        addLog(`Mago acertou o BOSS!`);
      }
      
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
            addLog(`Mago eliminou inimigo!`);
          }
        }
      });
      
      magicProjectiles.splice(i, 1);
      continue;
    }
    
    if (proj.x < 0 || proj.x > worldW || proj.y < 0 || proj.y > worldH) {
      magicProjectiles.splice(i, 1);
    }
  }
}

function updateNPCMagicProjectiles() {
  for (let i = npcMagicProjectiles.length - 1; i >= 0; i--) {
    const proj = npcMagicProjectiles[i];
    
    proj.x += proj.vx;
    proj.y += proj.vy;
    
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const distanceToTarget = Math.hypot(dx, dy);
    
    if (distanceToTarget < 30) {
      const explosionRadius = 40;
      
      if (boss && Math.hypot(boss.x - proj.x, boss.y - proj.y) < explosionRadius + boss.size/2) {
        boss.life -= proj.damage;
      }
      
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
      
      npcMagicProjectiles.splice(i, 1);
      continue;
    }
    
    if (proj.x < 0 || proj.x > worldW || proj.y < 0 || proj.y > worldH) {
      npcMagicProjectiles.splice(i, 1);
    }
  }
}

// ========== FUNÇÕES DE ATUALIZAÇÃO ==========
function checkAutoHerbUse() {
  const playerNeedsHeal = player.life <= player.maxLife * 0.5;
  
  let soldierNeedsHeal = false;
  soldiers.forEach(s => {
    if (s.life <= s.maxLife * 0.5) soldierNeedsHeal = true;
  });
  
  if ((playerNeedsHeal || soldierNeedsHeal) && inventory.herbs > 0) {
    useItem('herb');
  }
}

function checkAutoCollection() {
  for (let i = lootItems.length - 1; i >= 0; i--) {
    const item = lootItems[i];
    if (item.collected) continue;
    
    const dx = item.x - player.x;
    const dy = item.y - player.y;
    const d = Math.hypot(dx, dy);
    
    if (d < 25) {
      collectItemAuto(item, i);
      break;
    }
  }
}

function collectItemAuto(item, index) {
  collectItemByEntity(item, index, 'Player');
}

function updateSummonButton() {
  const summonBtn = document.getElementById('summon');
  const totalSouls = inventory.attackSouls + inventory.mageSouls;
  
  if (totalSouls > 0 || soldiersSummoned) {
    summonBtn.disabled = false;
  } else {
    summonBtn.disabled = true;
  }
}

// ========== INVENTÁRIO ==========
function updateInventoryUI() {
  const inventoryContent = document.getElementById('inventoryContent');
  if (!inventoryContent) return;
  
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
    updateInventoryUI();
    updateGameUI();
    closeInventory();
    addLog(`Usou erva! Cura: +${healAmount}HP`);
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
    addLog("Dropou erva no chão");
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
    addLog("Dropou 10 balas no chão");
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

// ========== GAME OVER ==========
function gameOver(){
  gameRunning = false;
  setTimeout(() => {
    alert(`☠️ GAME OVER\n\n📊 Estatísticas:\n🎯 Inimigos derrotados: ${enemiesKilled}\n🌿 Ervas coletadas: ${inventory.herbs}\n🔫 Balas coletadas: ${inventory.bullets}\n👥 Soldados invocados: ${soldiers.length}\n🏃 NPCs vivos: ${npcs.filter(n => n.life > 0).length}`);
    location.reload();
  }, 100);
}

// ========== CAMERA ==========
const camera = {x: 0, y: 0};
let lastTime = 0;

// ========== INTERFACE DO JOGO ==========
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
const npcsAliveElement = document.getElementById('npcsAlive');
const spawnTimer = document.getElementById('spawnTimer');

if (statusBtn) statusBtn.addEventListener('click', function() {
  statusPanel.classList.toggle('show');
});

function updateGameUI() {
  const aliveEnemies = enemies.filter(e => e.life > 0).length;
  const aliveSoldiers = soldiers.filter(s => s.life > 0).length;
  const aliveNPCs = npcs.filter(n => n.life > 0).length;
  const timeToSpawn = Math.max(0, Math.floor((ENEMY_SPAWN_INTERVAL - enemySpawnTimer)/1000));
  const totalSouls = inventory.attackSouls + inventory.mageSouls;
  
  if (lifeValue) lifeValue.textContent = Math.max(player.life, 0);
  if (ammoValue) ammoValue.textContent = inventory.bullets;
  if (soulsValue) soulsValue.textContent = totalSouls;
  if (killedCount) killedCount.textContent = enemiesKilled;
  if (herbsCount) herbsCount.textContent = inventory.herbs;
  if (bulletsCount) bulletsCount.textContent = inventory.bullets;
  if (soldiersCount) soldiersCount.textContent = aliveSoldiers;
  if (enemiesAlive) enemiesAlive.textContent = `${aliveEnemies}/200`;
  if (npcsAliveElement) npcsAliveElement.textContent = `${aliveNPCs}/10`;
  if (spawnTimer) spawnTimer.textContent = timeToSpawn;
  
  const lifeDisplay = document.querySelector('.life-display');
  const ammoDisplay = document.querySelector('.ammo-display');
  const soulsDisplay = document.querySelector('.souls-display');
  
  if (lifeDisplay) {
    if (player.life < 30) lifeDisplay.classList.add('low');
    else lifeDisplay.classList.remove('low');
  }
  
  if (ammoDisplay) {
    if (inventory.bullets < 20) ammoDisplay.classList.add('low');
    else ammoDisplay.classList.remove('low');
  }
  
  if (soulsDisplay) {
    if (totalSouls > 0) soulsDisplay.classList.add('active');
    else soulsDisplay.classList.remove('active');
  }
  
  const swordBtn = document.getElementById('sword');
  if (swordBtn) {
    const modeText = sword.active ? 
      (sword.attackMode === 'pursuit' ? 'PERSEGUINDO INIMIGOS' : 'ÓRBITA') : 
      'DESATIVADA';
    swordBtn.title = `Espada: ${modeText}`;
  }
  
  if (boss) {
    document.getElementById('bossHealth').textContent = `${boss.life}/${boss.maxLife}`;
  } else {
    document.getElementById('bossHealth').textContent = '0/0';
  }
}

// ========== ATUALIZAÇÃO DO BOSS ==========
function updateBoss() {
  if (!boss) return;
  
  const target = boss.findTarget();
  const moved = moveIntelligently(boss, target.x, target.y);
  boss.moving = moved;
  enemyAnimationManager.updateAnimation(boss);
  
  if (boss.attackCooldown <= 0) {
    boss.fireAttack();
  } else {
    boss.attackCooldown--;
    if (boss.attackAnimationTimer > 0) {
      boss.attackAnimationTimer--;
      if (boss.attackAnimationTimer <= 0) boss.isAttacking = false;
    }
  }
  
  for (let i = bossFireballs.length - 1; i >= 0; i--) {
    const fb = bossFireballs[i];
    fb.x += fb.vx;
    fb.y += fb.vy;
    fb.life--;
    
    const dx = player.x + player.size/2 - fb.x;
    const dy = player.y + player.size/2 - fb.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < player.size/2 + fb.radius) {
      player.life -= fb.damage;
      bossFireballs.splice(i, 1);
      if (player.life <= 0) gameOver();
      continue;
    }
    
    soldiers.forEach(s => {
      if (s.life <= 0) return;
      const dx2 = s.x + s.size/2 - fb.x;
      const dy2 = s.y + s.size/2 - fb.y;
      const distance2 = Math.hypot(dx2, dy2);
      
      if (distance2 < s.size/2 + fb.radius) {
        s.life -= fb.damage;
        bossFireballs.splice(i, 1);
      }
    });
    
    if (fb.life <= 0 || fb.x < 0 || fb.x > worldW || fb.y < 0 || fb.y > worldH) {
      bossFireballs.splice(i, 1);
    }
  }
  
  if (boss.life <= 0) {
    for (let i = 0; i < 10; i++) {
      dropLoot(boss.x + Math.random() * 100 - 50, boss.y + Math.random() * 100 - 50);
    }
    boss = null;
    bossFireballs = [];
    document.getElementById('bossSpawn').classList.remove('active');
    document.getElementById('bossSpawn').title = 'BOSS: MORTO (Clique para spawnar)';
    document.getElementById('bossStatus').textContent = 'MORTO';
    document.getElementById('bossStatus').style.color = '#ff0000';
    addLog("BOSS DERROTADO! Loot especial dropado!");
  }
}

function drawBoss() {
  if (!boss) return;
  
  const spriteCoords = enemyAnimationManager.getSpriteCoordinates(boss);
  const drawX = boss.x - camera.x - (boss.drawWidth - boss.size)/2;
  const drawY = boss.y - camera.y - (boss.drawHeight - boss.size)/2;
  
  if (bossImageLoaded) {
    ctx.drawImage(
      bossSprite,
      spriteCoords.sx, spriteCoords.sy,
      spriteCoords.frameWidth, spriteCoords.frameHeight,
      drawX, drawY,
      boss.drawWidth, boss.drawHeight
    );
  } else {
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(boss.x - camera.x + boss.size/2, boss.y - camera.y + boss.size/2, boss.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = "black";
  ctx.fillRect(boss.x - camera.x, boss.y - camera.y - 20, boss.size, 8);
  ctx.fillStyle = "#8b5cf6";
  ctx.fillRect(boss.x - camera.x, boss.y - camera.y - 20, (boss.life/boss.maxLife) * boss.size, 8);
  
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(boss.x - camera.x + boss.size/2, boss.y - camera.y + boss.size/2, boss.size/2, 0, Math.PI * 2);
  ctx.stroke();
  
  bossFireballs.forEach(fb => {
    const gradient = ctx.createRadialGradient(
      fb.x - camera.x, fb.y - camera.y, 0,
      fb.x - camera.x, fb.y - camera.y, fb.radius
    );
    gradient.addColorStop(0, '#ff6b00');
    gradient.addColorStop(0.7, '#ff0000');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(fb.x - camera.x, fb.y - camera.y, fb.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(fb.x - camera.x, fb.y - camera.y, fb.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ========== LOOP PRINCIPAL DO JOGO ==========
function update(currentTime = 0){
  if(!gameRunning) return;
  
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  player.updateDirection();
  
  if (enemySpawnEnabled) {
    enemySpawnTimer += deltaTime;
    if(enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
      spawnEnemies(ENEMY_SPAWN_COUNT);
      enemySpawnTimer = 0;
    }
  }
  
  if (npcSpawnEnabled) {
    npcSpawnTimer += deltaTime;
    if(npcSpawnTimer >= NPC_SPAWN_INTERVAL){
      const currentNPCs = npcs.filter(n => n.life > 0).length;
      const neededNPCs = MAX_NPCS - currentNPCs;
      if (neededNPCs > 0) spawnNPCs(Math.min(NPC_SPAWN_COUNT, neededNPCs));
      npcSpawnTimer = 0;
    }
  }
  
  // Movimento do player
  const nx = player.x + player.vx;
  const ny = player.y + player.vy;
  if(canMove(nx, player.y, player.size)) player.x = nx;
  if(canMove(player.x, ny, player.size)) player.y = ny;
  
  if (player.attackCooldown > 0) player.attackCooldown--;
  animationManager.updateAnimation(player);
  
  // ========== ATUALIZAÇÃO DOS INIMIGOS ==========
  enemies.forEach(e => {
    if(e.life <= 0) return;
    
    const target = e.findNearestTarget();
    const moved = moveIntelligently(e, target.x, target.y);
    e.moving = moved;
    
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const distance = Math.hypot(dx, dy);
    
    if(Math.abs(dx) > Math.abs(dy)) e.lastDirection = dx > 0 ? 'right' : 'left';
    else e.lastDirection = dy > 0 ? 'down' : 'up';
    
    if(distance < 20 && e.attackCooldown <= 0){
      target.life -= ENEMY_DAMAGE;
      e.attackCooldown = 40;
      e.isAttacking = true;
      e.attackAnimationTimer = 15;
      
      if(target === player && player.life <= 0) gameOver();
    }
    
    if (e.attackCooldown > 0) e.attackCooldown--;
    if (e.attackAnimationTimer > 0) {
      e.attackAnimationTimer--;
      if (e.attackAnimationTimer <= 0) e.isAttacking = false;
    }
    
    enemyAnimationManager.updateAnimation(e);
  });
  
  updateBoss();
  
  // ========== ATUALIZAÇÃO DOS SOLDADOS (COM COLETA INTELIGENTE) ==========
  const enemiesAlive = areEnemiesAlive();
  const collectedIndexes = [];
  
  soldiers.forEach((s, sIndex) => {
    if (s.life <= 0) {
      s.releaseTarget();
      soldiers.splice(sIndex, 1);
      addLog("Soldado morreu!");
      return;
    }
    
    // NOVO: Cooldown de coleta
    if (s.collectionCooldown > 0) s.collectionCooldown--;
    
    // ========== COMPORTAMENTO DE COLETA QUANDO NÃO HÁ INIMIGOS ==========
    if (!enemiesAlive && lootItems.length > 0 && s.collectionCooldown <= 0) {
      // Encontrar item mais próximo que não está sendo coletado
      const nearestItem = findNearestItem(s, collectedIndexes);
      
      if (nearestItem) {
        const dx = nearestItem.item.x - s.x;
        const dy = nearestItem.item.y - s.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 25) {
          // Coletar item
          collectItemByEntity(nearestItem.item, nearestItem.index, 
            s.type === 'mage' ? 'Mago' : 'Soldado');
          collectedIndexes.push(nearestItem.index);
          s.collectionCooldown = 30;
          s.moving = false;
        } else {
          // Mover em direção ao item
          const moveX = s.x + (dx / distance) * s.speed;
          const moveY = s.y + (dy / distance) * s.speed;
          
          if (canMove(moveX, s.y, s.size)) s.x = moveX;
          if (canMove(s.x, moveY, s.size)) s.y = moveY;
          
          s.moving = true;
          if (Math.abs(dx) > Math.abs(dy)) {
            s.lastDirection = dx > 0 ? 'right' : 'left';
          } else {
            s.lastDirection = dy > 0 ? 'down' : 'up';
          }
        }
        
        // Pular comportamento de combate
        animationManager.updateAnimation(s);
        return;
      }
    }
    
    // ========== COMPORTAMENTO NORMAL DE COMBATE ==========
    if (s.targetEnemy && (s.targetEnemy.life <= 0 || (s.targetEnemy !== boss && s.targetEnemy.targetedBy !== s.id))) {
      s.releaseTarget();
    }
    
    const targetEnemy = s.targetEnemy || s.findUnassignedEnemy();
    
    if (targetEnemy) {
      if (s.type === 'mage') {
        const dx = targetEnemy.x - s.x;
        const dy = targetEnemy.y - s.y;
        const d = Math.hypot(dx, dy);
        
        if (d > 100) {
          moveIntelligently(s, targetEnemy.x, targetEnemy.y);
        } else if (d < 80) {
          const retreatX = s.x - dx/d * s.speed * 0.5;
          const retreatY = s.y - dy/d * s.speed * 0.5;
          if (canMove(retreatX, retreatY, s.size)) {
            s.x = retreatX;
            s.y = retreatY;
          }
        }
        
        if (d < 120 && s.attackCooldown <= 0) s.attack(targetEnemy);
      } else {
        moveIntelligently(s, targetEnemy.x, targetEnemy.y);
        
        const dx = targetEnemy.x - s.x;
        const dy = targetEnemy.y - s.y;
        const d = Math.hypot(dx, dy);
        if (d < 25 && s.attackCooldown <= 0) s.attack(targetEnemy);
      }
    } else {
      const dx = player.x - s.x;
      const dy = player.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      
      if (d > 50) moveIntelligently(s, player.x, player.y);
      else s.moving = false;
    }
    
    if (s.attackCooldown > 0) s.attackCooldown--;
    if (s.hitCooldown > 0) s.hitCooldown--;
    
    if (s.isAttacking && s.attackCooldown <= 30) s.isAttacking = false;
    
    animationManager.updateAnimation(s);
  });
  
  // ========== ATUALIZAÇÃO DOS NPCS (COM INTELIGÊNCIA DE CURA) ==========
  npcs.forEach((npc, index) => {
    if (npc.life <= 0) {
      npcs.splice(index, 1);
      addLog("NPC morreu!");
      return;
    }
    
    // NOVO: Atualizar cooldown de cura
    if (npc.healCooldown > 0) npc.healCooldown--;
    
    // ========== COMPORTAMENTO DE BUSCA DE CURA ==========
    if (npc.life <= npc.maxLife * NPC_HEAL_THRESHOLD && npc.healCooldown <= 0) {
      const nearestHerb = npc.findNearestHerb();
      
      if (nearestHerb && nearestHerb.distance < 300) {
        const dx = nearestHerb.item.x - npc.x;
        const dy = nearestHerb.item.y - npc.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 25) {
          // Coletar erva e se curar
          lootItems.splice(nearestHerb.index, 1);
          const healAmount = Math.floor(npc.maxLife * 0.5);
          const oldLife = npc.life;
          npc.life = Math.min(npc.maxLife, npc.life + healAmount);
          npc.healCooldown = 180;
          addLog(`NPC se curou! +${npc.life - oldLife}HP`);
        } else {
          // Mover em direção à erva
          const moveX = npc.x + (dx / distance) * npc.speed * 1.2;
          const moveY = npc.y + (dy / distance) * npc.speed * 1.2;
          
          if (canMove(moveX, npc.y, npc.size)) npc.x = moveX;
          if (canMove(npc.x, moveY, npc.size)) npc.y = moveY;
          
          npc.moving = true;
          if (Math.abs(dx) > Math.abs(dy)) {
            npc.lastDirection = dx > 0 ? 'right' : 'left';
          } else {
            npc.lastDirection = dy > 0 ? 'down' : 'up';
          }
        }
        
        // Pular comportamento normal
        animationManager.updateAnimation(npc);
        return;
      }
    }
    
    // ========== COMPORTAMENTO NORMAL ==========
    const nearestEnemy = npc.findNearestEnemy();
    
    if (nearestEnemy) {
      if (npc.hasPower) {
        const dx = nearestEnemy.x - npc.x;
        const dy = nearestEnemy.y - npc.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 150 && npc.magicCooldown <= 0) npc.magicAttack(nearestEnemy);
        
        if (distance < 80) {
          const retreatX = npc.x - (dx / distance) * npc.speed;
          const retreatY = npc.y - (dy / distance) * npc.speed;
          if (canMove(retreatX, npc.y, npc.size)) npc.x = retreatX;
          if (canMove(npc.x, retreatY, npc.size)) npc.y = retreatY;
          npc.moving = true;
        } else if (distance > 120) {
          moveIntelligently(npc, nearestEnemy.x, nearestEnemy.y);
        } else {
          npc.moving = false;
        }
      } else {
        if (npc.fleeCooldown <= 0) {
          const dx = nearestEnemy.x - npc.x;
          const dy = nearestEnemy.y - npc.y;
          const distance = Math.hypot(dx, dy);
          
          const fleeX = npc.x - (dx / distance) * npc.speed * 1.5;
          const fleeY = npc.y - (dy / distance) * npc.speed * 1.5;
          
          if (canMove(fleeX, npc.y, npc.size)) npc.x = fleeX;
          if (canMove(npc.x, fleeY, npc.size)) npc.y = fleeY;
          
          npc.fleeCooldown = 10;
          npc.moving = true;
        }
      }
    } else {
      npc.moving = false;
    }
    
    if (npc.magicCooldown > 0) {
      npc.magicCooldown--;
      if (npc.magicCooldown <= 30) npc.isAttacking = false;
    }
    
    enemies.forEach(e => {
      if (e.life <= 0) return;
      
      const dx = e.x - npc.x;
      const dy = e.y - npc.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 20) npc.life -= ENEMY_DAMAGE;
    });
    
    if (npc.attackCooldown > 0) npc.attackCooldown--;
    if (npc.fleeCooldown > 0) npc.fleeCooldown--;
    
    animationManager.updateAnimation(npc);
  });
  
  // ========== ATUALIZAÇÃO DOS PROJÉTEIS ==========
  bullets.forEach((b, bi) => {
    b.x += b.vx;
    b.y += b.vy;
    
    if (b.x < 0 || b.x > worldW || b.y < 0 || b.y > worldH) {
      bullets.splice(bi, 1);
      return;
    }
    
    if (boss) {
      const dx = boss.x + boss.size/2 - b.x;
      const dy = boss.y + boss.size/2 - b.y;
      const d = Math.hypot(dx, dy);
      if (d < boss.size/2) {
        boss.life -= BULLET_DAMAGE;
        bullets.splice(bi, 1);
        return;
      }
    }
    
    enemies.forEach((e, ei) => {
      if(e.life > 0 && b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size){
        const wasAlive = e.life > 0;
        e.life -= BULLET_DAMAGE;
        
        if(wasAlive && e.life <= 0){
          enemiesKilled++;
          e.wasAlive = false;
          dropLoot(e.x, e.y);
          addLog(`Inimigo eliminado! Dano: ${BULLET_DAMAGE}`);
        }
        
        bullets.splice(bi, 1);
      }
    });
  });
  
  updateMagicProjectiles();
  updateNPCMagicProjectiles();
  
  if(player.hitCooldown > 0) player.hitCooldown--;
  checkAutoHerbUse();
  checkAutoCollection();
  updateSword();
  
  camera.x = player.x - canvas.width/2 + player.size/2;
  camera.y = player.y - canvas.height/2 + player.size/2;
  camera.x = Math.max(0, Math.min(camera.x, worldW - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, worldH - canvas.height));
  
  draw();
  requestAnimationFrame(update);
}

// ========== FUNÇÃO DE DESENHO ==========
function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenhar mapa
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
      if (item.type === 'herb') ctx.fillStyle = '#4CAF50';
      else if (item.type === 'bullets') ctx.fillStyle = '#2196F3';
      else if (item.type === 'attackSoul') ctx.fillStyle = '#4CAF50';
      else if (item.type === 'mageSoul') ctx.fillStyle = '#9C27B0';
      ctx.fillRect(drawX, drawY, item.size, item.size);
      
      if (item.type === 'bullets') {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.quantity, drawX + item.size/2, drawY + item.size/2 + 3);
      }
    }
    
    if (item.type === 'herb') ctx.strokeStyle = '#4CAF50';
    else if (item.type === 'bullets') ctx.strokeStyle = '#2196F3';
    else if (item.type === 'attackSoul') ctx.strokeStyle = '#4CAF50';
    else if (item.type === 'mageSoul') ctx.strokeStyle = '#9C27B0';
    
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX - 2, drawY - 2, item.size + 4, item.size + 4);
  });
  
  // Desenhar NPCs
  npcs.forEach(npc => {
    if (npc.life <= 0) return;
    
    const spriteCoords = animationManager.getSpriteCoordinates(npc);
    const drawX = npc.x - camera.x - (npc.drawWidth - npc.size)/2;
    const drawY = npc.y - camera.y - (npc.drawHeight - npc.size)/2;
    
    if (iceImageLoaded) {
      ctx.drawImage(
        iceSprite,
        spriteCoords.sx, spriteCoords.sy,
        spriteCoords.frameWidth, spriteCoords.frameHeight,
        drawX, drawY,
        npc.drawWidth, npc.drawHeight
      );
    } else {
      ctx.fillStyle = npc.hasPower ? "yellow" : "orange";
      ctx.fillRect(npc.x - camera.x, npc.y - camera.y, npc.size, npc.size);
    }
    
    ctx.fillStyle = "black";
    ctx.fillRect(npc.x - camera.x, npc.y - camera.y - 8, npc.size, 4);
    
    if (npc.hasPower) {
      ctx.fillStyle = "yellow";
      ctx.fillRect(npc.x - camera.x, npc.y - camera.y - 8, (npc.life/npc.maxLife) * npc.size, 4);
    } else {
      ctx.fillStyle = "green";
      ctx.fillRect(npc.x - camera.x, npc.y - camera.y - 8, (npc.life/npc.maxLife) * npc.size, 4);
    }
  });
  
  // Desenhar projéteis mágicos dos NPCs
  ctx.fillStyle = "magenta";
  ctx.strokeStyle = "white";
  npcMagicProjectiles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // Desenhar soldados
  soldiers.forEach(s => {
    if (s.life <= 0) return;
    
    const spriteCoords = animationManager.getSpriteCoordinates(s);
    const drawX = s.x - camera.x - (s.drawWidth - s.size)/2;
    const drawY = s.y - camera.y - (s.drawHeight - s.size)/2;
    
    if (iceImageLoaded) {
      ctx.drawImage(
        iceSprite,
        spriteCoords.sx, spriteCoords.sy,
        spriteCoords.frameWidth, spriteCoords.frameHeight,
        drawX, drawY,
        s.drawWidth, s.drawHeight
      );
    } else {
      ctx.fillStyle = s.type === 'mage' ? "purple" : "blue";
      ctx.fillRect(s.x - camera.x, s.y - camera.y, s.size, s.size);
    }
    
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
  });
  
  // Desenhar inimigos
  enemies.forEach(e => {
    if(e.life <= 0) return;
    
    const spriteCoords = enemyAnimationManager.getSpriteCoordinates(e);
    const drawX = e.x - camera.x - (e.drawWidth - e.size)/2;
    const drawY = e.y - camera.y - (e.drawHeight - e.size)/2;
    
    if (enemyImageLoaded) {
      ctx.drawImage(
        enemySprite,
        spriteCoords.sx, spriteCoords.sy,
        spriteCoords.frameWidth, spriteCoords.frameHeight,
        drawX, drawY,
        e.drawWidth, e.drawHeight
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
  
  // Desenhar boss
  drawBoss();
  
  // Desenhar rastro da espada
  if (sword.active && sword.trail.length > 1) {
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
    
    sword.trail.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const color = particle.color || 'rgba(100, 150, 255, 0.5)';
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = sword.attackMode === 'pursuit' ? 'cyan' : 'rgba(100, 150, 255, 0.7)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
  
  // Desenhar espada
  const drawSwordX = sword.x - camera.x;
  const drawSwordY = sword.y - camera.y;
  
  if (sword.active) {
    ctx.shadowColor = sword.attackMode === 'pursuit' ? 'cyan' : 'blue';
    ctx.shadowBlur = sword.attackMode === 'pursuit' ? 20 : 15;
  }
  
  if (swordSprite.complete) {
    ctx.save();
    ctx.translate(drawSwordX, drawSwordY);
    ctx.rotate(sword.angle + Math.PI / 4);
    ctx.drawImage(swordSprite, -sword.size/2, -sword.size/2, sword.size, sword.size);
    ctx.restore();
  } else {
    ctx.fillStyle = sword.active ? 
      (sword.attackMode === 'pursuit' ? 'cyan' : 'blue') : 
      'gray';
    
    ctx.beginPath();
    ctx.arc(drawSwordX, drawSwordY, sword.size/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drawSwordX - sword.size/3, drawSwordY);
    ctx.lineTo(drawSwordX + sword.size/3, drawSwordY);
    ctx.moveTo(drawSwordX, drawSwordY - sword.size/3);
    ctx.lineTo(drawSwordX, drawSwordY + sword.size/3);
    ctx.stroke();
  }
  
  ctx.shadowBlur = 0;
  
  // Desenhar jogador
  const playerSpriteCoords = animationManager.getSpriteCoordinates(player);
  const playerDrawX = player.x - camera.x - (player.drawWidth - player.size)/2;
  const playerDrawY = player.y - camera.y - (player.drawHeight - player.size)/2;
  
  if (iceImageLoaded) {
    ctx.drawImage(
      iceSprite,
      playerSpriteCoords.sx, playerSpriteCoords.sy,
      playerSpriteCoords.frameWidth, playerSpriteCoords.frameHeight,
      playerDrawX, playerDrawY,
      player.drawWidth, player.drawHeight
    );
  } else {
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.size, player.size);
  }
  
  // Desenhar tiros
  ctx.fillStyle = "yellow";
  ctx.strokeStyle = "orange";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x - camera.x, b.y - camera.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // Atualizar UI
  updateGameUI();
}

// ========== INICIALIZAÇÃO ==========
sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;

// Criar elemento de log
const logContainer = document.createElement('div');
logContainer.id = 'gameLog';
logContainer.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  height: 200px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #444;
  overflow-y: auto;
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(5px);
`;

const logTitle = document.createElement('div');
logTitle.textContent = '📜 LOG DO JOGO';
logTitle.style.cssText = `
  font-weight: bold;
  margin-bottom: 8px;
  color: #4CAF50;
  text-align: center;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
`;

const logContent = document.createElement('div');
logContent.id = 'logContent';
logContent.style.cssText = `
  max-height: 160px;
  overflow-y: auto;
`;

logContainer.appendChild(logTitle);
logContainer.appendChild(logContent);
document.body.appendChild(logContainer);

// Mensagem inicial
addLog("🎮 Jogo iniciado!");
addLog(`⚔️ Dano do player: ${BULLET_DAMAGE} (10x mais forte!)`);
addLog(`🔮 Dano dos magos: ${MAGE_DAMAGE} (10x mais forte!)`);
addLog(`🗡️ Dano da espada: ${sword.damage} (10x mais forte!)`);
addLog("💡 NPCs buscam cura quando com vida baixa");
addLog("💡 Soldados coletam itens quando não há inimigos");

// Iniciar o jogo
update();
updateSummonButton();

