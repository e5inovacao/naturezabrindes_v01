/**
 * Utilitários para transformação de dados entre frontend e backend
 * Resolve discrepâncias de nomenclatura e estrutura de dados
 */

// Interfaces para padronização
export interface StandardCustomerData {
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj?: string;
  position?: string;
}

export interface StandardQuoteItem {
  id: string;
  name: string;
  quantity: number;
  customizations?: any;
  ecologicalId?: string;
  color?: string;
  unitPrice?: number;
  observations?: string;
}

export interface StandardQuoteData {
  customerData: StandardCustomerData;
  items: StandardQuoteItem[];
  notes: string;
  deliveryAddress?: any;
  urgencyLevel?: string;
  eventDate?: string;
}

/**
 * Transforma dados do QuoteForm para o formato padrão
 */
export function transformQuoteFormData(formData: any, cartItems: any[], observations: string): StandardQuoteData {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DataTransform] Transformando dados do QuoteForm:`, {
    formData: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      cnpj: formData.cnpj
    },
    cartItemsCount: cartItems.length,
    observations: observations?.length || 0
  });

  // Transformar dados do cliente
  const customerData: StandardCustomerData = {
    name: formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    company: formData.company || '',
    cnpj: formData.cnpj || undefined,
    position: formData.position || undefined
  };

  // Transformar itens do carrinho
  const items: StandardQuoteItem[] = cartItems.map((item, index) => {
    const transformedItem = {
      id: item.id || item.productId || `item_${index}`,
      name: item.nome || item.name || item.productName || 'Produto sem nome',
      quantity: item.quantity || 1,
      customizations: item.customizations || item.personalizacoes || null,
      ecologicalId: item.ecologicalId || item.codigo || item.code || undefined,
      color: item.color || item.selectedColor || item.cor || undefined,
      unitPrice: item.unitPrice || item.preco || item.price || 0,
      observations: item.observations || item.observacoes || item.notes || undefined
    };

    console.log(`[${timestamp}] [DataTransform] Item ${index + 1} transformado:`, {
      original: {
        id: item.id,
        nome: item.nome,
        name: item.name,
        quantity: item.quantity
      },
      transformed: {
        id: transformedItem.id,
        name: transformedItem.name,
        quantity: transformedItem.quantity
      }
    });

    return transformedItem;
  });

  const result: StandardQuoteData = {
    customerData,
    items,
    notes: observations || formData.observations || ''
  };

  console.log(`[${timestamp}] [DataTransform] Dados transformados com sucesso:`, {
    customer: {
      name: result.customerData.name,
      email: result.customerData.email,
      company: result.customerData.company
    },
    itemsCount: result.items.length,
    notesLength: result.notes.length
  });

  return result;
}

/**
 * Transforma dados do Quote.tsx para o formato padrão
 */
export function transformQuotePageData(formData: any, cartItems: any[], preSelectedProduct?: any): StandardQuoteData {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DataTransform] Transformando dados do Quote.tsx:`, {
    customerInfo: formData.customerInfo,
    cartItemsCount: cartItems.length,
    hasPreSelected: !!preSelectedProduct
  });

  // Transformar dados do cliente
  const customerData: StandardCustomerData = {
    name: formData.customerInfo?.name || '',
    email: formData.customerInfo?.email || '',
    phone: formData.customerInfo?.phone || '',
    company: formData.customerInfo?.company || '',
    position: formData.customerInfo?.position || undefined
  };

  // Determinar itens (carrinho ou produto pré-selecionado)
  const sourceItems = preSelectedProduct ? [preSelectedProduct] : cartItems;
  
  // Transformar itens
  const items: StandardQuoteItem[] = sourceItems.map((item, index) => {
    const transformedItem = {
      id: item.product?.id || item.productId || item.id || `item_${index}`,
      name: item.product?.name || item.productName || item.name || item.nome || 'Produto sem nome',
      quantity: item.quantity || 1,
      customizations: item.customizations || item.personalizacoes || {},
      observations: item.notes || item.observations || item.observacoes || undefined
    };

    console.log(`[${timestamp}] [DataTransform] Item Quote ${index + 1} transformado:`, {
      original: {
        productId: item.product?.id || item.productId,
        productName: item.product?.name || item.productName,
        quantity: item.quantity
      },
      transformed: {
        id: transformedItem.id,
        name: transformedItem.name,
        quantity: transformedItem.quantity
      }
    });

    return transformedItem;
  });

  const result: StandardQuoteData = {
    customerData,
    items,
    notes: formData.additionalNotes || '',
    deliveryAddress: formData.deliveryAddress,
    urgencyLevel: formData.urgencyLevel,
    eventDate: formData.eventDate
  };

  console.log(`[${timestamp}] [DataTransform] Dados Quote transformados com sucesso:`, {
    customer: {
      name: result.customerData.name,
      email: result.customerData.email,
      company: result.customerData.company
    },
    itemsCount: result.items.length,
    notesLength: result.notes.length,
    urgencyLevel: result.urgencyLevel
  });

  return result;
}

