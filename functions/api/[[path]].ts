// Cloudflare Pages Function - API Implementation
import { createClient } from '@supabase/supabase-js';

// CORS headers - Configuração robusta para produção
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
  'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
};

// Handle CORS preflight requests
function handleCORS(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

// Create Supabase client (edge-safe)
function createSupabaseClient(env: any) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in Cloudflare Pages environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { fetch },
  });
}

// API Response helper
function apiResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Error response helper
function errorResponse(message: string, status = 500) {
  const errorData = {
    success: false,
    error: message,
    status,
    timestamp: new Date().toISOString(),
    service: 'cloudflare-api'
  };
  
  console.error(`[${new Date().toISOString()}] [CLOUDFLARE_API] ❌ Erro retornado:`, errorData);
  
  return apiResponse(errorData, status);
}

// ----- Helpers para produtos ecológicos (ecologic_products_site) -----
function generateConsistentEcologicId(data: any): string {
  const baseId = data?.codigo || (data?.id ? String(data.id) : 'unknown');
  return `ecologic-${baseId}`;
}

function mapEcologicToProduct(data: any) {
  const images: string[] = [];
  if (data?.img_0) images.push(data.img_0);
  if (data?.img_1) images.push(data.img_1);
  if (data?.img_2) images.push(data.img_2);

  const colorVariations: { color: string; image: string }[] = [];
  if (Array.isArray(data?.variacoes)) {
    for (const v of data.variacoes) {
      if (v?.cor && v?.link_image) {
        colorVariations.push({ color: v.cor, image: v.link_image });
        if (!images.includes(v.link_image)) images.push(v.link_image);
      }
    }
  }

  // Categoria básica a partir de "categoria" ou inferida pelo título
  let category = 'ecologicos';
  if (typeof data?.categoria === 'string') {
    const c = data.categoria.toLowerCase();
    if (c.includes('caneta') || c.includes('caderno') || c.includes('papelaria') || c.includes('bloco') || c.includes('agenda')) {
      category = 'papelaria';
    } else if (c.includes('bolsa') || c.includes('mochila') || c.includes('sacola') || c.includes('nécessaire') || c.includes('necessaire')) {
      category = 'acessorios';
    } else if (c.includes('caneca') || c.includes('garrafa') || c.includes('copo')) {
      category = 'casa-escritorio';
    }
  } else if (typeof data?.titulo === 'string') {
    const t = data.titulo.toLowerCase();
    if (t.includes('caneta') || t.includes('caderno') || t.includes('agenda')) category = 'papelaria';
    if (t.includes('garrafa') || t.includes('copo') || t.includes('caneca')) category = 'casa-escritorio';
    if (t.includes('bolsa') || t.includes('sacola') || t.includes('mochila')) category = 'acessorios';
  }

  const featured = data?.promocao === true || data?.promocao === 'true' || data?.promocao === 1;

  return {
    id: generateConsistentEcologicId(data),
    name: data?.titulo || 'Produto Ecológico',
    description: data?.descricao || '',
    category,
    images,
    sustainabilityFeatures: ['sustentavel'],
    customizationOptions: [],
    price: typeof data?.preco === 'number' ? data.preco : (data?.preco ? parseFloat(String(data.preco)) || 0 : 0),
    inStock: data?.status !== 'indisponivel' && data?.status !== 'esgotado',
    featured,
    isEcological: true,
    isExternal: false,
    externalSource: 'Supabase',
    supplier: 'Ecologic',
    supplierCode: data?.codigo || null,
    reference: data?.codigo || null,
    ecologicDatabaseId: data?.id,
    allImages: images,
    dimensions: {
      height: data?.altura ? parseFloat(String(data.altura)) : undefined,
      width: data?.largura ? parseFloat(String(data.largura)) : undefined,
      length: data?.comprimento ? parseFloat(String(data.comprimento)) : undefined,
      weight: data?.peso ? parseFloat(String(data.peso)) : undefined,
    },
    primaryColor: data?.cor_web_principal || undefined,
    colorVariations,
  };
}

