import Phaser from 'phaser';

export interface MonsterConfig {
  id: string;
  name: string;
  hp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  exp: number;
  gold: number;
}

export interface MonsterStats {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  exp: number;
  gold: number;
}

export class Monster extends Phaser.Physics.Arcade.Sprite {
  private monsterId: string;
  private monsterName: string;
  private hp: number;
  private maxHp: number;
  private attackMin: number;
  private attackMax: number;
  private defense: number;
  private exp: number;
  private gold: number;
  private tileX: number;
  private tileY: number;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, config: MonsterConfig) {
    // 타일 좌표를 픽셀 좌표로 변환 (타일 중심)
    const pixelX = tileX * 16 + 8;
    const pixelY = tileY * 16 + 8;

    super(scene, pixelX, pixelY, 'slime');

    this.tileX = tileX;
    this.tileY = tileY;

    // 몬스터 스탯 초기화
    this.monsterId = config.id;
    this.monsterName = config.name;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.attackMin = config.attackMin;
    this.attackMax = config.attackMax;
    this.defense = config.defense;
    this.exp = config.exp;
    this.gold = config.gold;

    // 씬에 추가
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 스프라이트 설정
    this.setOrigin(0.5, 0.5);
    this.setDepth(5);
  }

  /**
   * 데미지를 받음
   * @param amount 데미지 양
   * @returns 죽었으면 true
   */
  public takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  /**
   * 현재 스탯 반환
   */
  public getStats(): MonsterStats {
    return {
      id: this.monsterId,
      name: this.monsterName,
      hp: this.hp,
      maxHp: this.maxHp,
      attackMin: this.attackMin,
      attackMax: this.attackMax,
      defense: this.defense,
      exp: this.exp,
      gold: this.gold,
    };
  }

  /**
   * 현재 타일 좌표 반환
   */
  public getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }

  /**
   * 몬스터 설정 반환 (전투 씬으로 전달용)
   */
  public getConfig(): MonsterConfig {
    return {
      id: this.monsterId,
      name: this.monsterName,
      hp: this.hp,
      attackMin: this.attackMin,
      attackMax: this.attackMax,
      defense: this.defense,
      exp: this.exp,
      gold: this.gold,
    };
  }
}
