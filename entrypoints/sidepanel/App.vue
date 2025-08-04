<script lang="ts" setup>

import Tango from '@/components/Tango.vue';
import Queens from '@/components/Queens.vue';
import Crossclimb from '@/components/Crossclimb.vue';
import Pinpoint from '@/components/Pinpoint.vue';
import Zip from '@/components/Zip.vue';
import { debug } from '@/utils/debug';

const tabs = ['Tango Solution', 'Queens Solution', 'Crossclimb Solution', 'Pinpoint Solution', 'Zip Solution'];
const currentTab = ref(tabs[0])

// Initialize currentTab based on stored value
chrome.storage.local.get(['currentGame']).then((result) => {
    updateTab(result.currentGame);
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.currentGame) {
        updateTab(changes.currentGame.newValue);
    }
});

function updateTab(currentGame: string | undefined) {
    if (currentGame) {
        switch (currentGame) {
            case 'tango':
                currentTab.value = tabs[0];
                break;
            case 'queens':
                currentTab.value = tabs[1];
                break;
            case 'crossclimb':
                currentTab.value = tabs[2];
                break;
            case 'pinpoint':
                currentTab.value = tabs[3];
                break;
            case 'zip':
                currentTab.value = tabs[4];
                break;
            default:
                debug.warn(`Unknown game: ${currentGame}. Defaulting to Tango.`);
                currentTab.value = tabs[0]; // Default to Tango if unknown
                break;
        }
    } else {
        currentTab.value = tabs[0]; // Default to Tango if no game is set
    }
}

</script>

<template>
    <h1>Linkedin Puzzle Solver</h1>
    <div class="tabs">
        <!-- Tab buttons -->
        <div class="tab-buttons">
            <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }" @click="currentTab = tab">
                {{ tab }}
            </button>
        </div>

        <!-- Tab content -->
        <div class="tab-content">
            <div v-if="currentTab === tabs[0]">
                <Tango></Tango>
            </div>
            <div v-else-if="currentTab === tabs[1]">
                <Queens></Queens>
            </div>
            <div v-else-if="currentTab === tabs[2]">
                <Crossclimb></Crossclimb>
            </div>
            <div v-else-if="currentTab === tabs[3]">
                <Pinpoint></Pinpoint>
            </div>
            <div v-else>
                <Zip></Zip>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tab-content {
    padding: 20px;
    min-height: 550px;
    min-width: 450px;
}
</style>
