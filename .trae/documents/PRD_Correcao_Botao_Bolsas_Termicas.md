# PRD – Correção de Botão "Bolsas Térmicas"

## 1. Visão Geral do Produto

Correção crítica no sistema de filtros de categoria do aplicativo Natureza Brindes para resolver a inconsistência na funcionalidade do botão "Bolsas Térmicas". O problema atual impede que usuários filtrem produtos desta categoria específica, impactando diretamente a experiência de navegação e potenciais vendas.

O objetivo é implementar uma solução de normalização de strings que garanta funcionamento consistente de todos os botões de categoria, independente de acentos, espaços múltiplos ou variações de maiúsculas/minúsculas.

## 2. Funcionalidades Principais

### 2.1 Papéis de Usuário
Não aplicável - esta correção afeta todos os usuários do sistema sem distinção de papéis.

### 2.2 Módulo de Funcionalidade

Nossa correção consiste nas seguintes implementações principais:
1. **Sistema de Normalização**: implementação de função para padronizar strings de categoria.
2. **Verificação de Estado Ativo**: função auxiliar para determinar botão ativo de forma consistente.
3. **Filtro Aprimorado**: ajuste na lógica de filtragem para usar categorias normalizadas.

### 2.3 Detalhes das Páginas

| Nome da Página | Nome do Módulo | Descrição da Funcionalidade |
|----------------|----------------|----------------------------|
| Home/Catálogo | Sistema de Normalização | Criar função `norm()` para transformar strings em minúsculas, remover acentos, múltiplos espaços e aplicar trim |
| Home/Catálogo | Verificação de Estado Ativo | Implementar função `isActive()` para comparar categoria selecionada com label do botão usando normalização |
| Home/Catálogo | Filtro de Categoria Aprimorado | Ajustar `handleCategoryFilter()` para salvar categoria normalizada no estado |
| Home/Catálogo | Botões de Categoria Atualizados | Atualizar todos os botões para usar `isActive()` e strings corretas nos onClick handlers |

## 3. Processo Principal

**Fluxo de Correção do Sistema de Filtros:**

1. Usuário clica no botão "Bolsas Térmicas"
2. Sistema executa `handleCategoryFilter('Bolsas Térmicas')`
3. Função normaliza a string usando `norm()` 
4. Estado `selectedCategory` é atualizado com valor normalizado
5. Sistema filtra produtos comparando categorias normalizadas
6. Interface atualiza botão ativo usando `isActive()`
7. Produtos da categoria são exibidos corretamente

```mermaid
graph TD
  A[Usuário clica em "Bolsas Térmicas"] --> B[handleCategoryFilter executado]
  B --> C[String normalizada com norm()]
  C --> D[selectedCategory atualizado]
  D --> E[Produtos filtrados por categoria normalizada]
  E --> F[Interface atualizada com isActive()]
  F --> G[Produtos exibidos corretamente]
```

## 4. Design da Interface do Usuário

### 4.1 Estilo de Design

- **Cores primárias**: Verde #2CB20B para botões ativos, cinza #gray-700 para inativos
- **Estilo dos botões**: Arredondados (rounded-full), com bordas e transições suaves
- **Fonte**: Texto pequeno (text-sm) com peso médio (font-medium)
- **Layout**: Botões horizontais com espaçamento interno (px-4 py-2)
- **Animações**: Transições de 200ms para mudanças de estado e efeitos hover

### 4.2 Visão Geral do Design da Página

| Nome da Página | Nome do Módulo | Elementos da UI |
|----------------|----------------|-----------------|
| Home/Catálogo | Botões de Categoria | Estilo: rounded-full, cores condicionais (#2CB20B ativo, branco inativo), transições suaves, estados de hover e disabled |
| Home/Catálogo | Feedback Visual | Indicação clara de botão ativo através de cor de fundo verde, texto branco e borda destacada |
| Home/Catálogo | Estados de Carregamento | Botões desabilitados durante `catalogState.loading` para prevenir múltiplas ações |

### 4.3 Responsividade

O design mantém a responsividade existente, sendo otimizado para desktop e mobile com adaptação automática dos botões de filtro conforme o tamanho da tela.

## 5. Implementação Técnica

### 5.1 Função de Normalização
```typescript
const norm = (s: string) => 
  s?.toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
```

### 5.2 Função de Verificação de Estado Ativo
```typescript
const isActive = (selected?: string, label?: string) => 
  norm(selected) === norm(label);
```

### 5.3 Handler de Filtro Atualizado
```typescript
function handleCategoryFilter(label: string) {
  const key = norm(label);
  setSelectedCategory(key);
  // Lógica adicional de filtragem com categoria normalizada
}
```

### 5.4 Estrutura dos Botões Corrigidos
- Uso de `isActive()` para determinar classes CSS condicionais
- onClick handlers com strings exatas ('Bolsas', 'Bolsas Térmicas')
- Estilos dinâmicos baseados no estado ativo
- Manutenção da funcionalidade de desabilitação durante carregamento

## 6. Critérios de Sucesso

- ✅ Botão "Bolsas Térmicas" filtra produtos corretamente
- ✅ Indicação visual de botão ativo funciona consistentemente
- ✅ Comparação de strings insensível a acentos e espaços
- ✅ Prevenção de erros futuros em novos botões de categoria
- ✅ Manutenção da performance e responsividade existente