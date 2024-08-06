const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/autoSniper.ts", "./src/singleSniper.ts"], // Your main entry point
    outdir: "dist", // Output file
    bundle: true, // Bundle dependencies
    minify: true, // Minify for production
    platform: "node", // Target Node.js runtime
    target: "node16", // Node version compatibility
  })
  .catch(() => process.exit(1));
