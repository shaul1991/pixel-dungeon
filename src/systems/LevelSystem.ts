/**
 * LevelSystem - 레벨업 및 경험치 관리 시스템
 *
 * 경험치 획득, 레벨업 판정, 스탯 증가 계산을 담당합니다.
 */

export interface LevelUpResult {
  newLevel: number;
  hpIncrease: number;
  mpIncrease: number;
  attackIncrease: number;
  defenseIncrease: number;
}

export interface PlayerStats {
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
}

/**
 * 레벨별 필요 경험치 테이블
 * 레벨 1→2 필요 경험치: EXP_TABLE[1] = 100
 */
const EXP_TABLE: Record<number, number> = {
  1: 100,
  2: 200,
  3: 350,
  4: 550,
  5: 800,
  6: 1100,
  7: 1500,
  8: 2000,
  9: 2600,
  10: 3500, // 최대 레벨 10
};

/**
 * 레벨업 시 스탯 증가량
 */
const STAT_GROWTH = {
  hp: 10, // 레벨당 HP +10
  mp: 5, // 레벨당 MP +5
  attack: 2, // 레벨당 공격력 +2
  defense: 1, // 레벨당 방어력 +1
};

/**
 * 최대 레벨
 */
export const MAX_LEVEL = 10;

export class LevelSystem {
  /**
   * 다음 레벨까지 필요한 경험치 반환
   * @param currentLevel 현재 레벨
   * @returns 다음 레벨까지 필요한 총 경험치, 최대 레벨이면 -1
   */
  public static getExpForNextLevel(currentLevel: number): number {
    if (currentLevel >= MAX_LEVEL) {
      return -1; // 최대 레벨
    }
    return EXP_TABLE[currentLevel] ?? -1;
  }

  /**
   * 레벨업 가능 여부 확인
   * @param currentLevel 현재 레벨
   * @param currentExp 현재 경험치
   * @returns 레벨업 가능 여부
   */
  public static canLevelUp(currentLevel: number, currentExp: number): boolean {
    const requiredExp = LevelSystem.getExpForNextLevel(currentLevel);
    if (requiredExp === -1) {
      return false; // 최대 레벨 또는 유효하지 않은 레벨
    }
    return currentExp >= requiredExp;
  }

  /**
   * 레벨업 처리 및 스탯 증가량 계산
   * @param currentLevel 현재 레벨
   * @param currentExp 현재 경험치
   * @returns 레벨업 결과 (null이면 레벨업 불가)
   */
  public static processLevelUp(
    currentLevel: number,
    currentExp: number
  ): LevelUpResult | null {
    if (!LevelSystem.canLevelUp(currentLevel, currentExp)) {
      return null;
    }

    return {
      newLevel: currentLevel + 1,
      hpIncrease: STAT_GROWTH.hp,
      mpIncrease: STAT_GROWTH.mp,
      attackIncrease: STAT_GROWTH.attack,
      defenseIncrease: STAT_GROWTH.defense,
    };
  }

  /**
   * 경험치 추가 및 레벨업 연속 처리
   * @param stats 현재 플레이어 스탯
   * @param expGain 획득한 경험치
   * @returns 업데이트된 스탯과 레벨업 횟수
   */
  public static addExperience(
    stats: PlayerStats,
    expGain: number
  ): { updatedStats: PlayerStats; levelUps: number } {
    const updatedStats = { ...stats };
    updatedStats.exp += expGain;
    let levelUps = 0;

    // 연속 레벨업 처리 (한 번에 많은 경험치 획득 시)
    while (LevelSystem.canLevelUp(updatedStats.level, updatedStats.exp)) {
      const requiredExp = LevelSystem.getExpForNextLevel(updatedStats.level);
      const levelUpResult = LevelSystem.processLevelUp(
        updatedStats.level,
        updatedStats.exp
      );

      if (!levelUpResult) break;

      // 경험치 차감 및 스탯 적용
      updatedStats.exp -= requiredExp;
      updatedStats.level = levelUpResult.newLevel;
      updatedStats.maxHp += levelUpResult.hpIncrease;
      updatedStats.maxMp += levelUpResult.mpIncrease;
      updatedStats.attack += levelUpResult.attackIncrease;
      updatedStats.defense += levelUpResult.defenseIncrease;

      // 레벨업 시 HP/MP 전체 회복
      updatedStats.hp = updatedStats.maxHp;
      updatedStats.mp = updatedStats.maxMp;

      levelUps++;
    }

    return { updatedStats, levelUps };
  }

  /**
   * 현재 레벨에서의 경험치 진행률 (0-1)
   * @param currentLevel 현재 레벨
   * @param currentExp 현재 경험치
   * @returns 진행률 (0-1), 최대 레벨이면 1
   */
  public static getExpProgress(currentLevel: number, currentExp: number): number {
    const requiredExp = LevelSystem.getExpForNextLevel(currentLevel);
    if (requiredExp === -1) {
      return 1; // 최대 레벨
    }
    return Math.min(1, currentExp / requiredExp);
  }

  /**
   * 초기 플레이어 스탯 생성
   * @returns 레벨 1 기본 스탯
   */
  public static createInitialStats(): PlayerStats {
    return {
      level: 1,
      exp: 0,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 10,
      defense: 5,
    };
  }
}
