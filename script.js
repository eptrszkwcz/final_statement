const svg = d3.select("svg");
const numCols = 32;
const numRows = 17;
const totalCells = numCols * numRows;
const size = 28; // grid square size
const padding = 4;

// Color scale from green (age 10) to white (age 80)
const colorScale = d3.scaleLinear()
  .domain([30, 60])
  .range(["green", "white"]);

let data = [];

// Load CSV
d3.csv("/data/1019_2.csv", d3.autoType).then(rawData => {
  // Limit to first 544 entries
  data = rawData.slice(0, totalCells).map((d, i) => ({
    id: i,
    age: d.Age
  }));

  drawGrid(data);
});

function computeGridPositions(data) {
  return data.map((d, i) => ({
    ...d,
    x: (i % numCols) * (size + padding),
    y: Math.floor(i / numCols) * (size + padding)
  }));
}

function drawGrid(data) {
  const positioned = computeGridPositions(data);

  const rects = svg.selectAll("rect")
    .data(positioned, d => d.id);

  // Enter
  rects.enter()
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("fill", d => colorScale(d.age));

  // Animate position and color updates
  rects.merge(rects)
    .each(function(d, i) {
      const target = {
        x: (i % numCols) * (size + padding),
        y: Math.floor(i / numCols) * (size + padding),
        fill: colorScale(d.age)
      };
    //   console.log(target.x,target.y)
      gsap.to(this, {
        attr: {
          x: target.x,
          y: target.y
        },
        duration: 1,
        ease: "none"
      });
    });
}
  

// Expose sorting function globally
window.sortByAge = function () {
  data.sort((a, b) => a.age - b.age);
  drawGrid(data);
};
