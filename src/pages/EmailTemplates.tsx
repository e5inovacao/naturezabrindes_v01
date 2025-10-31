import React, { useState } from 'react';
import { Mail, Eye, Copy, Check, Edit3, Play } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  htmlContent: string;
  variables: string[];
}

interface TestData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  subject: string;
  message: string;
  productsList: string;
  observations: string;
}

const EmailTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTestForm, setShowTestForm] = useState<boolean>(false);
  const [testData, setTestData] = useState<TestData>({
    clientName: 'João Silva',
    clientEmail: 'joao.silva@empresa.com.br',
    clientPhone: '(27) 99999-9999',
    clientCompany: 'Empresa Exemplo Ltda',
    subject: 'Solicitação de Orçamento - Brindes Corporativos',
    message: 'Gostaria de solicitar um orçamento para brindes corporativos para nossa empresa. Temos interesse em canecas personalizadas e agendas.',
    productsList: '• Caneca Personalizada - Quantidade: 100 unidades\n• Agenda Executiva - Quantidade: 50 unidades\n• Bolsa Térmica - Quantidade: 25 unidades',
    observations: 'Prazo desejado: 15 dias úteis. Logotipo da empresa será enviado por e-mail separadamente.'
  });

  const generateProductsWithImages = () => {
    const sampleProducts = [
      {
        name: 'Caneca Personalizada',
        code: 'CAN-001',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=personalized%20coffee%20mug%20corporate%20branding%20white%20ceramic&image_size=square'
      },
      {
        name: 'Agenda Executiva',
        code: 'AGE-002',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=executive%20planner%20notebook%20leather%20corporate%20business&image_size=square'
      },
      {
        name: 'Bolsa Térmica',
        code: 'BOL-003',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=thermal%20cooler%20bag%20insulated%20corporate%20promotional&image_size=square'
      }
    ];

    return sampleProducts.map(product => `
      <div class="product-item">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        <div class="product-name">${product.name}</div>
        <div class="product-code">Código: ${product.code}</div>
      </div>
    `).join('');
  };

  // Template de confirmação de orçamento baseado no emailService.ts
  const emailTemplates: EmailTemplate[] = [
    {
      id: 'quote-confirmation',
      name: 'Confirmação de Contato',
      subject: 'RECEBEMOS SUA SOLICITAÇÃO DE ORÇAMENTO - Natureza Brindes',
      description: 'E-mail enviado automaticamente quando um cliente solicita um orçamento através do carrinho de compras.',
      variables: ['clientName', 'clientEmail', 'clientPhone', 'clientCompany', 'message'],
      htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Solicitação - Natureza Brindes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 20px;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #2CB20B 0%, #25A009 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        .main-content {
            padding: 40px 30px;
        }
        .title {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 30px;
            letter-spacing: 0.5px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #4a5568;
        }
        .message {
            font-size: 16px;
            line-height: 1.7;
            color: #4a5568;
            margin-bottom: 30px;
        }
        .data-section {
            background-color: #f7fafc;
            border-left: 4px solid #2CB20B;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .data-title {
            color: #2CB20B;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .data-item {
            display: flex;
            margin-bottom: 12px;
            font-size: 15px;
        }
        .data-label {
            font-weight: 600;
            color: #2d3748;
            min-width: 120px;
            margin-right: 10px;
        }
        .data-value {
            color: #4a5568;
            flex: 1;
        }
        .contact-section {
            background-color: #2CB20B;
            color: white;
            padding: 30px;
            text-align: center;
            margin-top: 40px;
        }
        .contact-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .contact-info {
            font-size: 15px;
            line-height: 1.8;
        }
        .contact-info strong {
            font-weight: 600;
        }
        .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 25px 30px;
            text-align: center;
            font-size: 13px;
        }
        .footer-brand {
            color: #ffffff;
            font-weight: 600;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo">
                <img src="/favicon_branco.webp" alt="Natureza Brindes" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 8px;" />
                <div style="font-size: 32px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">Natureza Brindes</div>
            </div>
            <div class="tagline">Sua marca para todo mundo ver</div>
        </div>
        
        <div class="main-content">
            <h1 class="title">RECEBEMOS SUA SOLICITAÇÃO DE ORÇAMENTO</h1>
            
            <div class="greeting">
                Olá <strong>{{clientName}}</strong>,
            </div>
            
            <div class="message">
                <p>Recebemos sua solicitação de orçamento e nossa equipe já está trabalhando para preparar a melhor proposta para você.</p>
                <p>{{message}}</p>
            </div>
            
            <div class="data-section">
                <div class="data-title">Seus dados:</div>
                <div class="data-item">
                    <span class="data-label">Empresa:</span>
                    <span class="data-value">{{clientCompany}}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Nome:</span>
                    <span class="data-value">{{clientName}}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Telefone:</span>
                    <span class="data-value">{{clientPhone}}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">E-mail:</span>
                    <span class="data-value">{{clientEmail}}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Assunto:</span>
                    <span class="data-value">{{subject}}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Mensagem:</span>
                    <span class="data-value">{{message}}</span>
                </div>
            </div>
        </div>
        
        <div class="contact-section">
            <div class="contact-title">Atenciosamente</div>
            <div class="contact-info">
                <strong>(27) 99958-6250</strong><br>
                Rua Porto Alegre, 590<br>
                Altercosas - CEP: 29167-036<br>
                Serra - ES<br><br>
                <strong>Equipe Natureza Brindes</strong><br>
                naturezabrindes@naturezabrindes.com.br
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-brand">COPYRIGHT © 2025 Natureza Brindes</div>
            <div>Desenvolvimento E5 Inovação</div>
        </div>
    </div>
</body>
</html>`
    },
    {
      id: 'quote-request-confirmation',
      name: 'Confirmação de Solicitação de Orçamento',
      subject: 'RECEBEMOS SUA SOLICITAÇÃO DE ORÇAMENTO - Natureza Brindes',
      description: 'E-mail enviado automaticamente quando um cliente finaliza uma solicitação de orçamento através do carrinho de compras.',
      variables: ['clientName', 'clientEmail', 'clientPhone', 'clientCompany', 'subject', 'message', 'productsList', 'observations'],
      htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Solicitação de Orçamento - Natureza Brindes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2CB20B 0%, #25A009 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .logo img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
            margin-top: 5px;
        }
        .main-content {
            padding: 30px;
        }
        .title {
            color: #333;
            font-size: 20px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 30px;
            letter-spacing: 0.5px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 25px;
        }
        .message p {
            margin-bottom: 15px;
        }
        .data-section {
            margin: 25px 0;
        }
        .data-title {
            color: #333;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .data-item {
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.4;
        }
        .data-label {
            font-weight: 600;
            color: #333;
            display: inline-block;
            min-width: 80px;
        }
        .data-value {
            color: #333;
        }
        .contact-section {
            text-align: right;
            margin-top: 40px;
            font-size: 14px;
            color: #333;
            line-height: 1.4;
        }
        .contact-info {
            margin-bottom: 5px;
        }
        .footer {
            background-color: #333;
            color: #fff;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
        }
        .footer-brand {
            font-weight: 600;
            margin-bottom: 5px;
        }
        .footer-dev {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo">
                <img src="/favicon_branco.webp" alt="Natureza Brindes" />
                <div class="logo-text">Natureza Brindes</div>
                <div class="tagline">Sua marca para todo mundo ver</div>
            </div>
        </div>
        
        <div class="main-content">
            <h1 class="title">RECEBEMOS SUA SOLICITAÇÃO DE ORÇAMENTO</h1>
            
            <div class="greeting">
                Olá <strong>{{clientName}}</strong>.
            </div>
            
            <div class="message">
                <p>A Natureza Brindes agradece o seu contato.</p>
                <p>Em breve, retornaremos com nossa proposta a sua solicitação de orçamento.</p>
            </div>
            
            <div class="data-section" style="border-left: 4px solid #22c55e; padding-left: 20px; background-color: #f0fdf4; padding: 20px; border-radius: 8px;">
                <div class="data-title" style="color: #22c55e; font-size: 18px; font-weight: 700; margin-bottom: 20px;">Seus dados:</div>
                <div class="data-item" style="margin-bottom: 12px;">
                    <span class="data-label" style="font-weight: 600; color: #374151; display: inline-block; min-width: 100px;">Empresa:</span>
                    <span class="data-value" style="color: #6b7280;">Empresa Exemplo Ltda</span>
                </div>
                <div class="data-item" style="margin-bottom: 12px;">
                    <span class="data-label" style="font-weight: 600; color: #374151; display: inline-block; min-width: 100px;">Nome:</span>
                    <span class="data-value" style="color: #6b7280;">João Silva</span>
                </div>
                <div class="data-item" style="margin-bottom: 12px;">
                    <span class="data-label" style="font-weight: 600; color: #374151; display: inline-block; min-width: 100px;">Telefone:</span>
                    <span class="data-value" style="color: #6b7280;">(27) 99999-9999</span>
                </div>
                <div class="data-item" style="margin-bottom: 12px;">
                    <span class="data-label" style="font-weight: 600; color: #374151; display: inline-block; min-width: 100px;">E-mail:</span>
                    <span class="data-value" style="color: #6b7280;">joao.silva@empresa.com.br</span>
                </div>
            </div>
            
            <div class="contact-section">
                <div class="contact-info">Atenciosamente</div>
                <div class="contact-info">(27) 99958-6250</div>
                <div class="contact-info">Rua Porto Alegre, 590</div>
                <div class="contact-info">Alterosas - CEP: 29167-036</div>
                <div class="contact-info">Serra - ES</div>
                <div class="contact-info" style="margin-top: 15px;">Equipe Natureza Brindes</div>
                <div class="contact-info">naturezabrindes@naturezabrindes.com.br</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-brand">COPYRIGHT © 2025 Natureza Brindes</div>
            <div class="footer-dev">Desenvolvido por E5 Inovação</div>
        </div>
    </div>
</body>
</html>`
    }
  ];

  const processTemplateWithTestData = (htmlContent: string, data: TestData): string => {
    return htmlContent
      .replace(/{{clientName}}/g, data.clientName)
      .replace(/{{clientEmail}}/g, data.clientEmail)
      .replace(/{{clientPhone}}/g, data.clientPhone)
      .replace(/{{clientCompany}}/g, data.clientCompany)
      .replace(/{{subject}}/g, data.subject)
      .replace(/{{message}}/g, data.message)
      .replace(/{{productsWithImages}}/g, generateProductsWithImages())
      .replace(/{{productsList}}/g, data.productsList)
      .replace(/{{observations}}/g, data.observations);
  };

  const handleTestDataChange = (field: keyof TestData, value: string) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyTemplate = async (templateId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(templateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar template:', err);
    }
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTestTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTestForm(true);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
    setShowTestForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Templates de E-mail
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todos os modelos de e-mail utilizados pelo sistema.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-[#2CB20B] mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {template.description}
              </p>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Assunto:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {template.subject}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Variáveis:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-[#2CB20B] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </button>
                <button
                  onClick={() => handleTestTemplate(template)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Testar
                </button>
                <button
                  onClick={() => handleCopyTemplate(template.id, template.htmlContent)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  {copiedId === template.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal para visualização do template */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTemplate.name} {showTestForm && '- Teste com Dados'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {showTestForm ? (
                <div className="flex h-[calc(90vh-120px)]">
                  {/* Formulário de dados de teste */}
                  <div className="w-1/3 p-4 border-r bg-gray-50 overflow-auto">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Dados de Teste
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Cliente
                        </label>
                        <input
                          type="text"
                          value={testData.clientName}
                          onChange={(e) => handleTestDataChange('clientName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail do Cliente
                        </label>
                        <input
                          type="email"
                          value={testData.clientEmail}
                          onChange={(e) => handleTestDataChange('clientEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={testData.clientPhone}
                          onChange={(e) => handleTestDataChange('clientPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={testData.clientCompany}
                          onChange={(e) => handleTestDataChange('clientCompany', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                      

                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lista de Produtos
                        </label>
                        <textarea
                          value={testData.productsList}
                          onChange={(e) => handleTestDataChange('productsList', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <textarea
                          value={testData.observations}
                          onChange={(e) => handleTestDataChange('observations', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB20B]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Visualização do template com dados */}
                  <div className="flex-1 p-4 overflow-auto">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualização Prévia
                    </h4>
                    <div 
                      className="prose max-w-none border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ 
                        __html: processTemplateWithTestData(selectedTemplate.htmlContent, testData) 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Preview do E-mail:</h3>
                    <div 
                      className="border rounded-lg p-4 bg-gray-50 overflow-auto"
                      style={{ maxHeight: '400px' }}
                    >
                      <iframe
                        srcDoc={selectedTemplate.htmlContent}
                        className="w-full h-96 border-0"
                        title="Email Preview"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Código HTML:</h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
                      <code>{selectedTemplate.htmlContent}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;