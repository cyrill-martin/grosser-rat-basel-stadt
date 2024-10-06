<script setup>
import { RouterLink } from "vue-router"
import { NFlex } from "naive-ui"
</script>

<template>
  <n-flex>
    <div>
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="16" height="16" />
      <RouterLink to="/">
        {{ $t("header.grandCouncilBaselStadt") }}
      </RouterLink>
    </div>
    <nav>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </n-flex>
</template>
