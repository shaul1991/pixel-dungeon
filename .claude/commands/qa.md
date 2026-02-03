# /qa 명령어

전체 QA 사이클을 실행합니다.

---

## 실행 순서

### 1. 자동화 테스트

```bash
# 단위 테스트
npm run test

# 타입 체크
npx tsc --noEmit

# 빌드
npm run build
```

### 2. 결과 리포트

자동화 테스트 결과를 요약합니다:

| 항목 | 명령어 | 기대 결과 |
|------|--------|----------|
| 단위 테스트 | `npm run test` | All tests pass |
| 타입 체크 | `tsc --noEmit` | 0 errors |
| 빌드 | `npm run build` | Build success |

### 3. 수동 테스트 안내

자동화 테스트 통과 후, 상황에 맞는 수동 테스트를 안내합니다:

**빠른 확인 (권장)**:
```
.claude/qa/scenarios/smoke.md (5분)
```

**상세 테스트**:
```
.claude/qa/scenarios/full.md (30분)
```

---

## 출력 형식

```markdown
# QA 결과 리포트

## 자동화 테스트

| 항목 | 결과 | 상세 |
|------|------|------|
| 단위 테스트 | ✅/❌ | X/Y passed |
| 타입 체크 | ✅/❌ | X errors |
| 빌드 | ✅/❌ | - |

## 수동 테스트 안내

권장 시나리오: smoke.md

체크리스트:
1. [ ] 게임 시작
2. [ ] 플레이어 이동
3. [ ] NPC 대화
4. [ ] 전투 진입/종료

**시작**: `make dev` 실행 후 http://localhost:5173
```

---

## 사용 예시

```
/qa
```

또는

```
전체 QA 사이클 실행해줘
```

---

## 관련 명령어

- `/qa-auto` - 자동화 테스트만
- `/qa-manual` - 수동 체크리스트만
- `/qa-scenario [name]` - 특정 시나리오
