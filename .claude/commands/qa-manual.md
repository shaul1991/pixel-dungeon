# /qa-manual 명령어

수동 테스트 체크리스트를 표시합니다.

---

## 사용법

```
/qa-manual [scenario]
```

### 시나리오 옵션

| 옵션 | 파일 | 소요 시간 |
|------|------|----------|
| `smoke` (기본) | smoke.md | 5분 |
| `battle` | battle.md | 10분 |
| `exploration` | exploration.md | 10분 |
| `ui` | ui.md | 10분 |
| `regression` | regression.md | 15분 |
| `full` | full.md | 30분 |

---

## 기본 출력 (smoke)

```markdown
# 스모크 테스트 체크리스트

**소요 시간**: 5분

## 사전 준비

```bash
make dev
# http://localhost:5173
```

## 체크리스트

### 게임 시작 (3항목)
- [ ] 페이지 로딩 시 에러 없음
- [ ] 메인 메뉴 화면 표시
- [ ] "New Game" 클릭 시 게임 시작

### 플레이어 이동 (4항목)
- [ ] 플레이어 캐릭터 표시
- [ ] WASD/화살표키 4방향 이동
- [ ] 이동 시 애니메이션
- [ ] 벽 충돌

### NPC 상호작용 (2항목)
- [ ] Space 키로 대화 시작
- [ ] 대화창 텍스트 표시 및 닫기

### 전투 (4항목)
- [ ] 몬스터 접촉 시 전투 화면 전환
- [ ] 전투 UI 표시 (HP/MP, 메뉴)
- [ ] "Attack" 선택 시 데미지 발생
- [ ] 전투 종료 후 게임 화면 복귀

---

**전체**: 13 항목
**Pass 기준**: 11/13 이상
```

---

## 상세 시나리오 호출

```
/qa-manual battle
```

```
/qa-manual full
```

---

## Makefile 사용

```bash
make qa-manual
```

(시나리오 목록 표시)

---

## 관련 명령어

- `/qa` - 전체 QA 사이클
- `/qa-auto` - 자동화 테스트
- `/qa-scenario` - 특정 시나리오 상세
