// import { groupConfig } from "./config.js";
import { binAge, binStmtLen, binDate } from './data.js';
import { drawGrid, drawLegend, updateGridTitle} from './chart.js';

let originalData = [];
let currentData = [];
export let currentColorBy = "none";
export let currentOrderBy = "none";

// Load and process CSV
d3.csv("/data/data_1019_update.csv", d3.autoType).then(raw => {
  originalData = raw.slice(0, 544).map((d, i) => {
    const parsedDate = new Date(d.dateEx);
    return {
      id: i,
      No: d.No,
      age: d.age,
      ageBin: binAge(d.age),
      sex: d.sex,
      race: d.race,
      dateEx: d.dateEx,
      dateBin: binDate(parsedDate),
      stmt_len: d.stmt_len,
      stmtBin: binStmtLen(d.stmt_len, d.Statement),
      innocent: d.innocent,
      name_first: d.name_first,
      name_last: d.name_last,
      inmate_No: d.inmate_No,
      statement: d.Statement,
      county: d.Country
    };
  });
  currentData = [...originalData];
  preloadImages(currentData)
  drawGrid(currentData);
});

function preloadImages(data) {
  data.forEach(d => {
    const img = new Image();
    img.src = `/assets/images/square-small/${d.No}-sm.jpg`;
  });
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

// Close button behavior
document.getElementById("pop-close-button-id").addEventListener("click", () => {
  document.querySelector(".statement-pop").style.display = "none";
  document.querySelector(".statement-pop-blanket").style.display = "none";
});



