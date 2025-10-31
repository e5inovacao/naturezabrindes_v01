import { supabase } from '../../supabase/client';
import type { Database } from '../../supabase/types';

type Orcamento = Database['Tables']['orcamentos_sistema']['Row'];
type OrcamentoInsert = Database['Tables']['orcamentos_sistema']['Insert'];
type ItemOrcamento = Database['Tables']['itens_orcamento_sistema']['Row'];
type ItemOrcamentoInsert = Database['Tables']['itens_orcamento_sistema']['Insert'];
type Usuario = Database['Tables']['usuarios_cliente']['Row'];
type UsuarioInsert = Database['Tables']['usuarios_cliente']['Insert'];

// Tipos para parâmetros das funções
export interface CriarOrcamentoParams {
  usuario_id: string;
  cliente_data: {
    nome?: string;
    empresa?: string;
    telefone?: string;
    endereco?: string;
  };
  itens_data: Array<{
    produto_id?: string;
    quantidade: number;
    valor_unitario?: number;
    personalizacoes?: Record<string, any>;
    descricao_personalizada?: string;
  }>;
  observacoes?: string;
  data_evento?: string;
  urgencia?: 'baixa' | 'normal' | 'alta' | 'urgente';
}

export interface AdicionarItemParams {
  orcamento_id: string;
  produto_id?: string;
  quantidade: number;
  valor_unitario?: number;
  personalizacoes?: Record<string, any>;
  descricao_personalizada?: string;
}

export interface BuscarOrcamentosParams {
  usuario_id: string;
  status_filter?: string;
  limit?: number;
  offset?: number;
}

// Tipos de retorno
export interface OrcamentoCompleto extends Orcamento {
  usuario: Usuario;
  itens: ItemOrcamento[];
}

export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
  has_more: boolean;
}

class OrcamentosService {
  /**
   * Cria um novo orçamento completo com cliente e itens
   */
  async criarOrcamentoCompleto(params: CriarOrcamentoParams): Promise<{ data: OrcamentoCompleto | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando criação de orçamento completo`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!params.usuario_id) {
        const error = new Error('usuario_id é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      if (!params.itens_data || params.itens_data.length === 0) {
        const error = new Error('itens_data é obrigatório e deve conter pelo menos um item');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      // Validação dos itens
      for (let i = 0; i < params.itens_data.length; i++) {
        const item = params.itens_data[i];
        if (!item.quantidade || item.quantidade <= 0) {
          const error = new Error(`Item ${i + 1}: quantidade deve ser maior que zero`);
          console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
          return { data: null, error };
        }
      }

      console.log(`[${timestamp}] [OrcamentosService] Dados validados com sucesso:`, {
        usuario_id: params.usuario_id,
        cliente_data: params.cliente_data,
        total_itens: params.itens_data.length,
        observacoes: params.observacoes ? 'Presente' : 'Ausente',
        data_evento: params.data_evento || 'Não informada',
        urgencia: params.urgencia || 'normal'
      });

      const { data, error } = await supabase.rpc('criar_orcamento_completo', {
        p_usuario_id: params.usuario_id,
        p_cliente_data: params.cliente_data,
        p_itens_data: params.itens_data,
        p_observacoes: params.observacoes || null,
        p_data_evento: params.data_evento || null,
        p_urgencia: params.urgencia || 'normal'
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao criar orçamento:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          timestamp
        });
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Orçamento criado com sucesso:`, {
        orcamento_id: data?.id,
        status: data?.status,
        total_itens: data?.itens?.length || 0
      });

