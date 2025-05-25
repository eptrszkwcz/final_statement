// Refactored script.js with centralized groupConfig

const numCols = 25;
const size = 20;
const padding = 3;
const groupGap = 20;
const leftMargin = 140;
const rightMargin = size + (2*padding);
const botMargin = size + (2*padding);

const svg = d3.select("#grid");
let originalData = [];
let currentData = [];
let currentColorBy = "none";
let currentOrderBy = "none";

const groupConfig = {
  age: {
    order: [0,1,2,3,4],
    labelMap: { 0: "20s", 1: "30s", 2: "40s", 3: "50s", 4: "60s" },
    colorScale: d3.scaleOrdinal().domain([0,1,2,3,4]).range(["#D4FCF7", "#96F8EC", "#81DED3", "#52D0C1", "#22C2B0", "white"]),
    title: "Inmate Age",
    accessor: d => d.ageBin
  },
  sex: {
    order: [0, 1],
    labelMap: { 0: "Male", 1: "Female" },
    colorScale: d3.scaleOrdinal().domain([0, 1]).range(["#AFEAE3", "#22C2B0"]),
    title: "Inmate Sex",
    accessor: d => d.sex
  },
  race: {
    order: [0, 1, 2, 3],
    labelMap: { 0: "Black", 1: "Hispanic", 2: "White", 3: "Other" },
    colorScale: d3.scaleOrdinal().domain([0, 1, 2, 3]).range(["#C3FAF4", "#70F5E5", "#52DECE", "#22C2B0"]),
    title: "Inmate Race",
    accessor: d => d.race
  },
  dateEx: {
    order: [0,1,2,3],
    labelMap: { 0: "1980s", 1: "1990s", 2: "2000s", 3: "2010s" },
    colorScale: d3.scaleOrdinal().domain([0,1,2,3]).range(["#C3FAF4", "#70F5E5", "#52DECE", "#22C2B0"]),
    title: "Date of Execution",
    accessor: d => d.dateBin
  },
  stmt_len: {
    order: [0,1,2,3,4],
    labelMap: {0: "No Statement", 1: "under 1 min", 2: "1-5 min", 3: "5-10 min", 4: "over 10 min"},
    colorScale: d3.scaleOrdinal().domain([0,1,2,3,4]).range(["#D4FCF7", "#96F8EC", "#81DED3", "#52D0C1", "#22C2B0"]),
    title: "Statement Duration",
    accessor: d => d.stmtBin
  },
  innocent: {
    order: [0, 1, 2],
    labelMap: { 0: "No Claim", 1: "Implicit Claim", 2: "Explicit Claim" },
    colorScale: d3.scaleOrdinal().domain([0, 1, 2]).range(["#EFEFEF", "#FFD3D3", "#F97C7C"]),
    title: "Claim of Innocence",
    accessor: d => d.innocent
  }
};

// Load and process CSV
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
      dateBin: binDate(parsedDate),
      stmt_len: d.stmt_len,
      stmtBin: binStmtLen(d.stmt_len),
      innocent: d.innocent,
      name_first: d.name_first,
      name_last: d.name_last,
      inmate_No: d.inmate_No
    };
  });
  currentData = [...originalData];
  drawGrid(currentData);
});

function binAge(age) {
  if (age >= 20 && age < 30) return 0;
  if (age >= 30 && age < 40) return 1;
  if (age >= 40 && age < 50) return 2;
  if (age >= 50 && age < 60) return 3;
  if (age >= 60 && age < 70) return 4;
  return 999;
}

function binStmtLen(stmt_len) {
  if (stmt_len == 0) return 0;
  if (stmt_len > 0 && stmt_len < 130) return 1;
  if (stmt_len >= 130 && stmt_len < 650) return 2;
  if (stmt_len >= 650 && stmt_len < 1300) return 3;
  if (stmt_len > 1300) return 4;
}

function binDate(date) {
  if (isNaN(date)) return "Unknown";
  const year = date.getFullYear();
  if (year >= 1980 && year < 1990) return 0;
  if (year >= 1990 && year < 2000) return 1;
  if (year >= 2000 && year < 2010) return 2;
  if (year >= 2010 && year < 2020) return 3;
  return 999;
}

