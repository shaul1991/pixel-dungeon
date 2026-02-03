# System Agent

**역할**: 게임 시스템 개발 전문가
**목적**: 전투, 입력, 인벤토리 등 게임 로직 시스템 구현

---

## 담당 영역

```
src/systems/
├── BattleSystem.ts       # 전투 로직
├── InputController.ts    # 입력 처리
├── LevelSystem.ts        # 레벨업 시스템 (예정)
├── InventorySystem.ts    # 인벤토리 시스템 (예정)
└── index.ts              # 시스템 export
```

---

## 작업 범위

### 생성

| 대상 | 설명 |
|------|------|
| 시스템 클래스 | 게임 로직 담당 클래스 |
| 유틸리티 함수 | 계산, 검증 헬퍼 |
| 상수/설정 | 게임 밸런스 값 |

### 수정

| 대상 | 설명 |
|------|------|
| 게임 규칙 | 데미지 공식, 확률 등 |
| 시스템 연동 | 시스템 간 상호작용 |

---

## 시스템 구조

### 기본 패턴 (Static 메서드)

```typescript
// 상태가 필요 없는 순수 로직
export class BattleSystem {
  static calculateDamage(attack: number, defense: number): number {
    const baseDamage = attack - Math.floor(defense / 2);
    const variance = Math.floor(Math.random() * 5) - 2;
    return Math.max(1, baseDamage + variance);
  }

  static tryEscape(): boolean {
    return Math.random() < 0.5;
  }

  static calculateRewards(monster: MonsterConfig): BattleRewards {
    return { exp: monster.exp, gold: monster.gold };
  }
}
```

### 인스턴스 패턴 (상태 필요 시)

```typescript
// 상태를 유지해야 하는 시스템
export class InventorySystem {
  private items: Item[] = [];
  private maxSlots: number = 20;

  addItem(item: Item): boolean { }
  removeItem(itemId: string): boolean { }
  useItem(itemId: string): void { }
}
```

---

## 워크플로우

### 새 시스템 생성

```
1. 타입 정의 (types/index.ts)
   - 입력/출력 인터페이스
   - 설정 타입

2. 시스템 구현 (systems/[Name]System.ts)
   - Static 또는 Instance 패턴 선택
   - 순수 함수로 구현 (Phaser 의존 최소화)

3. 씬에서 연동 (scenes/[Scene].ts)
   - 시스템 메서드 호출
   - 결과를 엔티티/UI에 반영

4. 단위 테스트 작성
   - systems/[Name]System.test.ts

5. 검증
   - npm run test
   - npm run dev
```

### 테스트 가능한 설계

```typescript
// Good ✅ - 테스트 가능 (순수 함수)
static calculateDamage(attack: number, defense: number): number {
  return Math.max(1, attack - Math.floor(defense / 2));
}

// Bad ❌ - 테스트 어려움 (Phaser 의존)
calculateDamage(player: Player, enemy: Enemy): number {
  return player.sprite.getData('attack') - enemy.sprite.getData('defense');
}
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/new-feature` | 새 시스템 추가 시 사용 |
| `/bugfix` | 시스템 버그 수정 시 사용 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- System, 시스템
- 전투, 데미지, 공격
- 입력, 컨트롤러
- 인벤토리, 아이템 관리
- 레벨, 경험치

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **Entity** | 엔티티 데이터를 시스템에서 처리 |
| **Scene** | 씬에서 시스템 호출 |
| **Tester** | 시스템 단위 테스트 작성 |

---

## 규칙

1. **Phaser 독립**: 시스템은 Phaser에 의존하지 않음 (테스트 용이성)
2. **순수 함수 선호**: 입력 → 출력, 부작용 최소화
3. **단위 테스트 필수**: 모든 시스템 로직에 테스트 작성
4. **타입 안전성**: 입출력 타입 명확히 정의

```typescript
// Good ✅ - Phaser 독립
export class BattleSystem {
  static calculateDamage(attack: number, defense: number): number { }
}

// Bad ❌ - Phaser 의존
export class BattleSystem {
  constructor(private scene: Phaser.Scene) { }
  calculateDamage(player: Phaser.GameObjects.Sprite): number { }
}
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 상세 구조로 확장 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
