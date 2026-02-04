# Formulário para Levantamento de Obreiros - ICM

Sistema completo de formulário multi-step (14 etapas) para cadastro e levantamento de obreiros da Igreja Cristã Maranata.

## ✨ Funcionalidades

- ✅ 14 etapas organizadas com validação
- ✅ Campos condicionais dinâmicos
- ✅ Busca automática de CEP (ViaCEP)
- ✅ Upload de foto 3x4 com preview
- ✅ Repetidores (seminários e mensagens)
- ✅ Salvamento automático (LocalStorage)
- ✅ Design responsivo mobile-first
- ✅ Geração de PDF profissional
- ✅ Máscaras automáticas (CPF, telefone, CEP)

## 🚀 Como Usar

1. Abra `index.html` no navegador
2. Preencha as 14 etapas do formulário
3. Revise todos os dados
4. Gere o PDF

## 📦 Deploy GitHub Pages

```bash
git init
git add .
git commit -m "Formulário ICM"
git branch -M main
git remote add origin https://github.com/seu-usuario/formulario-obreiro.git
git push -u origin main
```

Ative Pages em: Settings → Pages → Branch: main → Save

## 🗂️ Estrutura

```
formulárioObreiro/
├── index.html              # HTML principal
├── steps-completos.html    # Steps 5-14 (adicionar ao index)
├── css/style.css           # Estilos
├── js/script.js            # Lógica
└── README.md               # Documentação
```

## 📝 Etapas do Formulário

1. **Identificação e Endereço** - Dados pessoais, contato, endereço com CEP
2. **Dados Profissionais** - Situação de emprego (CLT/Autônomo/Aposentado)
3. **Dados Militares** - Patente e arma (se aplicável)
4. **Vida Ministerial** - Função, tempo na ICM, dizimista
5. **Histórico Espiritual** - Afastamento, provações, seminários
6. **Conduta** - Voluntário, cultos, governo do lar
7. **Dons Espirituais** - Línguas, interpretação, revelação
8. **Dados Familiares** - Casamento, esposa, filhos
9. **Formação** - Bíblia, EBD, satélite, Instituto Bíblico
10. **Experiências** - Clamor, oração, jejum, madrugada
11. **Mensagens Reveladas** - Referências bíblicas (repetidor)
12. **Questionário Teológico** - 7 perguntas doutrinárias
13. **Questionário da Esposa** - Concordância e compromissos
14. **Revisão Final** - Conferir e gerar PDF

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript Vanilla
- jsPDF (geração de PDF)
- ViaCEP API (busca de endereço)
- LocalStorage (salvamento automático)

## ⚙️ Próximos Passos

Para completar o formulário:

1. **Copie os steps 5-14** do arquivo `steps-completos.html` para o `index.html` (substituir o step 5 placeholder)
2. **Teste todas as funcionalidades**
3. **Personalize o PDF** na função `gerarPDF()` do `script.js`
4. **Adicione logo da ICM** (opcional) na pasta `assets/`

## 📞 Suporte

Projeto desenvolvido para a ICM. Para dúvidas, consulte a equipe de tecnologia.

---

**Igreja Cristã Maranata** 🙏
