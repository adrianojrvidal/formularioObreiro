// ==========================================
// FORMULÁRIO DE LEVANTAMENTO DE OBREIROS - ICM
// JavaScript com validação, campos condicionais e geração de PDF
// ==========================================

let currentStep = 1;
const totalSteps = 14;
let formData = {};
let fotoBase64 = null;
let seminarioIndex = 1;
let mensagemIndex = 1;

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateProgressBar();
    addAutoSaveListeners();
    aplicarMascaras();
});

// ==========================================
// NAVEGAÇÃO ENTRE STEPS
// ==========================================

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    saveCurrentStepData();
    
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        
        if (currentStep === totalSteps) {
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
        
        if (currentStep === totalSteps) {
            preencherRevisao();
        }
        
        updateProgressBar();
    }
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// BARRA DE PROGRESSO
// ==========================================

function updateProgressBar() {
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    let style = document.getElementById('progressStyle');
    if (!style) {
        style = document.createElement('style');
        style.id = 'progressStyle';
        document.head.appendChild(style);
    }
    style.textContent = `.progress-bar::before { width: ${percentage}% !important; }`;
    
    document.getElementById('stepText').textContent = `Etapa ${currentStep} de ${totalSteps}`;
}

// ==========================================
// VALIDAÇÃO
// ==========================================

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return true;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    let errorMessage = '';
    
    requiredFields.forEach(field => {
        // Verifica se o campo está visível
        if (field.offsetParent === null) return;
        
        if (field.type === 'radio') {
            const radioGroup = currentStepElement.querySelectorAll(`[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#f44336';
            errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
        } else {
            field.style.borderColor = '#e0e0e0';
        }
        
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                field.style.borderColor = '#f44336';
                errorMessage = 'Por favor, insira um e-mail válido.';
            }
        }
    });
    
    if (currentStep === 1 && !fotoBase64) {
        isValid = false;
        errorMessage = 'Por favor, faça o upload da foto 3x4.';
    }
    
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
    
    setTimeout(() => hideError(), 5000);
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// ==========================================
// MANIPULAÇÃO DE DADOS
// ==========================================

function saveCurrentStepData() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return;
    
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else if (input.type === 'checkbox') {
            if (!formData[input.name]) formData[input.name] = [];
            if (input.checked && !formData[input.name].includes(input.value)) {
                formData[input.name].push(input.value);
            }
        } else if (input.type === 'file') {
            // Já processado
        } else if (input.name && input.name.includes('[]')) {
            // Arrays (repetidores)
            const baseName = input.name.replace('[]', '');
            if (!formData[baseName]) formData[baseName] = [];
            formData[baseName].push(input.value);
        } else {
            formData[input.name] = input.value;
        }
    });
    
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

// ==========================================
// MÁSCARAS
// ==========================================

function aplicarMascaras() {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    }
    
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
}

// ==========================================
// BUSCA CEP (ViaCEP)
// ==========================================

function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    showLoading();
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                showError('CEP não encontrado.');
            } else {
                document.getElementById('endereco').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
            }
            hideLoading();
        })
        .catch(() => {
            hideLoading();
            showError('Erro ao buscar CEP.');
        });
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// ==========================================
// UPLOAD DE FOTO
// ==========================================

function previewFoto(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showError('Por favor, selecione uma imagem JPG ou PNG.');
        event.target.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showError('A imagem deve ter no máximo 5MB.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        fotoBase64 = e.target.result;
        
        document.getElementById('fotoImg').src = fotoBase64;
        document.getElementById('fotoPreview').style.display = 'block';
        
        localStorage.setItem('obreiroFoto', fotoBase64);
    };
    
    reader.readAsDataURL(file);
}

// ==========================================
// CAMPOS CONDICIONAIS
// ==========================================

function toggleEmprego(show) {
    document.getElementById('empregoFields').style.display = show ? 'block' : 'none';
}

function toggleTipoProfissional() {
    const tipo = document.getElementById('tipoProfissional').value;
    
    document.getElementById('cltFields').style.display = tipo === 'CLT' ? 'block' : 'none';
    document.getElementById('autonomoFields').style.display = tipo === 'Autônomo' ? 'block' : 'none';
    document.getElementById('aposentadoFields').style.display = tipo === 'Aposentado' ? 'block' : 'none';
}

function toggleMilitar(show) {
    document.getElementById('militarFields').style.display = show ? 'block' : 'none';
}

function toggleAfastamento(show) {
    const fields = document.getElementById('afastamentoFields');
    if (fields) {
        fields.style.display = show ? 'block' : 'none';
    }
}

function toggleSequelas(show) {
    const fields = document.getElementById('sequelasFields');
    if (fields) {
        fields.style.display = show ? 'block' : 'none';
    }
}

function toggleAnoConclusao(show) {
    const group = document.getElementById('anoConclusaoGroup');
    if (group) {
        group.style.display = show ? 'block' : 'none';
    }
}

function toggleMotivoSemFilhos() {
    const qtd = parseInt(document.getElementById('qtdFilhos').value) || 0;
    const group = document.getElementById('motivoSemFilhosGroup');
    if (group) {
        group.style.display = qtd === 0 ? 'block' : 'none';
    }
}

// ==========================================
// REPETIDORES (SEMINÁRIOS E MENSAGENS)
// ==========================================

function addSeminario() {
    const container = document.getElementById('seminariosContainer');
    const newItem = `
        <div class="repeater-item" data-index="${seminarioIndex}">
            <button type="button" class="btn-remove" onclick="removeSeminario(${seminarioIndex})">×</button>
            <div class="form-row">
                <div class="form-group">
                    <label for="seminarioData${seminarioIndex}">Data (Mês/Ano)</label>
                    <input type="month" id="seminarioData${seminarioIndex}" name="seminarioData[]">
                </div>
                <div class="form-group">
                    <label for="seminarioPeriodo${seminarioIndex}">Período</label>
                    <input type="text" id="seminarioPeriodo${seminarioIndex}" name="seminarioPeriodo[]" placeholder="Ex: Manhã, Tarde">
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', newItem);
    seminarioIndex++;
}

function removeSeminario(index) {
    const item = document.querySelector(`.repeater-item[data-index="${index}"]`);
    if (item) item.remove();
}

function addMensagem() {
    const container = document.getElementById('mensagensContainer');
    const newItem = `
        <div class="repeater-item" data-index="${mensagemIndex}">
            <button type="button" class="btn-remove" onclick="removeMensagem(${mensagemIndex})">×</button>
            <div class="form-group">
                <label for="mensagemReferencia${mensagemIndex}">Referência Bíblica</label>
                <input type="text" id="mensagemReferencia${mensagemIndex}" name="mensagemReferencia[]" placeholder="Ex: João 3:16">
            </div>
            <div class="form-group">
                <label for="mensagemTexto${mensagemIndex}">Mensagem</label>
                <textarea id="mensagemTexto${mensagemIndex}" name="mensagemTexto[]" rows="4"></textarea>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', newItem);
    mensagemIndex++;
}

function removeMensagem(index) {
    const item = document.querySelector(`.repeater-item[data-index="${index}"]`);
    if (item) item.remove();
}

// ==========================================
// REVISÃO FINAL
// ==========================================

function preencherRevisao() {
    saveCurrentStepData();
    
    const container = document.getElementById('revisaoContainer');
    let html = '';
    
    // SEÇÃO 1: DADOS PESSOAIS
    html += '<div class="revisao-section">';
    html += '<h3>Identificação Pessoal</h3>';
    html += criarItemRevisao('Nome Completo', formData.nomeCompleto);
    html += criarItemRevisao('Data de Nascimento', formData.dataNascimento);
    html += criarItemRevisao('CPF', formData.cpf);
    html += criarItemRevisao('RG', formData.rg);
    html += criarItemRevisao('Órgão Expedidor', formData.orgaoExpedidor);
    html += criarItemRevisao('Estado Civil', formData.estadoCivil);
    html += criarItemRevisao('E-mail', formData.email);
    html += criarItemRevisao('Telefone', formData.telefone);
    html += criarItemRevisao('CEP', formData.cep);
    html += criarItemRevisao('Endereço', formData.endereco);
    html += criarItemRevisao('Número', formData.numero);
    if (formData.complemento) html += criarItemRevisao('Complemento', formData.complemento);
    html += criarItemRevisao('Bairro', formData.bairro);
    html += criarItemRevisao('Cidade', formData.cidade);
    html += criarItemRevisao('Estado', formData.uf);
    if (fotoBase64) {
        html += '<div class="revisao-foto"><img src="' + fotoBase64 + '" alt="Foto"></div>';
    }
    html += '<button class="edit-button" onclick="goToStep(1)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 2: DADOS PROFISSIONAIS
    html += '<div class="revisao-section">';
    html += '<h3>Situação Profissional</h3>';
    html += criarItemRevisao('Empregado', formData.empregado);
    if (formData.tipoProfissional) {
        html += criarItemRevisao('Tipo de Vínculo', formData.tipoProfissional);
        if (formData.tipoProfissional === 'CLT') {
            html += criarItemRevisao('Profissão', formData.profissaoCLT);
            html += criarItemRevisao('Empresa', formData.empresa);
            if (formData.tempoServicoAnos) html += criarItemRevisao('Tempo de Serviço', formData.tempoServicoAnos + ' anos ' + (formData.tempoServicoMeses || 0) + ' meses');
        } else if (formData.tipoProfissional === 'Autônomo') {
            html += criarItemRevisao('Profissão', formData.profissaoAutonomo);
            html += criarItemRevisao('Área de Atuação', formData.areaAtuacao);
            if (formData.tempoAtuacaoAnos) html += criarItemRevisao('Tempo de Atuação', formData.tempoAtuacaoAnos + ' anos ' + (formData.tempoAtuacaoMeses || 0) + ' meses');
        } else if (formData.tipoProfissional === 'Aposentado') {
            html += criarItemRevisao('Motivo da Aposentadoria', formData.motivoAposentadoria);
        }
    }
    html += '<button class="edit-button" onclick="goToStep(2)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 3: DADOS MILITARES
    html += '<div class="revisao-section">';
    html += '<h3>Dados Militares</h3>';
    html += criarItemRevisao('É Militar', formData.militar);
    if (formData.militar === 'Sim') {
        html += criarItemRevisao('Patente', formData.patente);
        html += criarItemRevisao('Arma', formData.arma);
    }
    html += '<button class="edit-button" onclick="goToStep(3)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 4: VIDA MINISTERIAL
    html += '<div class="revisao-section">';
    html += '<h3>Vida Ministerial</h3>';
    html += criarItemRevisao('Função Atual', formData.funcaoAtual);
    html += criarItemRevisao('Tempo na Função', formData.tempoFuncaoAnos + ' anos ' + (formData.tempoFuncaoMeses || 0) + ' meses');
    html += criarItemRevisao('Grupo de Intercessão', formData.grupoIntercessao);
    html += criarItemRevisao('Responsável por Trabalho/Igreja', formData.responsavelTrabalho);
    html += criarItemRevisao('Trabalho com Resultado', formData.trabalhoComResultado);
    html += criarItemRevisao('Crescimento do Grupo', formData.crescimentoGrupo + '%');
    html += criarItemRevisao('Visitas por Mês', formData.visitasMes);
    html += criarItemRevisao('Dizimista Fiel', formData.dizimista);
    html += criarItemRevisao('Tempo na ICM', formData.tempoICMAnos + ' anos ' + (formData.tempoICMMeses || 0) + ' meses');
    html += '<button class="edit-button" onclick="goToStep(4)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 5: HISTÓRICO ESPIRITUAL
    html += '<div class="revisao-section">';
    html += '<h3>Histórico Espiritual</h3>';
    html += criarItemRevisao('Já se Afastou da Igreja', formData.afastou);
    if (formData.afastou === 'Sim' && formData.motivoAfastamento) {
        html += criarItemRevisao('Motivo do Afastamento', formData.motivoAfastamento);
    }
    html += criarItemRevisao('Foi Provado', formData.foiProvado);
    html += criarItemRevisao('Tem Experiência Ministerial', formData.temExperiencia);
    html += criarItemRevisao('Tem Sequelas do Passado', formData.sequelasPassado);
    if (formData.sequelasPassado === 'Sim' && formData.descricaoSequelas) {
        html += criarItemRevisao('Descrição das Sequelas', formData.descricaoSequelas);
    }
    html += '<button class="edit-button" onclick="goToStep(5)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 6: CONDUTA
    html += '<div class="revisao-section">';
    html += '<h3>Conduta e Envolvimento</h3>';
    html += criarItemRevisao('Voluntário Maanaim', formData.voluntarioMaanaim);
    html += criarItemRevisao('Cultos de Madrugada', formData.cultosMadrugada);
    html += criarItemRevisao('Culto Profético', formData.cultoProfetico);
    html += criarItemRevisao('Governo do Lar', formData.governoLar);
    html += criarItemRevisao('Família Integrada na ICM', formData.familiaICM);
    html += criarItemRevisao('Respeita o Pastor', formData.respeitaPastor);
    html += criarItemRevisao('Zeloso com os Bens', formData.zelosoBens);
    html += '<button class="edit-button" onclick="goToStep(6)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 7: DONS
    html += '<div class="revisao-section">';
    html += '<h3>Dons Espirituais</h3>';
    html += criarItemRevisao('Usa Dons Espirituais', formData.usaDons);
    if (formData.dons && formData.dons.length > 0) {
        html += criarItemRevisao('Dons que Usa', formData.dons.join(', '));
    }
    html += '<button class="edit-button" onclick="goToStep(7)">Editar</button>';
    html += '</div>';
    
    // SEÇÃO 8: DADOS FAMILIARES
    if (formData.tempoCasadoAnos || formData.nomeEsposa) {
        html += '<div class="revisao-section">';
        html += '<h3>Dados Familiares</h3>';
        if (formData.tempoCasadoAnos) {
            html += criarItemRevisao('Tempo de Casado', formData.tempoCasadoAnos + ' anos ' + (formData.tempoCasadoMeses || 0) + ' meses');
        }
        if (formData.nomeEsposa) html += criarItemRevisao('Nome da Esposa', formData.nomeEsposa);
        if (formData.funcaoEsposa) html += criarItemRevisao('Função da Esposa', formData.funcaoEsposa);
        if (formData.profissaoEsposa) html += criarItemRevisao('Profissão da Esposa', formData.profissaoEsposa);
        if (formData.idadeEsposa) html += criarItemRevisao('Idade da Esposa', formData.idadeEsposa);
        if (formData.qtdFilhos) html += criarItemRevisao('Quantidade de Filhos', formData.qtdFilhos);
        if (formData.filhosNaIgreja) html += criarItemRevisao('Filhos na Igreja', formData.filhosNaIgreja);
        html += '<button class="edit-button" onclick="goToStep(8)">Editar</button>';
        html += '</div>';
    }
    
    // SEÇÃO 9: FORMAÇÃO
    html += '<div class="revisao-section">';
    html += '<h3>Formação e Ensino</h3>';
    html += criarItemRevisao('Leu a Bíblia Completa', formData.leuBiblia);
    html += criarItemRevisao('Hábito de Leitura', formData.livrosLidos);
    html += criarItemRevisao('Pratica EBD', formData.praticaEBD);
    html += criarItemRevisao('Aplica Satélite', formData.aplicaSatelite);
    html += criarItemRevisao('Instituto Bíblico', formData.cursoInstitutoBiblico);
    if (formData.cursoInstitutoBiblico === 'Sim' && formData.anoConclusao) {
        html += criarItemRevisao('Ano de Conclusão', formData.anoConclusao);
    }
    html += '<button class="edit-button" onclick="goToStep(9)">Editar</button>';
    html += '</div>';
    
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

// ==========================================
// GERAÇÃO DO PDF PROFISSIONAL
// ==========================================

function gerarPDF() {
    saveCurrentStepData();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 15;
    const lineHeight = 5.5;
    const leftMargin = 20;
    const rightMargin = 190;
    const maxWidth = rightMargin - leftMargin;
    const pageHeight = 297;
    
    // ========== FUNÇÕES AUXILIARES ==========
    
    // Adicionar nova página se necessário
    function checkNewPage(spaceNeeded = 15) {
        if (y + spaceNeeded > pageHeight - 20) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    }
    
    // Adicionar linha divisória
    function addDivider() {
        checkNewPage(10);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;
    }
    
    // Título de seção com fundo colorido
    function addSectionTitle(title, icon = '') {
        checkNewPage(20);
        
        // Fundo colorido
        doc.setFillColor(102, 126, 234);
        doc.roundedRect(leftMargin - 2, y - 5, maxWidth + 4, 10, 2, 2, 'F');
        
        // Texto do título
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(icon + title, leftMargin + 2, y + 1);
        
        y += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
    }
    
    // Subtítulo de seção
    function addSubsectionTitle(title) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont(undefined, 'bold');
        doc.text(title, leftMargin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
    }
    
    // Campo com label e valor em formato tabela
    function addField(label, value, fullWidth = false) {
        if (!value) return;
        
        checkNewPage(12);
        
        const labelWidth = fullWidth ? maxWidth : 70;
        const valueX = fullWidth ? leftMargin : leftMargin + labelWidth + 3;
        const valueWidth = fullWidth ? maxWidth : maxWidth - labelWidth - 3;
        
        // Label em negrito com fundo cinza claro
        doc.setFillColor(245, 245, 245);
        doc.rect(leftMargin, y - 4, labelWidth, 6, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text(label + ':', leftMargin + 1.5, y);
        
        // Valor
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        if (fullWidth) {
            y += 6;
            checkNewPage(8);
            const lines = doc.splitTextToSize(String(value), maxWidth - 2);
            lines.forEach((line, idx) => {
                if (idx > 0) checkNewPage(6);
                doc.text(line, leftMargin + 1.5, y);
                y += 5;
            });
            y += 1;
        } else {
            const lines = doc.splitTextToSize(String(value), valueWidth - 2);
            doc.text(lines[0], valueX + 1, y);
            if (lines.length > 1) {
                y += 5;
                checkNewPage(6);
                doc.text(lines.slice(1).join(' '), valueX + 1, y);
            }
            y += 6;
        }
    }
    
    // Campo de preenchimento manual para pastores
    function addManualField(label, lines = 1) {
        checkNewPage(8 + (lines * 7));
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text(label + ':', leftMargin, y);
        y += 6;
        
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        
        for (let i = 0; i < lines; i++) {
            doc.line(leftMargin, y, rightMargin, y);
            y += 7;
        }
        y += 2;
    }
    
    // Box de assinatura
    function addSignatureBox(label) {
        checkNewPage(25);
        
        doc.setDrawColor(120, 120, 120);
        doc.setLineWidth(0.3);
        doc.rect(leftMargin, y, 80, 20);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(label, leftMargin + 2, y + 4);
        
        // Linha para assinatura
        doc.line(leftMargin + 3, y + 15, leftMargin + 77, y + 15);
        doc.setFontSize(7);
        doc.text('Assinatura', leftMargin + 33, y + 18);
    }
    
    // ========== CABEÇALHO DO PDF ==========
    
    // Gradiente simulado com retângulos
    for (let i = 0; i < 40; i++) {
        const color = 102 + Math.floor((234 - 102) * (i / 40));
        doc.setFillColor(color, 126 + Math.floor((180 - 126) * (i / 40)), 234);
        doc.rect(0, i, 210, 1, 'F');
    }
    
    // Logo ou ícone da igreja (simulado com texto)
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('✝', 105, 15, { align: 'center' });
    
    // Título principal
    doc.setFontSize(16);
    doc.text('FORMULÁRIO PARA LEVANTAMENTO DE OBREIROS', 105, 25, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Igreja Cristã Maranata', 105, 32, { align: 'center' });
    
    // Data de preenchimento
    const dataPreenchimento = new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    doc.setFontSize(8);
    doc.text('Preenchido em: ' + dataPreenchimento, 105, 37, { align: 'center' });
    
    y = 50;
    doc.setTextColor(0, 0, 0);
    
    // ========== FOTO DO CANDIDATO ==========
    if (fotoBase64) {
        try {
            doc.addImage(fotoBase64, 'JPEG', rightMargin - 35, 45, 30, 38);
            doc.setDrawColor(102, 126, 234);
            doc.setLineWidth(0.5);
            doc.rect(rightMargin - 35, 45, 30, 38);
        } catch (error) {
            console.error('Erro ao adicionar foto:', error);
        }
    }
    
    // ========== SEÇÃO 1: IDENTIFICAÇÃO PESSOAL ==========
    addSectionTitle('📋 IDENTIFICAÇÃO PESSOAL');
    addField('Nome Completo', formData.nomeCompleto, true);
    addField('Data de Nascimento', formData.dataNascimento);
    addField('CPF', formData.cpf);
    addField('RG', formData.rg);
    addField('Órgão Expedidor', formData.orgaoExpedidor);
    addField('Estado Civil', formData.estadoCivil);
    addDivider();
    
    // ========== CONTATO ==========
    addSubsectionTitle('Contato');
    addField('E-mail', formData.email, true);
    addField('Telefone', formData.telefone);
    addDivider();
    
    // ========== ENDEREÇO ==========
    addSubsectionTitle('Endereço Residencial');
    addField('CEP', formData.cep);
    addField('Logradouro', formData.endereco);
    addField('Número', formData.numero);
    if (formData.complemento) addField('Complemento', formData.complemento);
    addField('Bairro', formData.bairro);
    addField('Cidade', formData.cidade);
    addField('Estado', formData.uf);
    y += 3;
    
    // ========== SEÇÃO 2: SITUAÇÃO PROFISSIONAL ==========
    addSectionTitle('💼 SITUAÇÃO PROFISSIONAL');
    addField('Está Empregado', formData.empregado);
    
    if (formData.tipoProfissional) {
        addField('Tipo de Vínculo', formData.tipoProfissional);
        
        if (formData.tipoProfissional === 'CLT') {
            addField('Profissão', formData.profissaoCLT);
            addField('Empresa', formData.empresa);
            if (formData.tempoServicoAnos) {
                addField('Tempo de Serviço', formData.tempoServicoAnos + ' anos e ' + (formData.tempoServicoMeses || 0) + ' meses');
            }
        } else if (formData.tipoProfissional === 'Autônomo') {
            addField('Profissão', formData.profissaoAutonomo);
            addField('Área de Atuação', formData.areaAtuacao);
            if (formData.tempoAtuacaoAnos) {
                addField('Tempo de Atuação', formData.tempoAtuacaoAnos + ' anos e ' + (formData.tempoAtuacaoMeses || 0) + ' meses');
            }
        } else if (formData.tipoProfissional === 'Aposentado') {
            addField('Motivo da Aposentadoria', formData.motivoAposentadoria, true);
        }
    }
    y += 3;
    
    // ========== SEÇÃO 3: DADOS MILITARES ==========
    addSectionTitle('🎖️ DADOS MILITARES');
    addField('É Militar', formData.militar);
    if (formData.militar === 'Sim') {
        addField('Patente', formData.patente);
        addField('Arma', formData.arma);
    }
    y += 3;
    
    // ========== SEÇÃO 4: VIDA MINISTERIAL ==========
    addSectionTitle('⛪ VIDA MINISTERIAL');
    addField('Função Atual', formData.funcaoAtual);
    if (formData.tempoFuncaoAnos) {
        addField('Tempo na Função', formData.tempoFuncaoAnos + ' anos e ' + (formData.tempoFuncaoMeses || 0) + ' meses');
    }
    addField('Participa do Grupo de Intercessão', formData.grupoIntercessao);
    addField('Responsável por Trabalho/Igreja', formData.responsavelTrabalho);
    addField('Trabalho com Resultado', formData.trabalhoComResultado);
    addField('Crescimento do Grupo', formData.crescimentoGrupo + '%');
    addField('Visitas por Mês', formData.visitasMes);
    addField('Dizimista Fiel', formData.dizimista);
    if (formData.tempoICMAnos) {
        addField('Tempo na ICM', formData.tempoICMAnos + ' anos e ' + (formData.tempoICMMeses || 0) + ' meses');
    }
    y += 3;
    
    // ========== SEÇÃO 5: HISTÓRICO ESPIRITUAL ==========
    addSectionTitle('📖 HISTÓRICO ESPIRITUAL');
    addField('Já se Afastou da Igreja', formData.afastou);
    if (formData.afastou === 'Sim' && formData.motivoAfastamento) {
        addField('Motivo do Afastamento', formData.motivoAfastamento, true);
    }
    addField('Foi Provado', formData.foiProvado);
    addField('Tem Experiência Ministerial', formData.temExperiencia);
    addField('Tem Sequelas do Passado', formData.sequelasPassado);
    if (formData.sequelasPassado === 'Sim' && formData.descricaoSequelas) {
        addField('Descrição das Sequelas', formData.descricaoSequelas, true);
    }
    y += 3;
    
    // ========== SEÇÃO 6: CONDUTA E ENVOLVIMENTO ==========
    addSectionTitle('✨ CONDUTA E ENVOLVIMENTO');
    addField('Voluntário do Maanaim', formData.voluntarioMaanaim);
    addField('Frequenta Cultos de Madrugada', formData.cultosMadrugada);
    addField('Participa do Culto Profético', formData.cultoProfetico);
    addField('Exerce Governo do Lar', formData.governoLar);
    addField('Família Integrada na ICM', formData.familiaICM);
    addField('Respeita o Pastor', formData.respeitaPastor);
    addField('Zeloso com os Bens da Igreja', formData.zelosoBens);
    y += 3;
    
    // ========== SEÇÃO 7: DONS ESPIRITUAIS ==========
    addSectionTitle('🕊️ DONS ESPIRITUAIS');
    addField('Usa Dons Espirituais', formData.usaDons);
    if (formData.dons && formData.dons.length > 0) {
        addField('Dons que Manifesta', formData.dons.join(', '), true);
    }
    y += 3;
    
    // ========== SEÇÃO 8: DADOS FAMILIARES ==========
    if (formData.tempoCasadoAnos || formData.nomeEsposa) {
        addSectionTitle('👨‍👩‍👧‍👦 DADOS FAMILIARES');
        
        if (formData.tempoCasadoAnos) {
            addField('Tempo de Casado', formData.tempoCasadoAnos + ' anos e ' + (formData.tempoCasadoMeses || 0) + ' meses');
        }
        if (formData.nomeEsposa) addField('Nome da Esposa', formData.nomeEsposa);
        if (formData.funcaoEsposa) addField('Função da Esposa na Igreja', formData.funcaoEsposa);
        if (formData.profissaoEsposa) addField('Profissão da Esposa', formData.profissaoEsposa);
        if (formData.idadeEsposa) addField('Idade da Esposa', formData.idadeEsposa + ' anos');
        if (formData.estadoCivilCandidatoAntes) addField('Estado Civil do Candidato (antes do casamento)', formData.estadoCivilCandidatoAntes);
        if (formData.estadoCivilEsposaAntes) addField('Estado Civil da Esposa (antes do casamento)', formData.estadoCivilEsposaAntes);
        if (formData.qtdFilhos) addField('Quantidade de Filhos', formData.qtdFilhos);
        if (formData.filhosNaIgreja) addField('Filhos Congregam na Igreja', formData.filhosNaIgreja);
        if (formData.motivoSemFilhos) addField('Motivo de Não Ter Filhos', formData.motivoSemFilhos, true);
        y += 3;
    }
    
    // ========== SEÇÃO 9: FORMAÇÃO E ENSINO ==========
    addSectionTitle('🎓 FORMAÇÃO E ENSINO');
    addField('Leu a Bíblia Completa', formData.leuBiblia);
    addField('Quantos Livros Lidos por Ano', formData.livrosLidos);
    addField('Pratica EBD', formData.praticaEBD);
    addField('Aplica Satélite', formData.aplicaSatelite);
    addField('Cursou Instituto Bíblico', formData.cursoInstitutoBiblico);
    if (formData.cursoInstitutoBiblico === 'Sim' && formData.anoConclusao) {
        addField('Ano de Conclusão', formData.anoConclusao);
    }
    y += 3;
    
    // ========== SEÇÃO 10: EXPERIÊNCIAS ESPIRITUAIS ==========
    if (formData.experienciaClamor || formData.experienciaOracao || formData.experienciaJejum) {
        addSectionTitle('🔥 EXPERIÊNCIAS ESPIRITUAIS');
        if (formData.experienciaClamor) addField('Experiência no Clamor', formData.experienciaClamor, true);
        if (formData.experienciaOracao) addField('Experiência na Oração', formData.experienciaOracao, true);
        if (formData.experienciaJejum) addField('Experiência no Jejum', formData.experienciaJejum, true);
        if (formData.experienciaMadrugada) addField('Experiência na Madrugada', formData.experienciaMadrugada, true);
        if (formData.experienciaPalavra) addField('Experiência com a Palavra', formData.experienciaPalavra, true);
        if (formData.experienciaLouvor) addField('Experiência no Louvor', formData.experienciaLouvor, true);
        y += 3;
    }
    
    // ========== SEÇÃO 11: QUESTIONÁRIO TEOLÓGICO ==========
    if (formData.palavraRevelada || formData.clamorSangue) {
        addSectionTitle('📚 QUESTIONÁRIO TEOLÓGICO');
        if (formData.palavraRevelada) addField('O que é Palavra Revelada?', formData.palavraRevelada, true);
        if (formData.clamorSangue) addField('O que é Clamor de Sangue?', formData.clamorSangue, true);
        if (formData.igrejaCorpo) addField('Igreja como Corpo de Cristo', formData.igrejaCorpo, true);
        if (formData.salvacao) addField('Entendimento sobre Salvação', formData.salvacao, true);
        if (formData.origemFe) addField('Origem da Fé', formData.origemFe, true);
        if (formData.sacerdocio) addField('Sacerdócio Universal', formData.sacerdocio, true);
        if (formData.objetivoSatelite) addField('Objetivo do Satélite', formData.objetivoSatelite, true);
        y += 3;
    }
    
    // ========== SEÇÃO 12: QUESTIONÁRIO DA ESPOSA ==========
    if (formData.concordaOrdenacao || formData.assinaturaEsposa) {
        addSectionTitle('💍 QUESTIONÁRIO DA ESPOSA');
        if (formData.concordaOrdenacao) addField('Concorda com a Ordenação', formData.concordaOrdenacao, true);
        if (formData.concordaDoutrina) addField('Concorda com a Doutrina', formData.concordaDoutrina, true);
        if (formData.concordaVoluntario) addField('Concorda em Ser Voluntária', formData.concordaVoluntario, true);
        if (formData.naoInterferir) addField('Compromisso de Não Interferir', formData.naoInterferir, true);
        if (formData.comentariosEsposa) addField('Comentários da Esposa', formData.comentariosEsposa, true);
        if (formData.concordaAnulacao) addField('Concorda com Possível Anulação', formData.concordaAnulacao, true);
        if (formData.assinaturaEsposa) addField('Assinatura da Esposa', formData.assinaturaEsposa);
        y += 3;
    }
    
    // ========== NOVA PÁGINA: AVALIAÇÃO PASTORAL ==========
    doc.addPage();
    y = 20;
    
    // Cabeçalho da página de avaliação
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(leftMargin - 5, y - 5, maxWidth + 10, 15, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('AVALIAÇÃO PASTORAL', 105, y + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    y += 20;
    
    // Instrução
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Esta seção deve ser preenchida pelo pastor responsável pela avaliação do candidato.', leftMargin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    
    // Campos para preenchimento manual
    addSubsectionTitle('1. AVALIAÇÃO MINISTERIAL');
    addManualField('Avaliação do Desempenho Ministerial', 3);
    
    addManualField('Comprometimento com a Obra', 2);
    
    addManualField('Relacionamento com a Liderança', 2);
    
    addSubsectionTitle('2. AVALIAÇÃO DOUTRINÁRIA');
    addManualField('Conhecimento Doutrinário', 2);
    
    addManualField('Firmeza na Fé', 2);
    
    addSubsectionTitle('3. AVALIAÇÃO COMPORTAMENTAL');
    addManualField('Conduta Moral e Ética', 2);
    
    addManualField('Relacionamento Familiar', 2);
    
    addManualField('Testemunho na Comunidade', 2);
    
    checkNewPage(60);
    addSubsectionTitle('4. PARECER FINAL');
    
    // Checkboxes para parecer
    doc.setFontSize(9);
    const pareceresY = y;
    
    doc.rect(leftMargin, y, 4, 4);
    doc.text('APROVADO para ordenação', leftMargin + 7, y + 3);
    y += 8;
    
    doc.rect(leftMargin, y, 4, 4);
    doc.text('APROVADO COM RESSALVAS (especificar abaixo)', leftMargin + 7, y + 3);
    y += 8;
    
    doc.rect(leftMargin, y, 4, 4);
    doc.text('NÃO APROVADO (justificar abaixo)', leftMargin + 7, y + 3);
    y += 10;
    
    addManualField('Observações e Justificativas', 3);
    
    // Assinaturas
    checkNewPage(50);
    y += 5;
    addSubsectionTitle('5. ASSINATURAS');
    
    // Pastor Responsável
    doc.setFontSize(9);
    doc.text('Pastor Responsável:', leftMargin, y);
    y += 5;
    doc.line(leftMargin, y, leftMargin + 80, y);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Nome e Assinatura', leftMargin + 25, y + 4);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Data:', leftMargin + 95, y - 5);
    doc.line(leftMargin + 110, y, leftMargin + 145, y);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('____ / ____ / ________', leftMargin + 112, y + 4);
    
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    // Pastor Presidente (se houver)
    doc.text('Pastor Presidente (se aplicável):', leftMargin, y);
    y += 5;
    doc.line(leftMargin, y, leftMargin + 80, y);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Nome e Assinatura', leftMargin + 25, y + 4);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Data:', leftMargin + 95, y - 5);
    doc.line(leftMargin + 110, y, leftMargin + 145, y);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('____ / ____ / ________', leftMargin + 112, y + 4);
    
    // Rodapé da página de avaliação
    y = pageHeight - 15;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Igreja Cristã Maranata - Formulário de Levantamento de Obreiros', 105, y, { align: 'center' });
    doc.text('Este documento é confidencial e de uso exclusivo da liderança eclesiástica.', 105, y + 4, { align: 'center' });
    
    // ========== SALVAR PDF ==========
    const nomeArquivo = `formulario-obreiro-${formData.nomeCompleto ? formData.nomeCompleto.replace(/\s+/g, '-').toLowerCase() : 'icm'}-${Date.now()}.pdf`;
    doc.save(nomeArquivo);
    
    alert('✅ PDF gerado com sucesso!\n\n📄 O arquivo foi baixado para seu computador.\n\n✨ Inclui seção de avaliação pastoral para preenchimento manual.');
}
