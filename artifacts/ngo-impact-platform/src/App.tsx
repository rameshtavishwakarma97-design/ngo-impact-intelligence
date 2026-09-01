import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { Layout } from '@/components/layout';

// Pages
import Monitor from '@/pages/monitor';
import Programs from '@/pages/programs/index';
import ProgramDetail from '@/pages/programs/detail';
import Beneficiaries from '@/pages/beneficiaries/index';
import BeneficiaryDetail from '@/pages/beneficiaries/detail';
import Operations from '@/pages/operations';
import Investigate from '@/pages/investigate';
import Actions from '@/pages/actions';
import Reports from '@/pages/reports';
import Settings from '@/pages/settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Monitor} />
          
          <Route path="/programs" component={Programs} />
          <Route path="/programs/:id" component={ProgramDetail} />
          
          <Route path="/beneficiaries" component={Beneficiaries} />
          <Route path="/beneficiaries/:id" component={BeneficiaryDetail} />
          
          <Route path="/operations" component={Operations} />
          <Route path="/investigate" component={Investigate} />
          <Route path="/actions" component={Actions} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Layout>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;