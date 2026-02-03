import Phaser from 'phaser';
import { HealthBar } from './HealthBar';

export interface PlayerStatus {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
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
 * StatusUI - 플레이어 스탯 HUD
 *
 * 화면 상단에 고정되어 HP, MP, ATK, DEF 등을 표시
 */
export class StatusUI extends Phaser.GameObjects.Container {
  private hpBar: HealthBar;
  private mpBar: HealthBar;
  private hpValueText: Phaser.GameObjects.Text;
  private mpValueText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Graphics;

  // 바 크기 설정
  private static readonly BAR_WIDTH = 50;
  private static readonly BAR_HEIGHT = 8;
  private static readonly PADDING = 4;

  constructor(scene: Phaser.Scene, config: StatusUIConfig) {
    super(scene, config.x, config.y);

    // 배경 패널 생성
    this.background = this.createBackground();
    this.add(this.background);

    // HP 바 생성
    this.hpBar = new HealthBar(scene, {
      x: 0,
      y: 0,
      width: StatusUI.BAR_WIDTH,
      height: StatusUI.BAR_HEIGHT,
      fillColor: 0x00ff00,
      showText: false,
    });
    // HealthBar는 자체적으로 scene.add.existing을 호출하므로 부모 설정
    this.hpBar.setPosition(StatusUI.PADDING + 24, StatusUI.PADDING);
    this.add(this.hpBar);

    // HP 라벨
    const hpLabel = scene.add.text(StatusUI.PADDING, StatusUI.PADDING - 1, 'HP', {
      fontSize: '8px',
      color: '#00ff00',
      fontFamily: 'monospace',
    });
    this.add(hpLabel);

    // HP 수치 텍스트
    this.hpValueText = scene.add.text(
      StatusUI.PADDING + 24 + StatusUI.BAR_WIDTH + 2,
      StatusUI.PADDING - 1,
      '000/000',
      {
        fontSize: '8px',
        color: '#00ff00',
        fontFamily: 'monospace',
      }
    );
    this.add(this.hpValueText);

    // MP 바 생성
    this.mpBar = new HealthBar(scene, {
      x: 0,
      y: 0,
      width: StatusUI.BAR_WIDTH,
      height: StatusUI.BAR_HEIGHT,
      fillColor: 0x0088ff,
      showText: false,
    });
    this.mpBar.setPosition(StatusUI.PADDING + 24, StatusUI.PADDING + 12);
    this.add(this.mpBar);

    // MP 라벨
    const mpLabel = scene.add.text(StatusUI.PADDING, StatusUI.PADDING + 11, 'MP', {
      fontSize: '8px',
      color: '#0088ff',
      fontFamily: 'monospace',
    });
    this.add(mpLabel);

    // MP 수치 텍스트
    this.mpValueText = scene.add.text(
      StatusUI.PADDING + 24 + StatusUI.BAR_WIDTH + 2,
      StatusUI.PADDING + 11,
      '000/000',
      {
        fontSize: '8px',
        color: '#0088ff',
        fontFamily: 'monospace',
      }
    );
    this.add(this.mpValueText);

    // 스탯 텍스트 (ATK/DEF)
    this.statsText = scene.add.text(
      StatusUI.PADDING + 24 + StatusUI.BAR_WIDTH + 50,
      StatusUI.PADDING,
      '',
      {
        fontSize: '8px',
        color: '#ffffff',
        fontFamily: 'monospace',
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
   * 배경 패널 생성
   */
  private createBackground(): Phaser.GameObjects.Graphics {
    const bg = this.scene.add.graphics();
    const width = 180;
    const height = 28;

    // 반투명 검은 배경
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(0, 0, width, height, 4);

    // 테두리
    bg.lineStyle(1, 0x444444, 1);
    bg.strokeRoundedRect(0, 0, width, height, 4);

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

    // 스탯 텍스트 업데이트
    const lines = [
      `ATK ${status.attack}`,
      `DEF ${status.defense}`,
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
