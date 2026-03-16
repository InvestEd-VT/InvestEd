import { shadcnPreset } from "shadcn-ui";

export default {
  presets: [shadcnPreset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ⭐ REQUIRED FOR TAILWIND V4 + NOVA
  tailwindcss: {
    config: {
      darkMode: "class",
    },
  },
};
