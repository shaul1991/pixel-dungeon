# TypeScript 규칙

## 버전
- TypeScript 5.9 이상 필수
- ES2022 타겟
- strict 모드 활성화

## 타입 안전성

### 필수 사항
```typescript
// 항상 타입 명시
function damage(amount: number): void { }

// 반환 타입 명시
function getHealth(): number {
  return this.health;
}

// 인터페이스 사용
interface EntityConfig {
  x: number;
  y: number;
  texture: string;
}
```

### 금지 사항
```typescript
// any 사용 금지
function process(data: any) { }  // ❌

// unknown + 타입 가드 사용
function process(data: unknown) {  // ✅
  if (typeof data === 'string') {
    // data is string
  }
}

// 타입 단언 최소화
const player = getEntity() as Player;  // ⚠️ 주의

// 타입 가드 선호
function isPlayer(entity: Entity): entity is Player {
  return entity.type === 'player';
}
```

## 코딩 스타일

### 네이밍
| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스 | PascalCase | `Player`, `BattleSystem` |
| 인터페이스 | PascalCase | `EntityConfig`, `SceneData` |
| 타입 | PascalCase | `Direction`, `GameState` |
| 함수/메서드 | camelCase | `takeDamage()`, `moveToPosition()` |
| 변수 | camelCase | `currentHealth`, `isAlive` |
| 상수 | UPPER_SNAKE_CASE | `MAX_HEALTH`, `TILE_SIZE` |
| Enum | PascalCase | `Direction.Up` |

### 파일 구조
```typescript
// 1. 임포트 (외부 → 내부 순)
import Phaser from 'phaser';
import { EntityConfig } from '../types';
import { Player } from './Player';

// 2. 타입/인터페이스 정의
interface MonsterConfig extends EntityConfig {
  health: number;
  damage: number;
}

// 3. 상수 정의
const DEFAULT_HEALTH = 100;

// 4. 클래스/함수 정의
export class Monster extends Phaser.GameObjects.Sprite {
  // ...
}

// 5. export (클래스가 아닌 경우)
export { Monster };
```

## 클래스 작성

### 프로퍼티 선언
```typescript
class Player extends Phaser.GameObjects.Sprite {
  // 가시성 명시
  private health: number;
  protected speed: number;
  public readonly name: string;

  // 초기화 필수
  private inventory: Item[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    this.health = 100;
    this.speed = 100;
    this.name = 'Hero';
  }
}
```

### 메서드 순서
```typescript
class Entity {
  // 1. static 메서드
  static create(): Entity { }

  // 2. 생성자
  constructor() { }

  // 3. public 메서드
  public update(): void { }

  // 4. protected 메서드
  protected onDamage(): void { }

  // 5. private 메서드
  private calculateDamage(): number { }
}
```

## 에러 처리

```typescript
// 커스텀 에러 클래스
class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

// 에러 던지기
function loadScene(name: string): Phaser.Scene {
  const scene = this.scenes.get(name);
  if (!scene) {
    throw new GameError(`Scene not found: ${name}`, 'SCENE_NOT_FOUND');
  }
  return scene;
}
```

## 비동기 처리

```typescript
// async/await 선호
async function loadAssets(): Promise<void> {
  await this.load.image('player', 'assets/player.png');
  await this.load.audio('bgm', 'assets/bgm.mp3');
}

// Promise 체이닝 시
this.load
  .image('player', 'assets/player.png')
  .then(() => this.createPlayer())
  .catch((error) => console.error('Failed to load:', error));
```

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
