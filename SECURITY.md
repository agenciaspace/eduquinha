# 🔐 Guia de Segurança - Eduquinha CRM

## ✅ Variáveis de Ambiente Seguras

### **Nunca Faça:**
- ❌ Commitar arquivos `.env` no Git
- ❌ Compartilhar chaves em mensagens/emails
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Expor chaves em frontend sem necessidade

### **Sempre Faça:**
- ✅ Use variáveis de ambiente na Vercel
- ✅ Mantenha `.env` no `.gitignore`
- ✅ Regenere chaves se expostas
- ✅ Use RLS (Row Level Security) no Supabase
- ✅ Monitore logs de acesso

## 🔑 Tipos de Chaves Supabase

### **1. Anon Key (Pública)**
- ✅ Segura para uso no frontend
- ✅ Limitada pelo RLS (Row Level Security)
- ✅ Pode ser exposta em builds (mas não deve)

### **2. Service Role Key (Privada)**
- ❌ NUNCA use no frontend
- ❌ NUNCA commite no código
- ✅ Apenas para backend/APIs privadas

## 🛡️ Configuração Atual

```bash
# ✅ Arquivo .env.example (pode ser commitado)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ❌ Arquivo .env (NUNCA commitar)
VITE_SUPABASE_URL=https://seuprojetoreal.supabase.co
VITE_SUPABASE_ANON_KEY=sua.chave.real.aqui
```

## 🔄 Em Caso de Exposição

1. **Regenerar chaves imediatamente no Supabase**
2. **Atualizar variáveis na Vercel**
3. **Redeploy da aplicação**
4. **Verificar logs por atividade suspeita**

## 🚀 Deploy Seguro

### **Vercel**
- Variáveis criptografadas
- Isolamento por projeto
- Acesso controlado por equipe
- Logs de auditoria

### **Supabase**
- RLS ativado em todas as tabelas
- Políticas de segurança por role
- JWT tokens com expiração
- Isolamento multi-tenant

## 📊 Monitoramento

- Monitore dashboard do Supabase por atividade incomum
- Configure alertas para uso excessivo
- Revise regularmente permissões de usuário

---

🔐 **Lembre-se**: Segurança é responsabilidade compartilhada!