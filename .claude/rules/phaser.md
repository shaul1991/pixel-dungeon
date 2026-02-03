# Phaser 3 규칙

## 씬 (Scene) 구조

### 씬 라이프사이클
```typescript
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // 1. 씬 데이터 초기화 (씬 시작 시 데이터 전달받음)
  init(data: SceneData): void {
    this.playerData = data.player;
  }

  // 2. 에셋 로딩 (PreloadScene에서 주로 처리)
  preload(): void {
    // 이 씬에서만 필요한 에셋 로드
  }

  // 3. 게임 오브젝트 생성
  create(): void {
    this.createPlayer();
    this.createEnemies();
    this.setupInput();
  }

  // 4. 게임 루프 (매 프레임 호출)
  update(time: number, delta: number): void {
    this.player.update(delta);
    this.enemies.forEach(e => e.update(delta));
  }
}
```

### 씬 전환
```typescript
// 씬 시작 (현재 씬 종료)
this.scene.start('BattleScene', { enemy: this.currentEnemy });

// 씬 일시정지 후 다른 씬 시작
this.scene.pause();
this.scene.launch('PauseMenu');

// 씬 재개
this.scene.resume('GameScene');

// 씬 정지 및 제거
this.scene.stop('BattleScene');
```

## 게임 오브젝트

### Sprite 생성
```typescript
// 기본 스프라이트
const player = this.add.sprite(100, 100, 'player');

// 물리 적용 스프라이트
const player = this.physics.add.sprite(100, 100, 'player');
player.setCollideWorldBounds(true);
player.body.setSize(16, 16);  // 충돌 박스 크기
```

### 커스텀 게임 오브젝트
```typescript
export class Player extends Phaser.GameObjects.Sprite {
  private health: number = 100;
  private speed: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // 씬에 추가
    scene.add.existing(this);

    // 물리 엔진 활성화
    scene.physics.add.existing(this);

    // 물리 설정
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  update(delta: number): void {
    // 프레임별 업데이트 로직
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }
}
```

## 입력 처리

### 키보드 입력
```typescript
// cursors 사용 (권장)
private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

create(): void {
  this.cursors = this.input.keyboard!.createCursorKeys();
}

update(): void {
  if (this.cursors.left.isDown) {
    this.player.moveLeft();
  } else if (this.cursors.right.isDown) {
    this.player.moveRight();
  }

  // JustDown: 한 번만 감지
  if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
    this.player.attack();
  }
}
```

### 터치/마우스 입력
```typescript
create(): void {
  // 클릭/터치 이벤트
  this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    this.player.moveTo(pointer.x, pointer.y);
  });

  // 게임 오브젝트에 인터랙티브 추가
  this.enemy.setInteractive();
  this.enemy.on('pointerdown', () => {
    this.attackEnemy(this.enemy);
  });
}
```

## 물리 엔진 (Arcade)

### 충돌 감지
```typescript
create(): void {
  // 충돌 (둘 다 멈춤)
  this.physics.add.collider(this.player, this.walls);

  // 오버랩 (통과하면서 감지)
  this.physics.add.overlap(
    this.player,
    this.items,
    this.collectItem,
    undefined,
    this
  );
}

private collectItem(
  player: Phaser.GameObjects.GameObject,
  item: Phaser.GameObjects.GameObject
): void {
  (item as Item).collect();
}
```

### 그룹 사용
```typescript
// 그룹 생성
this.enemies = this.physics.add.group({
  classType: Monster,
  runChildUpdate: true,  // 자식들의 update() 자동 호출
});

// 그룹에 추가
this.enemies.add(new Monster(this, 200, 200));

// 그룹과 충돌
this.physics.add.collider(this.player, this.enemies, this.onEnemyHit);
```

## 애니메이션

### 애니메이션 정의
```typescript
// PreloadScene에서 정의
create(): void {
  this.anims.create({
    key: 'player-walk',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,  // 무한 반복
  });

  this.anims.create({
    key: 'player-attack',
    frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
    frameRate: 15,
    repeat: 0,  // 한 번만
  });
}
```

### 애니메이션 재생
```typescript
// 애니메이션 시작
this.player.play('player-walk');

// 애니메이션 완료 콜백
this.player.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
  if (anim.key === 'player-attack') {
    this.player.play('player-idle');
  }
});
```

## 타일맵

### 타일맵 로드 및 생성
```typescript
preload(): void {
  this.load.image('tiles', 'assets/tileset.png');
  this.load.tilemapTiledJSON('dungeon', 'assets/dungeon.json');
}

create(): void {
  const map = this.make.tilemap({ key: 'dungeon' });
  const tileset = map.addTilesetImage('dungeon-tiles', 'tiles');

  // 레이어 생성
  const groundLayer = map.createLayer('Ground', tileset!, 0, 0);
  const wallsLayer = map.createLayer('Walls', tileset!, 0, 0);

  // 충돌 설정
  wallsLayer?.setCollisionByProperty({ collides: true });
  this.physics.add.collider(this.player, wallsLayer!);
}
```

## 금지 사항

```typescript
// ❌ update()에서 새 오브젝트 생성
update(): void {
  const bullet = new Bullet(this, x, y);  // 매 프레임 생성 - 메모리 누수!
}

// ✅ 오브젝트 풀 사용
this.bulletPool = this.physics.add.group({
  classType: Bullet,
  maxSize: 10,
  runChildUpdate: true,
});

// ❌ 하드코딩된 매직 넘버
this.player.x += 5;  // 5가 뭔가?

// ✅ 상수 사용
const PLAYER_SPEED = 5;
this.player.x += PLAYER_SPEED;

// ❌ 직접 좌표 조작 (물리 사용 시)
this.player.x = 100;

// ✅ 물리 엔진 사용
this.player.body.setVelocityX(100);
```

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
