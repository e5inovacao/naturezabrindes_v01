import { supabase } from '../../supabase/client';
import type { Database } from '../../supabase/types';

// Tipos para as novas tabelas (usando nomes corretos das tabelas criadas)
// Nota: As tabelas reais são 'solicitacao_orcamentos' e 'products_solicitacao'
// Como não estão no arquivo de tipos, vamos definir manualmente
interface SolicitacaoOrcamentos {
  solicitacao_id: number;
  created_at?: string;
  user_id?: string;
  status_old?: string;
  solicitacao_observacao?: string;
  consultor_id?: number;
  validade_proposta?: string;
  prazo_entrega?: string;
  forma_pagamento?: string;
  opcao_frete?: string;
  observacoes?: string;
  local_entrega?: string;
  local_cobranca?: string;
  valor_total_estimado?: number;
  numero_solicitacao?: string;
  status?: string;
}

interface SolicitacaoOrcamentosInsert {
  solicitacao_id?: number;
  created_at?: string;
  user_id?: string;
  status_old?: string;
  solicitacao_observacao?: string;
  consultor_id?: number;
  validade_proposta?: string;
  prazo_entrega?: string;
  forma_pagamento?: string;
  opcao_frete?: string;
  observacoes?: string;
  local_entrega?: string;
  local_cobranca?: string;
  valor_total_estimado?: number;
  numero_solicitacao?: string;
  status?: string;
}

interface ItensOrcamento {
  id: string;
  solicitacao_id: string;
  products_id: string;
  products_quantidade_01: number;
  products_quantidade_02?: number;
  products_quantidade_03?: number;
  color?: string;
  customizations?: string;
  created_at?: string;
}

interface ItensOrcamentoInsert {
  id?: string;
  solicitacao_id: string;
  products_id: string;
  products_quantidade_01: number;
  products_quantidade_02?: number;
  products_quantidade_03?: number;
  color?: string;
  customizations?: string;
  img_ref_url?: string;
  created_at?: string;
}
type UsuarioCliente = Database['Tables']['usuarios_cliente']['Row'];
type UsuarioClienteInsert = Database['Tables']['usuarios_cliente']['Insert'];

// Tipos legados (manter para compatibilidade temporária)
type OrcamentoSistema = Database['Tables']['orcamentos_sistema']['Row'];
type OrcamentoSistemaInsert = Database['Tables']['orcamentos_sistema']['Insert'];
type ItemOrcamentoSistema = Database['Tables']['itens_orcamento_sistema']['Row'];
type ItemOrcamentoSistemaInsert = Database['Tables']['itens_orcamento_sistema']['Insert'];

// Os tipos são importados do Database acima

export interface CartItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  notes?: string;
  opcao1?: number;
  opcao2?: number;
  opcao3?: number;
  quantity: number;
  quantity2?: number; // Segunda quantidade opcional
  quantity3?: number; // Terceira quantidade opcional
  unitPrice?: number;
  customizations?: Record<string, any>;
  ecologicalId?: string;
  selectedColor?: string;
  itemNotes?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  email: string;
  company?: string;
  cnpj?: string;
  address?: string;
}

export interface QuoteRequestData {
  customerData: CustomerData;
  items: CartItem[];
  notes?: string;
}

/**
 * Gera um número único para o orçamento (será gerado automaticamente pelo trigger)
 */
export async function generateQuoteNumber(): Promise<string | null> {
  // O número será gerado automaticamente pelo trigger set_quote_number
  // Retornamos null para indicar que deve ser auto-gerado
  return null;
}

/**
 * Gera um número único para a solicitação de orçamento
 * Formato: YYYY-MM-DD-HHMMSS-XXXXX
 */
