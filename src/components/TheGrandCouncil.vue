<script setup>
/*
This component draws the 100 members of the Grand Council from either
council.membersCurrent or council.membersAsOfDate.

The component listens to the user selections and updates the drawn members accordingly:
- council.seatArrangement
- council.seatFeature
- council.memberFocus
*/

import { ref, computed, onMounted, watch } from "vue"
import { useScreenSizeStore } from "../stores/screenSize.js"
import { useCouncilStore } from "../stores/council.js"
import {
  customColorScale,
  customColors,
  ordinalColors,
  focusColors,
  focusOpacity
} from "../utils/customColors.js"
import { debounce } from "../utils/debounce.js"
import d3 from "../d3-importer.js"

const screenSize = useScreenSizeStore()
const council = useCouncilStore()

// Lifecycle ///////////////////////////////////////////////////////
onMounted(() => {
  tooltip.value = d3.select("#tooltip")

  drawViz()
  if (council.numberOfFetches > 0) {
    sortMembers()
  }
})

// Handle screen resizing //////////////////////////////////////////
watch(
  () => screenSize.width,
  () => {
    debouncedRecreate()
  }
)

const debouncedRecreate = debounce(() => {
  reDrawViz()
}, 200)

async function reDrawViz() {
  d3.select("#svg-visualization").remove()
  await drawViz()
  await drawSeatArrangement(members.value)
  if (seatArrangement.value === "occupation") {
    await updateAndRotateViz("increased")
  }
}

// Data ////////////////////////////////////////////////////////////
const svg = ref(null)
const ctr = ref(null)

const vizDimensions = ref({
  width: null,
  height: null,
  margin: {
    top: null,
    right: null,
    bottom: null,
    left: null
  },
  ctrWidth: null,
  ctrHeight: null
})

// The actual council members
const members = computed(() => {
  return council.asOfDate && council.membersAsOfDate
    ? council.membersAsOfDate
    : council.membersCurrent
})

// The selected seat arrangement
const seatArrangement = computed(() => {
  return council.seatArrangement ? council.seatArrangement : ""
})

const seatFeature = computed(() => {
  return council.seatFeature
})

const memberFocus = computed(() => {
  return council.memberFocus
})

const xDomain = computed(() => {
  if (!seatArrangement.value) return [""]

  const domainArray = getUniqueMemberValues(seatArrangement.value)

  if (isNumericValue(domainArray[0])) {
    const min = d3.min(domainArray)
    const max = d3.max(domainArray)
    /* If the difference between max and min is more than 100 we'll go for a log scale
    If the min value is also 0 we replace it with 1 as there's no 0 on a log scale */
    return max - min > 100 && min === 0 ? [1, max] : [min, max]
  }
  return domainArray.sort()
})

function isNumericValue(value) {
  return Number.isInteger(Number(value))
}

function getUniqueMemberValues(selection) {
  return Array.from(new Set(members.value.map((member) => member[selection])))
}

// The x-axis scale type
// It returns an object so we have more reactivity
const xScaleType = computed(() => {
  const firstValue = xDomain.value[0]
  const isString = typeof firstValue === "string"
  const isLinear = xDomain.value[1] <= 100

  if (isString) {
    return { type: "band" }
  }

  return isLinear ? { type: "linear" } : { type: "log" }
})

// xScaleType changes with EVERY change of the selected seat arrangement
watch(
  () => xScaleType.value,
  (newValue, oldValue) => {
    const changeOfScale = newValue.type === oldValue.type ? false : true
    updateXaxis(changeOfScale)
  },
  { deep: false } // Ensure shallow watch
)

watch(
  () => seatArrangement.value,
  async (newValue, oldValue) => {
    await sortMembers()
    if (newValue === "occupation") {
      await updateAndRotateViz("increased")
    }
    if (oldValue === "occupation") {
      await updateAndRotateViz("regular")
    }
  }
)

watch(
  () => seatFeature.value,
  () => {
    sortMembers()
  }
)

watch(
  () => memberFocus.value,
  () => {
    drawSeatArrangement(members.value)
  }
)

const xScale = ref(null)
const xAxis = ref(null)

watch(
  () => council.newFetchingDone,
  async (newValue) => {
    if (newValue) {
      sortMembers()
    }
  }
)

const colorScale = ref(null)

// Methods /////////////////////////////////////////////////////////
// Drawing the whole thing
async function drawViz() {
  await initiateSvg()
  await createXaxis()
}

