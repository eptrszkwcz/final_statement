const numCols = 25;
const size = 28;
const padding = 4;
const groupGap = 28;

const svg = d3.select("#grid");
let originalData = [];
let currentData = [];
let currentColorBy = "age";
let currentOrderBy = "none";

const groupOrder = {
  age: ["20s", "30s", "40s", "50s", "60s", "70s"],
  sex: [0, 1],
  race: [0, 1, 2, 3],
  dateEx: ["1980s", "1990s", "2000s", "2010s"]
};

d3.csv("/data/data_1019_update.csv", d3.autoType).then(raw => {
  originalData = raw.slice(0, 544).map((d, i) => {
    const parsedDate = new Date(d.dateEx);
    return {
      id: i,
      age: d.age,
      ageBin: binAge(d.age),
      sex: d.sex,
      race: d.race,
      dateEx: d.dateEx,
      dateBin: binDate(parsedDate)
    };
  });
  currentData = [...originalData];
  drawGrid(currentData);
});

function binAge(age) {
  if (age >= 20 && age < 30) return "20s";
  if (age >= 30 && age < 40) return "30s";
  if (age >= 40 && age < 50) return "40s";
  if (age >= 50 && age < 60) return "50s";
  if (age >= 60 && age < 70) return "60s";
  return "70s";
}

function binDate(date) {
  const year = date.getFullYear();
  if (year >= 1980 && year < 1990) return "1980s";
  if (year >= 1990 && year < 2000) return "1990s";
  if (year >= 2000 && year < 2010) return "2000s";
  return "2010s";
}

function getColor(d) {
  if (currentColorBy === "age") {
    const scale = d3.scaleOrdinal()
      .domain(["20s", "30s", "40s", "50s", "60s", "70s"])
      .range(["#377e22", "#518e40", "#80ad74", "#b3cfad", "#d3f9d8", "white"]);
    return scale(d.ageBin);
  } else if (currentColorBy === "sex") {
    return d.sex === 1 ? "green" : "white";
  } else if (currentColorBy === "race") {
    return d3.interpolateRgb("white", "green")(d.race / 3);
  } else if (currentColorBy === "dateEx") {
    const scale = d3.scaleOrdinal()
      .domain(["1980s", "1990s", "2000s", "2010s"])
      .range(["#377e22", "#80ad74", "#b3cfad", "white"]);
    return scale(d.dateBin);
  }
  return "gray";
}

function computeGroupedPositions(data, groupKey) {
  const groups = d3.group(data, d => {
    if (groupKey === "age") return d.ageBin;
    if (groupKey === "dateEx") return d.dateBin;
    return d[groupKey];
  });

  const orderedGroups = groupOrder[groupKey];
  let positioned = [];
  let yOffset = 0;

  orderedGroups.forEach(groupValue => {
    const groupItems = groups.get(groupValue) || [];
    groupItems.forEach((d, i) => {
      const x = (i % numCols) * (size + padding);
      const y = Math.floor(i / numCols) * (size + padding) + yOffset;
      positioned.push({ ...d, x, y });
    });

    const groupRows = Math.ceil(groupItems.length / numCols);
    const groupHeight = groupRows * (size + padding);
    yOffset += groupHeight + groupGap;
  });

  return positioned;
}

function drawGrid(data) {
  let positioned;

  if (["age", "sex", "race", "dateEx"].includes(currentOrderBy)) {
    positioned = computeGroupedPositions(data, currentOrderBy);
  } else {
    positioned = data.map((d, i) => ({
      ...d,
      x: (i % numCols) * (size + padding),
      y: Math.floor(i / numCols) * (size + padding)
    }));
  }

  const svgWidth = d3.max(positioned, d => d.x) + size;
  const svgHeight = d3.max(positioned, d => d.y) + size;
  svg.attr("width", svgWidth).attr("height", svgHeight);

  const rects = svg.selectAll("rect")
    .data(positioned, d => d.id);

  rects.enter()
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("fill", d => getColor(d));

  rects.merge(rects)
    .each(function (d) {
      gsap.to(this, {
        attr: {
          x: d.x,
          y: d.y,
          fill: getColor(d)
        },
        duration: 0.6,
        ease: "none"
      });
    });
}

document.getElementById("orderSelect").addEventListener("change", e => {
  currentOrderBy = e.target.value;
  currentData = [...originalData];
  drawGrid(currentData);
});

document.getElementById("colorSelect").addEventListener("change", e => {
  currentColorBy = e.target.value;
  drawGrid(currentData);
});



// const numCols = 25;
// const size = 28;
// const padding = 4;
// const groupGap = 28;

