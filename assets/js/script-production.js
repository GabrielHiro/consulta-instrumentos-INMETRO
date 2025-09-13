// Configuração para diferentes ambientes
const CONFIG = {
    development: {
        useLocalData: false,  // Mudado para false para sempre usar API
        corsProxy: 'https://corsproxy.io/?'
    },
    production: {
        useLocalData: false,
        corsProxy: 'https://corsproxy.io/?'
    }
};

// Detectar ambiente
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = isProduction ? CONFIG.production : CONFIG.development;

// Global variables
let allData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';

// Estados brasileiros para a API do INMETRO
const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'ES', 'GO', 'MA',
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
    lastUpdate: document.getElementById('last-update'),
    demoNotice: document.querySelector('.demo-notice')
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
        
        // Esconder aviso de demo em produção
        if (isProduction && elements.demoNotice) {
            elements.demoNotice.style.display = 'none';
        }
        
        await loadAllData();
        setupEventListeners();
        updateDashboard();
        hideLoading();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        hideLoading();
        alert('Erro ao carregar dados. Tente novamente mais tarde.');
    }
}

function showLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
}

function hideLoading() {
    showLoading(false);
}

async function loadAllData() {
    if (currentConfig.useLocalData) {
        await loadLocalData();
    } else {
        await loadApiData();
    }
}

async function loadLocalData() {
    console.log('Carregando dados locais como fallback...');
    
    try {
        // Usar função getDadosExemplo se disponível
        if (typeof getDadosExemplo === 'function') {
            const baseData = getDadosExemplo();
            
            // Gerar dados para todos os estados brasileiros
            allData = [];
            estadosBrasileiros.forEach(estado => {
                const estadoData = generateDataForState(estado, baseData);
                allData = allData.concat(estadoData);
            });
            
            console.log(`Total de registros simulados: ${allData.length} para ${estadosBrasileiros.length} estados`);
        } else {
            // Fallback caso getDadosExemplo não esteja disponível
            allData = generateFallbackData();
        }
        
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
        
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        allData = generateFallbackData();
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
    }
}

function generateDataForState(estado, baseData) {
    // Mapear estado para nome completo
    const estadosNomes = {
        'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
        'BA': 'Bahia', 'CE': 'Ceará', 'ES': 'Espírito Santo', 'GO': 'Goiás',
        'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
        'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
        'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro',
        'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
        'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
        'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
    };
    
    const nomeEstado = estadosNomes[estado] || estado;
    const qtdRegistros = Math.floor(Math.random() * 50) + 10; // 10-60 registros por estado
    
    const estadoData = [];
    for (let i = 0; i < qtdRegistros; i++) {
        const baseItem = baseData[Math.floor(Math.random() * baseData.length)];
        estadoData.push({
            ...baseItem,
            SiglaUf: estado,
            Estado: nomeEstado,
            Municipio: generateCityName(estado),
            LocalVerificacao: generateLocation(nomeEstado),
            DataUltimaVerificacao: generateRandomDate(),
            DataValidade: generateValidityDate(),
            UltimoResultado: Math.random() > 0.8 ? 'Reprovado' : 'Aprovado'
        });
    }
    
    return estadoData;
}

function generateCityName(estado) {
    const cidades = {
        'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
        'RJ': ['Rio de Janeiro', 'Niterói', 'Campos', 'Nova Iguaçu', 'Petrópolis'],
        'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Montes Claros'],
        'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria', 'Gravataí'],
        'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
        'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Itajaí'],
        'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
        'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
        'PE': ['Recife', 'Jaboatão', 'Olinda', 'Caruaru', 'Petrolina'],
        'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral']
    };
    
    const estadoCidades = cidades[estado] || ['Capital', 'Cidade Central', 'Município'];
    return estadoCidades[Math.floor(Math.random() * estadoCidades.length)];
}

function generateLocation(estado) {
    const tipos = ['Avenida', 'Rua', 'Rodovia', 'Estrada'];
    const nomes = ['Principal', 'Central', 'Industrial', 'Norte', 'Sul'];
    const numeros = Math.floor(Math.random() * 9000) + 1000;
    
    return `${tipos[Math.floor(Math.random() * tipos.length)]} ${nomes[Math.floor(Math.random() * nomes.length)]}, ${numeros} - ${estado}`;
}

