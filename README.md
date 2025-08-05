# Eduquinha CRM 🎓

Sistema de gestão escolar completo para educação infantil, desenvolvido com React e Supabase.

## 🚀 Tecnologias

- **Frontend**: React + Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Ícones**: Lucide React
- **Fontes**: Poppins & Quicksand

## ✨ Funcionalidades

- 🔐 **Autenticação e Autorização** - Sistema de login seguro com diferentes perfis de usuário
- 👥 **Gestão Multi-tenant** - Suporte a múltiplas escolas com subdomínios
- 👶 **Gestão de Alunos** - Cadastro completo com informações médicas e responsáveis
- 👨‍🏫 **Gestão de Professores** - Sistema de convites com troca obrigatória de senha
- 📚 **Gestão de Turmas** - Criação e edição de turmas com capacidade e período
- 📢 **Comunicados** - Sistema de avisos e comunicações
- 📅 **Eventos** - Calendário de eventos escolares
- 💰 **Controle Financeiro** - Gestão de entradas financeiras

## 📱 Perfis de Usuário

- **👑 Admin Sistema** - Acesso completo a todas as funcionalidades
- **🏫 Admin Escola** - Gestão completa da escola
- **👨‍🏫 Professor** - Acesso às suas turmas e alunos
- **👨‍👩‍👧‍👦 Responsável** - Visualização dos dados dos filhos

## 🔧 Configuração Local

1. Clone o repositório:
```bash
git clone https://github.com/agenciaspace/eduquinha.git
cd eduquinha
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

4. Execute o projeto:
```bash
npm run dev
```

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel:

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push na branch main

## 📊 Estrutura do Banco

O sistema utiliza PostgreSQL via Supabase com as seguintes tabelas principais:

- `profiles` - Perfis de usuário
- `escolas` - Dados das escolas
- `alunos` - Informações dos alunos
- `turmas` - Turmas e classes
- `comunicados` - Sistema de avisos
- `eventos` - Calendário de eventos

## 🔐 Segurança

- Row Level Security (RLS) ativado em todas as tabelas
- Autenticação via Supabase Auth
- Controle de acesso baseado em roles
- Isolamento de dados por escola (multi-tenant)

## 🛠️ Desenvolvimento

Para adicionar novas funcionalidades:

1. Crie uma nova branch: `git checkout -b feature/nova-funcionalidade`
2. Faça suas alterações
3. Execute os testes: `npm run test` (quando disponível)
4. Commit suas mudanças: `git commit -m "feat: nova funcionalidade"`
5. Push para o GitHub: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Desenvolvido por

Agência Space - [GitHub](https://github.com/agenciaspace)

---

🎯 **Eduquinha CRM** - Transformando a gestão escolar com tecnologia moderna!
