import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import History from "./pages/History";
import Home from "./pages/Home";
import Measurements from "./pages/Measurements";
import ProductManager from "./pages/ProductManagerV2";
import ResultPreview from "./pages/ResultPreview";
import Studio from "./pages/Studio";
import BodyModel from "./pages/BodyModel";
import ReleaseControl from "./pages/ReleaseControl";
import ProductFitManager from "./pages/ProductFitManager";
import PurchaseNoticeManager from "./pages/PurchaseNoticeManager";
import QuickFit from "./pages/QuickFit";
import BrowseProducts from "./pages/BrowseProducts";
import PurchaseList from "./pages/PurchaseList";
import OperationsDashboard from "./pages/OperationsDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/studio"} component={Studio} />
      <Route path={"/quick-fit"} component={QuickFit} />
      <Route path={"/catalog"} component={BrowseProducts} />
      <Route path={"/purchase-list"} component={PurchaseList} />
      <Route path={"/body-model"} component={BodyModel} />
      <Route path={"/measurements"} component={Measurements} />
      <Route path={"/history"} component={History} />
      <Route path={"/products"} component={ProductManager} />
      <Route path={"/product-fit"} component={ProductFitManager} />
      <Route path={"/release-control"} component={ReleaseControl} />
      <Route path={"/purchase-notices"} component={PurchaseNoticeManager} />
      <Route path={"/operations"} component={OperationsDashboard} />
      <Route path={"/result-preview"} component={ResultPreview} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
