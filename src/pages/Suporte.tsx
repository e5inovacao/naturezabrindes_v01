import React from 'react';
import { MessageCircle, Mail, Phone, Clock, MapPin, Headphones, CheckCircle, Users, Shield, Zap } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import SEOHead from '../components/SEOHead';

const Suporte: React.FC = () => {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Atendimento rápido e direto via WhatsApp',
      action: 'Conversar Agora',
      href: 'https://wa.me/5527999586250',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Mail,
      title: 'E-mail',
      description: 'Para dúvidas detalhadas e documentação',
      action: 'Enviar E-mail',
      href: 'mailto:suporte@naturezabrindes.com',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Phone,
      title: 'Telefone',
      description: 'Atendimento por telefone em horário comercial',
      action: 'Ligar Agora',
      href: 'tel:+5527999586250',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const supportFeatures = [
    {
      icon: CheckCircle,
      title: 'Atendimento Especializado',
      description: 'Nossa equipe é treinada para oferecer o melhor suporte em brindes sustentáveis'
    },
    {
      icon: Zap,
      title: 'Resposta Rápida',
      description: 'Respondemos suas dúvidas em até 2 horas durante horário comercial'
    },
    {
      icon: Users,
      title: 'Suporte Personalizado',
      description: 'Cada cliente recebe atendimento personalizado conforme suas necessidades'
    },
    {
      icon: Shield,
      title: 'Garantia de Qualidade',
      description: 'Oferecemos suporte completo para garantir sua satisfação'
    }
  ];

  const faqItems = [
    {
      question: 'Como posso solicitar um orçamento?',
      answer: 'Você pode solicitar um orçamento através do nosso site, WhatsApp ou e-mail. Nossa equipe retornará em até 24 horas com uma proposta personalizada.'
    },
    {
      question: 'Qual o prazo de entrega dos produtos?',
      answer: 'O prazo varia conforme o produto e quantidade. Geralmente entre 7 a 15 dias úteis após aprovação do orçamento e pagamento.'
    },
    {
      question: 'Vocês fazem personalização em pequenas quantidades?',
      answer: 'Sim! Trabalhamos com quantidades mínimas acessíveis para atender desde pequenas empresas até grandes corporações.'
    },
    {
      question: 'Como funciona o processo de personalização?',
      answer: 'Após o orçamento aprovado, nossa equipe criará um layout digital para sua aprovação antes da produção.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Suporte ao Cliente - Natureza Brindes"
        description="Entre em contato conosco para suporte especializado em brindes sustentáveis. Atendimento via WhatsApp, e-mail e telefone."
        keywords="suporte, atendimento, contato, natureza brindes, ajuda, dúvidas"
        url="/suporte"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <Headphones className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">Suporte ao Cliente</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Estamos aqui para ajudar você com qualquer dúvida sobre nossos produtos sustentáveis. 
              Nossa equipe especializada oferece suporte completo para sua experiência.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Podemos Ajudar?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o canal de atendimento que melhor se adequa à sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <div className={`${method.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <method.icon className={method.iconColor} size={36} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{method.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{method.description}</p>
                <a 
                  href={method.href} 
                  className={`${method.buttonColor} text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block`}
                >
                  {method.action}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Support Features */}
      <div className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por Que Escolher Nosso Suporte?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos um atendimento diferenciado focado na sua satisfação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre respostas rápidas para as dúvidas mais comuns
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Clock className="text-green-600" size={32} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Horário de Atendimento</h2>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Segunda a Sexta</h3>
                  <p className="text-gray-600 text-lg">08:00 às 18:00</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Sábado</h3>
                  <p className="text-gray-600 text-lg">08:00 às 12:00</p>
                </div>
              </div>
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  <MapPin className="inline mr-2" size={20} />
                  Rua Porto Alegre, 590 - Alterosas, Serra - ES, CEP: 29167-036
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ainda tem dúvidas?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar você a encontrar os melhores brindes sustentáveis para sua empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4"
              onClick={() => window.open('https://wa.me/5527999586250', '_blank')}
            >
              <MessageCircle className="mr-2" size={20} />
              Falar no WhatsApp
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4"
              onClick={() => window.location.href = 'mailto:suporte@naturezabrindes.com'}
            >
              <Mail className="mr-2" size={20} />
              Enviar E-mail
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suporte;