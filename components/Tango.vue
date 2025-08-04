<script lang="ts" setup>
import { computed } from 'vue';
import Moon from '~/components/icons/Moon.vue';
import Sun from '~/components/icons/Sun.vue';
import { useStorage } from '@/composables/useStorage';
import type { TangoSolution } from '@/types/solutions';

const defaultSolution: TangoSolution = {
  grid: []
};

const { data: tangoSolution, loading, error } = useStorage<TangoSolution>('tangoSolution', defaultSolution);

const grid = computed(() => tangoSolution.value.grid || []);

</script>

<template>
    <div>
        <p>Tango Solution:</p>

        <div v-if="loading" class="loading">
            Loading solution...
        </div>
        
        <div v-else-if="error" class="error">
            Error: {{ error }}
        </div>
        
        <div v-else-if="!grid.length" class="no-data">
            No solution data available.
        </div>
        
        <table v-else class="solution-table">
            <tr v-for="(row, rowIndex) in grid" :key="`row-${rowIndex}`">
                <td v-for="(cell, cellIndex) in row" :key="`cell-${rowIndex}-${cellIndex}`">
                    <Sun v-if="cell === 'ZERO'" class="cell" />
                    <Moon v-else class="cell" />
                </td>
            </tr>
        </table>
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

.solution-table {
    margin: 0 auto;
}

.cell {
    color: white;
    height: 48px;
    width: 48px;
    transform: scaleX(-1);
    transform-origin: center;
}
</style>