// const svg = d3.select("#grid");
// let originalData = [];
// let currentData = [];
// let currentColorBy = "age";
// let currentOrderBy = "none";

// const groupOrder = {
//   age: ["20s", "30s", "40s", "50s", "60s", "70s"],
//   sex: [0, 1],
//   race: [0, 1, 2, 3]
// };

// d3.csv("/data/data_1019_update.csv", d3.autoType).then(raw => {
//   originalData = raw.slice(0, 544).map((d, i) => ({
//     id: i,
//     age: d.age,
//     ageBin: binAge(d.age),
//     sex: d.sex,
//     race: d.race,
//     dateEx: d.dateEx
//   }));
//   currentData = [...originalData];
//   drawGrid(currentData);
// });

// function binAge(age) {
//   if (age >= 20 && age < 30) return "20s";
//   if (age >= 30 && age < 40) return "30s";
//   if (age >= 40 && age < 50) return "40s";
//   if (age >= 50 && age < 60) return "50s";
//   if (age >= 60 && age < 70) return "60s";
//   return "70s";
// }

// function getColor(d) {
//   if (currentColorBy === "age") {
//     const ageBin = d.ageBin;
//     const scale = d3.scaleOrdinal()
//       .domain(["20s", "30s", "40s", "50s", "60s"])
//       .range(["#377e22", "#518e40", "#80ad74", "#b3cfad", "white"]);
//     return scale(ageBin);
//   } else if (currentColorBy === "sex") {
//     return d.sex === 1 ? "green" : "white";
//   } else if (currentColorBy === "race") {
//     return d3.interpolateRgb("white", "green")(d.race / 3);
//   }
//   return "gray";
// }

// function computeGroupedPositions(data, groupKey) {
//   const groups = d3.group(data, d => {
//     if (groupKey === "age") return d.ageBin;
//     return d[groupKey];
//   });

//   const orderedGroups = groupOrder[groupKey];
//   let positioned = [];
//   let xOffset = 0;
//   let yOffset = 0;

//   orderedGroups.forEach(groupValue => {
//     const groupItems = groups.get(groupValue) || [];
//     groupItems.forEach((d, i) => {
//       const x = (i % numCols) * (size + padding);
//       // const x = (i % numCols) * (size + padding) + xOffset;
//       const y = Math.floor(i / numCols) * (size + padding) + yOffset;
//       // onst y = Math.floor(i / numCols) * (size + padding);
//       positioned.push({ ...d, x, y });
//     });

//     const groupCols = numCols;
//     const groupRows = Math.ceil(groupItems.length / numCols);
//     const groupWidth = groupCols * (size + padding);
//     const groupHeight = groupRows * (size + padding);
//     yOffset += groupHeight + groupGap;
//     xOffset += groupWidth + groupGap;
//   });

//   return positioned;
// }

// function drawGrid(data) {
//   let positioned;

//   if (["age", "sex", "race"].includes(currentOrderBy)) {
//     positioned = computeGroupedPositions(data, currentOrderBy);
//   } else {
//     positioned = data.map((d, i) => ({
//       ...d,
//       x: (i % numCols) * (size + padding),
//       y: Math.floor(i / numCols) * (size + padding)
//     }));
//   }

//   const svgWidth = d3.max(positioned, d => d.x) + size;
//   const svgHeight = d3.max(positioned, d => d.y) + size;
//   svg.attr("width", svgWidth).attr("height", svgHeight);

//   const rects = svg.selectAll("rect")
//     .data(positioned, d => d.id);

//   rects.enter()
//     .append("rect")
//     .attr("width", size)
//     .attr("height", size)
//     .attr("stroke", "#ccc")
//     .attr("stroke-width", 1)
//     .attr("x", d => d.x)
//     .attr("y", d => d.y)
//     .attr("fill", d => getColor(d));

//   rects.merge(rects)
//     .each(function (d) {
//       gsap.to(this, {
//         attr: {
//           x: d.x,
//           y: d.y,
//           fill: getColor(d)
//         },
//         duration: 0.6,
//         ease: "none"
//       });
//     });
// }

// document.getElementById("orderSelect").addEventListener("change", e => {
//   currentOrderBy = e.target.value;
//   currentData = [...originalData];

//   if (currentOrderBy === "dateEx") {
//     currentData.sort((a, b) => new Date(a.dateEx) - new Date(b.dateEx));
//   }

//   drawGrid(currentData);
// });

// document.getElementById("colorSelect").addEventListener("change", e => {
//   currentColorBy = e.target.value;
//   drawGrid(currentData);
// });