function getColor(d) {
  if (groupConfig[currentColorBy]) {
    return groupConfig[currentColorBy].colorScale(groupConfig[currentColorBy].accessor(d));
  }
  return "#52D0C1"; // default
}

function computeGroupedPositions(data, groupKey) {
  const config = groupConfig[groupKey];
  const groups = d3.group(data, config.accessor);

  let positioned = [];
  let labels = [];
  let countLabels = [];
  let yOffset = 0;

  config.order.forEach(groupValue => {
    let groupItems = groups.get(groupValue) || [];

    // 🟡 Sort within group by currentColorBy
    if (groupConfig[currentColorBy]) {
      const colorAccessor = groupConfig[currentColorBy].accessor;
      groupItems.sort((a, b) => d3.ascending(colorAccessor(a), colorAccessor(b)));
    }

    groupItems.forEach((d, i) => {
      const x = (i % numCols) * (size + padding) + leftMargin;
      const y = Math.floor(i / numCols) * (size + padding) + yOffset;
      positioned.push({ ...d, x, y });
    });

    const groupRows = Math.ceil(groupItems.length / numCols);
    const groupHeight = groupRows * (size + padding);
    const labelY = yOffset + groupHeight / 2;

    labels.push({ groupValue, y: labelY });

    // 🟠 Compute count or percentage
    let labelText = "";
    let fillColor = "#5e5e5e";
    let fontWeight = "700";

    if (currentColorBy === "innocent") {
      const total = groupItems.length;
      const explicitCount = groupItems.filter(d => d.innocent === 2).length;
      const percent = total > 0 ? Math.round((explicitCount / total) * 100) : 0;
      labelText = `${percent}%`;
      fillColor = "#F97C7C";
      fontWeight = "900";
    } else {
      labelText = groupItems.length;
    }

    const countX = (groupItems.length % numCols) * (size + padding) + leftMargin + size / 2;
    const countY = Math.floor(groupItems.length / numCols) * (size + padding) + yOffset + size / 2;

    if (groupItems.length > 0) {
      countLabels.push({
        groupValue,
        labelText,
        x: countX,
        y: countY,
        fillColor,
        fontWeight
      });
    }

    yOffset += groupHeight + groupGap;
  });

  return { positioned, labels, countLabels };
}

