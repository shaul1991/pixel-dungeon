/**
 * 플레이어 스프라이트시트 생성 스크립트
 * 64x64 PNG 이미지 (4x4 그리드, 16x16 프레임)
 *
 * 프레임 배치:
 * 행 0: 아래 방향 (down) - 프레임 0,1,2,3
 * 행 1: 왼쪽 방향 (left) - 프레임 4,5,6,7
 * 행 2: 오른쪽 방향 (right) - 프레임 8,9,10,11
 * 행 3: 위 방향 (up) - 프레임 12,13,14,15
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAME_SIZE = 16;
const GRID_SIZE = 4;
const IMAGE_SIZE = FRAME_SIZE * GRID_SIZE;

// 색상 정의
const COLORS = {
  body: '#4169E1',        // Royal Blue - 몸체
  bodyLight: '#6495ED',   // Cornflower Blue - 하이라이트
  bodyDark: '#27408B',    // Dark Slate Blue - 그림자
  outline: '#191970',     // Midnight Blue - 외곽선
  eye: '#FFFFFF',         // 흰색 - 눈
  pupil: '#000000',       // 검정 - 눈동자
};

// 방향별 설정 (눈 위치)
const DIRECTIONS = {
  down: { row: 0, eyeOffset: { x: 0, y: 1 } },
  left: { row: 1, eyeOffset: { x: -2, y: 0 } },
  right: { row: 2, eyeOffset: { x: 2, y: 0 } },
  up: { row: 3, eyeOffset: null }, // 뒤에서 보므로 눈 없음
};

// 걷기 애니메이션 프레임 (y 오프셋)
const WALK_FRAMES = [0, -1, 0, 1];

function generatePlayerSpritesheet() {
  const canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE);
  const ctx = canvas.getContext('2d');

  // 배경 투명하게
  ctx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);

  // 각 방향별로 4프레임 그리기
  Object.entries(DIRECTIONS).forEach(([direction, config]) => {
    for (let frame = 0; frame < 4; frame++) {
      const px = frame * FRAME_SIZE;
      const py = config.row * FRAME_SIZE;
      const walkOffset = WALK_FRAMES[frame];

      drawCharacterFrame(ctx, px, py, direction, config.eyeOffset, walkOffset);
    }
  });

  // 출력 디렉토리 확인
  const outputDir = path.join(__dirname, '../public/assets/images/characters');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // PNG 파일 저장
  const outputPath = path.join(outputDir, 'player.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Player spritesheet generated: ${outputPath}`);
  console.log(`Size: ${IMAGE_SIZE}x${IMAGE_SIZE} pixels`);
  console.log(`Frames: 16 (4 directions x 4 frames, ${FRAME_SIZE}x${FRAME_SIZE} each)`);
}

function drawCharacterFrame(ctx, px, py, direction, eyeOffset, walkOffset) {
  const centerX = px + FRAME_SIZE / 2;
  const centerY = py + FRAME_SIZE / 2 + walkOffset;
  const radius = 5;

  // 그림자 (발 아래)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, py + 13, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 몸체 외곽선
  ctx.fillStyle = COLORS.outline;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
  ctx.fill();

  // 몸체 기본색
  ctx.fillStyle = COLORS.body;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // 하이라이트 (왼쪽 위)
  ctx.fillStyle = COLORS.bodyLight;
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // 그림자 (오른쪽 아래)
  ctx.fillStyle = COLORS.bodyDark;
  ctx.beginPath();
  ctx.arc(centerX + 2, centerY + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // 눈 그리기 (up 방향 제외)
  if (eyeOffset) {
    const eyeX = centerX + eyeOffset.x;
    const eyeY = centerY + eyeOffset.y;

    if (direction === 'down') {
      // 정면 - 두 눈
      // 왼쪽 눈
      ctx.fillStyle = COLORS.eye;
      ctx.beginPath();
      ctx.arc(eyeX - 2, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.pupil;
      ctx.beginPath();
      ctx.arc(eyeX - 2, eyeY + 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // 오른쪽 눈
      ctx.fillStyle = COLORS.eye;
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.pupil;
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY + 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (direction === 'left') {
      // 왼쪽 - 한쪽 눈만
      ctx.fillStyle = COLORS.eye;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.pupil;
      ctx.beginPath();
      ctx.arc(eyeX - 0.5, eyeY, 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (direction === 'right') {
      // 오른쪽 - 한쪽 눈만
      ctx.fillStyle = COLORS.eye;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.pupil;
      ctx.beginPath();
      ctx.arc(eyeX + 0.5, eyeY, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // up 방향 - 뒤통수 디테일
    ctx.fillStyle = COLORS.bodyDark;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

generatePlayerSpritesheet();
