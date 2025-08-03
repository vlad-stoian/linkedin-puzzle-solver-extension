<script lang="ts" setup>

let zipSolution = ref({});
let gridSize = ref(0);
let solution: Ref<Array<number>> = ref([]);
let solutionIndexMap: Ref<Record<number, number>> = ref({});
let walls: Ref<Array<{ cellIdx: number, direction: string }>> = ref([]);
let numbers: Ref<Array<number>> = ref([]);

chrome.storage.local.get(["zipSolution"]).then((result) => {
    console.log("Value is " + result);

    if (!result || !result.zipSolution) {
        console.error("No zipSolution found in storage.");
        return;
    }
    try {
        zipSolution.value = JSON.parse(result.zipSolution);

        gridSize.value = zipSolution.value.gridSize || 0;
        solution.value = zipSolution.value.solution || [];
        walls.value = zipSolution.value.walls || [];
        numbers.value = zipSolution.value.numbers || [];

        solutionIndexMap.value = {}
        solution.value.forEach((cell, index) => {
            solutionIndexMap.value[cell] = index;
        });
    } catch (e) {
        console.error("Error parsing zipSolution:", e);
        return;
    }
    console.log("Parsed zipSolution:", zipSolution);
}).catch((error) => {
    console.error("Error retrieving zipSolution from storage:", error);
});

function getCellClasses(cellIdx) {
    const wallClasses = walls.value
        .filter(w => w.cellIdx === cellIdx)
        .map(w => `wall-${w.direction.toLowerCase()}`);
    return wallClasses;
}

function getNumber(cellIdx) {
    let n = numbers.value.indexOf(cellIdx)
    return n !== -1 ? n + 1 : '';
}

</script>

<template>
    <div>
        <p>Zip Solution:</p>
        <div style="position: relative; width: fit-content;">
            <svg v-if="gridSize && solution.length > 1" :width="gridSize * 60" :height="gridSize * 60"
                style="position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;">
                <template v-for="i in solution.length - 1">
                    <line :x1="(solution[i - 1] % gridSize) * 60 + 30"
                        :y1="Math.floor(solution[i - 1] / gridSize) * 60 + 30" :x2="(solution[i] % gridSize) * 60 + 30"
                        :y2="Math.floor(solution[i] / gridSize) * 60 + 30" stroke="#0074d9" stroke-width="6"
                        stroke-linecap="round" />
                </template>
            </svg>
            <div v-if="gridSize" class="container" :style="`grid-template-columns: repeat(${gridSize}, 60px);`">
                <div v-for="cellIdx in gridSize * gridSize" :key="cellIdx" class="cell"
                    :class="getCellClasses(cellIdx - 1)">
                    <span v-if="solutionIndexMap[cellIdx - 1] !== undefined" class="dot" :class="{
                        start: solutionIndexMap[cellIdx - 1] === 0,
                        end: solutionIndexMap[cellIdx - 1] === solution.length - 1,
                        path: solutionIndexMap[cellIdx - 1] !== 0 && solutionIndexMap[cellIdx - 1] !== solution.length - 1
                    }">
                        {{ getNumber(cellIdx - 1) }}
                    </span>
                </div>
            </div>
        </div>
        <!-- <div v-if="gridSize" class="container" :style="`grid-template-columns: repeat(${gridSize}, 60px);`">
            <div v-for="cellIdx in gridSize * gridSize" :key="cellIdx" class="cell"
                :class="getCellClasses(cellIdx - 1)">
                <span v-if="solutionIndexMap[cellIdx - 1] !== undefined" class="dot" :class="{
                    start: solutionIndexMap[cellIdx - 1] === 0,
                    end: solutionIndexMap[cellIdx - 1] === solution.length - 1,
                    path: solutionIndexMap[cellIdx - 1] !== 0 && solutionIndexMap[cellIdx - 1] !== solution.length - 1
                }">
                    {{ getNumber(cellIdx - 1) }}
                </span>
            </div>
        </div> -->

    </div>

</template>

<style scoped>
/* .cell {
    color: white;
    height: 48px;
    width: 48px;

    transform: scaleX(-1);
    transform-origin: center;
} */


.container {
    display: grid;
    margin: 20px auto;
    border: 2px solid #888;
    width: fit-content;
    grid-template-columns: repeat(auto-fit, 60px);
    background-color: aliceblue;
}

.cell {
    width: 60px;
    height: 60px;
    border: 1px solid #ccc;
    position: relative;
    box-sizing: border-box;
}

.wall-up {
    border-top: 4px solid #333;
}

.wall-down {
    border-bottom: 4px solid #333;
}

.wall-left {
    border-left: 4px solid #333;
}

.wall-right {
    border-right: 4px solid #333;
}

.dot {
    position: absolute;
    width: 38px;
    height: 38px;
    border-radius: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
}

.start {
    background-color: #0f0;
}

.end {
    background-color: #f00;
}

.path {
    background-color: #64b4ff;
}
</style>
