import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  init(): void {
    console.log('BootScene: Initializing game...');
  }

  preload(): void {
    // 초기 설정에 필요한 최소한의 리소스 로드 (현재는 없음)
  }

  create(): void {
    // 게임 초기 설정
    this.initGameSettings();

    // PreloadScene으로 전환
    this.scene.start('PreloadScene');
  }

  private initGameSettings(): void {
    // 게임 전역 설정
    this.game.registry.set('gameVersion', '0.1.0');
    this.game.registry.set('tileSize', 16);

    console.log('BootScene: Game settings initialized');
  }
}
