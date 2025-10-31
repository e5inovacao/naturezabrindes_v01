import React from 'react';
import { Shield, Eye, Lock, Users } from 'lucide-react';

const Privacidade: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-xl opacity-90">Transparência e proteção dos seus dados pessoais</p>
          </div>
        </div>
      </div>

      {/* Icons Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold">Proteção</h3>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold">Segurança</h3>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-yellow-600" size={32} />
              </div>
              <h3 className="font-semibold">Transparência</h3>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold">Confiança</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Informações que Coletamos</h2>
                <p className="text-gray-600 mb-4">
                  Coletamos informações que você nos fornece diretamente, como:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Nome completo e dados de contato</li>
                  <li>Endereço de entrega e cobrança</li>
                  <li>Informações da empresa (CNPJ, razão social)</li>
                  <li>Detalhes dos produtos solicitados</li>
                  <li>Comunicações conosco via formulários ou e-mail</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Como Usamos suas Informações</h2>
                <p className="text-gray-600 mb-4">
                  Utilizamos suas informações para:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Processar e entregar seus pedidos</li>
                  <li>Enviar orçamentos e propostas comerciais</li>
                  <li>Comunicar sobre o status do pedido</li>
                  <li>Melhorar nossos produtos e serviços</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Compartilhamento de Informações</h2>
                <p className="text-gray-600 mb-4">
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Com transportadoras para entrega dos produtos</li>
                  <li>Com processadores de pagamento para transações</li>
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Para proteger nossos direitos e propriedade</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Segurança dos Dados</h2>
                <p className="text-gray-600 mb-4">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Criptografia de dados sensíveis</li>
                  <li>Acesso restrito às informações</li>
                  <li>Monitoramento regular de segurança</li>
                  <li>Backup seguro dos dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Seus Direitos</h2>
                <p className="text-gray-600 mb-4">
                  De acordo com a LGPD, você tem direito a:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou incorretos</li>
                  <li>Solicitar a exclusão de dados desnecessários</li>
                  <li>Revogar o consentimento a qualquer momento</li>
                  <li>Portabilidade dos dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies e Tecnologias</h2>
                <p className="text-gray-600 mb-4">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site, analisar o tráfego e personalizar conteúdo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Retenção de Dados</h2>
                <p className="text-gray-600 mb-4">
                  Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contato</h2>
                <p className="text-gray-600 mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>E-mail: privacidade@naturezabrindes.com</li>
                  <li>Telefone: (27) 99958-6250</li>
                  <li>Endereço: Rua das Flores, 123 - São Paulo, SP</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Alterações na Política</h2>
                <p className="text-gray-600">
                  Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas por e-mail ou através de nosso site.
                </p>
                <p className="text-gray-500 mt-4 text-sm">
                  Última atualização: Janeiro de 2024
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacidade;