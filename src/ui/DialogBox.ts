import Phaser from 'phaser';
import {
  PixelColors,
  PixelColorStrings,
  createPixelTextStyle,
} from './PixelTheme';

/**
 * DialogBox - 도트 스타일 대화창
 *
 * 8비트/16비트 레트로 스타일의 NPC 대화창
 */
export class DialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private nameBackground: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private dialogText: Phaser.GameObjects.Text;
  private continueIndicator: Phaser.GameObjects.Graphics;

  private currentDialog: string[] = [];
  private currentIndex: number = 0;
  private isTyping: boolean = false;
  private typeSpeed: number = 30; // ms per character
  private typeTimer: Phaser.Time.TimerEvent | null = null;
  private currentText: string = '';
  private targetText: string = '';

  private boxWidth: number;
  private boxHeight: number;
  private padding: number = 12;
  private gameWidth: number;
  private gameHeight: number;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // 게임 화면 크기 기준 (480x320)
    this.gameWidth = scene.cameras.main.width;
    this.gameHeight = scene.cameras.main.height;

    this.boxWidth = this.gameWidth - 20;
    this.boxHeight = 80;

    const boxX = 10;
    const boxY = this.gameHeight - this.boxHeight - 10;

    // 대화창 배경 (도트 스타일 - 직각 모서리)
    this.background = scene.add.graphics();
    this.drawPixelDialogBox(this.background, boxX, boxY, this.boxWidth, this.boxHeight);

    // 이름 배경 (도트 스타일)
    this.nameBackground = scene.add.graphics();

    // 이름 텍스트 (도트 스타일)
    this.nameText = scene.add.text(boxX + 10, boxY - 10, '', {
      ...createPixelTextStyle('medium', PixelColorStrings.textWhite),
      fontStyle: 'bold',
    });

    // 대화 텍스트 (도트 스타일)
    this.dialogText = scene.add.text(boxX + this.padding, boxY + this.padding + 5, '', {
      ...createPixelTextStyle('medium', PixelColorStrings.textWhite),
      wordWrap: { width: this.boxWidth - this.padding * 2 - 10 },
      lineSpacing: 6,
    });

    // 계속 표시 (픽셀 화살표)
    this.continueIndicator = scene.add.graphics();
    this.drawPixelArrow(
      this.continueIndicator,
      this.gameWidth - 30,
      this.gameHeight - 25
    );

    // 컨테이너에 추가
    this.add([
      this.background,
      this.nameBackground,
      this.nameText,
      this.dialogText,
      this.continueIndicator,
    ]);

    // 씬에 추가
    scene.add.existing(this);

    // UI 고정 (카메라 스크롤에 영향 안 받음)
    this.setScrollFactor(0);
    this.setDepth(1000);

    // 깜빡임 애니메이션
    this.createBlinkAnimation();

    // 초기에는 숨김
    this.setVisible(false);
  }

  /**
   * 픽셀 스타일 대화창 그리기
   */
  private drawPixelDialogBox(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    graphics.clear();

    // 메인 배경
    graphics.fillStyle(PixelColors.bgMedium, 0.95);
    graphics.fillRect(x, y, width, height);

    // 내부 밝은 테두리 (상단/왼쪽)
    graphics.fillStyle(PixelColors.frameLight, 0.4);
    graphics.fillRect(x + 2, y + 2, width - 4, 2);
    graphics.fillRect(x + 2, y + 2, 2, height - 4);

    // 내부 어두운 테두리 (하단/오른쪽)
    graphics.fillStyle(PixelColors.bgDark, 0.6);
    graphics.fillRect(x + 2, y + height - 4, width - 4, 2);
    graphics.fillRect(x + width - 4, y + 2, 2, height - 4);

    // 외부 테두리 (2픽셀)
    graphics.lineStyle(2, PixelColors.frameMedium, 1);
    graphics.strokeRect(x, y, width, height);

    // 장식용 모서리 (8비트 스타일)
    graphics.fillStyle(PixelColors.accentGold, 1);
    // 좌상단
    graphics.fillRect(x + 4, y + 4, 4, 2);
    graphics.fillRect(x + 4, y + 4, 2, 4);
    // 우상단
    graphics.fillRect(x + width - 8, y + 4, 4, 2);
    graphics.fillRect(x + width - 6, y + 4, 2, 4);
    // 좌하단
    graphics.fillRect(x + 4, y + height - 6, 4, 2);
    graphics.fillRect(x + 4, y + height - 8, 2, 4);
    // 우하단
    graphics.fillRect(x + width - 8, y + height - 6, 4, 2);
    graphics.fillRect(x + width - 6, y + height - 8, 2, 4);
  }

  /**
   * 이름 배경 그리기 (도트 스타일)
   */
  private drawNameBackground(name: string): void {
    const boxX = 10;
    const boxY = this.gameHeight - this.boxHeight - 10;
    const nameWidth = Math.max(80, name.length * 8 + 24);

    this.nameBackground.clear();

    // 이름 박스 배경
    this.nameBackground.fillStyle(PixelColors.accentBlue, 1);
    this.nameBackground.fillRect(boxX + 6, boxY - 14, nameWidth, 20);

    // 밝은 테두리 (상단/왼쪽)
    this.nameBackground.fillStyle(0xffffff, 0.3);
    this.nameBackground.fillRect(boxX + 6, boxY - 14, nameWidth, 2);
    this.nameBackground.fillRect(boxX + 6, boxY - 14, 2, 20);

    // 어두운 테두리 (하단/오른쪽)
    this.nameBackground.fillStyle(0x000000, 0.3);
    this.nameBackground.fillRect(boxX + 6, boxY + 4, nameWidth, 2);
    this.nameBackground.fillRect(boxX + 6 + nameWidth - 2, boxY - 14, 2, 20);

    // 외부 테두리
    this.nameBackground.lineStyle(1, PixelColors.frameDark, 1);
    this.nameBackground.strokeRect(boxX + 6, boxY - 14, nameWidth, 20);

    // 이름 텍스트 위치 업데이트
    this.nameText.setPosition(boxX + 6 + nameWidth / 2, boxY - 4);
    this.nameText.setOrigin(0.5);
  }

  /**
   * 픽셀 화살표 그리기 (▼ 대신)
   */
  private drawPixelArrow(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    graphics.clear();
    graphics.fillStyle(PixelColors.accentGold, 1);

    // 픽셀 아트 스타일 아래 화살표
    graphics.fillRect(x - 4, y, 8, 2);
    graphics.fillRect(x - 3, y + 2, 6, 2);
    graphics.fillRect(x - 2, y + 4, 4, 2);
    graphics.fillRect(x - 1, y + 6, 2, 2);
  }

  private createBlinkAnimation(): void {
    this.scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * 대화창 표시
   * @param speakerName 화자 이름
   * @param dialogLines 대화 라인 배열
   */
  public show(speakerName: string, dialogLines: string[]): void {
    this.currentDialog = dialogLines;
    this.currentIndex = 0;

    // 이름 설정 (도트 스타일)
    this.nameText.setText(speakerName);
    this.drawNameBackground(speakerName);

    // 첫 대화 표시
    this.showCurrentLine();

    this.setVisible(true);
  }

  /**
   * 현재 대화 라인 표시
   */
  private showCurrentLine(): void {
    if (this.currentIndex >= this.currentDialog.length) {
      return;
    }

    this.targetText = this.currentDialog[this.currentIndex];
    this.currentText = '';
    this.dialogText.setText('');
    this.isTyping = true;
    this.continueIndicator.setVisible(false);

    // 타이핑 시작
    this.startTyping();
  }

  /**
   * 타이핑 효과 시작
   */
  private startTyping(): void {
    if (this.typeTimer) {
      this.typeTimer.destroy();
    }

    this.typeTimer = this.scene.time.addEvent({
      delay: this.typeSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: this.targetText.length - 1,
    });
  }

  /**
   * 다음 문자 출력
   */
  private typeNextChar(): void {
    this.currentText += this.targetText[this.currentText.length];
    this.dialogText.setText(this.currentText);

    if (this.currentText.length >= this.targetText.length) {
      this.isTyping = false;
      this.continueIndicator.setVisible(true);
    }
  }

  /**
   * 대화 진행
   * @returns true이면 대화 계속, false이면 대화 종료
   */
  public advance(): boolean {
    // 타이핑 중이면 전체 텍스트 즉시 표시
    if (this.isTyping) {
      if (this.typeTimer) {
        this.typeTimer.destroy();
        this.typeTimer = null;
      }
      this.currentText = this.targetText;
      this.dialogText.setText(this.currentText);
      this.isTyping = false;
      this.continueIndicator.setVisible(true);
      return true;
    }

    // 다음 대화로 이동
    this.currentIndex++;

    if (this.currentIndex < this.currentDialog.length) {
      this.showCurrentLine();
      return true;
    }

    // 대화 종료
    return false;
  }

  /**
   * 대화창 숨김
   */
  public hide(): void {
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }

    this.currentDialog = [];
    this.currentIndex = 0;
    this.isTyping = false;
    this.setVisible(false);
  }

  /**
   * 대화창 표시 여부
   */
  public isShowing(): boolean {
    return this.visible;
  }

  /**
   * 타이핑 중 여부
   */
  public getIsTyping(): boolean {
    return this.isTyping;
  }
}
