// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let currentStep = 1;
const totalSteps = 5;
let formData = {};
let fotoBase64 = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos do localStorage
    loadFromLocalStorage();
    
    // Atualizar barra de progresso
    updateProgressBar();
    
    // Adicionar listeners para salvar dados automaticamente
    addAutoSaveListeners();
});

// ========================================
// NAVEGAÇÃO ENTRE STEPS
// ========================================

function nextStep() {
    // Validar o step atual antes de avançar
    if (!validateCurrentStep()) {
        return;
    }
    
    // Salvar dados do step atual
    saveCurrentStepData();
    
    // Se estiver no step 4, ir para revisão (step 5)
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        
        // Se chegou no step de revisão, preencher os dados
        if (currentStep === 5) {
            preencherRevisao();
        }
    }
    
    updateProgressBar();
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgressBar();
    }
}

function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        saveCurrentStepData();
        currentStep = step;
        showStep(currentStep);
        
        if (currentStep === 5) {
            preencherRevisao();
        }
        
        updateProgressBar();
    }
}

function showStep(step) {
    // Esconder todos os steps
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(s => s.classList.remove('active'));
    
    // Mostrar o step atual
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// BARRA DE PROGRESSO
// ========================================

function updateProgressBar() {
    // Atualizar a barra
    const progressBar = document.querySelector('.progress-bar::before') || 
                        document.querySelector('.progress-bar');
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    // Criar style se não existir
    let style = document.getElementById('progressStyle');
    if (!style) {
        style = document.createElement('style');
        style.id = 'progressStyle';
        document.head.appendChild(style);
    }
    style.textContent = `.progress-bar::before { width: ${percentage}% !important; }`;
    
    // Atualizar os círculos dos steps
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// ========================================
// VALIDAÇÃO DO FORMULÁRIO
// ========================================

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return true;
    
    // Obter todos os campos obrigatórios do step atual
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    let errorMessage = '';
    
    requiredFields.forEach(field => {
        // Validação para radio buttons
        if (field.type === 'radio') {
            const radioGroup = currentStepElement.querySelectorAll(`[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                if (!errorMessage) {
                    errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
                }
            }
        }
        // Validação para outros campos
        else if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#f44336';
            
            if (!errorMessage) {
                errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
            }
        } else {
            field.style.borderColor = '#e0e0e0';
        }
        
        // Validação específica para email
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                field.style.borderColor = '#f44336';
                errorMessage = 'Por favor, insira um e-mail válido.';
            }
        }
    });
    
    // Validação específica para foto no step 4
    if (currentStep === 4 && !fotoBase64) {
        isValid = false;
        errorMessage = 'Por favor, faça o upload da foto 3x4.';
    }
    
    // Mostrar ou esconder mensagem de erro
    if (!isValid) {
        showError(errorMessage);
    } else {
        hideError();
    }
    
    return isValid;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Esconder após 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

// ========================================
// MANIPULAÇÃO DE DADOS
// ========================================

function saveCurrentStepData() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return;
    
    // Obter todos os inputs, selects e textareas
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else if (input.type === 'file') {
            // Arquivo já foi processado em previewFoto
        } else {
            formData[input.name] = input.value;
        }
    });
    
    // Salvar no localStorage
    saveToLocalStorage();
}

function saveToLocalStorage() {
    localStorage.setItem('obreiroFormData', JSON.stringify(formData));
    if (fotoBase64) {
        localStorage.setItem('obreiroFoto', fotoBase64);
    }
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('obreiroFormData');
    const savedFoto = localStorage.getItem('obreiroFoto');
    
    if (savedData) {
        formData = JSON.parse(savedData);
        populateForm();
    }
    
    if (savedFoto) {
        fotoBase64 = savedFoto;
        const fotoImg = document.getElementById('fotoImg');
        const fotoPreview = document.getElementById('fotoPreview');
        if (fotoImg && fotoPreview) {
            fotoImg.src = fotoBase64;
            fotoPreview.style.display = 'block';
        }
    }
}

function populateForm() {
    Object.keys(formData).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`);
        
        if (element) {
            if (element.type === 'radio') {
                const radio = document.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                element.value = formData[key];
            }
        }
    });
}

function addAutoSaveListeners() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', saveCurrentStepData);
    });
}

// ========================================
// UPLOAD E PREVIEW DE FOTO
// ========================================

