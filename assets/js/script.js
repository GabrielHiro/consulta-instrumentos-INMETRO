// Estado global da aplicação
let appState = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 25,
    viewMode: 'table', // 'cards' ou 'table'
    filters: {
        quick: {
            estado: '',
            cidade: '',
            status: '',
            tipo: '',
            search: ''
        }
    },
    charts: {
        main: null,
        distribution: null,
        trend: null,
        comparison: null
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao carregar a aplicação');
    }
});

async function initializeApp() {
    showLoading(true);
    
    try {
        // Carregar dados
        await loadData();
        
        // Inicializar dados filtrados com todos os dados
        appState.filteredData = [...appState.data];
        
        // Inicializar UI
        initializeFilters();
        initializePagination();
        initializeViewToggle();
        
        // Atualizar dashboard e resultados
        updateDashboard();
        updateResults();
        
        console.log(`Aplicação inicializada com ${appState.data.length} registros`);
        
        // Atualizar data de última atualização
        updateLastUpdateDate();
    } catch (error) {
        console.error('Erro na inicialização:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

function updateLastUpdateDate() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdateElement.textContent = formattedDate;
    }
}

async function loadData() {
    try {
        console.log('Iniciando loadData...');
        
        // Usar StaticDatabase como fonte primária
        if (typeof staticDB !== 'undefined') {
            console.log('StaticDB encontrada, tentando inicializar...');
            try {
                await staticDB.init();
                appState.data = await staticDB.getAllInstruments();
                console.log(`Dados carregados da StaticDatabase: ${appState.data.length} registros`);
                return;
            } catch (staticError) {
                console.warn('Erro ao usar StaticDatabase:', staticError);
            }
        } else {
            console.log('StaticDB não encontrada');
        }
        
        // Fallback para IndexedDB
        if (typeof db !== 'undefined' && db && typeof db.getAllInstruments === 'function') {
            console.log('Tentando IndexedDB...');
            try {
                const dbData = await db.getAllInstruments();
                
                if (dbData && dbData.length > 0) {
                    appState.data = dbData;
                    console.log(`Dados carregados do IndexedDB: ${dbData.length} registros`);
                    return;
                }
            } catch (dbError) {
                console.warn('Erro ao acessar IndexedDB:', dbError);
            }
        } else {
            console.log('IndexedDB não disponível');
        }
        
        // Último fallback para dados de exemplo embutidos
        if (typeof getDadosExemplo === 'function') {
            console.log('Carregando base de dados local...');
            const fallbackData = getDadosExemplo();
            appState.data = fallbackData;
            console.log(`Base de dados carregada: ${fallbackData.length} registros`);
            
            // Tentar salvar no IndexedDB para próxima vez (se disponível)
            if (typeof db !== 'undefined' && db && typeof db.saveInstruments === 'function') {
                try {
                    await db.saveInstruments(fallbackData);
                    console.log('Dados sincronizados com armazenamento local');
                } catch (saveError) {
                    console.warn('Erro ao sincronizar com armazenamento local:', saveError);
                }
            }
            return;
        } else {
            console.log('Base de dados não encontrada');
        }
        
        // Se tudo falhar, criar dados vazios
        console.warn('Nenhuma fonte de dados disponível');
        appState.data = [];
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Em caso de erro, usar dados vazios
        appState.data = [];
    }
}


function initializeFilters() {
    // Filtros rápidos baseados nos filtros existentes no HTML
    const filterElements = {
        'filter-estados': 'estado',
        'filter-cidades': 'cidade',
        'filter-resultado': 'status',
        'filter-tipo': 'tipo',
        'search-input': 'search'
    };
    
    Object.entries(filterElements).forEach(([elementId, filterKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', () => onFilterChange(filterKey, element.value));
            element.addEventListener('change', () => onFilterChange(filterKey, element.value));
        }
    });
    
    // Botões de ação
    const btnApply = document.getElementById('apply-filters');
    const btnClear = document.getElementById('clear-filters');
    const btnExport = document.getElementById('export-data');
    
    if (btnApply) btnApply.addEventListener('click', applyFilters);
    if (btnClear) btnClear.addEventListener('click', clearAllFilters);
    if (btnExport) btnExport.addEventListener('click', exportData);
}

function onFilterChange(filterKey, value) {
    if (filterKey === 'cidade') {
        appState.filters.quick.cidade = value;
    } else if (filterKey === 'status') {
        appState.filters.quick.status = value;
    } else if (filterKey === 'tipo') {
        appState.filters.quick.tipo = value;
    } else if (filterKey === 'estado') {
        appState.filters.quick.estado = value;
    } else if (filterKey === 'search') {
        appState.filters.quick.search = value;
    }
    
    debounceApplyFilters();
}

function applyFilters() {
    let filtered = [...appState.data];
    
    // Aplicar filtros rápidos
    Object.entries(appState.filters.quick).forEach(([field, value]) => {
        if (value && value.trim()) {
            filtered = filtered.filter(item => {
                if (field === 'search') {
                    // Busca geral em todos os campos relevantes
                    const searchableFields = [
                        item.estado,
                        item.cidade || item.Municipio,
                        item.local || item.LocalVerificacao,
                        item.tipo || item.TipoMedidor,
                        item.status || item.UltimoResultado,
                        item.responsavel || item.ResponsavelTecnico
                    ];
                    
                    return searchableFields.some(fieldValue => 
                        fieldValue && fieldValue.toString().toLowerCase().includes(value.toLowerCase())
                    );
                } else if (field === 'cidade') {
                    const itemValue = item.cidade || item.Municipio || '';
                    return itemValue.toString().toLowerCase().includes(value.toLowerCase());
                } else if (field === 'tipo') {
                    const itemValue = item.tipo || item.TipoMedidor || '';
                    return itemValue.toString().toLowerCase().includes(value.toLowerCase());
                } else if (field === 'status') {
                    const itemValue = item.status || item.UltimoResultado || '';
                    return itemValue.toString().toLowerCase().includes(value.toLowerCase());
                } else {
                    const itemValue = item[field] || '';
                    return itemValue.toString().toLowerCase().includes(value.toLowerCase());
                }
            });
        }
    });
    
    appState.filteredData = filtered;
    appState.currentPage = 1;
    
    updateResults();
    updateDashboard();
}

function clearAllFilters() {
    // Limpar filtros rápidos
    Object.keys(appState.filters.quick).forEach(key => {
        appState.filters.quick[key] = '';
    });
    
    // Limpar elementos do DOM
    const elements = ['filter-estados', 'filter-cidades', 'filter-resultado', 'filter-tipo', 'search-input'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Aplicar filtros limpos
    applyFilters();
}

function exportData() {
    try {
        const dataStr = JSON.stringify(appState.filteredData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dados-inmetro-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados');
    }
}

function initializePagination() {
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            appState.itemsPerPage = parseInt(e.target.value);
            appState.currentPage = 1;
            updateResults();
        });
    }
}

function initializeViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newMode = e.currentTarget.dataset.view;
            setViewMode(newMode);
        });
    });
}

function onQuickFilterChange(e) {
    const field = e.target.id.replace('filtro-', '');
    appState.filters.quick[field] = e.target.value;
    debounceApplyFilters();
}

function onAdvancedFilterChange() {
    // Regiões
    Object.keys(REGIOES_BRASIL).forEach(regiao => {
        const checkbox = document.getElementById(`regiao-${regiao}`);
        if (checkbox) {
            appState.filters.advanced.region[regiao] = checkbox.checked;
        }
    });
    
    // Velocidade
    const velMin = document.getElementById('velocidade-min');
    const velMax = document.getElementById('velocidade-max');
    if (velMin) appState.filters.advanced.velocity.min = velMin.value;
    if (velMax) appState.filters.advanced.velocity.max = velMax.value;
    
    // Período
    const periodoInicio = document.getElementById('periodo-inicio');
    const periodoFim = document.getElementById('periodo-fim');
    if (periodoInicio) appState.filters.advanced.period.start = periodoInicio.value;
    if (periodoFim) appState.filters.advanced.period.end = periodoFim.value;
    
    debounceApplyFilters();
}

function toggleAdvancedFilters(e) {
    const mode = e.target.dataset.mode;
    const isAdvanced = mode === 'advanced';
    
    // Update button states
    document.querySelectorAll('.filter-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Toggle advanced filters visibility
    const advancedSection = document.querySelector('.advanced-filters');
    if (advancedSection) {
        advancedSection.classList.toggle('active', isAdvanced);
    }
    
    appState.filters.advanced.isActive = isAdvanced;
    
    // Apply filters when switching modes
    applyFilters();
}

// Debounce para evitar muitas execuções de filtros
let filterTimeout;
function debounceApplyFilters() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(applyFilters, 300);
}

