import Phaser from 'phaser';
import {
  PixelColors,
  PixelColorStrings,
  drawPixelFrame,
  createPixelTextStyle,
} from '../ui/PixelTheme';
import { SaveSystem } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 배경색 설정 (도트 스타일 어두운 배경)
    this.cameras.main.setBackgroundColor('#0f0f1b');

    // 배경 장식 (픽셀 패턴)
    this.createPixelBackground(width, height);

    // 게임 타이틀 프레임
    const titleFrame = this.add.graphics();
    drawPixelFrame(titleFrame, width / 2 - 140, height / 4 - 30, 280, 60, {
      bgColor: PixelColors.bgMedium,
      borderColor: PixelColors.accentGold,
      borderWidth: 2,
      innerBorder: true,
    });

    // 게임 타이틀
    const title = this.add.text(width / 2, height / 4, 'PIXEL DUNGEON', {
      ...createPixelTextStyle('title', PixelColorStrings.accentGold),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 부제목
    const subtitle = this.add.text(width / 2, height / 4 + 25, '- A Roguelike Adventure -', {
      ...createPixelTextStyle('small', PixelColorStrings.textGray),
    });
    subtitle.setOrigin(0.5);

    // 메뉴 프레임
    const menuFrame = this.add.graphics();
    drawPixelFrame(menuFrame, width / 2 - 80, height / 2 - 10, 160, 100, {
      bgColor: PixelColors.bgMedium,
      borderColor: PixelColors.frameMedium,
      borderWidth: 2,
      innerBorder: true,
    });

    // 저장 데이터 확인
    const hasSave = SaveSystem.hasSaveData();
    const saveData = hasSave ? SaveSystem.load() : null;

    // 새 게임 버튼
    this.createPixelButton(width / 2, height / 2 + 15, 'NEW GAME', () => {
      // 새 게임 시작 시 이전 저장 삭제
      SaveSystem.deleteSave();
      this.scene.start('GameScene');
    });

    // Continue 버튼 (저장 데이터 존재 시 활성화)
    this.createPixelButton(width / 2, height / 2 + 55, 'CONTINUE', () => {
      if (saveData) {
        this.scene.start('GameScene', { isContinue: true, saveData });
      }
    }, hasSave);

    // 저장 시간 표시 (저장 데이터 존재 시)
    if (saveData) {
      const saveTimeText = this.add.text(
        width / 2,
        height / 2 + 78,
        `Last: ${SaveSystem.formatSaveTime(saveData.timestamp)}`,
        createPixelTextStyle('small', PixelColorStrings.textDark)
      );
      saveTimeText.setOrigin(0.5);
    }

    // 버전 정보
    const version = this.game.registry.get('gameVersion') || '0.1.0';
    const versionText = this.add.text(width - 8, height - 8, `v${version}`, {
      ...createPixelTextStyle('small', PixelColorStrings.textDark),
    });
    versionText.setOrigin(1, 1);

    // 조작 안내
    const controlsText = this.add.text(8, height - 8, 'WASD/Arrows: Move  Z/Space: Action', {
      ...createPixelTextStyle('small', PixelColorStrings.textDark),
    });
    controlsText.setOrigin(0, 1);
  }

  /**
   * 픽셀 스타일 배경 패턴 생성
   */
  private createPixelBackground(width: number, height: number): void {
    const graphics = this.add.graphics();

    // 그리드 패턴 (미세한 도트 효과)
    graphics.fillStyle(PixelColors.bgLight, 0.1);
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        if ((x + y) % 32 === 0) {
          graphics.fillRect(x, y, 2, 2);
        }
      }
    }

    // 모서리 장식 (픽셀 아트 스타일)
    graphics.fillStyle(PixelColors.frameDark, 0.5);
    // 좌상단
    graphics.fillRect(8, 8, 24, 2);
    graphics.fillRect(8, 8, 2, 24);
    // 우상단
    graphics.fillRect(width - 32, 8, 24, 2);
    graphics.fillRect(width - 10, 8, 2, 24);
    // 좌하단
    graphics.fillRect(8, height - 10, 24, 2);
    graphics.fillRect(8, height - 32, 2, 24);
    // 우하단
    graphics.fillRect(width - 32, height - 10, 24, 2);
    graphics.fillRect(width - 10, height - 32, 2, 24);
  }

  /**
   * 픽셀 스타일 버튼 생성
   */
  private createPixelButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    enabled: boolean = true
  ): void {
    const buttonWidth = 120;
    const buttonHeight = 28;
    const bx = x - buttonWidth / 2;
    const by = y - buttonHeight / 2;

    const buttonBg = this.add.graphics();
    const baseColor = enabled ? PixelColors.bgLight : PixelColors.bgDark;
    const borderColor = enabled ? PixelColors.frameMedium : PixelColors.frameDark;
    const textColor = enabled ? PixelColorStrings.textWhite : PixelColorStrings.textDark;

    // 버튼 그리기 함수
    const drawButton = (
      fillColor: number,
      stroke: number,
      highlight: boolean = false
    ) => {
      buttonBg.clear();

      // 배경
      buttonBg.fillStyle(fillColor, 1);
      buttonBg.fillRect(bx, by, buttonWidth, buttonHeight);

      // 3D 효과 - 상단/왼쪽 밝게
      if (highlight) {
        buttonBg.fillStyle(0xffffff, 0.2);
      } else {
        buttonBg.fillStyle(0xffffff, 0.1);
      }
      buttonBg.fillRect(bx, by, buttonWidth, 2);
      buttonBg.fillRect(bx, by, 2, buttonHeight);

      // 3D 효과 - 하단/오른쪽 어둡게
      buttonBg.fillStyle(0x000000, 0.2);
      buttonBg.fillRect(bx, by + buttonHeight - 2, buttonWidth, 2);
      buttonBg.fillRect(bx + buttonWidth - 2, by, 2, buttonHeight);

      // 테두리
      buttonBg.lineStyle(1, stroke, 1);
      buttonBg.strokeRect(bx, by, buttonWidth, buttonHeight);
    };

    // 초기 상태
    drawButton(baseColor, borderColor);

    // 버튼 텍스트
    const buttonText = this.add.text(x, y, text, {
      ...createPixelTextStyle('medium', textColor),
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);

    if (!enabled) {
      return;
    }

    // 인터랙티브 영역
    const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    // 호버 효과
    hitArea.on('pointerover', () => {
      drawButton(PixelColors.frameLight, PixelColors.accentGold, true);
      buttonText.setColor(PixelColorStrings.accentGold);
    });

    hitArea.on('pointerout', () => {
      drawButton(baseColor, borderColor);
      buttonText.setColor(textColor);
    });

    // 클릭 효과
    hitArea.on('pointerdown', () => {
      drawButton(PixelColors.frameDark, PixelColors.accentGold);
      buttonText.setY(y + 1);
    });

    hitArea.on('pointerup', () => {
      drawButton(baseColor, borderColor);
      buttonText.setY(y);
      callback();
    });
  }
}
