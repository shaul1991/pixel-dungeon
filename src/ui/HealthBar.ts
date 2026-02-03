import Phaser from 'phaser';

export interface HealthBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor?: number;
  fillColor?: number;
  borderColor?: number;
  showText?: boolean;
}

export class HealthBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private border: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text | null = null;

  private barWidth: number;
  private barHeight: number;
  private bgColor: number;
  private fillColor: number;
  private borderColor: number;

  private currentValue: number = 100;
  private maxValue: number = 100;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    super(scene, config.x, config.y);

    this.barWidth = config.width;
    this.barHeight = config.height;
    this.bgColor = config.bgColor ?? 0x333333;
    this.fillColor = config.fillColor ?? 0x00ff00;
    this.borderColor = config.borderColor ?? 0x000000;

    // 배경 생성
    this.background = scene.add.graphics();
    this.background.fillStyle(this.bgColor, 1);
    this.background.fillRect(0, 0, this.barWidth, this.barHeight);
    this.add(this.background);

    // 채움 바 생성
    this.fill = scene.add.graphics();
    this.add(this.fill);

    // 테두리 생성
    this.border = scene.add.graphics();
    this.border.lineStyle(1, this.borderColor, 1);
    this.border.strokeRect(0, 0, this.barWidth, this.barHeight);
    this.add(this.border);

    // 텍스트 표시 옵션
    if (config.showText) {
      this.text = scene.add.text(this.barWidth / 2, this.barHeight / 2, '', {
        fontSize: '8px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      this.text.setOrigin(0.5, 0.5);
      this.add(this.text);
    }

    // 씬에 컨테이너 추가
    scene.add.existing(this);

    // 초기 렌더링
    this.redraw();
  }

  /**
   * HP 값 업데이트
   */
  public setValue(current: number, max: number): void {
    this.currentValue = Math.max(0, current);
    this.maxValue = Math.max(1, max);
    this.redraw();
  }

  /**
   * 채움 색상 변경
   */
  public setFillColor(color: number): void {
    this.fillColor = color;
    this.redraw();
  }

  /**
   * 바 다시 그리기
   */
  private redraw(): void {
    const percentage = this.currentValue / this.maxValue;
    const fillWidth = Math.max(0, this.barWidth * percentage);

    // 채움 바 다시 그리기
    this.fill.clear();
    this.fill.fillStyle(this.fillColor, 1);
    this.fill.fillRect(0, 0, fillWidth, this.barHeight);

    // 텍스트 업데이트
    if (this.text) {
      this.text.setText(`${this.currentValue}/${this.maxValue}`);
    }
  }

  /**
   * HP 바 색상 자동 설정 (HP 비율에 따라)
   */
  public autoColor(): void {
    const percentage = this.currentValue / this.maxValue;

    if (percentage > 0.5) {
      this.fillColor = 0x00ff00; // 초록색
    } else if (percentage > 0.25) {
      this.fillColor = 0xffff00; // 노란색
    } else {
      this.fillColor = 0xff0000; // 빨간색
    }

    this.redraw();
  }
}
