# 테스트 규칙

## 테스트 전략

### 테스트 레벨
| 레벨 | 대상 | 도구 | 우선순위 |
|------|------|------|----------|
| 단위 테스트 | systems/, types/ | Vitest | 높음 |
| 통합 테스트 | entities/ + systems/ | Vitest | 중간 |
| E2E 테스트 | 전체 게임 플로우 | Playwright | 낮음 |

### 테스트 대상 선정
```
✅ 테스트 필수
- 게임 로직 (systems/): BattleSystem, 데미지 계산
- 유틸리티 함수: 좌표 계산, 충돌 감지 헬퍼
- 타입 가드: isPlayer(), isMonster()

⚠️ 테스트 권장
- 엔티티 상태 변경: takeDamage(), heal()
- 게임 규칙: 레벨업, 아이템 획득

❌ 테스트 제외 (Phaser 의존)
- 씬 라이프사이클: create(), update()
- 렌더링: 스프라이트 표시, 애니메이션
- 입력 처리: 키보드, 마우스 이벤트
```

## Vitest 설정

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/scenes/**', 'src/ui/**'],  // Phaser 의존 제외
    },
  },
});
```

### package.json 스크립트
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 테스트 작성

### 단위 테스트 예시
```typescript
// src/systems/BattleSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from './BattleSystem';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;

  beforeEach(() => {
    battleSystem = new BattleSystem();
  });

  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const attacker = { attack: 10, defense: 0 };
      const defender = { attack: 0, defense: 3 };

      const damage = battleSystem.calculateDamage(attacker, defender);

      expect(damage).toBe(7);  // 10 - 3
    });

    it('should return minimum 1 damage', () => {
      const attacker = { attack: 5, defense: 0 };
      const defender = { attack: 0, defense: 100 };

      const damage = battleSystem.calculateDamage(attacker, defender);

      expect(damage).toBe(1);  // 최소 데미지
    });
  });
});
```

### 목(Mock) 사용
```typescript
// Phaser 객체 모킹
import { vi } from 'vitest';

// 간단한 모의 객체
const mockScene = {
  add: {
    sprite: vi.fn().mockReturnValue({
      setPosition: vi.fn(),
      play: vi.fn(),
    }),
  },
  physics: {
    add: {
      existing: vi.fn(),
    },
  },
};

// 테스트에서 사용
it('should create sprite at correct position', () => {
  new Player(mockScene as any, 100, 200);

  expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'player');
});
```

## 테스트 패턴

### Given-When-Then
```typescript
describe('Player.takeDamage', () => {
  it('should reduce health when taking damage', () => {
    // Given: 100 체력의 플레이어
    const player = createPlayer({ health: 100 });

    // When: 30 데미지를 받음
    player.takeDamage(30);

    // Then: 체력이 70이 됨
    expect(player.health).toBe(70);
  });
});
```

### 엣지 케이스 테스트
```typescript
describe('BattleSystem edge cases', () => {
  it('should handle zero attack', () => {
    const damage = battleSystem.calculateDamage(
      { attack: 0 },
      { defense: 5 }
    );
    expect(damage).toBe(1);  // 최소 데미지
  });

  it('should handle negative defense', () => {
    const damage = battleSystem.calculateDamage(
      { attack: 10 },
      { defense: -5 }
    );
    expect(damage).toBe(15);  // 10 - (-5) = 15
  });
});
```

## 수동 테스트 체크리스트

게임 특성상 수동 테스트도 필요합니다:

### 게임플레이 테스트
- [ ] 플레이어 이동 (상하좌우)
- [ ] 충돌 감지 (벽, 몬스터)
- [ ] 전투 진입/종료
- [ ] UI 표시 (체력바, 대화창)

### 씬 전환 테스트
- [ ] 메뉴 → 게임 전환
- [ ] 게임 → 전투 전환
- [ ] 전투 → 게임 복귀
- [ ] 게임오버 처리

### 성능 테스트
- [ ] 60 FPS 유지 확인
- [ ] 메모리 누수 체크 (Chrome DevTools)
- [ ] 다수 오브젝트 처리

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
