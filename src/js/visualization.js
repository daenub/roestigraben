import * as d3 from "d3"
import {geoPath} from "d3-geo"
import * as topojson from "topojson"

import topology from "../data/ch-municipalities.json"

window.d3 = d3

const infobox = d3.select(".infobox")

d3.csv("assets/yesVoteDiffs.csv").then(yesVoteDiffs => {
  yesVoteDiffs = yesVoteDiffs.map(r => ({...r, yesVotesDiff: +r.yesVotesDiff}))

  const geojsonMunicipalities = topojson.feature(
    topology,
    topology.objects.municipalities
  )

  const geojsonFeaturesWithData = mergeDataAndFeatures(
    geojsonMunicipalities.features,
    yesVoteDiffs
  )

  const maxDiff = d3.max(yesVoteDiffs, d => d.yesVotesDiff)
  const minDiff = d3.min(yesVoteDiffs, d => d.yesVotesDiff)

  const colorScale = d3
    .scaleLinear()
    .domain([minDiff, 0, maxDiff])
    .range(["red", "#ddd", "green"])

  generateTable(yesVoteDiffs, minDiff, maxDiff)

  const width = 960,
    height = 500

  const container = d3.select("#map")

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  const pathGenerator = geoPath().projection(null)

  const paths = svg
    .selectAll("path")
    .data(geojsonFeaturesWithData)
    .enter()
    .append("path")
    .attr("d", d => pathGenerator(d))
    .attr("stroke", "#000")
    .attr("fill", d => colorScale(d.properties.diff || 0))
    .on("mouseover", onMouseOver)
    .on("mouseleave", onMouseLeave)
})

function onMouseOver(d, i) {
  const {name, canton, diff} = d.properties

  if (!name || !canton || !diff) {
    return
  }

  infobox
    .html(`<p>${name}<br>${canton}<br>${diff.toFixed(5)}%</p>`)
    .classed("visible", true)
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + "px")
}

function onMouseLeave() {
  infobox.html("").classed("visible", false)
}

function mergeDataAndFeatures(geoJsonFeatures, yesVoteDiffs) {
  return geoJsonFeatures.map(feature => {
    const row = yesVoteDiffs.find(
      r => feature.id.toString() === r.municipalityGeoLevelnummer
    )
    const diff = row ? row.yesVotesDiff : null
    const name = row ? row.municipalityGeoLevelname : null
    const canton = row ? row.cantonGeoLevelname : null

    return {
      ...feature,
      properties: {
        ...feature.properties,
        diff,
        name,
        canton,
      },
    }
  })
}

/* Table */

function generateTable(yesVoteDiffs, minDiff, maxDiff) {
  let ascending = true
  const colorScale = d3
    .scaleLinear()
    .domain([minDiff, 0, maxDiff])
    .range(["red", "#000", "green"])

  const table = d3.select("#table")

  const headRow = table.append("thead").append("tr")
  const tableBody = table.append("tbody")

  headRow
    .append("td")
    .text("Gemeinde")
    .classed("head-cell", true)

  headRow
    .append("td")
    .text("Kanton")
    .classed("head-cell", true)

  headRow
    .append("td")
    .classed("head-cell", true)
    .append("button")
    .classed("sort-button", true)
    .classed("ascending", ascending)
    .text("Differenz")
    .on("click", onSortClick)

  const bodyRows = tableBody
    .selectAll("tr")
    .data(yesVoteDiffs)
    .enter()
    .append("tr")
    .classed("body-row", true)

  bodyRows
    .append("td")
    .text((d, i) => d.municipalityGeoLevelname)
    .classed("body-cell", true)

  bodyRows
    .append("td")
    .text((d, i) => d.cantonGeoLevelname)
    .classed("body-cell", true)

  bodyRows
    .append("td")
    .text((d, i) =>
      d.yesVotesDiff > 0
        ? "+" + d.yesVotesDiff.toFixed(5)
        : d.yesVotesDiff.toFixed(5)
    )
    .style("color", d => colorScale(d.yesVotesDiff))
    .classed("body-cell", true)

  sortTable()

  function onSortClick(d, i, nodes) {
    ascending = !ascending
    sortTable()

    d3.select(nodes[i]).classed("ascending", ascending)
  }

  function sortTable() {
    bodyRows.sort((a, b) =>
      ascending
        ? a.yesVotesDiff - b.yesVotesDiff
        : b.yesVotesDiff - a.yesVotesDiff
    )
  }
}
