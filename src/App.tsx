import Page from "@/app/dashboard/page"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    // <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    //   <div className="text-center">
    //     <h1 className="text-4xl font-bold text-gray-900 mb-4">InvestEd</h1>
    //     <p className="text-gray-600">Your investment education platform</p>
    //   </div>
    // </div>
    <TooltipProvider>
      <Page />
    </TooltipProvider>
  )
}

export default App;
