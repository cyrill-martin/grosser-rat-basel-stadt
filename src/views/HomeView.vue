<script setup>
import { NFlex } from "naive-ui"
import { useScreenSizeStore } from "../stores/screenSize.js"
import { useCouncilStore } from "../stores/council.js"
import TheCouncilSelection from "../components/TheCouncilSelection.vue"
import TheVotesTable from "../components/TheVotesTable.vue"
import TheSeatSelection from "../components/TheSeatSelection.vue"
import TheMemberFocus from "../components/TheMemberFocus.vue"
import TheGrandCouncil from "../components/TheGrandCouncil.vue"
import TheLegendTitle from "../components/TheLegendTitle.vue"
import TheXAxisTitle from "../components/TheXAxisTitle.vue"
import TheLegend from "../components/TheLegend.vue"

const screenSize = useScreenSizeStore()
const council = useCouncilStore()

const legendTitleAreaFlexSize = screenSize.isMobile ? 0 : 15
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
      <div class="legend-title-area">
        <n-flex :size="legendTitleAreaFlexSize">
          <div class="legend-title-buffer"></div>
          <div class="legend-title">
            <TheLegendTitle />
          </div>
        </n-flex>
      </div>
      <n-flex :size="15" :vertical="screenSize.isMobile" :reverse="screenSize.isMobile">
        <div class="parliament-area">
          <n-flex :size="2" vertical>
            <div class="seat-arrangement" id="grand-council-basel">
              <TheGrandCouncil />
            </div>
            <div class="x-axis-title">
              <TheXAxisTitle />
            </div>
          </n-flex>
        </div>
        <div class="legend-area">
          <n-flex :size:="2" vertical>
            <div class="seat-legend" id="grand-council-basel-legend">
              <TheLegend />
            </div>
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
  font-weight: 500;
}

.parliament-area {
  flex: 4;
  border-radius: 4px;
}

.x-axis-title {
  text-align: center;
  font-weight: 500;
  font-size: 16px;
}

.legend-area {
  flex: 1;
  border-radius: 4px;
}

.legend-title-area {
  flex: 1;
}

.legend-title-buffer {
  flex: 4;
}

.legend-title {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
  min-height: 24px;
}

.seat-legend {
  flex-grow: 1;
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

@media only screen and (max-width: 768px) {
  .council-title {
    font-size: 1rem;
  }
  .legend-title-buffer {
    flex: 0;
  }
  .legend-title {
    font-size: 12px;
  }
  .x-axis-title {
    font-size: 12px;
  }
}
</style>
