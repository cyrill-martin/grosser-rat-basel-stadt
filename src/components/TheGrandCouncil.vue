<script setup>
import { ref, onMounted } from "vue"
// import { useScreenSizeStore } from "../stores/screenSize.js"
import * as d3 from "d3"

// const screenSize = useScreenSizeStore()

const svg = ref(null)
const ctr = ref(null)

async function initiateSvg() {
  // console.log(screenSize.width)
  // Select the element and get its width
  const element = d3.select("#grand-council-basel")
  const width = element.node().getBoundingClientRect().width

  // Create the SVG and set the viewBox
  svg.value = element
    .append("svg")
    .attr("id", "svg-visualization")
    .attr("viewBox", `0 0 ${width} ${width * 0.33}`)

  ctr.value = await svg.value
    .append("g")
    .attr("id", "visualization-ctr")
    .attr("transform", `translate(25, 25)`)
}

onMounted(() => {
  initiateSvg()
})
</script>

<template>
  <div></div>
</template>