      return { data: data as OrcamentoCompleto, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao criar orçamento:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        params: {
          usuario_id: params.usuario_id,
          total_itens: params.itens_data?.length || 0,
          cliente: params.cliente_data?.nome || params.cliente_data?.empresa || 'Não informado'
        },
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Adiciona um item a um orçamento existente
   */
  async adicionarItem(params: AdicionarItemParams): Promise<{ data: ItemOrcamento | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando adição de item ao orçamento`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!params.orcamento_id) {
        const error = new Error('orcamento_id é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      if (!params.quantidade || params.quantidade <= 0) {
        const error = new Error('quantidade deve ser maior que zero');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Dados do item validados:`, {
        orcamento_id: params.orcamento_id,
        produto_id: params.produto_id || 'Produto personalizado',
        quantidade: params.quantidade,
        valor_unitario: params.valor_unitario || 'A definir',
        tem_personalizacoes: !!params.personalizacoes,
        tem_descricao_personalizada: !!params.descricao_personalizada
      });

      const { data, error } = await supabase.rpc('adicionar_item_orcamento', {
        p_orcamento_id: params.orcamento_id,
        p_produto_id: params.produto_id || null,
        p_quantidade: params.quantidade,
        p_valor_unitario: params.valor_unitario || null,
        p_personalizacoes: params.personalizacoes || null,
        p_descricao_personalizada: params.descricao_personalizada || null
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao adicionar item:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          orcamento_id: params.orcamento_id,
          timestamp
        });
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Item adicionado com sucesso:`, {
        item_id: data?.id,
        orcamento_id: params.orcamento_id,
        quantidade: params.quantidade
      });

      return { data: data as ItemOrcamento, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao adicionar item:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        orcamento_id: params.orcamento_id,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Remove um item de um orçamento
   */
  async removerItem(itemId: string): Promise<{ success: boolean; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando remoção de item`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!itemId) {
        const error = new Error('itemId é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { success: false, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Removendo item:`, { item_id: itemId });

      const { data, error } = await supabase.rpc('remover_item_orcamento', {
        p_item_id: itemId
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao remover item:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          item_id: itemId,
          timestamp
        });
        return { success: false, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Item removido com sucesso:`, { item_id: itemId });
      return { success: true, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao remover item:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        item_id: itemId,
        timestamp
      });
      return { success: false, error };
    }
  }

  /**
   * Atualiza a quantidade de um item
   */
  async atualizarQuantidade(itemId: string, novaQuantidade: number): Promise<{ data: ItemOrcamento | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando atualização de quantidade`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!itemId) {
        const error = new Error('itemId é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      if (!novaQuantidade || novaQuantidade <= 0) {
        const error = new Error('novaQuantidade deve ser maior que zero');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Atualizando quantidade:`, {
        item_id: itemId,
        nova_quantidade: novaQuantidade
      });

      const { data, error } = await supabase.rpc('atualizar_quantidade_item', {
        p_item_id: itemId,
        p_nova_quantidade: novaQuantidade
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao atualizar quantidade:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          item_id: itemId,
          nova_quantidade: novaQuantidade,
          timestamp
        });
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Quantidade atualizada com sucesso:`, {
        item_id: itemId,
        nova_quantidade: novaQuantidade,
        item_atualizado: data?.id
      });

      return { data: data as ItemOrcamento, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao atualizar quantidade:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        item_id: itemId,
        nova_quantidade: novaQuantidade,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Busca orçamentos de um usuário com paginação
   */
  async buscarOrcamentosUsuario(params: BuscarOrcamentosParams): Promise<{ data: ResultadoPaginado<Orcamento> | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando busca de orçamentos do usuário`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!params.usuario_id) {
        const error = new Error('usuario_id é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      const limit = params.limit || 10;
      const offset = params.offset || 0;

      console.log(`[${timestamp}] [OrcamentosService] Parâmetros de busca:`, {
        usuario_id: params.usuario_id,
        status_filter: params.status_filter || 'Todos',
        limit,
        offset,
        pagina: Math.floor(offset / limit) + 1
      });

      const { data, error } = await supabase.rpc('buscar_orcamentos_usuario', {
        p_usuario_id: params.usuario_id,
        p_status_filter: params.status_filter || null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao buscar orçamentos:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          usuario_id: params.usuario_id,
          timestamp
        });
        return { data: null, error };
      }

      const resultado = data as ResultadoPaginado<Orcamento>;
      console.log(`[${timestamp}] [OrcamentosService] Orçamentos encontrados:`, {
        total_registros: resultado?.total || 0,
        registros_retornados: resultado?.data?.length || 0,
        tem_mais: resultado?.has_more || false,
        usuario_id: params.usuario_id
      });

      return { data: resultado, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao buscar orçamentos:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        usuario_id: params.usuario_id,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Atualiza o status de um orçamento
   */
  async atualizarStatus(orcamentoId: string, novoStatus: string): Promise<{ data: Orcamento | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando atualização de status`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!orcamentoId) {
        const error = new Error('orcamentoId é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      if (!novoStatus) {
        const error = new Error('novoStatus é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      // Validação de status válidos
      const statusValidos = ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'cancelado'];
      if (!statusValidos.includes(novoStatus)) {
        const error = new Error(`Status inválido. Valores aceitos: ${statusValidos.join(', ')}`);
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Atualizando status:`, {
        orcamento_id: orcamentoId,
        novo_status: novoStatus
      });

      const { data, error } = await supabase.rpc('atualizar_status_orcamento', {
        p_orcamento_id: orcamentoId,
        p_novo_status: novoStatus
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao atualizar status:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          orcamento_id: orcamentoId,
          novo_status: novoStatus,
          timestamp
        });
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Status atualizado com sucesso:`, {
        orcamento_id: orcamentoId,
        status_anterior: data?.status,
        novo_status: novoStatus
      });

      return { data: data as Orcamento, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao atualizar status:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        orcamento_id: orcamentoId,
        novo_status: novoStatus,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Busca um orçamento completo com todos os dados relacionados
   */
  async buscarOrcamentoCompleto(orcamentoId: string): Promise<{ data: OrcamentoCompleto | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando busca de orçamento completo`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!orcamentoId) {
        const error = new Error('orcamentoId é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Buscando orçamento completo:`, { orcamento_id: orcamentoId });

      const { data, error } = await supabase.rpc('buscar_orcamento_completo', {
        p_orcamento_id: orcamentoId
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao buscar orçamento completo:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          orcamento_id: orcamentoId,
          timestamp
        });
        return { data: null, error };
      }

      const orcamento = data as OrcamentoCompleto;
      console.log(`[${timestamp}] [OrcamentosService] Orçamento completo encontrado:`, {
        orcamento_id: orcamento?.id,
        status: orcamento?.status,
        total_itens: orcamento?.itens?.length || 0,
        usuario_id: orcamento?.usuario?.id
      });

      return { data: orcamento, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao buscar orçamento completo:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        orcamento_id: orcamentoId,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Duplica um orçamento existente
   */
  async duplicarOrcamento(orcamentoId: string, novoUsuarioId?: string): Promise<{ data: OrcamentoCompleto | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando duplicação de orçamento`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!orcamentoId) {
        const error = new Error('orcamentoId é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Duplicando orçamento:`, { orcamento_id: orcamentoId });

      const { data, error } = await supabase.rpc('duplicar_orcamento', {
        p_orcamento_id: orcamentoId,
        p_novo_usuario_id: novoUsuarioId || null
      });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao duplicar orçamento:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          orcamento_id: orcamentoId,
          timestamp
        });
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Orçamento duplicado com sucesso:`, {
        orcamento_original: orcamentoId,
        novo_orcamento: data,
        timestamp
      });

      return { data: data as OrcamentoCompleto, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao duplicar orçamento:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        orcamento_id: orcamentoId,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Métodos auxiliares para operações diretas nas tabelas (compatibilidade)
   */

  /**
   * Lista todos os orçamentos (método direto)
   */
  async listarOrcamentos(filtros?: { status?: string; usuario_id?: string }): Promise<{ data: Orcamento[] | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando listagem de orçamentos`);
    
    try {
      console.log(`[${timestamp}] [OrcamentosService] Filtros aplicados:`, {
        status: filtros?.status || 'Todos',
        usuario_id: filtros?.usuario_id || 'Todos os usuários'
      });

      let query = supabase
        .from('orcamentos_sistema')
        .select(`
          *,
          usuario:usuarios_clientes(*),
          itens:itens_orcamento_sistema(*)
        `);

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
        console.log(`[${timestamp}] [OrcamentosService] Filtro de status aplicado:`, filtros.status);
      }

      if (filtros?.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
        console.log(`[${timestamp}] [OrcamentosService] Filtro de usuário aplicado:`, filtros.usuario_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao listar orçamentos:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          filtros,
          timestamp
        });
        return { data: null, error };
      }

      const orcamentos = data as Orcamento[];
      console.log(`[${timestamp}] [OrcamentosService] Orçamentos listados com sucesso:`, {
        total_encontrados: orcamentos?.length || 0,
        filtros_aplicados: filtros || 'Nenhum'
      });

      return { data: orcamentos, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao listar orçamentos:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        filtros,
        timestamp
      });
      return { data: null, error };
    }
  }