// Products API handlers
async function handleProducts(request: Request, supabase: any, pathSegments: string[]) {
  const url = new URL(request.url);
  const method = request.method;

  try {
    if (method === 'GET') {
      // Handle different product endpoints
      if (pathSegments.length === 0) {
        // GET /api/products - List products with filters
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const featured = url.searchParams.get('featured');
        const pageRaw = url.searchParams.get('page') || '1';
        const limitRaw = url.searchParams.get('limit') || '20';
        const page = Math.max(1, parseInt(pageRaw, 10) || 1);
        const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 20, 50));

        // Preferir tabela ecologic_products_site
        try {
          let eco = supabase.from('ecologic_products_site').select('*');
          if (category) eco = eco.ilike('categoria', `%${category}%`);
          if (search) {
            const q = search.trim();
            if (q) eco = eco.or(`titulo.ilike.%${q}%,descricao.ilike.%${q}%`);
          }
          if (featured === 'true') eco = eco.eq('promocao', true);

          const fromIdx = (page - 1) * limit;
          const toIdx = fromIdx + limit - 1;
          eco = eco.range(fromIdx, toIdx).order('titulo');

          const { data, error } = await eco;
          if (error) {
            console.error(`[${new Date().toISOString()}] [CLOUDFLARE_API] ❌ Supabase erro em ecologic_products_site:`, error);
            throw new Error(error?.message || 'Erro ao consultar ecologic_products_site');
          }
          const items = (data || []).map(mapEcologicToProduct);
          // Tentar obter a contagem total de forma resiliente (opcional)
          let totalCount = items.length;
          try {
            const { count: c, error: countErr } = await supabase
              .from('ecologic_products_site')
              .select('id', { count: 'exact', head: true });
            if (!countErr && typeof c === 'number') totalCount = c;
          } catch {}

          return apiResponse({
            success: true,
            data: {
              items,
              pagination: {
                currentPage: page,
                totalPages: Math.ceil((totalCount || 0) / limit),
                totalItems: totalCount || 0,
                itemsPerPage: limit,
                hasNextPage: page * limit < (totalCount || 0),
                hasPrevPage: page > 1,
              },
            },
          });
        } catch (err: any) {
          console.warn(`[${new Date().toISOString()}] [CLOUDFLARE_API] ⚠️ Falha ao consultar ecologic_products_site; tentando tabela products:`, err?.message || err);
          // Fallback para tabela products
          const sort = url.searchParams.get('sort') || 'name';
          let query = supabase.from('products').select('*', { count: 'exact' });
          if (category) query = query.eq('category_id', category);
          if (search) {
            const q = search.trim();
            if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
          }
          if (featured === 'true') query = query.eq('featured', true);
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to).order(sort);
          const { data, error, count } = await query;
          if (error) {
            console.error(`[${new Date().toISOString()}] [CLOUDFLARE_API] ❌ Supabase erro em products:`, error);
            throw new Error(error?.message || 'Erro ao consultar products');
          }
          return apiResponse({
            success: true,
            data: {
              items: data || [],
              pagination: {
                currentPage: page,
                totalPages: Math.ceil((count || 0) / limit),
                totalItems: count || 0,
                itemsPerPage: limit,
                hasNextPage: page * limit < (count || 0),
                hasPrevPage: page > 1,
              },
            },
          });
        }
      } else if (pathSegments[0] === 'featured' && pathSegments[1] === 'list') {
        // GET /api/products/featured/list
        const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '4', 10) || 4, 50));

        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('featured', true)
            .limit(limit);
          if (error) throw error;
          return apiResponse({ success: true, data: data || [] });
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('Could not find the table') || msg.includes('relation') || msg.includes('does not exist')) {
            // Fallback: pegar itens da tabela ecologic_products_site
            const { data } = await supabase
              .from('ecologic_products_site')
              .select('*')
              .limit(limit);
            const items = (data || []).map(mapEcologicToProduct).map((p: any) => ({ ...p, featured: true }));
            return apiResponse({ success: true, data: items });
          }
          throw err;
        }
      } else if (pathSegments[0] === 'highlighted') {
        // GET /api/products/highlighted
        const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 50));

        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('featured', true)
            .limit(limit);
          if (error) throw error;
          return apiResponse({ success: true, data: data || [] });
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('Could not find the table') || msg.includes('relation') || msg.includes('does not exist')) {
            // Fallback: usar produtos em destaque + join com ecologic_products_site
            const { data, error } = await supabase
              .from('produtos_destaque')
              .select(`*, ecologic_products_site!produtos_destaque_id_produto_fkey(*)`)
              .limit(limit);
            if (error) throw error;
            const items = (data || [])
              .map((item: any) => item?.ecologic_products_site ? mapEcologicToProduct(item.ecologic_products_site) : null)
              .filter(Boolean);
            return apiResponse({ success: true, data: items });
          }
          throw err;
        }
      } else if (pathSegments[0] === 'categories' && pathSegments[1] === 'list') {
        // GET /api/products/categories/list
        try {
          const { data, error } = await supabase
            .from('products')
            .select('category_id')
            .not('category_id', 'is', null);
          if (error) throw error;
          const categories = [...new Set((data || []).map((item: any) => item.category_id))];
          return apiResponse({ success: true, data: categories });
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('Could not find the table') || msg.includes('relation') || msg.includes('does not exist')) {
            // Fallback: categorias distintas a partir de ecologic_products_site
            const { data } = await supabase
              .from('ecologic_products_site')
              .select('categoria');
            const categoriesSet = new Set<string>();
            (data || []).forEach((item: any) => {
              if (item?.categoria && typeof item.categoria === 'string') {
                categoriesSet.add(item.categoria.trim());
              }
            });
            const categories = Array.from(categoriesSet);
            return apiResponse({ success: true, data: categories });
          }
          throw err;
        }
      } else if (pathSegments.length === 1) {
        // GET /api/products/:id
        const productId = pathSegments[0];
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
          if (error) throw error;
          return apiResponse({ success: true, data });
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('Could not find the table') || msg.includes('relation') || msg.includes('does not exist')) {
            // Buscar no ecologic_products_site por código ou id a partir do padrão ecologic-*
            const base = productId.startsWith('ecologic-') ? productId.replace('ecologic-', '') : productId;
            const numberBase = Number(base);
            const hasNumber = !Number.isNaN(numberBase);
            const orExpr = hasNumber ? `codigo.eq.${base},id.eq.${numberBase}` : `codigo.eq.${base}`;
            const { data } = await supabase
              .from('ecologic_products_site')
              .select('*')
              .or(orExpr)
              .limit(1);
            const found = Array.isArray(data) ? data[0] : null;
            if (!found) return errorResponse('Produto não encontrado', 404);
            const mapped = mapEcologicToProduct(found);
            return apiResponse({ success: true, data: mapped });
          }
          throw err;
        }
      }
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error: any) {
    console.error('Products API error:', error);
    const msg = (error && (error.message || error.error)) ? (error.message || error.error) : (() => {
      try { return typeof error === 'string' ? error : JSON.stringify(error); } catch { return 'Internal server error'; }
    })();
    return errorResponse(msg);
  }
}