export async function generateUniqueRequestNumber(): Promise<string> {
  try {
    console.log(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Gerando número único da solicitação...`);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Gerar sequência aleatória de 5 dígitos
    const randomSequence = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    const requestNumber = `${year}-${month}-${day}-${hours}${minutes}${seconds}-${randomSequence}`;
    
    console.log(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Número gerado: ${requestNumber}`);
    
    // Verificar se já existe (muito improvável, mas por segurança)
    const { data: existing, error } = await supabase
      .from('solicitacao_orcamentos')
      .select('numero_solicitacao')
      .eq('numero_solicitacao', requestNumber)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.warn(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Erro ao verificar duplicata do número: ${error.message}`);
    }
    
    if (existing) {
      console.log(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Número já existe, gerando novo...`);
      // Recursão para gerar novo número (muito improvável)
      return await generateUniqueRequestNumber();
    }
    
    console.log(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Número único confirmado: ${requestNumber}`);
    return requestNumber;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [GENERATE_REQUEST_NUMBER] Erro ao gerar número da solicitação:`, error);
    // Fallback simples
    return `SOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Cria ou busca um usuário no sistema
 * Permite usuários não autenticados para solicitação de orçamentos
 */
export async function getOrCreateUser(customerData: CustomerData): Promise<UsuarioCliente> {
  try {
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] INICIANDO getOrCreateUser...`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Dados recebidos:`, JSON.stringify(customerData, null, 2));
    
    // VALIDAÇÕES ROBUSTAS DOS DADOS DE ENTRADA
    if (!customerData) {
      throw new Error('❌ ERRO: customerData é obrigatório');
    }
    
    if (!customerData.name || customerData.name.trim().length === 0) {
      throw new Error('❌ ERRO: Nome do cliente é obrigatório');
    }
    
    if (!customerData.email && !customerData.phone) {
      throw new Error('❌ ERRO: Email ou telefone é obrigatório');
    }
    
    if (customerData.email && !customerData.email.includes('@')) {
      throw new Error('❌ ERRO: Email inválido fornecido');
    }
    
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Validações de entrada aprovadas`);
    
    // Verificar se o usuário está autenticado (opcional)
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Verificando autenticação...`);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userId: string | null = null;
    
    // Se usuário autenticado, usar o ID do auth
    if (!authError && user) {
      userId = user.id;
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário autenticado encontrado: ${userId}`);
      
      // Tentar buscar usuário existente pelo user_id
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Buscando usuário autenticado na tabela usuarios_clientes...`);
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios_clientes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Erro ao buscar usuário autenticado:`, searchError);
      } else if (existingUser) {
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário autenticado encontrado na tabela: ${existingUser.nome}`);
        return existingUser;
      } else {
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário autenticado não encontrado na tabela usuarios_clientes`);
      }
    } else {
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário não autenticado ou erro na autenticação: ${authError?.message || 'N/A'}`);
    }
    
    // Para usuários não autenticados ou novos usuários autenticados
    // Buscar por email primeiro, depois por telefone para evitar duplicatas
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Buscando usuário por email: ${customerData.email}`);
    const { data: existingUserByEmail, error: emailSearchError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .single();

    if (emailSearchError && emailSearchError.code !== 'PGRST116') {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Erro ao buscar usuário por email:`, emailSearchError);
    } else if (existingUserByEmail) {
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário encontrado por email: ${existingUserByEmail.nome}`);
      // Se encontrou usuário pelo email, atualizar user_id se necessário
      if (userId && !existingUserByEmail.user_id) {
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Atualizando user_id do usuário existente...`);
        const { data: updatedUser, error: updateError } = await supabase
          .from('usuarios_clientes')
          .update({ user_id: userId })
          .eq('id', existingUserByEmail.id)
          .select()
          .single();
          
        if (updateError) {
          console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Erro ao atualizar user_id:`, updateError);
          return existingUserByEmail;
        }
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] User_id atualizado com sucesso`);
        return updatedUser;
      }
      return existingUserByEmail;
    }

    // Fallback: buscar por telefone se não encontrou por email
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Buscando usuário por telefone: ${customerData.phone}`);
    const { data: existingUserByPhone, error: phoneSearchError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', customerData.phone)
      .single();

    if (phoneSearchError && phoneSearchError.code !== 'PGRST116') {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Erro ao buscar usuário por telefone:`, phoneSearchError);
    } else if (existingUserByPhone) {
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário encontrado por telefone: ${existingUserByPhone.nome}`);
      // Se encontrou usuário pelo telefone, atualizar user_id se necessário
      if (userId && !existingUserByPhone.user_id) {
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Atualizando user_id do usuário existente...`);
        const { data: updatedUser, error: updateError } = await supabase
          .from('usuarios_clientes')
          .update({ user_id: userId })
          .eq('id', existingUserByPhone.id)
          .select()
          .single();
          
        if (updateError) {
          console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Erro ao atualizar user_id:`, updateError);
          return existingUserByPhone;
        }
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] User_id atualizado com sucesso`);
        return updatedUser;
      }
      return existingUserByPhone;
    } else {
      console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Usuário não encontrado por telefone`);
    }

    // Criar novo usuário
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Criando novo usuário...`);
    
    // VALIDAÇÕES ADICIONAIS ANTES DA CRIAÇÃO
    const trimmedName = customerData.name.trim();
    const trimmedEmail = customerData.email?.trim();
    const trimmedPhone = customerData.phone?.trim();
    
    if (trimmedName.length < 2) {
      throw new Error('❌ ERRO: Nome deve ter pelo menos 2 caracteres');
    }
    
    if (trimmedEmail && trimmedEmail.length < 5) {
      throw new Error('❌ ERRO: Email deve ter pelo menos 5 caracteres');
    }
    
    if (trimmedPhone && trimmedPhone.length < 10) {
      throw new Error('❌ ERRO: Telefone deve ter pelo menos 10 dígitos');
    }
    
    const newUserData = {
      user_id: userId, // Pode ser null para usuários não autenticados
      nome: trimmedName,
      telefone: trimmedPhone || null,
      email: trimmedEmail || null,
      empresa: customerData.company?.trim() || null,
      cnpj: customerData.cnpj?.trim() || null,
      endereco: customerData.address ? JSON.stringify({
        logradouro: customerData.address.trim(),
        cidade: '',
        estado: '',
        cep: ''
      }) : null,
      consultor_id: null // Será definido posteriormente se necessário
    };
    
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Dados do novo usuário (validados):`, JSON.stringify(newUserData, null, 2));
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Verificando conexão com Supabase antes da inserção...`);
    
    // TESTE DE CONEXÃO ANTES DA INSERÇÃO
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuarios_clientes')
      .select('count')
      .limit(1);
      
    if (connectionError) {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ERRO DE CONEXÃO com Supabase:`, connectionError);
      throw new Error(`Erro de conexão com o banco de dados: ${connectionError.message}`);
    }
    
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Conexão com Supabase confirmada`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Iniciando inserção na tabela usuarios_clientes...`);

    const { data: newUser, error: createError } = await supabase
      .from('usuarios_clientes')
      .insert(newUserData)
      .select()
      .single();

    if (createError) {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ERRO DETALHADO ao criar usuário na tabela usuarios_clientes:`);
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Código do erro: ${createError.code}`);
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Mensagem do erro: ${createError.message}`);
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Detalhes do erro: ${createError.details}`);
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Hint do erro: ${createError.hint}`);
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Dados que tentamos inserir:`, JSON.stringify(newUserData, null, 2));
      
      // ANÁLISE ESPECÍFICA DE ERROS COMUNS
      if (createError.code === '23505') {
        throw new Error('❌ ERRO: Já existe um usuário com estes dados (email ou telefone duplicado)');
      } else if (createError.code === '42501') {
        throw new Error('❌ ERRO: Permissão negada para inserir na tabela usuarios_clientes');
      } else if (createError.code === '23503') {
        throw new Error('❌ ERRO: Referência inválida (chave estrangeira)');
      } else {
        throw new Error(`❌ ERRO ao criar usuário no sistema: ${createError.message} (Código: ${createError.code})`);
      }
    }
    
    if (!newUser) {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ERRO CRÍTICO: Usuário foi inserido mas não retornou dados`);
      throw new Error('❌ ERRO CRÍTICO: Usuário foi inserido mas não retornou dados');
    }

    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] SUCESSO: Usuário criado com sucesso na tabela usuarios_clientes!`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ID do usuário criado: ${newUser.id}`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Nome do usuário criado: ${newUser.nome}`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Email do usuário criado: ${newUser.email}`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Telefone do usuário criado: ${newUser.telefone}`);
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Dados completos do usuário criado:`, JSON.stringify(newUser, null, 2));
    
    // VALIDAÇÃO FINAL DO USUÁRIO CRIADO
    if (!newUser.id || !newUser.nome) {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ERRO: Usuário criado está incompleto`);
      throw new Error('❌ ERRO: Usuário criado está incompleto');
    }
    
    // VERIFICAÇÃO ADICIONAL: Confirmar se o usuário foi realmente salvo no banco
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] 🔍 VERIFICAÇÃO ADICIONAL: Confirmando se usuário foi salvo no banco...`);
    try {
      const { data: verificationUser, error: verificationError } = await supabase
        .from('usuarios_clientes')
        .select('*')
        .eq('id', newUser.id)
        .single();
      
      if (verificationError) {
        console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ❌ ERRO na verificação do usuário salvo:`, verificationError);
        console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ❌ POSSÍVEL PROBLEMA: Usuário pode não ter sido salvo corretamente`);
      } else if (verificationUser) {
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ✅ CONFIRMADO: Usuário foi salvo corretamente no banco de dados`);
        console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ✅ Dados verificados:`, {
          id: verificationUser.id,
          nome: verificationUser.nome,
          email: verificationUser.email,
          telefone: verificationUser.telefone,
          empresa: verificationUser.empresa,
          created_at: verificationUser.created_at
        });
      } else {
        console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ❌ ERRO CRÍTICO: Usuário não foi encontrado após criação`);
        throw new Error('❌ ERRO CRÍTICO: Usuário não foi encontrado após criação');
      }
    } catch (verificationError) {
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ❌ ERRO na verificação do usuário:`, verificationError);
      // Não vamos lançar erro aqui para não interromper o fluxo, mas vamos logar o problema
      console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ⚠️ AVISO: Continuando com o usuário criado, mas verificação falhou`);
    }
    
    console.log(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] CADASTRO DE USUÁRIO CONCLUÍDO COM SUCESSO!`);
    return newUser;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] ERRO GERAL no getOrCreateUser:`, error);
    console.error(`[${new Date().toISOString()}] [GET_OR_CREATE_USER] Stack trace:`, error instanceof Error ? error.stack : 'N/A');
    throw error;
  }
}

/**
 * Validações robustas de entrada para dados do cliente
 */
