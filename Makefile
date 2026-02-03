.PHONY: help install dev build preview clean type-check lint test test-watch test-coverage \
        qa qa-auto qa-manual validate \
        generate-assets generate-player generate-monster generate-npc generate-tileset

# Default target
help:
	@echo "Pixel Dungeon - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install        Install dependencies"
	@echo "  make dev            Start development server"
	@echo "  make build          Build for production"
	@echo "  make preview        Preview production build"
	@echo "  make clean          Clean build artifacts"
	@echo ""
	@echo "Quality:"
	@echo "  make type-check     Run TypeScript type checking"
	@echo "  make lint           Run ESLint (if configured)"
	@echo "  make validate       Run all quality checks"
	@echo ""
	@echo "Testing:"
	@echo "  make test           Run unit tests"
	@echo "  make test-watch     Run tests in watch mode"
	@echo "  make test-coverage  Run tests with coverage report"
	@echo ""
	@echo "QA:"
	@echo "  make qa             Run full QA cycle (auto + instructions)"
	@echo "  make qa-auto        Run automated tests only"
	@echo "  make qa-manual      Show manual test checklist location"
	@echo ""
	@echo "Assets:"
	@echo "  make generate-assets    Generate all sprites"
	@echo "  make generate-player    Generate player sprite"
	@echo "  make generate-monster   Generate monster sprites"
	@echo "  make generate-npc       Generate NPC sprites"
	@echo "  make generate-tileset   Generate tileset"

# Development
install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

clean:
	rm -rf dist node_modules/.vite

# Quality
type-check:
	npx tsc --noEmit

lint:
	@if [ -f .eslintrc.js ] || [ -f .eslintrc.json ] || [ -f eslint.config.js ]; then \
		npx eslint src/; \
	else \
		echo "ESLint not configured. Skipping."; \
	fi

validate: type-check test build
	@echo "All checks passed!"

# Testing
test:
	npm run test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

# QA
qa: qa-auto
	@echo ""
	@echo "==================================="
	@echo "Automated tests complete!"
	@echo "==================================="
	@echo ""
	@echo "Next: Run manual smoke test"
	@echo "Checklist: .claude/qa/scenarios/smoke.md"
	@echo ""
	@echo "To start game: make dev"

qa-auto: test type-check build
	@echo "All automated checks passed!"

qa-manual:
	@echo "Manual Test Checklists:"
	@echo ""
	@echo "Quick Tests:"
	@echo "  .claude/qa/scenarios/smoke.md        (5 min)"
	@echo ""
	@echo "Feature Tests:"
	@echo "  .claude/qa/scenarios/battle.md       (10 min)"
	@echo "  .claude/qa/scenarios/exploration.md  (10 min)"
	@echo "  .claude/qa/scenarios/ui.md           (10 min)"
	@echo ""
	@echo "Full Tests:"
	@echo "  .claude/qa/scenarios/regression.md   (15 min)"
	@echo "  .claude/qa/scenarios/full.md         (30 min)"

# Asset Generation
generate-assets: generate-player generate-monster generate-npc generate-tileset
	@echo "All assets generated!"

generate-player:
	node scripts/generate-player.js

generate-monster:
	node scripts/generate-monster.js

generate-npc:
	node scripts/generate-npc.js

generate-tileset:
	node scripts/generate-tileset.js
