<script lang="ts" setup>
import { ref, onMounted, onUpdated, onUnmounted, computed } from 'vue';
import arrowLine from 'arrow-line';
import { useStorage } from '@/composables/useStorage';
import type { CrossclimbSolution } from '@/types/solutions';
import { debug } from '@/utils/debug';

const defaultSolution: CrossclimbSolution = [];

const { data: crossclimbSolution, loading, error } = useStorage<CrossclimbSolution>('crossclimbSolution', defaultSolution);

const initialOrder = computed(() => {
    return crossclimbSolution.value.slice().sort((a, b) => a.initialIndex - b.initialIndex);
});

const sortedOrder = computed(() => {
    return crossclimbSolution.value.slice().sort((a, b) => a.solutionIndex - b.solutionIndex);
});

const arrows = ref<any[]>([]);

// 12 colors for the lines very pleasant to the eye
const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD',
    '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12',
    '#D35400', '#1ABC9C'
];

const createArrows = () => {
    // Clean up existing arrows
    arrows.value.forEach(arrow => arrow.remove());
    arrows.value = [];

    if (!crossclimbSolution.value.length) return;

    for (let i = 0; i < crossclimbSolution.value.length; i++) {
        const item = crossclimbSolution.value[i];

        debug.log(`Creating leader line from #init-${item.initialIndex} to #sorted-${item.solutionIndex}`);
        // Create a new leader line with consistent color based on index
        arrows.value.push(arrowLine('#init-' + item.initialIndex, '#sorted-' + item.solutionIndex, {
            color: colors[i % colors.length], // consistent color based on index
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
};

onUpdated(() => {
    if (!loading.value && !error.value && crossclimbSolution.value.length > 0) {
        // Use setTimeout to ensure DOM is fully updated
        setTimeout(createArrows, 0);
    }
});

// Handle window resize to redraw arrows
const handleResize = () => {
    if (!loading.value && !error.value && crossclimbSolution.value.length > 0) {
        createArrows();
    }
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    // Clean up all leader lines when the component is unmounted
    arrows.value.forEach(arrow => arrow.remove());
    arrows.value = [];
    // Remove resize listener
    window.removeEventListener('resize', handleResize);
});

</script>

<template>
    <div>
        <p>Crossclimb Solution:</p>

        <div v-if="loading" class="loading">
            Loading solution...
        </div>
        
        <div v-else-if="error" class="error">
            Error: {{ error }}
        </div>
        
        <div v-else-if="!crossclimbSolution.length" class="no-data">
            No solution data available.
        </div>

        <div v-else class="container">
            <!-- Initial order column -->
            <div>
                <h3>Initial Order</h3>
                <div v-for="(item, idx) in initialOrder" :key="'init-' + idx" class="word">
                    <span :id="'init-' + idx">{{ item.answer }}</span>
                </div>
            </div>
            <!-- Sorted order column -->
            <div>
                <h3>Sorted Order</h3>
                <div v-for="(item, idx) in sortedOrder" :key="'sorted-' + idx" class="word">
                    <span :id="'sorted-' + idx">{{ item.answer }}</span>
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
