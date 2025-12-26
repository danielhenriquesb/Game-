// game.js - Lógica principal do jogo, inimigos, NPCs e loop

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ========== VARIÁVEIS DE GAME ==========
let enemySpawnEnabled = true;
let npcSpawnEnabled = false;
const NPC_SPAWN_COUNT = 10;
const NPC_SPAWN_INTERVAL = 10000;
let npcSpawnTimer = 0;
const NPC_POWER_CHANCE = 0.25;
const NPC_HEAL_THRESHOLD = 0.3;

const ENEMY_SPAWN_COUNT = 50;
const ENEMY_SPAWN_INTERVAL = 10000;
let enemySpawnTimer = 0;

// ========== SPAWN DE INIMIGOS ==========
function spawnEnemies(count) {
  const currentHour = getCurrentHour();
  
  // Verificar se está no horário de spawn (1-4 horas)
  if (currentHour < 1 || currentHour > 4) {
    return;
  }
  
  const currentEnemies = enemies.filter(e => e.life > 0).length;
  const availableSlots = MAX_ENEMIES - currentEnemies;
  
  if (availableSlots <= 0) return;
  
  const spawnCount = Math.min(count, availableSlots);
  
  for (let i = 0; i < spawnCount; i++) {
    const pos = getRandomFreePosition(30, true); // true = é inimigo
    if (!pos) continue;
    
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
        
        // O líder também é alvo
        if (npcLeader && npcLeader.life > 0) {
          const d = Math.hypot(npcLeader.x - this.x, npcLeader.y - this.y);
          if (d < minDist) {
            minDist = d;
            nearest = npcLeader;
          }
        }
        
        return nearest;
      }
    });
  }
}

// ========== INIMIGOS INICIAIS ==========
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
      
      if (npcLeader && npcLeader.life > 0) {
        const d = Math.hypot(npcLeader.x - this.x, npcLeader.y - this.y);
        if (d < minDist) {
          minDist = d;
          nearest = npcLeader;
        }
      }
      
      return nearest;
    }
  });
}

// ========== NPCs INTELIGENTES COM NOVOS COMPORTAMENTOS ==========
function spawnNPCs(count) {
  const currentNPCs = npcs.filter(n => n.life > 0).length;
  const availableSlots = MAX_NPCS - 1 - currentNPCs; // -1 para o líder
  
  if (availableSlots <= 0) return;
  
  const spawnCount = Math.min(count, availableSlots);
  
  for (let i = 0; i < spawnCount; i++) {
    const pos = getRandomFreePosition(30);
    const hasPower = Math.random() < NPC_POWER_CHANCE;
    
    // Encontrar uma casa para o NPC
    let housePos = null;
    for(let y = 0; y < map.length; y++){
      for(let x = 0; x < map[0].length; x++){
        if(map[y][x] === 2){
          housePos = {x: x * TILE + TILE/2, y: y * TILE + TILE/2};
          break;
        }
      }
      if(housePos) break;
    }
    
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
      state: 'COMBAT',
      housePosition: housePos || {x: pos.x, y: pos.y},
      collectedItems: {
        herbs: 0,
        bullets: 0,
        attackSouls: 0,
        mageSouls: 0
      },
      kills: 0,
      attackMultiplier: 1.0,
      defenseMultiplier: 1.0,
      baseDamage: hasPower ? 100 : 20,
      baseDefense: 1.0,
      healHerbsCollected: 0,
      healHerbsThreshold: 2, // Coleta pelo menos 2 ervas
      
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
            damage: 100 * this.attackMultiplier,
            owner: 'npc',
            npcOwner: this
          });
        }
      },
      
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
      },
      
      findNearestItem: function() {
        let nearest = null;
        let minDist = Infinity;
        
        for (let i = 0; i < lootItems.length; i++) {
          const item = lootItems[i];
          if (!item.collected) {
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
      },
      
      depositItemsToChest: function() {
        if (this.collectedItems.herbs > 0 || this.collectedItems.bullets > 0 || 
            this.collectedItems.attackSouls > 0 || this.collectedItems.mageSouls > 0) {
          
          // Encontrar baú mais próximo
          let nearestChest = null;
          let minDist = Infinity;
          
          chests.forEach(chest => {
            const dx = chest.x - this.x;
            const dy = chest.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < minDist) {
              minDist = d;
              nearestChest = chest;
            }
          });
          
          if (nearestChest) {
            nearestChest.inventory.herbs += this.collectedItems.herbs;
            nearestChest.inventory.bullets += this.collectedItems.bullets;
            nearestChest.inventory.attackSouls += this.collectedItems.attackSouls;
            nearestChest.inventory.mageSouls += this.collectedItems.mageSouls;
            
            const totalItems = this.collectedItems.herbs + this.collectedItems.bullets + 
                              this.collectedItems.attackSouls + this.collectedItems.mageSouls;
            
            if (totalItems > 0) {
              addLog(`NPC depositou ${totalItems} itens no baú`);
            }
            
            // Resetar itens coletados, mas manter as ervas de cura se precisar
            const herbsToKeep = Math.min(this.collectedItems.herbs, this.healHerbsThreshold);
            this.collectedItems = { herbs: herbsToKeep, bullets: 0, attackSouls: 0, mageSouls: 0 };
          }
        }
      },
      
      increasePower: function() {
        if (this.kills % 5 === 0) {
          this.attackMultiplier *= 1.2; // Aumenta 20%
          this.defenseMultiplier *= 1.2; // Aumenta 20%
          addLog(`NPC aumentou poder! Ataque: x${this.attackMultiplier.toFixed(1)}, Defesa: x${this.defenseMultiplier.toFixed(1)}`);
        }
      },
      
      useHealHerb: function() {
        if (this.collectedItems.herbs > 0 && this.life < this.maxLife * 0.5) {
          const healAmount = Math.floor(this.maxLife * 0.5);
          const oldLife = this.life;
          this.life = Math.min(this.maxLife, this.life + healAmount);
          this.collectedItems.herbs--;
          addLog(`NPC usou erva! +${this.life - oldLife}HP`);
          return true;
        }
        return false;
      }
    });
  }
  
  // Criar NPC líder se não existir
  if (!npcLeader && npcs.length >= 5) {
    createNPCLeader();
  }
}

