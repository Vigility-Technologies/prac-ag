try {
  const pdfNode = require("pdf-parse/node");
  console.log("Require 'pdf-parse/node':");
  console.log("Type:", typeof pdfNode);
  console.log("Keys:", Object.keys(pdfNode));
  if (pdfNode.default) {
    console.log("Default export:", pdfNode.default);
  }
} catch (e) {
  console.error("Error requiring 'pdf-parse/node':", e.message);
}

try {
  const pdfMain = require("pdf-parse");
  console.log("\nRequire 'pdf-parse':");
  if (pdfMain.PDFParse) {
    console.log("Has PDFParse class");
  }
} catch (e) {
  console.error("Error requiring 'pdf-parse':", e.message);
}
