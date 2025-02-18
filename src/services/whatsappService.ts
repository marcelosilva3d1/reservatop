import axios from 'axios';

const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL;
const WHATSAPP_INSTANCE = import.meta.env.VITE_WHATSAPP_INSTANCE;
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY;

export type CancellationReason = 
  | "imprevisto_profissional"
  | "problema_saude"
  | "emergencia_familiar"
  | "problema_equipamento"
  | "clima"
  | "outro";

export const cancellationReasons: Record<CancellationReason, string> = {
  imprevisto_profissional: "Imprevisto com o profissional",
  problema_saude: "Problema de saúde",
  emergencia_familiar: "Emergência familiar",
  problema_equipamento: "Problema com equipamento",
  clima: "Condições climáticas adversas",
  outro: "Outro motivo"
} as const;

const whatsappService = {
  sendAppointmentConfirmation: async (phone: string, appointmentDetails: {
    clientName: string;
    date: string;
    time: string;
    serviceName: string;
  }) => {
    try {
      const message = `✨ Olá, ${appointmentDetails.clientName}! Que alegria ter você conosco! ✨

🎉 Seu horário foi confirmado no Reserva Top!

📝 Detalhes do seu agendamento:
🔸 Serviço: ${appointmentDetails.serviceName}
📅 Data: ${appointmentDetails.date}
⏰ Horário: ${appointmentDetails.time}

💫 Estamos ansiosos para proporcionar uma experiência incrível para você!

ℹ️ Dicas importantes:
• Chegue com 5 minutinhos de antecedência
• Em caso de imprevistos, nos avise com antecedência
• Fique à vontade para trazer suas referências

💝 Agradecemos a preferência!
✨ Reserva Top - Transformando sua beleza em arte ✨`;

      // Formata o número de telefone (remove caracteres não numéricos e adiciona código do país)
      const formattedPhone = '55' + phone.replace(/\D/g, '');
      
      // Envia mensagem via API do WhatsApp
      const response = await axios.post(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        number: formattedPhone,
        text: message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  },

  sendProfessionalCancellation: async (phone: string, appointmentDetails: {
    clientName: string;
    date: string;
    time: string;
    serviceName: string;
    professionalName: string;
    reason: CancellationReason;
    customReason?: string;
  }) => {
    try {
      const reasonText = appointmentDetails.reason === "outro" && appointmentDetails.customReason 
        ? appointmentDetails.customReason
        : cancellationReasons[appointmentDetails.reason];

      const message = `😔 Olá, ${appointmentDetails.clientName}!

❌ Infelizmente precisamos cancelar seu agendamento:
🔸 Serviço: ${appointmentDetails.serviceName}
📅 Data: ${appointmentDetails.date}
⏰ Horário: ${appointmentDetails.time}

📝 Motivo do cancelamento:
${reasonText}

💌 Mensagem do profissional:
${appointmentDetails.professionalName} lamenta muito o inconveniente e gostaria de reagendar seu horário para a melhor data possível.

✨ Por favor, acesse nosso sistema para escolher uma nova data ou entre em contato conosco.

🎁 Como forma de compensação, você terá prioridade no agendamento e um desconto especial no seu próximo serviço.

💝 Agradecemos sua compreensão!
✨ Reserva Top - Sua satisfação é nossa prioridade ✨`;

      // Formata o número de telefone (remove caracteres não numéricos e adiciona código do país)
      const formattedPhone = '55' + phone.replace(/\D/g, '');
      
      // Envia mensagem via API do WhatsApp
      const response = await axios.post(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        number: formattedPhone,
        text: message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  },

  sendAppointmentCancellation: async (phone: string, appointmentDetails: {
    clientName: string;
    date: string;
    time: string;
    serviceName: string;
  }) => {
    try {
      const message = `😊 Olá, ${appointmentDetails.clientName}!

📝 Confirmamos o cancelamento do seu agendamento:
🔸 Serviço: ${appointmentDetails.serviceName}
📅 Data: ${appointmentDetails.date}
⏰ Horário: ${appointmentDetails.time}

💫 Sentiremos sua falta, mas entendemos que imprevistos acontecem!

✨ Que tal remarcar para outro dia? Será um prazer atender você!
📱 Você pode fazer um novo agendamento através do nosso sistema.

💝 Agende Bela - Sua beleza, nossa prioridade ✨`;
      const messageUpdated = message.replace('Agende Bela', 'Reserva Top');

      // Formata o número de telefone (remove caracteres não numéricos e adiciona código do país)
      const formattedPhone = '55' + phone.replace(/\D/g, '');
      
      // Envia mensagem via API do WhatsApp
      const response = await axios.post(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        number: formattedPhone,
        text: messageUpdated
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  }
};

export default whatsappService;
