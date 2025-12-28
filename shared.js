// shared.js - Variáveis e funções globais compartilhadas

// ========== VARIÁVEIS GLOBAIS ==========
let boss = null;
let bossFireballs = [];
let enemies = [];
let enemiesKilled = 0;
let gameRunning = true;
let inventory = {
  herbs: 0,
  bullets: 100,
  attackSouls: 10,
  mageSouls: 5
};
let chestInventory = {
  herbs: 0,
  bullets: 0,
  attackSouls: 0,
  mageSouls: 0
};
let lootItems = [];
let npcs = [];
let npcMagicProjectiles = [];
let gameLog = [];
let chests = [];
let npcLeader = null;

// ========== SISTEMA DE DIA E NOITE ==========
let gameTime = 0; // em segundos
let currentHour = 1; // 1-6
let currentDayPhase = 'day';
const DAY_CYCLE = 360; // 6 minutos em segundos (1 hora = 60 segundos)
const HOUR_DURATION = DAY_CYCLE / 6; // 60 segundos por hora

// ========== CONSTANTES ==========
const TILE = 32;
const BULLET_DAMAGE = 500;
const ENEMY_DAMAGE = 15;
const SOLDIER_DAMAGE = 36;
const MAGE_DAMAGE = 2000;
const MAX_SOLDIERS = 10;
const MAX_ENEMIES = 200;
const MAX_NPCS = 11;
const BOSS_SPAWN_HEALTH = 5000;
const BOSS_FIREBALL_DAMAGE = 30;
const BOSS_FIREBALL_SPEED = 4;
const MAX_LOG_ENTRIES = 15;
const NPC_LEADER_COOLDOWN = 600;

// ========== VARIÁVEIS DE IMAGENS ==========
let herbSprite, bulletSprite, soulSprite, chestSprite;
let iceSprite, swordSprite, enemySprite, bossSprite;
let iceImageLoaded = false, enemyImageLoaded = false, bossImageLoaded = false;
let imagesLoaded = 0;
let totalImages = 6;

// ========== MAPA ==========
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,4,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const worldW = map[0].length * TILE;
const worldH = map.length * TILE;

// ========== FUNÇÕES UTILITÁRIAS ==========
function getRandomFreePosition(size, isEnemy = false){
  let x, y;
  let attempts = 0;
  do{
    const tx = Math.floor(Math.random()*map[0].length);
    const ty = Math.floor(Math.random()*map.length);
    const tile = map[ty][tx];
    
    if(tile === 0 || (!isEnemy && (tile === 2 || tile === 3 || tile === 4))){
      if(isEnemy && (tile === 2 || tile === 3 || tile === 4)) {
        attempts++;
        if(attempts > 50) return null;
        continue;
      }
      
      x = tx*TILE + (TILE-size)/2;
      y = ty*TILE + (TILE-size)/2;
      break;
    }
    attempts++;
    if(attempts > 100) return {x: TILE, y: TILE};
  } while(true);
  return {x, y};
}

function isWall(px, py, isEnemy = false){
  const tx = Math.floor(px/TILE);
  const ty = Math.floor(py/TILE);
  if(ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return true;
  const tile = map[ty][tx];
  
  if(isEnemy) {
    return tile === 1 || tile === 3;
  } else {
    return tile === 1;
  }
}

function canMove(x, y, s, isEnemy = false){
  return !isWall(x, y, isEnemy) && !isWall(x + s, y, isEnemy) && 
         !isWall(x, y + s, isEnemy) && !isWall(x + s, y + s, isEnemy);
}

function moveIntelligently(entity, targetX, targetY, isEnemy = false) {
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
  
  if (canMove(newX, newY, entity.size, isEnemy)) {
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
    
    if (canMove(newX, entity.y, entity.size, isEnemy)) {
      entity.x = newX;
      entity.stuckTimer = 0;
      entity.moving = true;
      return true;
    } else if (canMove(entity.x, newY, entity.size, isEnemy)) {
      entity.y = newY;
      entity.stuckTimer = 0;
      entity.moving = true;
      return true;
    }
    
    entity.moving = false;
    return false;
  }
}

// ========== SISTEMA DE DIA E NOITE ==========
function updateGameTime(deltaTime) {
  gameTime += deltaTime / 1000;
  if (gameTime >= DAY_CYCLE) {
    gameTime = 0;
  }
  
  currentHour = Math.floor(gameTime / HOUR_DURATION) + 1;
  
  if (currentHour >= 1 && currentHour <= 3) {
    currentDayPhase = 'day';
  } else {
    currentDayPhase = 'night';
  }
}

function getCurrentHour() {
  return currentHour;
}

function getDayPhase() {
  return currentDayPhase;
}

// ========== SISTEMA DE LOG ==========
function addLog(message) {
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  gameLog.unshift(`[${time}] ${message}`);
  if (gameLog.length > MAX_LOG_ENTRIES) gameLog.pop();
  
  const logElement = document.getElementById('gameLog');
  if (logElement) {
    logElement.innerHTML = gameLog.map(entry => `<div>${entry}</div>`).join('');
  }
}

// ========== SISTEMA DE LOOT ==========
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

// ========== FUNÇÕES DE COLETA ==========
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
  
  collectedItem.collected = true;
  lootItems.splice(index, 1);
  
  updateGameUI();
  updateInventoryUI();
  updateSummonButton();
}

