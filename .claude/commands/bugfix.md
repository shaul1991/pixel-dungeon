# /bugfix 명령어

게임 버그를 수정합니다.

## 사용법
```
/bugfix [버그 설명]
```

## 실행 단계

### 1. 수집 (Gather)
- 버그 재현 조건 확인
- 관련 코드 탐색
- 에러 메시지 분석

### 2. 분석 (Analyze)
- 원인 파악
- 영향 범위 확인
- 수정 방안 결정

### 3. 실행 (Execute)
- 문제 코드 수정
- 관련 코드 정리

### 4. 검증 (Validate)
```bash
# 타입 체크
npx tsc --noEmit

# 빌드
npm run build

# 게임 실행 테스트
npm run dev
```

### 5. Next Step 제안
- 회귀 방지 방안
- 관련 테스트 추가 권장
