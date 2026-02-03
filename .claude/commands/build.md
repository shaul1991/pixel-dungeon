# /build 명령어

프로젝트를 빌드합니다.

## 사용법
```
/build
```

## 실행 내용

```bash
# TypeScript 컴파일 + Vite 빌드
npm run build
```

## 빌드 출력
- `dist/` 디렉토리에 빌드 결과 생성
- 프로덕션 배포용 파일

## 오류 발생 시
1. 타입 오류 확인: `npx tsc --noEmit`
2. 의존성 확인: `npm install`
3. 캐시 정리: `rm -rf node_modules/.vite`