function previewFoto(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Verificar tipo de arquivo
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showError('Por favor, selecione uma imagem JPG ou PNG.');
            event.target.value = '';
            return;
        }
        
        // Verificar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('A imagem deve ter no máximo 5MB.');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            fotoBase64 = e.target.result;
            
            const fotoImg = document.getElementById('fotoImg');
            const fotoPreview = document.getElementById('fotoPreview');
            
            fotoImg.src = fotoBase64;
            fotoPreview.style.display = 'block';
            
            // Salvar no localStorage
            localStorage.setItem('obreiroFoto', fotoBase64);
        };
        
        reader.readAsDataURL(file);
    }
}

// ========================================
// TOGGLE CAMPO CONDICIONAL
// ========================================

function toggleAfastamentoMotivo(show) {
    const motivoGroup = document.getElementById('motivoAfastamentoGroup');
    const motivoInput = document.getElementById('motivoAfastamento');
    
    if (show) {
        motivoGroup.style.display = 'block';
        motivoInput.required = true;
    } else {
        motivoGroup.style.display = 'none';
        motivoInput.required = false;
        motivoInput.value = '';
    }
}

// ========================================
// REVISÃO FINAL
// ========================================

function preencherRevisao() {
    saveCurrentStepData();
    
    const container = document.getElementById('revisaoContainer');
    
    let html = '';
    
    // DADOS PESSOAIS
    html += '<div class="revisao-section">';
    html += '<h3>Dados Pessoais</h3>';
    html += criarItemRevisao('Nome Completo', formData.nomeCompleto);
    html += criarItemRevisao('Endereço', formData.endereco);
    html += criarItemRevisao('Cidade', formData.cidade);
    html += criarItemRevisao('E-mail', formData.email);
    html += criarItemRevisao('Estado Civil', formData.estadoCivil);
    html += criarItemRevisao('RG', formData.rg);
    html += criarItemRevisao('Empregado', formData.empregado);
    if (formData.patente) html += criarItemRevisao('Patente Militar', formData.patente);
    if (formData.aposentadoria) html += criarItemRevisao('Motivo Aposentadoria', formData.aposentadoria);
    html += criarItemRevisao('Escolaridade', formData.escolaridade);
    html += '<button class="edit-button" onclick="goToStep(1)">Editar</button>';
    html += '</div>';
    
    // VIDA ESPIRITUAL
    html += '<div class="revisao-section">';
    html += '<h3>Vida Espiritual</h3>';
    html += criarItemRevisao('Função Atual', formData.funcaoAtual);
    html += criarItemRevisao('Tempo na Função', formData.tempoFuncao);
    html += criarItemRevisao('Grupo de Intercessão', formData.grupoIntercessao);
    html += criarItemRevisao('Responsável por Trabalho/Igreja', formData.responsavelTrabalho);
    if (formData.crescimentoGrupo) html += criarItemRevisao('Crescimento do Grupo', formData.crescimentoGrupo);
    html += criarItemRevisao('Visitas por Mês', formData.visitasMes);
    html += criarItemRevisao('Dizimista Fiel', formData.dizimista);
    html += criarItemRevisao('Tempo na ICM', formData.tempoICM);
    html += criarItemRevisao('Já se Afastou', formData.afastou);
    if (formData.motivoAfastamento) html += criarItemRevisao('Motivo do Afastamento', formData.motivoAfastamento);
    html += criarItemRevisao('Foi Provado', formData.provado);
    html += '<button class="edit-button" onclick="goToStep(2)">Editar</button>';
    html += '</div>';
    
    // INFORMAÇÕES COMPLEMENTARES
    html += '<div class="revisao-section">';
    html += '<h3>Informações Complementares</h3>';
    if (formData.observacoes) html += criarItemRevisao('Observações Gerais', formData.observacoes);
    if (formData.infoAdicionais) html += criarItemRevisao('Informações Adicionais', formData.infoAdicionais);
    html += '<button class="edit-button" onclick="goToStep(3)">Editar</button>';
    html += '</div>';
    
    // FOTO
    if (fotoBase64) {
        html += '<div class="revisao-section">';
        html += '<h3>Foto 3x4</h3>';
        html += '<div class="revisao-foto">';
        html += `<img src="${fotoBase64}" alt="Foto do obreiro">`;
        html += '</div>';
        html += '<button class="edit-button" onclick="goToStep(4)">Editar</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function criarItemRevisao(label, valor) {
    if (!valor) return '';
    
    return `
        <div class="revisao-item">
            <div class="revisao-label">${label}:</div>
            <div class="revisao-value">${valor}</div>
        </div>
    `;
}

// ========================================
// GERAÇÃO DO PDF
// ========================================

function gerarPDF() {
    // Garantir que temos todos os dados
    saveCurrentStepData();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const leftMargin = 20;
    const rightMargin = 190;
    
    // TÍTULO
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('Formulário para Levantamento de Obreiros', 105, y, { align: 'center' });
    y += 15;
    
    // Data de preenchimento
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data de preenchimento: ${dataAtual}`, 105, y, { align: 'center' });
    y += 15;
    
    // DADOS PESSOAIS
    doc.setFontSize(14);
    doc.setTextColor(102, 126, 234);
    doc.text('DADOS PESSOAIS', leftMargin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    y = adicionarCampoPDF(doc, 'Nome Completo', formData.nomeCompleto, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Endereço', formData.endereco, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Cidade', formData.cidade, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'E-mail', formData.email, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Estado Civil', formData.estadoCivil, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'RG', formData.rg, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Empregado', formData.empregado, leftMargin, y, lineHeight, rightMargin);
    if (formData.patente) y = adicionarCampoPDF(doc, 'Patente Militar', formData.patente, leftMargin, y, lineHeight, rightMargin);
    if (formData.aposentadoria) y = adicionarCampoPDF(doc, 'Motivo Aposentadoria', formData.aposentadoria, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Escolaridade', formData.escolaridade, leftMargin, y, lineHeight, rightMargin);
    
    y += 10;
    
    // VIDA ESPIRITUAL
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(102, 126, 234);
    doc.text('VIDA ESPIRITUAL', leftMargin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    y = adicionarCampoPDF(doc, 'Função Atual', formData.funcaoAtual, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Tempo na Função', formData.tempoFuncao, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Grupo de Intercessão', formData.grupoIntercessao, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Responsável por Trabalho/Igreja', formData.responsavelTrabalho, leftMargin, y, lineHeight, rightMargin);
    if (formData.crescimentoGrupo) y = adicionarCampoPDF(doc, 'Crescimento do Grupo', formData.crescimentoGrupo, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Visitas por Mês', formData.visitasMes, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Dizimista Fiel', formData.dizimista, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Tempo na ICM', formData.tempoICM, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Já se Afastou', formData.afastou, leftMargin, y, lineHeight, rightMargin);
    if (formData.motivoAfastamento) y = adicionarCampoPDF(doc, 'Motivo do Afastamento', formData.motivoAfastamento, leftMargin, y, lineHeight, rightMargin);
    y = adicionarCampoPDF(doc, 'Foi Provado', formData.provado, leftMargin, y, lineHeight, rightMargin);
    
    y += 10;
    
    // INFORMAÇÕES COMPLEMENTARES
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    if (formData.observacoes || formData.infoAdicionais) {
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('INFORMAÇÕES COMPLEMENTARES', leftMargin, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        if (formData.observacoes) y = adicionarCampoPDF(doc, 'Observações Gerais', formData.observacoes, leftMargin, y, lineHeight, rightMargin);
        if (formData.infoAdicionais) y = adicionarCampoPDF(doc, 'Informações Adicionais', formData.infoAdicionais, leftMargin, y, lineHeight, rightMargin);
        
        y += 10;
    }
    
    // FOTO
    if (fotoBase64) {
        if (y > 200) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('FOTO 3X4', leftMargin, y);
        y += 10;
        
        // Adicionar imagem
        try {
            doc.addImage(fotoBase64, 'JPEG', leftMargin, y, 40, 50);
        } catch (error) {
            console.error('Erro ao adicionar imagem ao PDF:', error);
        }
    }
    
    // Gerar nome do arquivo
    const nomeArquivo = `formulario-${formData.nomeCompleto ? formData.nomeCompleto.replace(/\s+/g, '-').toLowerCase() : 'obreiro'}.pdf`;
    
    // Salvar PDF
    doc.save(nomeArquivo);
    
    // Mostrar mensagem de sucesso
    alert('PDF gerado com sucesso!');
    
    // Opcional: limpar localStorage após gerar PDF
    // localStorage.removeItem('obreiroFormData');
    // localStorage.removeItem('obreiroFoto');
}

function adicionarCampoPDF(doc, label, valor, x, y, lineHeight, maxWidth) {
    if (!valor) return y;
    
    // Label em negrito
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, x, y);
    
    // Valor normal
    doc.setFont(undefined, 'normal');
    const valorTexto = String(valor);
    
    // Quebrar texto longo
    const linhas = doc.splitTextToSize(valorTexto, maxWidth - x - 50);
    
    linhas.forEach((linha, index) => {
        if (index === 0) {
            doc.text(linha, x + 50, y);
        } else {
            y += lineHeight;
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(linha, x + 50, y);
        }
    });
    
    return y + lineHeight;
}
