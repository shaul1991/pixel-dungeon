# Pixel Dungeon 프로젝트 가이드라인

## 최우선 규칙: 사용자 확인 후 워크플로우 진입

**모든 요청에 대해 먼저 YES/NO 확인 후 진행**

### 진입 확인 (필수)

모든 요청에 대해 다음을 먼저 물어봅니다:

```
📋 요청 분석: [사용자 요청 요약]

개발 워크플로우(IPE + GAPEVI)를 시작할까요?
- YES: 코드 분석 → 작업 제안 → 승인 후 구현
- NO: 간단히 답변/설명만 제공
```

### 예외 (확인 생략)

- 슬래시 명령어 (`/new-feature`, `/bugfix` 등) → 직접 실행
- 명시적 지시 ("바로 해", "확인 없이 진행") → 직접 실행

### 필수 절차: 3단계 확인 워크플로우 (IPE)

**Interpret → Present → Execute** 패턴으로 모호한 요청도 정확하게 처리합니다.

**디버그 출력 (필수):**
- 시작: `[IPE:START] 워크플로우 시작 - {요청 요약}`
- 종료: `[IPE:END] 워크플로우 완료 - {결과 요약}`

```
┌─────────────────────────────────────────────────────────────────┐
│  [IPE:START] 워크플로우 시작                                      │
├─────────────────────────────────────────────────────────────────┤
│  1. 해석 (Interpret)                                             │
│     [IPE:INTERPRET] 시작                                         │
│                                                                  │
│     사용자: "새로운 몬스터 추가해줘"                               │
│                    ↓                                             │
│     AI: Explore Agent로 컨텍스트 수집                            │
│         - 기존 Monster 클래스 구조 분석                           │
│         - 스프라이트/에셋 확인                                    │
│         - BattleSystem 연동 방식 파악                            │
│                                                                  │
│     ⚠️ 이 단계에서는 코드 수정 금지, 분석만 수행                   │
│     [IPE:INTERPRET] 완료                                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 제시 (Present)                                               │
│     [IPE:PRESENT] 시작                                           │
│                                                                  │
│     📋 요청 해석 결과                                             │
│     ├─ 현재 구조:                                                │
│     │   • Monster 클래스 분석 결과                                │
│     │   • 필요한 에셋 목록                                        │
│     │                                                            │
│     ├─ 제안 작업:                                                │
│     │   1. [높음] Monster 서브클래스 생성                         │
│     │   2. [중간] 스프라이트 에셋 생성                            │
│     │   3. [낮음] BattleScene 연동                               │
│     │                                                            │
│     └─ 예상 결과: 새 몬스터 타입 추가                             │
│                                                                  │
│     사용자 선택 요청 (AskUserQuestion)                           │
│     [IPE:PRESENT] 완료                                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 실행 (Execute)                                               │
│     [IPE:EXECUTE] 시작 → GAPEVI 사이클로 전환                     │
│                                                                  │
│     사용자 승인 후 GAPEVI 사이클 실행                             │
│     (IPE:Interpret 결과를 GAPEVI:Gather로 전달)                  │
│                                                                  │
│     [IPE:EXECUTE] 완료                                           │
├─────────────────────────────────────────────────────────────────┤
│  [IPE:END] 워크플로우 완료                                        │
└─────────────────────────────────────────────────────────────────┘
```

### IPE → GAPEVI 전환 매핑

