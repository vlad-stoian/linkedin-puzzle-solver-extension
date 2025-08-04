<script lang="ts" setup>
import { ref, computed, type Ref } from 'vue';
import { useStorage } from '@/composables/useStorage';
import type { ZipSolution } from '@/types/solutions';

const defaultSolution: ZipSolution = {
  numbers: [],
  solution: [],
  walls: [],
  gridSize: 0
};

const { data: zipSolution, loading, error } = useStorage<ZipSolution>('zipSolution', defaultSolution);

const gridSize = computed(() => zipSolution.value.gridSize || 0);
const solution = computed(() => zipSolution.value.solution || []);
const walls = computed(() => zipSolution.value.walls || []);
const numbers = computed(() => zipSolution.value.numbers || []);

const solutionIndexMap = computed(() => {
  const map: Record<number, number> = {};
  solution.value.forEach((cell, index) => {
    map[cell] = index;
  });
  return map;
});

function getCellClasses(cellIdx: number): string[] {
    return walls.value
        .filter(w => w.cellIdx === cellIdx)
        .map(w => `wall-${w.direction.toLowerCase()}`);
}

function getNumber(cellIdx: number): string | number {
    const n = numbers.value.indexOf(cellIdx);
    return n !== -1 ? n + 1 : '';
}

</script>

<template>
    <div>
        <p>Zip Solution:</p>
        
        <div v-if="loading" class="loading">
            Loading solution...
        </div>
        
        <div v-else-if="error" class="error">
            Error: {{ error }}
        </div>
        
        <div v-else-if="!gridSize" class="no-data">
            No solution data available.
        </div>
        
        <div v-else class="solution-container">
            <svg v-if="solution.length > 1" 
                 :width="gridSize * 60" 
                 :height="gridSize * 60"
                 class="solution-svg">
                <template v-for="i in solution.length - 1" :key="`line-${i}`">
                    <line :x1="(solution[i - 1] % gridSize) * 60 + 30"
                          :y1="Math.floor(solution[i - 1] / gridSize) * 60 + 30" 
                          :x2="(solution[i] % gridSize) * 60 + 30"
                          :y2="Math.floor(solution[i] / gridSize) * 60 + 30" 
                          stroke="#0074d9" 
                          stroke-width="6"
                          stroke-linecap="round" />
                </template>
            </svg>
            <div class="container" :style="`grid-template-columns: repeat(${gridSize}, 60px);`">
                <div v-for="cellIdx in gridSize * gridSize" 
                     :key="`cell-${cellIdx}`" 
                     class="cell"
                     :class="getCellClasses(cellIdx - 1)">
                    <span v-if="solutionIndexMap[cellIdx - 1] !== undefined" 
                          class="dot" 
                          :class="{
                              start: solutionIndexMap[cellIdx - 1] === 0,
                              end: solutionIndexMap[cellIdx - 1] === solution.length - 1,
                              path: solutionIndexMap[cellIdx - 1] !== 0 && solutionIndexMap[cellIdx - 1] !== solution.length - 1
                          }">
                        {{ getNumber(cellIdx - 1) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading, .error, .no-data {
    padding: 20px;
    text-align: center;
    font-weight: 500;
}

.error {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

.no-data {
    color: #6c757d;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
}

.solution-container {
    position: relative;
    width: fit-content;
}

.solution-svg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
}

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
