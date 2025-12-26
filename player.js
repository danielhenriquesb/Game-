// player.js - Lógica do jogador, soldados, espada e projéteis

// ========== VARIÁVEIS DE PLAYER ==========
let soldiers = [];
let magicProjectiles = [];
let soldiersSummoned = false;
let soldierIdCounter = 0;

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

// ========== SOLDADOS ==========
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

function shoot(){
  if(!gameRunning) return;
  
  if (inventory.bullets <= 0) {
    addLog("Sem balas no inventário!");
    return;
  }
  
  inventory.bullets--;
  
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

// ========== ESPADA GIRATÓRIA ==========
let sword = {
  active: false,
  radius: 50,
  angle: 0,
  rotationSpeed: 0.05,
  size: 25,
  damage: 100000,
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

// ========== FUNÇÕES DE ATUALIZAÇÃO DE PLAYER ==========
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

// ========== FUNÇÕES DE UI (exportadas para shared.js) ==========
function updateSummonButton_impl() {
  const summonBtn = document.getElementById('summon');
  const totalSouls = inventory.attackSouls + inventory.mageSouls;
  
  if (totalSouls > 0 || soldiersSummoned) {
    summonBtn.disabled = false;
  } else {
    summonBtn.disabled = true;
  }
}

// ========== INVENTÁRIO ==========
function updateInventoryUI_impl() {
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

// ========== SISTEMA DE BAÚ ==========
let activeChest = null;
let chestInteractionButton = null;

function createChestInteractionButton(chest) {
  // Remover botão anterior se existir
  if (chestInteractionButton) {
    chestInteractionButton.remove();
  }
  
  // Criar botão
  chestInteractionButton = document.createElement('button');
  chestInteractionButton.id = 'chestInteractionBtn';
  chestInteractionButton.innerHTML = '📦 Abrir';
  chestInteractionButton.style.cssText = `
    position: fixed;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1001;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s;
  `;
  
  chestInteractionButton.addEventListener('mouseenter', () => {
    chestInteractionButton.style.transform = 'translateY(-2px)';
    chestInteractionButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
  });
  
  chestInteractionButton.addEventListener('mouseleave', () => {
    chestInteractionButton.style.transform = 'translateY(0)';
    chestInteractionButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
  });
  
  chestInteractionButton.addEventListener('click', () => {
    openChest(chest);
  });
  
  document.body.appendChild(chestInteractionButton);
  updateChestButtonPosition(chest);
}

function updateChestButtonPosition(chest) {
  if (!chestInteractionButton || !chest) return;
  
  const canvas = document.getElementById('canvas');
  const canvasRect = canvas.getBoundingClientRect();
  
  // Posicionar acima do baú
  const chestScreenX = chest.x - camera.x + canvasRect.left;
  const chestScreenY = chest.y - camera.y + canvasRect.top - 40;
  
  chestInteractionButton.style.left = `${chestScreenX}px`;
  chestInteractionButton.style.top = `${chestScreenY}px`;
}

function removeChestInteractionButton() {
  if (chestInteractionButton) {
    chestInteractionButton.remove();
    chestInteractionButton = null;
  }
}

function checkChestInteraction() {
  const playerCenterX = player.x + player.size/2;
  const playerCenterY = player.y + player.size/2;
  
  activeChest = null;
  
  for(let i = 0; i < chests.length; i++) {
    const chest = chests[i];
    const chestCenterX = chest.x + chest.width/2;
    const chestCenterY = chest.y + chest.height/2;
    
    const distance = Math.hypot(
      playerCenterX - chestCenterX,
      playerCenterY - chestCenterY
    );
    
    if (distance < 50) {
      activeChest = chest;
      if (!chestInteractionButton) {
        createChestInteractionButton(chest);
      } else {
        updateChestButtonPosition(chest);
      }
      return;
    }
  }
  
  // Se não há baú próximo, remover botão
  removeChestInteractionButton();
}

function openChest(chest) {
  if (!chest) return;
  
  activeChest = chest;
  showChestInventory();
}

function closeChest() {
  activeChest = null;
  hideChestInventory();
}

function showChestInventory() {
  const chestInventory = document.getElementById('chestInventory');
  if (chestInventory) {
    updateChestInventoryUI();
    chestInventory.style.display = 'block';
  }
}

function hideChestInventory() {
  const chestInventory = document.getElementById('chestInventory');
  if (chestInventory) {
    chestInventory.style.display = 'none';
  }
}

function updateChestInventoryUI() {
  if (!activeChest) return;
  
  const chestContent = document.getElementById('chestInventoryContent');
  const playerContent = document.getElementById('playerChestContent');
  
  if (!chestContent || !playerContent) return;
  
  // Limpar conteúdos
  chestContent.innerHTML = '';
  playerContent.innerHTML = '';
  
  // Adicionar itens do baú
  const chestInv = activeChest.inventory;
  
  if (chestInv.herbs > 0) {
    const herbItem = createChestItemElement('herb', chestInv.herbs, false);
    chestContent.appendChild(herbItem);
  }
  
  if (chestInv.bullets > 0) {
    const bulletItem = createChestItemElement('bullets', chestInv.bullets, false);
    chestContent.appendChild(bulletItem);
  }
  
  if (chestInv.attackSouls > 0) {
    const attackSoulItem = createChestItemElement('attackSouls', chestInv.attackSouls, false);
    chestContent.appendChild(attackSoulItem);
  }
  
  if (chestInv.mageSouls > 0) {
    const mageSoulItem = createChestItemElement('mageSouls', chestInv.mageSouls, false);
    chestContent.appendChild(mageSoulItem);
  }
  
  if (chestContent.children.length === 0) {
    chestContent.innerHTML = '<p style="text-align:center;color:#888;">Baú vazio</p>';
  }
  
  // Adicionar itens do player
  if (inventory.herbs > 0) {
    const herbItem = createChestItemElement('herb', inventory.herbs, true);
    playerContent.appendChild(herbItem);
  }
  
  if (inventory.bullets > 0) {
    const bulletItem = createChestItemElement('bullets', inventory.bullets, true);
    playerContent.appendChild(bulletItem);
  }
  
  if (inventory.attackSouls > 0) {
    const attackSoulItem = createChestItemElement('attackSouls', inventory.attackSouls, true);
    playerContent.appendChild(attackSoulItem);
  }
  
  if (inventory.mageSouls > 0) {
    const mageSoulItem = createChestItemElement('mageSouls', inventory.mageSouls, true);
    playerContent.appendChild(mageSoulItem);
  }
  
  if (playerContent.children.length === 0) {
    playerContent.innerHTML = '<p style="text-align:center;color:#888;">Inventário vazio</p>';
  }
}

function createChestItemElement(itemType, quantity, isPlayerItem) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'chest-inventory-item';
  
  let itemName = '';
  let icon = '';
  
  switch(itemType) {
    case 'herb':
      itemName = 'Erva Medicinal';
      icon = '🌿';
      break;
    case 'bullets':
      itemName = 'Balas';
      icon = '🔫';
      break;
    case 'attackSouls':
      itemName = 'Alma de Guerreiro';
      icon = '⚔️';
      break;
    case 'mageSouls':
      itemName = 'Alma de Mago';
      icon = '🔮';
      break;
  }
  
  itemDiv.innerHTML = `
    <div class="chest-item-info">
      <span>${icon} ${itemName}</span>
      <span class="chest-item-count">${quantity}</span>
    </div>
    <div class="chest-item-actions">
      <button class="chest-item-btn ${isPlayerItem ? 'deposit' : 'withdraw'}" 
              data-item="${itemType}" 
              data-isplayer="${isPlayerItem}">
        ${isPlayerItem ? 'Depositar' : 'Retirar'}
      </button>
    </div>
  `;
  
  // Adicionar evento ao botão
  const button = itemDiv.querySelector('.chest-item-btn');
  button.addEventListener('click', function() {
    const item = this.getAttribute('data-item');
    const isPlayer = this.getAttribute('data-isplayer') === 'true';
    
    if (isPlayer) {
      transferItemToChest(item);
    } else {
      transferItemToPlayer(item);
    }
  });
  
  return itemDiv;
}

function transferItemToChest(itemType) {
  if (!activeChest) return;
  
  let transferred = false;
  
  switch(itemType) {
    case 'herb':
      if (inventory.herbs > 0) {
        inventory.herbs--;
        activeChest.inventory.herbs++;
        transferred = true;
      }
      break;
    case 'bullets':
      if (inventory.bullets >= 10) {
        inventory.bullets -= 10;
        activeChest.inventory.bullets += 10;
        transferred = true;
      }
      break;
    case 'attackSouls':
      if (inventory.attackSouls > 0) {
        inventory.attackSouls--;
        activeChest.inventory.attackSouls++;
        transferred = true;
      }
      break;
    case 'mageSouls':
      if (inventory.mageSouls > 0) {
        inventory.mageSouls--;
        activeChest.inventory.mageSouls++;
        transferred = true;
      }
      break;
  }
  
  if (transferred) {
    updateChestInventoryUI();
    updateInventoryUI();
    updateGameUI();
    addLog(`Item transferido para o baú`);
  }
}

function transferItemToPlayer(itemType) {
  if (!activeChest) return;
  
  let transferred = false;
  
  switch(itemType) {
    case 'herb':
      if (activeChest.inventory.herbs > 0) {
        activeChest.inventory.herbs--;
        inventory.herbs++;
        transferred = true;
      }
      break;
    case 'bullets':
      if (activeChest.inventory.bullets >= 10) {
        activeChest.inventory.bullets -= 10;
        inventory.bullets += 10;
        transferred = true;
      }
      break;
    case 'attackSouls':
      if (activeChest.inventory.attackSouls > 0) {
        activeChest.inventory.attackSouls--;
        inventory.attackSouls++;
        transferred = true;
      }
      break;
    case 'mageSouls':
      if (activeChest.inventory.mageSouls > 0) {
        activeChest.inventory.mageSouls--;
        inventory.mageSouls++;
        transferred = true;
      }
      break;
  }
  
  if (transferred) {
    updateChestInventoryUI();
    updateInventoryUI();
    updateGameUI();
    addLog(`Item transferido para o inventário`);
  }
}

// ========== FUNÇÕES DE ENEMY PARA PLAYER ==========
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

// ========== INICIALIZAÇÃO DA ESPADA ==========
// Inicializar posição da espada
sword.x = player.x + Math.cos(sword.angle) * sword.orbitRadius;
sword.y = player.y + Math.sin(sword.angle) * sword.orbitRadius;