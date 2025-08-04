<script lang="ts" setup>
import { computed } from 'vue';
import { useStorage } from '@/composables/useStorage';
import type { PinpointSolution } from '@/types/solutions';

const defaultSolution: PinpointSolution = {
    clues: [],
    acceptableAnswers: []
};

const { data: pinpointSolution, loading, error } = useStorage<PinpointSolution>('pinpointSolution', defaultSolution);

const displayClues = computed(() => {
    const clues = pinpointSolution.value.clues;
    return clues.length > 0 ? clues.slice(1) : clues;
});

const displayAnswers = computed(() => {
    const answers = pinpointSolution.value.acceptableAnswers;
    return answers.length > 0 ? answers.slice(1): answers;
});

</script>

<template>
    <div>
        <p>Pinpoint Solution:</p>

        <div v-if="loading" class="loading">
            Loading solution...
        </div>

        <div v-else-if="error" class="error">
            Error: {{ error }}
        </div>

        <div v-else-if="!displayClues.length && !displayAnswers.length" class="no-data">
            No solution data available.
        </div>

        <div v-else class="container">
            <div v-if="displayClues.length">
                <h3>Clues</h3>
                <div v-for="(clue, index) in displayClues" :key="`clue-${index}`" class="word">
                    {{ clue?.clue || clue }}
                </div>
            </div>
            <div v-if="displayAnswers.length">
                <h3>Answers</h3>
                <div v-for="(answer, index) in displayAnswers" :key="`answer-${index}`" class="word">
                    {{ answer }}
                </div>
            </div>
        </div>
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

.container {
    display: flex;
    flex-wrap: wrap;
    gap: 48px;
    justify-content: space-around;
}

.word {
    display: flex;
    height: 48px;
    align-items: center;
    margin-bottom: 8px;

    color: white;
    font-family: monospace;
    font-size: xx-large;
    font-weight: 600;
    line-height: 1.2;
    word-wrap: break-word;
}

h3 {
    color: white;
    margin-bottom: 16px;
    font-size: x-large;
}
</style>
