import Phaser from 'phaser';
import { BootScene, PreloadScene, MenuScene, GameScene, BattleScene } from './scenes';

// 디버그 모드 설정
export const DEBUG = false;

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, BattleScene],
};
