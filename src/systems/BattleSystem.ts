import type { MonsterConfig } from '../entities/Monster';

export interface BattleRewards {
  exp: number;
  gold: number;
}

export class BattleSystem {
  /**
   * 데미지 계산: attack - defense/2 + random(-2, 2)
   * 최소 데미지는 1
   */
  public static calculateDamage(attackerAtk: number, defenderDef: number): number {
    const baseDamage = attackerAtk - Math.floor(defenderDef / 2);
    const randomBonus = Math.floor(Math.random() * 5) - 2; // -2 ~ 2
    const finalDamage = baseDamage + randomBonus;
    return Math.max(1, finalDamage);
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
