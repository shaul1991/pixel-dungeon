import Phaser from 'phaser';
import { DEBUG, UI_HEIGHT } from '../config';
import { Player } from '../entities/Player';
import type { Direction } from '../entities/Player';
import { NPC } from '../entities/NPC';
import type { NPCConfig } from '../entities/NPC';
import type { MonsterConfig } from '../entities/Monster';
import { InputController } from '../systems/InputController';
import { EncounterSystem } from '../systems/EncounterSystem';
import { SaveSystem } from '../systems/SaveSystem';
import type { SaveData } from '../systems/SaveSystem';
import { DialogBox } from '../ui/DialogBox';
import { StatusUI } from '../ui/StatusUI';
import type { PlayerData, BattleSceneData } from './BattleScene';

interface BattleResultData {
  result: 'win' | 'escape';
  playerHp: number;
  playerMaxHp: number;
  monsterTileX: number;
  monsterTileY: number;
  rewards: { exp: number; gold: number } | null;
  // 플레이어 위치 복원용
  playerTileX: number;
  playerTileY: number;
}

/** Continue 모드 데이터 (저장된 게임 로드) */
interface ContinueData {
  isContinue: true;
  saveData: SaveData;
}

/** GameScene 초기화 데이터 타입 */
type GameSceneInitData = BattleResultData | ContinueData | undefined;

