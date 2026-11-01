import { execSync } from "node:child_process";
import path from "node:path";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\peter\\.gemini\\antigravity\\brain\\a1b65c35-eae4-426a-baac-adf2285321ad";

const steps = [1, 2, 3, 4];
for (const step of steps) {
  const file = path.join(outDir, `test-11-onboarding-step${step}.png`);
  const url = `http://localhost:3000/test-gallery?block=onboarding&step=${step}`;
  const cmd = `"${chrome}" --headless=new --disable-gpu --window-size=1280,1050 --screenshot="${file}" "${url}"`;
  console.log(`Capture step ${step}...`);
  execSync(cmd, { stdio: "inherit" });
}
console.log("All 4 steps captured!");