function generateRandomDate() {
    const hoje = new Date();
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    const dataAleatoria = new Date(umAnoAtras.getTime() + Math.random() * (hoje.getTime() - umAnoAtras.getTime()));
    return dataAleatoria.toLocaleDateString('pt-BR');
}

function generateValidityDate() {
    const hoje = new Date();
    const umAnoFrente = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate());
    return umAnoFrente.toLocaleDateString('pt-BR');
}

function generateFallbackData() {
    console.log('Gerando dados de fallback mínimos...');
    return [{
        SiglaUf: 'SP',
        Estado: 'São Paulo',
        Municipio: 'São Paulo',
        LocalVerificacao: 'Avenida Paulista, 1000',
        DataUltimaVerificacao: new Date().toLocaleDateString('pt-BR'),
        DataValidade: new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('pt-BR'),
        UltimoResultado: 'Aprovado',
        TipoMedidor: 'Medidor de Velocidade'
    }];
}

async function loadApiData() {
    console.log('Carregando dados da API do INMETRO...');
    
    // Carregar dados de TODOS os estados brasileiros
    console.log(`Iniciando carregamento de ${estadosBrasileiros.length} estados...`);
    const promises = estadosBrasileiros.map(estado => loadStateDataWithProxy(estado));
    const results = await Promise.allSettled(promises);
    
    allData = [];
    let estadosComDados = 0;
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
            allData = allData.concat(result.value);
            estadosComDados++;
            console.log(`✓ ${estadosBrasileiros[index]}: ${result.value.length} registros`);
        } else {
            console.warn(`✗ ${estadosBrasileiros[index]}: Sem dados ou erro`);
        }
    });
    
    console.log(`Dados carregados de ${estadosComDados}/${estadosBrasileiros.length} estados`);
    
    // Se não conseguiu carregar nenhum dado da API, usar dados de exemplo
    if (allData.length === 0) {
        console.log('Nenhum dado da API carregado, usando dados de exemplo...');
        await loadLocalData();
        return;
    }
    
    console.log(`✅ Total de registros carregados da API: ${allData.length}`);
    elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
}

