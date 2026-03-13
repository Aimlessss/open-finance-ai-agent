import fs from "fs";
import path from "path";

const chunkDir = path.resolve("../../../data/chunks");

const files = fs.readdirSync(chunkDir);

let allChunks = [];

files.forEach(file => {

  if (!file.endsWith(".json")) return;

  const data = JSON.parse(
    fs.readFileSync(path.join(chunkDir, file))
  );

  allChunks = allChunks.concat(data);

});

fs.writeFileSync(
  "../../../data/all-chunks.json",
  JSON.stringify(allChunks, null, 2)
);

console.log("Total chunks:", allChunks.length);