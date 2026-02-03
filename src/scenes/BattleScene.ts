import Phaser from 'phaser';
import { UI_HEIGHT } from '../config';
import { BattleUI } from '../ui/BattleUI';
import { BattleSystem } from '../systems/BattleSystem';
import { InventorySystem } from '../systems/InventorySystem';
import type { MonsterConfig } from '../entities/Monster';
import type { InventoryItem } from '../types';

export interface PlayerData {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
}

export interface BattleSceneData {
  player: PlayerData;
  monster: MonsterConfig;
  monsterTileX: number;
  monsterTileY: number;
  // 플레이어 위치 (전투 후 복원용)
  playerTileX: number;
  playerTileY: number;
  // 인벤토리
  inventory: InventoryItem[];
}

export type BattleResult = 'win' | 'lose' | 'escape';

export class BattleScene extends Phaser.Scene {
  private playerData!: PlayerData;
  private monsterData!: MonsterConfig;
  private monsterTileX!: number;
  private monsterTileY!: number;
  private playerTileX!: number;
  private playerTileY!: number;

  private currentTurn: 'player' | 'monster' = 'player';
  private battleUI!: BattleUI;
  private isProcessing: boolean = false;

  // 인벤토리
  private inventory: InventoryItem[] = [];
  private isInItemMenu: boolean = false;
  private itemMenuIndex: number = 0;
  private consumableItems: InventoryItem[] = [];

  // 아이템 메뉴 UI
  private itemMenuContainer!: Phaser.GameObjects.Container;
  private itemMenuTexts: Phaser.GameObjects.Text[] = [];
  private itemMenuSelector!: Phaser.GameObjects.Graphics;
  private cancelKey!: Phaser.Input.Keyboard.Key;

  // 스프라이트
  private playerSprite!: Phaser.GameObjects.Sprite;
  private monsterSprite!: Phaser.GameObjects.Sprite;

