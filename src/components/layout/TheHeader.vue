<script setup>
import { RouterLink } from "vue-router"
import { NFlex } from "naive-ui"
</script>

<template>
  <n-flex>
    <div class="home-link">
      <RouterLink to="/">
        {{ $t("header.grandCouncilBaselStadt") }}
      </RouterLink>
    </div>
    <div class="navigation">
      <nav>
        <RouterLink to="/about">{{ $t("header.navigation.about") }}</RouterLink>
      </nav>
    </div>
  </n-flex>
</template>

<style scoped>
.home-link {
  flex: 4;
}

.home-link a {
  text-decoration: none;
  color: inherit;
  font-size: 2rem;
  font-weight: 800;
}

.navigation {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
</style>