function validateCustomerData(customerData: CustomerData): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [VALIDATION] Iniciando validação de dados do cliente...`);
  
  if (!customerData) {
    const error = new Error('❌ ERRO CRÍTICO: customerData é obrigatório');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  // Validação de nome
  if (!customerData.name || typeof customerData.name !== 'string') {
    const error = new Error('❌ ERRO: Nome do cliente é obrigatório e deve ser uma string');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  const nameClean = customerData.name.trim();
  if (nameClean.length < 2) {
    const error = new Error('❌ ERRO: Nome do cliente deve ter pelo menos 2 caracteres');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  if (nameClean.length > 100) {
    const error = new Error('❌ ERRO: Nome do cliente não pode exceder 100 caracteres');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  // Validação de contato (email ou telefone obrigatório)
  if (!customerData.email && !customerData.phone) {
    const error = new Error('❌ ERRO: É necessário fornecer pelo menos email ou telefone do cliente');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  // Validação de email se fornecido
  if (customerData.email) {
    if (typeof customerData.email !== 'string') {
      const error = new Error('❌ ERRO: Email deve ser uma string');
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email.trim())) {
      const error = new Error('❌ ERRO: Email fornecido é inválido');
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`, { email: customerData.email });
      throw error;
    }
    
    if (customerData.email.length > 255) {
      const error = new Error('❌ ERRO: Email não pode exceder 255 caracteres');
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
  }
  
  // Validação de telefone se fornecido
  if (customerData.phone) {
    if (typeof customerData.phone !== 'string') {
      const error = new Error('❌ ERRO: Telefone deve ser uma string');
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    const phoneClean = customerData.phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      const error = new Error('❌ ERRO: Telefone deve ter entre 10 e 11 dígitos');
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`, { 
        phone: customerData.phone, 
        cleanPhone: phoneClean,
        length: phoneClean.length 
      });
      throw error;
    }
  }
  
  // Validação de empresa (opcional)
  if (customerData.company && typeof customerData.company !== 'string') {
    const error = new Error('❌ ERRO: Empresa deve ser uma string');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  if (customerData.company && customerData.company.length > 100) {
    const error = new Error('❌ ERRO: Nome da empresa não pode exceder 100 caracteres');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  console.log(`[${timestamp}] [VALIDATION] ✅ Dados do cliente validados com sucesso`);
}

/**
 * Validações robustas de entrada para itens do carrinho
 */
function validateCartItems(items: CartItem[]): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [VALIDATION] Iniciando validação de itens do carrinho...`);
  
  // Validação básica de array
  if (!items || !Array.isArray(items)) {
    const error = new Error('❌ ERRO: Items deve ser um array');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  if (items.length === 0) {
    const error = new Error('❌ ERRO: É necessário fornecer pelo menos um item no carrinho');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  if (items.length > 50) {
    const error = new Error('❌ ERRO: Máximo de 50 itens permitidos por orçamento');
    console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
    throw error;
  }
  
  // Validação detalhada de cada item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemIndex = i + 1;
    
    console.log(`[${timestamp}] [VALIDATION] Validando item ${itemIndex}/${items.length}:`, {
      name: item.name,
      id: item.id,
      ecologicalId: item.ecologicalId,
      quantity: item.quantity
    });
    
    // Validação de identificador
    if (!item.id && !item.ecologicalId) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} deve ter um ID ou ecologicalId`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    // Validação de nome
    if (!item.name || typeof item.name !== 'string') {
      const error = new Error(`❌ ERRO: Item ${itemIndex} deve ter um nome válido`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    if (item.name.trim().length === 0) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} deve ter um nome não vazio`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    if (item.name.length > 255) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} - nome não pode exceder 255 caracteres`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    // Validação de quantidade
    if (!item.quantity || typeof item.quantity !== 'number') {
      const error = new Error(`❌ ERRO: Item ${itemIndex} deve ter uma quantidade numérica válida`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    if (item.quantity <= 0) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} deve ter quantidade maior que zero`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    if (item.quantity > 10000) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} - quantidade máxima permitida é 10.000`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    if (!Number.isInteger(item.quantity)) {
      const error = new Error(`❌ ERRO: Item ${itemIndex} - quantidade deve ser um número inteiro`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
    
    // Validação de preço unitário (opcional)
    if (item.unitPrice !== undefined && item.unitPrice !== null) {
      if (typeof item.unitPrice !== 'number') {
        const error = new Error(`❌ ERRO: Item ${itemIndex} - preço unitário deve ser numérico`);
        console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
        throw error;
      }
      
      if (item.unitPrice < 0) {
        const error = new Error(`❌ ERRO: Item ${itemIndex} não pode ter preço negativo`);
        console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
        throw error;
      }
      
      if (item.unitPrice > 1000000) {
        const error = new Error(`❌ ERRO: Item ${itemIndex} - preço unitário máximo é R$ 1.000.000`);
        console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
        throw error;
      }
    }
    
    // Validação de customizações (opcional)
    if (item.customizations && typeof item.customizations !== 'object') {
      const error = new Error(`❌ ERRO: Item ${itemIndex} - customizations deve ser um objeto`);
      console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
      throw error;
    }
  }
  
  console.log(`[${timestamp}] [VALIDATION] ✅ Todos os ${items.length} itens validados com sucesso`);
}

/**
 * Cria um novo orçamento com validações robustas e logs detalhados
 */
export async function createQuoteRequest(
  customerData: CustomerData,
  items: CartItem[],
  notes?: string
): Promise<SolicitacaoOrcamentos> {
  let createdUserId: string | null = null;
  let createdQuoteId: number | null = null;
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🚀 INICIANDO CRIAÇÃO DE ORÇAMENTO...`);
    console.log(`[${timestamp}] [CREATE_QUOTE] 🚀 Dados do cliente:`, JSON.stringify(customerData, null, 2));
    console.log(`[${timestamp}] [CREATE_QUOTE] 🚀 Itens do carrinho:`, items.length, 'itens');
    console.log(`[${timestamp}] [CREATE_QUOTE] 🚀 Observações:`, notes || 'Nenhuma');

    // ===== VALIDAÇÕES ROBUSTAS DE ENTRADA =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🔍 INICIANDO VALIDAÇÕES ROBUSTAS...`);
    
    // Validação de customerData
    validateCustomerData(customerData);
    
    // Validação de itens
    validateCartItems(items);
    
    // Validação de observações (opcional)
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        const error = new Error('❌ ERRO: Observações devem ser uma string');
        console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
        throw error;
      }
      
      if (notes.length > 1000) {
        const error = new Error('❌ ERRO: Observações não podem exceder 1000 caracteres');
        console.error(`[${timestamp}] [VALIDATION] ${error.message}`);
        throw error;
      }
    }
    
    console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Todas as validações de entrada aprovadas`);
    
    // ===== ETAPA 1: CRIAÇÃO/BUSCA DO USUÁRIO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 👤 ETAPA 1: Criando/buscando usuário...`);
    console.log(`[${timestamp}] [CREATE_QUOTE] 👤 Dados para busca/criação:`, {
      email: customerData.email || 'não fornecido',
      phone: customerData.phone || 'não fornecido',
      name: customerData.name,
      company: customerData.company || 'não fornecido'
    });
    
    let user: any;
    try {
      user = await getOrCreateUser(customerData);
      createdUserId = user.id;
      
      console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Usuário obtido com sucesso:`);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - ID:`, user.id);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Nome:`, user.nome);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Email:`, user.email);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Telefone:`, user.telefone);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Empresa:`, user.empresa || 'não informado');
    } catch (userError: any) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO CRÍTICO na criação/busca do usuário:`, {
        error: userError.message,
        code: userError.code || 'UNKNOWN',
        details: userError.details || 'Nenhum detalhe disponível',
        hint: userError.hint || 'Nenhuma dica disponível',
        stack: userError.stack,
        customerData: customerData,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Falha ao processar dados do usuário: ${userError.message}`);
    }
    
    // ===== ETAPA 2: CÁLCULO DO VALOR TOTAL =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 💰 ETAPA 2: Calculando valor total estimado...`);
    console.log(`[${timestamp}] [CREATE_QUOTE] 💰 Processando`, items.length, 'itens:');
    
    let valorTotalEstimado = 0;
    const itemsDetalhados = [];
    
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Validação adicional durante o cálculo
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          const error = new Error(`Item ${i + 1} tem quantidade inválida: ${item.quantity}`);
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO no cálculo:`, error.message);
          throw error;
        }
        
        const unitPrice = item.unitPrice || 0;
        if (typeof unitPrice !== 'number' || unitPrice < 0) {
          const error = new Error(`Item ${i + 1} tem preço unitário inválido: ${unitPrice}`);
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO no cálculo:`, error.message);
          throw error;
        }
        
        const itemTotal = unitPrice * item.quantity;
        valorTotalEstimado += itemTotal;
        
        const itemDetalhe = {
          index: i + 1,
          nome: item.name,
          quantidade: item.quantity,
          precoUnitario: unitPrice,
          totalItem: itemTotal,
          id: item.id || item.ecologicalId,
          customizations: item.customizations || {}
        };
        
        itemsDetalhados.push(itemDetalhe);
        
        console.log(`[${timestamp}] [CREATE_QUOTE] 💰 Item ${i + 1}:`, {
          nome: item.name,
          quantidade: item.quantity,
          precoUnitario: `R$ ${unitPrice.toFixed(2)}`,
          totalItem: `R$ ${itemTotal.toFixed(2)}`,
          customizations: Object.keys(item.customizations || {}).length
        });
      }
      
      console.log(`[${timestamp}] [CREATE_QUOTE] 💰 RESUMO DO CÁLCULO:`);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Total de itens:`, items.length);
      console.log(`[${timestamp}] [CREATE_QUOTE]   - Valor total estimado: R$`, valorTotalEstimado.toFixed(2));
      
    } catch (calculationError: any) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO CRÍTICO no cálculo do valor total:`, {
        error: calculationError.message,
        items: items,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Falha no cálculo do valor total: ${calculationError.message}`);
    }

    // ===== ETAPA 3: GERAÇÃO DO NÚMERO DA SOLICITAÇÃO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🔢 ETAPA 3: Gerando número único da solicitação...`);
    
    let numeroSolicitacao: string;
    try {
      numeroSolicitacao = await generateUniqueRequestNumber();
      console.log(`[${timestamp}] [CREATE_QUOTE] 🔢 Número da solicitação gerado:`, numeroSolicitacao);
      console.log(`[${timestamp}] [CREATE_QUOTE] 🔢 Formato: YYYY-MM-DD-HHMMSS-XXXXX`);
    } catch (numberError: any) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO na geração do número da solicitação:`, {
        error: numberError.message,
        code: numberError.code || 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
      throw new Error(`Falha na geração do número da solicitação: ${numberError.message}`);
    }
    
    const valorTotal = valorTotalEstimado;
    
    // ===== ETAPA 4: PREPARAÇÃO DOS DADOS DO ORÇAMENTO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 📄 ETAPA 4: Preparando dados do orçamento para inserção...`);
    
    let quoteData: SolicitacaoOrcamentosInsert;
    try {
      // Validação dos dados antes da preparação
      if (!user.id || typeof user.id !== 'string') {
        throw new Error(`ID do usuário inválido: ${user.id}`);
      }
      
      if (typeof valorTotal !== 'number' || valorTotal < 0) {
        throw new Error(`Valor total inválido: ${valorTotal}`);
      }
      
      if (!numeroSolicitacao || typeof numeroSolicitacao !== 'string') {
        throw new Error(`Número da solicitação inválido: ${numeroSolicitacao}`);
      }
      
      quoteData = {
        observacoes: notes || null,
        valor_total_estimado: valorTotal,
        numero_solicitacao: numeroSolicitacao,
        status: 'pendente',
        user_id: user.id,
        consultor_id: 24 // Associar automaticamente com o consultor padrão ID 24
      };
      
      console.log(`[${timestamp}] [CREATE_QUOTE] 📄 MAPEAMENTO DE DADOS PARA TABELA solicitacao_orcamentos:`);
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ observacoes (frontend: notes):`, notes || 'null');
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ valor_total_estimado (calculado):`, `R$ ${valorTotal.toFixed(2)}`);
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ numero_solicitacao (gerado):`, numeroSolicitacao);
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ status (fixo):`, 'pendente');
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ user_id (do usuário):`, user.id);
      console.log(`[${timestamp}] [CREATE_QUOTE]   ✓ consultor_id (fixo):`, 24);
      
      console.log(`[${timestamp}] [CREATE_QUOTE] 📄 Objeto completo para inserção:`, JSON.stringify(quoteData, null, 2));
      
    } catch (preparationError: any) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO na preparação dos dados:`, {
        error: preparationError.message,
        user: user,
        valorTotal: valorTotal,
        numeroSolicitacao: numeroSolicitacao,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Falha na preparação dos dados do orçamento: ${preparationError.message}`);
    }

    // ===== ETAPA 5: INSERÇÃO DO ORÇAMENTO NO BANCO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 💾 ETAPA 5: Inserindo orçamento na tabela solicitacao_orcamentos...`);
    console.log(`[${timestamp}] [CREATE_QUOTE] 💾 Executando INSERT na tabela solicitacao_orcamentos...`);
    
    let newQuote: any;
    try {
      const { data, error: quoteError } = await supabase
        .from('solicitacao_orcamentos')  // Mudança: nova tabela
        .insert(quoteData)
        .select()
        .single();

      if (quoteError) {
        console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO CRÍTICO ao inserir orçamento na tabela solicitacao_orcamentos:`, {
          code: quoteError.code || 'UNKNOWN',
          message: quoteError.message,
          details: quoteError.details || 'Nenhum detalhe disponível',
          hint: quoteError.hint || 'Nenhuma dica disponível',
          errorObject: JSON.stringify(quoteError, null, 2),
          insertData: JSON.stringify(quoteData, null, 2),
          timestamp: new Date().toISOString()
        });
        
        // Rollback: remover usuário criado se necessário
        if (createdUserId) {
          console.log(`[${timestamp}] [CREATE_QUOTE] 🔄 INICIANDO ROLLBACK: removendo usuário criado...`);
          try {
            await supabase.from('usuarios_clientes').delete().eq('id', createdUserId);
            console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Rollback do usuário concluído com sucesso`);
          } catch (rollbackError: any) {
            console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO no rollback do usuário:`, {
              error: rollbackError.message,
              userId: createdUserId,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        throw new Error(`Erro ao criar orçamento: ${quoteError.message}`);
      }
      
      if (!data) {
        console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO: Orçamento foi inserido mas não retornou dados`);
        
        // Rollback: remover usuário criado se necessário
        if (createdUserId) {
          console.log(`[${timestamp}] [CREATE_QUOTE] 🔄 Fazendo rollback do usuário criado...`);
          try {
            await supabase.from('usuarios_clientes').delete().eq('id', createdUserId);
            console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Rollback do usuário concluído`);
          } catch (rollbackError: any) {
            console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO no rollback:`, rollbackError.message);
          }
        }
        
        throw new Error('Orçamento foi inserido mas não retornou dados');
      }

      newQuote = data;
      createdQuoteId = newQuote.solicitacao_id;
      
      console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Orçamento criado com sucesso na tabela solicitacao_orcamentos:`);
      console.log(`[${timestamp}] [CREATE_QUOTE] ✅ ID do orçamento:`, createdQuoteId);
      console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Dados do orçamento criado:`, JSON.stringify(newQuote, null, 2));
      
    } catch (insertError: any) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO CRÍTICO na inserção do orçamento:`, {
        error: insertError.message,
        code: insertError.code || 'UNKNOWN',
        quoteData: quoteData,
        timestamp: new Date().toISOString()
      });
      
      // Rollback: remover usuário criado se necessário
      if (createdUserId) {
        console.log(`[${timestamp}] [CREATE_QUOTE] 🔄 Executando rollback do usuário...`);
        try {
          await supabase.from('usuarios_clientes').delete().eq('id', createdUserId);
          console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Rollback concluído`);
        } catch (rollbackError: any) {
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Falha no rollback:`, rollbackError.message);
        }
      }
      
      throw new Error(`Falha crítica na inserção do orçamento: ${insertError.message}`);
    }

    // ===== ETAPA 6: CRIAÇÃO DOS ITENS DO ORÇAMENTO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🛍️ ETAPA 6: Criando itens do orçamento...`);
    const createdItems = await createQuoteRequestItems(newQuote.solicitacao_id.toString(), items);
    console.log(`[${timestamp}] [CREATE_QUOTE] ✅ ${createdItems.length} itens criados para o orçamento ${newQuote.solicitacao_id}`);

    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🎉 ORÇAMENTO CRIADO COM SUCESSO!`);
    console.log(`[${timestamp}] [CREATE_QUOTE] 🎉 ID do orçamento:`, newQuote.solicitacao_id);
    console.log(`[${timestamp}] [CREATE_QUOTE] 🎉 Número do orçamento:`, newQuote.numero_solicitacao);
    
    return newQuote;
  } catch (error) {
    console.error(`\n[${timestamp}] [CREATE_QUOTE] ❌ ===== ERRO CRÍTICO NO CREATEQUOTEREQUEST =====`);
    console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Timestamp do erro:`, new Date().toISOString());
    console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Tipo do erro:`, error instanceof Error ? error.constructor.name : typeof error);
    console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Mensagem do erro:`, error instanceof Error ? error.message : String(error));
    console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Stack trace:`, error instanceof Error ? error.stack : 'N/A');
    
    console.error(`[${timestamp}] [CREATE_QUOTE] ❌ CONTEXTO DO ERRO:`);
    console.error(`[${timestamp}] [CREATE_QUOTE]   - createdUserId:`, createdUserId);
    console.error(`[${timestamp}] [CREATE_QUOTE]   - createdQuoteId:`, createdQuoteId);
    console.error(`[${timestamp}] [CREATE_QUOTE]   - customerData:`, JSON.stringify(customerData, null, 2));
    console.error(`[${timestamp}] [CREATE_QUOTE]   - items.length:`, items?.length || 0);
    console.error(`[${timestamp}] [CREATE_QUOTE]   - notes:`, notes || 'não fornecido');
    
    // ===== ROLLBACK COMPLETO =====
    console.log(`\n[${timestamp}] [CREATE_QUOTE] 🔄 INICIANDO ROLLBACK COMPLETO...`);
    
    try {
      if (createdQuoteId) {
        console.log(`[${timestamp}] [CREATE_QUOTE] 🔄 Removendo orçamento criado (ID: ${createdQuoteId})...`);
        
        // Remover produtos primeiro (foreign key)
        const { error: deleteProductsError } = await supabase
          .from('products_solicitacao')
          .delete()
          .eq('solicitacao_id', createdQuoteId);
          
        if (deleteProductsError) {
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Erro ao remover produtos no rollback:`, {
            error: deleteProductsError,
            solicitacao_id: createdQuoteId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Produtos removidos no rollback`);
        }
        
        // Remover orçamento
        const { error: deleteQuoteError } = await supabase
          .from('solicitacao_orcamentos')
          .delete()
          .eq('solicitacao_id', createdQuoteId);
          
        if (deleteQuoteError) {
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Erro ao remover orçamento no rollback:`, {
            error: deleteQuoteError,
            solicitacao_id: createdQuoteId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Orçamento removido no rollback`);
        }
      }
      
      if (createdUserId) {
        console.log(`[${timestamp}] [CREATE_QUOTE] 🔄 Removendo usuário criado (ID: ${createdUserId})...`);
        
        const { error: deleteUserError } = await supabase
          .from('usuarios_clientes')
          .delete()
          .eq('id', createdUserId);
          
        if (deleteUserError) {
          console.error(`[${timestamp}] [CREATE_QUOTE] ❌ Erro ao remover usuário no rollback:`, {
            error: deleteUserError,
            user_id: createdUserId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`[${timestamp}] [CREATE_QUOTE] ✅ Usuário removido no rollback`);
        }
      }
      
      console.log(`[${timestamp}] [CREATE_QUOTE] ✅ ROLLBACK COMPLETO CONCLUÍDO`);
      
    } catch (rollbackError) {
      console.error(`[${timestamp}] [CREATE_QUOTE] ❌ ERRO CRÍTICO DURANTE ROLLBACK:`, {
        rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        stack: rollbackError instanceof Error ? rollbackError.stack : 'N/A',
        timestamp: new Date().toISOString()
      });
    }
    
    console.error(`\n[${timestamp}] [CREATE_QUOTE] ❌ ===== FIM DO TRATAMENTO DE ERRO =====`);
    throw error;
  }
}

/**
 * Verifica se um telefone já existe no sistema
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [CHECK_PHONE] 🔍 Verificando se telefone existe:`, phone);
    
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .select('id')
      .eq('telefone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`[${timestamp}] [CHECK_PHONE] ❌ Erro ao verificar telefone:`, {
        error: error,
        phone: phone,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    const exists = !!data;
    console.log(`[${timestamp}] [CHECK_PHONE] ${exists ? '✅ Telefone encontrado no sistema' : 'ℹ️ Telefone não encontrado'}`);
    return exists;
  } catch (error) {
    console.error(`[${timestamp}] [CHECK_PHONE] ❌ Erro ao verificar telefone:`, {
      error: error instanceof Error ? error.message : String(error),
      phone: phone,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Verifica se um e-mail já existe no sistema
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [CHECK_EMAIL] 🔍 Verificando se e-mail existe:`, email);
    
    // Buscar na tabela usuarios_clientes que contém o campo email
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`[${timestamp}] [CHECK_EMAIL] ❌ Erro ao verificar e-mail:`, {
        error: error,
        email: email,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    const exists = !!data;
    console.log(`[${timestamp}] [CHECK_EMAIL] ${exists ? '✅ E-mail encontrado no sistema' : 'ℹ️ E-mail não encontrado'}`);
    return exists;
  } catch (error) {
    console.error(`[${timestamp}] [CHECK_EMAIL] ❌ Erro ao verificar e-mail:`, {
      error: error instanceof Error ? error.message : String(error),
      email: email,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Busca usuário por e-mail e retorna seus dados
 */
export async function getUserByEmail(email: string): Promise<UsuarioCliente | null> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_USER] 🔍 Buscando usuário por e-mail:`, email);
    
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`[${timestamp}] [GET_USER] ❌ Erro ao buscar usuário por e-mail:`, {
        error: error,
        email: email,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    
    if (data) {
      console.log(`[${timestamp}] [GET_USER] ✅ Usuário encontrado:`, data.nome);
      return data;
    }
    
    console.log(`[${timestamp}] [GET_USER] ℹ️ Usuário não encontrado`);
    return null;
  } catch (error) {
    console.error(`[${timestamp}] [GET_USER] ❌ Erro ao buscar usuário por e-mail:`, {
      error: error instanceof Error ? error.message : String(error),
      email: email,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}



/**
 * Cria uma nova solicitação de orçamento para cliente cadastrado
 */
export async function createQuoteRequestForRegisteredClient(
  email: string,
  observations?: string,
  products?: CartItem[]
): Promise<{ success: boolean; message: string; quoteId?: string }> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] \n🔍 === CRIANDO SOLICITAÇÃO PARA CLIENTE CADASTRADO ===`);
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] 📧 E-mail:`, email);
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] 📝 Observações:`, observations || 'Nenhuma');
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] 🛒 Produtos:`, products?.length || 0);
    
    // 1. Buscar o usuário pelo e-mail
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado no sistema'
      };
    }
    
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] ✅ Usuário encontrado:`, user.nome);
    
    // 2. Criar dados para inserção na tabela solicitacao_orcamentos
    // Baseado na estrutura real da tabela: solicitacao_id, created_at, user_id, status, solicitacao_observacao, consultor_id
    const solicitacaoData = {
      user_id: user.id, // Referência ao usuário cadastrado
      status: 'pendente',
      solicitacao_observacao: observations || null,
      consultor_id: null // Será atribuído posteriormente se necessário
    };
    
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] 📄 Dados da solicitação:`, JSON.stringify(solicitacaoData, null, 2));
    
    // 3. Inserir na tabela solicitacao_orcamentos
    const { data: newSolicitacao, error: insertError } = await supabase
      .from('solicitacao_orcamentos')
      .insert(solicitacaoData)
      .select()
      .single();
    
    if (insertError) {
      console.error(`[${timestamp}] [CREATE_QUOTE_REGISTERED] ❌ Erro ao inserir solicitação:`, {
        error: insertError,
        email: email,
        timestamp: new Date().toISOString()
      });
      return {
        success: false,
        message: `Erro ao criar solicitação: ${insertError.message}`
      };
    }
    
    if (!newSolicitacao) {
      console.error(`[${timestamp}] [CREATE_QUOTE_REGISTERED] ❌ Solicitação foi inserida mas não retornou dados`);
      return {
        success: false,
        message: 'Solicitação foi inserida mas não retornou dados'
      };
    }
    
    console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] ✅ Solicitação criada com sucesso:`, newSolicitacao.solicitacao_id);
    
    // 4. Criar itens do orçamento usando a função existente (sem duplicação)
    if (products && products.length > 0) {
      console.log(`[${timestamp}] [CREATE_QUOTE_REGISTERED] 📝 Criando itens do orçamento...`);
      await createQuoteRequestItems(newSolicitacao.solicitacao_id.toString(), products);
    }
    
    return {
      success: true,
      message: 'Solicitação de orçamento criada com sucesso!',
      quoteId: newSolicitacao.solicitacao_id.toString()
    };
    
  } catch (error) {
    console.error(`[${timestamp}] [CREATE_QUOTE_REGISTERED] ❌ Erro geral ao criar solicitação:`, {
      error: error instanceof Error ? error.message : String(error),
      email: email,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// Função auxiliar para extrair o ID do produto ecológico com validações robustas
export function extractEcologicalId(ecologicalId: string | number): string | null {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [EXTRACT_ID] 🔧 extractEcologicalId - Input:`, ecologicalId, 'Tipo:', typeof ecologicalId);
  
  // Verificar se o input é válido
  if (ecologicalId === null || ecologicalId === undefined) {
    console.error(`[${timestamp}] [EXTRACT_ID] ❌ extractEcologicalId - Input é null ou undefined`);
    return null;
  }
  
  // Se já é um número, converter para string preservando formato
  if (typeof ecologicalId === 'number') {
    if (isNaN(ecologicalId) || ecologicalId <= 0 || !isFinite(ecologicalId)) {
      console.error(`[${timestamp}] [EXTRACT_ID] ❌ extractEcologicalId - Número inválido:`, ecologicalId);
      return null;
    }
    const validString = Math.floor(Math.abs(ecologicalId)).toString().padStart(5, '0'); // Garantir formato com 5 dígitos
    console.log(`[${timestamp}] [EXTRACT_ID] ✅ extractEcologicalId - Número convertido para string:`, validString);
    return validString;
  }
  
  // Se é string, tentar extrair código
  if (typeof ecologicalId === 'string') {
    const trimmed = ecologicalId.trim();
    
    // Verificar se é string vazia
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      console.error(`[${timestamp}] [EXTRACT_ID] ❌ extractEcologicalId - String inválida:`, trimmed);
      return null;
    }
    
    // Se já é um código numérico direto (ex: "04198")
    if (/^\d+$/.test(trimmed)) {
      console.log(`[${timestamp}] [EXTRACT_ID] ✅ extractEcologicalId - Código numérico direto:`, trimmed);
      return trimmed;
    }
    
    // Tentar extrair código do formato "ecologic-04198", "product-456", etc.
    const match = trimmed.match(/-(\d+)$/);
    if (match && match[1]) {
      const extractedCode = match[1];
      console.log(`[${timestamp}] [EXTRACT_ID] ✅ extractEcologicalId - Código extraído do padrão:`, extractedCode);
      return extractedCode;
    }
    
    // Fallback: tentar extrair qualquer sequência de dígitos
    const fallbackMatch = trimmed.match(/(\d+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      const extractedCode = fallbackMatch[1];
      console.log(`[${timestamp}] [EXTRACT_ID] ✅ extractEcologicalId - Código extraído (fallback):`, extractedCode);
      return extractedCode;
    }
    
    console.error(`[${timestamp}] [EXTRACT_ID] ❌ extractEcologicalId - Não foi possível extrair código válido da string:`, trimmed);
    return null;
  }
  
  console.error(`[${timestamp}] [EXTRACT_ID] ❌ extractEcologicalId - Tipo não suportado:`, typeof ecologicalId, 'Valor:', ecologicalId);
  return null;
}

