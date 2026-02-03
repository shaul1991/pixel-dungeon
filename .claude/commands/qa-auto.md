# /qa-auto 명령어

자동화 테스트만 실행합니다.

---

## 실행 순서

### 1. 단위 테스트 (Vitest)

```bash
npm run test
```

**예상 출력**:
```
✓ src/systems/BattleSystem.test.ts (10 tests)

Test Files  1 passed (1)
     Tests  10 passed (10)
```

### 2. 타입 체크 (TypeScript)

```bash
npx tsc --noEmit
```

**성공 시**: 출력 없음 (exit code 0)
**실패 시**: 에러 목록 표시

### 3. 빌드 (Vite)

```bash
npm run build
```

**예상 출력**:
```
vite v7.x.x building for production...
✓ X modules transformed.
dist/index.html   X.XX kB
dist/assets/...
```

---

## 출력 형식

```markdown
# 자동화 테스트 결과

## 단위 테스트

```
✓ src/systems/BattleSystem.test.ts (10 tests)
Test Files  1 passed (1)
     Tests  10 passed (10)
```

**결과**: ✅ Pass

## 타입 체크

**결과**: ✅ Pass (0 errors)

## 빌드

**결과**: ✅ Pass

---

## 총 결과: ✅ 모든 자동화 테스트 통과
```

---

## 실패 시 출력

```markdown
# 자동화 테스트 결과

## 단위 테스트

**결과**: ❌ Fail

```
FAIL src/systems/BattleSystem.test.ts
  ✕ should calculate damage correctly
```

**수정 필요**: src/systems/BattleSystem.ts

---

## 총 결과: ❌ 실패 - 수정 후 재실행 필요
```

---

## Makefile 사용

```bash
make qa-auto
```

---

## 관련 명령어

- `/qa` - 전체 QA 사이클
- `/qa-manual` - 수동 체크리스트
