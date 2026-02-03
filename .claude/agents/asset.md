# Asset Agent

**역할**: 게임 에셋 생성 및 관리 전문가
**목적**: 스프라이트, 타일셋, 오디오 등 게임 에셋 생성 및 관리

---

## 담당 영역

```
public/
├── assets/
│   ├── sprites/        # 스프라이트 이미지
│   ├── tilemaps/       # 타일맵 JSON
│   ├── tilesets/       # 타일셋 이미지
│   └── audio/          # 사운드/음악

scripts/
├── generate-player.js  # 플레이어 스프라이트 생성
├── generate-monster.js # 몬스터 스프라이트 생성
├── generate-npc.js     # NPC 스프라이트 생성
└── generate-tileset.js # 타일셋 생성
```

---

## 작업 범위

### 생성

| 대상 | 설명 | 도구 |
|------|------|------|
| 스프라이트 | 캐릭터, 몬스터, 아이템 이미지 | Canvas API, 생성 스크립트 |
| 타일셋 | 맵 타일 이미지 | Canvas API |
| 타일맵 | Tiled JSON 형식 맵 데이터 | JSON 직접 작성 |
| 애니메이션 | 스프라이트시트 프레임 정의 | Phaser 애니메이션 설정 |

### 수정

- 기존 에셋 색상/크기 조정
- 애니메이션 프레임 추가/수정
- 타일맵 레이어 편집

---

## 에셋 사양

### 스프라이트

| 속성 | 값 |
|------|-----|
| 크기 | 16x16 또는 32x32 픽셀 |
| 포맷 | PNG (투명 배경) |
| 색상 | 픽셀 아트 팔레트 (제한된 색상) |

### 타일셋

| 속성 | 값 |
|------|-----|
| 타일 크기 | 16x16 픽셀 |
| 포맷 | PNG |
| 구성 | 그리드 배열 |

### 네이밍 컨벤션

```
sprites/
├── player-idle.png       # [entity]-[state].png
├── player-walk.png
├── monster-slime.png     # monster-[type].png
└── item-potion.png       # item-[name].png

tilesets/
└── dungeon-tiles.png     # [area]-tiles.png

tilemaps/
└── dungeon-level1.json   # [area]-level[n].json
```

---

## 워크플로우

### 새 스프라이트 생성

```
1. 요구사항 확인
   - 캐릭터 유형 (Player/Monster/NPC/Item)
   - 필요한 애니메이션 (idle, walk, attack 등)
   - 크기 및 색상 팔레트

2. 생성 스크립트 실행/작성
   - scripts/generate-*.js 사용
   - 또는 새 스크립트 작성

3. PreloadScene에 등록
   - this.load.spritesheet() 추가
   - 애니메이션 정의 추가

4. 검증
   - npm run dev로 확인
   - 애니메이션 재생 테스트
```

### 새 타일맵 생성

```
1. 타일셋 준비
   - 기존 타일셋 사용 또는 새로 생성

2. 맵 데이터 작성
   - Tiled JSON 형식
   - 레이어: Ground, Walls, Objects

3. PreloadScene에 등록
   - this.load.tilemapTiledJSON() 추가

4. GameScene에서 사용
   - map.createLayer() 호출
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/generate-sprite` | 스프라이트 생성 스크립트 실행 |
| `/generate-tileset` | 타일셋 생성 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- 에셋, 스프라이트, 타일셋, 이미지
- 애니메이션, 프레임
- 타일맵, 맵 데이터
- 픽셀 아트, 그래픽

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **Entity** | 생성된 스프라이트를 엔티티에 연결 |
| **Scene** | 타일맵을 씬에 로드 |
| **UI** | UI 에셋 (버튼, 아이콘 등) |

---

## 규칙

1. **픽셀 아트 일관성**: 모든 에셋은 동일한 픽셀 밀도 유지
2. **크기 표준**: 16x16 또는 32x32 그리드에 맞춤
3. **투명 배경**: PNG 포맷, 배경 투명
4. **네이밍**: kebab-case, 의미 있는 이름

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 초기 작성 | @claude |