// ========== NPC LÍDER ==========
function createNPCLeader() {
  const pos = getRandomFreePosition(30);
  
  // Encontrar uma casa para o NPC líder
  let housePos = null;
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      if(map[y][x] === 2){
        housePos = {x: x * TILE + TILE/2, y: y * TILE + TILE/2};
        break;
      }
    }
    if(housePos) break;
  }
  
  npcLeader = {
    x: pos.x,
    y: pos.y,
    size: 35,
    drawWidth: 150,
    drawHeight: 175,
    speed: 2.0, // 50% mais rápido
    life: 150,
    maxLife: 150,
    hasPower: true,
    isLeader: true,
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
    specialAttackCooldown: 0,
    swordAttackCooldown: 0,
    state: 'COMBAT',
    housePosition: housePos || {x: pos.x, y: pos.y},
    collectedItems: {
      herbs: 0,
      bullets: 0,
      attackSouls: 0,
      mageSouls: 0
    },
    kills: 0,
    attackMultiplier: 1.5, // 50% mais forte
    defenseMultiplier: 0.2, // 80% de defesa (recebe apenas 20% do dano)
    baseDamage: 200,
    baseDefense: 0.2,
    healHerbsCollected: 0,
    healHerbsThreshold: 3,
    
    findNearestEnemy: function() {
      if (boss) {
        const dx = boss.x - this.x;
        const dy = boss.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d < 400) return boss;
      }
      
      let nearest = null;
      let minDist = Infinity;
      
      enemies.forEach(e => {
        if (e.life <= 0) return;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d < minDist && d < 400) {
          minDist = d;
          nearest = e;
        }
      });
      
      return nearest;
    },
    
    magicAttack: function(enemy) {
      if (this.magicCooldown <= 0 && enemy) {
        this.isAttacking = true;
        this.magicCooldown = 120;
        
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.hypot(dx, dy) || 1;
        
        // Magia Hit Kill do líder
        npcMagicProjectiles.push({
          x: this.x + this.size/2,
          y: this.y + this.size/2,
          targetX: enemy.x,
          targetY: enemy.y,
          vx: (dx / distance) * 5,
          vy: (dy / distance) * 5,
          radius: 15,
          damage: 99999, // Dano praticamente infinito
          owner: 'leader',
          color: 'orange',
          trail: []
        });
        
        addLog("Líder NPC usou magia HIT KILL!");
      }
    },
    
    swordAttack: function() {
      if (this.swordAttackCooldown <= 0) {
        this.swordAttackCooldown = NPC_LEADER_COOLDOWN;
        this.isAttacking = true;
        
        // Criar projétil de espada especial
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
          const dx = nearestEnemy.x - this.x;
          const dy = nearestEnemy.y - this.y;
          const distance = Math.hypot(dx, dy) || 1;
          
          const swordProjectile = {
            x: this.x + this.size/2,
            y: this.y + this.size/2,
            targetX: nearestEnemy.x,
            targetY: nearestEnemy.y,
            vx: (dx / distance) * 8,
            vy: (dy / distance) * 8,
            radius: 20,
            damage: 5000 * this.attackMultiplier,
            owner: 'leader',
            type: 'sword',
            color: 'orange',
            trail: [],
            life: 60
          };
          
          npcMagicProjectiles.push(swordProjectile);
          addLog("Líder NPC usou espada especial!");
        }
      }
    },
    
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
    },
    
    findNearestItem: function() {
      let nearest = null;
      let minDist = Infinity;
      
      for (let i = 0; i < lootItems.length; i++) {
        const item = lootItems[i];
        if (!item.collected) {
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
    },
    
    depositItemsToChest: function() {
      if (this.collectedItems.herbs > 0 || this.collectedItems.bullets > 0 || 
          this.collectedItems.attackSouls > 0 || this.collectedItems.mageSouls > 0) {
        
        let nearestChest = null;
        let minDist = Infinity;
        
        chests.forEach(chest => {
          const dx = chest.x - this.x;
          const dy = chest.y - this.y;
          const d = Math.hypot(dx, dy);
          if (d < minDist) {
            minDist = d;
            nearestChest = chest;
          }
        });
        
        if (nearestChest) {
          nearestChest.inventory.herbs += this.collectedItems.herbs;
          nearestChest.inventory.bullets += this.collectedItems.bullets;
          nearestChest.inventory.attackSouls += this.collectedItems.attackSouls;
          nearestChest.inventory.mageSouls += this.collectedItems.mageSouls;
          
          const totalItems = this.collectedItems.herbs + this.collectedItems.bullets + 
                            this.collectedItems.attackSouls + this.collectedItems.mageSouls;
          
          if (totalItems > 0) {
            addLog(`Líder NPC depositou ${totalItems} itens no baú`);
          }
          
          const herbsToKeep = Math.min(this.collectedItems.herbs, this.healHerbsThreshold);
          this.collectedItems = { herbs: herbsToKeep, bullets: 0, attackSouls: 0, mageSouls: 0 };
        }
      }
    },
    
    increasePower: function() {
      if (this.kills % 5 === 0) {
        this.attackMultiplier *= 1.2;
        this.defenseMultiplier *= 0.9; // Diminui para manter o equilíbrio
        addLog(`Líder NPC aumentou poder! Ataque: x${this.attackMultiplier.toFixed(1)}`);
      }
    },
    
    useHealHerb: function() {
      if (this.collectedItems.herbs > 0 && this.life < this.maxLife * 0.5) {
        const healAmount = Math.floor(this.maxLife * 0.7);
        const oldLife = this.life;
        this.life = Math.min(this.maxLife, this.life + healAmount);
        this.collectedItems.herbs--;
        addLog(`Líder NPC usou erva especial! +${this.life - oldLife}HP`);
        return true;
      }
      return false;
    }
  };
}

