import Phaser from 'phaser';
import { UI_HEIGHT } from '../config';
import { BattleUI } from '../ui/BattleUI';
import { BattleSystem } from '../systems/BattleSystem';
import type { MonsterConfig } from '../entities/Monster';

export interface PlayerData {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
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
  }

  private handleMenuInput(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.isProcessing || this.currentTurn !== 'player') return;

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
        // MVP에서 비활성화
        break;
      case 'escape':
        this.tryEscape();
        break;
    }
  }

  private async playerAttack(): Promise<void> {
    this.isProcessing = true;
    this.battleUI.hideMenu();

    // 데미지 계산
    const damage = BattleSystem.calculateDamage(this.playerData.attack, this.monsterData.defense);
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
    const damage = BattleSystem.calculateDamage(this.monsterData.attack, this.playerData.defense);
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
