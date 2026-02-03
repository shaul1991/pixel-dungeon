/**
 * 타일셋 이미지 생성 스크립트
 * 32x32 PNG 이미지 (2x2 그리드, 16x16 타일 4개)
 *
 * 타일 배치:
 * (0,0) 바닥 - 회색 #555555
 * (1,0) 벽 - 갈색 #8B4513
 * (0,1) 문 - 파란색 #4169E1
 * (1,1) 포탈 - 보라색 #9932CC
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILE_SIZE = 16;
const GRID_WIDTH = 3;  // 3열
const GRID_HEIGHT = 2; // 2행
const IMAGE_WIDTH = TILE_SIZE * GRID_WIDTH;
const IMAGE_HEIGHT = TILE_SIZE * GRID_HEIGHT;

// 타일 색상 정의
// 인덱스: (y * GRID_WIDTH + x) → Tiled에서 firstgid=1이므로 +1
// 0: floor, 1: wall, 2: door, 3: portal, 4: grass
const TILES = [
  { x: 0, y: 0, color: '#555555', name: 'floor' },      // 바닥 (인덱스 0)
  { x: 1, y: 0, color: '#8B4513', name: 'wall' },       // 벽 (인덱스 1)
  { x: 2, y: 0, color: '#4169E1', name: 'door' },       // 문 (인덱스 2)
  { x: 0, y: 1, color: '#9932CC', name: 'portal' },     // 포탈 (인덱스 3)
  { x: 1, y: 1, color: '#228B22', name: 'grass' },      // 풀숲 (인덱스 4) - 랜덤 인카운터
  { x: 2, y: 1, color: '#444444', name: 'empty' },      // 예비 (인덱스 5)
];

function generateTileset() {
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 타일 그리기
  TILES.forEach((tile) => {
    const px = tile.x * TILE_SIZE;
    const py = tile.y * TILE_SIZE;

    // 기본 색상으로 채우기
    ctx.fillStyle = tile.color;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // 약간의 디테일 추가 (테두리)
    ctx.strokeStyle = darkenColor(tile.color, 30);
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    // 벽 타일에 추가 디테일
    if (tile.name === 'wall') {
      ctx.fillStyle = darkenColor(tile.color, 20);
      ctx.fillRect(px + 2, py + 2, 4, 4);
      ctx.fillRect(px + 10, py + 10, 4, 4);
    }

    // 문 타일에 추가 디테일
    if (tile.name === 'door') {
      ctx.fillStyle = darkenColor(tile.color, 40);
      ctx.fillRect(px + 6, py + 2, 4, 12);
    }

    // 포탈 타일에 추가 디테일 (원형 패턴)
    if (tile.name === 'portal') {
      ctx.fillStyle = lightenColor(tile.color, 30);
      ctx.beginPath();
      ctx.arc(px + 8, py + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 풀숲 타일에 추가 디테일 (풀 패턴)
    if (tile.name === 'grass') {
      ctx.fillStyle = lightenColor(tile.color, 20);
      // 풀잎 패턴
      for (let i = 0; i < 5; i++) {
        const gx = px + 2 + (i * 3);
        const gy = py + 8 + ((i % 2) * 3);
        ctx.fillRect(gx, gy, 2, 5);
      }
      ctx.fillStyle = darkenColor(tile.color, 15);
      for (let i = 0; i < 4; i++) {
        const gx = px + 4 + (i * 3);
        const gy = py + 5 + ((i % 2) * 4);
        ctx.fillRect(gx, gy, 2, 4);
      }
    }
  });

  // 출력 디렉토리 확인
  const outputDir = path.join(__dirname, '../public/assets/images/tiles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // PNG 파일 저장
  const outputPath = path.join(outputDir, 'dungeon.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Tileset generated: ${outputPath}`);
  console.log(`Size: ${IMAGE_WIDTH}x${IMAGE_HEIGHT} pixels`);
  console.log(`Tiles: ${TILES.length} (${TILE_SIZE}x${TILE_SIZE} each)`);
  console.log(`Layout: ${GRID_WIDTH}x${GRID_HEIGHT} grid`);
}

// 색상 어둡게
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// 색상 밝게
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

generateTileset();