// ========== SISTEMA DE BAÚ ==========
function initializeChests() {
  chests = [];
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      if(map[y][x] === 4){
        chests.push({
          x: x * TILE,
          y: y * TILE,
          width: TILE,
          height: TILE,
          open: false,
          inventory: {
            herbs: 0,
            bullets: 0,
            attackSouls: 0,
            mageSouls: 0
          }
        });
      }
    }
  }
}

// ========== CARREGAR IMAGENS ==========
function loadImage(src, onLoadCallback) {
  const img = new Image();
  img.onload = function() {
    onLoadCallback(img);
    imagesLoaded++;
    console.log(`Imagem carregada: ${src}`);
    
    if (imagesLoaded === totalImages) {
      console.log("Todas as imagens foram carregadas!");
      if (typeof onAllImagesLoaded === 'function') {
        onAllImagesLoaded();
      }
    }
  };
  
  img.onerror = function() {
    console.error(`Erro ao carregar imagem: ${src}`);
    // Criar imagem placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('ERR', 20, 32);
    onLoadCallback(canvas);
    imagesLoaded++;
  };
  
  img.src = src;
  return img;
}

// ========== INICIALIZAÇÃO ==========
function initializeGame() {
  console.log("Inicializando jogo...");
  
  // Carregar imagens
  loadImage('https://cdn-icons-png.flaticon.com/512/684/684908.png', function(img) {
    herbSprite = img;
  });
  
  loadImage('https://cdn-icons-png.flaticon.com/512/2303/2303971.png', function(img) {
    bulletSprite = img;
  });
  
  loadImage('https://cdn-icons-png.flaticon.com/512/2737/2737417.png', function(img) {
    soulSprite = img;
  });
  
  loadImage('https://cdn-icons-png.flaticon.com/512/2292/2292038.png', function(img) {
    chestSprite = img;
  });
  
  // Carregar sprites do jogo
  loadImage('iceslayer.png', function(img) {
    iceSprite = img;
    iceImageLoaded = true;
    console.log("Sprite do player carregado");
  });
  
  loadImage('redelfo.png', function(img) {
    enemySprite = img;
    enemyImageLoaded = true;
    console.log("Sprite do inimigo carregado");
  });
  
  loadImage('boss.png', function(img) {
    bossSprite = img;
    bossImageLoaded = true;
    console.log("Sprite do boss carregado");
  });
  
  loadImage('sword.png', function(img) {
    swordSprite = img;
    console.log("Sprite da espada carregado");
  });
  
  // Inicializar baús
  initializeChests();
  
  // Criar elemento de log
  createLogElement();
}

function createLogElement() {
  if (!document.getElementById('gameLog')) {
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
  }
}

// ========== CALLBACK QUANDO TODAS IMAGENS CARREGAREM ==========
function onAllImagesLoaded() {
  console.log("Todas imagens carregadas, iniciando jogo...");
  addLog("🎮 Jogo inicializado!");
  addLog("⚔️ Dano do player: 500");
  addLog("🔮 Dano dos magos: 2000");
  addLog("💡 Use o joystick para se mover");
  addLog("🔫 Toque no botão de atirar ou use Espaço");
  
  // Iniciar o loop do jogo
  if (typeof startGame === 'function') {
    setTimeout(startGame, 100);
  }
}

// ========== FUNÇÕES DE UI ==========
function updateGameUI() {
  if (typeof updateGameUI_impl === 'function') {
    updateGameUI_impl();
  }
}

function updateInventoryUI() {
  if (typeof updateInventoryUI_impl === 'function') {
    updateInventoryUI_impl();
  }
}

function updateSummonButton() {
  if (typeof updateSummonButton_impl === 'function') {
    updateSummonButton_impl();
  }
}

// ========== INICIAR JOGO ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}
