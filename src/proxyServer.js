const express = require('express');
const axios = require('axios');
const https = require('https');
const { cacheResponse, getCachedResponse } = require('./cache');

// Crear un agente HTTPS que ignore la verificación del certificado
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Desactiva la verificación del certificado
});

// Obtén la URL y el puerto desde los argumentos de la línea de comandos
const targetServer = process.argv[2] || 'https://pokeapi.co/api/v2'; // Parámetro de URL
const port = process.argv[3] || 3000; // Parámetro de puerto

if (!targetServer) {
  console.error('Error: Missing target server URL');
  process.exit(1);
}

const app = express();

app.use(async (req, res) => {
  const cacheKey = `${req.method}:${targetServer}${req.url}`;
  const cachedResponse = getCachedResponse(cacheKey);

  if (cachedResponse) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.status(200).send(cachedResponse);
  }

  try {
    const response = await axios({
      method: req.method,
      url: `${targetServer}${req.url}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; caching-proxy/1.0)',
        'Accept': 'application/json',  // Aseguramos que la API acepte JSON
      },
      data: req.body,
      httpsAgent, // Usa el agente HTTPS que ignora la verificación de certificados
    });

    console.log(`Caching response for: ${cacheKey}`);
    cacheResponse(cacheKey, response.data);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error proxying request: ${error.message}`);
    res.status(500).send(`Error: ${error.message}`);
  }
});



app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}, proxying requests to ${targetServer}`);
});