/**
 * Cria os itens do orçamento
 */
export async function createQuoteRequestItems(
  solicitacaoId: string,
  items: CartItem[]
): Promise<ItensOrcamento[]> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 🛍️ Iniciando criação de itens do orçamento...`);
    console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 📊 Total de itens para processar: ${items.length}`);
    
    // Validar e filtrar itens válidos
    const validItemsData: ItensOrcamentoInsert[] = [];
    
    for (const item of items) {
      console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 🔍 Processando item: ${item.name}...`);
      
      // Verificar se ecologicalId existe
      if (!item.ecologicalId) {
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ ecologicalId não fornecido para o item ${item.name}. Pulando item.`);
        continue;
      }
      
      // Extrair e validar o ID do produto usando a função robusta
      const produtoEcologicoId = extractEcologicalId(item.ecologicalId);
      
      if (!produtoEcologicoId) {
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Não foi possível extrair ID válido do ecologicalId: ${item.ecologicalId}. Pulando item ${item.name}.`);
        continue;
      }

      console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 🔍 Verificando existência do produto código ${produtoEcologicoId} no banco...`);

      // Verificar na tabela ecologic_products_site (tabela correta referenciada na FK)
      // Buscar também as imagens do produto
      const { data: produto, error } = await supabase
        .from('ecologic_products_site')
        .select('codigo, titulo, img_0, img_1, img_2')
        .eq('codigo', produtoEcologicoId)
        .maybeSingle();

      if (error) {
        console.error(`[${timestamp}] [CREATE_QUOTE_ITEMS] ❌ Erro na consulta do produto código ${produtoEcologicoId}:`, error);
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Pulando item ${item.name} devido ao erro na consulta.`);
        continue;
      }
      
      if (!produto) {
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Produto ecológico código ${produtoEcologicoId} não encontrado ou inativo.`);
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Pulando item ${item.name} - produto não existe na tabela ecologic_products_site.`);
        continue;
      }
      
      console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] ✅ Produto código ${produtoEcologicoId} encontrado e válido. Adicionando ao orçamento.`);

      // Obter a URL da imagem do produto (priorizar img_0, depois img_1, depois img_2)
      const imageUrl = produto.img_0 || produto.img_1 || produto.img_2 || null;
      
      if (imageUrl) {
        console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 🖼️ URL da imagem encontrada para produto ${produtoEcologicoId}: ${imageUrl}`);
      } else {
        console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Nenhuma imagem encontrada para produto ${produtoEcologicoId}`);
      }

      // Adicionar item válido à lista - usando apenas colunas que existem na tabela products_solicitacao
      validItemsData.push({
        solicitacao_id: solicitacaoId,
        products_id: produtoEcologicoId, // Usar o código do produto validado (já é string)
        products_quantidade_01: item.quantity || 0,
        products_quantidade_02: item.quantity2 || 0,
        products_quantidade_03: item.quantity3 || 0,
        color: item.selectedColor || null,
        customizations: item.customizations ? JSON.stringify(item.customizations) : null,
        img_ref_url: imageUrl // Adicionar URL da imagem na coluna img_ref_url
      });
    }

    console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] 📊 Resumo: ${validItemsData.length} itens válidos de ${items.length} itens totais`);
    
    // Se não há itens válidos, retornar array vazio mas não falhar
    if (validItemsData.length === 0) {
      console.warn(`[${timestamp}] [CREATE_QUOTE_ITEMS] ⚠️ Nenhum item válido encontrado para o orçamento. Criando orçamento sem itens.`);
      return [];
    }

    // Inserir apenas os itens válidos
    const { data: createdItems, error: itemsError } = await supabase
      .from('products_solicitacao')  // Corrigido: usar tabela existente
      .insert(validItemsData)
      .select();

    if (itemsError) {
      console.error(`[${timestamp}] [CREATE_QUOTE_ITEMS] ❌ Erro ao inserir itens do orçamento:`, itemsError);
      throw new Error(`Erro ao criar itens do orçamento: ${itemsError.message}`);
    }

    console.log(`[${timestamp}] [CREATE_QUOTE_ITEMS] ✅ ${createdItems.length} itens criados com sucesso no orçamento.`);
    return createdItems;
  } catch (error) {
    console.error(`[${timestamp}] [CREATE_QUOTE_ITEMS] ❌ Erro no createQuoteRequestItems:`, error);
    throw error;
  }
}

/**
 * Busca um orçamento pelo ID
 */
export async function getQuoteRequest(id: string): Promise<SolicitacaoOrcamentos | null> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_QUOTE_REQUEST] 🔍 Buscando orçamento ID: ${id}...`);
    
    const { data, error } = await supabase
      .from('solicitacao_orcamentos')
      .select(`
        *,
        products_solicitacao(
          id,
          produto_nome,
          quantidade,
          valor_unitario_estimado,
          subtotal_estimado
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[${timestamp}] [GET_QUOTE_REQUEST] ❌ Erro ao buscar orçamento:`, error);
      return null;
    }

    console.log(`[${timestamp}] [GET_QUOTE_REQUEST] ✅ Orçamento encontrado com sucesso`);
    return data;
  } catch (error) {
    console.error(`[${timestamp}] [GET_QUOTE_REQUEST] ❌ Erro no getQuoteRequest:`, error);
    return null;
  }
}

