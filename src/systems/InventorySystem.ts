/**
 * InventorySystem - 인벤토리 관리 시스템
 *
 * 아이템 추가, 제거, 사용, 스택 관리를 담당합니다.
 */

import type { Item, InventoryItem, ItemEffect } from '../types';

/** 인벤토리 최대 슬롯 수 */
export const MAX_INVENTORY_SLOTS = 20;

/** 스택 가능 아이템의 최대 수량 */
export const MAX_STACK_SIZE = 99;

/** 아이템 사용 결과 */
export interface UseItemResult {
  success: boolean;
  effect?: ItemEffect;
  message: string;
}

/** 아이템 추가 결과 */
export interface AddItemResult {
  success: boolean;
  addedQuantity: number;
  remainingQuantity: number;
  message: string;
}

export class InventorySystem {
  /**
   * 인벤토리에 아이템 추가
   * @param inventory 현재 인벤토리
   * @param item 추가할 아이템
   * @param quantity 추가할 수량 (기본 1)
   * @returns 업데이트된 인벤토리와 결과
   */
  public static addItem(
    inventory: InventoryItem[],
    item: Item,
    quantity: number = 1
  ): { inventory: InventoryItem[]; result: AddItemResult } {
    const updatedInventory = [...inventory];
    let remainingQuantity = quantity;
    let addedQuantity = 0;

    // 스택 가능한 아이템인 경우 기존 스택에 추가
    if (item.stackable) {
      const existingItem = updatedInventory.find((i) => i.id === item.id);
      if (existingItem) {
        const spaceInStack = MAX_STACK_SIZE - existingItem.quantity;
        const toAdd = Math.min(spaceInStack, remainingQuantity);
        existingItem.quantity += toAdd;
        addedQuantity += toAdd;
        remainingQuantity -= toAdd;
      }
    }

    // 남은 수량이 있고 새 슬롯이 필요한 경우
    while (remainingQuantity > 0 && updatedInventory.length < MAX_INVENTORY_SLOTS) {
      const toAdd = item.stackable ? Math.min(MAX_STACK_SIZE, remainingQuantity) : 1;
      updatedInventory.push({
        ...item,
        quantity: toAdd,
      });
      addedQuantity += toAdd;
      remainingQuantity -= toAdd;

      // 스택 불가 아이템은 한 번에 하나만 추가
      if (!item.stackable) {
        remainingQuantity = 0;
      }
    }

    const success = addedQuantity > 0;
    let message: string;
    if (success && remainingQuantity > 0) {
      message = `${item.name} ${addedQuantity}개 획득 (인벤토리 가득 참)`;
    } else if (success) {
      message = `${item.name} ${addedQuantity}개 획득`;
    } else {
      message = '인벤토리가 가득 찼습니다.';
    }

    return {
      inventory: updatedInventory,
      result: {
        success,
        addedQuantity,
        remainingQuantity,
        message,
      },
    };
  }

  /**
   * 인벤토리에서 아이템 제거
   * @param inventory 현재 인벤토리
   * @param itemId 제거할 아이템 ID
   * @param quantity 제거할 수량 (기본 1)
   * @returns 업데이트된 인벤토리와 성공 여부
   */
  public static removeItem(
    inventory: InventoryItem[],
    itemId: string,
    quantity: number = 1
  ): { inventory: InventoryItem[]; success: boolean; removedQuantity: number } {
    const itemIndex = inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      return { inventory: [...inventory], success: false, removedQuantity: 0 };
    }

    const updatedInventory = [...inventory];
    const item = { ...updatedInventory[itemIndex] };
    const toRemove = Math.min(item.quantity, quantity);

    item.quantity -= toRemove;

    if (item.quantity <= 0) {
      updatedInventory.splice(itemIndex, 1);
    } else {
      updatedInventory[itemIndex] = item;
    }

