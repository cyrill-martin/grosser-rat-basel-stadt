<script setup>
import { computed } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { NFlex } from "naive-ui"

const route = useRoute()
const isHomeRoute = computed(() => route.name === "home")
</script>

<template>
  <n-flex>
    <div class="home-link">
      <RouterLink v-if="!isHomeRoute" to="/">
        {{ $t("header.grandCouncilBaselStadt") }}
      </RouterLink>
      <span v-else>{{ $t("header.grandCouncilBaselStadt") }}</span>
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

.home-link {
  font-size: 2rem;
  font-weight: 800;
}

.home-link a {
  text-decoration: none;
  color: inherit;
}

.navigation {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

@media only screen and (max-width: 768px) {
  .home-link a {
    font-size: 1.2rem;
  }
  .navigation {
    font-size: 14px;
  }
}
</style>