/**
 * Valida todos os produtos antes de criar o orçamento
 */
export async function validateProductsBeforeQuote(items: CartItem[]): Promise<{
  validProducts: CartItem[];
  invalidProducts: { item: CartItem; reason: string }[];
  warnings: string[];
}> {
  const timestamp = new Date().toISOString();
  const validProducts: CartItem[] = [];
  const invalidProducts: { item: CartItem; reason: string }[] = [];
  const warnings: string[] = [];

  console.log(`[${timestamp}] [VALIDATE_PRODUCTS] 🔍 Validando ${items.length} produtos antes de criar orçamento...`);

  for (const item of items) {
    try {
      if (!item.ecologicalId) {
        invalidProducts.push({ item, reason: 'ecologicalId não fornecido' });
        continue;
      }

      const produtoEcologicoId = extractEcologicalId(item.ecologicalId);
      if (!produtoEcologicoId) {
        invalidProducts.push({ item, reason: `ID ecológico inválido: ${item.ecologicalId}` });
        continue;
      }

      // Verificar na tabela ecologic_products_site
      const { data: produto, error } = await supabase
        .from('ecologic_products_site')
        .select('codigo')
        .eq('codigo', produtoEcologicoId)
        .maybeSingle();

      if (error) {
        console.error(`[${timestamp}] [VALIDATE_PRODUCTS] ❌ Erro ao consultar produto ${item.name} (ID: ${produtoEcologicoId}):`, error);
        warnings.push(`Erro ao consultar produto ${item.name} (ID: ${produtoEcologicoId}): ${error.message}`);
        invalidProducts.push({ item, reason: `Erro na consulta: ${error.message}` });
        continue;
      }

      if (!produto) {
        // Tentar fallback na tabela products
        const { data: productFallback } = await supabase
          .from('products')
          .select('id, titulo')
          .eq('id', produtoEcologicoId)
          .maybeSingle();

        if (productFallback) {
          console.warn(`[${timestamp}] [VALIDATE_PRODUCTS] ⚠️ Produto ${item.name} encontrado apenas na tabela products (fallback)`);
          warnings.push(`Produto ${item.name} encontrado apenas na tabela products (fallback)`);
          validProducts.push(item);
        } else {
          console.warn(`[${timestamp}] [VALIDATE_PRODUCTS] ⚠️ Produto ${item.name} (ID: ${produtoEcologicoId}) não encontrado em nenhuma tabela`);
          warnings.push(`Produto ${item.name} (ID: ${produtoEcologicoId}) não encontrado em nenhuma tabela`);
          invalidProducts.push({ item, reason: 'Produto não encontrado no banco de dados' });
        }
      } else {
        console.log(`[${timestamp}] [VALIDATE_PRODUCTS] ✅ Produto ${item.name} validado com sucesso`);
        validProducts.push(item);
      }
    } catch (error) {
      console.error(`[${timestamp}] [VALIDATE_PRODUCTS] ❌ Erro ao validar produto ${item.name}:`, error);
      invalidProducts.push({ item, reason: `Erro na validação: ${error}` });
    }
  }

  console.log(`[${timestamp}] [VALIDATE_PRODUCTS] ✅ Validação concluída: ${validProducts.length} válidos, ${invalidProducts.length} inválidos, ${warnings.length} avisos`);
  
  return { validProducts, invalidProducts, warnings };
}

