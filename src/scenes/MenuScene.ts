import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 배경색 설정
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 게임 타이틀
    const title = this.add.text(width / 2, height / 3, 'Pixel Dungeon', {
      fontSize: '32px',
      color: '#e94560',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 부제목
    const subtitle = this.add.text(width / 2, height / 3 + 40, 'A Roguelike Adventure', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    subtitle.setOrigin(0.5);

    // 새 게임 버튼
    this.createButton(width / 2, height / 2 + 30, 'New Game', () => {
      this.scene.start('GameScene');
    });

    // 버전 정보
    const version = this.game.registry.get('gameVersion') || '0.1.0';
    const versionText = this.add.text(width - 10, height - 10, `v${version}`, {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'monospace',
    });
    versionText.setOrigin(1, 1);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    // 버튼 배경
    const buttonBg = this.add.graphics();
    const buttonWidth = 120;
    const buttonHeight = 30;

    buttonBg.fillStyle(0x16213e, 1);
    buttonBg.fillRoundedRect(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      5
    );

    // 버튼 테두리
    buttonBg.lineStyle(2, 0x4a90d9, 1);
    buttonBg.strokeRoundedRect(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      5
    );

    // 버튼 텍스트
    const buttonText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    buttonText.setOrigin(0.5);

    // 인터랙티브 영역 생성
    const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    // 호버 효과
    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x1f3460, 1);
      buttonBg.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        5
      );
      buttonBg.lineStyle(2, 0x6bb5ff, 1);
      buttonBg.strokeRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        5
      );
      buttonText.setColor('#6bb5ff');
    });

    hitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x16213e, 1);
      buttonBg.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        5
      );
      buttonBg.lineStyle(2, 0x4a90d9, 1);
      buttonBg.strokeRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        5
      );
      buttonText.setColor('#ffffff');
    });

    hitArea.on('pointerdown', callback);
  }
}
