<script setup>
import { NFlex } from "naive-ui"
import { useScreenSizeStore } from "../stores/screenSize.js"
import { useCouncilStore } from "../stores/council.js"
import TheCouncilSelection from "../components/TheCouncilSelection.vue"
import TheVotesTable from "../components/TheVotesTable.vue"
import TheSeatSelection from "../components/TheSeatSelection.vue"
import TheMemberFocus from "../components/TheMemberFocus.vue"
import TheGrandCouncil from "../components/TheGrandCouncil.vue"

const screenSize = useScreenSizeStore()
const council = useCouncilStore()
</script>

<template>
  <n-flex :size="15" vertical>
    <div class="date-selection">
      <n-flex :size="0" :vertical="screenSize.isMobile">
        <TheCouncilSelection />
      </n-flex>
    </div>
    <div class="council-title">
      {{ council.title }}
    </div>
    <div class="parliament-visualization">
      <n-flex :size="15" :vertical="screenSize.isMobile" :reverse="screenSize.isMobile">
        <div class="parliament-area">
          <n-flex :size="2" vertical>
            <div class="seat-arrangement" id="grand-council-basel">
              <TheGrandCouncil />
            </div>
            <div class="x-axis-title">The x-axis legend</div>
          </n-flex>
        </div>
        <div class="legend-area">
          <n-flex :size:="2" vertical>
            <div class="legend-title">The legend title</div>
            <div class="seat-legend">The legend</div>
          </n-flex>
        </div>
      </n-flex>
    </div>
    <div class="parliament-selection">
      <n-flex :size="15" :vertical="screenSize.isMobile">
        <div class="seat-arrangement-selection">
          <TheSeatSelection :type="'arrangement'" />
        </div>
        <div class="seat-feature-selection">
          <TheSeatSelection :type="'feature'" />
        </div>
      </n-flex>
    </div>
    <div class="member-focus">
      <n-flex :size="[15, 0]" :vertical="screenSize.isMobile">
        <div style="flex: 1"></div>
        <div class="member-focus-selection">
          <TheMemberFocus />
        </div>
      </n-flex>
    </div>
    <div>
      <TheVotesTable />
    </div>
  </n-flex>
</template>

<style scoped>
.council-title {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
}
.parliament-area {
  flex: 4;
}

.legend-area {
  flex: 1;
}

.seat-arrangement-selection {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seat-feature-selection {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-focus-selection {
  flex: 1;
}
</style>