  /**
   * Busca orçamento por ID (método direto)
   */
  async buscarPorId(id: string): Promise<{ data: OrcamentoCompleto | null; error: any }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [OrcamentosService] Iniciando busca de orçamento por ID`);
    
    try {
      // Validação de parâmetros obrigatórios
      if (!id) {
        const error = new Error('id é obrigatório');
        console.error(`[${timestamp}] [OrcamentosService] Erro de validação:`, error.message);
        return { data: null, error };
      }

      console.log(`[${timestamp}] [OrcamentosService] Buscando orçamento por ID:`, { id });

      const { data, error } = await supabase
        .from('orcamentos_sistema')
        .select(`
          *,
          usuario:usuarios_clientes(*),
          itens:itens_orcamento_sistema(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`[${timestamp}] [OrcamentosService] Erro ao buscar orçamento por ID:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          id,
          timestamp
        });
        return { data: null, error };
      }

      const orcamento = data as OrcamentoCompleto;
      console.log(`[${timestamp}] [OrcamentosService] Orçamento encontrado por ID:`, {
        id: orcamento?.id,
        status: orcamento?.status,
        total_itens: orcamento?.itens?.length || 0,
        usuario_id: orcamento?.usuario?.id
      });

      return { data: orcamento, error: null };
    } catch (error) {
      console.error(`[${timestamp}] [OrcamentosService] Erro inesperado ao buscar orçamento por ID:`, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        id,
        timestamp
      });
      return { data: null, error };
    }
  }
}

// Instância singleton do serviço
export const orcamentosService = new OrcamentosService();
export default orcamentosService;