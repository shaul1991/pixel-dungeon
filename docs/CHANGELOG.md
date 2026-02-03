# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- 레벨업 시스템 (예정)
- 인벤토리 시스템 (예정)
- 스킬 시스템 활성화 (예정)

---

## [0.1.0] - 2026-02-03

### Added
- **Core**
  - Phaser 3 + TypeScript + Vite 프로젝트 구성
  - 5개 씬: Boot, Preload, Menu, Game, Battle
  - DEBUG 플래그로 디버그 정보 토글

- **Player**
  - 타일 기반 4방향 이동 (WASD/Arrow)
  - 4방향 걷기/대기 애니메이션
  - 벽 충돌 감지

- **Combat**
  - 턴제 전투 시스템
  - 공격/도망 기능
  - 데미지 계산 (Attack - Defense/2 + Random)
  - 전투 UI (HP/MP 바, 4개 메뉴)

- **NPC**
  - NPC 배치 시스템
  - 대화 시스템 (타이핑 효과)
  - DialogBox UI 컴포넌트

- **Monster**
  - 슬라임 몬스터 (1종)
  - 몬스터 스탯 시스템

- **Map**
  - 10x10 타일맵 (마을)
  - 4종 타일 (바닥, 벽, 문, 포탈)
  - Tiled JSON 맵 로딩

- **UI**
  - HealthBar 컴포넌트 (동적 색상)
  - BattleUI 컴포넌트
  - DialogBox 컴포넌트

- **Dev Tools**
  - Makefile (dev, build, validate 등)
  - Claude Code 설정 (.claude/)
  - 에셋 생성 스크립트 (scripts/)

### Known Issues
- 스킬/아이템 메뉴 비활성화 상태
- 경험치/골드 미적용

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.1.0 | 2026-02-03 | 프로토타입 - 기본 게임플레이 |
