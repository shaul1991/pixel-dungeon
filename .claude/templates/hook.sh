#!/bin/bash
# {{NAME}} Hook
# {{DESCRIPTION}}
#
# 트리거: [PostToolUse/PreToolUse]
# 매처: [Edit|Write|Bash|etc]
#
# 환경 변수:
#   CLAUDE_FILE_PATH - 편집된 파일 경로 (Edit/Write 훅)
#   CLAUDE_BASH_COMMAND - 실행된 명령어 (Bash 훅)
#
# 종료 코드:
#   0 - 성공 (계속 진행)
#   1 - 실패 (작업 중단)

# 환경 변수 가져오기
FILE_PATH="${CLAUDE_FILE_PATH:-}"
BASH_COMMAND="${CLAUDE_BASH_COMMAND:-}"

# [조건에 따른 처리 로직]
# 예: 특정 파일 타입만 처리
# if [[ "$FILE_PATH" == *.ts ]]; then
#     # TypeScript 파일 처리
# fi

# [메인 로직]
# 예: 린트 실행, 테스트 실행, 알림 등

# 성공적으로 완료
exit 0