```
┌─────────────────────────────────────────────────────────────────┐
│  IPE와 GAPEVI의 관계                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  IPE:Interpret ──────→ GAPEVI:Gather + Analyze (일부)           │
│  (코드 분석)           (컨텍스트 수집 완료 상태로 시작)           │
│                                                                  │
│  IPE:Present ────────→ 사용자 확인 단계                          │
│  (작업 제안)           (GAPEVI 진입 전 승인)                     │
│                                                                  │
│  IPE:Execute ────────→ GAPEVI:Prioritize → Execute → Validate   │
│  (실행)                (Gather/Analyze 생략, 바로 우선순위 결정)  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**핵심**: IPE를 통해 이미 분석이 완료되었으므로, GAPEVI 진입 시 Gather/Analyze를 중복 수행하지 않음

---

## 프로젝트 정보

- **타입**: 픽셀 아트 던전 RPG 게임
- **엔진**: Phaser 3.90
- **언어**: TypeScript 5.9
- **빌드**: Vite 7
- **해상도**: 480x320 (픽셀 아트)
- **물리 엔진**: Arcade Physics

---

## 프로젝트 구조

```
pixel-dungeon/
├── src/
│   ├── main.ts              # 게임 진입점
│   ├── config.ts            # Phaser 게임 설정
│   ├── entities/            # 게임 엔티티
│   │   ├── Player.ts        # 플레이어 캐릭터
│   │   ├── Monster.ts       # 몬스터 기본 클래스
│   │   └── NPC.ts           # NPC 캐릭터
│   ├── scenes/              # Phaser 씬
│   │   ├── BootScene.ts     # 초기화 씬
│   │   ├── PreloadScene.ts  # 에셋 로딩 씬
│   │   ├── MenuScene.ts     # 메인 메뉴
│   │   ├── GameScene.ts     # 메인 게임플레이
│   │   └── BattleScene.ts   # 전투 씬
│   ├── systems/             # 게임 시스템
│   │   ├── InputController.ts  # 입력 처리
│   │   └── BattleSystem.ts     # 전투 로직
│   ├── ui/                  # UI 컴포넌트
│   │   ├── HealthBar.ts     # 체력바
│   │   ├── DialogBox.ts     # 대화창
│   │   └── BattleUI.ts      # 전투 UI
│   └── types/               # 타입 정의
│       └── index.ts
├── public/                  # 정적 에셋
├── scripts/                 # 에셋 생성 스크립트
│   ├── generate-player.js
│   ├── generate-monster.js
│   ├── generate-npc.js
│   └── generate-tileset.js
├── package.json
├── tsconfig.json
└── index.html
```

---

## 규칙
@./rules/typescript.md
@./rules/phaser.md
@./rules/game-architecture.md
@./rules/testing.md

## 지식 베이스
@./knowledge/conventions.md
@./knowledge/architecture.md
@./knowledge/phaser-patterns.md
@./knowledge/git-workflow.md
@./knowledge/qa-patterns.md
@./knowledge/meta-patterns.md

## 에이전트 정의
@./agents/entity.md
@./agents/scene.md
@./agents/system.md
@./agents/ui.md
@./agents/asset.md
@./agents/tester.md
@./agents/qa.md
@./agents/meta.md

## QA 문서
@./qa/README.md

## 프로젝트 추적
@../docs/ROADMAP.md
@../docs/TODO.md
@../docs/CHANGELOG.md

---

# 통합 워크플로우 (필수 준수)

## 마스터 워크플로우: GAPEVI 사이클

모든 작업은 다음 6단계 사이클을 따릅니다:

**디버그 출력 (필수):**
- 시작: `[GAPEVI:START] 사이클 시작`
- 각 단계: `[GAPEVI:{단계}] 시작/완료`
- 종료: `[GAPEVI:END] 사이클 완료 - {결과 요약}`

```
┌─────────────────────────────────────────────────────────────────────┐
│  [GAPEVI:START] 사이클 시작                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                      │
│   │  수집    │ → │  분석    │ → │ 우선순위  │                      │
│   │ Gather   │    │ Analyze  │    │ Prioritize│                      │
│   └──────────┘    └──────────┘    └──────────┘                      │
│                                         │                            │
│                                         ▼                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                      │
│   │  반복    │ ← │  검증    │ ← │  실행    │                      │
│   │ Iterate  │    │ Validate │    │ Execute  │                      │
│   └──────────┘    └──────────┘    └──────────┘                      │
│        │                                                             │
│        └─────────────── 필요 시 해당 단계로 복귀 ──────────────────→ │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  [GAPEVI:END] 사이클 완료                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 단계별 상세

### 1. 수집 (Gather)
`[GAPEVI:GATHER] 시작` / `[GAPEVI:GATHER] 완료`

**목적**: 작업에 필요한 모든 정보 수집

| 활동 | 설명 |
|------|------|
| 요구사항 수집 | 사용자 요청 명확화 |
| 컨텍스트 수집 | 관련 파일, 코드 탐색 |
| 제약사항 파악 | 기술적 제한, 의존성 확인 |

**에이전트**: Explore (subagent_type="Explore")

### 2. 분석 (Analyze)
`[GAPEVI:ANALYZE] 시작` / `[GAPEVI:ANALYZE] 완료`

**목적**: 수집된 정보 분석 및 접근 방식 결정

**키워드 → 에이전트 매핑**:
| 키워드 | 에이전트 |
|--------|---------|
| Entity, Monster, Player, NPC, 캐릭터 | **Entity** |
| Scene, 씬, 화면, 전환 | **Scene** |
| System, 시스템, 전투, 입력 | **System** |
| UI, HUD, 메뉴, 대화창, 인벤토리 | **UI** |
| 에셋, 스프라이트, 타일셋, 이미지 | **Asset** |
| 테스트, 단위 테스트, 코드 검증 | **Tester** |
| QA, 품질 검증, 시나리오, 체크리스트 | **QA** |
| Agent, Command, Hook, Knowledge, Rule, 설정 | **Meta** |

### 3. 우선순위 (Prioritize)
`[GAPEVI:PRIORITIZE] 시작` / `[GAPEVI:PRIORITIZE] 완료`