// Setting up the SVG
async function initiateSvg() {
  // Select the target element and get its width
  const element = d3.select("#grand-council-basel")

  await setVizDimensions(element)

  // Create the SVG and set the viewBox
  svg.value = element
    .append("svg")
    .attr("id", "svg-visualization")
    .attr("viewBox", `0 0 ${vizDimensions.value.width} ${vizDimensions.value.height}`)

  ctr.value = svg.value
    .append("g")
    .attr("id", "visualization-ctr")
    .attr(
      "transform",
      `translate(${vizDimensions.value.margin.left}, ${vizDimensions.value.margin.top})`
    )
}

async function updateAndRotateViz(direction) {
  const height = direction === "increased" ? xSpacing.value * 100 * 1.1 : vizDimensions.value.height
  const svgDegree = direction === "increased" ? "270" : "0"

  const rotateSvgTransition = d3.transition().duration(2500)
  const rotateXaxisTransition = rotateSvgTransition.transition().duration(1500)

  await svg.value
    .transition(rotateSvgTransition)
    .attr("viewBox", `0 0 ${vizDimensions.value.width} ${height}`)
    .attr("transform", `rotate(${svgDegree})`)

  if (direction === "increased") {
    // Rotate axis tick labels
    await xAxis.value
      .selectAll("text")
      .transition(rotateXaxisTransition)
      .style("text-anchor", "start")
      .style("font-size", () => (screenSize.isMobile ? "6px" : "14px"))
      .attr("dy", ".02rem")
      .attr("dx", () => {
        return -vizDimensions.value.ctrHeight + maxGroupMembers.value * seatRadius.value * 2
      })
      .attr("transform", "rotate(90)")
  }
}

async function setVizDimensions(element) {
  vizDimensions.value.width = element.node().getBoundingClientRect().width

  const heightFactor = screenSize.isMobile ? 0.5 : 0.3

  vizDimensions.value.height = vizDimensions.value.width * heightFactor

  vizDimensions.value.margin.top = screenSize.isMobile ? 10 : 50
  vizDimensions.value.margin.right = screenSize.isMobile ? 5 : 25
  vizDimensions.value.margin.bottom = screenSize.isMobile ? 18 : 25
  vizDimensions.value.margin.left = screenSize.isMobile ? 5 : 25

  vizDimensions.value.ctrWidth =
    vizDimensions.value.width - vizDimensions.value.margin.left - vizDimensions.value.margin.right

  vizDimensions.value.ctrHeight =
    vizDimensions.value.height - vizDimensions.value.margin.top - vizDimensions.value.margin.bottom
}

// Sort the members for the visualization
async function sortMembers() {
  // Sorting
  await members.value.sort((a, b) => {
    if (seatArrangement.value) {
      // Sort by seat arrangement first
      if (a[seatArrangement.value] < b[seatArrangement.value]) return -1
      if (a[seatArrangement.value] > b[seatArrangement.value]) return 1
    }
    if (seatFeature.value) {
      // Sort on a second level by seat feature
      if (a[seatFeature.value] < b[seatFeature.value]) return -1
      if (a[seatFeature.value] > b[seatFeature.value]) return 1
    } else {
      // Else, just sort by name
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
    }
  })

  // Make sure to set an inner index based on the seat feature
  let currentKey = null
  let innerIndex = -1
  let highestIndex = -1

  members.value.forEach((obj) => {
    if (obj[seatArrangement.value] !== currentKey) {
      currentKey = obj[seatArrangement.value]
      innerIndex = 0
    } else {
      innerIndex += 1
    }
    obj.innerIndex = innerIndex

    innerIndex > highestIndex ? (highestIndex = innerIndex) : null
  })

  // Keep track of the highest number of members in a group
  maxGroupMembers.value = highestIndex + 1

  console.log(members.value)

  // Handle the visualization
  await setColorScale()
  await drawSeatArrangement(members.value)
}

// Creating the x-axis
async function createXaxis() {
  await setXScale()
  await drawXaxis()
}

// Set the x-axis scale
async function setXScale() {
  if (xScaleType.value.type === "band") {
    xScale.value = d3
      .scaleBand()
      .domain(xDomain.value)
      .range([0, vizDimensions.value.ctrWidth])
      .paddingInner(0.2)
      .paddingOuter(0.2)
      .align(0.5)
  } else if (xScaleType.value.type === "linear") {
    xScale.value = d3
      .scaleLinear()
      .domain(xDomain.value)
      .range([0, vizDimensions.value.ctrWidth])
      .nice()
  } else {
    xScale.value = d3
      .scaleLog()
      .domain(xDomain.value)
      // Move the range 5% to the right so we could plot zero values outside of the actual log scale!!
      .range([vizDimensions.value.ctrWidth * 0.05, vizDimensions.value.ctrWidth])
      .base(2)
      .nice()
  }
}

