/**
 * 몬스터 스프라이트 생성 스크립트
 * 16x16 PNG 이미지 (슬라임 - 빨간색 원형)
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAME_SIZE = 16;

// 슬라임 색상 정의
const COLORS = {
  body: '#DC143C',        // Crimson - 몸체
  bodyLight: '#FF6B6B',   // Light Red - 하이라이트
  bodyDark: '#8B0000',    // Dark Red - 그림자
  outline: '#4A0000',     // 외곽선
  eye: '#FFFFFF',         // 흰색 - 눈
  pupil: '#000000',       // 검정 - 눈동자
};

function generateSlimeSprite() {
  const canvas = createCanvas(FRAME_SIZE, FRAME_SIZE);
  const ctx = canvas.getContext('2d');

  // 배경 투명하게
  ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);

  const centerX = FRAME_SIZE / 2;
  const centerY = FRAME_SIZE / 2 + 1;
  const radius = 5;

  // 그림자 (발 아래)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, FRAME_SIZE - 3, 5, 2, 0, 0, Math.PI * 2);
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

  // 눈 그리기 (정면)
  // 왼쪽 눈
  ctx.fillStyle = COLORS.eye;
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.pupil;
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY + 0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 오른쪽 눈
  ctx.fillStyle = COLORS.eye;
  ctx.beginPath();
  ctx.arc(centerX + 2, centerY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.pupil;
  ctx.beginPath();
  ctx.arc(centerX + 2, centerY + 0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 출력 디렉토리 확인
  const outputDir = path.join(__dirname, '../public/assets/images/monsters');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // PNG 파일 저장
  const outputPath = path.join(outputDir, 'slime.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Slime sprite generated: ${outputPath}`);
  console.log(`Size: ${FRAME_SIZE}x${FRAME_SIZE} pixels`);
}

generateSlimeSprite();
