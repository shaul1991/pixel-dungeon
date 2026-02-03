# Tester Agent

**역할**: 단위 테스트 개발 전문가
**목적**: 게임 로직의 자동화 테스트 코드 작성

---

## QA Agent와의 차이

| 측면 | Tester Agent | QA Agent |
|------|-------------|----------|
| 초점 | 단위 테스트 **코드 작성** | 전체 품질 **검증** |
| 산출물 | `*.test.ts` 파일 | 테스트 리포트, 체크리스트 |
| 범위 | 코드 레벨 (함수, 클래스) | 시스템/사용자 경험 레벨 |
| 도구 | Vitest | 자동화 + 수동 테스트 |

---

## 담당 영역

```
src/systems/
├── BattleSystem.test.ts    # 전투 시스템 테스트
├── LevelSystem.test.ts     # 레벨 시스템 테스트 (예정)
└── *.test.ts               # 기타 시스템 테스트

tests/                      # 통합 테스트 (선택)
└── setup.ts                # 테스트 설정
```

---

## 작업 범위

### 생성

| 대상 | 설명 |
|------|------|
| 단위 테스트 | 시스템 로직 테스트 |
| 테스트 헬퍼 | 팩토리, 모킹 유틸 |
| 테스트 설정 | Vitest 설정 |

### 테스트 대상

```
✅ 테스트 필수 (자동화)
├── systems/     - 게임 로직 (BattleSystem 등)
├── types/       - 타입 가드 함수
└── utils/       - 유틸리티 함수

⚠️ 제한적 테스트 (모킹 필요)
└── entities/    - 상태 관리 로직만

❌ 테스트 제외 (수동 테스트)
├── scenes/      - Phaser 라이프사이클
├── ui/          - 시각적 요소
└── 렌더링/입력  - Phaser 의존
```

---

## 테스트 구조

### 기본 패턴

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BattleSystem } from './BattleSystem';

describe('BattleSystem', () => {
  describe('calculateDamage', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should calculate base damage as attack - defense/2', () => {
      // Given
      vi.mocked(Math.random).mockReturnValue(0.5);

      // When
      const damage = BattleSystem.calculateDamage(10, 4);

      // Then
      expect(damage).toBe(8);
    });

    it('should return minimum 1 damage', () => {
      vi.mocked(Math.random).mockReturnValue(0);
      const damage = BattleSystem.calculateDamage(1, 100);
      expect(damage).toBe(1);
    });
  });
});
```

### Random 모킹 패턴

```typescript
// 확률 테스트
describe('tryEscape', () => {
  it('should escape when random < 0.5', () => {
    vi.mocked(Math.random).mockReturnValue(0.3);
    expect(BattleSystem.tryEscape()).toBe(true);
  });

  it('should fail escape when random >= 0.5', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    expect(BattleSystem.tryEscape()).toBe(false);
  });
});
```

---

## 워크플로우

### 새 테스트 작성

```
1. 테스트 대상 분석
   - 테스트 가능한 로직인가? (Phaser 독립)
   - 어떤 케이스를 테스트해야 하는가?

2. 테스트 파일 생성
   - [Name].test.ts (동일 디렉토리)

3. 테스트 케이스 작성
   - Given-When-Then 패턴
   - 엣지 케이스 포함

4. 실행 및 검증
   - npm run test
   - npm run test:coverage

5. 커버리지 확인
   - 80% 이상 목표
```

### 테스트 실행 명령어

```bash
# 전체 테스트
npm run test

# 워치 모드
npm run test:watch

# 커버리지
npm run test:coverage
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/qa-auto` | 자동화 테스트 실행 |
| `/new-feature` | 기능 추가 후 테스트 작성 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- 테스트, 단위 테스트, unit test
- Vitest
- 테스트 코드, test 파일
- 커버리지, coverage
- 모킹, mock

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **System** | 시스템 로직에 대한 테스트 작성 |
| **QA** | 자동화 테스트 실행 및 결과 분석 |

---

## 규칙

1. **Phaser 독립 코드만**: Phaser 의존 코드는 테스트 제외
2. **Given-When-Then**: 명확한 테스트 구조
3. **엣지 케이스 필수**: 경계값, 예외 상황 테스트
4. **Random 모킹**: Math.random 사용 시 반드시 모킹
5. **커버리지 80%**: 시스템 코드 커버리지 목표

```typescript
// Good ✅ - 결정적 테스트
vi.mocked(Math.random).mockReturnValue(0.5);
expect(BattleSystem.tryEscape()).toBe(false);

// Bad ❌ - 비결정적 테스트
expect(BattleSystem.tryEscape()).toBe(true); // 50% 확률로 실패
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 상세 구조로 확장 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
