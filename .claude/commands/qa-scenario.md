# /qa-scenario 명령어

특정 시나리오의 상세 테스트를 실행합니다.

---

## 사용법

```
/qa-scenario [scenario-name]
```

### 사용 가능한 시나리오

#### 기본 시나리오 (scenarios/)

| 이름 | 파일 | 설명 |
|------|------|------|
| `smoke` | smoke.md | 스모크 테스트 |
| `battle` | battle.md | 전투 시나리오 |
| `exploration` | exploration.md | 탐험 시나리오 |
| `ui` | ui.md | UI 테스트 |
| `regression` | regression.md | 회귀 테스트 |
| `full` | full.md | 전체 테스트 |

#### 상세 시나리오 (scenarios/detailed/)

| 이름 | 파일 | 설명 |
|------|------|------|
| `new-game` | new-game.md | 새 게임 시작 |
| `first-battle` | first-battle.md | 첫 전투 |
| `npc-dialog` | npc-dialog.md | NPC 대화 |
| `battle-win` | battle-win.md | 전투 승리 |
| `battle-lose` | battle-lose.md | 전투 패배 |
| `battle-escape` | battle-escape.md | 전투 도망 |
| `full-loop` | full-loop.md | 전체 게임 루프 |

---

## 출력 형식

시나리오 파일의 내용을 기반으로 단계별 가이드를 제공합니다:

```markdown
# 시나리오: 첫 전투 (first-battle)

**소요 시간**: 5분
**관련 영역**: 전투 시스템

## 사전 준비

- [x] 게임 시작 완료 (GameScene)
- [x] 플레이어 조작 가능 상태

## 테스트 단계

### Step 1: 몬스터 위치 확인

**액션**: 맵에서 슬라임 위치 확인

**예상 결과**: 슬라임이 맵에 표시됨

---

### Step 2: 몬스터에게 접근

**액션**: WASD로 슬라임 방향으로 이동

**예상 결과**: 슬라임 접촉 시 전투 진입

---

[... 계속 ...]

## 검증 항목

| # | 항목 | 결과 |
|---|------|------|
| 1 | 몬스터 접촉 → 전투 진입 | [ ] |
| 2 | 전투 UI 정상 표시 | [ ] |
| 3 | Attack 데미지 계산 | [ ] |
| ... | ... | ... |
```

---

## 예시

### 첫 전투 시나리오

```
/qa-scenario first-battle
```

### 전체 게임 루프

```
/qa-scenario full-loop
```

### NPC 대화

```
/qa-scenario npc-dialog
```

---

## 시나리오 선택 가이드

### 상황별 권장

| 상황 | 권장 시나리오 |
|------|--------------|
| 전투 기능 변경 후 | `first-battle`, `battle-win`, `battle-escape` |
| NPC/대화 변경 후 | `npc-dialog` |
| 씬 전환 변경 후 | `new-game`, `full-loop` |
| 게임오버 구현 후 | `battle-lose` |

---

## 관련 명령어

- `/qa` - 전체 QA 사이클
- `/qa-auto` - 자동화 테스트
- `/qa-manual` - 체크리스트
