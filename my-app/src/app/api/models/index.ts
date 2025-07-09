// models/index.ts

const fs = require("fs");
const path = require("path");

const models: any = {};

const modelDir = path.join(__dirname, ".");

fs.readdirSync(modelDir).forEach((file: string) => {
  if (file !== "index.ts" && file.endsWith(".ts")) {
    const modelName = path.basename(file, ".ts");
    models[modelName] = require(`./${file}`);
  }
});

module.exports = models;