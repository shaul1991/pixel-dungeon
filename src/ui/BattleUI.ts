import Phaser from 'phaser';
import { UI_HEIGHT } from '../config';
import { HealthBar } from './HealthBar';
import {
  PixelColors,
  PixelColorStrings,
  createPixelTextStyle,
} from './PixelTheme';

export type BattleAction = 'attack' | 'skill' | 'item' | 'escape';

export class BattleUI extends Phaser.GameObjects.Container {
  private monsterNameText!: Phaser.GameObjects.Text;
  private monsterLevelText!: Phaser.GameObjects.Text;
  private monsterHpBar!: HealthBar;
  private monsterInfoBox!: Phaser.GameObjects.Graphics;

  private playerNameText!: Phaser.GameObjects.Text;
  private playerLevelText!: Phaser.GameObjects.Text;
  private playerHpBar!: HealthBar;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerMpBar!: HealthBar;
  private playerMpText!: Phaser.GameObjects.Text;
  private playerInfoBox!: Phaser.GameObjects.Graphics;

  private menuButtons: Phaser.GameObjects.Container[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private messageBox!: Phaser.GameObjects.Graphics;
  private selectedIndex: number = 0;

  private readonly SCREEN_HEIGHT = 320 + UI_HEIGHT; // 352
  private readonly HALF_HEIGHT = (320 + UI_HEIGHT) / 2; // 176

  // 메뉴 아이템 정의 (도트 스타일 색상)
  private readonly menuItems: { label: string; action: BattleAction; enabled: boolean; color: number }[] = [
    { label: '공격', action: 'attack', enabled: true, color: PixelColors.btnAttack },
    { label: '스킬', action: 'skill', enabled: false, color: PixelColors.btnSkill },
    { label: '아이템', action: 'item', enabled: false, color: PixelColors.btnItem },
    { label: '도망', action: 'escape', enabled: true, color: PixelColors.btnEscape },
  ];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createMonsterUI();
    this.createPlayerUI();
    this.createMessageBox();
    this.createMenu();

    scene.add.existing(this);
    this.setDepth(100);

    // 초기 메뉴 선택 표시
    this.updateMenuSelection();
  }

