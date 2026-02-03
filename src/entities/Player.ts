import Phaser from 'phaser';

export type Direction = 'up' | 'down' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private tileX: number;
  private tileY: number;
  private isMoving: boolean = false;
  private moveSpeed: number = 200; // 픽셀/초
  private tileSize: number = 16;
  private direction: Direction = 'down';

  // 충돌 체크를 위한 레이어 참조
  private wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    // 타일 좌표를 픽셀 좌표로 변환 (타일 중심)
    const pixelX = tileX * 16 + 8;
    const pixelY = tileY * 16 + 8;

    super(scene, pixelX, pixelY, 'player', 0);

    this.tileX = tileX;
    this.tileY = tileY;

    // 씬에 추가
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 스프라이트 설정
    this.setOrigin(0.5, 0.5);
    this.setDepth(10);

    // 초기 애니메이션 (아래 방향 idle)
    this.play('player-idle-down');
  }

  /**
   * 충돌 체크용 벽 레이어 설정
   */
  public setWallsLayer(layer: Phaser.Tilemaps.TilemapLayer | null): void {
    this.wallsLayer = layer;
  }

  /**
   * 지정된 타일로 이동 가능한지 확인
   */
  public canMoveTo(targetTileX: number, targetTileY: number): boolean {
    if (!this.wallsLayer) {
      return true;
    }

    // 벽 레이어에서 해당 타일 확인
    const tile = this.wallsLayer.getTileAt(targetTileX, targetTileY);

    // 타일이 있고 충돌이 설정되어 있으면 이동 불가
    if (tile && tile.index !== -1) {
      return false;
    }

    return true;
  }

  /**
   * 그리드 기반 이동 시도
   * @param newDirection 이동 방향
   * @returns 이동 시작 여부
   */
  public tryMove(newDirection: Direction): boolean {
    // 이미 이동 중이면 무시
    if (this.isMoving) {
      return false;
    }

    // 방향 설정 및 애니메이션 변경
    this.direction = newDirection;

    // 목표 타일 계산
    let targetTileX = this.tileX;
    let targetTileY = this.tileY;

    switch (newDirection) {
      case 'up':
        targetTileY -= 1;
        break;
      case 'down':
        targetTileY += 1;
        break;
      case 'left':
        targetTileX -= 1;
        break;
      case 'right':
        targetTileX += 1;
        break;
    }

    // 이동 가능 여부 확인
    if (!this.canMoveTo(targetTileX, targetTileY)) {
      // 이동 불가 - 방향만 전환하고 idle 애니메이션
      this.play(`player-idle-${newDirection}`, true);
      return false;
    }

    // 이동 시작
    this.moveToTile(targetTileX, targetTileY);
    return true;
  }

  /**
   * 타일로 부드럽게 이동
   */
  private moveToTile(newTileX: number, newTileY: number): void {
    this.isMoving = true;

    // 걷기 애니메이션 재생
    this.play(`player-walk-${this.direction}`, true);

    // 목표 픽셀 좌표
    const targetX = newTileX * this.tileSize + this.tileSize / 2;
    const targetY = newTileY * this.tileSize + this.tileSize / 2;

    // 이동 거리 계산
    const distance = Math.sqrt(
      Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2)
    );

    // 이동 시간 계산 (속도 기반)
    const duration = (distance / this.moveSpeed) * 1000;

    // Tween으로 부드러운 이동
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        // 타일 좌표 업데이트
        this.tileX = newTileX;
        this.tileY = newTileY;
        this.isMoving = false;

        // idle 애니메이션으로 전환
        this.play(`player-idle-${this.direction}`, true);
      },
    });
  }

  /**
   * 현재 방향 반환
   */
  public getDirection(): Direction {
    return this.direction;
  }

  /**
   * 현재 바라보는 타일 좌표 반환
   */
  public getFacingTile(): { x: number; y: number } {
    let facingX = this.tileX;
    let facingY = this.tileY;

    switch (this.direction) {
      case 'up':
        facingY -= 1;
        break;
      case 'down':
        facingY += 1;
        break;
      case 'left':
        facingX -= 1;
        break;
      case 'right':
        facingX += 1;
        break;
    }

    return { x: facingX, y: facingY };
  }

  /**
   * 현재 타일 좌표 반환
   */
  public getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }

  /**
   * 이동 중 여부 반환
   */
  public getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * 이동 속도 설정
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }
}