// Quotes API handlers
async function handleQuotes(request: Request, supabase: any, pathSegments: string[]) {
  const method = request.method;

  try {
    if (method === 'POST' && pathSegments.length === 0) {
      // POST /api/quotes - Create new quote
      const body = await request.json();
      
      const { data, error } = await supabase
        .from('orcamentos')
        .insert([{
          dados_cliente: body.customerData,
          itens: body.items,
          observacoes: body.notes,
          status: 'pendente',
          data_criacao: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      return apiResponse({
        success: true,
        data: data,
      });
    } else if (method === 'GET') {
      if (pathSegments.length === 0) {
        // GET /api/quotes - List quotes
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        let query = supabase.from('orcamentos').select('*', { count: 'exact' });

        if (status) {
          query = query.eq('status', status);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to).order('data_criacao', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw error;

        return apiResponse({
          success: true,
          data: {
            items: data || [],
            pagination: {
              currentPage: page,
              totalPages: Math.ceil((count || 0) / limit),
              totalItems: count || 0,
              itemsPerPage: limit,
              hasNextPage: page * limit < (count || 0),
              hasPrevPage: page > 1,
            },
          },
        });
      } else if (pathSegments[0] === 'stats' && pathSegments[1] === 'dashboard') {
        // GET /api/quotes/stats/dashboard
        const { data, error } = await supabase
          .from('orcamentos')
          .select('status');

        if (error) throw error;

        const stats = {
          total: data?.length || 0,
          pendente: data?.filter(q => q.status === 'pendente').length || 0,
          aprovado: data?.filter(q => q.status === 'aprovado').length || 0,
          rejeitado: data?.filter(q => q.status === 'rejeitado').length || 0,
        };

        return apiResponse({
          success: true,
          data: stats,
        });
      } else if (pathSegments.length === 1) {
        // GET /api/quotes/:id
        const quoteId = pathSegments[0];
        
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', quoteId)
          .single();

        if (error) throw error;

        return apiResponse({
          success: true,
          data: data,
        });
      }
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Quotes API error:', error);
    return errorResponse('Internal server error');
  }
}

// Health check
async function handleHealth(env?: any) {
  const hasUrl = !!(env && env.SUPABASE_URL);
  const hasKey = !!(env && env.SUPABASE_ANON_KEY);

  let dbOk = false;
  let dbError: string | undefined;

  if (hasUrl && hasKey) {
    try {
      const supabase = createSupabaseClient(env);
      let { error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      if (error) {
        // Tentar tabela real utilizada
        const tryAlt = await supabase
          .from('ecologic_products_site')
          .select('id')
          .limit(1);
        if (!tryAlt.error) dbOk = true;
        else dbError = tryAlt.error.message || error.message || 'Erro desconhecido no Supabase';
      } else {
        dbOk = true;
      }
    } catch (err: any) {
      dbError = err?.message || 'Falha ao conectar ao Supabase';
    }
  }

  return apiResponse({
    success: hasUrl && hasKey && dbOk,
    message: 'API health check',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: hasUrl,
      hasSupabaseAnonKey: hasKey,
    },
    db: {
      ok: dbOk,
      error: dbError,
    },
  });
}

// Main request handler
export async function onRequest(context: any) {
  const { request, env } = context;
  const startTime = Date.now();
  
  try {
    // Log da requisição
    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_API] 📥 Nova requisição:`, {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('User-Agent'),
      origin: request.headers.get('Origin'),
      referer: request.headers.get('Referer')
    });

    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      console.log(`[${new Date().toISOString()}] [CLOUDFLARE_API] ✅ CORS preflight respondido`);
      return corsResponse;
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.replace('/api/', '').split('/').filter(Boolean);

    // Verificar variáveis de ambiente
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error(`[${new Date().toISOString()}] [CLOUDFLARE_API] ❌ Variáveis de ambiente faltando:`, {
        hasSupabaseUrl: !!env.SUPABASE_URL,
        hasSupabaseKey: !!env.SUPABASE_ANON_KEY
      });
      return errorResponse('Configuração do servidor incompleta', 500);
    }

    // Create Supabase client
    const supabase = createSupabaseClient(env);

    let response;
    
    // Route to appropriate handler
    if (pathSegments.length === 0 || pathSegments[0] === 'health') {
      response = await handleHealth(env);
    } else if (pathSegments[0] === 'products') {
      // Deixe que a rota dedicada functions/api/products.ts responda a GET sem path extra
      if (request.method === 'GET' && pathSegments.length === 1) {
        return await (await import('./products')).onRequestGet({ env, request } as any);
      }
      // Para subrotas como /featured, /highlighted, /categories e /:id mantém o handler atual
      response = await handleProducts(request, supabase, pathSegments.slice(1));
    } else if (pathSegments[0] === 'quotes') {
      response = await handleQuotes(request, supabase, pathSegments.slice(1));
    } else if (pathSegments[0] === 'proxy') {
      response = await handleProxy(request, pathSegments.slice(1));
    } else {
      console.warn(`[${new Date().toISOString()}] [CLOUDFLARE_API] ⚠️ Endpoint não encontrado:`, {
        path: url.pathname,
        segments: pathSegments
      });
      response = errorResponse('Endpoint not found', 404);
    }

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_API] ✅ Requisição processada:`, {
      method: request.method,
      path: url.pathname,
      duration: `${duration}ms`,
      status: response.status || 200
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] [CLOUDFLARE_API] 💥 Erro crítico:`, {
      method: request.method,
      url: request.url,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return errorResponse('Internal server error', 500);
   }
 }

// Proxy handler for images - resolve CORS issues
async function handleProxy(request: Request, pathSegments: string[]) {
  const url = new URL(request.url);
  
  if (pathSegments[0] === 'image') {
    return await handleImageProxy(request, url);
  } else if (pathSegments[0] === 'test') {
    return await handleProxyTest(request, url);
  } else {
    return errorResponse('Proxy endpoint not found', 404);
  }
}

// Handle image proxy requests
async function handleImageProxy(request: Request, url: URL) {
  try {
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return errorResponse('URL da imagem é obrigatória', 400);
    }

    // Validar se é uma URL válida
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (error) {
      return errorResponse('URL inválida', 400);
    }

    // Verificar se é HTTPS ou HTTP
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return errorResponse('Protocolo não suportado. Use HTTP ou HTTPS', 400);
    }

    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] 🖼️ Fazendo proxy de imagem:`, {
      originalUrl: imageUrl,
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol
    });

    // Fazer requisição para a imagem
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': parsedUrl.origin
      }
    });

    if (!imageResponse.ok) {
      console.error(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] ❌ Erro ao buscar imagem:`, {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        url: imageUrl
      });
      return errorResponse(`Imagem não encontrada (${imageResponse.status})`, imageResponse.status);
    }

    // Verificar se é uma imagem
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] ❌ Não é uma imagem:`, {
        contentType,
        url: imageUrl
      });
      return errorResponse('URL não aponta para uma imagem válida', 400);
    }

    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] ✅ Imagem encontrada:`, {
      contentType,
      size: imageResponse.headers.get('content-length'),
      url: imageUrl
    });

    // Criar resposta com headers CORS apropriados
    const proxyResponse = new Response(imageResponse.body, {
      status: imageResponse.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Referrer-Policy': 'no-referrer-when-downgrade',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Proxy-Cache': 'MISS',
        'X-Proxy-Source': 'cloudflare-functions',
        ...corsHeaders,
      },
    });

    return proxyResponse;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] 💥 Erro crítico no proxy:`, {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    return errorResponse('Erro ao fazer proxy da imagem', 500);
  }
}

// Handle proxy test requests
async function handleProxyTest(request: Request, url: URL) {
  try {
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return apiResponse({
        success: false,
        error: 'URL da imagem é obrigatória'
      }, 400);
    }

    // Validar URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (error) {
      return apiResponse({
        success: false,
        valid: false,
        error: 'URL inválida',
        url: imageUrl
      });
    }

    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] 🧪 Testando URL:`, {
      url: imageUrl,
      hostname: parsedUrl.hostname
    });

    // Fazer requisição HEAD para testar
    const testResponse = await fetch(imageUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const contentType = testResponse.headers.get('content-type');
    const contentLength = testResponse.headers.get('content-length');
    
    const result = {
      success: true,
      valid: testResponse.ok && contentType?.startsWith('image/'),
      status: testResponse.status,
      contentType,
      contentLength,
      url: imageUrl,
      hostname: parsedUrl.hostname
    };

    console.log(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] 📊 Resultado do teste:`, result);

    return apiResponse(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [CLOUDFLARE_PROXY] ❌ Erro no teste:`, error);
    return apiResponse({
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      url: url.searchParams.get('url')
    });
  }
}