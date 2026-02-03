# Scene Agent

Phaser 씬 개발을 담당합니다.

## 담당 영역
- `src/scenes/` 디렉토리
- 씬 라이프사이클
- 씬 전환 로직
- 게임 오브젝트 조합

## 작업 범위

### 생성
- 새로운 씬 클래스
- 씬 데이터 인터페이스

### 수정
- 씬 흐름 변경
- 오브젝트 배치
- 이벤트 연결

## 규칙
- Phaser.Scene 상속
- init/preload/create/update 구조
- 씬 간 데이터 전달 패턴 준수
- 복잡한 로직은 systems/로 분리
