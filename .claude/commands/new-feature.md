# /new-feature 명령어

새로운 게임 기능을 개발합니다.

## 사용법
```
/new-feature [기능 설명]
```

## 실행 단계

### 1. 수집 (Gather)
- 요구사항 명확화
- 관련 코드 탐색 (Explore Agent)
- 기존 구현 분석

### 2. 분석 (Analyze)
- 영향 범위 파악
- 필요한 파일/클래스 식별
- 에이전트 선택

### 3. 우선순위 (Prioritize)
- 작업 분해
- TodoWrite로 작업 목록 생성
- 의존성 순서 결정

### 4. 실행 (Execute)
- 타입 정의 (types/)
- 엔티티 구현 (entities/)
- 시스템 구현 (systems/)
- 씬 통합 (scenes/)
- UI 연결 (ui/)

### 5. 검증 (Validate)
```bash
# 타입 체크
npx tsc --noEmit

# 빌드
npm run build

# 개발 서버로 테스트
npm run dev
```

### 6. Next Step 제안
- 추가 개선 사항
- 테스트 체크리스트
