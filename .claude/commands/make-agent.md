# /make-agent 명령어

Claude Code의 에이전트, 명령어, 지식, 규칙, 훅 등 구성 요소를 생성합니다.

---

## 사용법

```
/make-agent [type] [name] [description]
```

### 파라미터

| 파라미터 | 설명 | 예시 |
|----------|------|------|
| `type` | 구성 요소 유형 | agent, command, knowledge, rule, hook |
| `name` | 구성 요소 이름 | inventory, save-game, performance |
| `description` | 간단한 설명 (선택) | "인벤토리 시스템 관리" |

### 예시

```bash
# 새 에이전트 생성
/make-agent agent inventory "인벤토리 시스템 개발 담당"

# 새 명령어 생성
/make-agent command save-game "게임 저장/로드"

# 새 지식 베이스 생성
/make-agent knowledge performance "성능 최적화 가이드"

# 새 규칙 생성
/make-agent rule asset-naming "에셋 네이밍 규칙"

# 새 훅 생성
/make-agent hook pre-commit "커밋 전 검증"

# 대화형 모드
/make-agent
```

---

## 실행 단계

### 1. 수집 (Gather)

| 활동 | 에이전트 | 설명 |
|------|----------|------|
| 기존 구성 요소 확인 | **Meta** | 중복 여부 확인 |
| 템플릿 확인 | **Meta** | 적절한 템플릿 선택 |
| 참조 파일 확인 | **Meta** | CLAUDE.md, README.md 현황 |

### 2. 분석 (Analyze)

| 활동 | 에이전트 | 설명 |
|------|----------|------|
| 네이밍 검증 | - | kebab-case 준수 확인 |
| 충돌 검사 | - | 기존 파일과 충돌 확인 |
| 연관 관계 파악 | - | 관련 에이전트/명령어 식별 |

**유형 → 디렉토리 매핑**:

| 유형 | 디렉토리 | 템플릿 | 참조 등록 |
|------|----------|--------|----------|
| `agent` | `.claude/agents/` | `templates/agent.md` | README.md, CLAUDE.md |
| `command` | `.claude/commands/` | `templates/command.md` | README.md, CLAUDE.md |
| `knowledge` | `.claude/knowledge/` | `templates/knowledge.md` | CLAUDE.md `@./` |
| `rule` | `.claude/rules/` | `templates/rule.md` | CLAUDE.md `@./` |
| `hook` | `.claude/hooks/` | `templates/hook.sh` | settings.json |

### 3. 실행 (Execute)

| 단계 | 작업 |
|------|------|
| 템플릿 로드 | `.claude/templates/[type]` 파일 읽기 |
| 플레이스홀더 치환 | `{{NAME}}`, `{{DESCRIPTION}}`, `{{DATE}}` 등 |
| 파일 생성 | 대상 디렉토리에 새 파일 작성 |
| 참조 등록 | CLAUDE.md, README.md, settings.json 업데이트 |

### 4. 검증 (Validate)

| 활동 | 설명 |
|------|------|
| 파일 존재 확인 | 생성된 파일이 올바른 위치에 있는지 |
| 마크다운 문법 | 템플릿 구조 유효성 |
| 참조 무결성 | `@./` 참조가 유효한지 |
| 훅 실행 권한 | (훅인 경우) 실행 권한 확인 |

### 5. Next Step 제안

생성 완료 후 다음 안내:
- 생성된 파일 편집 안내
- 관련 구성 요소 추천
- 테스트 방법 안내

---

## 에이전트 협업 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│  /make-agent 실행                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gather ──────→ Meta Agent (기존 구성 요소 분석)                 │
│                     │                                            │
│                     ▼                                            │
│  Analyze ─────→ 유형 판별 및 템플릿 선택                         │
│                     │                                            │
│           ┌─────────┴─────────┬─────────┬─────────┬─────────┐   │
│           ▼         ▼         ▼         ▼         ▼         │   │
│        Agent    Command   Knowledge   Rule      Hook        │   │
│        생성       생성       생성      생성      생성        │   │
│           │         │         │         │         │         │   │
│           └─────────┴─────────┴─────────┴─────────┘         │   │
│                              │                               │   │
│                              ▼                               │   │
│  Validate ───→ 파일 확인 + 참조 등록 확인                    │   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 유형별 상세

### Agent 생성

```bash
/make-agent agent [name] [description]
```

**생성 파일**: `.claude/agents/[name].md`

**필수 섹션**:
- 역할/목적
- 담당 영역 (디렉토리)
- 작업 범위 (생성/수정)
- 워크플로우
- 호출 키워드
- 관련 에이전트
- 규칙

