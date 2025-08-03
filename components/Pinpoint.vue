<script lang="ts" setup>

let pinpointSolution = ref({
    clues: [],
    acceptableAnswers: [],
});

chrome.storage.local.get(["pinpointSolution"]).then((result) => {
    console.log("Value is " + result);

    if (!result || !result.pinpointSolution) {
        console.error("No pinpointSolution found in storage.");
        return;
    }
    try {
        pinpointSolution.value = JSON.parse(result.pinpointSolution);
    } catch (e) {
        console.error("Error parsing pinpointSolution:", e);
        return;
    }
    console.log("Parsed pinpointSolution:", pinpointSolution);
}).catch((error) => {
    console.error("Error retrieving pinpointSolution from storage:", error);
});

function withoutFirstItem(arr: string[]) {
    return arr.slice(1);
}

</script>

<template>
    <div>
        <p>Pinpoint Solution:</p>

        <!-- interate over pinpointSolution.clues -->
        <div class="container">
            <div>
                <h3>Clues</h3>
                <div v-for="(clue, index) in withoutFirstItem(pinpointSolution.clues)" :key="index" class="word">
                    {{ clue?.clue }}
                </div>
            </div>
            <div>
                <h3>Answers</h3>
                <div v-for="(answer, index) in withoutFirstItem(pinpointSolution.acceptableAnswers)" :key="index" class="word">
                    {{ answer }}
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.container {
    display: flex;
    flex-wrap: wrap;
    gap: 48px;
    justify-content: space-around;
}

.word {
    height: 48px;
    align-items: center;

    color: white;
    font-size: xx-large;
    font-weight: 600;
}
</style>
