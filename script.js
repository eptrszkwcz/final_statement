const numCols = 25;
const size = 20;
const padding = 3;
const groupGap = 20;
const leftMargin = 140;

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

function binDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "Unknown"; // Handle invalid dates safely

  const year = date.getFullYear();
  if (year >= 1980 && year < 1990) return "1980s";
  if (year >= 1990 && year < 2000) return "1990s";
  if (year >= 2000 && year < 2010) return "2000s";
  if (year >= 2010 && year < 2020) return "2010s";
  return "Unknown";
}

const groupLabelMap = {
  sex: {
    0: "Male",
    1: "Female"
  },
  race: {
    0: "Black",
    1: "White",
    2: "Hispanic",
    3: "Other"
  },
  age: {
    "20s": "20s",
    "30s": "30s",
    "40s": "40s",
    "50s": "50s",
    "60s": "60s",
    "70s": "70s"
  },
  dateEx: {
    "1980s": "1980s",
    "1990s": "1990s",
    "2000s": "2000s",
    "2010s": "2010s"
  }
};


function getColor(d) {
  if (currentColorBy === "age") {
    const scale = d3.scaleOrdinal()
      .domain(["20s", "30s", "40s", "50s", "60s", "70s"])
      .range(["#D4FCF7", "#96F8EC", "#81DED3", "#52D0C1", "#22C2B0", "white"]);
    return scale(d.ageBin);
  } else if (currentColorBy === "sex") {
    return d.sex === 1 ? "#22C2B0" : "#AFEAE3";
  } else if (currentColorBy === "race") {
    const raceColors = {
      0: "#C3FAF4",
      1: "#70F5E5",
      2: "#52DECE",
      3: "#22C2B0"
    };
    return raceColors[d.race] || "gray";
  } else if (currentColorBy === "dateEx") {
    const scale = d3.scaleOrdinal()
      .domain(["1980s", "1990s", "2000s", "2010s"])
      .range(["#C3FAF4", "#70F5E5", "#52DECE", "#22C2B0"]);
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
  let labels = [];
  let yOffset = 0;

  orderedGroups.forEach(groupValue => {
    const groupItems = groups.get(groupValue) || [];
    groupItems.sort((a, b) => {
      const colorKey = currentColorBy === "age" ? a.ageBin.localeCompare(b.ageBin)
                       : currentColorBy === "sex" || currentColorBy === "race" ? a[currentColorBy] - b[currentColorBy]
                       : 0;
      return colorKey;
    });

    // Position items
    groupItems.forEach((d, i) => {
      const x = (i % numCols) * (size + padding) + leftMargin;
      const y = Math.floor(i / numCols) * (size + padding) + yOffset;
      positioned.push({ ...d, x, y });
    });

    // Add label metadata
    labels.push({
      groupValue,
      y: yOffset + 18 // Adjust vertically as needed
    });

    // Update yOffset for next group
    const groupRows = Math.ceil(groupItems.length / numCols);
    const groupHeight = groupRows * (size + padding);
    yOffset += groupHeight + groupGap;
  });

  return { positioned, labels };
}

function drawGrid(data) {
  let positionedData, labelData;

  if (["age", "sex", "race", "dateEx"].includes(currentOrderBy)) {
    const result = computeGroupedPositions(data, currentOrderBy);
    positionedData = result.positioned;
    labelData = result.labels;
  } else {
    positionedData = data.map((d, i) => ({
      ...d,
      x: (i % numCols) * (size + padding) + leftMargin,
      y: Math.floor(i / numCols) * (size + padding)
    }));
    labelData = [];
  }

  const svgWidth = d3.max(positionedData, d => d.x) + size;
  const svgHeight = d3.max(positionedData, d => d.y) + size;
  svg.attr("width", svgWidth).attr("height", svgHeight);

  const rects = svg.selectAll("rect")
    .data(positionedData, d => d.id);

  rects.enter()
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    // .attr("stroke", "#ccc")
    // .attr("stroke-width", 1)
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

  // Clear old labels
  svg.selectAll(".group-label").remove();

  // Render new group labels
  const groupLabelMap = {
    sex: { 0: "Male", 1: "Female" },
    race: { 0: "Black", 1: "White", 2: "Hispanic", 3: "Other" },
    age: { "20s": "20s", "30s": "30s", "40s": "40s", "50s": "50s", "60s": "60s", "70s": "70s" },
    dateEx: { "1980s": "1980s", "1990s": "1990s", "2000s": "2000s", "2010s": "2010s" }
  };

  console.log(labelData)

  svg.selectAll(".group-label")
    .data(labelData)
    .enter()
    .append("text")
    .attr("class", "group-label")
    .attr("x", 120)
    .attr("y", d => d.y)
    .attr("text-anchor", "end")
    // .text("FUNN")
    .text(d => groupLabelMap[currentOrderBy]?.[d.groupValue] || d.groupValue);
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



