import { execSync } from "node:child_process";
import path from "node:path";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\peter\\.gemini\\antigravity\\brain\\a1b65c35-eae4-426a-baac-adf2285321ad";

const tabs = [
  "explodedDiagram",
  "smartRecipe",
  "billSplitter",
  "decisionMatrix",
  "tileGame",
];

for (const tab of tabs) {
  const file = path.join(outDir, `test-12-gpt6-${tab}.png`);
  const url = `http://localhost:3000/test-gallery?block=intelligentUi&iuiTab=${tab}`;
  const cmd = `"${chrome}" --headless=new --disable-gpu --window-size=1280,1050 --screenshot="${file}" "${url}"`;
  console.log(`Capture ${tab}...`);
  execSync(cmd, { stdio: "inherit" });
}
console.log("All GPT-6 Intelligent UI tabs captured!");