function drawGrid(data) {
  let positionedData, labelData, countLabelData;

  if (groupConfig[currentOrderBy]) {
    const result = computeGroupedPositions(data, currentOrderBy);
    positionedData = result.positioned;
    labelData = result.labels;
    countLabelData = result.countLabels;
  } else {
    positionedData = data.map((d, i) => ({
      ...d,
      x: (i % numCols) * (size + padding) + leftMargin,
      y: Math.floor(i / numCols) * (size + padding)
    }));
    labelData = [];
    countLabelData = [];
  }

  const svgWidth = d3.max(positionedData, d => d.x) + size + rightMargin;
  const svgHeight = d3.max(positionedData, d => d.y) + size + botMargin;
  svg.attr("width", svgWidth).attr("height", svgHeight);

  // --- Grid Rects ---
  const rects = svg.selectAll("rect").data(positionedData, d => d.id);

  rects.enter()
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("fill", d => getColor(d));

  // const rects = svg.selectAll("rect").data(positionedData, d => d.id);

  // rects.enter()
  //   .append("rect")
  //   .attr("width", size)
  //   .attr("height", size)
  //   .attr("x", d => d.x)
  //   .attr("y", d => d.y)
  //   .attr("fill", d => getColor(d))
  //   .attr("stroke", "none")
  //   .on("mouseover", function (event, d) {
  //     d3.select(this)
  //       .attr("stroke", "red")
  //       .attr("stroke-width", 2);

  //     d3.select("#tooltip")
  //       .style("display", "block")
  //       .html(`
  //         <strong>${d.name_first} ${d.name_last}</strong><br>
  //         Inmate No: ${d.inmate_No}<br>
  //         Age: ${d.age}
  //       `);
  //   })
  //   .on("mousemove", function (event) {
  //     d3.select("#tooltip")
  //       .style("left", (event.pageX + 12) + "px")
  //       .style("top", (event.pageY + 12) + "px");
  //   })
  //   .on("mouseout", function () {
  //     d3.select(this)
  //       .attr("stroke", "none");

  //     d3.select("#tooltip").style("display", "none");
  //   });


  rects.merge(rects).each(function (d) {
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

  svg.selectAll(".group-label").remove();
  svg.selectAll(".group-label")
    .data(labelData)
    .enter()
    .append("text")
    .attr("class", "group-label")
    .attr("x", 124)
    .attr("y", d => d.y + 7)
    .attr("text-anchor", "end")
    .style("font-family", "Inter, sans-serif")
    .style("font-weight", "100")
    // .style("font-size", "22px")
    .style("font-size", "20px")
    .style("fill", "black")
    .style("opacity", 0.5)
    .text(d => groupConfig[currentOrderBy]?.labelMap?.[d.groupValue] || d.groupValue);

  svg.selectAll(".group-count").remove();
  svg.selectAll(".group-count")
    .data(countLabelData)
    .enter()
    .append("text")
    .attr("class", "group-count")
    .attr("x", d => d.x - 7)
    .attr("y", d => d.y + 2)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle")
    .style("font-family", "Inter, sans-serif")
    .style("font-weight", d => d.fontWeight || "500")
    .style("font-size", "15px")
    .style("opacity", 1)
    .text(d => d.labelText)
    .style("fill", d => d.fillColor);
}

// Dropdown behavior
document.querySelectorAll(".dropdown-button").forEach(button => {
  button.addEventListener("click", () => {
    const dropdown = button.parentElement;
    dropdown.classList.toggle("open");
    const icon = button.querySelector(".icon");
    icon.classList.toggle("rotated");
  });
});

document.querySelectorAll("#dropdownContent-order div").forEach(option => {
  option.addEventListener("click", () => {
    currentOrderBy = option.getAttribute("value");
    currentColorBy = currentOrderBy; // Automatically sync color
    document.querySelector("#dropdownButton-order > div").textContent = option.textContent;
    document.getElementById("dropdown-order").classList.remove("open");
    document.querySelector("#dropdownButton-order .icon").classList.remove("rotated");

    // Sync color dropdown label
    const colorLabel = document.querySelector(`#dropdownContent-color div[value="${currentColorBy}"]`)?.textContent;
    if (colorLabel) {
      document.querySelector("#dropdownButton-color > div").textContent = colorLabel;
    }

    updateGridTitle(currentOrderBy);
    drawLegend(currentColorBy);
    drawGrid([...originalData]);
  });
});

document.querySelectorAll("#dropdownContent-color div").forEach(option => {
  option.addEventListener("click", () => {
    currentColorBy = option.getAttribute("value");
    document.querySelector("#dropdownButton-color > div").textContent = option.textContent;
    document.getElementById("dropdown-color").classList.remove("open");
    document.querySelector("#dropdownButton-color .icon").classList.remove("rotated");
    drawLegend(currentColorBy);
    drawGrid(currentData);
  });
});


function updateGridTitle(orderBy) {
  document.getElementById("grid-title-id").textContent = groupConfig[orderBy]?.title || "";
}

function drawLegend(colorKey) {
  const container = d3.select("#color-by-legend");
  container.selectAll("svg").remove(); // Clear previous legend

  if (!groupConfig[colorKey]) return;


  const config = groupConfig[colorKey];
  // console.log(config.title)
  const width = 400;
  const itemHeight = 28;
  const padding = 8;
  const items = config.order.map(v => ({
    value: v,
    label: config.labelMap[v],
    color: config.colorScale(v)
  }));

  document.getElementById("legend-title-id").textContent = config.title;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", items.length * itemHeight + padding);

  const legendItem = svg.selectAll(".legend-item")
    .data(items)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * itemHeight})`);

  legendItem.append("rect")
    .attr("x", 0)
    .attr("y", 4)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => d.color);
    // .attr("stroke", "#ccc")
    // .attr("stroke-width", 0.5);

  legendItem.append("text")
    .attr("x", 26)
    .attr("y", 16)
    .text(d => d.label)
    .style("font-family", "Inter, sans-serif")
    .style("font-size", "14px")
    .style("fill", "#5e5e5e")
    .style("alignment-baseline", "middle");
}


