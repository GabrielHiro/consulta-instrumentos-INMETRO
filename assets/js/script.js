// Global variables
let allData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';
let db = null; // Instância do banco de dados

// Estados brasileiros para a API do INMETRO
const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    dashboard: document.getElementById('dashboard'),
    filterEstados: document.getElementById('filter-estados'),
    filterCidades: document.getElementById('filter-cidades'),
    filterResultado: document.getElementById('filter-resultado'),
    filterTipo: document.getElementById('filter-tipo'),
    searchInput: document.getElementById('search-input'),
    applyFilters: document.getElementById('apply-filters'),
    clearFilters: document.getElementById('clear-filters'),
    exportData: document.getElementById('export-data'),
    resultsCount: document.getElementById('results-count'),
    resultsTable: document.getElementById('results-table'),
    resultsTbody: document.getElementById('results-tbody'),
    pagination: document.getElementById('pagination'),
    paginationInfo: document.getElementById('pagination-info'),
    modal: document.getElementById('detailsModal'),
    modalBody: document.getElementById('modal-body'),
    lastUpdate: document.getElementById('last-update')
};

// Charts
let estadosChart = null;
let statusChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        showLoading(true);
        
        // Inicializar banco de dados
        db = new InmetroDatabase();
        await db.init();
        
        await loadAllData();
        setupEventListeners();
        updateDashboard();
        applyFilters();
        hideLoading();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        hideLoading();
        showNoDataMessage();
    }
}

function showLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
}

function hideLoading() {
    showLoading(false);
}

function showNoDataMessage() {
    // Criar mensagem de sem dados
    const messageDiv = document.createElement('div');
    messageDiv.className = 'no-data-message';
    messageDiv.innerHTML = `
        <div class="no-data-content">
            <i class="fas fa-database" style="font-size: 4rem; color: #6b7280; margin-bottom: 1rem;"></i>
            <h2>Nenhum dado encontrado</h2>
            <p>Não há dados carregados no sistema. Use o painel de administração para carregar dados.</p>
            <a href="admin.html" class="btn btn-primary">
                <i class="fas fa-cog"></i> Ir para Painel Admin
            </a>
        </div>
    `;
    
    const container = document.querySelector('.container');
    container.innerHTML = '';
    container.appendChild(messageDiv);
}

