<script setup>
import { NSelect } from "naive-ui"
</script>

<template>
  <label for="member-focus">{{ $t("memberFocusSelection.label") }}</label>
  <n-select id="member-focus"></n-select>
</template>

<style scoped>
label {
  font-weight: bold;
}
</style>
