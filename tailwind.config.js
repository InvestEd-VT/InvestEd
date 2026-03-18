import { shadcnPreset } from "shadcn/preset";

export default {
  presets: [shadcnPreset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  tailwindcss: {
    config: {
      darkMode: "class",
    },
  },
};
