// Cloudflare Pages Function - API Implementation
import { createClient } from '@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
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

// Create Supabase client
function createSupabaseClient(env: any) {
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://dntlbhmljceaefycdsbc.supabase.co';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGxiaG1samNlYWVmeWNkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU4MDMsImV4cCI6MjA2MzY4MTgwM30.DyBPu5O9C8geyV6pliyIGkhwGegwV_9FQeKQ8prSdHY';
  
  return createClient(supabaseUrl, supabaseKey);
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
  return apiResponse({ success: false, error: message }, status);
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
        const features = url.searchParams.get('features');
        const search = url.searchParams.get('search');
        const featured = url.searchParams.get('featured');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const sort = url.searchParams.get('sort') || 'name';

        let query = supabase.from('produtos').select('*', { count: 'exact' });

        // Apply filters
        if (category) {
          query = query.eq('categoria', category);
        }
        if (features) {
          query = query.ilike('caracteristicas', `%${features}%`);
        }
        if (search) {
          query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
        }
        if (featured === 'true') {
          query = query.eq('destaque', true);
        }

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // Apply sorting
        query = query.order(sort);

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
      } else if (pathSegments[0] === 'featured' && pathSegments[1] === 'list') {
        // GET /api/products/featured/list
        const limit = parseInt(url.searchParams.get('limit') || '4');
        
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('destaque', true)
          .limit(limit);

        if (error) throw error;

        return apiResponse({
          success: true,
          data: data || [],
        });
      } else if (pathSegments[0] === 'highlighted') {
        // GET /api/products/highlighted
        const limit = parseInt(url.searchParams.get('limit') || '6');
        
        const { data, error } = await supabase
          .from('produtos_destaque')
          .select(`
            *,
            produtos (*)
          `)
          .limit(limit);

        if (error) throw error;

        return apiResponse({
          success: true,
          data: data || [],
        });
      } else if (pathSegments[0] === 'categories' && pathSegments[1] === 'list') {
        // GET /api/products/categories/list
        const { data, error } = await supabase
          .from('produtos')
          .select('categoria')
          .not('categoria', 'is', null);

        if (error) throw error;

        const categories = [...new Set(data?.map(item => item.categoria))];

        return apiResponse({
          success: true,
          data: categories,
        });
      } else if (pathSegments.length === 1) {
        // GET /api/products/:id
        const productId = pathSegments[0];
        
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', productId)
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
    console.error('Products API error:', error);
    return errorResponse('Internal server error');
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
function handleHealth() {
  return apiResponse({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
}

// Main request handler
export async function onRequest(context: any) {
  const { request, env } = context;
  
  // Handle CORS preflight
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api/', '').split('/').filter(Boolean);

  // Create Supabase client
  const supabase = createSupabaseClient(env);

  try {
    // Route to appropriate handler
    if (pathSegments.length === 0 || pathSegments[0] === 'health') {
      return handleHealth();
    } else if (pathSegments[0] === 'products') {
      return await handleProducts(request, supabase, pathSegments.slice(1));
    } else if (pathSegments[0] === 'quotes') {
      return await handleQuotes(request, supabase, pathSegments.slice(1));
    } else {
      return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('API error:', error);
    return errorResponse('Internal server error');
  }
}