/**
 * Transforma dados padronizados para o formato esperado pelo backend
 */
export function transformForBackend(standardData: StandardQuoteData) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DataTransform] Transformando para backend:`, {
    customerName: standardData.customerData.name,
    itemsCount: standardData.items.length
  });

  // Mapear campos para o formato esperado pelo backend
  const backendData = {
    // Dados do cliente - mapeamento para campos do banco
    cliente: {
      nome: standardData.customerData.name,
      email: standardData.customerData.email,
      telefone: standardData.customerData.phone,
      empresa: standardData.customerData.company,
      cnpj: standardData.customerData.cnpj || null,
      cargo: standardData.customerData.position || null
    },
    // Itens do orçamento
    itens: standardData.items.map((item, index) => ({
      produto_id: item.id,
      nome_produto: item.name,
      quantidade: item.quantity,
      personalizacoes: item.customizations ? JSON.stringify(item.customizations) : null,
      codigo_ecologico: item.ecologicalId || null,
      cor: item.color || null,
      preco_unitario: item.unitPrice || null,
      observacoes: item.observations || null
    })),
    // Observações gerais
    observacoes: standardData.notes || null,
    // Dados adicionais do Quote.tsx
    endereco_entrega: standardData.deliveryAddress ? {
      rua: standardData.deliveryAddress.street,
      numero: standardData.deliveryAddress.number,
      complemento: standardData.deliveryAddress.complement,
      bairro: standardData.deliveryAddress.neighborhood,
      cidade: standardData.deliveryAddress.city,
      estado: standardData.deliveryAddress.state,
      cep: standardData.deliveryAddress.zipCode
    } : null,
    nivel_urgencia: standardData.urgencyLevel || 'normal',
    data_evento: standardData.eventDate || null
  };

  console.log(`[${timestamp}] [DataTransform] Dados transformados para backend:`, {
    cliente: {
      nome: backendData.cliente.nome,
      email: backendData.cliente.email,
      empresa: backendData.cliente.empresa
    },
    itens_count: backendData.itens.length,
    tem_endereco: !!backendData.endereco_entrega,
    nivel_urgencia: backendData.nivel_urgencia
  });

  return backendData;
}

/**
 * Valida dados padronizados antes do envio
 */
export function validateStandardData(data: StandardQuoteData): { isValid: boolean; errors: string[] } {
  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  console.log(`[${timestamp}] [DataTransform] Validando dados padronizados`);

  // Validar dados do cliente
  if (!data.customerData.name?.trim()) {
    errors.push('Nome do cliente é obrigatório');
  }
  if (!data.customerData.email?.trim()) {
    errors.push('E-mail do cliente é obrigatório');
  }
  if (!data.customerData.phone?.trim()) {
    errors.push('Telefone do cliente é obrigatório');
  }
  if (!data.customerData.company?.trim()) {
    errors.push('Empresa do cliente é obrigatória');
  }

  // Validar itens
  if (!data.items || data.items.length === 0) {
    errors.push('Pelo menos um item é obrigatório');
  } else {
    data.items.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors.push(`Nome do item ${index + 1} é obrigatório`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Quantidade do item ${index + 1} deve ser maior que zero`);
      }
    });
  }

  const isValid = errors.length === 0;

  console.log(`[${timestamp}] [DataTransform] Validação concluída:`, {
    isValid,
    errorsCount: errors.length,
    errors: errors
  });

  return { isValid, errors };
}

/**
 * Função utilitária para log de transformação de dados
 */
export function logDataTransformation(step: string, originalData: any, transformedData: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DataTransform] ${step}:`, {
    original: originalData,
    transformed: transformedData,
    timestamp
  });
}