import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import progress from "rollup-plugin-progress";
import sucrase from "@rollup/plugin-sucrase";

import fs from "fs";
import path from "path";
import visualizer from "rollup-plugin-visualizer";

const packageJson = require("./package.json");

if (process.versions.node?.split(".")[0] < 15){
  throw new Error(`Please upgrade your node version.\nThe build process requires a minimum node version of v15.x.x\n\nCurrent version: v${process.versions.node}\n`)
}

let inputFiles = {}
let packageExports = {};
function getInputFiles(dir, maxDepth, curDepth=0){
  if (curDepth > maxDepth) return

  fs.readdirSync(dir).forEach(file => {
		const filePath = path.join(dir, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory()) {
			getInputFiles(filePath, maxDepth, curDepth + 1)
		} else if (file === 'index.ts' || file === 'index.js') {
      const outputKey = path.dirname(filePath).slice(4)
      const inputKey = `${outputKey}${outputKey.length > 0 ? "\\":""}`
      const exportKey = `./${outputKey}`.replaceAll("\\","/")
			inputFiles[inputKey+"index"] = filePath
      packageExports[exportKey === "./" ? "." : exportKey] = {
        "types":`./dist/esm/${inputKey}index.d.ts`.replaceAll("\\","/"),
        "default":`./dist/esm/${inputKey}index.js`.replaceAll("\\","/")
      }
		}
	})
}

getInputFiles('src',2);
fs.writeFileSync("./package.json", JSON.stringify({...packageJson, exports: packageExports}, null, 1)+"\n")

console.log(path.resolve(packageJson.main, ".."));

export default [
  {
    input:{
      ...inputFiles
    },
    output:[
      {
        dir: path.resolve(packageJson.main,".."),
        format:"cjs",
        sourcemap: true
      },
      {
        dir: path.resolve(packageJson.module,".."),
        format:"esm",
        sourcemap: true
      }
    ],
    plugins:[
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig:"./tsconfig.json" }),
      sucrase({
        exclude:["node_modules/**"],
        transforms:["typescript","jsx"]
      }),
      terser(),
      progress(),
      visualizer(),
    ],
    external: ["react","react-dom","@emotion/react"]
  },
  {
    input:"dist/esm/index.d.ts",
    output:[ { file: "dist/index.d.ts", format:"esm" }],
    plugins:[dts(),progress(),]
  }
]