// Draw the actual x-axis
async function drawXaxis() {
  xAxis.value = ctr.value
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${vizDimensions.value.ctrHeight})`)
    .style("font-size", () => (screenSize.isMobile ? "8px" : "14px"))

  formatxAxis()
}

// Update the x-axis if the selected seat arrangement has changed
async function updateXaxis(changeOfScale) {
  if (changeOfScale) {
    // Remove the old x-axis if there's a new scale type
    d3.select("#x-axis").remove()
    // Create a whole new x-axis
    createXaxis()
  } else {
    // Otherwise just update the x-axis domain
    xScale.value.domain(xDomain.value)
    // ...and make sure to format it correctly
    formatxAxis()
  }
}

// Post formatting the drawn x-axis
function formatxAxis() {
  const deCH = d3
    .formatLocale({
      thousands: "'",
      grouping: [3]
    })
    .format(",.0f")

  const axisCall = d3.axisBottom(xScale.value)

  if (xScaleType.value.type === "band") {
    axisCall.tickSize(0)
  }

  if (xScaleType.value.type === "linear") {
    const nrTicks = xDomain.value[1] < 10 ? xDomain.value[1] : 12
    axisCall
      .tickSize(-vizDimensions.value.ctrHeight)
      .ticks(nrTicks)
      .tickPadding(10)
      .tickSizeOuter(0)
      .tickFormat(deCH)
  }

  if (xScaleType.value.type === "log") {
    axisCall
      .tickSize(-vizDimensions.value.ctrHeight)
      .ticks(5)
      .tickPadding(10)
      .tickSizeOuter(0)
      .tickFormat(deCH)
  }

  xAxis.value.transition().call(axisCall)

  xScaleType.value.type === "band"
    ? xAxis.value.call((axis) => axis.select(".domain").remove())
    : xAxis.value
        .selectAll(".tick line")
        .style("stroke", "lightgrey")
        .style("stroke-dasharray", "4,2")
}

const maxGroupMembers = ref(0)
const maxSeatsPerRow = 20

const maxSeatsPerGroupRow = computed(() => {
  return xScaleType.value.type === "band" ? Math.ceil(maxSeatsPerRow / xDomain.value.length) : 1
})

const maxRowsPerGroup = computed(() => {
  return xScaleType.value.type === "band"
    ? Math.ceil(maxGroupMembers.value / maxSeatsPerGroupRow.value)
    : maxGroupMembers.value
})

const bandwidth = computed(() => {
  return xScaleType.value.type === "band" ? xScale.value.bandwidth() : null
})

const xSpacing = computed(() => {
  return xScaleType.value.type === "band"
    ? bandwidth.value / maxSeatsPerGroupRow.value
    : vizDimensions.value.ctrWidth / (xDomain.value[1] - xDomain.value[0])
})

const ySpacing = computed(() => {
  return vizDimensions.value.ctrHeight / maxRowsPerGroup.value
})

const seatRadius = computed(() => {
  const radiusFactor = 0.9

  const halfX = (xSpacing.value / 2) * radiusFactor
  const halfY = (ySpacing.value / 2) * radiusFactor

  if (xScaleType.value.type === "band") {
    return maxRowsPerGroup.value > maxSeatsPerGroupRow.value ? Math.min(halfX, halfY) : halfX
  }

  if (xScaleType.value.type === "linear") {
    return Math.min(halfX, halfY)
  }

  return screenSize.isMobile ? 3.3 : 5
})

function xAccessor(d) {
  if (xScaleType.value.type === "band") {
    return bandXAccessor(d)
  }

  if (xScaleType.value.type === "linear") {
    return linearXAccessor(d)
  }

  return logXAccessor(d)
}

function yAccessor(d, phase = "update") {
  if (phase === "enter") {
    return -seatRadius.value * 2
  }

  if (phase === "exit") {
    return vizDimensions.value.ctrHeight + seatRadius.value * 2
  }

  if (xScaleType.value.type === "band") {
    return bandYAccessor(d)
  }

  if (xScaleType.value.type === "linear") {
    return linearYAccessor(d)
  }

  return logYAccessor(d)
}

function bandXAccessor(d) {
  const dKey = seatArrangement.value ? d[seatArrangement.value] : ""
  const xIdx = d.innerIndex % maxSeatsPerGroupRow.value
  return xScale.value(dKey) + xIdx * xSpacing.value + xSpacing.value / 2
}

function bandYAccessor(d) {
  const yIdx = Math.floor(d.innerIndex / maxSeatsPerGroupRow.value)
  if (seatArrangement.value !== "occupation") {
    return xDomain.value[0] === ""
      ? yIdx * ySpacing.value + ySpacing.value / 2
      : yIdx * ySpacing.value
  }
  return yIdx * seatRadius.value * 2
}

function linearXAccessor(d) {
  return xScale.value(d[seatArrangement.value])
}

function linearYAccessor(d) {
  return vizDimensions.value.ctrHeight - seatRadius.value - d.innerIndex * seatRadius.value * 2 // Staples the seats
  // return d.innerIndex * ySpacing.value --> (tries to distribute across the height)
}

function logXAccessor(d) {
  if (d[seatArrangement.value] !== 0) {
    return xScale.value(d[seatArrangement.value])
  }
  return 10 // WHERE TO PLACE ZERO VALUES
}

function logYAccessor(d) {
  return vizDimensions.value.ctrHeight - seatRadius.value - d.innerIndex * seatRadius.value * 2
}

const opacity = computed(() => {
  return xScaleType.value.type === "log" ? 0.65 : 0.9
})

function hasCustomColors(key) {
  return key in customColors || isNumericValue(key)
}

const colorScaleData = computed(() => {
  if (!seatFeature.value) return {}

  const domainArray = getUniqueMemberValues(seatFeature.value)
  const isNumeric = isNumericValue(domainArray[0])
  let scaleType
  let scaleDomain

  if (isNumeric) {
    const min = d3.min(domainArray)
    const max = d3.max(domainArray)
    scaleType = max - min > 100 ? "log" : "linear"
    scaleDomain = max - min > 100 && min === 0 ? [1, max] : [min, max]
  } else {
    scaleType = hasCustomColors(seatFeature.value) ? "custom" : "ordinal"
    scaleDomain = domainArray.sort()
  }

  return { type: scaleType, domain: scaleDomain }
})

async function setColorScale() {
  const { type, domain } = colorScaleData.value

  const scaleTypes = {
    ordinal: () => d3.scaleOrdinal().domain(domain).range(ordinalColors),
    linear: () =>
      d3
        .scaleLinear()
        .domain(domain)
        .range([customColorScale.lowColor, customColorScale.highColor]),
    log: () =>
      d3.scaleLog().domain(domain).range([customColorScale.lowColor, customColorScale.highColor]),
    default: () => null
  }

  colorScale.value = (scaleTypes[type] || scaleTypes.default)()
}

function colorAccessor(d) {
  if (!seatFeature.value) {
    return "#000000"
  }
  if (colorScaleData.value.type === "custom") {
    const value = d[seatFeature.value]
    return isNumericValue(seatFeature.value)
      ? customColors.vote[value]
      : customColors[seatFeature.value][value]
  }

  if (colorScaleData.value.type === "log" && d[seatFeature.value] === 0) {
    return customColorScale.logZeroColor
  }
  return colorScale.value(d[seatFeature.value])
}

const tooltip = ref(null)

function focusColorAccessor(d) {
  const index = council.focusOptions.findIndex((opt) => {
    return opt.value === d.id
  })
  return focusColors[index % focusColors.length]
}

async function drawSeatArrangement(data) {
  let seatsGroup = ctr.value.select(".seats-group")

  if (seatsGroup.empty()) {
    seatsGroup = ctr.value.append("g").attr("class", "seats-group")
  }

  const exitTransition = d3.transition().duration(2500)
  const enterTransition =
    council.numberOfFetches === 1
      ? d3.transition().duration(2500)
      : exitTransition.transition().duration(2500)
  const updateTransition = d3.transition().duration(2500)

  // Bind data to circles and handle exit transition first
  const circles = seatsGroup.selectAll("circle").data(data, (d) => d.id)

  // (exit) =>
  circles
    .exit()
    .transition(exitTransition)
    .attr("cx", (d) => xAccessor(d))
    .attr("cy", (d) => yAccessor(d, "exit"))
    .attr("r", seatRadius.value)
    .attr("fill", (d) => colorAccessor(d))
    .attr("fill-opacity", 0)
    .remove()

  // (enter) =>
  circles
    .enter()
    .append("circle")
    .attr("class", "seat")
    .attr("cx", (d) => xAccessor(d))
    .attr("cy", (d) => yAccessor(d, "enter"))
    .attr("r", seatRadius.value)
    .attr("fill", (d) => colorAccessor(d))
    .attr("fill-opacity", 0)
    .attr("stroke", (d) => (d.focus ? focusColorAccessor(d) : null))
    .attr("stroke-width", (d) => (d.focus ? seatRadius.value * 2 : null))
    .attr("stroke-opacity", (d) => (d.focus ? focusOpacity : null))
    .on("click", (_, d) => {
      screenSize.isMobile ? null : window.open(d.url, "_blank")
    })
    .on("mouseover", (_, d) =>
      setTimeout(() => {
        addMouseover(d)
      }, 100)
    )
    .on("mousemove", (event) => handleMouseMove(event))
    .on("mouseout", () => resetTooltip())
    .on("contextmenu", (event, d) => handleRighClick(event, d))
    .transition(enterTransition)
    .attr("cx", (d) => xAccessor(d))
    .attr("cy", (d) => yAccessor(d))
    .attr("fill", (d) => colorAccessor(d))
    .attr("fill-opacity", opacity.value)
    .attr("cursor", "pointer")

  // (update) =>
  circles
    .transition(updateTransition)
    .attr("cx", (d) => xAccessor(d))
    .attr("cy", (d) => yAccessor(d))
    .attr("r", seatRadius.value)
    .attr("fill", (d) => colorAccessor(d))
    .attr("fill-opacity", opacity.value)
    .attr("stroke", (d) => (d.focus ? focusColorAccessor(d) : null))
    .attr("stroke-width", (d) => (d.focus ? seatRadius.value * 2 : null))
    .attr("stroke-opacity", (d) => (d.focus ? focusOpacity : null))
    .attr("cursor", "pointer")

  d3.select(".seats-group").raise()
}

let linkIsClicked = false

function addMouseover(d) {
  if (!council.membersAsOfDate) {
    tooltip.value.select(".headshot img").attr("src", d.image)
  }

  tooltip.value.select(".name").text(d.name)
  if (seatArrangement.value === seatFeature.value) {
    tooltip.value.select(".arrangement").text(d[seatArrangement.value])
  } else {
    tooltip.value.select(".arrangement").text(d[seatArrangement.value])
    tooltip.value.select(".feature").text(d[seatFeature.value])
  }

  if (screenSize.isMobile) {
    const urlDiv = tooltip.value.select(".url")
    const link = urlDiv.select("a")
    link.attr("href", d.url)

    link.on("click", (event) => {
      event.stopPropagation()
      linkIsClicked = true
    })
  }

  tooltip.value.style("visibility", "visible")
}

function handleMouseMove(event) {
  tooltip.value
    .style("left", `${event.clientX + seatRadius.value}px`)
    .style("top", `${event.clientY - seatRadius.value}px`)
}

function resetTooltip() {
  if (screenSize.isMobile) {
    setTimeout(
      () => {
        if (!linkIsClicked) {
          hideTooltip()
        } else {
          linkIsClicked = false
          hideTooltip()
        }
      },
      linkIsClicked ? 1500 : 0
    )
  } else {
    hideTooltip()
  }
}

function hideTooltip() {
  if (!council.membersAsOfDate) {
    tooltip.value.select(".headshot img").attr("src", null)
  }

  tooltip.value.select(".name").text(null)
  tooltip.value.select(".arrangement").text(null)
  tooltip.value.select(".feature").text(null)
  tooltip.value.select(".hint").text(null)

  if (screenSize.isMobile) {
    const urlDiv = tooltip.value.select(".url")
    const link = urlDiv.select("a")
    link.attr("href", "")
  }

  tooltip.value.style("visibility", "hidden")
}

function handleRighClick(event, d) {
  event.preventDefault()

  if (council.memberFocus) {
    if (!memberFocus.value.includes(d.id)) {
      council.setMemberFocus([...memberFocus.value, d.id])
    }
  } else {
    council.setMemberFocus([d.id])
  }
}
</script>

<template>
  <div id="tooltip">
    <div v-if="!council.membersAsOfDate" class="headshot"><img /></div>
    <div class="name"></div>
    <div class="arrangement"></div>
    <div class="feature"></div>
    <div v-show="screenSize.isMobile" class="url">
      <a href="" target="_blank">Link</a>
    </div>
  </div>
</template>

<style scoped>
#tooltip {
  text-align: center;
  visibility: hidden;
  position: fixed;
  z-index: 10;
  background-color: rgba(247, 247, 247, 0.85);
  border-radius: 4px;
  padding: 5px;
  font-size: 14px;
}

.name {
  font-weight: 800;
}

img {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: grayscale(100%);
  background-color: #dddddd;
}

.hint {
  font-size: 10px;
}
</style>
