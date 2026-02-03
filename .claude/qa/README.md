# QA 시스템

Pixel Dungeon 프로젝트의 품질 검증 시스템입니다.

---

## 개요

이 QA 시스템은 자동화 테스트와 수동 시나리오 테스트를 조합하여 게임 품질을 보장합니다.

### 테스트 피라미드

```
         /\
        /  \        E2E (수동 시나리오)
       /----\       - 전체 게임 플로우
      /      \      - 사용자 경험
     /--------\     통합 테스트
    /          \    - 시스템 간 상호작용
   /------------\   단위 테스트 (Vitest)
  /              \  - BattleSystem
 /________________\ - 기타 시스템
```

---

## 디렉토리 구조

```
.claude/qa/
├── README.md                    # 이 파일
├── scenarios/
│   ├── smoke.md                 # 스모크 테스트 (5분)
│   ├── battle.md                # 전투 시나리오 (10분)
│   ├── exploration.md           # 탐험 시나리오 (10분)
│   ├── ui.md                    # UI 테스트 (10분)
│   ├── regression.md            # 회귀 테스트 (15분)
│   ├── full.md                  # 전체 체크리스트 (30분)
│   └── detailed/                # 상세 시나리오
│       ├── new-game.md
│       ├── first-battle.md
│       ├── npc-dialog.md
│       ├── battle-win.md
│       ├── battle-lose.md
│       ├── battle-escape.md
│       └── full-loop.md
├── templates/
│   ├── scenario-template.md     # 시나리오 작성 템플릿
│   ├── checklist-template.md    # 체크리스트 템플릿
│   └── report-template.md       # 리포트 템플릿
└── reports/                     # 테스트 리포트 저장
    └── .gitkeep
```

---

## 사용 방법

### 1. 자동화 테스트

```bash
# 단위 테스트 실행
make test

# 테스트 + 타입체크 + 빌드
make qa-auto

# 커버리지 리포트
make test-coverage
```

### 2. 수동 시나리오 테스트

```bash
# 사용 가능한 체크리스트 확인
make qa-manual

# 개발 서버 시작 후 수동 테스트
make dev
```

### 3. 전체 QA 사이클

```bash
# 자동화 + 수동 테스트 안내
make qa
```

---

## 시나리오 선택 가이드

| 상황 | 권장 시나리오 |
|------|--------------|
| 빠른 확인 (커밋 전) | `smoke.md` |
| 전투 기능 변경 | `battle.md` |
| 맵/이동 변경 | `exploration.md` |
| UI 변경 | `ui.md` |
| PR 전 검증 | `regression.md` |
| 릴리스 전 | `full.md` |

---

## 명령어 (Claude Code)

| 명령어 | 설명 |
|--------|------|
| `/qa` | 전체 QA 사이클 실행 |
| `/qa-auto` | 자동화 테스트만 |
| `/qa-manual` | 수동 체크리스트 표시 |
| `/qa-scenario [name]` | 특정 시나리오 실행 |

---

## 테스트 리포트

테스트 결과는 `reports/` 디렉토리에 저장할 수 있습니다:

- `report-YYYYMMDD-HHMMSS.md` - 수동 테스트 결과
- `coverage/` - Vitest 커버리지 리포트

---

## 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-02-03 | QA 시스템 초기 구축 |