function applyFilters() {
    let filtered = [...appState.data];
    
    // Aplicar filtros rápidos
    Object.entries(appState.filters.quick).forEach(([field, value]) => {
        if (value && value.trim()) {
            filtered = filtered.filter(item => {
                const itemValue = item[field] || '';
                return itemValue.toString().toLowerCase().includes(value.toLowerCase());
            });
        }
    });
    
    // Aplicar filtros avançados se ativos
    if (appState.filters.advanced.isActive) {
        // Filtro por região
        const selectedRegions = Object.entries(appState.filters.advanced.region)
            .filter(([region, selected]) => selected)
            .map(([region]) => region);
        
        if (selectedRegions.length > 0) {
            filtered = filtered.filter(item => {
                const estado = item.estado;
                return selectedRegions.some(region => 
                    REGIOES_BRASIL[region].includes(estado)
                );
            });
        }
        
        // Filtro por velocidade
        const { min: velMin, max: velMax } = appState.filters.advanced.velocity;
        if (velMin || velMax) {
            filtered = filtered.filter(item => {
                const velocidade = parseFloat(item.velocidade_maxima) || 0;
                const minVal = velMin ? parseFloat(velMin) : 0;
                const maxVal = velMax ? parseFloat(velMax) : Infinity;
                return velocidade >= minVal && velocidade <= maxVal;
            });
        }
        
        // Filtro por período
        const { start: periodoStart, end: periodoEnd } = appState.filters.advanced.period;
        if (periodoStart || periodoEnd) {
            filtered = filtered.filter(item => {
                const dataItem = new Date(item.data_aprovacao || item.data_certificacao);
                const startDate = periodoStart ? new Date(periodoStart) : new Date('1900-01-01');
                const endDate = periodoEnd ? new Date(periodoEnd) : new Date();
                return dataItem >= startDate && dataItem <= endDate;
            });
        }
    }
    
    appState.filteredData = filtered;
    appState.currentPage = 1;
    
    updateResults();
    updateDashboard();
}

function updateDashboard() {
    const data = appState.filteredData;
    console.log('updateDashboard chamada com', data.length, 'registros');
    
    // Calcular métricas
    const metrics = calculateMetrics(data);
    console.log('Métricas calculadas:', metrics);
    
    updateMetricsDisplay(metrics);
    
    // Atualizar gráficos
    updateCharts(data);
    
    // Atualizar rankings
    updateRankings(data);
}

