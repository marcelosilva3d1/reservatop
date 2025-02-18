const axios = require('axios');

async function testWhatsApp() {
  try {
    const response = await axios.post('http://localhost:8080/api/appagenda/sendText', {
      number: '5511999999999',
      textMessage: 'Teste de mensagem'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': '6Rg9m8Eetlud6Dh3KC2BEbrXOFVj1oAV'
      }
    });

    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}

testWhatsApp();
