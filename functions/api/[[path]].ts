// Cloudflare Pages Function to proxy API requests
export async function onRequest(context: any) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Extract the API path
  const apiPath = url.pathname.replace('/api/', '');
  
  // Proxy to the actual API server
  const apiUrl = `https://natureza-brindes-api.vercel.app/api/${apiPath}${url.search}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'API proxy error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}