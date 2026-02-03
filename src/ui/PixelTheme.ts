import Phaser from 'phaser';

/**
 * PixelTheme - 도트 디자인 UI 테마
 *
 * 8비트/16비트 레트로 스타일 색상 팔레트 및 유틸리티
 */

// 색상 팔레트
export const PixelColors = {
  // 배경 색상
  bgDark: 0x0f0f1b,      // 가장 어두운 배경
  bgMedium: 0x1a1a2e,    // 중간 배경
  bgLight: 0x252542,     // 밝은 배경

  // 프레임/테두리 색상
  frameDark: 0x2a2a4a,   // 어두운 프레임
  frameMedium: 0x3a3a5c, // 중간 프레임
  frameLight: 0x5a5a8c,  // 밝은 프레임 (하이라이트)

  // 텍스트 색상
  textWhite: 0xe8e8e8,   // 밝은 텍스트
  textGray: 0xa0a0a0,    // 회색 텍스트
  textDark: 0x606060,    // 어두운 텍스트

  // HP 바 색상
  hpGreen: 0x38b764,     // HP 높음
  hpYellow: 0xf7d87c,    // HP 중간
  hpRed: 0xe84545,       // HP 낮음

  // MP 바 색상
  mpBlue: 0x4a90d9,      // MP 색상

  // EXP 바 색상
  expYellow: 0xf7d87c,   // 경험치 노란색

  // 강조 색상
  accentGold: 0xffcd75,  // 금색 강조
  accentRed: 0xe84545,   // 빨강 강조
  accentBlue: 0x4a90d9,  // 파랑 강조
  accentGreen: 0x38b764, // 초록 강조

  // 메뉴 버튼 색상
  btnAttack: 0xc84040,   // 공격 버튼
  btnSkill: 0xc89040,    // 스킬 버튼
  btnItem: 0x40a040,     // 아이템 버튼
  btnEscape: 0x4080c8,   // 도망 버튼
  btnDisabled: 0x505050, // 비활성화

  // 순수 색상
  black: 0x000000,
  white: 0xffffff,
} as const;

// 색상 문자열 버전 (텍스트용)
export const PixelColorStrings = {
  textWhite: '#e8e8e8',
  textGray: '#a0a0a0',
  textDark: '#606060',
  textYellow: '#f7d87c',
  accentGold: '#ffcd75',
  hpGreen: '#38b764',
  hpYellow: '#f7d87c',
  hpRed: '#e84545',
  mpBlue: '#4a90d9',
  black: '#000000',
  white: '#ffffff',
} as const;

/**
 * 픽셀 스타일 프레임 그리기
 * 직각 모서리, 2픽셀 테두리의 레트로 스타일 박스
 */
export function drawPixelFrame(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    bgColor?: number;
    borderColor?: number;
    borderWidth?: number;
    innerBorder?: boolean;
  }
): void {
  const bgColor = options?.bgColor ?? PixelColors.bgMedium;
  const borderColor = options?.borderColor ?? PixelColors.frameMedium;
  const borderWidth = options?.borderWidth ?? 2;
  const innerBorder = options?.innerBorder ?? false;

  // 배경
  graphics.fillStyle(bgColor, 1);
  graphics.fillRect(x, y, width, height);

  // 외부 테두리 (어두운 색)
  graphics.lineStyle(borderWidth, borderColor, 1);
  graphics.strokeRect(x, y, width, height);

  // 내부 하이라이트 (선택적)
  if (innerBorder) {
    // 상단/왼쪽 밝은 라인 (입체감)
    graphics.lineStyle(1, PixelColors.frameLight, 0.5);
    graphics.lineBetween(x + borderWidth, y + borderWidth, x + width - borderWidth, y + borderWidth);
    graphics.lineBetween(x + borderWidth, y + borderWidth, x + borderWidth, y + height - borderWidth);

    // 하단/오른쪽 어두운 라인
    graphics.lineStyle(1, PixelColors.frameDark, 0.5);
    graphics.lineBetween(x + borderWidth, y + height - borderWidth, x + width - borderWidth, y + height - borderWidth);
    graphics.lineBetween(x + width - borderWidth, y + borderWidth, x + width - borderWidth, y + height - borderWidth);
  }
}

/**
 * 픽셀 스타일 버튼 그리기
 */
export function drawPixelButton(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  isSelected: boolean = false,
  isEnabled: boolean = true
): void {
  const actualColor = isEnabled ? color : PixelColors.btnDisabled;

  // 버튼 배경
  graphics.fillStyle(actualColor, 1);
  graphics.fillRect(x, y, width, height);

  // 상단/왼쪽 밝은 테두리 (3D 효과)
  graphics.fillStyle(0xffffff, 0.3);
  graphics.fillRect(x, y, width, 2);
  graphics.fillRect(x, y, 2, height);

  // 하단/오른쪽 어두운 테두리
  graphics.fillStyle(0x000000, 0.3);
  graphics.fillRect(x, y + height - 2, width, 2);
  graphics.fillRect(x + width - 2, y, 2, height);

  // 선택 표시
  if (isSelected) {
    graphics.lineStyle(2, PixelColors.accentGold, 1);
    graphics.strokeRect(x - 1, y - 1, width + 2, height + 2);
  }
}

/**
 * 픽셀 스타일 HP/MP 바 그리기 (세그먼트 스타일)
 */
export function drawPixelBar(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  current: number,
  max: number,
  fillColor: number,
  segmented: boolean = false
): void {
  const percentage = Math.max(0, Math.min(1, current / max));
  const fillWidth = Math.floor(width * percentage);

  // 배경
  graphics.fillStyle(PixelColors.bgDark, 1);
  graphics.fillRect(x, y, width, height);

  // 채움
  if (fillWidth > 0) {
    graphics.fillStyle(fillColor, 1);
    graphics.fillRect(x, y, fillWidth, height);

    // 세그먼트 효과 (선택적)
    if (segmented && width > 20) {
      const segmentWidth = 4;
      graphics.fillStyle(0x000000, 0.2);
      for (let sx = x + segmentWidth; sx < x + fillWidth; sx += segmentWidth) {
        graphics.fillRect(sx, y, 1, height);
      }
    }
  }

  // 테두리
  graphics.lineStyle(1, PixelColors.frameMedium, 1);
  graphics.strokeRect(x, y, width, height);
}

/**
 * 텍스트 스타일 생성 (도트 스타일)
 */
export function createPixelTextStyle(
  size: 'tiny' | 'small' | 'medium' | 'large' | 'title' = 'medium',
  color: string = PixelColorStrings.textWhite
): Phaser.Types.GameObjects.Text.TextStyle {
  const sizes = {
    tiny: '6px',
    small: '8px',
    medium: '10px',
    large: '12px',
    title: '16px',
  };

  return {
    fontSize: sizes[size],
    color: color,
    fontFamily: 'monospace',
    // 픽셀 느낌을 위해 그림자 효과 추가
    shadow: {
      offsetX: 1,
      offsetY: 1,
      color: '#000000',
      blur: 0,
      fill: true,
    },
  };
}

/**
 * 도트 스타일 선택 커서 그리기 (▶ 모양)
 */
export function drawPixelCursor(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number = 8,
  color: number = PixelColors.accentGold
): void {
  graphics.fillStyle(color, 1);
  graphics.fillTriangle(
    x, y,
    x, y + size,
    x + size * 0.7, y + size / 2
  );
}
