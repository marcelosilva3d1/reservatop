import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
    open: true,
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  define: {
    'import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL': 
      JSON.stringify(process.env.VITE_NEXT_PUBLIC_SUPABASE_URL),
    'import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY':
      JSON.stringify(process.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_API_URL':
      JSON.stringify(process.env.VITE_API_URL),
    'import.meta.env.VITE_WHATSAPP_API_URL':
      JSON.stringify(process.env.VITE_WHATSAPP_API_URL),
    'import.meta.env.VITE_WHATSAPP_INSTANCE':
      JSON.stringify(process.env.VITE_WHATSAPP_INSTANCE),
    'import.meta.env.VITE_WHATSAPP_API_KEY':
      JSON.stringify(process.env.VITE_WHATSAPP_API_KEY)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          'date-vendor': ['date-fns', 'date-fns/locale'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    }
  }
}));
