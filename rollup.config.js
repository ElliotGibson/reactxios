import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import progress from "rollup-plugin-progress";

import visualizer from "rollup-plugin-visualizer";

const packageJson = require("./package.json");

if (process.versions.node?.split(".")[0] < 15){
  throw new Error(`Please upgrade your node version.\nThe build process requires a minimum node version of v15.x.x\n\nCurrent version: v${process.versions.node}\n`)
}

export default [
  {
    input: "./src/index.ts",
    output:[
      {
        file: packageJson.main,
        format:"cjs",
        sourcemap: true
      },
      {
        file: packageJson.module,
        format:"esm",
        sourcemap: true
      }
    ],
    plugins:[
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig:"./tsconfig.json" }),
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