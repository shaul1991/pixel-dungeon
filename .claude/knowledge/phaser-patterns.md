# Phaser 패턴

## 씬 관리 패턴

### 씬 전환 데이터 전달
```typescript
// 전달 측 (GameScene)
this.scene.start('BattleScene', {
  player: this.player.serialize(),
  enemy: this.currentEnemy.serialize(),
  returnScene: 'GameScene',
});

// 수신 측 (BattleScene)
interface BattleSceneData {
  player: PlayerData;
  enemy: EnemyData;
  returnScene: string;
}

init(data: BattleSceneData): void {
  this.playerData = data.player;
  this.enemyData = data.enemy;
  this.returnScene = data.returnScene;
}
```

### 씬 병렬 실행 (UI 오버레이)
```typescript
// 게임 씬 위에 UI 씬 실행
this.scene.launch('HUDScene');

// UI 씬에서 게임 씬 이벤트 수신
this.scene.get('GameScene').events.on('player-damaged', (health: number) => {
  this.healthBar.setValue(health);
});

// 정리
this.scene.get('GameScene').events.off('player-damaged');
```

## 오브젝트 풀 패턴

### 총알/이펙트 재사용
```typescript
class BulletPool {
  private pool: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.pool = scene.physics.add.group({
      classType: Bullet,
      maxSize: 20,
      runChildUpdate: true,
    });

    // 미리 생성
    this.pool.createMultiple({
      key: 'bullet',
      quantity: 20,
      active: false,
      visible: false,
    });
  }

  fire(x: number, y: number, direction: Direction): Bullet | null {
    const bullet = this.pool.getFirstDead(false) as Bullet;
    if (bullet) {
      bullet.fire(x, y, direction);
    }
    return bullet;
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  fire(x: number, y: number, direction: Direction): void {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(/* direction에 따라 */);
  }

  // 화면 밖으로 나가면 비활성화
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.y < 0 || this.y > 320) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
```

## 이벤트 버스 패턴

### 전역 이벤트 관리
```typescript
// 이벤트 버스 (Registry 활용)
class EventBus {
  private emitter: Phaser.Events.EventEmitter;

  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  emit(event: string, ...args: unknown[]): void {
    this.emitter.emit(event, ...args);
  }

  on(event: string, callback: Function, context?: object): void {
    this.emitter.on(event, callback, context);
  }

  off(event: string, callback?: Function, context?: object): void {
    this.emitter.off(event, callback, context);
  }
}

// 사용
// BootScene에서 초기화
this.registry.set('eventBus', new EventBus());

// GameScene에서 이벤트 발생
const eventBus = this.registry.get('eventBus') as EventBus;
eventBus.emit('gold-collected', 100);

// HUDScene에서 이벤트 수신
eventBus.on('gold-collected', (amount: number) => {
  this.goldText.setText(`Gold: ${amount}`);
});
```

## 상태 머신 패턴

### 엔티티 상태 관리
```typescript
enum PlayerState {
  Idle = 'idle',
  Walking = 'walking',
  Attacking = 'attacking',
  Hurt = 'hurt',
  Dead = 'dead',
}

class Player extends Phaser.GameObjects.Sprite {
  private state: PlayerState = PlayerState.Idle;

  setState(newState: PlayerState): void {
    if (this.state === newState) return;

    // 이전 상태 종료 처리
    this.exitState(this.state);

    // 새 상태 진입 처리
    this.state = newState;
    this.enterState(newState);
  }

  private enterState(state: PlayerState): void {
    switch (state) {
      case PlayerState.Idle:
        this.play('player-idle');
        break;
      case PlayerState.Walking:
        this.play('player-walk');
        break;
      case PlayerState.Attacking:
        this.play('player-attack');
        this.once('animationcomplete', () => {
          this.setState(PlayerState.Idle);
        });
        break;
      case PlayerState.Hurt:
        this.play('player-hurt');
        this.scene.time.delayedCall(500, () => {
          this.setState(PlayerState.Idle);
        });
        break;
      case PlayerState.Dead:
        this.play('player-death');
        this.emit('death');
        break;
    }
  }

  private exitState(state: PlayerState): void {
    // 상태 종료 시 정리 작업
  }
}
```

## 컴포넌트 패턴

### 기능 분리
```typescript
// 체력 컴포넌트
class HealthComponent {
  private current: number;
  private max: number;

  constructor(max: number) {
    this.max = max;
    this.current = max;
  }

  takeDamage(amount: number): boolean {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0;  // 사망 여부
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  get percent(): number {
    return this.current / this.max;
  }
}

// 이동 컴포넌트
class MovementComponent {
  constructor(
    private sprite: Phaser.GameObjects.Sprite,
    private speed: number
  ) {}

  moveToward(target: Phaser.Math.Vector2): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      target.x, target.y
    );
    body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  stop(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}

// 엔티티에서 사용
class Monster extends Phaser.GameObjects.Sprite {
  public health: HealthComponent;
  public movement: MovementComponent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'monster');
    this.health = new HealthComponent(50);
    this.movement = new MovementComponent(this, 50);
  }
}
```

## 타일맵 충돌 패턴

### 레이어별 충돌 설정
```typescript
create(): void {
  const map = this.make.tilemap({ key: 'dungeon' });
  const tileset = map.addTilesetImage('dungeon-tiles', 'tiles')!;

  // 바닥 레이어 (충돌 없음)
  const groundLayer = map.createLayer('Ground', tileset, 0, 0)!;

  // 벽 레이어 (충돌)
  const wallsLayer = map.createLayer('Walls', tileset, 0, 0)!;
  wallsLayer.setCollisionByProperty({ collides: true });

  // 상호작용 레이어 (오버랩)
  const interactLayer = map.createLayer('Interactive', tileset, 0, 0)!;

  // 플레이어와 충돌
  this.physics.add.collider(this.player, wallsLayer);

  // 상호작용 오브젝트와 오버랩
  this.physics.add.overlap(
    this.player,
    interactLayer,
    this.onInteract,
    this.canInteract,
    this
  );
}

canInteract(player: Player, tile: Phaser.Tilemaps.Tile): boolean {
  return tile.properties.interactable === true;
}

onInteract(player: Player, tile: Phaser.Tilemaps.Tile): void {
  if (tile.properties.type === 'chest') {
    this.openChest(tile);
  }
}
```

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