function calculateMetrics(data) {
    const total = data.length;
    const aprovados = data.filter(item => 
        (item.status === 'Aprovado') || 
        (item.UltimoResultado === 'Aprovado') ||
        (item.status === 'Válido') ||
        (item.UltimoResultado === 'Válido')
    ).length;
    
    const rejeitados = data.filter(item => 
        (item.status === 'Rejeitado') || 
        (item.UltimoResultado === 'Rejeitado') ||
        (item.status === 'Inválido') ||
        (item.UltimoResultado === 'Inválido')
    ).length;
    
    const estados = [...new Set(data.map(item => item.Estado || item.estado).filter(Boolean))].length;
    const cidades = [...new Set(data.map(item => item.Municipio || item.cidade).filter(Boolean))].length;
    
    // Calcular instrumentos vencidos
    const hoje = new Date();
    const vencidos = data.filter(item => {
        const dataValidade = item.DataValidade || item.dataValidade;
        if (dataValidade) {
            const validade = new Date(dataValidade);
            return validade < hoje;
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
    const taxaReprovacao = total > 0 ? ((rejeitados / total) * 100).toFixed(1) : 0;
    const taxaVencidos = total > 0 ? ((vencidos / total) * 100).toFixed(1) : 0;
    
    return {
        total,
        aprovados,
        rejeitados,
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
    if (totalReprovados) totalReprovados.textContent = metrics.rejeitados.toLocaleString();
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

function updateCharts(data) {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não está carregado');
        return;
    }
    
    // Implementar gráficos com Chart.js
    updateMainChart(data);
    updateDistributionChart(data);
    updateTrendChart(data);
    updateComparisonChart(data);
}

function updateMainChart(data) {
    const canvas = document.getElementById('chart-principal');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const statusCounts = data.reduce((acc, item) => {
        const status = item.status || item.UltimoResultado || 'Pendente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    
    if (appState.charts.main) {
        appState.charts.main.destroy();
    }
    
    appState.charts.main = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'],
                borderWidth: 2,
                borderColor: '#ffffff'
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

function updateDistributionChart(data) {
    const canvas = document.getElementById('chart-distribuicao');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const estadoCounts = data.reduce((acc, item) => {
        const estado = item.estado;
        if (estado) {
            acc[estado] = (acc[estado] || 0) + 1;
        }
        return acc;
    }, {});
    
    const sortedEstados = Object.entries(estadoCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (appState.charts.distribution) {
        appState.charts.distribution.destroy();
    }
    
    appState.charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedEstados.map(([estado]) => estado),
            datasets: [{
                label: 'Medidores',
                data: sortedEstados.map(([, count]) => count),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateTrendChart(data) {
    const canvas = document.getElementById('chart-tendencia');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Agrupar por mês usando a data de validade
    const monthlyData = data.reduce((acc, item) => {
        const dateStr = item.validade || item.DataValidade;
        if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                acc[monthKey] = (acc[monthKey] || 0) + 1;
            }
        }
        return acc;
    }, {});
    
    const sortedMonths = Object.entries(monthlyData).sort();
    
    if (appState.charts.trend) {
        appState.charts.trend.destroy();
    }
    
    appState.charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths.map(([month]) => month),
            datasets: [{
                label: 'Validades por Mês',
                data: sortedMonths.map(([, count]) => count),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateComparisonChart(data) {
    const canvas = document.getElementById('chart-comparativo');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const tipoCounts = data.reduce((acc, item) => {
        const tipo = item.tipo || item.TipoMedidor;
        if (tipo) {
            acc[tipo] = (acc[tipo] || 0) + 1;
        }
        return acc;
    }, {});
    
    const topTipos = Object.entries(tipoCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    if (appState.charts.comparison) {
        appState.charts.comparison.destroy();
    }
    
    appState.charts.comparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTipos.map(([tipo]) => tipo),
            datasets: [{
                label: 'Medidores',
                data: topTipos.map(([, count]) => count),
                backgroundColor: '#8b5cf6',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateRankings(data) {
    updateEstadosRanking(data);
    updateFabricantesRanking(data);
    updateCidadesRanking(data);
}

function updateEstadosRanking(data) {
    const estadoCounts = data.reduce((acc, item) => {
        if (item.estado) {
            acc[item.estado] = (acc[item.estado] || 0) + 1;
        }
        return acc;
    }, {});
    
    const ranking = Object.entries(estadoCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-estados');
    if (container) {
        container.innerHTML = ranking.map(([estado, count], index) => `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${estado}</div>
                    <div class="ranking-count">${count} medidores</div>
                </div>
                <div class="ranking-value">${count}</div>
            </div>
        `).join('');
    }
}

function updateFabricantesRanking(data) {
    const tipoCounts = data.reduce((acc, item) => {
        const tipo = item.tipo || item.TipoMedidor;
        if (tipo) {
            acc[tipo] = (acc[tipo] || 0) + 1;
        }
        return acc;
    }, {});
    
    const ranking = Object.entries(tipoCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-fabricantes');
    if (container) {
        container.innerHTML = ranking.map(([tipo, count], index) => `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${tipo}</div>
                    <div class="ranking-count">${count} medidores</div>
                </div>
                <div class="ranking-value">${count}</div>
            </div>
        `).join('');
    }
}

function updateCidadesRanking(data) {
    const cidadeCounts = data.reduce((acc, item) => {
        const cidade = item.cidade || item.Municipio;
        if (cidade) {
            acc[cidade] = (acc[cidade] || 0) + 1;
        }
        return acc;
    }, {});
    
    const ranking = Object.entries(cidadeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const container = document.getElementById('ranking-cidades');
    if (container) {
        container.innerHTML = ranking.map(([cidade, count], index) => `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${cidade}</div>
                    <div class="ranking-count">${count} medidores</div>
                </div>
                <div class="ranking-value">${count}</div>
            </div>
        `).join('');
    }
}

function updateResults() {
    updateResultsHeader();
    
    if (appState.viewMode === 'cards') {
        updateCardsView();
        document.getElementById('table-view').style.display = 'none';
        document.getElementById('cards-view').style.display = 'block';
    } else {
        updateTableView();
        document.getElementById('table-view').style.display = 'block';
        document.getElementById('cards-view').style.display = 'none';
    }
    
    updatePagination();
}

function updateResultsHeader() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const total = appState.filteredData.length;
        const start = (appState.currentPage - 1) * appState.itemsPerPage + 1;
        const end = Math.min(start + appState.itemsPerPage - 1, total);
        
        resultsCount.textContent = total > 0 
            ? `${total.toLocaleString()} resultados encontrados (${start}-${end})`
            : 'Nenhum resultado encontrado';
    }
}

function updateCardsView() {
    const container = document.getElementById('cards-grid');
    if (!container) return;
    
    const start = (appState.currentPage - 1) * appState.itemsPerPage;
    const end = start + appState.itemsPerPage;
    const pageData = appState.filteredData.slice(start, end);
    
    container.innerHTML = pageData.map(item => createResultCard(item)).join('');
}

function updateTableView() {
    const tbody = document.getElementById('results-tbody');
    if (!tbody) return;
    
    const start = (appState.currentPage - 1) * appState.itemsPerPage;
    const end = start + appState.itemsPerPage;
    const pageData = appState.filteredData.slice(start, end);
    
    tbody.innerHTML = pageData.map(item => createResultTableRow(item)).join('');
}

function createResultCard(item) {
    return `
        <div class="result-card" onclick="openModal('${item.id || ''}')">
            <div class="card-header">
                <div class="card-status ${(item.status || item.UltimoResultado || 'pendente').toLowerCase()}">${item.status || item.UltimoResultado || 'Pendente'}</div>
            </div>
            <div class="card-content">
                <div class="card-field">
                    <span class="label">Estado:</span>
                    <span class="value">${item.estado || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="label">Cidade:</span>
                    <span class="value">${item.cidade || item.Municipio || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="label">Local:</span>
                    <span class="value">${item.local || item.LocalVerificacao || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="label">Tipo:</span>
                    <span class="value">${item.tipo || item.TipoMedidor || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="label">Validade:</span>
                    <span class="value">${item.validade || item.DataValidade || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function createResultTableRow(item) {
    return `
        <tr onclick="openModal('${item.id || ''}')">
            <td>${item.estado || 'N/A'}</td>
            <td>${item.cidade || item.Municipio || 'N/A'}</td>
            <td>${item.local || item.LocalVerificacao || 'N/A'}</td>
            <td><span class="table-status ${(item.status || item.UltimoResultado || 'pendente').toLowerCase()}">${item.status || item.UltimoResultado || 'Pendente'}</span></td>
            <td>${item.tipo || item.TipoMedidor || 'N/A'}</td>
            <td>${item.validade || item.DataValidade || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openModal('${item.id || ''}')">
                    Ver Detalhes
                </button>
            </td>
        </tr>
    `;
}

function updatePagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(appState.filteredData.length / appState.itemsPerPage);
    const currentPage = appState.currentPage;
    
    let paginationHTML = '';
    
    // Páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    container.innerHTML = paginationHTML;
    
    // Atualizar botões de navegação
    const btnFirst = document.getElementById('pagination-first');
    const btnPrev = document.getElementById('pagination-prev');
    const btnNext = document.getElementById('pagination-next');
    const btnLast = document.getElementById('pagination-last');
    
    if (btnFirst) {
        btnFirst.disabled = currentPage === 1;
        btnFirst.onclick = () => changePage(1);
    }
    if (btnPrev) {
        btnPrev.disabled = currentPage === 1;
        btnPrev.onclick = () => changePage(currentPage - 1);
    }
    if (btnNext) {
        btnNext.disabled = currentPage === totalPages;
        btnNext.onclick = () => changePage(currentPage + 1);
    }
    if (btnLast) {
        btnLast.disabled = currentPage === totalPages;
        btnLast.onclick = () => changePage(totalPages);
    }
    
    // Atualizar info da paginação
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    // Configurar input de pulo de página
    const pageJump = document.getElementById('page-jump');
    const jumpBtn = document.getElementById('jump-btn');
    if (pageJump && jumpBtn) {
        pageJump.max = totalPages;
        pageJump.value = currentPage;
        jumpBtn.onclick = () => {
            const page = parseInt(pageJump.value);
            if (page >= 1 && page <= totalPages) {
                changePage(page);
            }
        };
    }
}

function changePage(page) {
    const totalPages = Math.ceil(appState.filteredData.length / appState.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        appState.currentPage = page;
        updateResults();
        
        // Scroll para o topo dos resultados
        const resultsContainer = document.querySelector('.results-section');
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function setViewMode(mode) {
    appState.viewMode = mode;
    
    // Atualizar botões
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === mode);
    });
    
    // Atualizar resultados
    updateResults();
}

function clearAllFilters() {
    // Limpar filtros rápidos
    Object.keys(appState.filters.quick).forEach(key => {
        appState.filters.quick[key] = '';
        const element = document.getElementById(`filtro-${key}`);
        if (element) element.value = '';
    });
    
    // Limpar filtros avançados
    Object.keys(appState.filters.advanced.region).forEach(key => {
        appState.filters.advanced.region[key] = false;
        const element = document.getElementById(`regiao-${key}`);
        if (element) element.checked = false;
    });
    
    appState.filters.advanced.velocity.min = '';
    appState.filters.advanced.velocity.max = '';
    appState.filters.advanced.period.start = '';
    appState.filters.advanced.period.end = '';
    
    const velMin = document.getElementById('velocidade-min');
    const velMax = document.getElementById('velocidade-max');
    const periodoInicio = document.getElementById('periodo-inicio');
    const periodoFim = document.getElementById('periodo-fim');
    
    if (velMin) velMin.value = '';
    if (velMax) velMax.value = '';
    if (periodoInicio) periodoInicio.value = '';
    if (periodoFim) periodoFim.value = '';
    
    // Aplicar filtros limpos
    applyFilters();
}

function saveCurrentFilter() {
    const filterName = prompt('Nome para salvar este filtro:');
    if (filterName) {
        const filter = {
            name: filterName,
            filters: JSON.parse(JSON.stringify(appState.filters))
        };
        
        appState.savedFilters.push(filter);
        updateSavedFiltersList();
        
        // Salvar no localStorage
        localStorage.setItem('inmetro-saved-filters', JSON.stringify(appState.savedFilters));
    }
}

function updateSavedFiltersList() {
    const container = document.querySelector('.saved-filter-list');
    if (!container) return;
    
    container.innerHTML = appState.savedFilters.map((filter, index) => `
        <div class="saved-filter-item" onclick="loadSavedFilter(${index})">
            <span>📋</span>
            <span>${filter.name}</span>
            <button onclick="event.stopPropagation(); removeSavedFilter(${index})" class="remove">×</button>
        </div>
    `).join('');
}

function loadSavedFilter(index) {
    const filter = appState.savedFilters[index];
    if (filter) {
        appState.filters = JSON.parse(JSON.stringify(filter.filters));
        
        // Atualizar UI com os filtros carregados
        updateFiltersUI();
        applyFilters();
    }
}

function removeSavedFilter(index) {
    appState.savedFilters.splice(index, 1);
    updateSavedFiltersList();
    localStorage.setItem('inmetro-saved-filters', JSON.stringify(appState.savedFilters));
}

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    console.error(message);
    // Implementar notificação de erro se necessário
}

// Modal functions
function openModal(id) {
    const modal = document.getElementById('detailsModal');
    const item = appState.filteredData.find(item => item.id === id) || appState.filteredData[0];
    
    if (modal && item) {
        updateModalContent(item);
        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateModalContent(item) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="modal-content-grid">
            <div class="modal-field">
                <strong>Estado:</strong>
                <span>${item.estado || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Cidade:</strong>
                <span>${item.cidade || item.Municipio || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Local de Verificação:</strong>
                <span>${item.local || item.LocalVerificacao || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Status:</strong>
                <span class="status-badge ${(item.status || item.UltimoResultado || 'pendente').toLowerCase()}">${item.status || item.UltimoResultado || 'Pendente'}</span>
            </div>
            <div class="modal-field">
                <strong>Tipo de Medidor:</strong>
                <span>${item.tipo || item.TipoMedidor || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Data de Validade:</strong>
                <span>${item.validade || item.DataValidade || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Código de Verificação:</strong>
                <span>${item.codigo || item.CodigoVerificacao || 'N/A'}</span>
            </div>
            <div class="modal-field">
                <strong>Responsável Técnico:</strong>
                <span>${item.responsavel || item.ResponsavelTecnico || 'N/A'}</span>
            </div>
        </div>
    `;
}

// Função para fechar modal ao clicar no X
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('detailsModal');
    const closeBtn = modal?.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    const modal = document.getElementById('detailsModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});
