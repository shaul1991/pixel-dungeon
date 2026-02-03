# 게임 아키텍처 규칙

## 디렉토리 구조

```
src/
├── main.ts              # 게임 진입점
├── config.ts            # Phaser 설정
├── types/               # 타입 정의
│   └── index.ts
├── entities/            # 게임 엔티티 (GameObject)
│   ├── Player.ts
│   ├── Monster.ts
│   ├── NPC.ts
│   └── index.ts
├── scenes/              # Phaser 씬
│   ├── BootScene.ts
│   ├── PreloadScene.ts
│   ├── MenuScene.ts
│   ├── GameScene.ts
│   ├── BattleScene.ts
│   └── index.ts
├── systems/             # 게임 시스템 (로직)
│   ├── InputController.ts
│   ├── BattleSystem.ts
│   └── index.ts
└── ui/                  # UI 컴포넌트
    ├── HealthBar.ts
    ├── DialogBox.ts
    ├── BattleUI.ts
    └── index.ts
```

## 레이어 책임

### entities/ - 게임 엔티티
```typescript
// 역할: 게임 오브젝트의 상태와 행동 정의
// 의존: Phaser.GameObjects, types/
// 금지: 다른 시스템 직접 호출, 씬 로직

export class Monster extends Phaser.GameObjects.Sprite {
  public health: number;
  public damage: number;

  // 자신의 상태 변경만 담당
  takeDamage(amount: number): void {
    this.health -= amount;
  }

  // 이벤트 발생은 허용
  die(): void {
    this.emit('death', this);
    this.destroy();
  }
}
```

### scenes/ - Phaser 씬
```typescript
// 역할: 씬 라이프사이클, 오브젝트 조합
// 의존: entities/, systems/, ui/
// 금지: 복잡한 게임 로직 (→ systems/로 분리)

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;

  create(): void {
    this.player = new Player(this, 100, 100);
    this.inputController = new InputController(this, this.player);
  }

  update(time: number, delta: number): void {
    this.inputController.update();
    this.player.update(delta);
  }
}
```

### systems/ - 게임 시스템
```typescript
// 역할: 게임 로직, 규칙 구현
// 의존: entities/, types/
// 금지: Phaser 씬 직접 조작, UI 직접 변경

export class BattleSystem {
  calculateDamage(attacker: Entity, defender: Entity): number {
    const baseDamage = attacker.attack - defender.defense;
    const critMultiplier = this.rollCritical() ? 2 : 1;
    return Math.max(1, baseDamage * critMultiplier);
  }

  executeTurn(attacker: Entity, defender: Entity): BattleResult {
    const damage = this.calculateDamage(attacker, defender);
    defender.takeDamage(damage);

    return {
      damage,
      isCritical: damage > attacker.attack,
      defenderDead: defender.health <= 0,
    };
  }
}
```

### ui/ - UI 컴포넌트
```typescript
// 역할: 시각적 표현, 사용자 인터페이스
// 의존: Phaser.GameObjects
// 금지: 게임 로직, 상태 직접 변경

export class HealthBar extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;

  // 값을 받아서 표시만
  setValue(current: number, max: number): void {
    const percent = current / max;
    this.bar.clear();
    this.bar.fillStyle(0x00ff00);
    this.bar.fillRect(0, 0, 100 * percent, 10);
  }
}
```

### types/ - 타입 정의
```typescript
// 역할: 공유 타입, 인터페이스, 상수
// 의존: 없음
// 금지: 런타임 코드

export interface EntityConfig {
  x: number;
  y: number;
  texture: string;
}

export interface BattleResult {
  damage: number;
  isCritical: boolean;
  defenderDead: boolean;
}

export const TILE_SIZE = 16;
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;
```

## 의존성 규칙

```
types/     ← 의존 없음 (최하위)
   ↑
entities/  ← types/
   ↑
systems/   ← entities/, types/
   ↑
ui/        ← types/ (entities는 피함)
   ↑
scenes/    ← 모든 레이어 사용 가능 (최상위)
```

### 의존성 금지 예시
```typescript
// ❌ 순환 의존
// entities/Player.ts
import { GameScene } from '../scenes/GameScene';  // 금지!

// ❌ 하위 레이어가 상위 의존
// systems/BattleSystem.ts
import { BattleScene } from '../scenes/BattleScene';  // 금지!

// ✅ 이벤트/콜백으로 통신
// entities/Player.ts
export class Player {
  die(): void {
    this.emit('player-death');  // 씬에서 구독
  }
}
```

## 씬 흐름

```
BootScene → PreloadScene → MenuScene → GameScene ↔ BattleScene
    │            │             │           │            │
    │            │             │           │            │
  초기화      에셋 로드     메뉴 표시   게임플레이   전투
```

### 씬별 책임
| 씬 | 책임 |
|------|------|
| BootScene | 게임 초기 설정, 로딩 화면 표시 준비 |
| PreloadScene | 모든 에셋 로딩, 로딩 진행률 표시 |
| MenuScene | 메인 메뉴, 게임 시작/설정 |
| GameScene | 던전 탐험, 이동, NPC 상호작용 |
| BattleScene | 턴제 전투, 스킬 사용 |

## 상태 관리

### 전역 상태 (Registry 사용)
```typescript
// 저장
this.registry.set('playerGold', 100);
this.registry.set('playerLevel', 5);

// 읽기
const gold = this.registry.get('playerGold');

// 변경 감지
this.registry.events.on('changedata-playerGold', (parent, value) => {
  this.goldText.setText(`Gold: ${value}`);
});
```

### 씬 간 데이터 전달
```typescript
// 전달
this.scene.start('BattleScene', {
  player: this.player.getData(),
  enemy: this.currentEnemy.getData(),
});

// 수신
init(data: BattleData): void {
  this.playerData = data.player;
  this.enemyData = data.enemy;
}
```

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
