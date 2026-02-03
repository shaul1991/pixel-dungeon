import Phaser from 'phaser';
import { HealthBar } from './HealthBar';
import {
  PixelColors,
  PixelColorStrings,
  createPixelTextStyle,
} from './PixelTheme';

export interface PlayerStatus {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  level?: number;
  gold?: number;
  exp?: number;
  maxExp?: number;
}

export interface StatusUIConfig {
  x: number;
  y: number;
}

/**
 * StatusUI - 플레이어 스탯 HUD (도트 스타일)
 *
 * 화면 상단에 고정되어 HP, MP, ATK, DEF 등을 표시
 * 8비트/16비트 레트로 스타일
 */
export class StatusUI extends Phaser.GameObjects.Container {
  private hpBar: HealthBar;
  private mpBar: HealthBar;
  private expBar: HealthBar;
  private hpValueText: Phaser.GameObjects.Text;
  private mpValueText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Graphics;

  // 바 크기 설정
  private static readonly BAR_WIDTH = 50;
  private static readonly BAR_HEIGHT = 8;
  private static readonly EXP_BAR_HEIGHT = 3;
  private static readonly PADDING = 5;

  constructor(scene: Phaser.Scene, config: StatusUIConfig) {
    super(scene, config.x, config.y);

    // 배경 패널 생성
    this.background = this.createBackground();
    this.add(this.background);

    // HP 바 생성 (도트 스타일)
    this.hpBar = new HealthBar(scene, {
      x: 0,
      y: 0,
      width: StatusUI.BAR_WIDTH,
      height: StatusUI.BAR_HEIGHT,
      fillColor: PixelColors.hpGreen,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: true,
    });
    this.hpBar.setPosition(StatusUI.PADDING + 20, StatusUI.PADDING);
    this.add(this.hpBar);

    // HP 라벨 (도트 스타일)
    const hpLabel = scene.add.text(StatusUI.PADDING, StatusUI.PADDING - 1, 'HP', {
      ...createPixelTextStyle('small', PixelColorStrings.hpGreen),
      fontStyle: 'bold',
    });
    this.add(hpLabel);

    // HP 수치 텍스트
    this.hpValueText = scene.add.text(
      StatusUI.PADDING + 20 + StatusUI.BAR_WIDTH + 3,
      StatusUI.PADDING - 1,
      '000/000',
      createPixelTextStyle('small', PixelColorStrings.hpGreen)
    );
    this.add(this.hpValueText);

    // MP 바 생성 (도트 스타일)
    this.mpBar = new HealthBar(scene, {
      x: 0,
      y: 0,
      width: StatusUI.BAR_WIDTH,
      height: StatusUI.BAR_HEIGHT,
      fillColor: PixelColors.mpBlue,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: true,
    });
    this.mpBar.setPosition(StatusUI.PADDING + 20, StatusUI.PADDING + 12);
    this.add(this.mpBar);

    // MP 라벨 (도트 스타일)
    const mpLabel = scene.add.text(StatusUI.PADDING, StatusUI.PADDING + 11, 'MP', {
      ...createPixelTextStyle('small', PixelColorStrings.mpBlue),
      fontStyle: 'bold',
    });
    this.add(mpLabel);

    // MP 수치 텍스트
    this.mpValueText = scene.add.text(
      StatusUI.PADDING + 20 + StatusUI.BAR_WIDTH + 3,
      StatusUI.PADDING + 11,
      '000/000',
      createPixelTextStyle('small', PixelColorStrings.mpBlue)
    );
    this.add(this.mpValueText);

    // EXP 바 생성 (노란색 얇은 게이지, 라벨 없음)
    this.expBar = new HealthBar(scene, {
      x: 0,
      y: 0,
      width: StatusUI.BAR_WIDTH + 20, // HP/MP 라벨 영역까지 확장
      height: StatusUI.EXP_BAR_HEIGHT,
      fillColor: PixelColors.expYellow,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: false,
    });
    this.expBar.setPosition(StatusUI.PADDING, StatusUI.PADDING + 22);
    this.add(this.expBar);

    // 스탯 텍스트 (ATK/DEF)
    this.statsText = scene.add.text(
      StatusUI.PADDING + 20 + StatusUI.BAR_WIDTH + 50,
      StatusUI.PADDING,
      '',
      {
        ...createPixelTextStyle('small', PixelColorStrings.textWhite),
        lineSpacing: 4,
      }
    );
    this.add(this.statsText);

    // 깊이 설정 (최상위)
    this.setDepth(900);

    // 씬에 추가
    scene.add.existing(this);
  }

  /**
   * 배경 패널 생성 (도트 스타일 - 직각 모서리)
   */
  private createBackground(): Phaser.GameObjects.Graphics {
    const bg = this.scene.add.graphics();
    const width = 180;
    const height = 32;

    // 어두운 배경 (도트 스타일)
    bg.fillStyle(PixelColors.bgMedium, 0.9);
    bg.fillRect(0, 0, width, height);

    // 내부 하이라이트 (상단/왼쪽 밝게)
    bg.fillStyle(PixelColors.frameLight, 0.3);
    bg.fillRect(1, 1, width - 2, 1);
    bg.fillRect(1, 1, 1, height - 2);

    // 내부 그림자 (하단/오른쪽 어둡게)
    bg.fillStyle(PixelColors.bgDark, 0.5);
    bg.fillRect(1, height - 2, width - 2, 1);
    bg.fillRect(width - 2, 1, 1, height - 2);

    // 외부 테두리 (픽셀 스타일)
    bg.lineStyle(1, PixelColors.frameMedium, 1);
    bg.strokeRect(0, 0, width, height);

    return bg;
  }

  /**
   * 스탯 업데이트
   */
  public update(status: PlayerStatus): void {
    // HP 바 업데이트
    this.hpBar.setValue(status.hp, status.maxHp);
    this.hpBar.autoColor();

    // HP 수치 텍스트 업데이트
    this.hpValueText.setText(`${status.hp}/${status.maxHp}`);

    // MP 바 업데이트
    this.mpBar.setValue(status.mp, status.maxMp);

    // MP 수치 텍스트 업데이트
    this.mpValueText.setText(`${status.mp}/${status.maxMp}`);

    // EXP 바 업데이트
    if (status.exp !== undefined && status.maxExp !== undefined && status.maxExp > 0) {
      this.expBar.setValue(status.exp, status.maxExp);
    } else {
      this.expBar.setValue(0, 1);
    }

    // 스탯 텍스트 업데이트 (레벨 포함)
    const levelText = status.level !== undefined ? `LV${status.level}` : '';
    const lines = [
      `${levelText} ATK${status.attackMin}-${status.attackMax}`,
      `DEF${status.defense}`,
    ];
    this.statsText.setText(lines.join('\n'));
  }

  /**
   * UI 표시/숨김
   */
  public show(): void {
    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }
}
