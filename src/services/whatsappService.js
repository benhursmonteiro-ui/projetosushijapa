/**
 * Serviço de Integração do WhatsApp (Evolution API ou Z-API)
 */

// Limpa e formata o número para o padrão do WhatsApp (55 + DDD + Número)
export const formatPhoneNumber = (phoneStr) => {
  if (!phoneStr) return '';
  
  // Remove todos os caracteres não numéricos
  let cleaned = phoneStr.replace(/\D/g, '');
  
  // Se estiver sem DDI (Brasil), adiciona 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
};

export const sendWhatsAppMessage = async (phone, text) => {
  const url = import.meta.env.VITE_WHATSAPP_API_URL;
  const token = import.meta.env.VITE_WHATSAPP_API_TOKEN;
  const instance = import.meta.env.VITE_WHATSAPP_INSTANCE;

  if (!url || !token || !instance) {
    console.log(`[WhatsApp Simulator] Credenciais ausentes. Mensagem simulada para ${phone}: "${text}"`);
    return { success: true, simulated: true };
  }

  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.error('Número de telefone inválido para envio de WhatsApp.');
    return { success: false, error: 'Telefone inválido' };
  }

  try {
    // Determinar se é Evolution API ou Z-API pelo padrão da URL
    const isEvolution = url.toLowerCase().includes('evolution') || !url.toLowerCase().includes('z-api');

    let endpoint = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = {};

    if (isEvolution) {
      // Padrão Evolution API
      // URL exemplo: https://api.sua-api.com
      endpoint = `${url}/message/sendText/${instance}`;
      headers['apikey'] = token;
      body = {
        number: formattedPhone,
        options: {
          delay: 1000,
          presence: 'composing'
        },
        textMessage: {
          text: text
        }
      };
    } else {
      // Padrão Z-API
      // URL exemplo: https://api.z-api.io
      endpoint = `${url}/instances/${instance}/token/${token}/send-text`;
      body = {
        phone: formattedPhone,
        message: text
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log(`[WhatsApp] Mensagem enviada com sucesso para ${formattedPhone}`, data);
    return { success: true, data };

  } catch (error) {
    console.error(`[WhatsApp Error] Falha ao enviar mensagem para ${phone}:`, error);
    return { success: false, error: error.message };
  }
};
