import Page from "@/app/dashboard/page"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
       <TooltipProvider>
        <Page />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App;
