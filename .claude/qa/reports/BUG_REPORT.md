# Bug Report

버그 수정 이력을 누적 관리하는 문서입니다.

---

## 요약

| 총 버그 | 수정됨 | 미수정 | 검증 완료 |
|--------|-------|-------|----------|
| 3 | 3 | 0 | 3 |

---

## 버그 목록

### BUG-001: 처치한 몬스터가 다시 나타남

| 항목 | 내용 |
|------|------|
| **상태** | ✅ 수정됨 |
| **우선순위** | 높음 |
| **발견일** | 2026-02-03 |
| **수정일** | 2026-02-03 |
| **검증** | ✅ 완료 (2026-02-03) |

#### 증상
- 몬스터를 처치하고 전투에서 승리한 후, 해당 위치로 다시 이동하면 몬스터와 전투가 다시 발생함

#### 원인
1. `monsters` 배열이 씬 재시작 시 초기화되지 않음
2. Phaser에서 `scene.start()`로 같은 씬 재시작 시 클래스 인스턴스는 재사용됨
3. 이전에 destroy된 Monster 객체들이 `monsters` 배열에 남아있음
4. `findMonsterAt()`에서 destroy된 객체를 찾아서 전투 시작

#### 수정 내용
```typescript
// GameScene.ts - create() 시작 부분에 배열 초기화 추가
create(): void {
  // 배열 초기화 (씬 재시작 시 이전 객체 제거)
  this.monsters = [];
  this.npcs = [];
  // ...
}
```

#### 기대 결과
- [x] 몬스터 처치 후 해당 위치 재방문 시 전투 발생 안함
- [x] 게임 재시작 전까지 처치 상태 유지

#### 관련 파일
- `src/scenes/GameScene.ts`

---

### BUG-002: 처치한 몬스터 상태가 유지되지 않음

| 항목 | 내용 |
|------|------|
| **상태** | ✅ 수정됨 |
| **우선순위** | 높음 |
| **발견일** | 2026-02-03 |
| **수정일** | 2026-02-03 |
| **검증** | ✅ 완료 (2026-02-03) |

#### 증상
- 몬스터를 처치해도 씬 전환 후 다시 나타남
- `defeatedMonsters` Set이 씬 재시작 시 초기화됨

#### 원인
1. `defeatedMonsters`가 클래스 속성으로 선언됨
2. Phaser 씬 재시작 시 클래스 속성 초기화가 `init()` 전에 실행될 수 있음
3. 처치 기록이 유실됨

#### 수정 내용
```typescript
// GameScene.ts - defeatedMonsters를 Registry로 이동

// 클래스 속성 제거
// private defeatedMonsters: Set<string> = new Set(); // 삭제

// init()에서 Registry 사용
init(data?: BattleResultData): void {
  let defeatedMonsters = this.registry.get('defeatedMonsters') as Set<string> | undefined;
  if (!defeatedMonsters) {
    defeatedMonsters = new Set<string>();
    this.registry.set('defeatedMonsters', defeatedMonsters);
  }

  if (data?.result === 'win') {
    const monsterKey = `${data.monsterTileX},${data.monsterTileY}`;
    defeatedMonsters.add(monsterKey);
    this.registry.set('defeatedMonsters', defeatedMonsters);
  }
}

// createMonsters()에서 Registry 조회
private createMonsters(): void {
  const defeatedMonsters = this.registry.get('defeatedMonsters') as Set<string> || new Set();
  // ...
  if (defeatedMonsters.has(monsterKey)) {
    return; // 처치된 몬스터는 생성 안함
  }
}
```

#### 기대 결과
- [x] 몬스터 처치 상태가 씬 전환 후에도 유지됨
- [x] 처치된 위치에 몬스터 재생성 안됨

#### 관련 파일
- `src/scenes/GameScene.ts`

---

### BUG-003: 전투 후 플레이어가 고정 위치에서 시작

| 항목 | 내용 |
|------|------|
| **상태** | ✅ 수정됨 |
| **우선순위** | 중간 |
| **발견일** | 2026-02-03 |
| **수정일** | 2026-02-03 |
| **검증** | ✅ 완료 (2026-02-03) |

#### 증상
- 전투가 끝났을 때, 몬스터와 조우한 위치가 아닌 항상 맵 중앙에서 재시작됨

#### 원인
1. BattleScene에서 GameScene으로 돌아올 때 플레이어 위치 정보를 전달하지 않음
2. GameScene.createPlayer()에서 항상 맵 중앙을 스폰 위치로 사용

#### 수정 내용
```typescript
// BattleSceneData에 플레이어 위치 추가
export interface BattleSceneData {
  // ... 기존 필드
  playerTileX: number;
  playerTileY: number;
}

// GameScene.startBattle()에서 플레이어 위치 전달
private startBattle(monster: Monster): void {
  const playerPos = this.player.getTilePosition();
  const battleData: BattleSceneData = {
    // ...
    playerTileX: playerPos.x,
    playerTileY: playerPos.y,
  };
}

// BattleScene.endBattle()에서 위치 반환
private endBattle(result: BattleResult): void {
  const resultData = {
    // ...
    playerTileX: this.playerTileX,
    playerTileY: this.playerTileY,
  };
}

// GameScene.createPlayer()에서 저장된 위치 사용
private createPlayer(): void {
  if (this.savedPlayerPosition) {
    spawnTileX = this.savedPlayerPosition.x;
    spawnTileY = this.savedPlayerPosition.y;
  } else {
    // 새 게임: 맵 중앙
  }
}
```

#### 기대 결과
- [x] 전투 후 플레이어가 전투 시작 위치에서 복귀
- [x] 새 게임 시작 시 맵 중앙에서 시작

#### 관련 파일
- `src/scenes/GameScene.ts`
- `src/scenes/BattleScene.ts`

---

## 검증 체크리스트

### BUG-001 검증 ✅
- [x] 몬스터 처치 후 해당 타일 재방문
- [x] 전투 발생하지 않음 확인
- [x] 다른 몬스터는 정상 작동 확인

### BUG-002 검증 ✅
- [x] 몬스터 처치 후 도망으로 씬 재시작
- [x] 처치한 몬스터는 없음 확인
- [x] 다른 몬스터는 존재 확인

### BUG-003 검증 ✅
- [x] 전투 전 플레이어 위치 기억
- [x] 전투 승리 후 같은 위치 복귀 확인
- [x] 전투 도망 후 같은 위치 복귀 확인

---

## 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-02-03 | BUG-001, BUG-002, BUG-003 검증 완료 |
| 2026-02-03 | BUG-001, BUG-002, BUG-003 수정 완료 |
| 2026-02-03 | 버그 리포트 문서 생성 |
