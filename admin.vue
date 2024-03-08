<script setup>
import {ref, onBeforeMount } from 'vue';

let teachers = ref([]);

onBeforeMount(async () => {
    try {
        teachers = await fetch('http://localhost:8080/teachers')
    } catch (error) {
        alert(error.message);
    }
});

</script>

<template>
    <form action="POST">
        <label>
            Lärare:
            <select name="teacher">
                <option v-for="teacher in teachers"> {{option.name }}</option>
            </select> 
        </label>
    </form>
</template>