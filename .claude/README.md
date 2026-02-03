# Pixel Dungeon - Claude Code 설정

이 디렉토리는 Claude Code의 프로젝트별 설정을 포함합니다.

## 프로젝트 정보

- **타입**: Phaser 3 픽셀 아트 던전 RPG
- **언어**: TypeScript 5.9
- **빌드**: Vite 7
- **해상도**: 480x320

---

## 디렉토리 구조

```
.claude/
├── CLAUDE.md           # 프로젝트 가이드라인
├── settings.json       # 권한 및 훅 설정
│
├── agents/             # 에이전트 정의
│   ├── entity.md       # 엔티티 개발 (Player, Monster, NPC)
│   ├── scene.md        # Phaser 씬 개발
│   ├── system.md       # 게임 시스템 (로직)
│   ├── ui.md           # UI 컴포넌트
│   ├── tester.md       # 테스트
│   ├── qa.md           # QA/품질 검증
│   └── meta.md         # Claude Code 설정 관리
│
├── commands/           # 슬래시 명령어
│   ├── new-feature.md  # 새 기능 개발
│   ├── bugfix.md       # 버그 수정
│   ├── build.md        # 빌드
│   ├── validate.md     # 검증
│   ├── dev.md          # 개발 서버
│   ├── qa.md           # QA 사이클
│   ├── qa-auto.md      # 자동화 테스트
│   ├── qa-manual.md    # 수동 체크리스트
│   ├── qa-scenario.md  # 시나리오 테스트
│   └── make-agent.md   # 구성 요소 생성
│
├── hooks/              # 자동화 훅
│   ├── post-edit.sh    # 편집 후 타입 체크
│   └── post-git-change.sh
│
├── templates/          # 구성 요소 템플릿
│   ├── agent.md        # 에이전트 템플릿
│   ├── command.md      # 명령어 템플릿
│   ├── knowledge.md    # 지식 베이스 템플릿
│   ├── rule.md         # 규칙 템플릿
│   └── hook.sh         # 훅 템플릿
│
├── knowledge/          # 지식 베이스
│   ├── architecture.md # 게임 아키텍처
│   ├── conventions.md  # 코딩 컨벤션
│   ├── phaser-patterns.md # Phaser 패턴
│   ├── git-workflow.md # Git 워크플로우
│   ├── qa-patterns.md  # QA 패턴
│   └── meta-patterns.md # Meta 패턴
│
├── rules/              # 코딩 규칙
│   ├── typescript.md   # TypeScript 규칙
│   ├── phaser.md       # Phaser 규칙
│   ├── game-architecture.md # 아키텍처 규칙
│   └── testing.md      # 테스트 규칙
│
└── qa/                 # QA 시나리오
    ├── scenarios/      # 테스트 시나리오
    ├── templates/      # 리포트 템플릿
    └── reports/        # 테스트 결과
```

---

## 주요 명령어

### 개발
| 명령어 | 설명 |
|--------|------|
| `/new-feature` | 새 기능 개발 (GAPEVI 사이클) |
| `/bugfix` | 버그 수정 |

### 빌드/실행
| 명령어 | 설명 |
|--------|------|
| `/build` | 프로젝트 빌드 (`npm run build`) |
| `/validate` | 타입 체크 및 빌드 검증 |
| `/dev` | 개발 서버 실행 (`npm run dev`) |

### QA
| 명령어 | 설명 |
|--------|------|
| `/qa` | 전체 QA 사이클 |
| `/qa-auto` | 자동화 테스트 (단위 테스트 + 타입 체크 + 빌드) |
| `/qa-manual` | 수동 체크리스트 표시 |
| `/qa-scenario` | 특정 시나리오 테스트 |

### 메타
| 명령어 | 설명 |
|--------|------|
| `/make-agent` | 에이전트/명령어/지식/규칙/훅 생성 |

---

## 에이전트

| 에이전트 | 역할 | 담당 영역 |
|----------|------|----------|
| **Entity** | 게임 오브젝트 | `src/entities/` |
| **Scene** | Phaser 씬 | `src/scenes/` |
| **System** | 게임 로직 | `src/systems/` |
| **UI** | UI 컴포넌트 | `src/ui/` |
| **Tester** | 테스트/QA | 단위 테스트, 검증 |

---

## 워크플로우

이 프로젝트는 **GAPEVI** 워크플로우를 따릅니다:

```
┌────────┐   ┌────────┐   ┌──────────┐   ┌────────┐   ┌──────────┐   ┌────────┐
│ Gather │ → │Analyze │ → │Prioritize│ → │Execute │ → │ Validate │ → │Iterate │
│  수집  │   │  분석  │   │ 우선순위 │   │  실행  │   │   검증   │   │  반복  │
└────────┘   └────────┘   └──────────┘   └────────┘   └──────────┘   └────────┘
```

### Quality Gate

```bash
# 1. 타입 체크
npx tsc --noEmit

# 2. 빌드
npm run build

# 3. 개발 서버 테스트
npm run dev
```

---

## 빠른 시작

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# Claude Code로 새 기능 개발
claude "/new-feature 새로운 몬스터 추가"
```

---

## 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-02-03 | blog.shaul.kr에서 마이그레이션 (TypeScript/Phaser 용으로 재작성) |
