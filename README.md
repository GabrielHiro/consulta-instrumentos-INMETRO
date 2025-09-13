# Consulta Instrumentos INMETRO - Medidores de Velocidade

![Screenshot do Site](https://img.shields.io/badge/Status-Online-green)
![Tecnologias](https://img.shields.io/badge/HTML-CSS-JavaScript-IndexedDB-blue)

## 📋 Sobre o Projeto

Sistema web para consulta de medidores de velocidade registrados no INMETRO, permitindo pesquisa e filtragem por diversos critérios como estado, cidade, tipo de medidor e status de aprovação.

**🆕 NOVO:** Sistema com banco de dados local (IndexedDB) para você carregar e gerenciar os dados sem necessidade de recarregar a cada acesso.

## 🌐 Demonstração

**🔗 [Acesse o site aqui](https://seu-usuario.github.io/consulta-instrumentos-INMETRO/)**

## ✨ Funcionalidades

### 🏷️ Dashboard Geral
- Estatísticas em tempo real dos medidores
- Gráficos interativos por estado e status
- Contadores de medidores aprovados/reprovados

### 🔍 Sistema de Filtros
- **Estados**: Seleção múltipla de estados brasileiros
- **Cidades**: Filtro dinâmico baseado nos estados selecionados
- **Status**: Aprovado/Reprovado
- **Tipo de Medidor**: Fixo/Móvel
- **Busca Textual**: Por local, proprietário, número, etc.

### 📊 Visualização de Dados
- Tabela responsiva com paginação
- Ordenação por colunas
- Modal com detalhes completos de cada medidor
- Histórico de verificações
- Informações das faixas de medição

### 📤 Exportação
- Exportar resultados filtrados para CSV
- Dados estruturados para análise externa

### �️ **NOVO: Sistema de Banco de Dados Local**
- **IndexedDB**: Armazenamento permanente no navegador
- **Painel Admin**: Interface para carregar e gerenciar dados
- **Importação Múltipla**: API, arquivo JSON ou dados de exemplo
- **Performance**: Carregamento instantâneo após primeira carga

## �🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com variáveis CSS
- **JavaScript Vanilla**: Funcionalidades interativas
- **IndexedDB**: Banco de dados local do navegador
- **Chart.js**: Gráficos e visualizações
- **Font Awesome**: Ícones
- **APIs**: Dados oficiais do RBMLQ-I/INMETRO

## � Como Usar

### **1. Para Administradores (Carregar Dados)**

1. **Acesse o Painel Admin**: `admin.html`
2. **Escolha uma opção de carregamento**:
   - **API do INMETRO**: Carrega dados reais de todos os estados
   - **Dados de Exemplo**: Carrega conjunto de dados para demonstração
   - **Upload JSON**: Importa arquivo JSON personalizado

3. **Aguarde o carregamento** e confirme no log de atividades

### **2. Para Usuários Finais**

1. **Acesse o site principal**: `index.html`
2. **Navegue normalmente** - os dados carregam instantaneamente do banco local
3. **Use filtros e busca** para encontrar medidores específicos

## 📡 Fonte de Dados

### APIs Oficiais
```
https://servicos.rbmlq.gov.br/dados-abertos/{UF}/medidores.json
```

### Banco Local
- **IndexedDB**: Armazenamento persistente no navegador
- **Atualização Manual**: Via painel administrativo
- **Backup/Restore**: Exportação e importação de dados

## 🚀 Como Executar Localmente

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/consulta-instrumentos-INMETRO.git
   cd consulta-instrumentos-INMETRO
   ```

2. **Inicie um servidor local**
   ```bash
   # Usando Python 3
   python -m http.server 8000
   
   # Usando Node.js (npx)
   npx serve .
   
   # Usando PHP
   php -S localhost:8000
   ```

3. **Acesse no navegador**
   ```
   http://localhost:8000
   ```

## 📱 Responsividade

O site é totalmente responsivo e funciona perfeitamente em:
- 🖥️ Desktop (1200px+)
- 💻 Laptop (768px - 1199px)
- 📱 Tablet (480px - 767px)
- 📱 Mobile (< 480px)

## 🔧 Estrutura do Projeto

```
consulta-instrumentos-INMETRO/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos CSS
│   └── js/
│       └── script.js       # JavaScript principal
├── exemplo-AC.json         # Exemplo de dados da API
└── README.md              # Este arquivo
```

## 📈 Performance

- ⚡ Carregamento assíncrono de dados de todos os estados
- 🔄 Debounce na busca para otimizar performance
- 📊 Atualização dinâmica de gráficos
- 💾 Cache de dados para melhor experiência

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

- **Desenvolvedor**: Seu Nome
- **Email**: seu.email@example.com
- **GitHub**: [@seu-usuario](https://github.com/seu-usuario)

## 📊 Status do Projeto

- ✅ Interface do usuário
- ✅ Sistema de filtros
- ✅ Dashboard com gráficos
- ✅ Exportação CSV
- ✅ Design responsivo
- ✅ Integração com API oficial
- 🔄 Melhorias contínuas

---

**⚠️ Importante**: Este é um projeto independente que utiliza dados públicos do INMETRO. Não possui vinculação oficial com o órgão.

**📅 Última atualização**: Setembro 2025
