import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from '@/components/ui/sonner';

function App() {
  return (
    <div>
      <h1>Test App</h1>
      <pre>
        {JSON.stringify({
          VITE_NEXT_PUBLIC_SUPABASE_URL: import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || 'not set',
          VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set (hidden)' : 'not set',
          VITE_API_URL: import.meta.env.VITE_API_URL || 'not set',
          VITE_WHATSAPP_API_URL: import.meta.env.VITE_WHATSAPP_API_URL || 'not set',
          NODE_ENV: import.meta.env.NODE_ENV
        }, null, 2)}
      </pre>
      <Toaster />
      <Sonner />
    </div>
  );
}

export default App;
