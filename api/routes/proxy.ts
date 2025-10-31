import express, { type Request, type Response } from 'express';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const router = express.Router();

/**
 * Proxy para imagens externas - resolve problemas de CORS
 * GET /api/proxy/image?url=<image_url>
 */
router.get('/image', async (req: Request, res: Response) => {
  // Configurar headers CORS antes de qualquer processamento
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Vary': 'Origin'
  });

  try {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL da imagem é obrigatória'
      });
    }

    // Validar se é uma URL válida
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'URL inválida'
      });
    }

    // Verificar se é HTTPS ou HTTP
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        error: 'Protocolo não suportado. Use HTTP ou HTTPS'
      });
    }

    // Verificar se é de um domínio permitido (segurança)
    const allowedDomains = [
      'www.spotgifts.com.br',
      'spotgifts.com.br',
      'cdn.xbzbrindes.com.br',
      'www.cdn.xbzbrindes.com.br',
      'images.unsplash.com',
      'via.placeholder.com'
    ];

    console.log(`[${new Date().toISOString()}] [PROXY] Verificando domínio: ${parsedUrl.hostname}`);
    console.log(`[${new Date().toISOString()}] [PROXY] Domínios permitidos:`, allowedDomains);

    if (!allowedDomains.includes(parsedUrl.hostname)) {
      console.log(`[${new Date().toISOString()}] [PROXY] Domínio não permitido: ${parsedUrl.hostname}`);
      return res.status(403).json({
        success: false,
        error: `Domínio não permitido: ${parsedUrl.hostname}`
      });
    }

    // Escolher cliente HTTP apropriado
    const client = parsedUrl.protocol === 'https:' ? https : http;

    console.log(`[${new Date().toISOString()}] [PROXY] Fazendo requisição para: ${imageUrl}`);

    // Função para tentar buscar imagem com fallback para domínio sem www
    const tryFetchImage = (url: string, isRetry: boolean = false): void => {
      const currentUrl = new URL(url);
      const currentClient = currentUrl.protocol === 'https:' ? https : http;

      console.log(`[${new Date().toISOString()}] [PROXY] ${isRetry ? 'Tentativa de fallback' : 'Fazendo requisição'} para: ${url}`);

      const proxyRequest = currentClient.request(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }, (proxyResponse) => {
        console.log(`[${new Date().toISOString()}] [PROXY] Resposta recebida - Status: ${proxyResponse.statusCode}`);
        console.log(`[${new Date().toISOString()}] [PROXY] Content-Type: ${proxyResponse.headers['content-type']}`);

        // Verificar se a resposta é uma imagem
        const contentType = proxyResponse.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          console.log(`[${new Date().toISOString()}] [PROXY] Erro: Não é uma imagem válida`);
          return res.status(400).json({
            success: false,
            error: 'URL não aponta para uma imagem válida'
          });
        }

        // Configurar headers CORS e ORB para resolver ERR_BLOCKED_BY_ORB
        res.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
          'X-Content-Type-Options': 'nosniff',
          'Cross-Origin-Resource-Policy': 'cross-origin', // Permitir cross-origin
          'Cross-Origin-Embedder-Policy': 'unsafe-none', // Desabilitar ORB
          'Cross-Origin-Opener-Policy': 'unsafe-none', // Desabilitar COOP
          'Vary': 'Origin',
          'X-Proxy-Cache': 'MISS',
          'Referrer-Policy': 'no-referrer-when-downgrade',
          // Headers adicionais para resolver ORB
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "default-src 'self'; img-src 'self' data: *; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        });

        // Se a imagem foi encontrada, fazer pipe da resposta
        if (proxyResponse.statusCode === 200) {
          console.log(`[${new Date().toISOString()}] [PROXY] Fazendo pipe da imagem`);
          proxyResponse.pipe(res);
        } else {
          console.log(`[${new Date().toISOString()}] [PROXY] Erro: Status ${proxyResponse.statusCode}`);
          res.status(proxyResponse.statusCode || 404).json({
            success: false,
            error: `Imagem não encontrada (${proxyResponse.statusCode})`
          });
        }
      });

      // Configurar timeout
      proxyRequest.setTimeout(15000, () => {
        proxyRequest.destroy();
        if (!res.headersSent) {
          res.status(408).json({
            success: false,
            error: 'Timeout ao buscar imagem'
          });
        }
      });

      // Tratar erros de conexão com fallback
      proxyRequest.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] [PROXY] Erro no proxy de imagem:`, error);
        
        // Se for erro de DNS e ainda não tentamos o fallback
        if (!isRetry && (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo'))) {
          // Tentar remover www. do domínio
          if (currentUrl.hostname.startsWith('www.')) {
            const fallbackUrl = url.replace('www.', '');
            console.log(`[${new Date().toISOString()}] [PROXY] Tentando fallback sem www: ${fallbackUrl}`);
            return tryFetchImage(fallbackUrl, true);
          }
        }
        
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Erro ao buscar imagem'
          });
        }
      });

      // Finalizar requisição
      proxyRequest.end();
    };

    // Iniciar tentativa de buscar imagem
    tryFetchImage(imageUrl);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [PROXY] Erro no proxy de imagem:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Endpoint para testar se uma URL de imagem é válida
 * GET /api/proxy/test?url=<image_url>
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL da imagem é obrigatória'
      });
    }

    // Validar URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (error) {
      return res.json({
        success: false,
        valid: false,
        error: 'URL inválida',
        url: imageUrl
      });
    }

    // Escolher cliente HTTP apropriado
    const client = parsedUrl.protocol === 'https:' ? https : http;

    // Fazer requisição HEAD para testar
    const testRequest = client.request(imageUrl, { method: 'HEAD' }, (testResponse) => {
      const contentType = testResponse.headers['content-type'];
      const contentLength = testResponse.headers['content-length'];
      
      res.json({
        success: true,
        valid: testResponse.statusCode === 200 && contentType?.startsWith('image/'),
        status: testResponse.statusCode,
        contentType,
        contentLength,
        url: imageUrl,
        hostname: parsedUrl.hostname
      });
    });

    testRequest.setTimeout(10000, () => {
      testRequest.destroy();
      res.json({
        success: false,
        valid: false,
        error: 'Timeout',
        url: imageUrl
      });
    });

    testRequest.on('error', (error) => {
      res.json({
        success: false,
        valid: false,
        error: error.message,
        url: imageUrl
      });
    });

    testRequest.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Middleware para tratar requisições OPTIONS (preflight CORS)
router.options('/image', (req: Request, res: Response) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
    'Access-Control-Max-Age': '86400', // Cache preflight por 24 horas
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Vary': 'Origin'
  });
  res.status(200).end();
});

export default router;