async function loadStateDataWithProxy(estado) {
    try {
        const url = `${currentConfig.corsProxy}https://servicos.rbmlq.gov.br/dados-abertos/${estado}/medidores.json`;
        const response = await fetch(url, {
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

// Função para atualizar dashboard
function updateDashboard() {
    if (!allData || allData.length === 0) {
        console.warn('Sem dados para atualizar dashboard');
        return;
    }
    
    console.log('Atualizando dashboard com', allData.length, 'registros');
    
    // Calcular métricas
    const metrics = calculateMetrics(allData);
    updateMetricsDisplay(metrics);
    
    // Atualizar gráficos
    updateCharts(allData);
    
    // Atualizar rankings
    updateRankings(allData);
    
    // Atualizar tabela de resultados
    updateResultsTable(allData);
}

function calculateMetrics(data) {
    const total = data.length;
    
    let aprovados = 0;
    let reprovados = 0;
    
    data.forEach(item => {
        const resultado = item.UltimoResultado || item.status || '';
        if (resultado.toLowerCase().includes('aprovado') || resultado.toLowerCase().includes('válido')) {
            aprovados++;
        } else if (resultado.toLowerCase().includes('reprovado') || resultado.toLowerCase().includes('inválido') || resultado.toLowerCase().includes('rejeitado')) {
            reprovados++;
        }
    });
    
    const estados = [...new Set(data.map(item => item.Estado || item.estado).filter(Boolean))].length;
    const cidades = [...new Set(data.map(item => item.Municipio || item.cidade).filter(Boolean))].length;
    
    // Calcular instrumentos vencidos
    const hoje = new Date();
    const vencidos = data.filter(item => {
        const dataValidade = item.DataValidade || item.dataValidade;
        if (dataValidade) {
            try {
                const [dia, mes, ano] = dataValidade.split('/');
                const validade = new Date(ano, mes - 1, dia);
                return validade < hoje;
            } catch (e) {
                return false;
            }
        }
        return false;
    }).length;
    
    // Calcular velocidade média
    const velocidades = data.map(item => {
        const vel = parseFloat(item.VelocidadeNominal || item.velocidadeNominal || 0);
        return isNaN(vel) ? 0 : vel;
    }).filter(vel => vel > 0);
    
    const velocidadeMedia = velocidades.length > 0 
        ? Math.round(velocidades.reduce((sum, vel) => sum + vel, 0) / velocidades.length)
        : 0;
    
    const taxaAprovacao = total > 0 ? ((aprovados / total) * 100).toFixed(1) : 0;
    const taxaReprovacao = total > 0 ? ((reprovados / total) * 100).toFixed(1) : 0;
    const taxaVencidos = total > 0 ? ((vencidos / total) * 100).toFixed(1) : 0;
    
    console.log('Métricas calculadas:', {
        total, aprovados, reprovados, estados, cidades, vencidos, velocidadeMedia
    });
    
    return {
        total,
        aprovados,
        reprovados,
        estados,
        cidades,
        vencidos,
        velocidadeMedia,
        taxaAprovacao,
        taxaReprovacao,
        taxaVencidos
    };
}

function updateMetricsDisplay(metrics) {
    // Atualizar métricas principais usando os IDs corretos do HTML
    const totalMedidores = document.getElementById('total-medidores');
    const totalAprovados = document.getElementById('total-aprovados');
    const totalReprovados = document.getElementById('total-reprovados');
    const totalEstados = document.getElementById('total-estados');
    const totalVencidos = document.getElementById('total-vencidos');
    const velocidadeMedia = document.getElementById('velocidade-media');
    
    if (totalMedidores) totalMedidores.textContent = metrics.total.toLocaleString();
    if (totalAprovados) totalAprovados.textContent = metrics.aprovados.toLocaleString();
    if (totalReprovados) totalReprovados.textContent = metrics.reprovados.toLocaleString();
    if (totalEstados) totalEstados.textContent = metrics.estados;
    if (totalVencidos) totalVencidos.textContent = metrics.vencidos || 0;
    if (velocidadeMedia) velocidadeMedia.textContent = metrics.velocidadeMedia || 0;
    
    // Atualizar percentuais
    const aprovadosPercent = document.getElementById('aprovados-percent');
    const reprovadosPercent = document.getElementById('reprovados-percent');
    const vencidosPercent = document.getElementById('vencidos-percent');
    const estadosInfo = document.getElementById('estados-info');
    
    if (aprovadosPercent) aprovadosPercent.textContent = `${metrics.taxaAprovacao}%`;
    if (reprovadosPercent) reprovadosPercent.textContent = `${metrics.taxaReprovacao || 0}%`;
    if (vencidosPercent) vencidosPercent.textContent = `${metrics.taxaVencidos || 0}%`;
    if (estadosInfo) estadosInfo.textContent = `${metrics.cidades} cidades`;
}

function setupEventListeners() {
    // Implementar event listeners conforme necessário
    console.log('Event listeners configurados');
}

function applyFilters() {
    console.log('Aplicando filtros...');
    
    // Pegar valores dos filtros
    const estado = domElements.filters.estado.value;
    const cidade = domElements.filters.cidade.value;
    const status = domElements.filters.status.value;
    const tipo = domElements.filters.tipo.value;
    const dataInicio = domElements.filters.dataInicio.value;
    const dataFim = domElements.filters.dataFim.value;
    
    // Aplicar filtros
    filteredData = allData.filter(item => {
        // Filtro por estado
        if (estado && estado !== 'todos') {
            const itemEstado = item.Estado || item.estado || '';
            if (itemEstado.toLowerCase() !== estado.toLowerCase()) {
                return false;
            }
        }
        
        // Filtro por cidade
        if (cidade && cidade !== 'todas') {
            const itemCidade = item.Municipio || item.cidade || '';
            if (itemCidade.toLowerCase() !== cidade.toLowerCase()) {
                return false;
            }
        }
        
        // Filtro por status
        if (status && status !== 'todos') {
            const itemStatus = item.UltimoResultado || item.status || '';
            if (status === 'aprovado' && !itemStatus.toLowerCase().includes('aprovado') && !itemStatus.toLowerCase().includes('válido')) {
                return false;
            }
            if (status === 'reprovado' && !itemStatus.toLowerCase().includes('reprovado') && !itemStatus.toLowerCase().includes('inválido')) {
                return false;
            }
        }
        
        // Filtro por tipo
        if (tipo && tipo !== 'todos') {
            const itemTipo = item.Tipo || item.tipo || '';
            if (itemTipo.toLowerCase() !== tipo.toLowerCase()) {
                return false;
            }
        }
        
        // Filtro por data
        if (dataInicio) {
            const itemData = item.DataCalibracao || item.dataCalibracao;
            if (itemData) {
                try {
                    const [dia, mes, ano] = itemData.split('/');
                    const dataItem = new Date(ano, mes - 1, dia);
                    const dataFiltroInicio = new Date(dataInicio);
                    if (dataItem < dataFiltroInicio) {
                        return false;
                    }
                } catch (e) {
                    // Se não conseguir parsear a data, ignora o filtro
                }
            }
        }
        
        if (dataFim) {
            const itemData = item.DataCalibracao || item.dataCalibracao;
            if (itemData) {
                try {
                    const [dia, mes, ano] = itemData.split('/');
                    const dataItem = new Date(ano, mes - 1, dia);
                    const dataFiltroFim = new Date(dataFim);
                    if (dataItem > dataFiltroFim) {
                        return false;
                    }
                } catch (e) {
                    // Se não conseguir parsear a data, ignora o filtro
                }
            }
        }
        
        return true;
    });
    
    console.log(`Filtros aplicados: ${filteredData.length} de ${allData.length} registros`);
    
    // Atualizar visualizações com dados filtrados
    const metrics = calculateMetrics(filteredData);
    updateMetricsDisplay(metrics);
    updateCharts(filteredData);
    updateRankings(filteredData);
    updateResultsTable(filteredData);
}

function updateResultsTable(data) {
    const tableBody = document.querySelector('#results-table tbody');
    if (!tableBody) {
        console.warn('Tabela de resultados não encontrada');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Se não há dados, mostrar mensagem
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum resultado encontrado</td></tr>';
        return;
    }
    
    // Adicionar cada registro
    data.slice(0, 100).forEach(item => { // Limitar a 100 para performance
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.NumeroSerie || item.numeroSerie || 'N/A'}</td>
            <td>${item.Estado || item.estado || 'N/A'}</td>
            <td>${item.Municipio || item.cidade || 'N/A'}</td>
            <td>${item.Tipo || item.tipo || 'N/A'}</td>
            <td>${item.Proprietario || item.proprietario || item.RazaoSocial || 'N/A'}</td>
            <td>${item.UltimoResultado || item.status || 'N/A'}</td>
            <td>${item.DataCalibracao || item.dataCalibracao || 'N/A'}</td>
            <td>${item.DataValidade || item.dataValidade || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log(`Tabela atualizada com ${Math.min(data.length, 100)} registros`);
}

function updateCharts(data) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não está carregado');
        return;
    }
    
    updateEstadosChart(data);
    updateStatusChart(data);
    updateTipoChart(data);
    updateVelocidadeChart(data);
    updateAnoChart(data);
}

function updateEstadosChart(data) {
    const ctx = document.getElementById('estadosChart');
    if (!ctx) return;
    
    // Contar por estado
    const estadoCount = {};
    data.forEach(item => {
        const estado = item.Estado || item.estado;
        if (estado) {
            estadoCount[estado] = (estadoCount[estado] || 0) + 1;
        }
    });
    
    // Pegar top 10 estados
    const sortedEstados = Object.entries(estadoCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const labels = sortedEstados.map(([estado]) => estado);
    const values = sortedEstados.map(([,count]) => count);
    
    if (estadosChart) {
        estadosChart.destroy();
    }
    
    estadosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Instrumentos por Estado',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    let aprovados = 0;
    let reprovados = 0;
    
    data.forEach(item => {
        const resultado = item.UltimoResultado || item.status;
        if (resultado === 'Aprovado' || resultado === 'Válido') {
            aprovados++;
        } else if (resultado === 'Reprovado' || resultado === 'Inválido') {
            reprovados++;
        }
    });
    
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
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTipoChart(data) {
    const ctx = document.getElementById('tipoChart');
    if (!ctx) return;
    
    const tipoCount = {};
    data.forEach(item => {
        const tipo = item.TipoMedidor || item.tipo || 'Não especificado';
        tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
    });
    
    const labels = Object.keys(tipoCount);
    const values = Object.values(tipoCount);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateVelocidadeChart(data) {
    const ctx = document.getElementById('velocidadeChart');
    if (!ctx) return;
    
    const velocidadeRanges = {
        '0-30 km/h': 0,
        '31-60 km/h': 0,
        '61-100 km/h': 0,
        '101+ km/h': 0
    };
    
    data.forEach(item => {
        const vel = parseFloat(item.VelocidadeNominal || item.velocidadeNominal || 0);
        if (vel <= 30) velocidadeRanges['0-30 km/h']++;
        else if (vel <= 60) velocidadeRanges['31-60 km/h']++;
        else if (vel <= 100) velocidadeRanges['61-100 km/h']++;
        else if (vel > 100) velocidadeRanges['101+ km/h']++;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(velocidadeRanges),
            datasets: [{
                label: 'Instrumentos por Velocidade',
                data: Object.values(velocidadeRanges),
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateAnoChart(data) {
    const ctx = document.getElementById('anoChart');
    if (!ctx) return;
    
    const anoCount = {};
    data.forEach(item => {
        const dataVerificacao = item.DataUltimaVerificacao || item.dataVerificacao;
        if (dataVerificacao) {
            const ano = dataVerificacao.split('/')[2] || new Date().getFullYear();
            anoCount[ano] = (anoCount[ano] || 0) + 1;
        }
    });
    
    const sortedAnos = Object.entries(anoCount)
        .sort(([a], [b]) => a - b)
        .slice(-5); // Últimos 5 anos
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedAnos.map(([ano]) => ano),
            datasets: [{
                label: 'Verificações por Ano',
                data: sortedAnos.map(([,count]) => count),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateRankings(data) {
    updateEstadosRanking(data);
    updateCidadesRanking(data);
    updateProprietariosRanking(data);
}

function updateEstadosRanking(data) {
    const estadoCount = {};
    data.forEach(item => {
        const estado = item.Estado || item.estado;
        if (estado) {
            estadoCount[estado] = (estadoCount[estado] || 0) + 1;
        }
    });
    
    const ranking = Object.entries(estadoCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-estados');
    if (container) {
        container.innerHTML = ranking.map(([estado, count], index) => `
            <div class="ranking-item">
                <span class="rank">${index + 1}º</span>
                <span class="name">${estado}</span>
                <span class="count">${count.toLocaleString()}</span>
            </div>
        `).join('');
    }
}

function updateCidadesRanking(data) {
    const cidadeCount = {};
    data.forEach(item => {
        const cidade = item.Municipio || item.cidade;
        if (cidade) {
            cidadeCount[cidade] = (cidadeCount[cidade] || 0) + 1;
        }
    });
    
    const ranking = Object.entries(cidadeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-cidades');
    if (container) {
        container.innerHTML = ranking.map(([cidade, count], index) => `
            <div class="ranking-item">
                <span class="rank">${index + 1}º</span>
                <span class="name">${cidade}</span>
                <span class="count">${count.toLocaleString()}</span>
            </div>
        `).join('');
    }
}

function updateProprietariosRanking(data) {
    const proprietarioCount = {};
    data.forEach(item => {
        const proprietario = item.Proprietario || item.proprietario || item.RazaoSocial || item.razaoSocial || 'Não informado';
        if (proprietario && proprietario !== 'Não informado') {
            proprietarioCount[proprietario] = (proprietarioCount[proprietario] || 0) + 1;
        }
    });
    
    const ranking = Object.entries(proprietarioCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-proprietarios');
    if (container) {
        container.innerHTML = ranking.map(([proprietario, count], index) => `
            <div class="ranking-item">
                <span class="rank">${index + 1}º</span>
                <span class="name">${proprietario}</span>
                <span class="count">${count.toLocaleString()}</span>
            </div>
        `).join('');
    }
}
