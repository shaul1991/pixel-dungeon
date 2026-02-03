import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Player.canMoveTo() 충돌 체크 로직 테스트
 *
 * Player 클래스는 Phaser에 의존하므로, 충돌 체크 로직만 분리하여 테스트합니다.
 * 실제 Player 인스턴스 없이 콜백 로직을 검증합니다.
 */

// 충돌 체크 로직 (Player.canMoveTo에서 추출)
function canMoveToTile(
  targetTileX: number,
  targetTileY: number,
  isWallAt: (x: number, y: number) => boolean,
  collisionCallback: ((x: number, y: number) => boolean) | null
): boolean {
  // 벽 체크
  if (isWallAt(targetTileX, targetTileY)) {
    return false;
  }

  // 추가 충돌 체크 (NPC, 몬스터 등)
  if (collisionCallback && collisionCallback(targetTileX, targetTileY)) {
    return false;
  }

  return true;
}

describe('Player collision logic', () => {
  describe('canMoveToTile', () => {
    let mockIsWallAt: ReturnType<typeof vi.fn>;
    let mockCollisionCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockIsWallAt = vi.fn().mockReturnValue(false);
      mockCollisionCallback = vi.fn().mockReturnValue(false);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should allow movement to empty tile', () => {
      const result = canMoveToTile(5, 5, mockIsWallAt, mockCollisionCallback);

      expect(result).toBe(true);
      expect(mockIsWallAt).toHaveBeenCalledWith(5, 5);
      expect(mockCollisionCallback).toHaveBeenCalledWith(5, 5);
    });

    it('should block movement to wall tile', () => {
      mockIsWallAt.mockReturnValue(true);

      const result = canMoveToTile(3, 3, mockIsWallAt, mockCollisionCallback);

      expect(result).toBe(false);
      expect(mockIsWallAt).toHaveBeenCalledWith(3, 3);
      // 벽에서 막히면 콜백은 호출되지 않음
      expect(mockCollisionCallback).not.toHaveBeenCalled();
    });

    it('should block movement to tile with NPC', () => {
      // NPC가 (4, 2)에 있음
      mockCollisionCallback.mockImplementation((x, y) => x === 4 && y === 2);

      const result = canMoveToTile(4, 2, mockIsWallAt, mockCollisionCallback);

      expect(result).toBe(false);
    });

    it('should block movement to tile with monster', () => {
      // 몬스터가 (7, 7)에 있음
      mockCollisionCallback.mockImplementation((x, y) => x === 7 && y === 7);

      const result = canMoveToTile(7, 7, mockIsWallAt, mockCollisionCallback);

      expect(result).toBe(false);
    });

    it('should allow movement when no collision callback is set', () => {
      const result = canMoveToTile(5, 5, mockIsWallAt, null);

      expect(result).toBe(true);
      expect(mockIsWallAt).toHaveBeenCalledWith(5, 5);
    });

    it('should check wall before collision callback', () => {
      // 벽도 있고 NPC도 있는 타일
      mockIsWallAt.mockReturnValue(true);
      mockCollisionCallback.mockReturnValue(true);

      const result = canMoveToTile(1, 1, mockIsWallAt, mockCollisionCallback);

      expect(result).toBe(false);
      // 벽에서 먼저 막히므로 콜백은 호출되지 않음
      expect(mockIsWallAt).toHaveBeenCalled();
      expect(mockCollisionCallback).not.toHaveBeenCalled();
    });
  });

  describe('entity blocking scenarios', () => {
    it('should block all four NPC positions', () => {
      // NPC 위치 목록
      const npcPositions = [
        { x: 3, y: 2 },
        { x: 5, y: 4 },
      ];

      const isBlockedByEntity = (x: number, y: number): boolean => {
        return npcPositions.some((pos) => pos.x === x && pos.y === y);
      };

      const mockIsWallAt = vi.fn().mockReturnValue(false);

      // NPC 위치로 이동 불가
      expect(canMoveToTile(3, 2, mockIsWallAt, isBlockedByEntity)).toBe(false);
      expect(canMoveToTile(5, 4, mockIsWallAt, isBlockedByEntity)).toBe(false);

      // 빈 타일로 이동 가능
      expect(canMoveToTile(4, 4, mockIsWallAt, isBlockedByEntity)).toBe(true);
    });

    it('should block all monster positions', () => {
      // 몬스터 위치 목록 (실제 게임의 배치)
      const monsterPositions = [
        { x: 2, y: 2 },
        { x: 7, y: 2 },
        { x: 2, y: 7 },
        { x: 7, y: 7 },
      ];

      const isBlockedByEntity = (x: number, y: number): boolean => {
        return monsterPositions.some((pos) => pos.x === x && pos.y === y);
      };

      const mockIsWallAt = vi.fn().mockReturnValue(false);

      // 모든 몬스터 위치로 이동 불가
      monsterPositions.forEach((pos) => {
        expect(canMoveToTile(pos.x, pos.y, mockIsWallAt, isBlockedByEntity)).toBe(false);
      });

      // 몬스터가 없는 위치로 이동 가능
      expect(canMoveToTile(5, 5, mockIsWallAt, isBlockedByEntity)).toBe(true);
    });
  });
});
