import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role key para bypass RLS
)

async function migrateData() {
  try {
    // Ler dados do JSON
    const dbPath = path.join(__dirname, '../server/db.json')
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

    console.log('Iniciando migração dos dados...')

    // Migrar cada profissional
    for (const professional of data.professionals) {
      try {
        console.log(`\nMigrando profissional: ${professional.name}`)

        // 1. Criar usuário no auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: professional.email,
          password: 'Senha@123', // Senha temporária que o usuário deverá alterar
          email_confirm: true,
          user_metadata: {
            name: professional.name,
            role: 'professional'
          }
        })

        if (authError) {
          console.error(`Erro ao criar usuário para ${professional.name}:`, authError)
          continue
        }

        console.log('Usuário criado com sucesso')

        // 2. Criar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            name: professional.name,
            role: 'professional',
            status: professional.status || 'pending',
            phone: professional.phone,
            profile_url: professional.profileUrl,
            profession: professional.profession,
            bio: professional.bio,
            avatar_url: professional.avatar,
            cover_image_url: professional.coverImage
          })

        if (profileError) {
          console.error(`Erro ao criar perfil para ${professional.name}:`, profileError)
          continue
        }

        console.log('Perfil criado com sucesso')

        // 3. Criar endereço
        if (professional.address) {
          const { error: addressError } = await supabase
            .from('addresses')
            .insert({
              profile_id: authUser.user.id,
              street: professional.address.street,
              number: professional.address.number,
              complement: professional.address.complement,
              neighborhood: professional.address.neighborhood,
              city: professional.address.city,
              state: professional.address.state,
              zip_code: professional.address.zipCode,
              latitude: professional.address.latitude,
              longitude: professional.address.longitude
            })

          if (addressError) {
            console.error(`Erro ao criar endereço para ${professional.name}:`, addressError)
          } else {
            console.log('Endereço criado com sucesso')
          }
        }

        // 4. Criar serviços
        if (professional.services && professional.services.length > 0) {
          for (const service of professional.services) {
            const { error: serviceError } = await supabase
              .from('services')
              .insert({
                professional_id: authUser.user.id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                category: service.category
              })

            if (serviceError) {
              console.error(`Erro ao criar serviço ${service.name}:`, serviceError)
            } else {
              console.log(`Serviço ${service.name} criado com sucesso`)
            }
          }
        }

        // 5. Criar horários e time slots
        if (professional.workingHours && professional.workingHours.length > 0) {
          for (const workingHour of professional.workingHours) {
            const { data: whData, error: whError } = await supabase
              .from('working_hours')
              .insert({
                professional_id: authUser.user.id,
                day_of_week: workingHour.dayOfWeek,
                is_available: workingHour.isAvailable
              })
              .select()
              .single()

            if (whError) {
              console.error(`Erro ao criar horário para dia ${workingHour.dayOfWeek}:`, whError)
              continue
            }

            console.log(`Horário para dia ${workingHour.dayOfWeek} criado com sucesso`)

            // 6. Criar time slots
            if (workingHour.timeSlots && workingHour.timeSlots.length > 0) {
              for (const timeSlot of workingHour.timeSlots) {
                const { error: tsError } = await supabase
                  .from('time_slots')
                  .insert({
                    working_hour_id: whData.id,
                    start_time: timeSlot.start,
                    end_time: timeSlot.end
                  })

                if (tsError) {
                  console.error(`Erro ao criar time slot ${timeSlot.start}-${timeSlot.end}:`, tsError)
                } else {
                  console.log(`Time slot ${timeSlot.start}-${timeSlot.end} criado com sucesso`)
                }
              }
            }
          }
        }

        console.log(`\nMigração completa para ${professional.name}`)
      } catch (error) {
        console.error(`\nErro ao migrar ${professional.name}:`, error)
      }
    }

    console.log('\nMigração finalizada!')
  } catch (error) {
    console.error('Erro fatal durante a migração:', error)
  }
}

migrateData()
