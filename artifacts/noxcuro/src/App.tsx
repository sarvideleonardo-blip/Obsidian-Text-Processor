import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/Shell';
import { Toaster } from 'sonner';

import Procesador from '@/pages/procesador';
import Constelacion from '@/pages/constelacion';
import Grafo from '@/pages/grafo';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="h-full flex items-center justify-center flex-col text-center space-y-4 text-muted-foreground">
      <div className="text-4xl text-primary/50">404</div>
      <p>Este nodo no existe en la constelación.</p>
    </div>
  );
}

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Procesador} />
        <Route path="/entradas" component={Constelacion} />
        <Route path="/estadisticas" component={Grafo} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="bottom-right" toastOptions={{ className: 'bg-card border-border text-foreground font-mono text-sm' }} />
    </QueryClientProvider>
  );
}

export default App;
