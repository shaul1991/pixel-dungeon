/**
 * NPC 스프라이트 생성 스크립트
 * 16x16 PNG 이미지 (단일 프레임)
 * 녹색 원형 캐릭터
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAME_SIZE = 16;

// 색상 정의
const COLORS = {
  body: '#228B22',        // Forest Green - 몸체
  bodyLight: '#32CD32',   // Lime Green - 하이라이트
  bodyDark: '#006400',    // Dark Green - 그림자
  outline: '#004000',     // 외곽선
  eye: '#FFFFFF',         // 흰색 - 눈
  pupil: '#000000',       // 검정 - 눈동자
  beard: '#808080',       // 회색 - 수염 (장로 느낌)
};

function generateNpcSprite() {
  const canvas = createCanvas(FRAME_SIZE, FRAME_SIZE);
  const ctx = canvas.getContext('2d');

  // 배경 투명하게
  ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);

  const centerX = FRAME_SIZE / 2;
  const centerY = FRAME_SIZE / 2;
  const radius = 5;

  // 그림자 (발 아래)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, 13, 4, 2, 0, 0, Math.PI * 2);
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
  const eyeY = centerY + 1;

  // 왼쪽 눈
  ctx.fillStyle = COLORS.eye;
  ctx.beginPath();
  ctx.arc(centerX - 2, eyeY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.pupil;
  ctx.beginPath();
  ctx.arc(centerX - 2, eyeY + 0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 오른쪽 눈
  ctx.fillStyle = COLORS.eye;
  ctx.beginPath();
  ctx.arc(centerX + 2, eyeY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.pupil;
  ctx.beginPath();
  ctx.arc(centerX + 2, eyeY + 0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 수염 (장로 느낌)
  ctx.fillStyle = COLORS.beard;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 4, 2, 0, Math.PI, false);
  ctx.fill();

  // 출력 디렉토리 확인
  const outputDir = path.join(__dirname, '../public/assets/images/characters');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // PNG 파일 저장
  const outputPath = path.join(outputDir, 'npc.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`NPC sprite generated: ${outputPath}`);
  console.log(`Size: ${FRAME_SIZE}x${FRAME_SIZE} pixels`);
}

generateNpcSprite();
