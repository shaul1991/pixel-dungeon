/**
 * EncounterSystem - 랜덤 인카운터 시스템
 *
 * 풀숲(grass) 타일 위에서 이동 시 확률적으로 야생 몬스터와 조우
 */

import type { EncounterConfig } from '../types';
import type { MonsterConfig } from '../entities/Monster';

/** 인카운터 결과 */
export interface EncounterResult {
  triggered: boolean;
  monster: MonsterConfig | null;
}

/**
 * 랜덤 인카운터 시스템
 * Phaser 독립적인 순수 로직
 */
export class EncounterSystem {
  /** 기본 인카운터 확률 (10%) */
  static readonly DEFAULT_ENCOUNTER_RATE = 0.1;

  /** 기본 인카운터 가능 몬스터 */
  static readonly DEFAULT_MONSTERS = ['slime'];

  /**
   * 인카운터 체크
   * @param config 인카운터 설정 (선택)
   * @param monstersData 몬스터 데이터 맵
   * @returns 인카운터 결과
   */
  static checkEncounter(
    monstersData: Record<string, MonsterConfig>,
    config?: Partial<EncounterConfig>
  ): EncounterResult {
    const encounterRate = config?.encounterRate ?? this.DEFAULT_ENCOUNTER_RATE;
    const possibleMonsters = config?.possibleMonsters ?? this.DEFAULT_MONSTERS;

    // 확률 체크
    const roll = Math.random();
    if (roll >= encounterRate) {
      return { triggered: false, monster: null };
    }

    // 랜덤 몬스터 선택
    const monster = this.selectRandomMonster(possibleMonsters, monstersData);
    return { triggered: true, monster };
  }

  /**
   * 랜덤 몬스터 선택
   */
  static selectRandomMonster(
    possibleMonsters: string[],
    monstersData: Record<string, MonsterConfig>
  ): MonsterConfig | null {
    if (possibleMonsters.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * possibleMonsters.length);
    const monsterId = possibleMonsters[randomIndex];
    return monstersData[monsterId] ?? null;
  }

  /**
   * 인카운터 확률 계산 (레벨 등 요소 반영 가능)
   * @param baseRate 기본 확률
   * @param modifiers 수정자 (예: 아이템 효과)
   */
  static calculateEncounterRate(baseRate: number, modifiers: number = 0): number {
    const rate = baseRate + modifiers;
    return Math.max(0, Math.min(1, rate)); // 0~1 범위로 제한
  }
}