// ========== CONTROLES ==========
document.addEventListener('DOMContentLoaded', function() {
  // Configurar botões
  const toggleEnemySpawnBtn = document.getElementById("toggleEnemySpawn");
  const toggleNPCSpawnBtn = document.getElementById("toggleNPCSpawn");
  const bossSpawnBtn = document.getElementById("bossSpawn");
  const swordBtn = document.getElementById("sword");
  const summonBtn = document.getElementById("summon");
  const attackBtn = document.getElementById("attack");
  const openInventoryBtn = document.getElementById("openInventory");
  const closeInventoryBtn = document.getElementById("closeInventory");
  const closeChestInventoryBtn = document.getElementById("closeChestInventory");
  
  if (toggleEnemySpawnBtn) toggleEnemySpawnBtn.addEventListener("pointerdown", toggleEnemySpawn);
  if (toggleNPCSpawnBtn) toggleNPCSpawnBtn.addEventListener("pointerdown", toggleNPCSpawn);
  if (bossSpawnBtn) bossSpawnBtn.addEventListener("pointerdown", toggleBoss);
  if (swordBtn) swordBtn.addEventListener("pointerdown", toggleSword);
  if (summonBtn) summonBtn.addEventListener("pointerdown", toggleMassSummon);
  if (attackBtn) attackBtn.addEventListener("pointerdown", shoot);
  if (openInventoryBtn) openInventoryBtn.addEventListener("click", openInventory);
  if (closeInventoryBtn) closeInventoryBtn.addEventListener("click", closeInventory);
  if (closeChestInventoryBtn) closeChestInventoryBtn.addEventListener("click", closeChest);
  
  // Configurar teclado
  document.addEventListener("keydown", e => {
    if(e.code === "Space") shoot();
  });
  
  // Configurar botão de status
  const statusBtn = document.getElementById('statusBtn');
  const statusPanel = document.getElementById('statusPanel');
  
  if (statusBtn && statusPanel) {
    statusBtn.addEventListener('click', function() {
      statusPanel.classList.toggle('show');
    });
  }
  
  // Iniciar o jogo após um breve delay
  setTimeout(function() {
    if (typeof update === 'function') {
      requestAnimationFrame(update);
      console.log("Jogo iniciado!");
    }
  }, 500);
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

function spawnBoss() {
  if (boss) return;
  
  const pos = getRandomFreePosition(60, true);
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

// ========== JOYSTICK ==========
const joystick = document.getElementById("joystick");
const thumb = document.getElementById("thumb");

let dragging = false;
let joystickCenter = { x: 0, y: 0 };
let joystickMaxDistance = 40;

function getPos(e) {
  return e.touches ? e.touches[0] : e;
}

if (joystick) {
  joystick.addEventListener("touchstart", startJoystick);
  joystick.addEventListener("mousedown", startJoystick);
}

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

// ========== ATUALIZAÇÃO DO BOSS ==========
function updateBoss() {
  if (!boss) return;
  
  const target = boss.findTarget();
  const moved = moveIntelligently(boss, target.x, target.y, true);
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
    
    npcs.forEach(npc => {
      if (npc.life <= 0) return;
      const dx2 = npc.x + npc.size/2 - fb.x;
      const dy2 = npc.y + npc.size/2 - fb.y;
      const distance2 = Math.hypot(dx2, dy2);
      
      if (distance2 < npc.size/2 + fb.radius) {
        npc.life -= fb.damage * npc.defenseMultiplier;
        bossFireballs.splice(i, 1);
      }
    });
    
    if (npcLeader && npcLeader.life > 0) {
      const dx2 = npcLeader.x + npcLeader.size/2 - fb.x;
      const dy2 = npcLeader.y + npcLeader.size/2 - fb.y;
      const distance2 = Math.hypot(dx2, dy2);
      
      if (distance2 < npcLeader.size/2 + fb.radius) {
        npcLeader.life -= fb.damage * npcLeader.defenseMultiplier;
        bossFireballs.splice(i, 1);
      }
    }
    
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

// ========== ATUALIZAÇÃO DOS NPCS COM NOVOS COMPORTAMENTOS ==========
function updateNPCsByHour() {
  const currentHour = getCurrentHour();
  
  // Atualizar NPCs normais
  for (let i = npcs.length - 1; i >= 0; i--) {
    const npc = npcs[i];
    
    if (npc.life <= 0) {
      npcs.splice(i, 1);
      addLog("NPC morreu!");
      continue;
    }
    
    // Atualizar estado baseado na hora
    if (currentHour >= 1 && currentHour <= 4) {
      npc.state = 'COMBAT';
    } else if (currentHour >= 4 && currentHour <= 5) {
      npc.state = 'COLLECT';
    } else if (currentHour >= 5 && currentHour <= 6) {
      npc.state = 'RETURN_HOME';
    } else if (currentHour >= 6 || currentHour < 1) {
      npc.state = 'HOME';
    }
    
    // Executar comportamento baseado no estado
    switch(npc.state) {
      case 'COMBAT':
        updateNPCCombat(npc);
        break;
      case 'COLLECT':
        updateNPCCollect(npc);
        break;
      case 'RETURN_HOME':
        updateNPCReturnHome(npc);
        break;
      case 'HOME':
        updateNPCHome(npc);
        break;
    }
  }
  
  // Atualizar NPC líder
  if (npcLeader) {
    if (npcLeader.life <= 0) {
      addLog("Líder NPC morreu!");
      npcLeader = null;
      return;
    }
    
    updateNPCLeader(npcLeader);
  }
}

function updateNPCCombat(npc) {
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
    
    // Ataque corpo a corpo
    const dx = nearestEnemy.x - npc.x;
    const dy = nearestEnemy.y - npc.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 30 && npc.attackCooldown <= 0) {
      const damage = npc.baseDamage * npc.attackMultiplier;
      nearestEnemy.life -= damage;
      npc.attackCooldown = 40;
      npc.isAttacking = true;
      
      // Verificar se matou o inimigo
      if (nearestEnemy.life <= 0 && nearestEnemy.wasAlive) {
        npc.kills++;
        enemiesKilled++;
        nearestEnemy.wasAlive = false;
        dropLoot(nearestEnemy.x, nearestEnemy.y);
        
        // Aumentar poder a cada 5 kills
        npc.increasePower();
      }
    }
  } else {
    npc.moving = false;
  }
  
  // Usar erva se a vida estiver baixa
  npc.useHealHerb();
  
  if (npc.magicCooldown > 0) {
    npc.magicCooldown--;
    if (npc.magicCooldown <= 30) npc.isAttacking = false;
  }
  
  enemies.forEach(e => {
    if (e.life <= 0) return;
    
    const dx = e.x - npc.x;
    const dy = e.y - npc.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 20) {
      // Aplicar defesa do NPC
      const damage = ENEMY_DAMAGE * npc.defenseMultiplier;
      npc.life -= damage;
    }
  });
  
  if (npc.attackCooldown > 0) npc.attackCooldown--;
  if (npc.fleeCooldown > 0) npc.fleeCooldown--;
  
  animationManager.updateAnimation(npc);
}

function updateNPCLeader(leader) {
  const currentHour = getCurrentHour();
  
  // Lógica de estados para o líder
  if (currentHour >= 1 && currentHour <= 4) {
    leader.state = 'COMBAT';
  } else if (currentHour >= 4 && currentHour <= 5) {
    leader.state = 'COLLECT';
  } else if (currentHour >= 5 && currentHour <= 6) {
    leader.state = 'RETURN_HOME';
  } else if (currentHour >= 6 || currentHour < 1) {
    leader.state = 'HOME';
  }
  
  switch(leader.state) {
    case 'COMBAT':
      updateLeaderCombat(leader);
      break;
    case 'COLLECT':
      updateLeaderCollect(leader);
      break;
    case 'RETURN_HOME':
      updateLeaderReturnHome(leader);
      break;
    case 'HOME':
      updateLeaderHome(leader);
      break;
  }
}

function updateLeaderCombat(leader) {
  const nearestEnemy = leader.findNearestEnemy();
  
  if (nearestEnemy) {
    const dx = nearestEnemy.x - leader.x;
    const dy = nearestEnemy.y - leader.y;
    const distance = Math.hypot(dx, dy);
    
    // Movimento do líder
    if (distance > 100) {
      moveIntelligently(leader, nearestEnemy.x, nearestEnemy.y);
    } else if (distance < 50) {
      const retreatX = leader.x - (dx / distance) * leader.speed * 0.5;
      const retreatY = leader.y - (dy / distance) * leader.speed * 0.5;
      if (canMove(retreatX, leader.y, leader.size)) leader.x = retreatX;
      if (canMove(leader.x, retreatY, leader.size)) leader.y = retreatY;
      leader.moving = true;
    } else {
      leader.moving = false;
    }
    
    // Ataques especiais
    if (distance < 200 && leader.swordAttackCooldown <= 0) {
      leader.swordAttack();
    }
    
    if (distance < 250 && leader.magicCooldown <= 0) {
      leader.magicAttack(nearestEnemy);
    }
    
    // Ataque normal
    if (distance < 40 && leader.attackCooldown <= 0) {
      const damage = leader.baseDamage * leader.attackMultiplier;
      nearestEnemy.life -= damage;
      leader.attackCooldown = 30;
      leader.isAttacking = true;
      
      if (nearestEnemy.life <= 0 && nearestEnemy.wasAlive) {
        leader.kills++;
        enemiesKilled++;
        nearestEnemy.wasAlive = false;
        dropLoot(nearestEnemy.x, nearestEnemy.y);
        
        leader.increasePower();
      }
    }
  } else {
    leader.moving = false;
  }
  
  // Usar erva se necessário
  leader.useHealHerb();
  
  // Receber dano (com defesa de 80%)
  enemies.forEach(e => {
    if (e.life <= 0) return;
    
    const dx = e.x - leader.x;
    const dy = e.y - leader.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 25) {
      const damage = ENEMY_DAMAGE * leader.defenseMultiplier;
      leader.life -= damage;
    }
  });
  
  // Atualizar cooldowns
  if (leader.magicCooldown > 0) {
    leader.magicCooldown--;
    if (leader.magicCooldown <= 30) leader.isAttacking = false;
  }
  
  if (leader.swordAttackCooldown > 0) {
    leader.swordAttackCooldown--;
  }
  
  if (leader.attackCooldown > 0) leader.attackCooldown--;
  
  animationManager.updateAnimation(leader);
}

