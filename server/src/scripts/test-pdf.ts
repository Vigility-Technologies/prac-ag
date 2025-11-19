const pdf = require("pdf-parse");

async function test() {
  try {
    const buffer = Buffer.from("Test PDF content");
    // This will likely fail to parse as it's not a real PDF, but it confirms the module loads
    console.log("pdf-parse module loaded successfully");
  } catch (e) {
    console.error("Error:", e);
  }
}

test();

export {};
