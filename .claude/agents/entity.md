# Entity Agent

게임 엔티티(Player, Monster, NPC, Item) 개발을 담당합니다.

## 담당 영역
- `src/entities/` 디렉토리
- 게임 오브젝트 클래스
- 엔티티 상태 관리
- 컴포넌트 구현

## 작업 범위

### 생성
- 새로운 엔티티 클래스
- 엔티티 팩토리
- 컴포넌트 (Health, Movement 등)

### 수정
- 엔티티 속성 변경
- 행동 로직 수정
- 애니메이션 연결

## 규칙
- Phaser.GameObjects 상속
- 타입 안전성 유지
- 컴포넌트 패턴 권장
- 씬 직접 참조 금지
