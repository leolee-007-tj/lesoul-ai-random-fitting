import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomerGate from "@/components/CustomerGate";
import AdminGate from "@/components/AdminGate";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import History from "./pages/History";
import Home from "./pages/Home";
import Measurements from "./pages/Measurements";
import ProductManager from "./pages/ProductManagerV2";
import ReleaseControl from "./pages/ReleaseControl";
import ProductFitManager from "./pages/ProductFitManager";
import PurchaseNoticeManager from "./pages/PurchaseNoticeManager";
import BrowseProducts from "./pages/BrowseProducts";
import PurchaseList from "./pages/PurchaseList";
import OperationsDashboard from "./pages/OperationsDashboard";
import StyleMatch from "./pages/StyleMatch";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicIntroduction from "./pages/PublicIntroduction";
import TrialStoreConsole from "./pages/TrialStoreConsole";
import AccountManagement from "./pages/AccountManagement";
import SaleSettings from "./pages/SaleSettings";
import VipEarlyAccess from "./pages/VipEarlyAccess";
import StoreDisplayGate from "./components/StoreDisplayGate";
import StoreDisplayCatalog from "./pages/StoreDisplayCatalog";
import CareLabelCatalog, { CareLabelProduct } from "./pages/CareLabelCatalog";
import CareLabelAdmin from "./pages/CareLabelAdmin";
import CareLabelPrint from "./pages/CareLabelPrint";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/care-labels"} component={CareLabelCatalog} />
      <Route path={"/product/:id"} component={CareLabelProduct} />
      <Route path={"/about"} component={PublicIntroduction} />
      <Route path={"/trial-store"} component={TrialStoreConsole} />
      <Route path={"/store-display"} component={() => <StoreDisplayGate><StoreDisplayCatalog /></StoreDisplayGate>} />
      <Route path={"/"} component={() => <CustomerGate><Home /></CustomerGate>} />
      <Route path={"/studio"} component={() => <CustomerGate><StyleMatch /></CustomerGate>} />
      <Route path={"/quick-fit"} component={() => <CustomerGate><StyleMatch /></CustomerGate>} />
      <Route path={"/catalog"} component={() => <CustomerGate><BrowseProducts /></CustomerGate>} />
      <Route path={"/vip-early-access"} component={() => <CustomerGate><VipEarlyAccess /></CustomerGate>} />
      <Route path={"/purchase-list"} component={() => <CustomerGate><PurchaseList /></CustomerGate>} />
      <Route path={"/body-model"} component={() => <CustomerGate><StyleMatch /></CustomerGate>} />
      <Route path={"/measurements"} component={() => <CustomerGate><Measurements /></CustomerGate>} />
      <Route path={"/history"} component={() => <CustomerGate><History /></CustomerGate>} />
      <Route path={"/profile"} component={() => <CustomerGate><Profile /></CustomerGate>} />
      <Route path={"/products"} component={() => <AdminGate><ProductManager /></AdminGate>} />
      <Route path={"/product-fit"} component={() => <AdminGate><ProductFitManager /></AdminGate>} />
      <Route path={"/release-control"} component={() => <AdminGate><ReleaseControl /></AdminGate>} />
      <Route path={"/purchase-notices"} component={() => <AdminGate><PurchaseNoticeManager /></AdminGate>} />
      <Route path={"/operations"} component={() => <AdminGate><OperationsDashboard /></AdminGate>} />
      <Route path={"/care-labels/admin"} component={() => <AdminGate><CareLabelAdmin /></AdminGate>} />
      <Route path={"/care-labels/print"} component={() => <AdminGate><CareLabelPrint /></AdminGate>} />
      <Route path={"/account-management"} component={() => <AdminGate><AccountManagement /></AdminGate>} />
      <Route path={"/sale-settings"} component={() => <AdminGate><SaleSettings /></AdminGate>} />
      <Route path={"/style-match"} component={() => <CustomerGate><StyleMatch /></CustomerGate>} />
      <Route path={"/result-preview"} component={() => <CustomerGate><StyleMatch /></CustomerGate>} />
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
