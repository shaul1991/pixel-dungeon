# Meta 패턴

Claude Code 설정 구성 요소의 작성 패턴과 모범 사례입니다.

---

## 개요

`.claude/` 디렉토리는 Claude Code의 동작을 커스터마이징하는 설정 파일들을 포함합니다.
이 문서는 각 구성 요소를 효과적으로 작성하는 방법을 안내합니다.

---

## 구성 요소 계층

```
.claude/
├── CLAUDE.md           # 최상위 가이드라인 (항상 로드됨)
├── settings.json       # 권한 및 훅 설정
├── README.md           # 설정 개요
│
├── agents/             # Level 2: 에이전트 정의
├── commands/           # Level 2: 명령어 정의
│
├── knowledge/          # Level 3: 지식 베이스 (참조 시 로드)
├── rules/              # Level 3: 규칙 (참조 시 로드)
│
├── hooks/              # 자동화 스크립트
├── templates/          # 템플릿 (생성용)
└── qa/                 # QA 시나리오 및 체크리스트
```

### 로딩 우선순위

1. **항상 로드**: `CLAUDE.md`
2. **참조 시 로드**: `@./path/to/file.md` 구문으로 참조된 파일
3. **명령어 실행 시**: 해당 명령어 파일
4. **요청에 따라**: 관련 에이전트, 지식, 규칙

---

## Agent 작성 패턴

### 구조

```markdown
# [Name] Agent

[한 줄 설명]

## 역할
[주요 책임]

## 담당 영역
- `src/[area]/` 디렉토리
- [관련 파일]

## 작업 범위
### 생성
- [생성 가능 항목]

### 수정
- [수정 가능 항목]

## 규칙
- [따라야 할 규칙]
```

### 모범 사례

```markdown
# Good ✅ - 명확한 범위
담당 영역:
- `src/entities/` 디렉토리의 모든 엔티티 클래스
- Phaser.GameObjects를 상속하는 게임 오브젝트

# Bad ❌ - 모호한 범위
담당 영역:
- 게임 관련 코드
- 여러 가지
```

### 에이전트 간 협업

```
Entity Agent ←→ Scene Agent
     ↓              ↓
System Agent ←→ UI Agent
     ↓
Tester Agent / QA Agent
```

**규칙**: 하위 레이어 에이전트는 상위 레이어를 직접 수정하지 않음

---

## Command 작성 패턴

### 구조

```markdown
# /[name] 명령어

[한 줄 설명]

## 사용법
\`\`\`
/[name] [options]
\`\`\`

## 실행 단계
### 1. [단계명]
- 액션
- 예상 출력

## 출력 형식
[결과 포맷]
```

### 네이밍 컨벤션

| 유형 | 패턴 | 예시 |
|------|------|------|
| 개발 | 동사-명사 | `/new-feature`, `/bugfix` |
| 빌드 | 단일 동사 | `/build`, `/dev`, `/validate` |
| QA | qa-* | `/qa`, `/qa-auto`, `/qa-manual` |
| 메타 | make-* | `/make-agent` |

### 명령어 체이닝

```markdown
## 관련 명령어
- `/build` 후 `/qa-auto` 실행 권장
- 실패 시 `/bugfix` 사용
```

---

## Knowledge 작성 패턴

### 구조

```markdown
# [Topic]

[개요]

## 핵심 개념
[중요 개념 설명]

## 패턴 및 모범 사례
[실제 적용 방법]

## 주의사항
[피해야 할 것]
```

### 코드 예시 포함

```markdown
## 패턴: [패턴명]

**문제**: [해결하려는 문제]

**해결책**:
\`\`\`typescript
// Good ✅
class Monster extends Phaser.GameObjects.Sprite {
  private health: HealthComponent;
}

// Bad ❌
class Monster {
  health: any;
}
\`\`\`
```

### 참조 방식

```markdown
## CLAUDE.md에서 참조
@./knowledge/architecture.md
@./knowledge/patterns.md

## 지식 베이스 간 참조
관련 문서: [아키텍처](./architecture.md)
```

---

## Rule 작성 패턴

### 구조

```markdown
# [Topic] 규칙

## 목적
[규칙의 존재 이유]

## 규칙
### 1. [규칙명]
- Good ✅ / Bad ❌ 예시

## 체크리스트
| 확인 항목 | 상태 |

## 예외 사항
[규칙 예외]
```

### 규칙의 강도

| 강도 | 표현 | 의미 |
|------|------|------|
| 필수 | MUST, 필수 | 반드시 따라야 함 |
| 권장 | SHOULD, 권장 | 특별한 이유 없으면 따름 |
| 선택 | MAY, 선택 | 상황에 따라 선택 |

```markdown
## 규칙

### 1. 타입 명시 (필수)
모든 함수의 매개변수와 반환 타입을 **반드시** 명시해야 합니다.

### 2. 상수 네이밍 (권장)
상수는 UPPER_SNAKE_CASE를 **권장**합니다.
```

---

## Hook 작성 패턴

### 구조

```bash
#!/bin/bash
# [Name] Hook
# [Description]

# 환경 변수
FILE_PATH="${CLAUDE_FILE_PATH:-}"

# 조건 검사
if [[ "$FILE_PATH" == *.ts ]]; then
    # 처리 로직
fi

exit 0
```

### 사용 가능한 환경 변수

| 변수 | 설명 | 훅 타입 |
|------|------|---------|
| `CLAUDE_FILE_PATH` | 편집된 파일 경로 | Edit, Write |
| `CLAUDE_BASH_COMMAND` | 실행된 명령어 | Bash |

### settings.json 등록

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/[name].sh"
          }
        ]
      }
    ]
  }
}
```

### 훅 모범 사례

```bash
# Good ✅ - 비동기 실행 (블로킹 방지)
npx tsc --noEmit 2>/dev/null &

# Bad ❌ - 동기 실행 (응답 지연)
npx tsc --noEmit

# Good ✅ - 조용한 실패
command_that_might_fail || true

# Bad ❌ - 에러로 전체 중단
set -e
command_that_might_fail
```

---

## Template 작성 패턴

### 플레이스홀더

| 플레이스홀더 | 설명 |
|--------------|------|
| `{{NAME}}` | 구성 요소 이름 |
| `{{DESCRIPTION}}` | 설명 |
| `{{DATE}}` | 생성 날짜 |
| `{{AREA}}` | 담당 영역 |

### 템플릿 검증

템플릿 작성 후:
1. 실제로 생성해 보기
2. 플레이스홀더 누락 확인
3. 마크다운 문법 검증

---

## 구성 요소 간 관계

```
CLAUDE.md (메인 가이드라인)
    │
    ├── @./rules/* (규칙 참조)
    ├── @./knowledge/* (지식 참조)
    │
    └── 워크플로우 정의
            │
            ├── commands/* (명령어 실행)
            │       │
            │       └── agents/* (에이전트 호출)
            │
            └── hooks/* (자동화)

templates/* (생성용 - 런타임에 로드되지 않음)
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 작성 | @claude |