function updateNPCCollect(npc) {
  // Coletar ervas primeiro (pelo menos 2)
  if (npc.collectedItems.herbs < npc.healHerbsThreshold) {
    const nearestHerb = npc.findNearestHerb();
    
    if (nearestHerb) {
      collectNPCItem(npc, nearestHerb);
      return;
    }
  }
  
  // Coletar outros itens
  const nearestItem = npc.findNearestItem();
  
  if (nearestItem) {
    collectNPCItem(npc, nearestItem);
  } else {
    npc.moving = false;
  }
}

function collectNPCItem(npc, itemInfo) {
  const dx = itemInfo.item.x - npc.x;
  const dy = itemInfo.item.y - npc.y;
  const distance = Math.hypot(dx, dy);
  
  if (distance < 25) {
    const collectedItem = lootItems[itemInfo.index];
    if (collectedItem && !collectedItem.collected) {
      collectedItem.collected = true;
      
      switch(collectedItem.type) {
        case 'herb':
          npc.collectedItems.herbs++;
          npc.healHerbsCollected++;
          break;
        case 'bullets':
          npc.collectedItems.bullets += collectedItem.quantity || 1;
          break;
        case 'attackSoul':
          npc.collectedItems.attackSouls++;
          break;
        case 'mageSoul':
          npc.collectedItems.mageSouls++;
          break;
      }
      
      lootItems.splice(itemInfo.index, 1);
    }
  } else {
    const moveX = npc.x + (dx / distance) * npc.speed;
    const moveY = npc.y + (dy / distance) * npc.speed;
    
    if (canMove(moveX, npc.y, npc.size)) npc.x = moveX;
    if (canMove(npc.x, moveY, npc.size)) npc.y = moveY;
    
    npc.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      npc.lastDirection = dx > 0 ? 'right' : 'left';
    } else {
      npc.lastDirection = dy > 0 ? 'down' : 'up';
    }
  }
}

