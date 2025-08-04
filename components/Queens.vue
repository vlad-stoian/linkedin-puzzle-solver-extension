<script lang="ts" setup>
import Star from '~/components/icons/Star.vue';
import { useStorage } from '@/composables/useStorage';
import type { QueensSolution } from '@/types/solutions';

const defaultSolution: QueensSolution = {
    queenPositions: [],
    gridSize: 0,
    gridColors: []
};

const { data: queensSolution, loading, error } = useStorage<QueensSolution>('queensSolution', defaultSolution);

const getCellColorClass = (row: number, col: number): string => {
    const index = row * queensSolution.value.gridSize + col;
    const color = queensSolution.value.gridColors[index]?.color;
    return color !== undefined ? `color-${color}` : '';
};

const hasQueen = (row: number, col: number): boolean => {
    return queensSolution.value.queenPositions.some(pos => pos.row === row && pos.col === col);
};

</script>

<template>
    <div>
        <p>Queens Solution:</p>

        <div v-if="loading" class="loading">
            Loading solution...
        </div>

        <div v-else-if="error" class="error">
            Error: {{ error }}
        </div>

        <div v-else-if="!queensSolution.gridSize" class="no-data">
            No solution data available.
        </div>

        <table v-else class="solution-table">
            <tr v-for="(_, row) in queensSolution.gridSize" :key="`row-${row}`">
                <td v-for="(_, col) in queensSolution.gridSize" :class="['cell', getCellColorClass(row, col)]"
                    :key="`cell-${row}-${col}`">
                    <Star v-if="hasQueen(row, col)" class="star" />
                </td>
            </tr>
        </table>
    </div>

</template>

<style scoped>
.loading,
.error,
.no-data {
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

.solution-table {
    margin: 0 auto;
}

.cell {
    color: white;
    height: 48px;
    width: 48px;
}

.star {
    width: 32px;
    height: 32px;
}

.color-0 {
    background-color: #bba3e2;
}

.color-1 {
    background-color: #ffc992;
}

.color-2 {
    background-color: #96beff;
}

.color-3 {
    background-color: #b3dfa0;
}

.color-4 {
    background-color: #dfdfdf;
}

.color-5 {
    background-color: #ff7b60;
}

.color-6 {
    background-color: #e6f388;
}

.color-7 {
    background-color: #b9b29e;
}

.color-8 {
    background-color: #dfa0bf;
}

.color-9 {
    background-color: #a3d2d8;
}

.color-10 {
    background-color: #62efea;
}

.color-11 {
    background-color: #ff93f3;
}

.color-12 {
    background-color: #8acc6d;
}

.color-13 {
    background-color: #729aec;
}

.color-14 {
    background-color: #c387e0;
}

.color-15 {
    background-color: #ffe04b;
}
</style>
