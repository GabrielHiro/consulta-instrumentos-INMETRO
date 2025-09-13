// Sistema de Banco de Dados Local para Consulta INMETRO
// Usando IndexedDB para armazenamento permanente

class InmetroDatabase {
    constructor() {
        this.dbName = 'InmetroMedidoresDB';
        this.dbVersion = 1;
        this.db = null;
        this.storeName = 'medidores';
    }

    // Inicializar banco de dados
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Erro ao abrir banco de dados:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Banco de dados inicializado com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar store para medidores se não existir
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    
                    // Criar índices para busca eficiente
                    store.createIndex('estado', 'Estado', { unique: false });
                    store.createIndex('municipio', 'Municipio', { unique: false });
                    store.createIndex('resultado', 'UltimoResultado', { unique: false });
                    store.createIndex('tipo', 'TipoMedidor', { unique: false });
                    store.createIndex('siglaUf', 'SiglaUf', { unique: false });
                }

                // Criar store para metadados
                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'key' });
                }
            };
        });
    }

    // Salvar dados no banco
    async saveData(data) {
        if (!this.db) {
            throw new Error('Banco de dados não inicializado');
        }

        const transaction = this.db.transaction([this.storeName, 'metadata'], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const metaStore = transaction.objectStore('metadata');

        // Limpar dados existentes
        await store.clear();

        // Salvar novos dados
        const promises = data.map((item, index) => {
            const itemWithId = { ...item, id: index + 1 };
            return store.add(itemWithId);
        });

        // Salvar metadados
        const metadata = {
            key: 'lastUpdate',
            value: new Date().toISOString(),
            totalRecords: data.length
        };
        
        promises.push(metaStore.put(metadata));

        return Promise.all(promises);
    }

    // Carregar todos os dados
    async loadData() {
        if (!this.db) {
            throw new Error('Banco de dados não inicializado');
        }

        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Obter metadados
    async getMetadata() {
        if (!this.db) {
            throw new Error('Banco de dados não inicializado');
        }

        const transaction = this.db.transaction(['metadata'], 'readonly');
        const store = transaction.objectStore('metadata');
        
        return new Promise((resolve, reject) => {
            const request = store.get('lastUpdate');
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Verificar se existem dados salvos
    async hasData() {
        try {
            const data = await this.loadData();
            return data && data.length > 0;
        } catch (error) {
            return false;
        }
    }

    // Limpar todos os dados
    async clearData() {
        if (!this.db) {
            throw new Error('Banco de dados não inicializado');
        }

        const transaction = this.db.transaction([this.storeName, 'metadata'], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const metaStore = transaction.objectStore('metadata');

        await Promise.all([
            store.clear(),
            metaStore.clear()
        ]);
    }

    // Buscar por estado
    async getByEstado(estado) {
        if (!this.db) {
            throw new Error('Banco de dados não inicializado');
        }

        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('estado');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(estado);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Contar registros por estado
    async countByEstado() {
        const data = await this.loadData();
        const counts = {};
        
        data.forEach(item => {
            counts[item.Estado] = (counts[item.Estado] || 0) + 1;
        });
        
        return counts;
    }

    // Estatísticas gerais
    async getStats() {
        const data = await this.loadData();
        
        const stats = {
            total: data.length,
            aprovados: data.filter(item => item.UltimoResultado === 'Aprovado').length,
            reprovados: data.filter(item => item.UltimoResultado === 'Reprovado').length,
            fixos: data.filter(item => item.TipoMedidor === 'Fixo').length,
            moveis: data.filter(item => item.TipoMedidor === 'Móvel').length,
            estados: [...new Set(data.map(item => item.Estado))].length,
            municipios: [...new Set(data.map(item => item.Municipio))].length
        };
        
        return stats;
    }
}

// Exportar para uso global
window.InmetroDatabase = InmetroDatabase;