/**
 * Função principal para processar um orçamento completo
 */
export async function processQuoteRequest(quoteRequestData: QuoteRequestData): Promise<{ orcamento: SolicitacaoOrcamentos; itens: ItensOrcamento[] }> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [PROCESS_QUOTE] 🔄 Processando orçamento:`, quoteRequestData);

    // 1. Validar produtos antes de criar orçamento
    const validation = await validateProductsBeforeQuote(quoteRequestData.items);
    
    if (validation.warnings.length > 0) {
      console.warn(`[${timestamp}] [PROCESS_QUOTE] ⚠️ Avisos na validação de produtos:`, validation.warnings);
    }
    
    if (validation.invalidProducts.length > 0) {
      console.warn(`[${timestamp}] [PROCESS_QUOTE] ⚠️ Produtos com problemas encontrados:`, validation.invalidProducts);
      console.warn(`[${timestamp}] [PROCESS_QUOTE] ⚠️ Continuando com produtos válidos apenas...`);
    }

    // Usar apenas produtos válidos
    const itemsToProcess = validation.validProducts.length > 0 ? validation.validProducts : quoteRequestData.items;

    // 2. Cria o orçamento
    const orcamento = await createQuoteRequest(
      quoteRequestData.customerData,
      itemsToProcess,
      quoteRequestData.notes
    );
    console.log(`[${timestamp}] [PROCESS_QUOTE] ✅ Orçamento criado:`, orcamento);

    // Validar se o solicitacao_id existe antes de buscar os itens
    if (!orcamento.solicitacao_id) {
      throw new Error('ID da solicitação não encontrado no orçamento criado');
    }

    // 3. Busca os itens criados
    const { data: itens, error: itensError } = await supabase
      .from('products_solicitacao')
      .select('*')
      .eq('solicitacao_id', orcamento.solicitacao_id);

    if (itensError) {
      console.error(`[${timestamp}] [PROCESS_QUOTE] ❌ Erro ao buscar itens do orçamento:`, itensError);
      throw new Error('Erro ao buscar itens do orçamento');
    }

    console.log(`[${timestamp}] [PROCESS_QUOTE] ✅ Orçamento processado com sucesso:`, {
      orcamento,
      itens
    });

    return {
      orcamento,
      itens: itens || []
    };
  } catch (error) {
    console.error(`[${timestamp}] [PROCESS_QUOTE] ❌ Erro ao processar orçamento:`, error);
    throw error;
  }
}

// ===== FUNÇÕES DE CONSULTA E GERENCIAMENTO =====

/**
 * Busca todos os orçamentos com informações do usuário
 */
export const getAllQuotes = async () => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_ALL_QUOTES] 📋 Buscando todos os orçamentos...`);
    
    const { data, error } = await supabase
      .from('solicitacao_orcamentos')
      .select(`
        *,
        usuarios_clientes (
          nome,
          telefone,
          empresa
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[${timestamp}] [GET_ALL_QUOTES] ❌ Erro ao buscar orçamentos:`, error);
      throw error;
    }
    
    console.log(`[${timestamp}] [GET_ALL_QUOTES] ✅ ${data?.length || 0} orçamentos encontrados`);
    return data;
  } catch (error) {
    console.error(`[${timestamp}] [GET_ALL_QUOTES] ❌ Erro ao buscar orçamentos:`, error);
    throw error;
  }
};

