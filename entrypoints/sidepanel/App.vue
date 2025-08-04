<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { debug } from '@/utils/debug';

// Direct imports for reliability
import Tango from '@/components/Tango.vue';
import Queens from '@/components/Queens.vue';
import Crossclimb from '@/components/Crossclimb.vue';
import Pinpoint from '@/components/Pinpoint.vue';
import Zip from '@/components/Zip.vue';

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

interface GameTab {
    id: string;
    label: string;
    component: any;
}

const GAME_TABS: readonly GameTab[] = [
    { id: 'tango', label: 'Tango Solution', component: Tango },
    { id: 'queens', label: 'Queens Solution', component: Queens },
    { id: 'crossclimb', label: 'Crossclimb Solution', component: Crossclimb },
    { id: 'pinpoint', label: 'Pinpoint Solution', component: Pinpoint },
    { id: 'zip', label: 'Zip Solution', component: Zip },
] as const;

const DEFAULT_GAME = GAME_TABS[0].id;

// ============================================================================
// REACTIVE STATE
// ============================================================================

const currentGameId = ref<string>(DEFAULT_GAME);

// Computed properties for better reactivity
const currentTab = computed(() =>
    GAME_TABS.find(tab => tab.id === currentGameId.value) || GAME_TABS[0]
);

const currentComponent = computed(() => {
    const componentMap: Record<string, any> = {
        tango: Tango,
        queens: Queens,
        crossclimb: Crossclimb,
        pinpoint: Pinpoint,
        zip: Zip
    };
    return componentMap[currentGameId.value] || Tango;
});

// ============================================================================
// GAME MANAGEMENT
// ============================================================================

class GameManager {
    private storageListener: ((changes: any, areaName: string) => void) | null = null;

    async initialize(): Promise<void> {
        try {
            // Load initial game from storage
            const result = await chrome.storage.local.get(['currentGame']);
            this.setGame(result.currentGame || DEFAULT_GAME);

            // Set up storage listener
            this.storageListener = (changes, areaName) => {
                if (areaName === 'local' && changes.currentGame) {
                    this.setGame(changes.currentGame.newValue);
                }
            };

            chrome.storage.onChanged.addListener(this.storageListener);
            debug.log('GameManager initialized successfully');
        } catch (error) {
            debug.error('Failed to initialize GameManager:', error);
            this.setGame(DEFAULT_GAME);
        }
    }

    cleanup(): void {
        if (this.storageListener) {
            chrome.storage.onChanged.removeListener(this.storageListener);
            this.storageListener = null;
        }
    }

    setGame(gameId: string): void {
        const isValidGame = GAME_TABS.some(tab => tab.id === gameId);

        if (isValidGame) {
            currentGameId.value = gameId;
            debug.log(`Game set to: ${gameId}`);
        } else {
            debug.warn(`Unknown game ID: ${gameId}. Using default.`);
            currentGameId.value = DEFAULT_GAME;
        }
    }

    async changeGame(gameId: string): Promise<void> {
        try {
            // Update local state immediately for responsive UI
            this.setGame(gameId);

            // Persist to storage
            await chrome.storage.local.set({ currentGame: gameId });
            debug.log(`Manually switched to ${gameId}`);
        } catch (error) {
            debug.error('Failed to change game:', error);
            // Revert to previous state on error
            const result = await chrome.storage.local.get(['currentGame']);
            this.setGame(result.currentGame || DEFAULT_GAME);
        }
    }
}

// ============================================================================
// LIFECYCLE & EVENT HANDLERS
// ============================================================================

const gameManager = new GameManager();

onMounted(() => {
    gameManager.initialize();
});

onUnmounted(() => {
    gameManager.cleanup();
});

const handleTabClick = (gameId: string) => {
    gameManager.changeGame(gameId);
};

</script>

<template>
    <div class="app">
        <header class="app-header">
            <h1 class="app-title">LinkedIn Puzzle Solver</h1>
        </header>

        <main class="app-main">
            <nav class="tab-navigation" role="tablist" aria-label="Puzzle game tabs">
                <button v-for="tab in GAME_TABS" :key="tab.id"
                    :class="['tab-button', { 'tab-button--active': currentGameId === tab.id }]"
                    :aria-selected="currentGameId === tab.id" :aria-controls="`panel-${tab.id}`" role="tab"
                    type="button" @click="handleTabClick(tab.id)">
                    {{ tab.label }}
                </button>
            </nav>

            <section :id="`panel-${currentTab.id}`" class="tab-content" role="tabpanel"
                :aria-labelledby="`tab-${currentTab.id}`">
                <component :is="currentComponent" />
            </section>
        </main>
    </div>
</template>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-width: 450px;
    background: #1a1a1a;
    color: #ffffff;
}

.app-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #333;
    background: #2a2a2a;
}

.app-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
}

.app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tab-navigation {
    display: flex;
    border-bottom: 1px solid #333;
    background: #2a2a2a;
    overflow-x: auto;
}

.tab-button {
    flex: 1;
    min-width: fit-content;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: #888;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    position: relative;
}

.tab-button:hover {
    background: #3a3a3a;
    color: #ffffff;
}

.tab-button:focus {
    outline: 2px solid #0066cc;
    outline-offset: -2px;
}

.tab-button--active {
    color: #0066cc;
    background: #333;
}

.tab-button--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #0066cc;
}

.tab-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    min-height: 500px;
}

@media (max-width: 600px) {
    .app {
        min-width: 100%;
    }

    .tab-button {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }

    .tab-content {
        padding: 1rem;
    }
}
</style>
