# 코딩 컨벤션

## 파일명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스 파일 | PascalCase.ts | `Player.ts`, `BattleSystem.ts` |
| 인덱스 파일 | index.ts | `entities/index.ts` |
| 테스트 파일 | *.test.ts | `BattleSystem.test.ts` |
| 타입 정의 | types.ts 또는 index.ts | `types/index.ts` |
| 설정 파일 | camelCase.ts | `config.ts` |
| 스크립트 | kebab-case.js | `generate-monster.js` |

## 디렉토리명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 소스 디렉토리 | kebab-case | `src/`, `entities/`, `game-objects/` |
| 에셋 디렉토리 | kebab-case | `public/sprites/`, `public/audio/` |

## 변수명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수 | camelCase | `currentHealth`, `playerPosition` |
| 상수 | UPPER_SNAKE_CASE | `MAX_HEALTH`, `TILE_SIZE` |
| private 필드 | camelCase | `private health: number` |
| 불리언 | is/has/can 접두사 | `isAlive`, `hasItem`, `canMove` |

## 클래스/타입명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스 | PascalCase | `Player`, `BattleSystem` |
| 인터페이스 | PascalCase (I 접두사 없음) | `EntityConfig`, `BattleResult` |
| 타입 별칭 | PascalCase | `Direction`, `GameState` |
| Enum | PascalCase | `Direction.Up`, `GameState.Playing` |

## 함수/메서드명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 함수 | camelCase, 동사로 시작 | `calculateDamage()`, `moveTo()` |
| 이벤트 핸들러 | on/handle 접두사 | `onPlayerDeath()`, `handleInput()` |
| 게터 | get 접두사 또는 명사 | `getHealth()` 또는 `health` |
| 세터 | set 접두사 | `setPosition()` |
| 팩토리 메서드 | create 접두사 | `createMonster()`, `createItem()` |
| 불리언 반환 | is/has/can 접두사 | `isAlive()`, `hasEnoughMana()` |

## 임포트 순서

```typescript
// 1. 외부 라이브러리
import Phaser from 'phaser';

// 2. 내부 타입 (types/)
import { EntityConfig, GameState } from '../types';

// 3. 내부 모듈 (같은 레이어)
import { Player } from './Player';
import { Monster } from './Monster';

// 4. 하위 레이어
import { BattleSystem } from '../systems';
```

## 주석

### 파일 헤더 (선택)
```typescript
/**
 * BattleSystem - 전투 로직을 관리하는 시스템
 *
 * 턴제 전투의 데미지 계산, 스킬 효과, 상태 이상 등을 처리합니다.
 */
```

### JSDoc (public API)
```typescript
/**
 * 데미지를 계산합니다.
 * @param attacker 공격자 엔티티
 * @param defender 방어자 엔티티
 * @returns 계산된 데미지 값 (최소 1)
 */
calculateDamage(attacker: Entity, defender: Entity): number {
```

### 인라인 주석 (복잡한 로직만)
```typescript
// 크리티컬 확률: 민첩성 * 0.5%
const critChance = attacker.agility * 0.005;

// 데미지 = (공격력 - 방어력) * 속성 보정
const damage = (atk - def) * elementModifier;
```

## 타입 정의

### 인터페이스 vs 타입
```typescript
// 인터페이스: 객체 구조 정의
interface EntityConfig {
  x: number;
  y: number;
  texture: string;
}

// 타입: 유니온, 유틸리티 타입
type Direction = 'up' | 'down' | 'left' | 'right';
type Optional<T> = T | null;
```

### Enum 사용
```typescript
// 상수 집합
enum GameState {
  Loading = 'loading',
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

// 사용
if (this.state === GameState.Playing) { }
```

## 에셋 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 스프라이트 | kebab-case | `player-idle.png`, `monster-slime.png` |
| 타일셋 | kebab-case | `dungeon-tiles.png` |
| 오디오 | kebab-case | `bgm-battle.mp3`, `sfx-hit.wav` |
| JSON 데이터 | kebab-case | `dungeon-level1.json` |

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
