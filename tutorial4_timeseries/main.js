/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;

let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All",
  values: []
};

async function loadData() {
  // turns out this data below is bad for a timeseries

  // let rawData = await d3.csv(
  //   `./airplane_crashes_and_fatalities_since_1908.csv`,
  //   d3.autoType
  // );

  // const operators = [...new Set(rawData.map(d => d.operator))];
  // let usefulOperators = operators.map(o => {
  //   let filteredData = rawData.filter(d => o === d.operator);
  //   if (filteredData.length > 15) {
  //     return o;
  //   }
  //   return null;
  // });

  // usefulOperators = _.compact(usefulOperators);
  // const usefulData = rawData.filter(d => usefulOperators.includes(d.operator));

  let rawData = await d3.csv(`./Unemployment.csv`, d3.autoType);
  state.rawData = rawData;
  state.data = rawData;
  const values = ["All", "Married Men", "Married Women"];
  state.values = values;
  state.selection = "All";
  let stack = d3.stack().keys(values)(rawData);
  console.log(stack);
  state.stackedData = stack;
  init();
}

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  const { values } = state;
  const selectElement = d3.select("#dropdown").on("change", function() {
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(values) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.DATE))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d[state.selection])])
    .range([height - margin.bottom, margin.top]);

  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);

  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Date");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Unemployment Rate");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  let filteredData = state.data;
  console.log(state.data.length);
  // update the scale domain (now that our data has changed)
  // xScale.domain(d3.extent(state.data, d => d.DATE));
  // yScale.domain([0, d3.max(state.data, d => d[state.selection])]);

  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale)); // this updates the yAxis' scale to be our newly updated one

  d3.select("g.x-axis")
    .transition()
    .duration(1000)
    .call(xAxis.scale(xScale)); // this updates the yAxis' scale to be our newly updated one

  const lineFunc = d3
    .line()
    .x(d => xScale(d.DATE))
    .y((d, i) => yScale(d[state.selection]));

  const line = svg
    .selectAll("path.trend")
    .data([state.data])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("opacity", 0), // start them off as opacity 0 and fade them in
      update => update, // pass through the update selection
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc(d))
    );


  const areaFunc = d3
    .area()
    .x(d => {
      return xScale(d.DATE);
    })
    .y0(d => {
      return height - margin.bottom;
    })
    .y1(d => {
      return yScale(d[state.selection]);
    });
  console.log(state.selection);
  svg
    .selectAll(`path.area`)
    .data([state.data])
    .join(
      enter => enter.append("path").attr("fill-opacity", 0),
      update => update,
      exit => exit.remove()
    )
    .call(selection => {
      selection
        .transition()
        .duration(1000)
        .attr("fill-opacity", 1)
        .attr("stroke", "none")
        .attr("class", d => {
          return `area ${state.selection}`;
        })
        .attr("d", d => {
          return areaFunc(d);
        });
    });
}

loadData();