function updateNPCReturnHome(npc) {
  const dx = npc.housePosition.x - npc.x;
  const dy = npc.housePosition.y - npc.y;
  const distance = Math.hypot(dx, dy);
  
  if (distance > 10) {
    const moveX = npc.x + (dx / distance) * npc.speed;
    const moveY = npc.y + (dy / distance) * npc.speed;
    
    if (canMove(moveX, npc.y, npc.size)) npc.x = moveX;
    if (canMove(npc.x, moveY, npc.size)) npc.y = moveY;
    
    npc.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      npc.lastDirection = dx > 0 ? 'right' : 'left';
    } else {
      npc.lastDirection = dy > 0 ? 'down' : 'up';
    }
  } else {
    npc.moving = false;
    npc.x = npc.housePosition.x;
    npc.y = npc.housePosition.y;
    
    // Usar erva se a vida estiver baixa
    npc.useHealHerb();
    
    // Depositar itens no baú
    npc.depositItemsToChest();
  }
}

function updateNPCHome(npc) {
  // Ficar em casa (não se move)
  npc.moving = false;
  npc.x = npc.housePosition.x;
  npc.y = npc.housePosition.y;
}

// Funções do líder para coleta, retorno e casa
function updateLeaderCollect(leader) {
  if (leader.collectedItems.herbs < leader.healHerbsThreshold) {
    const nearestHerb = leader.findNearestHerb();
    
    if (nearestHerb) {
      collectLeaderItem(leader, nearestHerb);
      return;
    }
  }
  
  const nearestItem = leader.findNearestItem();
  
  if (nearestItem) {
    collectLeaderItem(leader, nearestItem);
  } else {
    leader.moving = false;
  }
}

function collectLeaderItem(leader, itemInfo) {
  const dx = itemInfo.item.x - leader.x;
  const dy = itemInfo.item.y - leader.y;
  const distance = Math.hypot(dx, dy);
  
  if (distance < 25) {
    const collectedItem = lootItems[itemInfo.index];
    if (collectedItem && !collectedItem.collected) {
      collectedItem.collected = true;
      
      switch(collectedItem.type) {
        case 'herb':
          leader.collectedItems.herbs++;
          leader.healHerbsCollected++;
          break;
        case 'bullets':
          leader.collectedItems.bullets += collectedItem.quantity || 1;
          break;
        case 'attackSoul':
          leader.collectedItems.attackSouls++;
          break;
        case 'mageSoul':
          leader.collectedItems.mageSouls++;
          break;
      }
      
      lootItems.splice(itemInfo.index, 1);
    }
  } else {
    const moveX = leader.x + (dx / distance) * leader.speed;
    const moveY = leader.y + (dy / distance) * leader.speed;
    
    if (canMove(moveX, leader.y, leader.size)) leader.x = moveX;
    if (canMove(leader.x, moveY, leader.size)) leader.y = moveY;
    
    leader.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      leader.lastDirection = dx > 0 ? 'right' : 'left';
    } else {
      leader.lastDirection = dy > 0 ? 'down' : 'up';
    }
  }
}

function updateLeaderReturnHome(leader) {
  const dx = leader.housePosition.x - leader.x;
  const dy = leader.housePosition.y - leader.y;
  const distance = Math.hypot(dx, dy);
  
  if (distance > 10) {
    const moveX = leader.x + (dx / distance) * leader.speed;
    const moveY = leader.y + (dy / distance) * leader.speed;
    
    if (canMove(moveX, leader.y, leader.size)) leader.x = moveX;
    if (canMove(leader.x, moveY, leader.size)) leader.y = moveY;
    
    leader.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      leader.lastDirection = dx > 0 ? 'right' : 'left';
    } else {
      leader.lastDirection = dy > 0 ? 'down' : 'up';
    }
  } else {
    leader.moving = false;
    leader.x = leader.housePosition.x;
    leader.y = leader.housePosition.y;
    
    leader.useHealHerb();
    leader.depositItemsToChest();
  }
}

