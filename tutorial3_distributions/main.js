/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 150, bottom: 150, left: 250, right: 150 },
  radius = 5;

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let xScale;
let yScale;

/**
 * APPLICATION STATE
 * */
let state = {
  data: [],
  selectedTimePeriod: "2012-2016"
};

/**
 * LOAD DATA
 * */
d3.csv("median_household_income_by_race.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */

function init() {
  const xDomain = Math.max(...state.data.map(d => d.United_States));
  console.log("x", xDomain);
  // SCALES
  xScale = d3
    .scaleLinear()
    .domain([0, xDomain])
    .range([margin.left, width - margin.right]);

  console.log(xScale);
  window.xScale = xScale;

  yScale = d3
    .scaleBand()
    .domain([...new Set(state.data.map(d => d.Race))])
    .range([height - margin.bottom, margin.top]);

  // AXES
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // UI ELEMENT SETUP
  // add dropdown (HTML selection) for interaction
  // HTML select reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
  const selectElement = d3.select("#dropdown").on("change", function() {
    console.log("new year range", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedTimePeriod = this.value;
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  const options = [...new Set(state.data.map(d => d.Time_Period))];
  console.log("options", options);
  selectElement
    .selectAll("option")
    .data(options) // unique data values-- (hint: to do this programmatically take a look `Sets`)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the xAxis(CANNOT GET LABELS WORKING - TODO)
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Amount");

  // add the yAxis
  const dx = margin.left - 20;
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", -dx)
    .attr("writing-mode", "vertical-rl")
    .text("Race");

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // filter the data for the selectedTimePeriod
  let filteredData = state.data;
  console.log("filter,", filteredData);
  // if there is a selectedTimePeriod, filter the data before mapping it to our elements
  if (state.selectedTimePeriod !== "All") {
    filteredData = state.data.filter(
      d => d.Time_Period === state.selectedTimePeriod
    );
  }

  console.log(filteredData);
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.Time_Period) // use `d.name` as the `key` to match between HTML and data elements
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.5)
          .attr("fill", d => {
            //if I had time, i'd color code
            switch (d.Race) {
              case "White_alone,_NH":
                return "orange";
              case "Two_or_more_races":
                return "green";
              case "Some_other_race_alone":
                return "red";
              case "Hawaiian_and_Other_Pacific_Islander":
                return "purple";
              case "Hispanic_or_Latino":
                return "blue";
              case "Black_or_African_American_alone":
                return "brown";
              case "Asian_Alone":
                return "yellow";
              case "American_Indian_and_Alaskan_Native":
                return "#A5F2F3";
              default:
                return "purple";
            }
          })
          .attr("r", d => 10)
          .attr("cy", (d, i) => yScale(d.Race))
          .attr("cx", d => margin.left) // initial value - to be transitioned
          .call(
            enter =>
              enter
                .transition() // initialize transition
                .delay((d, i) => 500 * i+1) // delay on each element
                .duration(500) // duration 500ms
                .attr("cx", (d, i) => xScale(d.United_States)) //If I had more time I'd make this calculate the minimum radius
          ),
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(250)
            .attr("stroke", "black")
            .transition()
            .duration(250)
            .attr("stroke", "lightgrey")
        ),
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .delay((d, i) => 50 * i)
            .duration(500)
            .attr("cx", d => d.United_States / 2000)
            .remove()
        )
    );
}
