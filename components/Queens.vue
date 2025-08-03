<script lang="ts" setup>
import Star from '~/components/icons/Star.vue';

let queensSolution = ref({
    queenPositions: [],
    gridSize: 0,
    gridColors: []
});

chrome.storage.local.get(["queensSolution"]).then((result) => {
    console.log("Value is " + result);

    if (!result || !result.queensSolution) {
        console.error("No queensSolution found in storage.");
        return;
    }
    try {
        queensSolution.value = JSON.parse(result.queensSolution);
    } catch (e) {
        console.error("Error parsing queensSolution:", e);
        return;
    }
    console.log("Parsed queensSolution:", queensSolution);
}).catch((error) => {
    console.error("Error retrieving queensSolution from storage:", error);
});

</script>

<template>
    <div>
        <p>Queens Solution:</p>

        <table style="margin: 0 auto;">
            <tr v-for="(_, row) in queensSolution.gridSize" :key="row">
                <td v-for="(_, col) in queensSolution.gridSize"
                    :class="['cell', 'color-' + queensSolution.gridColors[row * queensSolution.gridSize + col]?.color]"
                    :key="col">
                    <Star v-if="queensSolution.queenPositions.some(pos => pos.row === row && pos.col === col)"
                        class="star" />
                </td>
            </tr>
        </table>
    </div>

</template>

<style scoped>
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