async function loadAllData() {
    console.log('Verificando dados no banco local...');
    
    try {
        // Tentar carregar dados do IndexedDB primeiro
        const hasLocalData = await db.hasData();
        
        if (hasLocalData) {
            console.log('Carregando dados do banco local...');
            allData = await db.loadData();
            
            // Remover propriedade id adicionada pelo IndexedDB
            allData = allData.map(item => {
                const { id, ...itemWithoutId } = item;
                return itemWithoutId;
            });
            
            console.log(`Dados carregados do banco local: ${allData.length} registros`);
            
            // Atualizar timestamp
            const metadata = await db.getMetadata();
            if (metadata) {
                const date = new Date(metadata.value);
                elements.lastUpdate.textContent = date.toLocaleString('pt-BR');
            }
            
            // Esconder aviso de demo
            if (elements.demoNotice) {
                elements.demoNotice.style.display = 'none';
            }
            
        } else {
            console.log('Nenhum dado encontrado no banco local, carregando dados de exemplo...');
            await loadFallbackData();
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
        await loadFallbackData();
    }
}

async function loadFallbackData() {
    try {
        // Carregar dados de exemplo como fallback
        const response = await fetch('assets/js/dados-exemplo.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allData = await response.json();
        console.log(`Dados de exemplo carregados: ${allData.length}`);
        
        // Adicionar dados adicionais para demonstração
        const estadosAdicionais = generateAdditionalData();
        allData = allData.concat(estadosAdicionais);
        
        console.log(`Total final de registros: ${allData.length}`);
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
        
    } catch (error) {
        console.error('Erro ao carregar dados de fallback:', error);
        // Usar dados mínimos em caso de erro completo
        allData = generateFallbackData();
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
    }
}

async function loadStateData(estado) {
    try {
        const url = `https://servicos.rbmlq.gov.br/dados-abertos/${estado}/medidores.json`;
        const response = await fetch(url, {
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn(`Erro ao carregar dados do estado ${estado}:`, error);
        return [];
    }
}

// Função para gerar dados adicionais para demonstração
function generateAdditionalData() {
    const estadosExtras = [
        { sigla: 'AL', nome: 'Alagoas', cidade: 'MACEIÓ' },
        { sigla: 'AP', nome: 'Amapá', cidade: 'MACAPÁ' },
        { sigla: 'AM', nome: 'Amazonas', cidade: 'MANAUS' },
        { sigla: 'MT', nome: 'Mato Grosso', cidade: 'CUIABÁ' },
        { sigla: 'MS', nome: 'Mato Grosso do Sul', cidade: 'CAMPO GRANDE' },
        { sigla: 'PB', nome: 'Paraíba', cidade: 'JOÃO PESSOA' },
        { sigla: 'PI', nome: 'Piauí', cidade: 'TERESINA' },
        { sigla: 'RN', nome: 'Rio Grande do Norte', cidade: 'NATAL' },
        { sigla: 'RO', nome: 'Rondônia', cidade: 'PORTO VELHO' },
        { sigla: 'RR', nome: 'Roraima', cidade: 'BOA VISTA' },
        { sigla: 'SE', nome: 'Sergipe', cidade: 'ARACAJU' },
        { sigla: 'TO', nome: 'Tocantins', cidade: 'PALMAS' }
    ];
    
    const dados = [];
    const resultados = ['Aprovado', 'Reprovado'];
    const tipos = ['Fixo', 'Móvel'];
    const velocidades = ['40', '60', '70', '80', '90', '100', '110'];
    
    estadosExtras.forEach((estado, index) => {
        // Gerar 2-4 medidores por estado
        const numMedidores = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < numMedidores; i++) {
            const dataVerificacao = getRandomDate();
            const dataValidade = new Date(dataVerificacao);
            dataValidade.setFullYear(dataValidade.getFullYear() + 1);
            
            const medidor = {
                "SiglaUf": estado.sigla,
                "Estado": estado.nome,
                "Municipio": estado.cidade,
                "LocalVerificacao": `BR ${100 + index} KM ${Math.floor(Math.random() * 200)} - ${estado.cidade}/${estado.sigla}`,
                "DataUltimaVerificacao": formatDate(dataVerificacao),
                "DataValidade": formatDate(dataValidade),
                "UltimoResultado": resultados[Math.floor(Math.random() * resultados.length)],
                "TipoMedidor": tipos[Math.floor(Math.random() * tipos.length)],
                "Faixas": generateFaixas(),
                "Historico": generateHistorico(),
                "Proprietario": {
                    "Nome": `ÓRGÃO DE TRÂNSITO DE ${estado.nome.toUpperCase()}`,
                    "Municipio": estado.cidade,
                    "Estado": estado.sigla
                }
            };
            
            dados.push(medidor);
        }
    });
    
    return dados;
}

function generateFaixas() {
    const numFaixas = Math.floor(Math.random() * 2) + 1; // 1 ou 2 faixas
    const faixas = [];
    const velocidades = ['40', '60', '70', '80', '90', '100', '110'];
    const sentidos = ['CRESCENTE', 'DECRESCENTE', 'BIDIRECIONAL'];
    
    for (let i = 1; i <= numFaixas; i++) {
        faixas.push({
            "NumeroFaixa": i.toString(),
            "NumeroInmetro": Math.floor(Math.random() * 90000000) + 10000000,
            "NumeroSerie": `SER${Math.floor(Math.random() * 900000) + 100000}`,
            "Sentido": sentidos[Math.floor(Math.random() * sentidos.length)],
            "VelocidadeNominal": velocidades[Math.floor(Math.random() * velocidades.length)]
        });
    }
    
    return faixas;
}

function generateHistorico() {
    const numRegistros = Math.floor(Math.random() * 3) + 1; // 1 a 3 registros
    const historico = [];
    const tiposServico = ['Inicial', 'Periódica', 'Extraordinária'];
    const resultados = ['Aprovado', 'Reprovado'];
    
    for (let i = 0; i < numRegistros; i++) {
        const ano = 2025 - i;
        const dataLaudo = getRandomDateInYear(ano);
        const dataValidade = new Date(dataLaudo);
        dataValidade.setFullYear(dataValidade.getFullYear() + 1);
        
        historico.push({
            "NumeroCertificado": Math.floor(Math.random() * 90000000) + 10000000,
            "NumeroEnsaio": (i + 1).toString(),
            "Ano": ano.toString(),
            "DataLaudo": formatDate(dataLaudo),
            "DataValidade": formatDate(dataValidade),
            "TipoServico": tiposServico[Math.floor(Math.random() * tiposServico.length)],
            "Resultado": resultados[Math.floor(Math.random() * resultados.length)]
        });
    }
    
    return historico;
}

function getRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date(2025, 8, 13); // Até hoje
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomDateInYear(year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Dados de fallback em caso de erro
function generateFallbackData() {
    return [
        {
            "SiglaUf": "AC",
            "Estado": "Acre",
            "Municipio": "RIO BRANCO",
            "LocalVerificacao": "BR 364 KM 124,4 - RIO BRANCO/ACRE",
            "DataUltimaVerificacao": "03/07/2025",
            "DataValidade": "02/07/2026",
            "UltimoResultado": "Aprovado",
            "TipoMedidor": "Fixo",
            "Faixas": [
                {
                    "NumeroFaixa": "1",
                    "NumeroInmetro": "14826019",
                    "NumeroSerie": "FLICD2106A00575",
                    "Sentido": "CRESCENTE",
                    "VelocidadeNominal": "40"
                }
            ],
            "Historico": [
                {
                    "NumeroCertificado": "15020222",
                    "NumeroEnsaio": "1",
                    "Ano": "2025",
                    "DataLaudo": "03/07/2025",
                    "DataValidade": "02/07/2026",
                    "TipoServico": "Periódica",
                    "Resultado": "Aprovado"
                }
            ],
            "Proprietario": {
                "Nome": "DATA TRAFFIC S/A",
                "Municipio": "APARECIDA DE GOIÂNIA",
                "Estado": "GO"
            }
        }
    ];
}

function setupEventListeners() {
    // Filter events
    elements.applyFilters.addEventListener('click', applyFilters);
    elements.clearFilters.addEventListener('click', clearFilters);
    elements.exportData.addEventListener('click', exportToCSV);
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    // Filter change events
    elements.filterEstados.addEventListener('change', onEstadosChange);
    elements.filterResultado.addEventListener('change', applyFilters);
    elements.filterTipo.addEventListener('change', applyFilters);
    
    // Table sorting
    const sortableHeaders = elements.resultsTable.querySelectorAll('th[data-sort]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            handleSort(column);
        });
    });
    
    // Modal events
    const closeModal = elements.modal.querySelector('.close');
    closeModal.addEventListener('click', () => {
        elements.modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    });
    
    // Populate initial filters
    populateEstadosFilter();
}

function populateEstadosFilter() {
    const estados = [...new Set(allData.map(item => item.Estado))].sort();
    elements.filterEstados.innerHTML = '<option value="">Todos os Estados</option>';
    
    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        elements.filterEstados.appendChild(option);
    });
}

