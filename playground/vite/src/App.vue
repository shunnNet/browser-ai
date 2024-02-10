<script setup lang="ts"></script>

<template>
  <div class="flex gap-5">
    <RouterLink :to="{ name: 'Index' }">Index</RouterLink>
    <RouterLink :to="{ name: 'YesNo' }">YesNo</RouterLink>
    <RouterLink :to="{ name: 'Choice' }">Choice</RouterLink>
    <RouterLink :to="{ name: 'Categorize' }">Categorize</RouterLink>
    <RouterLink :to="{ name: 'ChooseAndAnswer' }">ChooseAndAnswer</RouterLink>
  </div>
  <RouterView />
</template>
