# Scene Agent

**역할**: Phaser 씬 개발 전문가
**목적**: 게임 씬의 라이프사이클, 전환, 오브젝트 조합 관리

---

## 담당 영역

```
src/scenes/
├── BootScene.ts        # 초기화 씬
├── PreloadScene.ts     # 에셋 로딩 씬
├── MenuScene.ts        # 메인 메뉴
├── GameScene.ts        # 메인 게임플레이
├── BattleScene.ts      # 전투 씬
└── index.ts            # 씬 export
```

---

## 작업 범위

### 생성

| 대상 | 설명 |
|------|------|
| 새 씬 | Phaser.Scene 상속 클래스 |
| 씬 설정 | init(), preload(), create(), update() |
| 오브젝트 조합 | 엔티티, UI, 시스템 통합 |

### 수정

| 대상 | 설명 |
|------|------|
| 씬 로직 | 게임플레이 흐름 변경 |
| 씬 전환 | 전환 조건, 데이터 전달 |
| 오브젝트 배치 | 위치, 레이어 조정 |

---

## 씬 구조

### 라이프사이클

```typescript
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // 1. 데이터 초기화 (씬 시작 시 호출)
  init(data: SceneData): void {
    this.playerData = data.player;
  }

  // 2. 에셋 로딩 (필요 시)
  preload(): void { }

  // 3. 오브젝트 생성
  create(): void {
    this.createMap();
    this.createPlayer();
    this.setupCollisions();
    this.setupInput();
  }

  // 4. 게임 루프
  update(time: number, delta: number): void {
    this.player.update(delta);
  }
}
```

### 씬 흐름

```
BootScene → PreloadScene → MenuScene → GameScene ↔ BattleScene
    │            │             │           │            │
  초기화      에셋 로드     메뉴 표시   게임플레이    전투
```

---

## 워크플로우

### 새 씬 생성

```
1. 씬 클래스 생성 (scenes/[Name]Scene.ts)
   - Phaser.Scene 상속
   - constructor에서 key 설정

2. 씬 등록 (config.ts)
   - scene 배열에 추가

3. 라이프사이클 구현
   - init(): 데이터 수신
   - create(): 오브젝트 생성
   - update(): 게임 루프

4. 씬 전환 구현
   - this.scene.start('SceneName', data)

5. 검증
   - 씬 전환 테스트
   - 메모리 누수 확인
```

### 씬 전환 패턴

```typescript
// 데이터 전달
this.scene.start('BattleScene', {
  player: this.player.serialize(),
  enemy: this.enemy.serialize(),
  returnScene: 'GameScene',
});

// 데이터 수신
init(data: BattleSceneData): void {
  this.playerData = data.player;
  this.enemyData = data.enemy;
  this.returnScene = data.returnScene;
}
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/new-feature` | 새 씬 추가 시 사용 |
| `/bugfix` | 씬 버그 수정 시 사용 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- Scene, 씬
- 화면, 전환
- 게임플레이, 메뉴
- 로딩, 초기화

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **Entity** | 씬에서 엔티티 생성/관리 |
| **System** | 씬에서 시스템 초기화/호출 |
| **UI** | 씬에 UI 컴포넌트 배치 |
| **Asset** | PreloadScene에서 에셋 로드 |

---

## 규칙

1. **씬 책임 분리**: 씬은 조합만, 복잡한 로직은 System으로
2. **데이터 전달**: 씬 전환 시 필요한 데이터만 전달
3. **메모리 관리**: 씬 종료 시 리소스 정리
4. **레이어 순서**: Ground → Objects → Entities → UI

```typescript
// Good ✅ - 시스템 위임
const damage = BattleSystem.calculateDamage(attacker, defender);

// Bad ❌ - 씬에서 직접 계산
const damage = this.player.attack - this.enemy.defense / 2;
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 상세 구조로 확장 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
