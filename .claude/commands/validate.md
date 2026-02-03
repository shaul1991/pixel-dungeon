# /validate 명령어

코드 품질을 검증합니다.

## 사용법
```
/validate
```

## 검증 항목

### 1. 타입 체크
```bash
npx tsc --noEmit
```

### 2. 빌드 테스트
```bash
npm run build
```

### 3. (선택) 린트 검사
```bash
npx eslint src/   # ESLint 설정 시
```

## Quality Gate 기준

| 항목 | 통과 조건 |
|------|----------|
| 타입 체크 | 오류 0개 |
| 빌드 | 성공 |
| 린트 | 오류 0개 (경고 허용) |
