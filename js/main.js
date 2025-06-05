// import { groupConfig } from "./config.js";
import { binAge, binStmtLen, binDate } from './data.js';
import { drawGrid, drawGrid_sequence, manual_stmt_pop, drawLegend, updateGridTitle} from './chart.js';

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



// SCROLL FUNCTIONALITY HERE 

const steps = document.querySelectorAll(".scroll-step");

const stepActions = {
  "photo": () => {
    document.querySelector(".controls").style.opacity = 0;
    document.querySelector(".legend-container").style.opacity = 0;
    document.querySelector(".grid-title").style.opacity = 0;
    currentOrderBy = "none";
    currentColorBy = "photo";
    drawGrid(currentData)
  },
  "grid_plane": () => {
    currentOrderBy = "none";
    currentColorBy = "none";
    drawGrid_sequence(currentData)
    document.querySelector(".statement-pop").style.display = "none";
    document.querySelector(".statement-pop-blanket").style.display = "none";
  },
  "statement": () => {
    document.querySelector(".legend-container").style.opacity = 0;
    document.querySelector(".grid-title").style.opacity = 0;
    const man_pop = currentData.find(d => d.name_first === "Preston" && d.name_last === "Hughes");
    manual_stmt_pop(man_pop);
  },
  "inn": () => {
    document.querySelector(".statement-pop").style.display = "none";
    document.querySelector(".statement-pop-blanket").style.display = "none";
    document.querySelector(".legend-container").style.opacity = 1;
    document.querySelector(".grid-title").style.opacity = 1;
    currentOrderBy = "innocent";
    currentColorBy = "innocent";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "date-ex": () => {
    currentOrderBy = "dateEx";
    currentColorBy = "dateEx";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "date-ex inn": () => {
    currentOrderBy = "dateEx";
    currentColorBy = "innocent";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "age": () => {
    currentOrderBy = "age";
    currentColorBy = "age";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "age inn": () => {
    currentOrderBy = "age";
    currentColorBy = "innocent";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "sex": () => {
    currentOrderBy = "sex";
    currentColorBy = "sex";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "sex inn": () => {
    currentOrderBy = "sex";
    currentColorBy = "innocent";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "stmt_len": () => {
    currentOrderBy = "stmt_len";
    currentColorBy = "stmt_len";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "stmt_len inn": () => {
    document.querySelector(".legend-container").style.opacity = 1;
    document.querySelector(".grid-title").style.opacity = 1;
    currentOrderBy = "stmt_len";
    currentColorBy = "innocent";
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "inn photo": () => {
    document.querySelector(".legend-container").style.opacity = 0;
    document.querySelector(".grid-title").style.opacity = 0;
    currentOrderBy = "innocent";
    currentColorBy = "photo";
    document.querySelector(".controls").style.opacity = 0;
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  },
  "explore": () => {
    document.querySelector(".legend-container").style.opacity = 1;
    document.querySelector(".grid-title").style.opacity = 1;
    currentOrderBy = "innocent";
    currentColorBy = "innocent";
    document.querySelector(".controls").style.opacity = 1;
    document.querySelector(".controls").style.zIndex = 2000;
    document.querySelector(".statement-pop-blanket").style.zIndex = 2001;
    document.querySelector(".statement-pop").style.zIndex = 2002;
    drawLegend(currentColorBy)
    updateGridTitle(currentOrderBy)
    drawGrid(currentData)
  }
};

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepIndex = entry.target.dataset.step;
        if (stepActions[stepIndex]) stepActions[stepIndex]();
      }
    });
  },
  { threshold: 0.5 }
);

steps.forEach(step => observer.observe(step));


document.querySelector('.scroll-step').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents triggering anything on the overlay
  // Optionally, forward the click manually
  const below = document.elementFromPoint(e.clientX, e.clientY);
  if (below) below.click();
});


