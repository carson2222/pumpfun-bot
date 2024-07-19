const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./index.ts"], // Your main entry point
    outfile: "dist/bot.js", // Output file
    bundle: true, // Bundle dependencies
    minify: true, // Minify for production
    platform: "node", // Target Node.js runtime
    target: "node16", // Node version compatibility
  })
  .catch(() => process.exit(1));
