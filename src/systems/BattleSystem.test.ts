import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BattleSystem } from './BattleSystem';
import type { BattleRewards } from './BattleSystem';
import type { MonsterConfig } from '../entities/Monster';

describe('BattleSystem', () => {
  describe('calculateDamage', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should calculate damage with attackMin-attackMax range', () => {
      // Random returns 0 -> picks attackMin (8)
      vi.mocked(Math.random).mockReturnValue(0);

      const damage = BattleSystem.calculateDamage(8, 12, 4);
      // attackPower: 8, base: 8 - 2 = 6
      expect(damage).toBe(6);
    });

    it('should pick random attack value within range', () => {
      // Random returns 0 -> attackMin (8)
      vi.mocked(Math.random).mockReturnValue(0);
      expect(BattleSystem.calculateDamage(8, 12, 0)).toBe(8);

      // Random returns near 1 -> attackMax (12)
      vi.mocked(Math.random).mockReturnValue(0.99);
      expect(BattleSystem.calculateDamage(8, 12, 0)).toBe(12);
    });

    it('should return minimum 1 damage when calculated damage is 0 or negative', () => {
      vi.mocked(Math.random).mockReturnValue(0); // picks attackMin

      const damage = BattleSystem.calculateDamage(1, 3, 10);
      // attackPower: 1, base: 1 - 5 = -4 -> min 1
      expect(damage).toBe(1);
    });

    it('should handle zero attack', () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const damage = BattleSystem.calculateDamage(0, 0, 0);
      // attackPower: 0, base: 0 -> min 1
      expect(damage).toBe(1);
    });

    it('should floor defense divided by 2', () => {
      vi.mocked(Math.random).mockReturnValue(0); // picks attackMin

      // defense 5 -> 2 (floored)
      const damage = BattleSystem.calculateDamage(10, 10, 5);
      // attackPower: 10, base: 10 - 2 = 8
      expect(damage).toBe(8);

      // defense 3 -> 1 (floored)
      const damage2 = BattleSystem.calculateDamage(10, 10, 3);
      // attackPower: 10, base: 10 - 1 = 9
      expect(damage2).toBe(9);
    });
  });

  describe('tryEscape', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true when random < 0.5', () => {
      vi.mocked(Math.random).mockReturnValue(0.49);
      expect(BattleSystem.tryEscape()).toBe(true);
    });

    it('should return false when random >= 0.5', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);
      expect(BattleSystem.tryEscape()).toBe(false);
    });

    it('should return true at boundary (0.0)', () => {
      vi.mocked(Math.random).mockReturnValue(0.0);
      expect(BattleSystem.tryEscape()).toBe(true);
    });
  });

  describe('calculateRewards', () => {
    it('should return exp and gold from monster config', () => {
      const monster: MonsterConfig = {
        id: 'slime',
        name: 'Slime',
        hp: 30,
        attackMin: 3,
        attackMax: 7,
        defense: 2,
        exp: 10,
        gold: 5,
      };

      const rewards: BattleRewards = BattleSystem.calculateRewards(monster);

      expect(rewards.exp).toBe(10);
      expect(rewards.gold).toBe(5);
    });

    it('should handle zero rewards', () => {
      const monster: MonsterConfig = {
        id: 'ghost',
        name: 'Ghost',
        hp: 20,
        attackMin: 2,
        attackMax: 4,
        defense: 0,
        exp: 0,
        gold: 0,
      };

      const rewards: BattleRewards = BattleSystem.calculateRewards(monster);

      expect(rewards.exp).toBe(0);
      expect(rewards.gold).toBe(0);
    });
  });
});
