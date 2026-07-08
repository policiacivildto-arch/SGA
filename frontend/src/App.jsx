import React, { useState } from 'react';
import './App.css'

/* eslint-disable react/prop-types */
 
// Importe os componentes de layout e páginas
import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardServicos from './pages/DashboardServicos.jsx';
import RegistrosServico from './pages/RegistrosServico.jsx';
import NovoServico from './pages/NovoServico.jsx';
import DashboardEstoque from './pages/DashboardEstoque.jsx';
import Cautelas from './pages/Cautelas.jsx';
import Relatorios from './pages/Relatorios.jsx';
import CadPoliciais from './pages/CadPoliciais.jsx';
import CadLotacoes from './pages/CadLotacoes.jsx';
import CadItens from './pages/CadItens.jsx';
import CadFornecedores from './pages/CadFornecedores.jsx';
import CadMenus from './pages/CadMenus.jsx';

function PlaceholderPage({ title, description }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

// Mapeia o ID da página para o componente React correspondente
const pageComponents = {
  'pg-dash-servicos': DashboardServicos,
  'pg-registros': RegistrosServico,
  'pg-novo-servico': NovoServico,
  'pg-dash-estoque': DashboardEstoque,
  'pg-cautelas': Cautelas,
  'pg-relatorios': Relatorios,
  'pg-cad-policiais': CadPoliciais,
  'pg-cad-lotacao': CadLotacoes,
  'pg-cad-itens': CadItens,
  'pg-cad-fornecedor': CadFornecedores,
  'pg-cad-menus': CadMenus,
};

function App() {
  // Estado para controlar a página ativa, começando com o dashboard
  const [activePage, setActivePage] = useState('pg-dash-servicos');

  const handleNavigate = (pageId) => {
    if (pageComponents[pageId]) {
      setActivePage(pageId);
    } else {
      console.warn(`Tentativa de navegar para página não registrada: ${pageId}`);
    }
  };

  return (
    <>
      <Topbar />
      <div className="app-body">
        <Sidebar onNavigate={handleNavigate} activePage={activePage} />
        <main className="main">
          {/* Oculta/mostra páginas baseado no estado */}
          {Object.keys(pageComponents).map((pageId) => {
            const PageComponent = pageComponents[pageId];
            return (
              <div key={pageId} className={`page ${activePage === pageId ? 'active' : ''}`}>
                <PageComponent onNavigate={handleNavigate} />
              </div>
            );
          })}
        </main>
      </div>
    </>
  );
}

export default App;
