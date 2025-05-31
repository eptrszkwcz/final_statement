import { groupConfig } from "./config.js";
import { currentColorBy, currentOrderBy } from "./main.js";

const svg = d3.select("#grid");
svg.append("g").attr("id", "hover-overlay");
const numCols = 25;
const size = 20;
const padding = 3;
const groupGap = 20;
const leftMargin = 140;
const rightMargin = size + (2*padding);
const botMargin = size + (2*padding);

export function drawGrid(data) {
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

  const handleClick = handleClickFactory({ leftMargin, rightMargin, botMargin });
  const getColor = GetColorFactory(currentColorBy);

  const images = svg.selectAll("image").data(positionedData, d => d.id);
  const rects = svg.selectAll("rect").data(positionedData, d => d.id);


  if (currentColorBy === "photo") {
    svg.selectAll("rect").remove();
    
    const imgSelection = images.enter()
      .append("image")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", size)
      .attr("height", size)
      .attr("href", d => `/assets/images/square-small/${d.No}-sm.jpg`)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .on("click", handleClick)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .merge(images);

      imgSelection.each(function (d) {
        gsap.to(this, {
          attr: {
            x: d.x,
            y: d.y,
          },
          duration: 0.6,
          ease: "none"
        });
      });

  } else {
    if (svg.select("#hover-overlay").empty()) {
      svg.append("g").attr("id", "hover-overlay");
    }
    svg.selectAll("image").remove();
    
      rects.enter()
      .append("rect")
      .attr("width", size)
      .attr("height", size)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("fill", d => getColor(d))
      .attr("stroke", "none")
      .on("click", handleClick)
      .on("mouseover", handleMouseOver_img)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut_img)
      .merge(rects);

      rects.each(function (d) {
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


export function drawLegend(colorKey) {
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

export function updateGridTitle(orderBy) {
    document.getElementById("grid-title-id").textContent = groupConfig[orderBy]?.title || "";
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

// Hover functionality 
function handleMouseOver(event, d) {
    d3.select(event.currentTarget)
      .attr("stroke", "#5e5e5e")
      .attr("stroke-width", 2);
  
    d3.select("#tooltip")
      .style("display", "block")
      .html(`
      <div class="tooltip-header">
        <div class="tooltip-title">${d.name_first} ${d.name_last}</div>
        <div class="inmate-no">${d.inmate_No}</div>
      </div>
      <div class="divid-line" style="margin: 8px 0px;"></div> 
      <div class="tooltip-entry">
        Date of Execution <span class="entry-bold">${d.dateEx}</span>
      </div>
      <div class="tooltip-entry">
        Age at Execution <span class="entry-bold">${d.age}</span>
      </div>
      <div class="tooltip-entry" style="margin-bottom:0px">
        County <span class="entry-bold">${d.county}</span>
      </div>
      `);
}

function handleMouseOver_img(event, d) {
  // Remove any existing hover image
  svg.select("#hover-overlay").selectAll("image").remove();

  // Append new image into the overlay group (so it renders on top)
  svg.select("#hover-overlay")
    .append("image")
    .attr("class", "hover-image")
    .attr("x", d.x)
    .attr("y", d.y)
    .attr("width", size)
    .attr("height", size)
    .attr("href", `/assets/images/square-small/${d.No}-sm.jpg`)
    .attr("preserveAspectRatio", "xMidYMid slice");

  // Optional: stroke for hover effect
  d3.select(event.currentTarget)
    .attr("opacity", 0)
    .attr("stroke", "#5e5e5e")
    .attr("stroke-width", 2);

  d3.select("#tooltip")
    .style("display", "block")
    .html(`
      <div class="tooltip-header">
        <div class="tooltip-title">${d.name_first} ${d.name_last}</div>
        <div class="inmate-no">${d.inmate_No}</div>
      </div>
      <div class="divid-line" style="margin: 8px 0px;"></div> 
      <div class="tooltip-entry">
        Date of Execution <span class="entry-bold">${d.dateEx}</span>
      </div>
      <div class="tooltip-entry">
        Age at Execution <span class="entry-bold">${d.age}</span>
      </div>
      <div class="tooltip-entry" style="margin-bottom:0px">
        County <span class="entry-bold">${d.county}</span>
      </div>
    `);
}


function handleMouseMove(event) {
    d3.select("#tooltip")
      .style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY + 12) + "px");
}
  
function handleMouseOut(event) {
    d3.select(event.currentTarget)
        .attr("stroke", "none");

    d3.select("#tooltip")
        .style("display", "none");
}

function handleMouseOut_img(event, d) {
  d3.select(event.currentTarget)
    .attr("opacity", 1)
    .attr("stroke", "none");

  d3.select("#tooltip").style("display", "none");

  svg.selectAll(".hover-image").remove();
}




function handleClickFactory({leftMargin, rightMargin, botMargin}) {
    return function handleClick(event, d) {
        const svg_size = document.getElementById("grid");
        const popup = document.querySelector(".statement-pop");
        const pop_name = document.querySelector("#statement-name-id");
        const pop_no = document.querySelector("#statement-no-id");
        const pop_content = popup.querySelector(".statement-content");
        const blanket = document.querySelector(".statement-pop-blanket");
        positionPopup(popup, svg_size, leftMargin, rightMargin, botMargin);
        pop_name.textContent = `${d.name_first} ${d.name_last}`;  
        pop_no.textContent = d.inmate_No;
        pop_content.textContent = d.statement || "<em>No statement available.</em>";
        popup.style.display = "flex";
        blanket.style.display = "block";
      
        pop_content.style.alignItems = d.statement.length < 125 ? "center" : "left";
        pop_content.style.justifyContent = d.statement.length > 3000 ? "start" : "center";    
    };
}

// position the popup dynamically 
function positionPopup(popup, svg, leftMargin, rightMargin, botMargin) {
    const rect = svg.getBoundingClientRect();
  
    var computed_width = rect.width - leftMargin - rightMargin;
    var computed_height = rect.height - botMargin;
  
    popup.style.position = 'absolute';
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.top + window.scrollY}px`;
    popup.style.width = `${computed_width}px`;
    popup.style.height = `${computed_height}px`;
}

function GetColorFactory(currentColorBy) {
    return function getColor(d) {
      if (groupConfig[currentColorBy]) {
        return groupConfig[currentColorBy].colorScale(groupConfig[currentColorBy].accessor(d));
      }
      return "#52D0C1"; // default
    };
}