"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Button from "./components/button";

export default function Home() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Teste de CSS */}
      {/* <div className="test-bg">
        <h2>TESTE: Se você vê este texto branco em fundo vermelho, o CSS está funcionando!</h2>
        <p>Esta é uma verificação básica de que o Tailwind CSS está sendo aplicado corretamente.</p>
      </div> */}

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Propriedades Inteligentes
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema completo para gestão rural moderna
        </p>
      </div>

      {/* <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-500/10"></div> */}
      {/* <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div> */}

      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge de Destaque */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8">
              🚀 Sistema Completo para Produtores Rurais
            </div>

            {/* Título Principal - Poderoso */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sua Fazenda na
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Palma da Mão
              </span>
            </h1>

            {/* Subtítulo Persuasivo */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Pare de perder tempo com planilhas e cadernos. Tenha{" "}
              <strong>controle total</strong> das suas propriedades, animais,
              máquinas e plantações em um só lugar.{" "}
            </p>

            {/* Métricas de Credibilidade */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Acesso Seguro</div>
              </div>
            </div>

            {/* CTAs Principais */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🏠 Acessar Meu Painel
                </Link>
              ) : (
                <>
                  <Button
                    onClick={() => signIn("google")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    🚀 Começar Agora
                  </Button>
                </>
              )}
            </div>

            {/* Prova Social */}
            <div className="text-center">
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-xs text-gray-400">⭐⭐⭐⭐⭐</div>
                <div className="text-xs text-gray-400">🔒 100% Seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Problemas e Soluções */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Você Ainda Perde Tempo Com Isso?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como você pode organizar sua gestão rural de forma
              simples!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problemas */}
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6">
                ❌ Problemas Comuns
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <span className="text-red-500 text-xl">📝</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Planilhas Desatualizadas
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Dados espalhados em Excel, cadernos e papel
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <span className="text-red-500 text-xl">⏰</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Perda de Tempo
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Horas procurando informações importantes
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <span className="text-red-500 text-xl">💸</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Perdas Financeiras
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Decisões tomadas sem dados precisos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <span className="text-red-500 text-xl">📱</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Sem Mobilidade
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Acesso limitado ao escritório
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Soluções */}
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6">
                ✅ Nossa Solução
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-green-500 text-xl">☁️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Sistema na Nuvem
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Acesse de qualquer lugar, a qualquer hora
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-green-500 text-xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Relatórios Automáticos
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Dashboards e gráficos em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-green-500 text-xl">🔒</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Segurança Total
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Dados criptografados e backup automático
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-green-500 text-xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Sem complicação
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Comece a usar em menos de 5 minutos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA após problemas/soluções */}
          <div className="text-center mt-16">
            {!session && (
              <Button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 Começar Agora
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Funcionalidades Avançadas */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo Que Você Precisa em Um Só Lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistema completo para gestão rural moderna e eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Funcionalidade 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">H</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Propriedades Inteligentes
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Cadastre fazendas, terrenos, pastagens e áreas de plantio com
                localização GPS, tamanho e características específicas de cada
                propriedade.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span className="text-sm">✅ Funcional</span>
              </div>
            </div>

            {/* Funcionalidade 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">A</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Gestão de Rebanhos
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Controle completo de animais: raças, idades, saúde, reprodução,
                pesos e produtividade individual e coletiva.
              </p>
              <div className="flex items-center text-orange-600 font-semibold">
                <span className="text-sm">🚧 Em Desenvolvimento</span>
              </div>
            </div>

            {/* Funcionalidade 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">M</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Frota de Máquinas
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Inventário completo de tratores, colheitadeiras, implementos e
                equipamentos com controle de manutenção e custos operacionais.
              </p>
              <div className="flex items-center text-orange-600 font-semibold">
                <span className="text-sm">Em Desenvolvimento</span>
              </div>
            </div>

            {/* Funcionalidade 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">🌾</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Monitoramento de Culturas
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Acompanhe o ciclo completo das plantações: semeadura,
                crescimento, irrigação, pragas e colheita com dados precisos.
              </p>
              <div className="flex items-center text-orange-600 font-semibold">
                <span className="text-sm">🚧 Em Desenvolvimento</span>
              </div>
            </div>

            {/* Funcionalidade 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Dashboards Analíticos
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Relatórios automáticos, gráficos interativos e métricas de
                produtividade para tomada de decisões baseada em dados.
              </p>
              <div className="flex items-center text-orange-600 font-semibold">
                <span className="text-sm">🚧 Em Desenvolvimento</span>
              </div>
            </div>

            {/* Funcionalidade 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-2xl w-16 h-16 mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Segurança Empresarial
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Autenticação robusta, criptografia de dados, backups automáticos
                e controle de acesso por propriedade e usuário.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span className="text-sm">✅ Funcional</span>
              </div>
            </div>
          </div>

          {/* CTA após funcionalidades */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Comece hoje mesmo e tenha controle total das suas propriedades
            </p>
            {!session && (
              <Button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 Começar Agora
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o sistema
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                💰 Como funciona o sistema?
              </h3>
              <p className="text-gray-600">
                Oferecemos planos acessíveis baseados no tamanho da sua
                propriedade. Entre em contato conosco para conhecer as opções
                disponíveis.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                🔒 Meus dados estão seguros?
              </h3>
              <p className="text-gray-600">
                Absolutamente. Utilizamos criptografia de ponta a ponta,
                servidores seguros na nuvem, backups automáticos e controle
                rigoroso de acesso. Seus dados agrícolas são tratados com o
                mesmo nível de segurança que bancos utilizam.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                📱 Posso acessar pelo celular?
              </h3>
              <p className="text-gray-600">
                Sim! O sistema é totalmente responsivo e funciona perfeitamente
                em smartphones, tablets e computadores. Você pode gerenciar suas
                propriedades mesmo no campo, sem precisar voltar ao escritório.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                ⚙️ Preciso instalar algum programa?
              </h3>
              <p className="text-gray-600">
                Não! É um sistema 100% na nuvem. Basta ter acesso à internet e
                um navegador moderno (Chrome, Firefox, Safari ou Edge). Funciona
                em qualquer dispositivo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                📊 Posso exportar meus dados?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode exportar relatórios em PDF, Excel e CSV a
                qualquer momento. Seus dados são sempre seus - você pode
                solicitar uma exportação completa ou exclusão total da conta
                quando desejar.
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-2xl text-white">
              <h3 className="text-3xl font-bold mb-4">
                Pronto para Transformar Sua Gestão Rural?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Junte-se a centenas de produtores que já estão no futuro da
                agricultura
              </p>
              {!session && (
                <Button
                  onClick={() => signIn("google")}
                  className="bg-white text-gray-900 px-12 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚀 Começar Agora
                </Button>
              )}
              {session && (
                <Link
                  href="/dashboard"
                  className="inline-block bg-white text-gray-900 px-12 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🏠 Acessar Meu Sistema
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Login Alternativo - Apenas para visitantes */}
      {!session && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-600 mb-4">
              Preferir login por e-mail?{" "}
              <span className="font-semibold">Sem problema!</span>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn("email", { email });
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap"
              >
                Entrar
              </Button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              Receberá um link mágico no seu e-mail para acesso instantâneo
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