function updateLeaderHome(leader) {
  leader.moving = false;
  leader.x = leader.housePosition.x;
  leader.y = leader.housePosition.y;
}

// ========== ATUALIZAÇÃO DOS PROJÉTEIS NPC ==========
function updateNPCMagicProjectiles() {
  for (let i = npcMagicProjectiles.length - 1; i >= 0; i--) {
    const proj = npcMagicProjectiles[i];
    
    proj.x += proj.vx;
    proj.y += proj.vy;
    
    // Adicionar rastro para projéteis do líder
    if (proj.owner === 'leader') {
      proj.trail.unshift({x: proj.x, y: proj.y, life: 15});
      if (proj.trail.length > 10) proj.trail.pop();
      
      // Atualizar vida do rastro
      proj.trail.forEach(p => p.life--);
      proj.trail = proj.trail.filter(p => p.life > 0);
      
      // Decrementar vida do projétil se tiver
      if (proj.life) {
        proj.life--;
        if (proj.life <= 0) {
          npcMagicProjectiles.splice(i, 1);
          continue;
        }
      }
    }
    
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const distanceToTarget = Math.hypot(dx, dy);
    
    if (distanceToTarget < 30) {
      const explosionRadius = proj.owner === 'leader' ? 80 : 40;
      
      if (boss && Math.hypot(boss.x - proj.x, boss.y - proj.y) < explosionRadius + boss.size/2) {
        boss.life -= proj.damage;
        if (proj.owner === 'leader') {
          addLog("Líder acertou o BOSS!");
        }
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
            
            // Contar kill para NPCs
            if (proj.owner === 'npc' && proj.npcOwner) {
              proj.npcOwner.kills++;
              proj.npcOwner.increasePower();
            } else if (proj.owner === 'leader' && npcLeader) {
              npcLeader.kills++;
              npcLeader.increasePower();
            }
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

// ========== GAME OVER ==========
function gameOver(){
  gameRunning = false;
  setTimeout(() => {
    const aliveNPCs = npcs.filter(n => n.life > 0).length + (npcLeader && npcLeader.life > 0 ? 1 : 0);
    const totalNPCKills = npcs.reduce((sum, npc) => sum + npc.kills, 0) + (npcLeader ? npcLeader.kills : 0);
    
    alert(`☠️ GAME OVER\n\n📊 Estatísticas:\n🎯 Inimigos derrotados: ${enemiesKilled}\n🌿 Ervas coletadas: ${inventory.herbs}\n🔫 Balas coletadas: ${inventory.bullets}\n👥 Soldados invocados: ${soldiers.length}\n🏃 NPCs vivos: ${aliveNPCs}/11\n⚔️ Kills dos NPCs: ${totalNPCKills}\n👑 Líder NPC Kills: ${npcLeader ? npcLeader.kills : 0}`);
    location.reload();
  }, 100);
}

// ========== CAMERA ==========
const camera = {x: 0, y: 0};
let lastTime = 0;

// ========== INTERFACE DO JOGO ==========
function updateGameUI_impl() {
  // Atualizar valores da UI
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
  const currentHourElement = document.getElementById('currentHour');
  const dayPhaseElement = document.getElementById('dayPhase');
  const bossHealth = document.getElementById('bossHealth');
  const hourValue = document.getElementById('hourValue');
  
  if (lifeValue) lifeValue.textContent = player.life;
  if (ammoValue) ammoValue.textContent = inventory.bullets;
  if (soulsValue) soulsValue.textContent = inventory.attackSouls + inventory.mageSouls;
  if (killedCount) killedCount.textContent = enemiesKilled;
  if (herbsCount) herbsCount.textContent = inventory.herbs;
  if (bulletsCount) bulletsCount.textContent = inventory.bullets;
  if (soldiersCount) soldiersCount.textContent = soldiers.length;
  
  // Contar inimigos vivos
  const aliveEnemies = enemies.filter(e => e.life > 0).length + (boss ? 1 : 0);
  if (enemiesAlive) enemiesAlive.textContent = `${aliveEnemies}/${MAX_ENEMIES}`;
  
  // Contar NPCs vivos
  const aliveNPCs = npcs.filter(n => n.life > 0).length + (npcLeader && npcLeader.life > 0 ? 1 : 0);
  if (npcsAliveElement) npcsAliveElement.textContent = `${aliveNPCs}/${MAX_NPCS}`;
  
  // Atualizar timer de spawn
  if (spawnTimer) {
    const timeLeft = Math.max(0, Math.floor((ENEMY_SPAWN_INTERVAL - enemySpawnTimer) / 1000));
    spawnTimer.textContent = timeLeft;
  }
  
  // Atualizar hora e fase do dia
  const currentHour = getCurrentHour();
  const dayPhase = getDayPhase();
  
  if (currentHourElement) currentHourElement.textContent = currentHour;
  if (dayPhaseElement) dayPhaseElement.textContent = dayPhase === 'day' ? 'Dia' : 'Noite';
  if (hourValue) hourValue.textContent = currentHour;
  
  // Atualizar vida do boss
  if (bossHealth && boss) {
    bossHealth.textContent = `${boss.life}/${boss.maxLife}`;
  } else if (bossHealth) {
    bossHealth.textContent = '0/0';
  }
  
  // Atualizar cor da vida se estiver baixa
  const lifeDisplay = document.querySelector('.life-display');
  if (lifeDisplay) {
    if (player.life <= player.maxLife * 0.3) {
      lifeDisplay.classList.add('low');
    } else {
      lifeDisplay.classList.remove('low');
    }
  }
  
  // Atualizar cor das balas se estiverem baixas
  const ammoDisplay = document.querySelector('.ammo-display');
  if (ammoDisplay) {
    if (inventory.bullets <= 10) {
      ammoDisplay.classList.add('low');
    } else {
      ammoDisplay.classList.remove('low');
    }
  }
}

// ========== LOOP PRINCIPAL DO JOGO ==========
function update(currentTime = 0){
  if(!gameRunning) return;
  
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Atualizar tempo do jogo
  updateGameTime(deltaTime);
  
  // Verificar interação com baús
  checkChestInteraction();
  
  player.updateDirection();
  
  // Verificar hora para spawn de inimigos
  const currentHour = getCurrentHour();
  if (enemySpawnEnabled && currentHour >= 1 && currentHour <= 4) {
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
      const neededNPCs = MAX_NPCS - 1 - currentNPCs;
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
    const moved = moveIntelligently(e, target.x, target.y, true);
    e.moving = moved;
    
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const distance = Math.hypot(dx, dy);
    
    if(Math.abs(dx) > Math.abs(dy)) e.lastDirection = dx > 0 ? 'right' : 'left';
    else e.lastDirection = dy > 0 ? 'down' : 'up';
    
    if(distance < 20 && e.attackCooldown <= 0){
      if (target === player) {
        player.life -= ENEMY_DAMAGE;
      } else if (target.life) {
        target.life -= ENEMY_DAMAGE * (target.defenseMultiplier || 1);
      }
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
  
  // ========== ATUALIZAÇÃO DOS SOLDADOS ==========
  const enemiesAliveCount = areEnemiesAlive();
  const collectedIndexes = [];
  
  soldiers.forEach((s, sIndex) => {
    if (s.life <= 0) {
      s.releaseTarget();
      soldiers.splice(sIndex, 1);
      addLog("Soldado morreu!");
      return;
    }
    
    if (s.collectionCooldown > 0) s.collectionCooldown--;
    
    // COMPORTAMENTO DE COLETA QUANDO NÃO HÁ INIMIGOS
    if (!enemiesAliveCount && lootItems.length > 0 && s.collectionCooldown <= 0) {
      const nearestItem = findNearestItem(s, collectedIndexes);
      
      if (nearestItem) {
        const dx = nearestItem.item.x - s.x;
        const dy = nearestItem.item.y - s.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 25) {
          collectItemByEntity(nearestItem.item, nearestItem.index, 
            s.type === 'mage' ? 'Mago' : 'Soldado');
          collectedIndexes.push(nearestItem.index);
          s.collectionCooldown = 30;
          s.moving = false;
        } else {
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
        
        animationManager.updateAnimation(s);
        return;
      }
    }
    
    // COMPORTAMENTO NORMAL DE COMBATE
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
  
  // ========== ATUALIZAÇÃO DOS NPCS ==========
  updateNPCsByHour();
  
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
  updateGameUI();
  requestAnimationFrame(update);
}

// ========== FUNÇÃO DE DESENHO ==========
function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Fundo baseado na hora do dia
  const currentHour = getCurrentHour();
  if (currentHour >= 1 && currentHour <= 3) {
    // Dia - fundo mais claro
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0 - camera.x, 0 - camera.y, worldW, worldH);
  } else {
    // Noite - fundo mais escuro
    ctx.fillStyle = "#191970";
    ctx.fillRect(0 - camera.x, 0 - camera.y, worldW, worldH);
    
    // Estrelas
    ctx.fillStyle = "white";
    for(let i = 0; i < 50; i++){
      const starX = (i * 73) % worldW - camera.x;
      const starY = (i * 47) % worldH - camera.y;
      ctx.fillRect(starX, starY, 2, 2);
    }
  }
  
  // Desenhar mapa com tiles especiais
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      const tile = map[y][x];
      let color = "#222";
      
      switch(tile){
        case 0: // Chão
          color = "#222";
          break;
        case 1: // Parede
          color = "#555";
          break;
        case 2: // Casa
          color = "#8B4513";
          break;
        case 3: // Porta
          color = "#A52A2A";
          break;
        case 4: // Baú
          color = "#D2691E";
          break;
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x * TILE - camera.x, y * TILE - camera.y, TILE, TILE);
      
      // Bordas dos tiles
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * TILE - camera.x, y * TILE - camera.y, TILE, TILE);
    }
  }
  
  // Desenhar baús
  chests.forEach(chest => {
    const drawX = chest.x - camera.x;
    const drawY = chest.y - camera.y;
    
    if (chestSprite) {
      ctx.drawImage(chestSprite, drawX, drawY, chest.width, chest.height);
    } else {
      ctx.fillStyle = "#D2691E";
      ctx.fillRect(drawX, drawY, chest.width, chest.height);
      
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(drawX + 5, drawY + 5, chest.width - 10, 10);
      ctx.fillRect(drawX + 5, drawY + chest.height - 15, chest.width - 10, 10);
    }
    
    // Indicador de conteúdo
    const totalItems = chest.inventory.herbs + chest.inventory.bullets + 
                      chest.inventory.attackSouls + chest.inventory.mageSouls;
    if (totalItems > 0) {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(drawX + chest.width - 5, drawY + 5, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "black";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(totalItems, drawX + chest.width - 5, drawY + 9);
    }
  });
  
  // Desenhar itens no chão
  lootItems.forEach(item => {
    if (item.collected) return;
    
    const drawX = item.x - camera.x - item.size/2;
    const drawY = item.y - camera.y - item.size/2;
    
    if (item.sprite) {
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
    
    if (iceImageLoaded && iceSprite) {
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
    
    // Desenhar kills do NPC
    if (npc.kills > 0) {
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`K:${npc.kills}`, npc.x - camera.x + npc.size/2, npc.y - camera.y - 15);
    }
  });
  
  // Desenhar projéteis mágicos dos NPCs
  ctx.fillStyle = "magenta";
  ctx.strokeStyle = "white";
  npcMagicProjectiles.forEach(p => {
    if (p.owner === 'leader') return; // Desenhamos os do líder separadamente
    
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
    
    if (iceImageLoaded && iceSprite) {
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
    
    if (enemyImageLoaded && enemySprite) {
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
  
  if (swordSprite) {
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
  
  // Desenhar NPC líder
  if (npcLeader && npcLeader.life > 0) {
    drawLeaderNPC(npcLeader);
  }
  
  // Desenhar projéteis do líder com cores especiais
  npcMagicProjectiles.forEach(p => {
    if (p.owner === 'leader') {
      // Desenhar rastro
      for (let i = 0; i < p.trail.length - 1; i++) {
        const current = p.trail[i];
        const next = p.trail[i + 1];
        
        const alpha = (current.life / 15) * 0.5;
        ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(current.x - camera.x, current.y - camera.y);
        ctx.lineTo(next.x - camera.x, next.y - camera.y);
        ctx.stroke();
      }
      
      // Desenhar projétil
      const gradient = ctx.createRadialGradient(
        p.x - camera.x, p.y - camera.y, 0,
        p.x - camera.x, p.y - camera.y, p.radius
      );
      
      if (p.type === 'sword') {
        gradient.addColorStop(0, '#FFA500');
        gradient.addColorStop(0.5, '#FF8C00');
        gradient.addColorStop(1, 'transparent');
        
        // Desenhar espada
        if (swordSprite) {
          ctx.save();
          ctx.translate(p.x - camera.x, p.y - camera.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.drawImage(swordSprite, -20, -20, 40, 40);
          ctx.restore();
        } else {
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.7, '#FF0000');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Brilho
      ctx.shadowColor = 'orange';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  
  // Desenhar jogador
  const playerSpriteCoords = animationManager.getSpriteCoordinates(player);
  const playerDrawX = player.x - camera.x - (player.drawWidth - player.size)/2;
  const playerDrawY = player.y - camera.y - (player.drawHeight - player.size)/2;
  
  if (iceImageLoaded && iceSprite) {
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
  
  // Desenhar relógio
  drawClock();
}

// ========== DESENHO DO NPC LÍDER ==========
function drawLeaderNPC(leader) {
  if (!leader || leader.life <= 0) return;
  
  const spriteCoords = animationManager.getSpriteCoordinates(leader);
  const drawX = leader.x - camera.x - (leader.drawWidth - leader.size)/2;
  const drawY = leader.y - camera.y - (leader.drawHeight - leader.size)/2;
  
  if (iceImageLoaded && iceSprite) {
    ctx.save();
    // Efeito brilhante para o líder
    ctx.shadowColor = 'orange';
    ctx.shadowBlur = 15;
    ctx.drawImage(
      iceSprite,
      spriteCoords.sx, spriteCoords.sy,
      spriteCoords.frameWidth, spriteCoords.frameHeight,
      drawX, drawY,
      leader.drawWidth, leader.drawHeight
    );
    ctx.restore();
  } else {
    ctx.fillStyle = 'orange';
    ctx.fillRect(leader.x - camera.x, leader.y - camera.y, leader.size, leader.size);
  }
  
  // Barra de vida laranja
  ctx.fillStyle = "black";
  ctx.fillRect(leader.x - camera.x, leader.y - camera.y - 12, leader.size, 6);
  ctx.fillStyle = "orange";
  ctx.fillRect(leader.x - camera.x, leader.y - camera.y - 12, (leader.life/leader.maxLife) * leader.size, 6);
  
  // Indicador de cooldown da espada
  if (leader.swordAttackCooldown > 0) {
    const cooldownPercent = leader.swordAttackCooldown / NPC_LEADER_COOLDOWN;
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
    ctx.fillRect(leader.x - camera.x, leader.y - camera.y - 18, leader.size * (1 - cooldownPercent), 3);
  }
  
  // Indicador de líder
  ctx.fillStyle = 'gold';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('👑', leader.x - camera.x + leader.size/2, leader.y - camera.y - 25);
  
  // Desenhar kills do líder
  ctx.fillStyle = 'white';
  ctx.font = '10px Arial';
  ctx.fillText(`Kills: ${leader.kills}`, leader.x - camera.x + leader.size/2, leader.y - camera.y - 35);
  
  // Desenhar poder do líder
  ctx.fillStyle = '#FFA500';
  ctx.font = '10px Arial';
  ctx.fillText(`Poder: ${Math.round(leader.attackMultiplier * 100)}%`, leader.x - camera.x + leader.size/2, leader.y - camera.y - 45);
}

function drawClock() {
  const currentHour = getCurrentHour();
  const dayPhase = getDayPhase();
  
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(canvas.width - 140, 10, 130, 40);
  
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`🕐 Hora: ${currentHour}`, canvas.width - 130, 30);
  ctx.fillText(`${dayPhase === 'day' ? '☀️ Dia' : '🌙 Noite'}`, canvas.width - 130, 50);
  
  // Barra de progresso do dia
  const progress = (gameTime % DAY_CYCLE) / DAY_CYCLE;
  ctx.fillStyle = "#333";
  ctx.fillRect(canvas.width - 140, 60, 130, 10);
  ctx.fillStyle = dayPhase === 'day' ? "#FFD700" : "#4B0082";
  ctx.fillRect(canvas.width - 140, 60, 130 * progress, 10);
}
