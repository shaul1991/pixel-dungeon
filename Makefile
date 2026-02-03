.PHONY: help install dev build preview clean type-check lint \
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

validate: type-check build
	@echo "All checks passed!"

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
