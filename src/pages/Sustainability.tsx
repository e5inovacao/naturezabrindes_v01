import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Leaf, Recycle, TreePine, Award, Users, Globe, ArrowRight } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const Sustainability: React.FC = () => {
  const commitments = [
    {
      icon: Leaf,
      title: 'Materiais Sustentáveis',
      description: 'Utilizamos apenas materiais ecológicos, reciclados e biodegradáveis em nossos produtos.',
      features: ['100% Reciclável', 'Biodegradável', 'Livre de Toxinas']
    },
    {
      icon: Recycle,
      title: 'Economia Circular',
      description: 'Promovemos a reutilização e reciclagem, reduzindo o impacto ambiental.',
      features: ['Reutilização', 'Reciclagem', 'Redução de Resíduos']
    },
    {
      icon: TreePine,
      title: 'Preservação Ambiental',
      description: 'Contribuímos para a preservação do meio ambiente através de práticas responsáveis.',
      features: ['Reflorestamento', 'Carbono Neutro', 'Preservação']
    },
    {
      icon: Award,
      title: 'Certificações',
      description: 'Nossos produtos possuem certificações ambientais reconhecidas internacionalmente.',
      features: ['ISO 14001', 'FSC Certified', 'Green Seal']
    }
  ];

  const stats = [
    { number: '100+', label: 'Produtos Sustentáveis' },
    { number: '95%', label: 'Materiais Reciclados' },
    { number: '50+', label: 'Empresas Atendidas' },
    { number: '30%', label: 'Redução de CO₂' }
  ];

  const initiatives = [
    {
      title: 'Programa de Reflorestamento',
      description: 'Para cada pedido realizado, plantamos uma árvore em parceria com ONGs ambientais.',
      impact: '1.000+ árvores plantadas'
    },
    {
      title: 'Logística Verde',
      description: 'Utilizamos embalagens 100% recicláveis e otimizamos rotas de entrega.',
      impact: '25% menos emissões'
    },
    {
      title: 'Educação Ambiental',
      description: 'Promovemos workshops e palestras sobre sustentabilidade para nossos clientes.',
      impact: '100+ pessoas impactadas'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Sustentabilidade | Natureza Brindes - Compromisso com o Meio Ambiente</title>
        <meta 
          name="description" 
          content="Conheça nosso compromisso com a sustentabilidade. Produtos ecológicos, materiais reciclados e práticas ambientalmente responsáveis para um futuro melhor."
        />
        <meta name="keywords" content="sustentabilidade, produtos ecológicos, meio ambiente, reciclagem, materiais sustentáveis" />
      </Helmet>

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="success" icon={<Globe size={16} />} className="mb-6">
              Sustentabilidade
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Nosso Compromisso com o 
              <span className="text-gradient bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Meio Ambiente
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Como uma empresa jovem e inovadora, acreditamos que é possível fazer negócios 
              de forma responsável desde o início, contribuindo para um futuro mais sustentável 
              através de produtos ecológicos e práticas ambientalmente conscientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogo">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Ver Produtos Sustentáveis
                </Button>
              </Link>
              <Link to="/contato">
                <Button variant="outline" size="lg">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Compromissos Sustentáveis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde nossa fundação, cada produto que oferecemos é resultado de práticas 
              sustentáveis e responsabilidade ambiental, estabelecendo um novo padrão no mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commitments.map((commitment, index) => {
              const IconComponent = commitment.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {commitment.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {commitment.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {commitment.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="success" size="sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossas Iniciativas Ambientais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mesmo sendo uma empresa nova, já desenvolvemos iniciativas que geram 
              impacto positivo no meio ambiente e na sociedade, provando nosso compromisso genuíno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {initiative.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {initiative.description}
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-green-600 font-bold text-lg">
                    {initiative.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Junte-se ao Movimento Sustentável
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Faça parte da mudança. Escolha produtos sustentáveis e 
              contribua para um futuro mais verde para todos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogo">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-100"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                >
                  Explorar Catálogo
                </Button>
              </Link>
              <Link to="/contato">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-green-600"
                >
                  Solicitar Consultoria
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sustainability;