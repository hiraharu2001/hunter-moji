import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	// ja: GitHub Pages（https://<user>.github.io/hunter-moji/）配下で配信するため
	base: "/hunter-moji/",
	plugins: [react()],
	test: {
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});
