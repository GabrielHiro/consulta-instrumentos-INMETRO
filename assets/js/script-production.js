// Configuração para diferentes ambientes
const CONFIG = {
    development: {
        useLocalData: true,
        corsProxy: null
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
        applyFilters();
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
    console.log('Carregando dados de exemplo...');
    
    try {
        // Carregar dados locais para demonstração
        const response = await fetch('assets/js/dados-exemplo.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allData = await response.json();
        console.log(`Total de registros carregados: ${allData.length}`);
        
        // Adicionar dados de outros estados para demonstrar variedade
        const estadosAdicionais = generateAdditionalData();
        allData = allData.concat(estadosAdicionais);
        
        console.log(`Total final de registros: ${allData.length}`);
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
        
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        // Usar dados mínimos em caso de erro
        allData = generateFallbackData();
        elements.lastUpdate.textContent = new Date().toLocaleString('pt-BR');
    }
}

async function loadApiData() {
    console.log('Carregando dados da API do INMETRO...');
    
    // Carregar apenas alguns estados principais para não sobrecarregar
    const estadosPrincipais = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'];
    const promises = estadosPrincipais.map(estado => loadStateDataWithProxy(estado));
    const results = await Promise.allSettled(promises);
    
    allData = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            allData = allData.concat(result.value);
        } else {
            console.warn(`Erro ao carregar dados do estado ${estadosPrincipais[index]}:`, result.reason);
        }
    });
    
    // Se não conseguiu carregar nenhum dado da API, usar dados de exemplo
    if (allData.length === 0) {
        console.log('Nenhum dado da API carregado, usando dados de exemplo...');
        await loadLocalData();
        return;
    }
    
    console.log(`Total de registros carregados da API: ${allData.length}`);
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
