# QA 패턴

게임 테스트에 특화된 QA 패턴과 전략입니다.

---

## 게임 테스트 피라미드

```
         /\
        /  \        E2E / 수동 시나리오 (10%)
       /    \       - 전체 게임 플로우
      /------\      - 사용자 경험
     /        \
    /----------\    통합 테스트 (20%)
   /            \   - 시스템 간 상호작용
  /              \  - Entity + System
 /----------------\ 단위 테스트 (70%)
                    - BattleSystem
                    - 순수 로직 함수
```

### 각 레벨의 역할

| 레벨 | 대상 | 도구 | 비율 |
|------|------|------|------|
| 단위 | systems/, types/ | Vitest | 70% |
| 통합 | entities + systems | Vitest + Mock | 20% |
| E2E | 전체 게임 | 수동/Playwright | 10% |

---

## Phaser 특화 테스트 전략

### 테스트 가능 영역

```
✅ 쉽게 테스트 가능 (자동화)
├── systems/ - 순수 로직
│   ├── BattleSystem.calculateDamage()
│   ├── BattleSystem.tryEscape()
│   └── BattleSystem.calculateRewards()
├── types/ - 타입 가드
│   ├── isPlayer()
│   └── isMonster()
└── utils/ - 유틸리티 함수
    ├── calculateDistance()
    └── randomRange()

⚠️ 모킹 필요 (제한적 자동화)
├── entities/ - Phaser 의존
│   ├── Player 상태 관리
│   └── Monster 행동
└── 씬 전환 데이터

❌ 수동 테스트 권장
├── scenes/ - 라이프사이클
├── ui/ - 시각적 표현
├── 애니메이션 - 타이밍
└── 입력 처리 - 키보드/마우스
```

### Phaser 모킹 패턴

```typescript
// 최소 Phaser Scene 모킹
const createMockScene = () => ({
  add: {
    sprite: vi.fn().mockReturnValue({
      setPosition: vi.fn(),
      setTexture: vi.fn(),
      play: vi.fn(),
      on: vi.fn(),
    }),
    text: vi.fn().mockReturnValue({
      setText: vi.fn(),
    }),
  },
  physics: {
    add: {
      existing: vi.fn(),
      sprite: vi.fn(),
    },
  },
  time: {
    delayedCall: vi.fn(),
  },
});

// 테스트에서 사용
it('should create player at position', () => {
  const mockScene = createMockScene();
  new Player(mockScene as any, 100, 200);

  expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'player');
});
```

---

## Random 모킹 패턴

게임 로직에서 Math.random() 사용 시 결정적 테스트를 위한 모킹:

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('BattleSystem', () => {
  beforeEach(() => {
    // Math.random 스파이
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    // 원래 구현 복원
    vi.restoreAllMocks();
  });

  it('should escape when random < 0.5', () => {
    // 특정 값 반환하도록 설정
    vi.mocked(Math.random).mockReturnValue(0.3);

    expect(BattleSystem.tryEscape()).toBe(true);
  });

  it('should fail escape when random >= 0.5', () => {
    vi.mocked(Math.random).mockReturnValue(0.7);

    expect(BattleSystem.tryEscape()).toBe(false);
  });

  it('should test boundary at exactly 0.5', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);

    expect(BattleSystem.tryEscape()).toBe(false);
  });
});
```

### Random 범위 테스트

```typescript
it('should return damage in valid range', () => {
  const results: number[] = [];

  // 여러 값 테스트
  [0.0, 0.25, 0.5, 0.75, 0.99].forEach((randomValue) => {
    vi.mocked(Math.random).mockReturnValue(randomValue);
    results.push(BattleSystem.calculateDamage(10, 4));
  });

  // 모든 결과가 예상 범위 내
  results.forEach((damage) => {
    expect(damage).toBeGreaterThanOrEqual(6);  // 10 - 2 - 2
    expect(damage).toBeLessThanOrEqual(10);    // 10 - 2 + 2
  });
});
```

---

## 테스트 데이터 팩토리

```typescript
// tests/factories/monster.ts
import type { MonsterConfig } from '../../src/entities/Monster';

export function createMonster(overrides: Partial<MonsterConfig> = {}): MonsterConfig {
  return {
    id: 'test-monster',
    name: 'Test Monster',
    hp: 100,
    attack: 10,
    defense: 5,
    exp: 20,
    gold: 10,
    ...overrides,
  };
}

// 테스트에서 사용
it('should calculate rewards from monster', () => {
  const monster = createMonster({ exp: 50, gold: 25 });

  const rewards = BattleSystem.calculateRewards(monster);

  expect(rewards.exp).toBe(50);
  expect(rewards.gold).toBe(25);
});
```

---

## 성능 테스트 가이드

### 수동 성능 체크리스트

```markdown
## 성능 테스트 (Chrome DevTools)

### FPS 확인
1. 개발자 도구 → Performance 탭
2. Record 시작
3. 30초간 게임 플레이
4. Record 중지 후 분석

**Pass 기준**: 평균 60 FPS, 최소 30 FPS 이상

### 메모리 누수 확인
1. 개발자 도구 → Memory 탭
2. Heap snapshot 촬영
3. 5분간 게임 플레이
4. Heap snapshot 재촬영
5. 비교

**Pass 기준**: 메모리 증가 < 10MB

### 확인 항목
- [ ] 씬 전환 시 메모리 해제
- [ ] 전투 반복 시 메모리 안정
- [ ] 이동 반복 시 FPS 안정
```

---

## 시나리오 기반 테스트

### 해피 패스 (Happy Path)

```
1. 게임 시작
2. 마을 탐험
3. NPC와 대화
4. 몬스터 조우
5. 전투 승리
6. 보상 획득
7. 계속 플레이
```

### 에지 케이스

| 시나리오 | 테스트 포인트 |
|----------|--------------|
| 첫 턴에 도망 | 전투 시작 즉시 Run |
| 연속 도망 실패 | 5회 연속 도망 실패 |
| HP 1에서 승리 | 극적인 승리 |
| 오버킬 | 남은 HP보다 큰 데미지 |
| 동시 사망 | 둘 다 HP 0 (이론적) |

### 스트레스 테스트

```markdown
## 스트레스 테스트

### 연속 전투
- 10회 연속 전투 진입/종료
- 메모리 누수 확인
- FPS 안정성 확인

### 연속 대화
- NPC 대화 20회 반복
- 대화창 정상 동작 확인

### 장시간 플레이
- 30분 연속 플레이
- 성능 저하 없음 확인
```

---

## 리그레션 테스트 매트릭스

### 변경 영역별 테스트 범위

| 변경 영역 | 필수 테스트 | 권장 테스트 |
|----------|------------|------------|
| entities/ | 해당 엔티티 | 전투, 이동 |
| systems/ | 단위 테스트 | 전투 시나리오 |
| scenes/ | 씬 전환 | 전체 플로우 |
| ui/ | UI 테스트 | 전투, 대화 |
| config | 스모크 | 전체 |

### 코드 변경 크기별 테스트

| 변경 크기 | 권장 테스트 |
|----------|------------|
| 1-10줄 | 관련 단위 테스트 |
| 11-50줄 | + 스모크 테스트 |
| 51-200줄 | + 영역 테스트 |
| 200줄+ | + 전체 테스트 |

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 작성 | @claude |
