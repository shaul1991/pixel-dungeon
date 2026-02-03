import Phaser from 'phaser';

export interface NPCConfig {
  id: string;
  name: string;
  dialogKey: string;
}

export class NPC extends Phaser.Physics.Arcade.Sprite {
  private npcId: string;
  private npcName: string;
  private dialogKey: string;
  private tileX: number;
  private tileY: number;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, config: NPCConfig) {
    // 타일 좌표를 픽셀 좌표로 변환 (타일 중심)
    const pixelX = tileX * 16 + 8;
    const pixelY = tileY * 16 + 8;

    super(scene, pixelX, pixelY, 'npc', 0);

    this.tileX = tileX;
    this.tileY = tileY;
    this.npcId = config.id;
    this.npcName = config.name;
    this.dialogKey = config.dialogKey;

    // 씬에 추가
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 스프라이트 설정
    this.setOrigin(0.5, 0.5);
    this.setDepth(9); // 플레이어보다 약간 아래
    this.setImmovable(true);
  }

  /**
   * NPC ID 반환
   */
  public getId(): string {
    return this.npcId;
  }

  /**
   * NPC 이름 반환
   */
  public getName(): string {
    return this.npcName;
  }

  /**
   * 대화 키 반환
   */
  public getDialogKey(): string {
    return this.dialogKey;
  }

  /**
   * 타일 좌표 반환
   */
  public getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }
}
