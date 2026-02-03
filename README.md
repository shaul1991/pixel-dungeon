# Pixel Dungeon

Phaser 3 기반 픽셀 아트 턴제 던전 RPG 게임

## 개요

- **엔진**: Phaser 3.90
- **언어**: TypeScript 5.9
- **빌드**: Vite 7
- **해상도**: 480x320

## 빠른 시작

```bash
# 의존성 설치
make install

# 개발 서버 실행
make dev

# 빌드
make build
```

## 프로젝트 구조

```
src/
├── main.ts              # 진입점
├── config.ts            # 게임 설정
├── entities/            # 게임 엔티티 (Player, Monster, NPC)
├── scenes/              # Phaser 씬 (Boot, Preload, Menu, Game, Battle)
├── systems/             # 게임 시스템 (Input, Battle)
├── ui/                  # UI 컴포넌트 (HealthBar, DialogBox, BattleUI)
└── types/               # 타입 정의
```

## 문서

- [로드맵](docs/ROADMAP.md) - 개발 계획 및 마일스톤
- [TODO](docs/TODO.md) - 현재 작업 목록
- [변경 이력](docs/CHANGELOG.md) - 버전별 변경사항

## 조작법

| 키 | 동작 |
|----|------|
| WASD / 방향키 | 이동 |
| Z / Space | 상호작용 / 확인 |
| ESC | 메뉴로 돌아가기 |

## 현재 상태

**v0.1.0 - 프로토타입** (개발 중)

- [x] 기본 이동 시스템
- [x] 턴제 전투
- [x] NPC 대화
- [ ] 인벤토리/아이템
- [ ] 레벨업 시스템
- [ ] 다중 던전 층

자세한 내용은 [로드맵](docs/ROADMAP.md)을 참고하세요.