**목적**: 작업 분해 및 실행 순서 결정

**작업 상태**:
- `[ ]` 대기 (Pending)
- `[~]` 진행중 (In Progress)
- `[x]` 완료 (Done)
- `[!]` 차단됨 (Blocked)

### 4. 실행 (Execute)
`[GAPEVI:EXECUTE] 시작` / `[GAPEVI:EXECUTE] 완료`

**목적**: 계획된 작업 구현

**게임 개발 순서**:
```
1. 타입 정의 (types/)
2. 엔티티 구현 (entities/)
3. 시스템 구현 (systems/)
4. 씬 통합 (scenes/)
5. UI 연결 (ui/)
```

### 5. 검증 (Validate)
`[GAPEVI:VALIDATE] 시작` / `[GAPEVI:VALIDATE] 완료`

**목적**: 구현 결과 검증

**Quality Gate** (모든 항목 통과 필수):
```
┌─────────────────────────────────────────────────────────┐
│                     Quality Gate                         │
├─────────────────────────────────────────────────────────┤
│  1. 단위 테스트       npm run test                       │
│  2. 타입 체크         tsc --noEmit                       │
│  3. 린트 (ESLint)     npx eslint src/ (설정 시)          │
│  4. 빌드 (Vite)       npm run build                      │
│  5. 스모크 테스트     .claude/qa/scenarios/smoke.md      │
│  6. 영역별 테스트     해당 시나리오 (선택)                │
└─────────────────────────────────────────────────────────┘
```

**자동화 테스트 (Makefile)**:
```bash
make qa-auto    # 1-4 자동 실행
make qa         # 자동화 + 수동 테스트 안내
```

### 6. 반복 (Iterate)
`[GAPEVI:ITERATE] 시작` / `[GAPEVI:ITERATE] 완료` (또는 복귀 단계 명시)

**목적**: 검증 결과에 따른 개선

| 상황 | 복귀 단계 |
|------|----------|
| 타입 오류 | → 실행 (Execute) |
| 빌드 실패 | → 실행 (Execute) |
| 요구사항 변경 | → 분석 (Analyze) |
| 새 정보 발견 | → 수집 (Gather) |

### 7. 완료 후 Next Step (필수)

모든 작업 완료 후 **반드시** 다음을 제안하세요:

```markdown
## Next Step 제안

### 📊 작업 완료 요약
| 항목 | 내용 |
|------|------|
| 작업 유형 | [새 기능 / 버그 수정 / 리팩토링] |
| 변경 파일 | [N개 파일] |
| Quality Gate | ✅ 통과 / ⚠️ 경고 / ❌ 실패 |

### 🔧 추가 개선 사항
| 우선순위 | 항목 | 이유 |
|---------|------|------|
| 높음 | [개선 항목] | [필요한 이유] |
| 중간 | [개선 항목] | [필요한 이유] |

### ✅ 다음 액션 체크리스트
- [ ] 게임 실행 테스트
- [ ] 새 기능 동작 확인
```

---

## 명령어

### 개발 (전체 GAPEVI 사이클)
- `/new-feature` - 새 기능 개발
- `/bugfix` - 버그 수정

### 부분 실행
- `/build` - 빌드 (tsc && vite build)
- `/dev` - 개발 서버 실행
- `/validate` - 타입 체크 및 빌드 검증

### QA (품질 검증)
- `/qa` - 전체 QA 사이클 (자동화 + 수동 테스트 안내)
- `/qa-auto` - 자동화 테스트만 (단위 테스트 + 타입 체크 + 빌드)
- `/qa-manual` - 수동 체크리스트 표시
- `/qa-scenario [name]` - 특정 시나리오 테스트

### 메타 (Claude Code 설정)
- `/make-agent` - 에이전트/명령어/지식/규칙/훅 생성

### 에셋
- `/generate-sprite` - 스프라이트 생성 스크립트 실행
- `/generate-tileset` - 타일셋 생성

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | Meta 시스템 추가 (/make-agent 명령어, Meta 에이전트, 템플릿) | @claude |
| 2026-02-03 | QA 시스템 추가 (에이전트, 명령어, 시나리오, Quality Gate 업데이트) | @claude |
| 2026-02-03 | IPE/GAPEVI 디버그 출력 추가 (시작/종료 지점) | @claude |
| 2026-02-03 | 트리거 판단 제거, 모든 요청에 YES/NO 확인 방식으로 변경 | @claude |
| 2026-02-03 | 프로젝트 추적 문서 참조 추가 (ROADMAP, TODO, CHANGELOG) | @claude |
| 2026-02-03 | 초기 생성 (blog.shaul.kr에서 마이그레이션) | @claude |
