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

    it('should calculate base damage as attack - defense/2', () => {
      // Random returns 0.4 -> Math.floor(0.4 * 5) - 2 = 0
      vi.mocked(Math.random).mockReturnValue(0.4);

      const damage = BattleSystem.calculateDamage(10, 4);
      // base: 10 - 2 = 8, random: 0, final: 8
      expect(damage).toBe(8);
    });

    it('should add random bonus between -2 and 2', () => {
      // Random returns 0.0 -> Math.floor(0 * 5) - 2 = -2
      vi.mocked(Math.random).mockReturnValue(0.0);
      expect(BattleSystem.calculateDamage(10, 0)).toBe(8); // 10 + (-2) = 8

      // Random returns 0.99 -> Math.floor(0.99 * 5) - 2 = 2
      vi.mocked(Math.random).mockReturnValue(0.99);
      expect(BattleSystem.calculateDamage(10, 0)).toBe(12); // 10 + 2 = 12
    });

    it('should return minimum 1 damage when calculated damage is 0 or negative', () => {
      vi.mocked(Math.random).mockReturnValue(0.0); // -2 bonus

      const damage = BattleSystem.calculateDamage(1, 10);
      // base: 1 - 5 = -4, random: -2, final: -6 -> min 1
      expect(damage).toBe(1);
    });

    it('should handle zero attack', () => {
      vi.mocked(Math.random).mockReturnValue(0.4); // 0 bonus

      const damage = BattleSystem.calculateDamage(0, 0);
      // base: 0, random: 0, final: 0 -> min 1
      expect(damage).toBe(1);
    });

    it('should floor defense divided by 2', () => {
      vi.mocked(Math.random).mockReturnValue(0.4); // 0 bonus

      // defense 5 -> 2 (floored)
      const damage = BattleSystem.calculateDamage(10, 5);
      // base: 10 - 2 = 8
      expect(damage).toBe(8);

      // defense 3 -> 1 (floored)
      const damage2 = BattleSystem.calculateDamage(10, 3);
      // base: 10 - 1 = 9
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
        attack: 5,
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
        attack: 3,
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
