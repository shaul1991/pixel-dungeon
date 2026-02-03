/**
 * InventorySystem 단위 테스트
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  InventorySystem,
  MAX_INVENTORY_SLOTS,
  MAX_STACK_SIZE,
} from './InventorySystem';
import type { Item, InventoryItem, ItemEffect } from '../types';

// 테스트용 아이템 생성 헬퍼
function createItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test_item',
    name: '테스트 아이템',
    description: '테스트용 아이템입니다.',
    category: 'consumable',
    rarity: 'common',
    stackable: true,
    quantity: 1,
    ...overrides,
  };
}

function createInventoryItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    ...createItem(),
    quantity: 1,
    ...overrides,
  };
}

describe('InventorySystem', () => {
  describe('addItem', () => {
    it('should add item to empty inventory', () => {
      const inventory: InventoryItem[] = [];
      const item = createItem({ id: 'potion', name: '포션' });

      const { inventory: updated, result } = InventorySystem.addItem(inventory, item, 1);

      expect(updated.length).toBe(1);
      expect(updated[0].id).toBe('potion');
      expect(updated[0].quantity).toBe(1);
      expect(result.success).toBe(true);
      expect(result.addedQuantity).toBe(1);
    });

    it('should stack items when stackable', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', name: '포션', stackable: true, quantity: 5 }),
      ];
      const item = createItem({ id: 'potion', name: '포션', stackable: true });

      const { inventory: updated, result } = InventorySystem.addItem(inventory, item, 3);

      expect(updated.length).toBe(1);
      expect(updated[0].quantity).toBe(8);
      expect(result.addedQuantity).toBe(3);
    });

    it('should not stack different items', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion_hp', name: 'HP 포션', quantity: 5 }),
      ];
      const item = createItem({ id: 'potion_mp', name: 'MP 포션' });

      const { inventory: updated } = InventorySystem.addItem(inventory, item, 1);

      expect(updated.length).toBe(2);
      expect(updated[0].quantity).toBe(5);
      expect(updated[1].quantity).toBe(1);
    });

    it('should respect MAX_STACK_SIZE', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', quantity: 95 }),
      ];
      const item = createItem({ id: 'potion' });

      const { inventory: updated, result } = InventorySystem.addItem(inventory, item, 10);

      expect(updated[0].quantity).toBe(MAX_STACK_SIZE);
      expect(updated.length).toBe(2); // 새 스택 생성
      expect(result.addedQuantity).toBe(10);
    });

    it('should fail when inventory is full', () => {
      const inventory: InventoryItem[] = Array.from({ length: MAX_INVENTORY_SLOTS }, (_, i) =>
        createInventoryItem({ id: `item_${i}`, stackable: false })
      );
      const item = createItem({ id: 'new_item', stackable: false });

      const { result } = InventorySystem.addItem(inventory, item, 1);

      expect(result.success).toBe(false);
      expect(result.addedQuantity).toBe(0);
      expect(result.message).toBe('인벤토리가 가득 찼습니다.');
    });

    it('should add non-stackable items to separate slots', () => {
      const inventory: InventoryItem[] = [];
      const item = createItem({ id: 'sword', stackable: false });

      const { inventory: updated } = InventorySystem.addItem(inventory, item, 1);
      const { inventory: updated2 } = InventorySystem.addItem(updated, item, 1);

      expect(updated2.length).toBe(2);
      expect(updated2[0].quantity).toBe(1);
      expect(updated2[1].quantity).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item from inventory', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', quantity: 5 }),
      ];

      const { inventory: updated, success, removedQuantity } = InventorySystem.removeItem(
        inventory,
        'potion',
        2
      );

      expect(success).toBe(true);
      expect(removedQuantity).toBe(2);
      expect(updated[0].quantity).toBe(3);
    });

    it('should remove item completely when quantity reaches 0', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', quantity: 1 }),
      ];

      const { inventory: updated, success } = InventorySystem.removeItem(inventory, 'potion', 1);

      expect(success).toBe(true);
      expect(updated.length).toBe(0);
    });

    it('should return false when item not found', () => {
      const inventory: InventoryItem[] = [];

      const { success, removedQuantity } = InventorySystem.removeItem(
        inventory,
        'nonexistent',
        1
      );

      expect(success).toBe(false);
      expect(removedQuantity).toBe(0);
    });

    it('should remove only available quantity', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', quantity: 3 }),
      ];

      const { inventory: updated, removedQuantity } = InventorySystem.removeItem(
        inventory,
        'potion',
        10
      );

      expect(removedQuantity).toBe(3);
      expect(updated.length).toBe(0);
    });
  });

  describe('useItem', () => {
    it('should use consumable item and return effect', () => {
      const effect: ItemEffect = { type: 'heal_hp', value: 30 };
      const inventory: InventoryItem[] = [
        createInventoryItem({
          id: 'health_potion',
          category: 'consumable',
          quantity: 2,
          effect,
        }),
      ];

      const { inventory: updated, result } = InventorySystem.useItem(inventory, 'health_potion');

      expect(result.success).toBe(true);
      expect(result.effect).toEqual(effect);
      expect(updated[0].quantity).toBe(1);
    });

    it('should fail for non-consumable items', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'sword', category: 'weapon', quantity: 1 }),
      ];

      const { result } = InventorySystem.useItem(inventory, 'sword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('사용할 수 없는 아이템입니다.');
    });

    it('should fail when item not found', () => {
      const inventory: InventoryItem[] = [];

      const { result } = InventorySystem.useItem(inventory, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toBe('아이템을 찾을 수 없습니다.');
    });
  });

  describe('getItem', () => {
    it('should return item when found', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', name: '포션' }),
      ];

      const item = InventorySystem.getItem(inventory, 'potion');

      expect(item).toBeDefined();
      expect(item?.name).toBe('포션');
    });

    it('should return undefined when not found', () => {
      const inventory: InventoryItem[] = [];

      const item = InventorySystem.getItem(inventory, 'nonexistent');

      expect(item).toBeUndefined();
    });
  });

  describe('getItemCount', () => {
    it('should return total quantity', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', quantity: 5 }),
      ];

      const count = InventorySystem.getItemCount(inventory, 'potion');

      expect(count).toBe(5);
    });

    it('should return 0 when item not found', () => {
      const inventory: InventoryItem[] = [];

      const count = InventorySystem.getItemCount(inventory, 'nonexistent');

      expect(count).toBe(0);
    });
  });

  describe('isFull', () => {
    it('should return true when inventory is full', () => {
      const inventory: InventoryItem[] = Array.from({ length: MAX_INVENTORY_SLOTS }, (_, i) =>
        createInventoryItem({ id: `item_${i}` })
      );

      expect(InventorySystem.isFull(inventory)).toBe(true);
    });

    it('should return false when inventory has space', () => {
      const inventory: InventoryItem[] = [createInventoryItem()];

      expect(InventorySystem.isFull(inventory)).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return correct available slots', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'item1' }),
        createInventoryItem({ id: 'item2' }),
      ];

      expect(InventorySystem.getAvailableSlots(inventory)).toBe(MAX_INVENTORY_SLOTS - 2);
    });
  });

  describe('filterByCategory', () => {
    it('should filter items by category', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', category: 'consumable' }),
        createInventoryItem({ id: 'sword', category: 'weapon' }),
        createInventoryItem({ id: 'antidote', category: 'consumable' }),
      ];

      const consumables = InventorySystem.filterByCategory(inventory, 'consumable');

      expect(consumables.length).toBe(2);
      expect(consumables.every((i) => i.category === 'consumable')).toBe(true);
    });
  });

  describe('getConsumables', () => {
    it('should return only consumable items', () => {
      const inventory: InventoryItem[] = [
        createInventoryItem({ id: 'potion', category: 'consumable' }),
        createInventoryItem({ id: 'sword', category: 'weapon' }),
      ];

      const consumables = InventorySystem.getConsumables(inventory);

      expect(consumables.length).toBe(1);
      expect(consumables[0].id).toBe('potion');
    });
  });

  describe('applyEffect', () => {
    it('should heal HP', () => {
      const effect: ItemEffect = { type: 'heal_hp', value: 30 };

      const result = InventorySystem.applyEffect(effect, 50, 100, 30, 50);

      expect(result.hp).toBe(80);
      expect(result.mp).toBe(30);
      expect(result.message).toBe('HP가 30 회복되었습니다.');
    });

    it('should not exceed max HP', () => {
      const effect: ItemEffect = { type: 'heal_hp', value: 100 };

      const result = InventorySystem.applyEffect(effect, 90, 100, 30, 50);

      expect(result.hp).toBe(100);
      expect(result.message).toBe('HP가 10 회복되었습니다.');
    });

    it('should heal MP', () => {
      const effect: ItemEffect = { type: 'heal_mp', value: 20 };

      const result = InventorySystem.applyEffect(effect, 100, 100, 20, 50);

      expect(result.mp).toBe(40);
      expect(result.message).toBe('MP가 20 회복되었습니다.');
    });

    it('should not exceed max MP', () => {
      const effect: ItemEffect = { type: 'heal_mp', value: 100 };

      const result = InventorySystem.applyEffect(effect, 100, 100, 45, 50);

      expect(result.mp).toBe(50);
      expect(result.message).toBe('MP가 5 회복되었습니다.');
    });

    it('should cure poison', () => {
      const effect: ItemEffect = { type: 'cure_poison' };

      const result = InventorySystem.applyEffect(effect, 100, 100, 50, 50);

      expect(result.message).toBe('독이 해제되었습니다.');
    });
  });

  describe('calculateLoot', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should drop item when random < dropRate', () => {
      vi.mocked(Math.random).mockReturnValue(0.1);

      const lootTable = [{ itemId: 'potion', dropRate: 0.3 }];
      const itemDatabase = {
        potion: createItem({ id: 'potion', name: '포션' }),
      };

      const drops = InventorySystem.calculateLoot(lootTable, itemDatabase);

      expect(drops.length).toBe(1);
      expect(drops[0].id).toBe('potion');
    });

    it('should not drop item when random >= dropRate', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const lootTable = [{ itemId: 'potion', dropRate: 0.3 }];
      const itemDatabase = {
        potion: createItem({ id: 'potion', name: '포션' }),
      };

      const drops = InventorySystem.calculateLoot(lootTable, itemDatabase);

      expect(drops.length).toBe(0);
    });

    it('should handle multiple loot entries', () => {
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.1) // First item drops
        .mockReturnValueOnce(0.9); // Second item doesn't drop

      const lootTable = [
        { itemId: 'potion', dropRate: 0.3 },
        { itemId: 'gold', dropRate: 0.5 },
      ];
      const itemDatabase = {
        potion: createItem({ id: 'potion', name: '포션' }),
        gold: createItem({ id: 'gold', name: '골드' }),
      };

      const drops = InventorySystem.calculateLoot(lootTable, itemDatabase);

      expect(drops.length).toBe(1);
      expect(drops[0].id).toBe('potion');
    });
  });
});