    return {
      inventory: updatedInventory,
      success: true,
      removedQuantity: toRemove,
    };
  }

  /**
   * 아이템 사용
   * @param inventory 현재 인벤토리
   * @param itemId 사용할 아이템 ID
   * @returns 업데이트된 인벤토리와 사용 결과
   */
  public static useItem(
    inventory: InventoryItem[],
    itemId: string
  ): { inventory: InventoryItem[]; result: UseItemResult } {
    const item = inventory.find((i) => i.id === itemId);

    if (!item) {
      return {
        inventory: [...inventory],
        result: {
          success: false,
          message: '아이템을 찾을 수 없습니다.',
        },
      };
    }

    if (item.category !== 'consumable') {
      return {
        inventory: [...inventory],
        result: {
          success: false,
          message: '사용할 수 없는 아이템입니다.',
        },
      };
    }

    // 아이템 제거
    const { inventory: updatedInventory } = InventorySystem.removeItem(inventory, itemId, 1);

    return {
      inventory: updatedInventory,
      result: {
        success: true,
        effect: item.effect,
        message: `${item.name}을(를) 사용했습니다.`,
      },
    };
  }

  /**
   * 특정 아이템 조회
   * @param inventory 인벤토리
   * @param itemId 아이템 ID
   * @returns 아이템 또는 undefined
   */
  public static getItem(inventory: InventoryItem[], itemId: string): InventoryItem | undefined {
    return inventory.find((i) => i.id === itemId);
  }

  /**
   * 특정 아이템의 총 수량 조회
   * @param inventory 인벤토리
   * @param itemId 아이템 ID
   * @returns 총 수량
   */
  public static getItemCount(inventory: InventoryItem[], itemId: string): number {
    return inventory
      .filter((i) => i.id === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * 인벤토리가 가득 찼는지 확인
   * @param inventory 인벤토리
   * @returns 가득 찼으면 true
   */
  public static isFull(inventory: InventoryItem[]): boolean {
    return inventory.length >= MAX_INVENTORY_SLOTS;
  }

  /**
   * 사용 가능한 슬롯 수 조회
   * @param inventory 인벤토리
   * @returns 빈 슬롯 수
   */
  public static getAvailableSlots(inventory: InventoryItem[]): number {
    return MAX_INVENTORY_SLOTS - inventory.length;
  }

  /**
   * 카테고리별 아이템 필터링
   * @param inventory 인벤토리
   * @param category 카테고리
   * @returns 필터링된 아이템 목록
   */
  public static filterByCategory(
    inventory: InventoryItem[],
    category: Item['category']
  ): InventoryItem[] {
    return inventory.filter((i) => i.category === category);
  }

  /**
   * 소비 아이템만 조회 (전투 중 사용 가능)
   * @param inventory 인벤토리
   * @returns 소비 아이템 목록
   */
  public static getConsumables(inventory: InventoryItem[]): InventoryItem[] {
    return InventorySystem.filterByCategory(inventory, 'consumable');
  }

  /**
   * 아이템 효과 적용
   * @param effect 아이템 효과
   * @param currentHp 현재 HP
   * @param maxHp 최대 HP
   * @param currentMp 현재 MP
   * @param maxMp 최대 MP
   * @returns 업데이트된 HP, MP
   */
  public static applyEffect(
    effect: ItemEffect,
    currentHp: number,
    maxHp: number,
    currentMp: number,
    maxMp: number
  ): { hp: number; mp: number; message: string } {
    let hp = currentHp;
    let mp = currentMp;
    let message = '';

    switch (effect.type) {
      case 'heal_hp':
        const hpHealed = Math.min(effect.value ?? 0, maxHp - currentHp);
        hp = currentHp + hpHealed;
        message = `HP가 ${hpHealed} 회복되었습니다.`;
        break;

      case 'heal_mp':
        const mpHealed = Math.min(effect.value ?? 0, maxMp - currentMp);
        mp = currentMp + mpHealed;
        message = `MP가 ${mpHealed} 회복되었습니다.`;
        break;

      case 'cure_poison':
        message = '독이 해제되었습니다.';
        break;

      default:
        message = '효과가 적용되었습니다.';
    }

    return { hp, mp, message };
  }

  /**
   * 몬스터 처치 시 아이템 드롭 계산
   * @param lootTable 루트 테이블 (아이템 ID와 드롭률)
   * @param itemDatabase 아이템 데이터베이스
   * @returns 드롭된 아이템 목록
   */
  public static calculateLoot(
    lootTable: Array<{ itemId: string; dropRate: number }>,
    itemDatabase: Record<string, Item>
  ): Item[] {
    const drops: Item[] = [];

    for (const entry of lootTable) {
      if (Math.random() < entry.dropRate) {
        const itemData = itemDatabase[entry.itemId];
        if (itemData) {
          drops.push({
            ...itemData,
            quantity: 1,
          });
        }
      }
    }

    return drops;
  }
}