  // 입력 키
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleSceneData): void {
    this.playerData = { ...data.player };
    this.monsterData = { ...data.monster };
    this.monsterTileX = data.monsterTileX;
    this.monsterTileY = data.monsterTileY;
    this.playerTileX = data.playerTileX;
    this.playerTileY = data.playerTileY;
    this.currentTurn = 'player';
    this.isProcessing = false;

    // 인벤토리 초기화
    this.inventory = data.inventory ? [...data.inventory.map((item) => ({ ...item }))] : [];
    this.isInItemMenu = false;
    this.itemMenuIndex = 0;
    this.consumableItems = InventorySystem.getConsumables(this.inventory);
  }

  create(): void {
    // 배경 설정
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 전투 영역 배경
    this.createBattleArea();

    // 스프라이트 생성
    this.createSprites();

    // UI 생성
    this.battleUI = new BattleUI(this);
    this.battleUI.setMonsterName(this.monsterData.name);
    this.battleUI.updateMonsterHp(this.monsterData.hp, this.monsterData.hp);
    this.battleUI.updatePlayerHp(this.playerData.hp, this.playerData.maxHp);
    this.battleUI.updatePlayerMp(this.playerData.mp, this.playerData.maxMp);

    // 입력 설정
    this.setupInput();

    // 아이템 메뉴 활성화 (소비 아이템이 있는 경우)
    if (this.consumableItems.length > 0) {
      this.battleUI.setMenuEnabled('item', true);
    }

    // 아이템 메뉴 UI 생성
    this.createItemMenu();

    // 전투 시작 메시지
    this.battleUI.showMessage(`${this.monsterData.name}이(가) 나타났다!`, 1500).then(() => {
      this.battleUI.hideMessage();
      this.battleUI.showMenu();
    });

    console.log('BattleScene: Battle started with', this.monsterData.name);
  }

  private createBattleArea(): void {
    const graphics = this.add.graphics();
    const screenHeight = 320 + UI_HEIGHT; // 352
    const halfHeight = screenHeight / 2; // 176

    // 상단 영역 배경 (몬스터) - 약간 어두운 색
    graphics.fillStyle(0x1a2a1a, 1);
    graphics.fillRect(0, 0, 480, halfHeight);

    // 상단 영역 바닥 (잔디/땅 느낌)
    graphics.fillStyle(0x2d4a2d, 1);
    graphics.fillRect(0, halfHeight - 40, 480, 40);

    // 하단 영역 배경 (플레이어) - 조금 더 밝은 색
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, halfHeight, 480, halfHeight);

    // 하단 영역 바닥 (플랫폼 느낌)
    graphics.fillStyle(0x2d2d4a, 1);
    graphics.fillRect(0, halfHeight, 480, 30);

    // 중앙 구분선
    graphics.lineStyle(2, 0x3a3a5a, 0.5);
    graphics.lineBetween(0, halfHeight, 480, halfHeight);
  }

  private createSprites(): void {
    const screenHeight = 320 + UI_HEIGHT; // 352
    const halfHeight = screenHeight / 2; // 176

    // 몬스터 스프라이트 (상단 오른쪽) - 포켓몬 스타일
    this.monsterSprite = this.add.sprite(340, halfHeight - 70, 'slime');
    this.monsterSprite.setScale(4); // 크게 표시

    // 플레이어 스프라이트 (하단 왼쪽) - 포켓몬 스타일
    this.playerSprite = this.add.sprite(120, halfHeight + 50, 'player', 0);
    this.playerSprite.setScale(3);
    this.playerSprite.setFlipX(true); // 오른쪽을 보도록
  }

  private setupInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      console.error('BattleScene: Keyboard input not available');
      return;
    }

    this.cursors = keyboard.createCursorKeys();
    this.actionKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.cancelKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // WASD 추가 지원
    const wKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const dKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 방향키 입력 처리
    this.cursors.up.on('down', () => this.handleMenuInput('up'));
    this.cursors.down.on('down', () => this.handleMenuInput('down'));
    this.cursors.left.on('down', () => this.handleMenuInput('left'));
    this.cursors.right.on('down', () => this.handleMenuInput('right'));

    wKey.on('down', () => this.handleMenuInput('up'));
    sKey.on('down', () => this.handleMenuInput('down'));
    aKey.on('down', () => this.handleMenuInput('left'));
    dKey.on('down', () => this.handleMenuInput('right'));

    // 액션 키 입력 처리
    this.actionKey.on('down', () => this.handleAction());
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => this.handleAction());

    // 취소 키 입력 처리
    this.cancelKey.on('down', () => this.handleCancel());
  }

  private handleMenuInput(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.isProcessing || this.currentTurn !== 'player') return;

    // 아이템 메뉴 모드
    if (this.isInItemMenu) {
      if (direction === 'up' && this.itemMenuIndex > 0) {
        this.itemMenuIndex--;
        this.updateItemMenuSelection();
      } else if (direction === 'down' && this.itemMenuIndex < this.consumableItems.length - 1) {
        this.itemMenuIndex++;
        this.updateItemMenuSelection();
      }
      return;
    }

    // 일반 메뉴 모드
    switch (direction) {
      case 'up':
        this.battleUI.navigateUp();
        break;
      case 'down':
        this.battleUI.navigateDown();
        break;
      case 'left':
        this.battleUI.navigateLeft();
        break;
      case 'right':
        this.battleUI.navigateRight();
        break;
    }
  }

  private handleAction(): void {
    if (this.isProcessing || this.currentTurn !== 'player') return;

    // 아이템 메뉴 모드에서 선택
    if (this.isInItemMenu) {
      const selectedItem = this.consumableItems[this.itemMenuIndex];
      if (selectedItem) {
        this.useItemInBattle(selectedItem);
      }
      return;
    }

    const action = this.battleUI.getSelectedAction();
    const isEnabled = this.battleUI.isSelectedEnabled();

    if (!isEnabled) {
      // 비활성화된 메뉴 선택 시
      this.battleUI.showMessage('사용할 수 없습니다!', 800).then(() => {
        this.battleUI.hideMessage();
      });
      return;
    }

    switch (action) {
      case 'attack':
        this.playerAttack();
        break;
      case 'skill':
        // MVP에서 비활성화
        break;
      case 'item':
        this.showItemMenu();
        break;
      case 'escape':
        this.tryEscape();
        break;
    }
  }

  private handleCancel(): void {
    if (this.isProcessing || this.currentTurn !== 'player') return;

    // 아이템 메뉴에서 취소
    if (this.isInItemMenu) {
      this.hideItemMenu();
    }
  }

  private createItemMenu(): void {
    const boxX = 10;
    const boxY = 100;
    const boxWidth = 180;
    const itemHeight = 20;
    const maxItems = 5;
    const boxHeight = itemHeight * maxItems + 20;

    this.itemMenuContainer = this.add.container(0, 0);
    this.itemMenuContainer.setDepth(150);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(boxX, boxY, boxWidth, boxHeight);
    bg.lineStyle(2, 0x3a3a5c, 1);
    bg.strokeRect(boxX, boxY, boxWidth, boxHeight);
    this.itemMenuContainer.add(bg);

    // 타이틀
    const titleText = this.add.text(boxX + 10, boxY + 5, '아이템', {
      fontSize: '10px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    });
    this.itemMenuContainer.add(titleText);

    // 선택 표시자
    this.itemMenuSelector = this.add.graphics();
    this.itemMenuSelector.fillStyle(0xffcd75, 0.3);
    this.itemMenuContainer.add(this.itemMenuSelector);

    // 아이템 텍스트 (미리 생성)
    this.itemMenuTexts = [];
    for (let i = 0; i < maxItems; i++) {
      const text = this.add.text(boxX + 20, boxY + 22 + i * itemHeight, '', {
        fontSize: '9px',
        color: '#e8e8e8',
        fontFamily: 'monospace',
      });
      this.itemMenuTexts.push(text);
      this.itemMenuContainer.add(text);
    }

    // 초기에는 숨김
    this.itemMenuContainer.setVisible(false);
  }

  private showItemMenu(): void {
    // 소비 아이템 목록 갱신
    this.consumableItems = InventorySystem.getConsumables(this.inventory);

    if (this.consumableItems.length === 0) {
      this.battleUI.showMessage('사용할 아이템이 없습니다!', 800).then(() => {
        this.battleUI.hideMessage();
      });
      return;
    }

    // 아이템 목록 표시 (최대 5개)
    const displayCount = Math.min(this.consumableItems.length, 5);
    for (let i = 0; i < this.itemMenuTexts.length; i++) {
      if (i < displayCount) {
        const item = this.consumableItems[i];
        this.itemMenuTexts[i].setText(`${item.name} x${item.quantity}`);
        this.itemMenuTexts[i].setVisible(true);
      } else {
        this.itemMenuTexts[i].setVisible(false);
      }
    }

    this.itemMenuIndex = 0;
    this.updateItemMenuSelection();
    this.isInItemMenu = true;
    this.itemMenuContainer.setVisible(true);
    this.battleUI.hideMenu();
  }

  private hideItemMenu(): void {
    this.isInItemMenu = false;
    this.itemMenuContainer.setVisible(false);
    this.battleUI.showMenu();
  }

  private updateItemMenuSelection(): void {
    const boxX = 10;
    const boxY = 100;
    const boxWidth = 180;
    const itemHeight = 20;

    this.itemMenuSelector.clear();
    this.itemMenuSelector.fillStyle(0xffcd75, 0.3);
    this.itemMenuSelector.fillRect(
      boxX + 5,
      boxY + 20 + this.itemMenuIndex * itemHeight,
      boxWidth - 10,
      itemHeight
    );
  }

  private async useItemInBattle(item: InventoryItem): Promise<void> {
    this.hideItemMenu();
    this.isProcessing = true;

    // 아이템 사용
    const { inventory, result } = InventorySystem.useItem(this.inventory, item.id);
    this.inventory = inventory;

    if (!result.success || !result.effect) {
      await this.battleUI.showMessage('아이템을 사용할 수 없습니다!', 800);
      this.isProcessing = false;
      this.battleUI.showMenu();
      return;
    }

    // 효과 적용
    const effectResult = InventorySystem.applyEffect(
      result.effect,
      this.playerData.hp,
      this.playerData.maxHp,
      this.playerData.mp,
      this.playerData.maxMp
    );

    this.playerData.hp = effectResult.hp;
    this.playerData.mp = effectResult.mp;

    // UI 업데이트
    this.battleUI.updatePlayerHp(this.playerData.hp, this.playerData.maxHp);
    this.battleUI.updatePlayerMp(this.playerData.mp, this.playerData.maxMp);

    // 메시지 표시
    await this.battleUI.showMessage(`${item.name}을(를) 사용했다! ${effectResult.message}`, 1200);

    // 소비 아이템 목록 갱신
    this.consumableItems = InventorySystem.getConsumables(this.inventory);

    // 아이템이 없으면 메뉴 비활성화
    if (this.consumableItems.length === 0) {
      this.battleUI.setMenuEnabled('item', false);
    }

    // 몬스터 턴
    this.currentTurn = 'monster';
    await this.monsterAttack();
  }

  private async playerAttack(): Promise<void> {
    this.isProcessing = true;
    this.battleUI.hideMenu();

    // 데미지 계산
    const damage = BattleSystem.calculateDamage(
      this.playerData.attackMin,
      this.playerData.attackMax,
      this.monsterData.defense
    );
    this.monsterData.hp = Math.max(0, this.monsterData.hp - damage);

    // 공격 애니메이션 효과
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 30,
      duration: 100,
      yoyo: true,
    });

    // 몬스터 피격 효과
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.monsterSprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });
    });

    // 메시지 표시
    await this.battleUI.showMessage(`${this.monsterData.name}에게 ${damage}의 데미지!`, 1200);
    this.battleUI.updateMonsterHp(this.monsterData.hp, this.monsterData.hp + damage);

    // 몬스터 사망 체크
    if (this.monsterData.hp <= 0) {
      await this.handleVictory();
      return;
    }

    // 몬스터 턴
    this.currentTurn = 'monster';
    await this.monsterAttack();
  }

  private async monsterAttack(): Promise<void> {
    // 데미지 계산
    const damage = BattleSystem.calculateDamage(
      this.monsterData.attackMin,
      this.monsterData.attackMax,
      this.playerData.defense
    );
    this.playerData.hp = Math.max(0, this.playerData.hp - damage);

    // 몬스터 공격 애니메이션
    this.tweens.add({
      targets: this.monsterSprite,
      y: this.monsterSprite.y + 20,
      duration: 150,
      yoyo: true,
    });

    // 플레이어 피격 효과
    this.time.delayedCall(150, () => {
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });
    });

    // 메시지 표시
    await this.battleUI.showMessage(`${this.monsterData.name}의 공격! ${damage}의 데미지를 받았다!`, 1200);
    this.battleUI.updatePlayerHp(this.playerData.hp, this.playerData.maxHp);

    // 플레이어 사망 체크
    if (this.playerData.hp <= 0) {
      await this.handleDefeat();
      return;
    }

    // 플레이어 턴으로 복귀
    this.currentTurn = 'player';
    this.isProcessing = false;
    this.battleUI.hideMessage();
    this.battleUI.showMenu();
    this.battleUI.resetSelection();
  }

  private async tryEscape(): Promise<void> {
    this.isProcessing = true;
    this.battleUI.hideMenu();

    const escaped = BattleSystem.tryEscape();

    if (escaped) {
      await this.battleUI.showMessage('도망쳤다!', 1500);
      this.endBattle('escape');
    } else {
      await this.battleUI.showMessage('도망치지 못했다!', 1200);

      // 몬스터 턴
      this.currentTurn = 'monster';
      await this.monsterAttack();
    }
  }

  private async handleVictory(): Promise<void> {
    const rewards = BattleSystem.calculateRewards(this.monsterData);

    // 몬스터 사망 애니메이션
    this.tweens.add({
      targets: this.monsterSprite,
      alpha: 0,
      scale: 0,
      duration: 500,
    });

    await this.battleUI.showMessage(`${this.monsterData.name}을(를) 쓰러뜨렸다!`, 1500);
    await this.battleUI.showMessage(`${rewards.exp} 경험치, ${rewards.gold} 골드 획득!`, 1500);

    this.endBattle('win');
  }

  private async handleDefeat(): Promise<void> {
    // 플레이어 사망 애니메이션
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0,
      duration: 500,
    });

    await this.battleUI.showMessage('게임 오버...', 2000);

    this.endBattle('lose');
  }

  private endBattle(result: BattleResult): void {
    // 결과 데이터 전달
    const resultData = {
      result,
      playerHp: this.playerData.hp,
      playerMaxHp: this.playerData.maxHp,
      monsterTileX: this.monsterTileX,
      monsterTileY: this.monsterTileY,
      rewards: result === 'win' ? BattleSystem.calculateRewards(this.monsterData) : null,
      // 플레이어 위치 복원용
      playerTileX: this.playerTileX,
      playerTileY: this.playerTileY,
      // 전투 후 인벤토리 상태
      inventory: this.inventory,
    };

    if (result === 'lose') {
      // 패배 시 메뉴로
      this.scene.start('MenuScene');
    } else {
      // 승리/도망 시 게임으로 복귀
      this.scene.start('GameScene', resultData);
    }
  }
}
