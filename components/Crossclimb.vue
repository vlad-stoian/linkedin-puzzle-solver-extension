<script lang="ts" setup>

import arrowLine from 'arrow-line';

let crossclimbSolution = ref(Array.from({ length: 6 }, () => Array(6).fill(0)));

chrome.storage.local.get(["crossclimbSolution"]).then((result) => {
    console.log("Value is " + result);

    if (!result || !result.crossclimbSolution) {
        console.error("No crossclimbSolution found in storage.");
        return;
    }
    try {
        crossclimbSolution.value = JSON.parse(result.crossclimbSolution);
    } catch (e) {
        console.error("Error parsing crossclimbSolution:", e);
        return;
    }
    console.log("Parsed crossclimbSolution:", crossclimbSolution);
}).catch((error) => {
    console.error("Error retrieving crossclimbSolution from storage:", error);
});

function initial(crossclimbSolution: any[]) {
    return crossclimbSolution.slice().sort((a, b) => a.initialIndex - b.initialIndex);
}

function sorted(crossclimbSolution: any[]) {
    return crossclimbSolution.slice().sort((a, b) => a.solutionIndex - b.solutionIndex);
}

let arrows = []

onUpdated(() => {
    for (let i = 0; i < crossclimbSolution.value.length; i++) {
        const item = crossclimbSolution.value[i];

        // 12 colors for the lines very pleasant to the eye
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD',
            '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12',
            '#D35400', '#1ABC9C'
        ];

        console.log(`Creating leader line from #init-${item.initialIndex} to #sorted-${item.solutionIndex}`);
        // Create a new leader line
        arrows.push(arrowLine('#init-' + item.initialIndex, '#sorted-' + item.solutionIndex, {
            color: colors[Math.floor(Math.random() * colors.length)], // random color
            thickness: 2,
            curvature: 0.5,
            style: 'dash',
            forceDirection: 'horizontal',
            endpoint: {
                type: 'arrowHead',
                size: 1
            }
        }));

    }
});

onUnmounted(() => {
    // Clean up all leader lines when the component is unmounted
    arrows.forEach(arrow => arrow.remove());
    arrows.length = 0;
});

</script>

<template>
    <div>
        <p>Crossclimb Solution:</p>

        <div class="container">
            <!-- Initial order column -->
            <div>
                <h3>Initial Order</h3>
                <div v-for="(item, idx) in initial(crossclimbSolution)" :key="'init-' + idx" class="word">
                    <span :id="'init-' + idx">{{ item.answer }}</span>
                </div>
            </div>
            <!-- Sorted order column -->
            <div>
                <h3>Sorted Order</h3>
                <div v-for="(item, idx) in sorted(crossclimbSolution)" :key="'sorted-' + idx" class="word">
                    <span :id="'sorted-' + idx">{{ item.answer }}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.container {
    display: flex;
    gap: 48px;
    justify-content: space-around;
}

.word {
    display: flex;
    height: 48px;
    align-items: center;

    color: white;
    font-family: monospace;
    font-size: xx-large;
    font-weight: 600;
    letter-spacing: 6px;
}
</style>
