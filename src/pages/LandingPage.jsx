import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  Shield, 
  Heart, 
  Star, 
  Check, 
  ArrowRight,
  Play,
  Calendar,
  MessageCircle,
  Camera,
  BarChart3,
  Clock,
  Award,
  Smartphone,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const features = [
    {
      icon: Users,
      title: "Gestão Completa de Alunos",
      description: "Cadastro detalhado com informações médicas, contatos de emergência e acompanhamento personalizado de cada criança."
    },
    {
      icon: Calendar,
      title: "Rotinas Diárias Detalhadas",
      description: "Registro completo de alimentação, sono, higiene e humor. Os pais acompanham tudo em tempo real."
    },
    {
      icon: MessageCircle,
      title: "Comunicação Direta",
      description: "Chat integrado entre professores e pais, comunicados da escola e notificações importantes."
    },
    {
      icon: Camera,
      title: "Galeria de Fotos Segura",
      description: "Compartilhamento seguro de momentos especiais com controle de privacidade e acesso restrito."
    },
    {
      icon: BarChart3,
      title: "Relatórios e Analytics",
      description: "Dashboards intuitivos com métricas de desenvolvimento, frequência e relatórios personalizados."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Criptografia end-to-end, backup automático e controle de acesso por perfis diferenciados."
    }
  ]

  const benefits = [
    {
      title: "Para Professores",
      description: "Simplifique o registro de atividades e mantenha os pais sempre informados",
      items: [
        "Registro rápido de rotinas",
        "Comunicação eficiente com pais",
        "Menos papelada administrativa",
        "Foco no que importa: educar"
      ]
    },
    {
      title: "Para Pais",
      description: "Acompanhe o desenvolvimento do seu filho em tempo real",
      items: [
        "Relatórios diários detalhados",
        "Fotos e momentos especiais",
        "Comunicação direta com professores",
        "Tranquilidade e confiança"
      ]
    },
    {
      title: "Para Administradores",
      description: "Gerencie toda a escola com eficiência e transparência",
      items: [
        "Dashboard executivo completo",
        "Controle financeiro integrado",
        "Relatórios de performance",
        "Gestão de equipe simplificada"
      ]
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Diretora - Escola Pequenos Genios",
      content: "O Eduquinha revolucionou nossa gestão. Pais mais satisfeitos, professores mais eficientes e toda escola conectada.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Professor - CEI Arco-Íris",
      content: "Economizo 2 horas por dia no registro das atividades. Agora posso focar 100% nas crianças.",
      rating: 5
    },
    {
      name: "Ana Oliveira",
      role: "Mãe - Aluna Sofia",
      content: "Recebo todas as informações da minha filha no celular. É incrível ver o desenvolvimento dela todos os dias.",
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: "Essencial",
      price: "R$ 12",
      period: "por aluno/mês",
      description: "Ideal para escolas pequenas",
      features: [
        "Até 50 alunos",
        "Rotinas básicas",
        "Comunicados",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 8",
      period: "por aluno/mês",
      description: "Perfeito para a maioria das escolas",
      features: [
        "Até 200 alunos",
        "Rotinas completas",
        "Chat em tempo real",
        "Relatórios avançados",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "consulte-nos",
      description: "Para redes de escolas",
      features: [
        "Alunos ilimitados",
        "Multi-unidades",
        "API personalizada",
        "Treinamento incluso",
        "Suporte 24/7"
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Eduquinha</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-gray-900 transition-colors">
                Recursos
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-gray-900 transition-colors">
                Benefícios
              </a>
              <a href="#precos" className="text-gray-600 hover:text-gray-900 transition-colors">
                Preços
              </a>
              <a href="#contato" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contato
              </a>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200"
              >
                Entrar
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4">
              <div className="flex flex-col space-y-4">
                <a href="#recursos" className="text-gray-600 hover:text-gray-900">
                  Recursos
                </a>
                <a href="#beneficios" className="text-gray-600 hover:text-gray-900">
                  Benefícios
                </a>
                <a href="#precos" className="text-gray-600 hover:text-gray-900">
                  Preços
                </a>
                <a href="#contato" className="text-gray-600 hover:text-gray-900">
                  Contato
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-center"
                >
                  Entrar
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Plataforma completa para educação infantil</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  A revolução na 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent block">
                    educação infantil
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Conecte escola, professores e famílias em uma plataforma segura e intuitiva. 
                  Acompanhe o desenvolvimento das crianças em tempo real com relatórios detalhados e comunicação eficiente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-500 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-200 hover:bg-blue-600 flex items-center gap-2 text-lg"
                >
                  <span>Começar Gratuitamente</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button className="bg-gray-200 text-gray-500 py-4 px-8 rounded-xl font-semibold cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-lg" disabled>
                  <Play className="w-5 h-5" />
                  <span>Ver Demonstração</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Teste grátis por 30 dias</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Sem taxa de configuração</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="eduquinha-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="eduquinha-icon-circle w-12 h-12 bg-gradient-to-br from-green-400 to-green-600">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Rotina de Sofia</h3>
                      <p className="text-gray-600 text-sm">Atualizado há 5 min</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <span className="text-sm font-medium text-green-800">Almoço</span>
                      <span className="eduquinha-badge-success">Completo</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <span className="text-sm font-medium text-blue-800">Sono da tarde</span>
                      <span className="text-blue-600 font-medium">14:00 - 15:30</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                      <span className="text-sm font-medium text-yellow-800">Humor</span>
                      <span className="text-yellow-600 font-medium">😊 Feliz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements - reduced opacity */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce eduquinha-decorative">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-md animate-pulse eduquinha-decorative">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos Completos para Educação Infantil
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar sua escola e manter as famílias conectadas 
              com o desenvolvimento das crianças.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="eduquinha-card">
                <div className="eduquinha-icon-circle mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Benefícios para Todos
            </h2>
            <p className="text-xl text-gray-600">
              Cada pessoa da comunidade escolar tem suas necessidades atendidas
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="eduquinha-card">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {benefit.description}
                </p>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quem Usa Recomenda
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que educadores e pais falam sobre o Eduquinha
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="eduquinha-card bg-gray-50">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para sua escola
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl p-8 shadow-lg relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  Começar Agora
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Precisa de mais informações? Entre em contato para um plano personalizado.
            </p>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200">
              Falar com Especialista →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Revolucionar sua Escola?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de escolas que já transformaram sua gestão com o Eduquinha
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Começar Teste Gratuito
            </button>
            <button className="bg-gray-200 text-gray-500 px-8 py-4 rounded-xl font-semibold cursor-not-allowed transition-all duration-200" disabled>
              Agendar Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Eduquinha</span>
              </div>
              <p className="text-gray-400">
                Revolucionando a educação infantil através da tecnologia e do cuidado personalizado.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Treinamentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>contato@eduquinha.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Eduquinha. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}