export const groupConfig = {
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
      labelMap: {0: "No Statement", 1: "0-\u00BD min", 2: "\u00BD-1 min", 3: "1-5 min", 4: "Over 5 min"},
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