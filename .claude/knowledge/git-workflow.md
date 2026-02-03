# Git 워크플로우

## 브랜치 전략

```
main (production)
  └── develop
        ├── feature/기능명
        ├── bugfix/이슈명
        └── hotfix/긴급수정
```

## 브랜치 네이밍

| 용도 | 패턴 | 예시 |
|------|------|------|
| 기능 | feature/기능명 | `feature/battle-system` |
| 버그 | bugfix/이슈명 | `bugfix/player-collision` |
| 긴급 | hotfix/설명 | `hotfix/crash-on-start` |

## 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
| Type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 포맷팅 (코드 변경 없음) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 변경 |

### Scope (게임 프로젝트용)
| Scope | 설명 |
|-------|------|
| `entity` | 엔티티 관련 (Player, Monster, NPC) |
| `scene` | 씬 관련 |
| `system` | 시스템 관련 (Battle, Input) |
| `ui` | UI 컴포넌트 |
| `asset` | 에셋 관련 |

### 예시
```
feat(entity): add Slime monster with basic AI

- Add Slime class extending Monster
- Implement random movement pattern
- Add slime sprite and animation

Closes #12
```

```
fix(scene): prevent crash when entering empty room

The GameScene was crashing when entering a room without
any enemies due to null reference in BattleSystem.

Fixes #45
```

## .gitignore

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/
```

## PR 규칙

### 제목
```
[Type] 간단한 설명
```
예: `[feat] Add battle system with turn-based combat`

### 본문
```markdown
## 변경 사항
- 변경 내용 1
- 변경 내용 2

## 테스트
- [ ] 빌드 성공 확인
- [ ] 게임 실행 테스트
- [ ] 새 기능 동작 확인

## 스크린샷 (UI 변경 시)
```

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 생성 | @claude |