export class GameScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  public groundLayer!: Phaser.Tilemaps.TilemapLayer | null;
  public wallsLayer!: Phaser.Tilemaps.TilemapLayer | null;
  public grassLayer!: Phaser.Tilemaps.TilemapLayer | null;

  // grass 타일 인덱스 (Tiled firstgid=1, 0-indexed에서 4번째 = 타일맵에서 5)
  private static readonly GRASS_TILE_INDEX = 5;

  // 플레이어 관련
  private player!: Player;
  private inputController!: InputController;

  // 플레이어 스탯 (임시 하드코딩)
  private playerStats: PlayerData = {
    hp: 100,
    maxHp: 100,
    mp: 30,
    maxMp: 30,
    attack: 15,
    defense: 5,
  };

  // NPC 관련
  private npcs: NPC[] = [];
  private dialogs!: Record<string, string[]>;

  // 몬스터 데이터 (랜덤 인카운터용)
  private monstersData!: Record<string, MonsterConfig>;

  // 대화창
  private dialogBox!: DialogBox;
  private isInDialog: boolean = false;

  // 스테이터스 UI
  private statusUI!: StatusUI;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private uiBg!: Phaser.GameObjects.Graphics;

  // 디버그 UI
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  // 전투 후 복원할 플레이어 위치
  private savedPlayerPosition: { x: number; y: number } | null = null;

  init(data?: GameSceneInitData): void {
    // Continue 모드 (저장된 게임 로드)
    if (data && 'isContinue' in data && data.isContinue) {
      console.log('GameScene: Loading saved game...');
      const saveData = data.saveData;

      // 저장된 스탯 복원
      this.playerStats = { ...saveData.player.stats };

      // 저장된 위치 복원
      this.savedPlayerPosition = {
        x: saveData.player.tileX,
        y: saveData.player.tileY,
      };

      console.log(`GameScene: Restored from save (${SaveSystem.formatSaveTime(saveData.timestamp)})`);
      return;
    }

    // 전투 결과 처리
    if (data && 'result' in data) {
      // 플레이어 HP 업데이트
      this.playerStats.hp = data.playerHp;

      // 플레이어 위치 복원 (전투 전 위치로)
      this.savedPlayerPosition = {
        x: data.playerTileX,
        y: data.playerTileY,
      };

      if (data.result === 'win' && data.rewards) {
        console.log(`GameScene: Earned ${data.rewards.exp} EXP, ${data.rewards.gold} Gold`);
      }
      return;
    }

    // 새 게임 시작 시 초기화
    this.savedPlayerPosition = null;

    // 새 게임: 기본 스탯으로 초기화
    this.playerStats = {
      hp: 100,
      maxHp: 100,
      mp: 30,
      maxMp: 30,
      attack: 15,
      defense: 5,
    };
  }

  create(): void {
    console.log('GameScene: Starting game...');

    // 배열 초기화 (씬 재시작 시 이전 객체 제거)
    this.npcs = [];

    // 대화 데이터 로드
    this.dialogs = this.cache.json.get('dialogs');

    // 몬스터 데이터 로드 (랜덤 인카운터용)
    this.monstersData = this.cache.json.get('monsters');

    this.createTilemap();
    this.createPlayer();
    this.createNPCs();
    this.setupCamera();
    this.setupInput();

    // 대화창 생성
    this.dialogBox = new DialogBox(this);

    // 스테이터스 UI 생성 (상단 UI 영역에 배치 - 음수 Y 좌표)
    this.statusUI = new StatusUI(this, { x: 4, y: -UI_HEIGHT + 2 });
    this.updateStatusUI();

    // StatusUI는 게임 카메라에서 제외 (UI 카메라에만 표시)
    this.cameras.main.ignore(this.statusUI);

    // 디버그 정보 표시
    if (DEBUG) {
      this.showDebugInfo();
    }
  }

  /**
   * 스테이터스 UI 업데이트
   */
  private updateStatusUI(): void {
    this.statusUI.update({
      hp: this.playerStats.hp,
      maxHp: this.playerStats.maxHp,
      mp: this.playerStats.mp,
      maxMp: this.playerStats.maxMp,
      attack: this.playerStats.attack,
      defense: this.playerStats.defense,
    });
  }

  /**
   * 게임 자동 저장
   */
  private saveGame(): void {
    const pos = this.player.getTilePosition();
    SaveSystem.save(pos.x, pos.y, this.playerStats);
  }

  private createTilemap(): void {
    // 타일맵 생성
    this.map = this.make.tilemap({ key: 'town-map' });

    // 타일셋 추가
    const tileset = this.map.addTilesetImage('dungeon', 'dungeon-tiles');

    if (!tileset) {
      console.error('GameScene: Failed to load tileset');
      return;
    }

    // 레이어 생성
    this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
    this.wallsLayer = this.map.createLayer('walls', tileset, 0, 0);
    this.grassLayer = this.map.createLayer('grass', tileset, 0, 0);

    // 벽 레이어에 충돌 설정
    if (this.wallsLayer) {
      // 벽 타일 (인덱스 2)에 충돌 설정
      this.wallsLayer.setCollisionByExclusion([-1, 0]);
    }

    console.log('GameScene: Tilemap created successfully');
    console.log(`GameScene: Grass layer ${this.grassLayer ? 'loaded' : 'not found'}`);
  }

  private createPlayer(): void {
    let spawnTileX: number;
    let spawnTileY: number;

    // 전투 후 복귀 시 저장된 위치 사용
    if (this.savedPlayerPosition) {
      spawnTileX = this.savedPlayerPosition.x;
      spawnTileY = this.savedPlayerPosition.y;
      console.log(`GameScene: Restoring player to saved position (${spawnTileX}, ${spawnTileY})`);
    } else {
      // 새 게임: 맵 중앙에서 플레이어 스폰
      const centerTileX = Math.floor(this.map.width / 2);
      const centerTileY = Math.floor(this.map.height / 2);

      spawnTileX = centerTileX;
      spawnTileY = centerTileY;

      // 스폰 위치가 벽이면 주변에서 빈 공간 찾기
      if (this.wallsLayer) {
        const tile = this.wallsLayer.getTileAt(centerTileX, centerTileY);
        if (tile && tile.index !== -1) {
          // 스파이럴 검색으로 빈 공간 찾기
          const found = this.findEmptyTile(centerTileX, centerTileY);
          if (found) {
            spawnTileX = found.x;
            spawnTileY = found.y;
          }
        }
      }
    }

    // 플레이어 생성
    this.player = new Player(this, spawnTileX, spawnTileY);
    this.player.setWallsLayer(this.wallsLayer);

    // NPC 충돌 체크 콜백 설정
    this.player.setCollisionCallback((tileX, tileY) => {
      return this.findNPCAt(tileX, tileY) !== null;
    });

    // InputController 생성
    this.inputController = new InputController(this);

    console.log(`GameScene: Player spawned at tile (${spawnTileX}, ${spawnTileY})`);
  }

  private createNPCs(): void {
    // 오브젝트 레이어에서 NPC 데이터 가져오기
    const objectsLayer = this.map.getObjectLayer('objects');

    if (!objectsLayer) {
      console.log('GameScene: No objects layer found');
      return;
    }

    // NPC 오브젝트 찾기 및 생성
    objectsLayer.objects.forEach((obj) => {
      if (obj.type === 'npc') {
        // properties에서 NPC 설정 추출
        const props = obj.properties as Array<{ name: string; value: string }> | undefined;

        if (!props) {
          console.warn(`GameScene: NPC object has no properties`, obj);
          return;
        }

        const config: NPCConfig = {
          id: this.getPropertyValue(props, 'id') || 'unknown',
          name: this.getPropertyValue(props, 'name') || 'NPC',
          dialogKey: this.getPropertyValue(props, 'dialogKey') || '',
        };

        // 타일 좌표 계산 (픽셀 좌표를 타일 좌표로 변환)
        const tileX = Math.floor((obj.x ?? 0) / 16);
        const tileY = Math.floor((obj.y ?? 0) / 16);

        // NPC 생성
        const npc = new NPC(this, tileX, tileY, config);
        this.npcs.push(npc);

        console.log(`GameScene: NPC '${config.name}' created at tile (${tileX}, ${tileY})`);
      }
    });

    console.log(`GameScene: ${this.npcs.length} NPCs created`);
  }

  private getPropertyValue(props: Array<{ name: string; value: string }>, name: string): string | undefined {
    const prop = props.find((p) => p.name === name);
    return prop?.value;
  }

  /**
   * 주어진 타일 좌표에 있는 NPC 찾기
   */
  private findNPCAt(tileX: number, tileY: number): NPC | null {
    for (const npc of this.npcs) {
      const pos = npc.getTilePosition();
      if (pos.x === tileX && pos.y === tileY) {
        return npc;
      }
    }
    return null;
  }

  /**
   * NPC와 대화 시작
   */
  private startDialog(npc: NPC): void {
    const dialogKey = npc.getDialogKey();
    const dialogLines = this.dialogs[dialogKey];

    if (!dialogLines || dialogLines.length === 0) {
      console.warn(`GameScene: No dialog found for key '${dialogKey}'`);
      return;
    }

    this.isInDialog = true;
    this.dialogBox.show(npc.getName(), dialogLines);
    console.log(`GameScene: Started dialog with '${npc.getName()}'`);
  }

  /**
   * 대화 진행 또는 종료
   */
  private advanceDialog(): void {
    const hasMore = this.dialogBox.advance();

    if (!hasMore) {
      this.endDialog();
    }
  }

  /**
   * 대화 종료 - HP/MP 전체 회복
   */
  private endDialog(): void {
    this.dialogBox.hide();
    this.isInDialog = false;

    // HP/MP 전체 회복
    const prevHp = this.playerStats.hp;
    const prevMp = this.playerStats.mp;

    this.playerStats.hp = this.playerStats.maxHp;
    this.playerStats.mp = this.playerStats.maxMp;

    // UI 업데이트
    this.statusUI.update({
      hp: this.playerStats.hp,
      maxHp: this.playerStats.maxHp,
      mp: this.playerStats.mp,
      maxMp: this.playerStats.maxMp,
      attack: this.playerStats.attack,
      defense: this.playerStats.defense,
    });

    // 회복 로그
    const healedHp = this.playerStats.hp - prevHp;
    const healedMp = this.playerStats.mp - prevMp;
    if (healedHp > 0 || healedMp > 0) {
      console.log(`GameScene: Player healed! HP +${healedHp}, MP +${healedMp}`);
    }

    // 자동 저장
    this.saveGame();

    console.log('GameScene: Dialog ended');
  }

  private findEmptyTile(startX: number, startY: number): { x: number; y: number } | null {
    // 스파이럴 검색
    const maxRadius = 10;
    for (let r = 1; r <= maxRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

          const x = startX + dx;
          const y = startY + dy;

          // 맵 범위 확인
          if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) continue;

          // 벽 확인
          if (this.wallsLayer) {
            const tile = this.wallsLayer.getTileAt(x, y);
            if (!tile || tile.index === -1) {
              return { x, y };
            }
          }
        }
      }
    }
    return null;
  }

  private setupCamera(): void {
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;

    // UI 배경 생성 - 음수 Y 좌표에 배치 (게임 영역과 분리)
    // UI 영역은 월드 좌표 (0, -UI_HEIGHT) ~ (480, 0) 범위 사용
    this.uiBg = this.add.graphics();
    this.uiBg.fillStyle(0x1a1a2e, 1);
    this.uiBg.fillRect(0, -UI_HEIGHT, 480, UI_HEIGHT);
    this.uiBg.lineStyle(1, 0x444444, 1);
    this.uiBg.lineBetween(0, -1, 480, -1);
    this.uiBg.setDepth(800);

    // 메인 카메라(게임용): 하단 게임 영역에 뷰포트 설정
    // 월드 좌표 (0, 0) 부터 표시
    this.cameras.main.setViewport(0, UI_HEIGHT, 480, 320);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor('#0d0d0d');

    // 메인 카메라에서 UI 오브젝트 제외
    this.cameras.main.ignore(this.uiBg);

    // UI 카메라: 상단 UI 영역 전용
    // 월드 좌표 (0, -UI_HEIGHT) 부터 표시 (게임 타일맵과 완전 분리)
    this.uiCamera = this.cameras.add(0, 0, 480, UI_HEIGHT);
    this.uiCamera.setScroll(0, -UI_HEIGHT);
    this.uiCamera.setBackgroundColor('#1a1a2e');

    // UI 카메라에서 게임 오브젝트 제외 (혹시 모를 경우 대비)
    if (this.groundLayer) this.uiCamera.ignore(this.groundLayer);
    if (this.wallsLayer) this.uiCamera.ignore(this.wallsLayer);
    if (this.grassLayer) this.uiCamera.ignore(this.grassLayer);
    this.uiCamera.ignore(this.player);
    this.npcs.forEach((npc) => this.uiCamera.ignore(npc));
  }

  private setupInput(): void {
    // ESC 키로 메뉴로 돌아가기
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', () => {
      this.scene.start('MenuScene');
    });
  }

  private showDebugInfo(): void {
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '10px',
      color: '#00ff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 4 },
    });

    this.debugText.setScrollFactor(0); // UI 고정
    this.debugText.setDepth(1000);
  }

  private updateDebugInfo(): void {
    const pos = this.player.getTilePosition();
    const facing = this.player.getFacingTile();
    const facingNpc = this.findNPCAt(facing.x, facing.y);
    const onGrass = this.isGrassTile(pos.x, pos.y);

    this.debugText.setText([
      `Map: ${this.map.width}x${this.map.height} tiles`,
      `Player: (${pos.x}, ${pos.y}) HP: ${this.playerStats.hp}/${this.playerStats.maxHp}`,
      `Facing: (${facing.x}, ${facing.y}) ${this.player.getDirection()}`,
      onGrass ? '[풀숲] 랜덤 인카운터 가능!' : '',
      facingNpc ? `NPC: ${facingNpc.getName()}` : '',
      this.isInDialog ? '[대화 중] Z: 진행' : 'WASD/Arrow: 이동 | ESC: 메뉴',
    ].filter(Boolean).join('\n'));
  }

  /**
   * 주어진 타일이 grass 타일인지 확인
   */
  private isGrassTile(tileX: number, tileY: number): boolean {
    if (!this.grassLayer) return false;

    const tile = this.grassLayer.getTileAt(tileX, tileY);
    return tile !== null && tile.index === GameScene.GRASS_TILE_INDEX;
  }

  /**
   * 랜덤 인카운터 체크 (grass 타일 위에서만)
   */
  private checkRandomEncounter(): void {
    const playerPos = this.player.getTilePosition();

    // grass 타일이 아니면 무시
    if (!this.isGrassTile(playerPos.x, playerPos.y)) {
      return;
    }

    // 인카운터 체크
    const result = EncounterSystem.checkEncounter(this.monstersData);

    if (result.triggered && result.monster) {
      console.log(`GameScene: Wild ${result.monster.name} appeared!`);
      this.startRandomBattle(result.monster);
    }
  }

  /**
   * 랜덤 인카운터로 전투 시작 (고정 위치 없음)
   */
  private startRandomBattle(monsterConfig: MonsterConfig): void {
    const playerPos = this.player.getTilePosition();

    const battleData: BattleSceneData = {
      player: { ...this.playerStats },
      monster: monsterConfig,
      // 랜덤 인카운터는 몬스터 타일 위치가 없으므로 -1로 표시
      monsterTileX: -1,
      monsterTileY: -1,
      playerTileX: playerPos.x,
      playerTileY: playerPos.y,
    };

    console.log(`GameScene: Starting random battle with ${monsterConfig.name}`);
    this.scene.start('BattleScene', battleData);
  }

  update(_time: number, _delta: number): void {
    // 입력 처리
    const input = this.inputController.update();

    // 대화 중이면 대화 진행만 처리
    if (this.isInDialog) {
      if (input.action) {
        this.advanceDialog();
      }
      // 디버그 정보 업데이트
      if (DEBUG) {
        this.updateDebugInfo();
      }
      return;
    }

    // 방향 입력이 있으면 이동 시도
    if (input.direction) {
      const moved = this.player.tryMove(input.direction as Direction);

      // 이동 성공 시
      if (moved) {
        // 자동 저장
        this.saveGame();

        // 랜덤 인카운터 체크 (딜레이 후)
        this.time.delayedCall(100, () => {
          this.checkRandomEncounter();
        });
      }
    }

    // 액션 키 처리 - NPC와 상호작용
    if (input.action) {
      const facing = this.player.getFacingTile();
      const npc = this.findNPCAt(facing.x, facing.y);

      if (npc) {
        this.startDialog(npc);
      }
    }

    // 디버그 정보 업데이트
    if (DEBUG) {
      this.updateDebugInfo();
    }
  }
}
