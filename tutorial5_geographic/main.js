/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  geojson: null,
  fires: null,
  hover: {
    latitude: null,
    longitude: null,
    state: null,
    name: null,
    type: null,
    status: null
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.json("fires.json", d3.autoType)
]).then(([geojson, fires]) => {
  state.geojson = geojson;
  const outFires = fires.fires.filter(f => f.status === "out");
  const containedFires = fires.fires.filter(f => f.status === "contained");
  const activeFires = fires.fires.filter(f => f.status === "active");
  const unknownFires = fires.fires.filter(f => f.status === "unknown");
  state.fires = { outFires, containedFires, activeFires, unknownFires };
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
async function init() {
  // our projection and path are only defined once, and we don't need to access them in the draw function,
  // so they can be locally scoped to init()
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson);
  const path = d3.geoPath().projection(projection);

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll(".state")
    // all of the features of the geojson, meaning all the states as individuals
    .data(state.geojson.features)
    .join("path")
    .attr("d", path)
    .attr("class", "state")
    .attr("fill", "transparent")
    .on("mouseover", d => {
      // when the mouse rolls over this feature, do this

      const [mx, my] = d3.mouse(svg.node());
      const proj = projection.invert([mx, my]);
      state.hover = {
        state: d.properties.NAME,
        longitude: proj[0],
        latitude: proj[1]
      };
      draw(); // re-call the draw function when we set a new hoveredState
    });

  // EXAMPLE 1: going from Lat-Long => x, y
  const { outFires, containedFires, unknownFires, activeFires } = state.fires;
  console.log(outFires);
  addCircles(svg, outFires, projection, 1000);
  addCircles(svg, unknownFires, projection, 2000);
  addCircles(svg, containedFires, projection, 3000);
  addCircles(svg, activeFires, projection, 4000);
}

function colorSelector(d) {
  switch (d.status) {
    case "active":
      return "red";
    case "contained":
      return "green";
    case "unknown":
      return "gray";
    case "out":
    default:
      return "black";
  }
}

function addCircles(svg, data, projection, delay) {
  svg
    .selectAll(`.${data[0].status}`)
    .enter()
    .data(data)
    .join("circle")
    .attr("class", d => d.status)
    .attr("fill", d => colorSelector(d))
    .attr("transform", d => {
      const [x, y] = projection([d.lon, d.lat]);
      return `translate(${x}, ${y})`;
    })
    .on("mouseover", d => {
      state.hover = {
        ...state.hover,
        name: d.name,
        type: d.type,
        status: d.status,
        near: d.geo.near,
        acres: d.acres || "unknown"
      };
      draw();
    })
    .transition()
    .delay(delay)
    .attr("r", d => {
      let acres = d.acres !== "unknown" ? d.acres : 1;
      acres = acres && acres.replace(",", "");
      acres = parseFloat(acres);
      if (isNaN(acres)) acres = 1;
      if (acres > 10) return 10;
      if (acres < 2) return 2;
      return acres;
    })
    .on("end", () => blink(data));
}

function blink(data) {
  if (data[0].status !== "active") return;
  d3.selectAll(`.active`)
    .transition()
    .duration(1000)
    .attr("fill", "orange")
    .transition()
    .duration(1000)
    .attr("fill", "red")
    .on("end", () => {
      blink(data);
    });
}
/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // return an array of [key, value] pairs
  hoverData = Object.entries(state.hover);

  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d =>
        // each d is [key, value] pair
        d[1] // check if value exist
          ? `${d[0]}: ${d[1]}` // if they do, fill them in
          : null // otherwise, show nothing
    );
}
