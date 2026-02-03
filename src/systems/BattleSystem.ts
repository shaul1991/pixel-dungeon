import type { MonsterConfig } from '../entities/Monster';

export interface BattleRewards {
  exp: number;
  gold: number;
}

export class BattleSystem {
  /**
   * 데미지 계산: random(attackMin, attackMax) - defense/2
   * 최소 데미지는 1
   */
  public static calculateDamage(
    attackMin: number,
    attackMax: number,
    defenderDef: number
  ): number {
    // attackMin ~ attackMax 범위에서 랜덤 공격력 결정
    const attackPower =
      attackMin + Math.floor(Math.random() * (attackMax - attackMin + 1));
    const baseDamage = attackPower - Math.floor(defenderDef / 2);
    return Math.max(1, baseDamage);
  }

  /**
   * 도망 확률: 50%
   */
  public static tryEscape(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * 경험치/골드 계산
   */
  public static calculateRewards(monster: MonsterConfig): BattleRewards {
    return {
      exp: monster.exp,
      gold: monster.gold,
    };
  }
}