/**
 * Busca orçamentos por período
 */
export const getQuotesByDateRange = async (startDate: string, endDate: string) => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_QUOTES_DATE_RANGE] 📅 Buscando orçamentos entre ${startDate} e ${endDate}...`);
    
    const { data, error } = await supabase
      .from('solicitacao_orcamentos')
      .select(`
        *,
        usuarios_clientes (
          nome,
          telefone,
          empresa
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[${timestamp}] [GET_QUOTES_DATE_RANGE] ❌ Erro ao buscar orçamentos por período:`, error);
      throw error;
    }
    
    console.log(`[${timestamp}] [GET_QUOTES_DATE_RANGE] ✅ ${data?.length || 0} orçamentos encontrados no período`);
    return data;
  } catch (error) {
    console.error(`[${timestamp}] [GET_QUOTES_DATE_RANGE] ❌ Erro ao buscar orçamentos por período:`, error);
    throw error;
  }
};

/**
 * Busca orçamento completo com todos os itens e detalhes
 */
export const getQuoteWithItems = async (quoteId: string) => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_QUOTE_WITH_ITEMS] 🔍 Buscando orçamento completo ID: ${quoteId}...`);
    
    // Buscar o orçamento principal
    const { data: quote, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .select(`
        *,
        usuarios_clientes (
          nome,
          telefone,
          empresa
        )
      `)
      .eq('id', quoteId)
      .single();
    
    if (quoteError) {
      console.error(`[${timestamp}] [GET_QUOTE_WITH_ITEMS] ❌ Erro ao buscar orçamento:`, quoteError);
      throw quoteError;
    }
    
    // Validar se o quoteId não é undefined
    if (!quoteId) {
      throw new Error('ID do orçamento é obrigatório para buscar itens');
    }

    // Buscar os itens do orçamento
    const { data: items, error: itemsError } = await supabase
      .from('products_solicitacao')
      .select(`
        *,
        ecologic_products_site (
          id,
          titulo,
          description
        )
      `)
      .eq('solicitacao_id', quoteId);
    
    if (itemsError) {
      console.error(`[${timestamp}] [GET_QUOTE_WITH_ITEMS] ❌ Erro ao buscar itens do orçamento:`, itemsError);
      throw itemsError;
    }
    
    const result = {
      ...quote,
      items: items || []
    };
    
    console.log(`[${timestamp}] [GET_QUOTE_WITH_ITEMS] ✅ Orçamento completo encontrado com ${items?.length || 0} itens`);
    return result;
  } catch (error) {
    console.error(`[${timestamp}] [GET_QUOTE_WITH_ITEMS] ❌ Erro ao buscar orçamento completo:`, error);
    throw error;
  }
};

