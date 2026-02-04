# Formulário para Levantamento de Obreiros

Sistema de formulário multi-step para cadastro e levantamento de obreiros da igreja, com geração automática de PDF.

## 📋 Sobre o Projeto

Este é um projeto 100% front-end que permite o preenchimento de um formulário completo sobre dados de obreiros, organizando as informações em múltiplos passos (multi-step) e gerando um PDF profissional ao final.

### Funcionalidades

- ✅ Formulário dividido em 5 etapas (Dados Pessoais, Vida Espiritual, Informações Complementares, Anexos e Revisão)
- ✅ Barra de progresso visual
- ✅ Validação de campos obrigatórios
- ✅ Upload de foto 3x4 com preview
- ✅ Revisão completa antes de gerar PDF
- ✅ Salvamento automático no navegador (localStorage)
- ✅ Geração de PDF profissional com todos os dados
- ✅ Design responsivo (funciona em desktop, tablet e mobile)
- ✅ Interface limpa e moderna

## 🚀 Como Usar Localmente

### Pré-requisitos

Você só precisa de um navegador web moderno (Chrome, Firefox, Edge, Safari).

### Executando o Projeto

1. **Clone ou baixe este repositório**
   ```bash
   git clone https://github.com/seu-usuario/formularioObreiro.git
   cd formularioObreiro
   ```

2. **Abra o arquivo `index.html` no navegador**
   
   Você pode:
   - Dar duplo clique no arquivo `index.html`
   - Ou usar um servidor local (recomendado):
     ```bash
     # Se você tiver Python instalado:
     python -m http.server 8000
     # Depois acesse: http://localhost:8000
     ```

3. **Preencha o formulário**
   - Siga os passos do formulário
   - Todos os dados são salvos automaticamente
   - Faça o upload da foto 3x4
   - Revise todas as informações
   - Gere o PDF

## 📦 Deploy no GitHub Pages

### Passo a Passo para Publicar

1. **Crie um repositório no GitHub**
   - Acesse [github.com](https://github.com)
   - Clique em "New repository"
   - Nomeie como: `formulario-obreiro` (ou outro nome de sua preferência)
   - Marque como "Public"
   - Clique em "Create repository"

2. **Faça upload dos arquivos**
   
   **Opção A - Via Interface Web do GitHub:**
   - No seu repositório, clique em "Add file" > "Upload files"
   - Arraste todos os arquivos do projeto
   - Clique em "Commit changes"

   **Opção B - Via Git (linha de comando):**
   ```bash
   # Inicialize o git no projeto (se ainda não tiver)
   git init
   
   # Adicione o repositório remoto
   git remote add origin https://github.com/seu-usuario/formulario-obreiro.git
   
   # Adicione todos os arquivos
   git add .
   
   # Faça o commit
   git commit -m "Primeiro commit - Formulário de Obreiros"
   
   # Envie para o GitHub
   git branch -M main
   git push -u origin main
   ```

3. **Ative o GitHub Pages**
   - No seu repositório, vá em "Settings"
   - No menu lateral, clique em "Pages"
   - Em "Source", selecione "Deploy from a branch"
   - Em "Branch", selecione "main" e pasta "/ (root)"
   - Clique em "Save"

4. **Acesse seu site**
   - Aguarde alguns minutos (geralmente 2-5 minutos)
   - Seu site estará disponível em:
     ```
     https://seu-usuario.github.io/formulario-obreiro/
     ```

5. **Compartilhe o link**
   - Copie o link e compartilhe com quem precisar acessar o formulário

## 🗂️ Estrutura do Projeto

```
formularioObreiro/
│
├── index.html          # Página principal com o formulário
├── css/
│   └── style.css       # Estilos e design responsivo
├── js/
│   └── script.js       # Lógica do formulário e geração de PDF
├── assets/             # Pasta para imagens (se necessário)
├── README.md           # Este arquivo
└── prompt.txt          # Especificações do projeto
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura do formulário
- **CSS3** - Estilização e responsividade
- **JavaScript Vanilla** - Lógica e interatividade
- **jsPDF** - Geração de PDF (via CDN)
- **localStorage** - Salvamento temporário dos dados

## 📝 Campos do Formulário

### Step 1 - Dados Pessoais
- Nome completo
- Endereço
- Cidade
- E-mail
- Estado civil
- RG
- Situação de emprego
- Patente militar (se aplicável)
- Motivo de aposentadoria (se aplicável)
- Escolaridade

### Step 2 - Vida Espiritual
- Função atual
- Tempo na função
- Participação em grupo de intercessão
- Responsabilidade por trabalho/igreja
- Crescimento do grupo
- Visitas mensais aos irmãos
- Dizimista fiel
- Tempo na ICM
- Histórico de afastamento
- Se foi provado

### Step 3 - Informações Complementares
- Observações gerais
- Informações adicionais relevantes

### Step 4 - Anexos
- Upload de foto 3x4 (JPG ou PNG)

### Step 5 - Revisão Final
- Visualização completa de todos os dados
- Opção de editar qualquer seção
- Geração do PDF

## 💡 Recursos Técnicos

- **Validação em tempo real** - Campos obrigatórios são validados antes de avançar
- **Salvamento automático** - Dados não são perdidos se você fechar o navegador
- **Design responsivo** - Funciona perfeitamente em qualquer dispositivo
- **Código limpo e comentado** - Fácil de entender e modificar

## 🔧 Personalizações Possíveis

Você pode facilmente personalizar:

1. **Cores** - Edite as variáveis de cor no `style.css`
2. **Campos** - Adicione ou remova campos no `index.html`
3. **Layout do PDF** - Modifique a função `gerarPDF()` no `script.js`
4. **Logo** - Adicione uma imagem na pasta `assets` e inclua no cabeçalho

## 🐛 Resolução de Problemas

**Problema: PDF não é gerado**
- Verifique se todos os campos obrigatórios foram preenchidos
- Certifique-se de que a foto foi carregada
- Verifique o console do navegador para erros (F12)

**Problema: Dados não são salvos**
- Verifique se o localStorage está habilitado no navegador
- Alguns navegadores em modo privado bloqueiam localStorage

**Problema: Foto não aparece no PDF**
- Use fotos em formato JPG ou PNG
- Certifique-se de que a foto não é muito grande (máx 5MB)

## 📄 Licença

Este projeto é de uso livre para fins religiosos e educacionais.

## 👥 Suporte

Para dúvidas ou sugestões, abra uma issue no GitHub ou entre em contato.

---

**Desenvolvido para facilitar o levantamento e cadastro de obreiros** 🙏
