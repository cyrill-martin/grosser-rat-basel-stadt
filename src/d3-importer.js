import { select, selectAll } from "d3-selection"
import { min, max, mean, group, rollup } from "d3-array"
import { axisBottom, axisRight } from "d3-axis"
import { scaleBand, scaleOrdinal, scaleLinear, scaleLog } from "d3-scale"
import { transition } from "d3-transition"
import { formatLocale } from "d3-format"
import { color } from "d3-color"
import { schemeTableau10 } from "d3-scale-chromatic"

export default {
  select,
  selectAll,
  min,
  max,
  mean,
  group,
  rollup,
  axisBottom,
  axisRight,
  scaleBand,
  scaleOrdinal,
  scaleLinear,
  scaleLog,
  transition,
  formatLocale,
  color,
  schemeTableau10
}
