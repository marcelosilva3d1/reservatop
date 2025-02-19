import { useEffect } from 'react'

export default function EnvTest() {
  useEffect(() => {
    // Log all environment variables
    console.log('Environment Variables Test:')
    console.log('VITE_NEXT_PUBLIC_SUPABASE_URL:', import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || 'Not set')
    console.log('VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY:', import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set')
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set')
    console.log('VITE_WHATSAPP_API_URL:', import.meta.env.VITE_WHATSAPP_API_URL || 'Not set')
    console.log('VITE_WHATSAPP_INSTANCE:', import.meta.env.VITE_WHATSAPP_INSTANCE || 'Not set')
  }, [])

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h2>Environment Variables Test</h2>
      <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
        {`SUPABASE_URL: ${import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
SUPABASE_ANON_KEY: ${import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
API_URL: ${import.meta.env.VITE_API_URL ? '✅ Set' : '❌ Not set'}
WHATSAPP_API_URL: ${import.meta.env.VITE_WHATSAPP_API_URL ? '✅ Set' : '❌ Not set'}
WHATSAPP_INSTANCE: ${import.meta.env.VITE_WHATSAPP_INSTANCE ? '✅ Set' : '❌ Not set'}`}
      </pre>
    </div>
  )
}