function onEstadosChange() {
    populateCidadesFilter();
    applyFilters();
}

function populateCidadesFilter() {
    const selectedEstados = Array.from(elements.filterEstados.selectedOptions).map(option => option.value);
    let cidades = [];
    
    if (selectedEstados.length === 0 || selectedEstados.includes('')) {
        cidades = [...new Set(allData.map(item => item.Municipio))];
    } else {
        cidades = [...new Set(allData
            .filter(item => selectedEstados.includes(item.Estado))
            .map(item => item.Municipio))];
    }
    
    cidades.sort();
    elements.filterCidades.innerHTML = '<option value="">Todas as Cidades</option>';
    
    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        elements.filterCidades.appendChild(option);
    });
}

function applyFilters() {
    const selectedEstados = Array.from(elements.filterEstados.selectedOptions).map(option => option.value).filter(v => v);
    const selectedCidades = Array.from(elements.filterCidades.selectedOptions).map(option => option.value).filter(v => v);
    const selectedResultado = elements.filterResultado.value;
    const selectedTipo = elements.filterTipo.value;
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    filteredData = allData.filter(item => {
        // Filter by estados
        if (selectedEstados.length > 0 && !selectedEstados.includes(item.Estado)) {
            return false;
        }
        
        // Filter by cidades
        if (selectedCidades.length > 0 && !selectedCidades.includes(item.Municipio)) {
            return false;
        }
        
        // Filter by resultado
        if (selectedResultado && item.UltimoResultado !== selectedResultado) {
            return false;
        }
        
        // Filter by tipo
        if (selectedTipo && item.TipoMedidor !== selectedTipo) {
            return false;
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                item.Estado,
                item.Municipio,
                item.LocalVerificacao,
                item.Proprietario?.Nome || '',
                item.UltimoResultado,
                item.TipoMedidor
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Apply sorting
    if (sortColumn) {
        sortData();
    }
    
    currentPage = 1;
    updateResultsTable();
    updatePagination();
    updateDashboard();
}

function clearFilters() {
    elements.filterEstados.selectedIndex = 0;
    elements.filterCidades.selectedIndex = 0;
    elements.filterResultado.selectedIndex = 0;
    elements.filterTipo.selectedIndex = 0;
    elements.searchInput.value = '';
    
    populateCidadesFilter();
    applyFilters();
}

function handleSort(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update sort indicators
    const headers = elements.resultsTable.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        const icon = header.querySelector('i');
        icon.className = 'fas fa-sort';
        
        if (header.getAttribute('data-sort') === column) {
            icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    });
    
    sortData();
    updateResultsTable();
}

function sortData() {
    filteredData.sort((a, b) => {
        let aVal = getNestedValue(a, sortColumn);
        let bVal = getNestedValue(b, sortColumn);
        
        // Handle dates
        if (sortColumn.includes('Data')) {
            aVal = new Date(aVal.split('/').reverse().join('-'));
            bVal = new Date(bVal.split('/').reverse().join('-'));
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((o, p) => o && o[p], obj) || '';
}

function updateResultsTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    elements.resultsTbody.innerHTML = '';
    
    if (pageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">Nenhum resultado encontrado</td>';
        elements.resultsTbody.appendChild(row);
    } else {
        pageData.forEach(item => {
            const row = createTableRow(item);
            elements.resultsTbody.appendChild(row);
        });
    }
    
    elements.resultsCount.textContent = `${filteredData.length} resultados encontrados`;
}

function createTableRow(item) {
    const row = document.createElement('tr');
    row.classList.add('fade-in');
    
    const statusClass = item.UltimoResultado === 'Aprovado' ? 'status-approved' : 'status-rejected';
    
    row.innerHTML = `
        <td>${item.Estado}</td>
        <td>${item.Municipio}</td>
        <td title="${item.LocalVerificacao}">${truncateText(item.LocalVerificacao, 40)}</td>
        <td><span class="status-badge ${statusClass}">${item.UltimoResultado}</span></td>
        <td>${item.TipoMedidor}</td>
        <td>${item.DataValidade}</td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="showDetails(${allData.indexOf(item)})">
                <i class="fas fa-eye"></i> Ver Detalhes
            </button>
        </td>
    `;
    
    return row;
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function showDetails(index) {
    const item = allData[index];
    
    const detailsHTML = `
        <div class="details-container">
            <div class="detail-section">
                <h4><i class="fas fa-map-marker-alt"></i> Localização</h4>
                <p><strong>Estado:</strong> ${item.Estado} (${item.SiglaUf})</p>
                <p><strong>Município:</strong> ${item.Municipio}</p>
                <p><strong>Local de Verificação:</strong> ${item.LocalVerificacao}</p>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Informações do Medidor</h4>
                <p><strong>Tipo:</strong> ${item.TipoMedidor}</p>
                <p><strong>Último Resultado:</strong> 
                    <span class="status-badge ${item.UltimoResultado === 'Aprovado' ? 'status-approved' : 'status-rejected'}">
                        ${item.UltimoResultado}
                    </span>
                </p>
                <p><strong>Data da Última Verificação:</strong> ${item.DataUltimaVerificacao}</p>
                <p><strong>Data de Validade:</strong> ${item.DataValidade}</p>
            </div>
            
            ${item.Proprietario ? `
            <div class="detail-section">
                <h4><i class="fas fa-user"></i> Proprietário</h4>
                <p><strong>Nome:</strong> ${item.Proprietario.Nome}</p>
                <p><strong>Município:</strong> ${item.Proprietario.Municipio}</p>
                <p><strong>Estado:</strong> ${item.Proprietario.Estado}</p>
            </div>
            ` : ''}
            
            ${item.Faixas && item.Faixas.length > 0 ? `
            <div class="detail-section">
                <h4><i class="fas fa-road"></i> Faixas (${item.Faixas.length})</h4>
                <div class="faixas-grid">
                    ${item.Faixas.map(faixa => `
                        <div class="faixa-card">
                            <p><strong>Faixa:</strong> ${faixa.NumeroFaixa}</p>
                            <p><strong>Nº INMETRO:</strong> ${faixa.NumeroInmetro}</p>
                            <p><strong>Nº Série:</strong> ${faixa.NumeroSerie}</p>
                            <p><strong>Sentido:</strong> ${faixa.Sentido}</p>
                            <p><strong>Velocidade Nominal:</strong> ${faixa.VelocidadeNominal} km/h</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${item.Historico && item.Historico.length > 0 ? `
            <div class="detail-section">
                <h4><i class="fas fa-history"></i> Histórico (${item.Historico.length} registros)</h4>
                <div class="historico-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Certificado</th>
                                <th>Ano</th>
                                <th>Data Laudo</th>
                                <th>Validade</th>
                                <th>Tipo Serviço</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${item.Historico.map(hist => `
                                <tr>
                                    <td>${hist.NumeroCertificado}</td>
                                    <td>${hist.Ano}</td>
                                    <td>${hist.DataLaudo}</td>
                                    <td>${hist.DataValidade}</td>
                                    <td>${hist.TipoServico}</td>
                                    <td><span class="status-badge ${hist.Resultado === 'Aprovado' ? 'status-approved' : 'status-rejected'}">${hist.Resultado}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
        </div>
        
        <style>
            .details-container { margin-top: 1rem; }
            .detail-section { margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
            .detail-section:last-child { border-bottom: none; }
            .detail-section h4 { color: #2563eb; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
            .detail-section p { margin-bottom: 0.5rem; }
            .faixas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
            .faixa-card { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
            .historico-table { overflow-x: auto; }
            .historico-table table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
            .historico-table th, .historico-table td { padding: 0.5rem; border: 1px solid #e2e8f0; text-align: left; }
            .historico-table th { background: #f8fafc; font-weight: 600; }
        </style>
    `;
    
    elements.modalBody.innerHTML = detailsHTML;
    elements.modal.style.display = 'block';
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    elements.pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        elements.paginationInfo.textContent = '';
        return;
    }
    
    // Previous button
    const prevBtn = createPaginationButton('‹', currentPage - 1, currentPage === 1);
    elements.pagination.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        elements.pagination.appendChild(createPaginationButton('1', 1));
        if (startPage > 2) {
            elements.pagination.appendChild(createPaginationSpan('...'));
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationButton(i.toString(), i, false, i === currentPage);
        elements.pagination.appendChild(btn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            elements.pagination.appendChild(createPaginationSpan('...'));
        }
        elements.pagination.appendChild(createPaginationButton(totalPages.toString(), totalPages));
    }
    
    // Next button
    const nextBtn = createPaginationButton('›', currentPage + 1, currentPage === totalPages);
    elements.pagination.appendChild(nextBtn);
    
    // Update pagination info
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredData.length);
    elements.paginationInfo.textContent = `${start}-${end} de ${filteredData.length}`;
}

function createPaginationButton(text, page, disabled = false, active = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.disabled = disabled;
    if (active) button.classList.add('active');
    
    if (!disabled) {
        button.addEventListener('click', () => {
            currentPage = page;
            updateResultsTable();
            updatePagination();
        });
    }
    
    return button;
}

function createPaginationSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.padding = '0.5rem';
    return span;
}

function updateDashboard() {
    // Update stats
    const totalMedidores = filteredData.length;
    const aprovados = filteredData.filter(item => item.UltimoResultado === 'Aprovado').length;
    const reprovados = totalMedidores - aprovados;
    const estados = [...new Set(filteredData.map(item => item.Estado))].length;
    
    document.getElementById('total-medidores').textContent = totalMedidores.toLocaleString('pt-BR');
    document.getElementById('total-aprovados').textContent = aprovados.toLocaleString('pt-BR');
    document.getElementById('total-reprovados').textContent = reprovados.toLocaleString('pt-BR');
    document.getElementById('total-estados').textContent = estados;
    
    // Update charts
    updateCharts();
}

function updateCharts() {
    updateEstadosChart();
    updateStatusChart();
}

function updateEstadosChart() {
    const estadosData = {};
    filteredData.forEach(item => {
        estadosData[item.Estado] = (estadosData[item.Estado] || 0) + 1;
    });
    
    const labels = Object.keys(estadosData).sort();
    const data = labels.map(estado => estadosData[estado]);
    
    const ctx = document.getElementById('estadosChart').getContext('2d');
    
    if (estadosChart) {
        estadosChart.destroy();
    }
    
    estadosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Medidores por Estado',
                data: data,
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateStatusChart() {
    const aprovados = filteredData.filter(item => item.UltimoResultado === 'Aprovado').length;
    const reprovados = filteredData.length - aprovados;
    
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Aprovados', 'Reprovados'],
            datasets: [{
                data: [aprovados, reprovados],
                backgroundColor: [
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(220, 38, 38, 0.8)'
                ],
                borderColor: [
                    'rgba(5, 150, 105, 1)',
                    'rgba(220, 38, 38, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function exportToCSV() {
    if (filteredData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const headers = [
        'Estado', 'Sigla UF', 'Município', 'Local de Verificação', 
        'Data Última Verificação', 'Data Validade', 'Último Resultado', 
        'Tipo Medidor', 'Proprietário Nome', 'Proprietário Município', 'Proprietário Estado'
    ];
    
    const csvContent = [
        headers.join(','),
        ...filteredData.map(item => [
            `"${item.Estado}"`,
            `"${item.SiglaUf}"`,
            `"${item.Municipio}"`,
            `"${item.LocalVerificacao}"`,
            `"${item.DataUltimaVerificacao}"`,
            `"${item.DataValidade}"`,
            `"${item.UltimoResultado}"`,
            `"${item.TipoMedidor}"`,
            `"${item.Proprietario?.Nome || ''}"`,
            `"${item.Proprietario?.Municipio || ''}"`,
            `"${item.Proprietario?.Estado || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `medidores_inmetro_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make showDetails available globally
window.showDetails = showDetails;