  /**
   * 몬스터 정보 박스 생성 (왼쪽 상단) - 도트 스타일
   */
  private createMonsterUI(): void {
    const boxX = 10;
    const boxY = 15;
    const boxWidth = 180;
    const boxHeight = 50;

    // 정보 박스 배경 (도트 스타일 - 직각 모서리)
    this.monsterInfoBox = this.scene.add.graphics();

    // 메인 배경
    this.monsterInfoBox.fillStyle(PixelColors.bgLight, 1);
    this.monsterInfoBox.fillRect(boxX, boxY, boxWidth, boxHeight);

    // 3D 효과 - 상단/왼쪽 밝게
    this.monsterInfoBox.fillStyle(0xffffff, 0.3);
    this.monsterInfoBox.fillRect(boxX, boxY, boxWidth, 2);
    this.monsterInfoBox.fillRect(boxX, boxY, 2, boxHeight);

    // 3D 효과 - 하단/오른쪽 어둡게
    this.monsterInfoBox.fillStyle(0x000000, 0.3);
    this.monsterInfoBox.fillRect(boxX, boxY + boxHeight - 2, boxWidth, 2);
    this.monsterInfoBox.fillRect(boxX + boxWidth - 2, boxY, 2, boxHeight);

    // 외부 테두리
    this.monsterInfoBox.lineStyle(2, PixelColors.frameMedium, 1);
    this.monsterInfoBox.strokeRect(boxX, boxY, boxWidth, boxHeight);
    this.add(this.monsterInfoBox);

    // 몬스터 이름 (도트 스타일)
    this.monsterNameText = this.scene.add.text(boxX + 10, boxY + 8, '', {
      ...createPixelTextStyle('medium', PixelColorStrings.textWhite),
      fontStyle: 'bold',
    });
    this.add(this.monsterNameText);

    // 몬스터 레벨
    this.monsterLevelText = this.scene.add.text(boxX + boxWidth - 50, boxY + 8, 'Lv.1', {
      ...createPixelTextStyle('small', PixelColorStrings.textGray),
    });
    this.add(this.monsterLevelText);

    // HP 라벨
    const hpLabel = this.scene.add.text(boxX + 10, boxY + 30, 'HP', {
      ...createPixelTextStyle('small', PixelColorStrings.hpGreen),
      fontStyle: 'bold',
    });
    this.add(hpLabel);

    // 몬스터 HP 바 (도트 스타일)
    this.monsterHpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 28,
      width: 130,
      height: 10,
      fillColor: PixelColors.hpGreen,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: true,
    });
    this.add(this.monsterHpBar);
  }

  /**
   * 플레이어 정보 박스 생성 (오른쪽 중앙) - 도트 스타일
   */
  private createPlayerUI(): void {
    const boxX = 260;
    const boxY = this.HALF_HEIGHT + 20;
    const boxWidth = 200;
    const boxHeight = 65;

    // 정보 박스 배경 (도트 스타일 - 직각 모서리)
    this.playerInfoBox = this.scene.add.graphics();

    // 메인 배경
    this.playerInfoBox.fillStyle(PixelColors.bgLight, 1);
    this.playerInfoBox.fillRect(boxX, boxY, boxWidth, boxHeight);

    // 3D 효과 - 상단/왼쪽 밝게
    this.playerInfoBox.fillStyle(0xffffff, 0.3);
    this.playerInfoBox.fillRect(boxX, boxY, boxWidth, 2);
    this.playerInfoBox.fillRect(boxX, boxY, 2, boxHeight);

    // 3D 효과 - 하단/오른쪽 어둡게
    this.playerInfoBox.fillStyle(0x000000, 0.3);
    this.playerInfoBox.fillRect(boxX, boxY + boxHeight - 2, boxWidth, 2);
    this.playerInfoBox.fillRect(boxX + boxWidth - 2, boxY, 2, boxHeight);

    // 외부 테두리
    this.playerInfoBox.lineStyle(2, PixelColors.frameMedium, 1);
    this.playerInfoBox.strokeRect(boxX, boxY, boxWidth, boxHeight);
    this.add(this.playerInfoBox);

    // 플레이어 이름 (도트 스타일)
    this.playerNameText = this.scene.add.text(boxX + 10, boxY + 6, 'Player', {
      ...createPixelTextStyle('medium', PixelColorStrings.textWhite),
      fontStyle: 'bold',
    });
    this.add(this.playerNameText);

    // 플레이어 레벨
    this.playerLevelText = this.scene.add.text(boxX + boxWidth - 50, boxY + 6, 'Lv.1', {
      ...createPixelTextStyle('small', PixelColorStrings.textGray),
    });
    this.add(this.playerLevelText);

    // HP 라벨
    const hpLabel = this.scene.add.text(boxX + 10, boxY + 26, 'HP', {
      ...createPixelTextStyle('small', PixelColorStrings.hpGreen),
      fontStyle: 'bold',
    });
    this.add(hpLabel);

    // 플레이어 HP 바 (도트 스타일)
    this.playerHpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 24,
      width: 100,
      height: 10,
      fillColor: PixelColors.hpGreen,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: true,
    });
    this.add(this.playerHpBar);

    // HP 수치 텍스트 (바 오른쪽에 표시)
    this.playerHpText = this.scene.add.text(boxX + 140, boxY + 24, '100/100', {
      ...createPixelTextStyle('small', PixelColorStrings.hpGreen),
    });
    this.add(this.playerHpText);

    // MP 라벨
    const mpLabel = this.scene.add.text(boxX + 10, boxY + 44, 'MP', {
      ...createPixelTextStyle('small', PixelColorStrings.mpBlue),
      fontStyle: 'bold',
    });
    this.add(mpLabel);

    // 플레이어 MP 바 (도트 스타일)
    this.playerMpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 42,
      width: 100,
      height: 8,
      fillColor: PixelColors.mpBlue,
      bgColor: PixelColors.bgDark,
      borderColor: PixelColors.frameDark,
      showText: false,
      segmented: true,
    });
    this.add(this.playerMpBar);

    // MP 수치 텍스트 (바 오른쪽에 표시)
    this.playerMpText = this.scene.add.text(boxX + 140, boxY + 40, '30/30', {
      ...createPixelTextStyle('small', PixelColorStrings.mpBlue),
    });
    this.add(this.playerMpText);
  }

  /**
   * 메시지 박스 생성 (왼쪽 하단) - 도트 스타일
   */
  private createMessageBox(): void {
    const boxX = 10;
    const boxY = this.SCREEN_HEIGHT - 85;
    const boxWidth = 230;
    const boxHeight = 75;

    // 메시지 배경 (도트 스타일 - 직각 모서리)
    this.messageBox = this.scene.add.graphics();

    // 메인 배경
    this.messageBox.fillStyle(PixelColors.bgMedium, 0.95);
    this.messageBox.fillRect(boxX, boxY, boxWidth, boxHeight);

    // 3D 효과 - 내부 밝은 테두리
    this.messageBox.fillStyle(PixelColors.frameLight, 0.4);
    this.messageBox.fillRect(boxX + 3, boxY + 3, boxWidth - 6, 2);
    this.messageBox.fillRect(boxX + 3, boxY + 3, 2, boxHeight - 6);

    // 3D 효과 - 내부 어두운 테두리
    this.messageBox.fillStyle(PixelColors.bgDark, 0.6);
    this.messageBox.fillRect(boxX + 3, boxY + boxHeight - 5, boxWidth - 6, 2);
    this.messageBox.fillRect(boxX + boxWidth - 5, boxY + 3, 2, boxHeight - 6);

    // 외부 테두리
    this.messageBox.lineStyle(2, PixelColors.frameMedium, 1);
    this.messageBox.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // 골드 장식 테두리
    this.messageBox.lineStyle(1, PixelColors.accentGold, 0.5);
    this.messageBox.strokeRect(boxX + 5, boxY + 5, boxWidth - 10, boxHeight - 10);
    this.add(this.messageBox);

    // 메시지 텍스트 (도트 스타일)
    this.messageText = this.scene.add.text(boxX + 15, boxY + 15, '', {
      ...createPixelTextStyle('medium', PixelColorStrings.textWhite),
      wordWrap: { width: boxWidth - 30 },
      lineSpacing: 6,
    });
    this.add(this.messageText);

    // 초기에는 숨김
    this.hideMessage();
  }

  /**
   * 메뉴 버튼 생성 (오른쪽 하단) - 도트 스타일 2x2
   */
  private createMenu(): void {
    const startX = 250;
    const startY = this.SCREEN_HEIGHT - 85;
    const buttonWidth = 105;
    const buttonHeight = 32;
    const gapX = 8;
    const gapY = 8;

    this.menuItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (buttonWidth + gapX);
      const y = startY + row * (buttonHeight + gapY);

      // 버튼 컨테이너
      const buttonContainer = this.scene.add.container(x, y);

      // 버튼 배경 (도트 스타일 - 직각 모서리)
      const bg = this.scene.add.graphics();
      const bgColor = item.enabled ? item.color : PixelColors.btnDisabled;

      // 메인 배경
      bg.fillStyle(bgColor, 1);
      bg.fillRect(0, 0, buttonWidth, buttonHeight);

      // 3D 효과 - 상단/왼쪽 밝게
      bg.fillStyle(0xffffff, 0.3);
      bg.fillRect(0, 0, buttonWidth, 2);
      bg.fillRect(0, 0, 2, buttonHeight);

      // 3D 효과 - 하단/오른쪽 어둡게
      bg.fillStyle(0x000000, 0.3);
      bg.fillRect(0, buttonHeight - 2, buttonWidth, 2);
      bg.fillRect(buttonWidth - 2, 0, 2, buttonHeight);

      // 테두리
      bg.lineStyle(1, PixelColors.frameDark, 1);
      bg.strokeRect(0, 0, buttonWidth, buttonHeight);
      buttonContainer.add(bg);

      // 버튼 텍스트 (도트 스타일)
      const textColor = item.enabled ? PixelColorStrings.textWhite : PixelColorStrings.textDark;
      const text = this.scene.add.text(buttonWidth / 2, buttonHeight / 2, item.label, {
        ...createPixelTextStyle('medium', textColor),
        fontStyle: 'bold',
      });
      text.setOrigin(0.5, 0.5);
      buttonContainer.add(text);

      // 선택 표시자 (도트 스타일 - 직각 테두리)
      const selector = this.scene.add.graphics();
      selector.lineStyle(2, PixelColors.accentGold, 1);
      selector.strokeRect(-2, -2, buttonWidth + 4, buttonHeight + 4);
      // 모서리 장식
      selector.fillStyle(PixelColors.accentGold, 1);
      selector.fillRect(-4, -4, 4, 4);
      selector.fillRect(buttonWidth, -4, 4, 4);
      selector.fillRect(-4, buttonHeight, 4, 4);
      selector.fillRect(buttonWidth, buttonHeight, 4, 4);
      selector.setVisible(false);
      buttonContainer.add(selector);

      // 데이터 저장
      buttonContainer.setData('bg', bg);
      buttonContainer.setData('selector', selector);
      buttonContainer.setData('enabled', item.enabled);
      buttonContainer.setData('color', item.color);

      this.menuButtons.push(buttonContainer);
      this.add(buttonContainer);
    });
  }

  /**
   * 몬스터 HP 업데이트
   */
  public updateMonsterHp(current: number, max: number): void {
    this.monsterHpBar.setValue(current, max);
    this.monsterHpBar.autoColor();
  }

  /**
   * 몬스터 이름 설정
   */
  public setMonsterName(name: string): void {
    this.monsterNameText.setText(name);
  }

  /**
   * 몬스터 레벨 설정
   */
  public setMonsterLevel(level: number): void {
    this.monsterLevelText.setText(`Lv.${level}`);
  }

  /**
   * 플레이어 HP 업데이트
   */
  public updatePlayerHp(current: number, max: number): void {
    this.playerHpBar.setValue(current, max);
    this.playerHpBar.autoColor();
    this.playerHpText.setText(`${current}/${max}`);
  }

  /**
   * 플레이어 MP 업데이트
   */
  public updatePlayerMp(current: number, max: number): void {
    this.playerMpBar.setValue(current, max);
    this.playerMpText.setText(`${current}/${max}`);
  }

  /**
   * 플레이어 레벨 설정
   */
  public setPlayerLevel(level: number): void {
    this.playerLevelText.setText(`Lv.${level}`);
  }

  /**
   * 메시지 표시 (Promise 반환)
   */
  public showMessage(text: string, duration: number = 1500): Promise<void> {
    return new Promise((resolve) => {
      this.messageText.setText(text);
      this.messageBox.setVisible(true);
      this.messageText.setVisible(true);

      this.scene.time.delayedCall(duration, () => {
        resolve();
      });
    });
  }

  /**
   * 메시지 숨기기
   */
  public hideMessage(): void {
    this.messageBox.setVisible(false);
    this.messageText.setVisible(false);
  }

  /**
   * 메뉴 표시
   */
  public showMenu(): void {
    this.menuButtons.forEach((btn) => btn.setVisible(true));
    this.updateMenuSelection();
  }

  /**
   * 메뉴 숨기기
   */
  public hideMenu(): void {
    this.menuButtons.forEach((btn) => btn.setVisible(false));
  }

  /**
   * 메뉴 위로 이동
   */
  public navigateUp(): void {
    if (this.selectedIndex >= 2) {
      this.selectedIndex -= 2;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 아래로 이동
   */
  public navigateDown(): void {
    if (this.selectedIndex < 2) {
      this.selectedIndex += 2;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 왼쪽으로 이동
   */
  public navigateLeft(): void {
    if (this.selectedIndex % 2 === 1) {
      this.selectedIndex -= 1;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 오른쪽으로 이동
   */
  public navigateRight(): void {
    if (this.selectedIndex % 2 === 0) {
      this.selectedIndex += 1;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 선택 표시 업데이트
   */
  private updateMenuSelection(): void {
    this.menuButtons.forEach((btn, index) => {
      const selector = btn.getData('selector') as Phaser.GameObjects.Graphics;
      const isSelected = index === this.selectedIndex;
      selector.setVisible(isSelected);
    });
  }

  /**
   * 현재 선택된 액션 반환
   */
  public getSelectedAction(): BattleAction {
    return this.menuItems[this.selectedIndex].action;
  }

  /**
   * 현재 선택된 메뉴가 활성화되어 있는지 확인
   */
  public isSelectedEnabled(): boolean {
    return this.menuItems[this.selectedIndex].enabled;
  }

  /**
   * 메뉴 선택 초기화
   */
  public resetSelection(): void {
    this.selectedIndex = 0;
    this.updateMenuSelection();
  }
}
