const { spawn } = require("child_process");
const path = require("path");

process.env.NODE_ENV = "development";
const electronPath = require("electron");

const projectRoot = path.join(__dirname, "..");
const child = spawn(electronPath, [path.join(__dirname, "main.cjs")], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("close", (code) => {
  process.exit(code || 0);
});