/**
 * Busca orçamentos por usuário (telefone)
 */
export const getQuotesByClient = async (clientIdentifier: string) => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_QUOTES_BY_CLIENT] 👤 Buscando orçamentos do usuário: ${clientIdentifier}...`);
    
    const { data, error } = await supabase
      .from('solicitacao_orcamentos')
      .select(`
        *,
        usuarios_clientes!inner (
          nome,
          telefone,
          empresa
        )
      `)
      .eq('usuarios_clientes.telefone', clientIdentifier)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[${timestamp}] [GET_QUOTES_BY_CLIENT] ❌ Erro ao buscar orçamentos do usuário:`, error);
      throw error;
    }
    
    console.log(`[${timestamp}] [GET_QUOTES_BY_CLIENT] ✅ ${data?.length || 0} orçamentos encontrados para o usuário`);
    return data;
  } catch (error) {
    console.error(`[${timestamp}] [GET_QUOTES_BY_CLIENT] ❌ Erro ao buscar orçamentos do usuário:`, error);
    throw error;
  }
};

/**
 * Atualiza o status de um orçamento
 */
export const updateQuoteStatus = async (quoteId: string, status: string, notes?: string) => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [UPDATE_QUOTE_STATUS] 📝 Atualizando status do orçamento ${quoteId} para: ${status}...`);
    
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (notes) {
      updateData.observacoes = notes;
    }
    
    const { data, error } = await supabase
      .from('solicitacao_orcamentos')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single();
    
    if (error) {
      console.error(`[${timestamp}] [UPDATE_QUOTE_STATUS] ❌ Erro ao atualizar status do orçamento:`, error);
      throw error;
    }
    
    console.log(`[${timestamp}] [UPDATE_QUOTE_STATUS] ✅ Status do orçamento atualizado com sucesso`);
    return data;
  } catch (error) {
    console.error(`[${timestamp}] [UPDATE_QUOTE_STATUS] ❌ Erro ao atualizar status do orçamento:`, error);
    throw error;
  }
};

/**
 * Estatísticas dos orçamentos
 */
export const getQuoteStatistics = async () => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [GET_QUOTE_STATISTICS] 📊 Calculando estatísticas dos orçamentos...`);
    
    // Total de orçamentos
    const { count: totalQuotes, error: countError } = await supabase
      .from('solicitacao_orcamentos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error(`[${timestamp}] [GET_QUOTE_STATISTICS] ❌ Erro ao contar orçamentos:`, countError);
      throw countError;
    }
    
    // Nota: A nova tabela não tem campo valor_total, então vamos calcular baseado nos itens
    // Por enquanto, vamos usar 0 como valor padrão
    const totalValue = 0; // TODO: Implementar cálculo baseado nos itens da tabela products_solicitacao
    
    // Orçamentos do mês atual
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    
    const { count: monthlyQuotes, error: monthlyError } = await supabase
      .from('solicitacao_orcamentos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth);
    
    if (monthlyError) {
      console.error(`[${timestamp}] [GET_QUOTE_STATISTICS] ❌ Erro ao contar orçamentos mensais:`, monthlyError);
      throw monthlyError;
    }
    
    const statistics = {
      totalQuotes: totalQuotes || 0,
      totalValue,
      monthlyQuotes: monthlyQuotes || 0,
      averageValue: totalQuotes ? totalValue / totalQuotes : 0
    };
    
    console.log(`[${timestamp}] [GET_QUOTE_STATISTICS] ✅ Estatísticas calculadas:`, statistics);
    return statistics;
  } catch (error) {
    console.error(`[${timestamp}] [GET_QUOTE_STATISTICS] ❌ Erro ao calcular estatísticas:`, error);
    throw error;
  }
};