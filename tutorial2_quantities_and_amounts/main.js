// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType
async function loadData() {
  const data = await d3.csv("../data/squirrelActivities.csv", d3.autoType);
  buildBarChart(data);
}

function buildBarChart(data) {
  /** CONSTANTS */
  // constants help us reference the same values throughout our code
  const margin = { top: 20, bottom: 40, left: 60, right: 60 };
  const width = 960 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const y = d3
    .scaleBand()
    .range([height, 0])
    .padding(0.1);

  const x = d3.scaleLinear().range([0, width]);


  x.domain([
    0,
    d3.max(data, d => {
      return d.count;
    })
  ]);
  y.domain(
    data.map(d => {
      return d.activity;
    })
  );

  /** MAIN CODE */
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // append rects
  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", y)
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => {
      return x(d.count);
    })
    .attr("y", d => {
      return y(d.activity);
    })
    .attr("fill", "steelblue");

  // append text
  const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d.count) + margin.right / 2)
    .attr("y", d => y(d.activity) + margin.top)
    .text(d => d.count)
    .attr("dy", "1.25em");

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + width + ",0)")
    .attr("y", -(margin.top / 4))
    .style("text-anchor", "end")
    .text("Activity Count");
}

document.addEventListener("DOMContentLoaded", loadData);
