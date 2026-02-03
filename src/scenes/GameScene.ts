import Phaser from 'phaser';
import { DEBUG } from '../config';
import { Player } from '../entities/Player';
import type { Direction } from '../entities/Player';
import { NPC } from '../entities/NPC';
import type { NPCConfig } from '../entities/NPC';
import type { MonsterConfig } from '../entities/Monster';
import { InputController } from '../systems/InputController';
import { EncounterSystem } from '../systems/EncounterSystem';
import { DialogBox } from '../ui/DialogBox';
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

  // 디버그 UI
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  // 전투 후 복원할 플레이어 위치
  private savedPlayerPosition: { x: number; y: number } | null = null;

  init(data?: BattleResultData): void {
    // 전투 결과 처리
    if (data && data.result) {
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
    } else {
      // 새 게임 시작 시 초기화
      this.savedPlayerPosition = null;
    }
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

    // 디버그 정보 표시
    if (DEBUG) {
      this.showDebugInfo();
    }
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
   * 대화 종료
   */
  private endDialog(): void {
    this.dialogBox.hide();
    this.isInDialog = false;
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
    // 카메라가 맵 전체를 볼 수 있도록 설정
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // 카메라가 플레이어를 따라가도록 설정
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 배경색 설정
    this.cameras.main.setBackgroundColor('#0d0d0d');
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

      // 이동 성공 시 랜덤 인카운터 체크 (딜레이 후)
      if (moved) {
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
