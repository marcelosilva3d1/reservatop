import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Criar cliente com a service role key para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

// Função para criar um usuário com role específica
export const createUserWithRole = async (email: string, password: string, role: 'admin' | 'professional' | 'client' = 'client') => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  })
  
  if (error) throw error
  return data
}

// Função para atualizar role do usuário
export const updateUserRole = async (userId: string, role: 'admin' | 'professional' | 'client') => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { role } }
  )
  
  if (error) throw error
  return data
}

// Função para deletar um usuário
export const deleteUser = async (userId: string) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw error
}