**등록 위치**:
- `.claude/README.md` 에이전트 테이블
- `.claude/CLAUDE.md` 에이전트 정의 섹션

### Command 생성

```bash
/make-agent command [name] [description]
```

**생성 파일**: `.claude/commands/[name].md`

**필수 섹션**:
- 사용법 (파라미터, 예시)
- 실행 단계 (GAPEVI 기반)
- 에이전트 협업 다이어그램
- 출력 형식
- 관련 명령어

**등록 위치**:
- `.claude/README.md` 명령어 테이블
- `.claude/CLAUDE.md` 명령어 섹션

### Knowledge 생성

```bash
/make-agent knowledge [name] [description]
```

**생성 파일**: `.claude/knowledge/[name].md`

**필수 섹션**:
- 개요
- 핵심 개념
- 패턴/모범 사례
- 코드 예시

**등록 위치**:
- `.claude/CLAUDE.md`에 `@./knowledge/[name].md` 추가

### Rule 생성

```bash
/make-agent rule [name] [description]
```

**생성 파일**: `.claude/rules/[name].md`

**필수 섹션**:
- 목적
- 규칙 목록 (Good/Bad 예시)
- 체크리스트
- 예외 사항

**등록 위치**:
- `.claude/CLAUDE.md`에 `@./rules/[name].md` 추가

### Hook 생성

```bash
/make-agent hook [name] [description]
```

**생성 파일**: `.claude/hooks/[name].sh`

**필수 구성**:
- 셸 스크립트 헤더
- 환경 변수 (CLAUDE_FILE_PATH 등)
- 실행 로직
- 종료 코드

**등록 위치**:
- `.claude/settings.json` hooks 섹션

---

## 대화형 모드

파라미터 없이 실행하면 대화형으로 진행:

```bash
/make-agent
```

**대화 흐름**:
```
어떤 유형의 구성 요소를 생성하시겠습니까?

선택지:
- Agent (에이전트) - 특정 영역 담당 전문가
- Command (명령어) - 슬래시 명령어
- Knowledge (지식 베이스) - 참조 문서
- Rule (규칙) - 코딩/개발 규칙
- Hook (훅) - 자동화 스크립트
```

---

## 플레이스홀더

템플릿에서 사용되는 플레이스홀더:

| 플레이스홀더 | 설명 | 예시 |
|--------------|------|------|
| `{{NAME}}` | 구성 요소 이름 | `inventory` |
| `{{DESCRIPTION}}` | 설명 | "인벤토리 시스템" |
| `{{DATE}}` | 생성 날짜 | `2026-02-03` |
| `{{AREA}}` | 담당 영역 | `systems` |

---

## 출력 형식

```markdown
## 생성 완료

| 항목 | 내용 |
|------|------|
| 유형 | [type] |
| 이름 | [name] |
| 파일 | `.claude/[type]s/[name].md` |

### 등록 완료

- [x] 파일 생성
- [x] README.md 업데이트
- [x] CLAUDE.md 참조 추가 (해당 시)
- [ ] settings.json 업데이트 (훅의 경우 수동)

### 다음 단계

1. 생성된 파일을 열어 내용을 작성하세요
2. `{{PLACEHOLDER}}` 부분을 실제 내용으로 교체하세요
3. 훅의 경우 `chmod +x` 실행 권한을 부여하세요
```

---

## Skill과 Command의 관계

**Skill**은 Claude Code에서 `/command` 형식으로 호출되는 기능입니다:

| 개념 | 설명 |
|------|------|
| **Skill** | Claude Code가 인식하는 슬래시 명령어 |
| **Command** | `.claude/commands/`에 정의된 명령어 문서 |

Skill과 Command는 1:1 매핑됩니다:
- `/new-feature` skill → `commands/new-feature.md` 정의
- `/make-agent` skill → `commands/make-agent.md` 정의

**등록 방법**:
- Command 파일을 `.claude/commands/`에 생성
- Claude Code가 자동으로 skill로 인식

---

## 관련 명령어

| 명령어 | 관계 |
|--------|------|
| `/new-feature` | 새 에이전트/명령어 필요 시 먼저 생성 |
| `/bugfix` | 기존 구성 요소 수정 시 |
| `/validate` | 생성 후 검증 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 명령어/Meta 에이전트가 담당:

- agent, 에이전트
- command, 명령어
- knowledge, 지식
- rule, 규칙
- hook, 훅
- template, 템플릿
- `.claude/` 설정

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | GAPEVI 플로우 통합, 에이전트 협업 추가 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
