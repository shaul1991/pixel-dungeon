import Phaser from 'phaser';
import {
  PixelColors,
  PixelColorStrings,
  drawPixelFrame,
  createPixelTextStyle,
} from '../ui/PixelTheme';
import { SaveSystem } from '../systems/SaveSystem';

interface MenuButton {
  index: number;
  x: number;
  y: number;
  text: string;
  buttonBg: Phaser.GameObjects.Graphics;
  buttonText: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Rectangle | null;
  callback: () => void;
  enabled: boolean;
  baseColor: number;
  borderColor: number;
  textColor: string;
}

export class MenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex: number = 0;
  private selector!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 버튼 배열 초기화
    this.buttons = [];
    this.selectedIndex = 0;

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
    this.createPixelButton(0, width / 2, height / 2 + 15, 'NEW GAME', () => {
      SaveSystem.deleteSave();
      this.scene.start('GameScene');
    });

    // Continue 버튼 (저장 데이터 존재 시 활성화)
    this.createPixelButton(1, width / 2, height / 2 + 55, 'CONTINUE', () => {
      if (saveData) {
        this.scene.start('GameScene', { isContinue: true, saveData });
      }
    }, hasSave);

    // 선택 커서 생성 (화살표)
    this.selector = this.add.text(0, 0, '▶', {
      ...createPixelTextStyle('medium', PixelColorStrings.accentGold),
    });
    this.selector.setOrigin(0.5);

    // 저장 데이터 없으면 NEW GAME 선택, 있으면 CONTINUE 선택
    this.selectedIndex = hasSave ? 1 : 0;
    this.updateSelection();

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

    // 조작 안내 (화살표 키 추가)
    const controlsText = this.add.text(8, height - 8, '↑↓: Select  Enter/Space: Confirm', {
      ...createPixelTextStyle('small', PixelColorStrings.textDark),
    });
    controlsText.setOrigin(0, 1);

    // 키보드 입력 설정
    this.setupKeyboardInput();
  }

  /**
   * 키보드 입력 설정
   */
  private setupKeyboardInput(): void {
    // 위 화살표
    this.input.keyboard!.on('keydown-UP', () => {
      this.navigateUp();
    });

    // 아래 화살표
    this.input.keyboard!.on('keydown-DOWN', () => {
      this.navigateDown();
    });

    // W 키
    this.input.keyboard!.on('keydown-W', () => {
      this.navigateUp();
    });

    // S 키
    this.input.keyboard!.on('keydown-S', () => {
      this.navigateDown();
    });

    // Enter / Space / Z 키로 선택
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.confirmSelection();
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.confirmSelection();
    });

    this.input.keyboard!.on('keydown-Z', () => {
      this.confirmSelection();
    });
  }

  /**
   * 위로 이동
   */
  private navigateUp(): void {
    // 활성화된 버튼 중에서 위로 이동
    let newIndex = this.selectedIndex - 1;
    while (newIndex >= 0) {
      if (this.buttons[newIndex].enabled) {
        this.selectedIndex = newIndex;
        this.updateSelection();
        return;
      }
      newIndex--;
    }
  }

  /**
   * 아래로 이동
   */
  private navigateDown(): void {
    // 활성화된 버튼 중에서 아래로 이동
    let newIndex = this.selectedIndex + 1;
    while (newIndex < this.buttons.length) {
      if (this.buttons[newIndex].enabled) {
        this.selectedIndex = newIndex;
        this.updateSelection();
        return;
      }
      newIndex++;
    }
  }

  /**
   * 선택 확인
   */
  private confirmSelection(): void {
    const button = this.buttons[this.selectedIndex];
    if (button && button.enabled) {
      // 클릭 효과
      this.drawButton(button, PixelColors.frameDark, PixelColors.accentGold);
      button.buttonText.setY(button.y + 1);

      // 약간의 딜레이 후 콜백 실행
      this.time.delayedCall(100, () => {
        button.callback();
      });
    }
  }

  /**
   * 선택 상태 업데이트
   */
  private updateSelection(): void {
    // 모든 버튼 상태 초기화
    this.buttons.forEach((button, index) => {
      if (index === this.selectedIndex && button.enabled) {
        // 선택된 버튼 하이라이트
        this.drawButton(button, PixelColors.frameLight, PixelColors.accentGold, true);
        button.buttonText.setColor(PixelColorStrings.accentGold);

        // 선택 커서 위치 업데이트
        this.selector.setPosition(button.x - 70, button.y);
        this.selector.setVisible(true);
      } else if (button.enabled) {
        // 비선택 버튼 기본 상태
        this.drawButton(button, button.baseColor, button.borderColor);
        button.buttonText.setColor(button.textColor);
      }
    });
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
   * 버튼 그리기
   */
  private drawButton(
    button: MenuButton,
    fillColor: number,
    stroke: number,
    highlight: boolean = false
  ): void {
    const buttonWidth = 120;
    const buttonHeight = 28;
    const bx = button.x - buttonWidth / 2;
    const by = button.y - buttonHeight / 2;

    button.buttonBg.clear();

    // 배경
    button.buttonBg.fillStyle(fillColor, 1);
    button.buttonBg.fillRect(bx, by, buttonWidth, buttonHeight);

    // 3D 효과 - 상단/왼쪽 밝게
    if (highlight) {
      button.buttonBg.fillStyle(0xffffff, 0.2);
    } else {
      button.buttonBg.fillStyle(0xffffff, 0.1);
    }
    button.buttonBg.fillRect(bx, by, buttonWidth, 2);
    button.buttonBg.fillRect(bx, by, 2, buttonHeight);

    // 3D 효과 - 하단/오른쪽 어둡게
    button.buttonBg.fillStyle(0x000000, 0.2);
    button.buttonBg.fillRect(bx, by + buttonHeight - 2, buttonWidth, 2);
    button.buttonBg.fillRect(bx + buttonWidth - 2, by, 2, buttonHeight);

    // 테두리
    button.buttonBg.lineStyle(1, stroke, 1);
    button.buttonBg.strokeRect(bx, by, buttonWidth, buttonHeight);
  }

  /**
   * 픽셀 스타일 버튼 생성
   */
  private createPixelButton(
    index: number,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    enabled: boolean = true
  ): void {
    const buttonWidth = 120;
    const buttonHeight = 28;

    const buttonBg = this.add.graphics();
    const baseColor = enabled ? PixelColors.bgLight : PixelColors.bgDark;
    const borderColor = enabled ? PixelColors.frameMedium : PixelColors.frameDark;
    const textColor = enabled ? PixelColorStrings.textWhite : PixelColorStrings.textDark;

    // 버튼 정보 저장
    const button: MenuButton = {
      index,
      x,
      y,
      text,
      buttonBg,
      buttonText: null as unknown as Phaser.GameObjects.Text,
      hitArea: null,
      callback,
      enabled,
      baseColor,
      borderColor,
      textColor,
    };

    // 초기 상태
    this.drawButton(button, baseColor, borderColor);

    // 버튼 텍스트
    const buttonText = this.add.text(x, y, text, {
      ...createPixelTextStyle('medium', textColor),
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);
    button.buttonText = buttonText;

    // 버튼 배열에 추가
    this.buttons.push(button);

    if (!enabled) {
      return;
    }

    // 인터랙티브 영역 (마우스용)
    const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });
    button.hitArea = hitArea;

    // 호버 효과
    hitArea.on('pointerover', () => {
      this.selectedIndex = index;
      this.updateSelection();
    });

    hitArea.on('pointerout', () => {
      // 마우스가 나가도 선택 상태 유지
    });

    // 클릭 효과
    hitArea.on('pointerdown', () => {
      this.drawButton(button, PixelColors.frameDark, PixelColors.accentGold);
      buttonText.setY(y + 1);
    });

    hitArea.on('pointerup', () => {
      this.drawButton(button, baseColor, borderColor);
      buttonText.setY(y);
      callback();
    });
  }
}
