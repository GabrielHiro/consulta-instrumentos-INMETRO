/**
 * Base de Dados Estática Simulada para Instrumentos INMETRO
 * Simula uma estrutura de banco de dados local com funcionalidades avançadas
 */

class StaticDatabase {
    constructor() {
        this.dbName = 'InmetroInstrumentosDB';
        this.version = 1;
        this.tableName = 'instrumentos';
        this.metadataTable = 'metadata';
        
        // Estrutura simulada de índices para performance
        this.indices = {
            estado: new Map(),
            cidade: new Map(),
            tipo: new Map(),
            resultado: new Map(),
            proprietario: new Map()
        };
        
        this.isInitialized = false;
        this.data = [];
        this.metadata = {
            lastUpdate: null,
            totalRecords: 0,
            version: '1.0.0',
            source: 'Static Database'
        };
    }

    async init() {
        try {
            console.log('Inicializando StaticDatabase...');
            
            // Carregar dados embutidos como fonte primária
            if (typeof getDadosExemplo === 'function') {
                this.data = getDadosExemplo();
                this.buildIndices();
                this.updateMetadata();
                this.isInitialized = true;
                
                console.log(`StaticDatabase inicializada: ${this.data.length} registros`);
                console.log('Índices criados:', Object.keys(this.indices));
                
                return true;
            } else {
                throw new Error('Função getDadosExemplo não encontrada');
            }
        } catch (error) {
            console.error('Erro ao inicializar StaticDatabase:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    buildIndices() {
        console.log('Construindo índices para otimização de consultas...');
        
        // Limpar índices existentes
        Object.values(this.indices).forEach(index => index.clear());
        
        // Construir índices para campos importantes
        this.data.forEach((record, idx) => {
            // Índice por estado
            const estado = record.Estado?.toLowerCase();
            if (estado) {
                if (!this.indices.estado.has(estado)) {
                    this.indices.estado.set(estado, []);
                }
                this.indices.estado.get(estado).push(idx);
            }
            
            // Índice por cidade
            const cidade = record.Municipio?.toLowerCase();
            if (cidade) {
                if (!this.indices.cidade.has(cidade)) {
                    this.indices.cidade.set(cidade, []);
                }
                this.indices.cidade.get(cidade).push(idx);
            }
            
            // Índice por tipo
            const tipo = record.TipoMedidor?.toLowerCase();
            if (tipo) {
                if (!this.indices.tipo.has(tipo)) {
                    this.indices.tipo.set(tipo, []);
                }
                this.indices.tipo.get(tipo).push(idx);
            }
            
            // Índice por resultado
            const resultado = record.UltimoResultado?.toLowerCase();
            if (resultado) {
                if (!this.indices.resultado.has(resultado)) {
                    this.indices.resultado.set(resultado, []);
                }
                this.indices.resultado.get(resultado).push(idx);
            }
            
            // Índice por proprietário
            const proprietario = record.Proprietario?.toLowerCase();
            if (proprietario) {
                if (!this.indices.proprietario.has(proprietario)) {
                    this.indices.proprietario.set(proprietario, []);
                }
                this.indices.proprietario.get(proprietario).push(idx);
            }
        });
        
        console.log('Índices construídos com sucesso:');
        Object.entries(this.indices).forEach(([key, index]) => {
            console.log(`  ${key}: ${index.size} valores únicos`);
        });
    }

    updateMetadata() {
        this.metadata = {
            lastUpdate: new Date().toISOString(),
            totalRecords: this.data.length,
            version: '1.0.0',
            source: 'Static Database',
            indices: {
                estado: this.indices.estado.size,
                cidade: this.indices.cidade.size,
                tipo: this.indices.tipo.size,
                resultado: this.indices.resultado.size,
                proprietario: this.indices.proprietario.size
            }
        };
    }

    // Métodos de consulta otimizados

    async getAllInstruments() {
        if (!this.isInitialized) {
            await this.init();
        }
        return [...this.data]; // Retorna cópia para evitar mutação
    }

    async getInstrumentsByState(estado) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const indices = this.indices.estado.get(estado.toLowerCase()) || [];
        return indices.map(idx => this.data[idx]);
    }

    async getInstrumentsByCity(cidade) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const indices = this.indices.cidade.get(cidade.toLowerCase()) || [];
        return indices.map(idx => this.data[idx]);
    }

    async getInstrumentsByResult(resultado) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const indices = this.indices.resultado.get(resultado.toLowerCase()) || [];
        return indices.map(idx => this.data[idx]);
    }

    async searchInstruments(query) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const lowerQuery = query.toLowerCase();
        return this.data.filter(record => 
            JSON.stringify(record).toLowerCase().includes(lowerQuery)
        );
    }

    async getUniqueValues(field) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const values = new Set();
        this.data.forEach(record => {
            const value = record[field];
            if (value && value !== '') {
                values.add(value);
            }
        });
        
        return Array.from(values).sort();
    }

    async getStatistics() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const stats = {
            total: this.data.length,
            byState: {},
            byResult: {},
            byType: {},
            velocityStats: {
                min: null,
                max: null,
                avg: 0
            }
        };
        
        let velocitySum = 0;
        let velocityCount = 0;
        let minVelocity = Infinity;
        let maxVelocity = -Infinity;
        
        this.data.forEach(record => {
            // Estatísticas por estado
            const state = record.Estado;
            if (state) {
                stats.byState[state] = (stats.byState[state] || 0) + 1;
            }
            
            // Estatísticas por resultado
            const result = record.UltimoResultado;
            if (result) {
                stats.byResult[result] = (stats.byResult[result] || 0) + 1;
            }
            
            // Estatísticas por tipo
            const type = record.TipoMedidor;
            if (type) {
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            }
            
            // Estatísticas de velocidade
            const velocity = parseFloat(record.VelocidadeNominal);
            if (!isNaN(velocity)) {
                velocitySum += velocity;
                velocityCount++;
                minVelocity = Math.min(minVelocity, velocity);
                maxVelocity = Math.max(maxVelocity, velocity);
            }
        });
        
        if (velocityCount > 0) {
            stats.velocityStats = {
                min: minVelocity,
                max: maxVelocity,
                avg: Math.round(velocitySum / velocityCount)
            };
        }
        
        return stats;
    }

    async getMetadata() {
        if (!this.isInitialized) {
            await this.init();
        }
        return { ...this.metadata };
    }

    async hasData() {
        if (!this.isInitialized) {
            await this.init();
        }
        return this.data.length > 0;
    }

    // Métodos de compatibilidade com a interface anterior
    async saveInstruments(data) {
        console.warn('StaticDatabase é somente leitura - dados não podem ser salvos');
        return false;
    }

    async clearData() {
        console.warn('StaticDatabase é somente leitura - dados não podem ser limpos');
        return false;
    }

    async loadData() {
        return await this.getAllInstruments();
    }

    async saveData(data) {
        console.warn('StaticDatabase é somente leitura - dados não podem ser salvos');
        return false;
    }
}

// Instância global para compatibilidade
const staticDB = new StaticDatabase();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.StaticDatabase = StaticDatabase;
    window.staticDB = staticDB;
}
