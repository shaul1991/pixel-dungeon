import Phaser from 'phaser';

export class DialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private nameBackground: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private dialogText: Phaser.GameObjects.Text;
  private continueIndicator: Phaser.GameObjects.Text;

  private currentDialog: string[] = [];
  private currentIndex: number = 0;
  private isTyping: boolean = false;
  private typeSpeed: number = 30; // ms per character
  private typeTimer: Phaser.Time.TimerEvent | null = null;
  private currentText: string = '';
  private targetText: string = '';

  private boxWidth: number;
  private boxHeight: number;
  private padding: number = 10;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // 게임 화면 크기 기준 (480x320)
    const gameWidth = scene.cameras.main.width;
    const gameHeight = scene.cameras.main.height;

    this.boxWidth = gameWidth - 20;
    this.boxHeight = 80;

    // 대화창 배경 (화면 하단)
    this.background = scene.add.rectangle(
      gameWidth / 2,
      gameHeight - this.boxHeight / 2 - 10,
      this.boxWidth,
      this.boxHeight,
      0x000000,
      0.85
    );
    this.background.setStrokeStyle(2, 0x4a90d9);

    // 이름 배경
    this.nameBackground = scene.add.rectangle(
      30 + 50,
      gameHeight - this.boxHeight - 10 + 12,
      100,
      20,
      0x4a90d9,
      1
    );

    // 이름 텍스트
    this.nameText = scene.add.text(
      30 + 50,
      gameHeight - this.boxHeight - 10 + 12,
      '',
      {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }
    );
    this.nameText.setOrigin(0.5);

    // 대화 텍스트
    this.dialogText = scene.add.text(
      20 + this.padding,
      gameHeight - this.boxHeight - 10 + 25,
      '',
      {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'monospace',
        wordWrap: { width: this.boxWidth - this.padding * 2 - 10 },
        lineSpacing: 4,
      }
    );

    // 계속 표시 (▼)
    this.continueIndicator = scene.add.text(
      gameWidth - 30,
      gameHeight - 20,
      '▼',
      {
        fontSize: '12px',
        color: '#4a90d9',
        fontFamily: 'monospace',
      }
    );
    this.continueIndicator.setOrigin(0.5);

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

    // 이름 설정
    this.nameText.setText(`[${speakerName}]`);
    this.nameBackground.width = this.nameText.width + 20;

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
