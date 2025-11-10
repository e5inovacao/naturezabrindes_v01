// Cloudflare Pages Function - Safe /api/products handler
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max))
}

function escapeLike(s: string) {
  // escapa % e _ para uso em ILIKE
  return s.replace(/[%_]/g, c => '\\' + c)
}

export const onRequestGet: PagesFunction<Bindings> = async ({ env, request }) => {
  const url = new URL(request.url)
  const rawSearch = (url.searchParams.get('search') ?? '').trim()
  const limitParam = url.searchParams.get('limit') ?? '12'
  const limit = clamp(parseInt(limitParam, 10) || 12, 1, 50)

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { fetch }, // usar fetch do runtime edge
  })

  try {
    let query = supabase
      .from('ecologic_products_site')
      .select('id, code, titulo, descricao, categoria, image_url, preco, publicado')
      .eq('publicado', true)
      .limit(limit)

    if (rawSearch) {
      // Se for “código” (só dígitos com 4+), busca por code exatamente
      if (/^\d{4,}$/.test(rawSearch)) {
        query = query.eq('code', rawSearch)
      } else {
        // Busca textual: evitar FTS quando tamanho < 2
        const s = escapeLike(rawSearch)
        // Usar OR com ILIKE nas colunas em PT-BR
        // Atenção ao formato: campos separados por vírgula
        query = query.or(
          `titulo.ilike.%${s}%,descricao.ilike.%${s}%,categoria.ilike.%${s}%`
        )
      }
    } else {
      // Sem search: apenas ordena e devolve
      query = query.order('id', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (err: any) {
    const errorId = crypto.randomUUID()
    console.error('[api/products]', errorId, err?.message, err?.stack)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        errorId,
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}