import React from 'react';
import { FileText, Scale, AlertCircle, CheckCircle, Shield, Users, Clock, Gavel } from 'lucide-react';
import Card from '../components/Card';
import SEOHead from '../components/SEOHead';

const Termos: React.FC = () => {
  const termsSections = [
    {
      icon: FileText,
      title: 'Aceitação dos Termos',
      content: 'Ao acessar e utilizar nosso site, você concorda com estes termos de uso. Se não concordar com algum dos termos, recomendamos que não utilize nossos serviços.'
    },
    {
      icon: Users,
      title: 'Uso dos Serviços',
      content: 'Nossos serviços são destinados a empresas e pessoas físicas que desejam adquirir brindes personalizados. O uso deve ser feito de forma responsável e legal.'
    },
    {
      icon: Shield,
      title: 'Proteção de Dados',
      content: 'Respeitamos sua privacidade e protegemos seus dados pessoais conforme nossa Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD).'
    },
    {
      icon: Scale,
      title: 'Responsabilidades',
      content: 'Nos comprometemos a fornecer produtos de qualidade e atendimento especializado. O cliente é responsável pelas informações fornecidas nos pedidos.'
    }
  ];

  const keyPoints = [
    {
      icon: CheckCircle,
      title: 'Orçamentos Gratuitos',
      description: 'Todos os orçamentos são gratuitos e sem compromisso de compra'
    },
    {
      icon: Clock,
      title: 'Prazos de Entrega',
      description: 'Os prazos são informados no orçamento e podem variar conforme o produto'
    },
    {
      icon: Gavel,
      title: 'Resolução de Conflitos',
      description: 'Priorizamos o diálogo para resolver qualquer questão de forma amigável'
    },
    {
      icon: AlertCircle,
      title: 'Modificações',
      description: 'Reservamos o direito de atualizar estes termos quando necessário'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Termos de Uso - Natureza Brindes"
        description="Conheça os termos de uso da Natureza Brindes. Condições claras e justas para utilização de nossos serviços de brindes sustentáveis."
        keywords="termos de uso, condições, natureza brindes, política, acordo"
        url="/termos"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <FileText className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">Termos de Uso</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Condições claras e transparentes para utilização de nossos serviços de brindes sustentáveis. 
              Construímos relações baseadas na confiança e transparência.
            </p>
          </div>
        </div>
      </div>

      {/* Key Points Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Principais Pontos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Entenda os aspectos mais importantes dos nossos termos de uso
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {keyPoints.map((point, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <point.icon className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{point.title}</h3>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Termos Detalhados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leia com atenção cada seção dos nossos termos de uso
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {termsSections.map((section, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start mb-6">
                  <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                    <section.icon className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{section.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Terms Content */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Termos e Condições Completos</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">1. Definições</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Para os fins destes Termos de Uso, consideram-se as seguintes definições:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li><strong>Natureza Brindes:</strong> Empresa especializada em brindes sustentáveis e ecológicos</li>
                    <li><strong>Usuário:</strong> Pessoa física ou jurídica que acessa nosso site ou utiliza nossos serviços</li>
                    <li><strong>Serviços:</strong> Todos os produtos e serviços oferecidos pela Natureza Brindes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">2. Uso do Site</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    O usuário compromete-se a utilizar o site de forma adequada e em conformidade com a legislação vigente, 
                    não praticando atividades ilícitas ou que possam danificar a imagem da Natureza Brindes.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">3. Orçamentos e Pedidos</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Os orçamentos fornecidos são válidos pelo prazo especificado. Os pedidos só são confirmados após 
                    aprovação do orçamento e condições de pagamento pelo cliente.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">4. Propriedade Intelectual</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Todo o conteúdo do site, incluindo textos, imagens, logos e design, são de propriedade da Natureza Brindes 
                    ou licenciados para uso, sendo protegidos pelas leis de propriedade intelectual.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">5. Limitação de Responsabilidade</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    A Natureza Brindes não se responsabiliza por danos indiretos, lucros cessantes ou prejuízos decorrentes 
                    do uso inadequado dos produtos ou serviços contratados.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">6. Modificações dos Termos</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                    imediatamente após sua publicação no site.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-green-600 mb-4">7. Lei Aplicável</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Estes termos são regidos pela legislação brasileira. Qualquer controvérsia será resolvida no foro da 
                    comarca de Serra/ES.
                  </p>
                </section>
              </div>

              <div className="mt-12 p-6 bg-green-50 rounded-lg">
                <h4 className="text-xl font-semibold text-green-800 mb-3">Última Atualização</h4>
                <p className="text-green-700">
                  Estes termos foram atualizados pela última vez em janeiro de 2025. 
                  Para dúvidas sobre estes termos, entre em contato conosco.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Dúvidas sobre os Termos?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Nossa equipe está disponível para esclarecer qualquer questão sobre nossos termos de uso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/5527999586250" 
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <FileText className="mr-2" size={20} />
              Falar no WhatsApp
            </a>
            <a 
              href="mailto:juridico@naturezabrindes.com" 
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <Scale className="mr-2" size={20} />
              E-mail Jurídico
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Termos;