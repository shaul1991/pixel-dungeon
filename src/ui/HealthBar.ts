import Phaser from 'phaser';
import { PixelColors, PixelColorStrings, createPixelTextStyle } from './PixelTheme';

export interface HealthBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor?: number;
  fillColor?: number;
  borderColor?: number;
  showText?: boolean;
  segmented?: boolean;
}

/**
 * HealthBar - 도트 스타일 HP/MP 바
 *
 * 세그먼트 스타일과 픽셀 테두리를 가진 레트로 HP 바
 */
export class HealthBar extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text | null = null;

  private barWidth: number;
  private barHeight: number;
  private bgColor: number;
  private fillColor: number;
  private borderColor: number;
  private segmented: boolean;

  private currentValue: number = 100;
  private maxValue: number = 100;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    super(scene, config.x, config.y);

    this.barWidth = config.width;
    this.barHeight = config.height;
    this.bgColor = config.bgColor ?? PixelColors.bgDark;
    this.fillColor = config.fillColor ?? PixelColors.hpGreen;
    this.borderColor = config.borderColor ?? PixelColors.frameMedium;
    this.segmented = config.segmented ?? true;

    // 그래픽 객체 생성
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    // 텍스트 표시 옵션
    if (config.showText) {
      this.text = scene.add.text(
        this.barWidth / 2,
        this.barHeight / 2,
        '',
        createPixelTextStyle('small', PixelColorStrings.textWhite)
      );
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
   * 바 다시 그리기 (도트 스타일)
   */
  private redraw(): void {
    const percentage = this.currentValue / this.maxValue;
    const fillWidth = Math.floor(this.barWidth * percentage);

    this.graphics.clear();

    // 배경 (어두운 색)
    this.graphics.fillStyle(this.bgColor, 1);
    this.graphics.fillRect(0, 0, this.barWidth, this.barHeight);

    // 채움 바
    if (fillWidth > 0) {
      this.graphics.fillStyle(this.fillColor, 1);
      this.graphics.fillRect(0, 0, fillWidth, this.barHeight);

      // 상단 하이라이트 (1픽셀)
      this.graphics.fillStyle(0xffffff, 0.3);
      this.graphics.fillRect(0, 0, fillWidth, 1);

      // 세그먼트 효과 (선택적)
      if (this.segmented && this.barWidth > 20) {
        const segmentWidth = Math.max(3, Math.floor(this.barWidth / 15));
        this.graphics.fillStyle(0x000000, 0.15);
        for (let sx = segmentWidth; sx < fillWidth; sx += segmentWidth) {
          this.graphics.fillRect(sx, 0, 1, this.barHeight);
        }
      }

      // 하단 어두운 라인 (1픽셀)
      this.graphics.fillStyle(0x000000, 0.3);
      this.graphics.fillRect(0, this.barHeight - 1, fillWidth, 1);
    }

    // 테두리 (2픽셀 효과)
    this.graphics.lineStyle(1, this.borderColor, 1);
    this.graphics.strokeRect(0, 0, this.barWidth, this.barHeight);

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
      this.fillColor = PixelColors.hpGreen;
    } else if (percentage > 0.25) {
      this.fillColor = PixelColors.hpYellow;
    } else {
      this.fillColor = PixelColors.hpRed;
    }

    this.redraw();
  }
}
