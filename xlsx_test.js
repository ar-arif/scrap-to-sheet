// Requiring the module
const XLSX = require("xlsx");

var wb = XLSX.read("./data.xlsx");
var ws = wb.Sheets[wb.SheetNames[0]];

console.log(ws);
// XLSX.utils.sheet_add_aoa(ws, [["new data", 54, 54, 45]]);
// XLSX.writeFile(wb, "./data.xlsx");
