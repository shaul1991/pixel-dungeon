# /make-agent 명령어

Claude Code의 에이전트, 명령어, 지식, 규칙, 훅 등을 생성합니다.

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
```

---

## 실행 단계

### 1. 유형 확인

사용자가 지정한 유형이 유효한지 확인:

| 유형 | 디렉토리 | 템플릿 |
|------|----------|--------|
| `agent` | `.claude/agents/` | `templates/agent.md` |
| `command` | `.claude/commands/` | `templates/command.md` |
| `knowledge` | `.claude/knowledge/` | `templates/knowledge.md` |
| `rule` | `.claude/rules/` | `templates/rule.md` |
| `hook` | `.claude/hooks/` | `templates/hook.sh` |

### 2. 이름 검증

- kebab-case 형식 확인 (예: `my-agent`, `new-feature`)
- 기존 파일과 중복 여부 확인
- 예약어 충돌 확인

### 3. 템플릿 로드 및 생성

해당 유형의 템플릿 파일을 기반으로 새 파일 생성:

```markdown
# 템플릿 위치
.claude/templates/
├── agent.md      # 에이전트 템플릿
├── command.md    # 명령어 템플릿
├── knowledge.md  # 지식 베이스 템플릿
├── rule.md       # 규칙 템플릿
└── hook.sh       # 훅 스크립트 템플릿
```

### 4. 참조 등록

유형에 따라 필요한 참조 추가:

| 유형 | 등록 위치 |
|------|----------|
| `agent` | README.md 에이전트 목록 |
| `command` | README.md 명령어 목록, CLAUDE.md 명령어 섹션 |
| `knowledge` | CLAUDE.md `@./knowledge/` 참조 |
| `rule` | CLAUDE.md `@./rules/` 참조 |
| `hook` | settings.json hooks 섹션 |

### 5. 결과 출력

```markdown
## 생성 완료

| 항목 | 내용 |
|------|------|
| 유형 | [type] |
| 이름 | [name] |
| 파일 | `.claude/[type]s/[name].md` |

### 다음 단계

1. 생성된 파일을 열어 내용을 작성하세요
2. 필요한 경우 CLAUDE.md에 참조를 추가하세요
3. 훅의 경우 settings.json을 업데이트하세요
```

---

## 유형별 상세

### Agent 생성

```bash
/make-agent agent [name] [description]
```

**생성 파일**: `.claude/agents/[name].md`

**템플릿 구조**:
- 역할
- 담당 영역
- 작업 범위 (생성/수정)
- 규칙

### Command 생성

```bash
/make-agent command [name] [description]
```

**생성 파일**: `.claude/commands/[name].md`

**템플릿 구조**:
- 사용법
- 실행 단계
- 출력 형식
- 관련 명령어

### Knowledge 생성

```bash
/make-agent knowledge [name] [description]
```

**생성 파일**: `.claude/knowledge/[name].md`

**템플릿 구조**:
- 개요
- 상세 내용
- 예시
- 관련 문서

### Rule 생성

```bash
/make-agent rule [name] [description]
```

**생성 파일**: `.claude/rules/[name].md`

**템플릿 구조**:
- 목적
- 규칙 목록
- 예시 (Good/Bad)
- 예외 사항

### Hook 생성

```bash
/make-agent hook [name] [description]
```

**생성 파일**: `.claude/hooks/[name].sh`

**템플릿 구조**:
- 셸 스크립트 헤더
- 환경 변수 설명
- 실행 로직
- 종료 코드

---

## 대화형 모드

파라미터 없이 실행하면 대화형으로 진행:

```bash
/make-agent
```

**대화 흐름**:
```
1. 어떤 유형의 구성 요소를 생성하시겠습니까?
   - [ ] Agent (에이전트)
   - [ ] Command (명령어)
   - [ ] Knowledge (지식 베이스)
   - [ ] Rule (규칙)
   - [ ] Hook (훅)

2. 이름을 입력하세요 (kebab-case):
   > _____

3. 간단한 설명을 입력하세요:
   > _____

4. 생성을 진행할까요? [Y/n]
```

---

## 관련 명령어

- `/new-feature` - 새 기능 개발
- `/bugfix` - 버그 수정
- `/qa` - QA 검증

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 작성 | @claude |
