// Deployment pause switch.
// Vercel skips Git-triggered builds when this command exits with code 0.
// Remove/replace this command when automatic deployments are intentionally resumed.
console.log("Vercel Git deployments are paused during active development/testing.");
process.exit(0);
