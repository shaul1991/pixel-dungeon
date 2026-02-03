import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingScreen();
    this.loadAssets();
  }

  create(): void {
    console.log('PreloadScene: All assets loaded');

    // 플레이어 애니메이션 생성
    this.createPlayerAnimations();

    this.scene.start('MenuScene');
  }

  private createPlayerAnimations(): void {
    // 4방향 걷기 애니메이션
    this.anims.create({
      key: 'player-walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    // 4방향 idle 애니메이션 (첫 프레임만)
    this.anims.create({
      key: 'player-idle-down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-idle-left',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-idle-right',
      frames: [{ key: 'player', frame: 8 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-idle-up',
      frames: [{ key: 'player', frame: 12 }],
      frameRate: 1,
    });

    console.log('PreloadScene: Player animations created');
  }

  private createLoadingScreen(): void {
    const { width, height } = this.cameras.main;

    // 로딩 바 배경
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x333333, 1);
    this.loadingBar.fillRect(width / 4, height / 2 - 10, width / 2, 20);

    // 프로그레스 바
    this.progressBar = this.add.graphics();

    // 로딩 텍스트
    this.loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.loadingText.setOrigin(0.5);

    // 로딩 진행률 이벤트
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x4a90d9, 1);
      this.progressBar.fillRect(
        width / 4 + 2,
        height / 2 - 8,
        (width / 2 - 4) * value,
        16
      );
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingBar.destroy();
      this.progressBar.destroy();
      this.loadingText.destroy();
    });
  }

  private loadAssets(): void {
    // 타일셋 이미지 로드
    this.load.image('dungeon-tiles', 'assets/images/tiles/dungeon.png');

    // 타일맵 JSON 로드
    this.load.tilemapTiledJSON('town-map', 'assets/maps/town.json');

    // 플레이어 스프라이트시트 로드 (64x64, 4x4 그리드, 16x16 프레임)
    this.load.spritesheet('player', 'assets/images/characters/player.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // NPC 스프라이트 로드 (16x16 단일 프레임)
    this.load.image('npc', 'assets/images/characters/npc.png');

    // 대화 데이터 로드
    this.load.json('dialogs', 'assets/data/dialogs.json');

    // 몬스터 스프라이트 로드
    this.load.image('slime', 'assets/images/monsters/slime.png');

    // 몬스터 데이터 로드
    this.load.json('monsters', 'assets/data/monsters.json');
  }
}
