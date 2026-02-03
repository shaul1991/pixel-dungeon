import Phaser from 'phaser';
import {
  PixelColors,
  PixelColorStrings,
  createPixelTextStyle,
  drawPixelFrame,
} from './PixelTheme';

export interface LevelUpDisplayData {
  oldLevel: number;
  newLevel: number;
  statChanges: {
    maxHp: number;
    maxMp: number;
    attackMin: number;
    attackMax: number;
    defense: number;
  };
}

/**
 * LevelUpUI - 레벨업 알림 UI (도트 스타일)
 *
 * 레벨업 시 화면 중앙에 표시되는 축하 메시지와 스탯 증가량
 * 페이드 인/아웃 애니메이션 포함
 */
export class LevelUpUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  // UI 크기
  private static readonly WIDTH = 140;
  private static readonly HEIGHT = 80;
  private static readonly DISPLAY_DURATION = 2500; // 표시 시간 (ms)
  private static readonly FADE_DURATION = 300; // 페이드 시간 (ms)

  constructor(scene: Phaser.Scene) {
    // 화면 중앙에 배치
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2 - 20;
    super(scene, centerX, centerY);

    this.createBackground();
    this.createTexts();

    // 초기 상태: 투명
    this.setAlpha(0);
    this.setVisible(false);

    // 최상위 깊이
    this.setDepth(1000);

    scene.add.existing(this);
  }

  /**
   * 배경 패널 생성
   */
  private createBackground(): void {
    this.background = this.scene.add.graphics();

    // 중앙 정렬을 위해 오프셋 계산
    const offsetX = -LevelUpUI.WIDTH / 2;
    const offsetY = -LevelUpUI.HEIGHT / 2;

    // 외부 글로우 효과
    this.background.fillStyle(PixelColors.accentGold, 0.3);
    this.background.fillRect(offsetX - 4, offsetY - 4, LevelUpUI.WIDTH + 8, LevelUpUI.HEIGHT + 8);

    // 메인 프레임
    drawPixelFrame(this.background, offsetX, offsetY, LevelUpUI.WIDTH, LevelUpUI.HEIGHT, {
      bgColor: PixelColors.bgMedium,
      borderColor: PixelColors.accentGold,
      borderWidth: 2,
      innerBorder: true,
    });

    this.add(this.background);
  }

  /**
   * 텍스트 요소 생성
   */
  private createTexts(): void {
    // "LEVEL UP!" 타이틀
    this.titleText = this.scene.add.text(0, -28, 'LEVEL UP!', {
      ...createPixelTextStyle('large', PixelColorStrings.accentGold),
      fontStyle: 'bold',
    });
    this.titleText.setOrigin(0.5);
    this.add(this.titleText);

    // 레벨 표시 (예: "Lv.1 → Lv.2")
    this.levelText = this.scene.add.text(0, -10, '', createPixelTextStyle('medium', PixelColorStrings.textWhite));
    this.levelText.setOrigin(0.5);
    this.add(this.levelText);

    // 스탯 증가량
    this.statsText = this.scene.add.text(0, 10, '', {
      ...createPixelTextStyle('small', PixelColorStrings.hpGreen),
      lineSpacing: 2,
      align: 'center',
    });
    this.statsText.setOrigin(0.5, 0);
    this.add(this.statsText);
  }

  /**
   * 레벨업 표시
   */
  public show(data: LevelUpDisplayData): void {
    // 레벨 텍스트 업데이트
    this.levelText.setText(`Lv.${data.oldLevel} → Lv.${data.newLevel}`);

    // 스탯 증가량 텍스트
    const statsLines = [
      `HP +${data.statChanges.maxHp}  MP +${data.statChanges.maxMp}`,
      `ATK +${data.statChanges.attackMin}-${data.statChanges.attackMax}  DEF +${data.statChanges.defense}`,
    ];
    this.statsText.setText(statsLines.join('\n'));

    // 표시
    this.setVisible(true);

    // 페이드 인
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: LevelUpUI.FADE_DURATION,
      ease: 'Power2',
      onComplete: () => {
        // 표시 시간 후 페이드 아웃
        this.scene.time.delayedCall(LevelUpUI.DISPLAY_DURATION, () => {
          this.hide();
        });
      },
    });

    // 타이틀 펄스 애니메이션
    this.scene.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * UI 숨기기 (페이드 아웃)
   */
  public hide(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: LevelUpUI.FADE_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
      },
    });
  }

  /**
   * 리소스 정리
   */
  public destroy(fromScene?: boolean): void {
    this.background?.destroy();
    this.titleText?.destroy();
    this.levelText?.destroy();
    this.statsText?.destroy();
    super.destroy(fromScene);
  }
}
