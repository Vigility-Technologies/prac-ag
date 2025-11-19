const pdf = require("pdf-parse");

console.log("Type of pdf:", typeof pdf);
console.log("Is pdf a function?", typeof pdf === "function");
console.log("Keys of pdf:", Object.keys(pdf));
console.log("pdf export:", pdf);

if (typeof pdf !== "function" && typeof pdf.default === "function") {
  console.log("pdf.default is a function");
}
