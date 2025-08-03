<script lang="ts" setup>
import Moon from '~/components/icons/Moon.vue';
import Sun from '~/components/icons/Sun.vue';

let tangoSolution = ref(Array.from({ length: 6 }, () => Array(6).fill(0)));

chrome.storage.local.get(["tangoSolution"]).then((result) => {
    console.log("Value is " + result);

    if (!result || !result.tangoSolution) {
        console.error("No tangoSolution found in storage.");
        return;
    }
    try {
        tangoSolution.value = JSON.parse(result.tangoSolution);
    } catch (e) {
        console.error("Error parsing tangoSolution:", e);
        return;
    }
    console.log("Parsed tangoSolution:", tangoSolution);
}).catch((error) => {
    console.error("Error retrieving tangoSolution from storage:", error);
});

</script>

<template>
    <div>
        <p>Tango Solution:</p>

        <table style="margin: 0 auto;">
            <tr v-for="row in tangoSolution">
                <td v-for="cell in row">
                    <Sun v-if="cell === 'ZERO'" class="cell" />
                    <Moon v-else class="cell" />
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

    transform: scaleX(-1);
    transform-origin: center;
}
</style>
