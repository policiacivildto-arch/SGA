// src/components/Sidebar.jsx
import React from 'react';

/* eslint-disable react/prop-types */

function Sidebar({ onNavigate, activePage }) {
  const sidebarItems = [
    { id: 'pg-dash-servicos', icon: '📊', label: 'Dashboard Serviços', section: 'Serviços de Armas' },
    { id: 'pg-registros', icon: '📋', label: 'Registros de Serviço' },
    { id: 'pg-novo-servico', icon: '➕', label: 'Novo Serviço' },
    { id: 'divider1', type: 'divider' },
    { id: 'pg-dash-estoque', icon: '📈', label: 'Dashboard Estoque', section: 'Estoque & Distribuição' },
    { id: 'pg-cautelas', icon: '📜', label: 'Cautelas' },
    { id: 'pg-relatorios', icon: '📑', label: 'Relatórios' },
    { id: 'divider2', type: 'divider' },
    { id: 'pg-cad-policiais', icon: '👮', label: 'Policiais', section: 'Cadastros' },
    { id: 'pg-cad-lotacao', icon: '🏢', label: 'Lotações' },
    { id: 'pg-cad-itens', icon: '📦', label: 'Inventário' },
    { id: 'pg-cad-fornecedor', icon: '🏭', label: 'Item' },
    { id: 'pg-cad-menus', icon: '🧩', label: 'Menus Suspensos' },
  ];

  let lastSection = null;

  return (
    <nav className="sidebar">
      {sidebarItems.map(item => {
        if (item.type === 'divider') {
          lastSection = null; // Reset section after a divider
          return <hr key={item.id} className="sidebar-divider" />;
        }

        const sectionHeader = item.section && item.section !== lastSection;
        if (sectionHeader) {
          lastSection = item.section;
        }

        return (
          <React.Fragment key={item.id}>
            {sectionHeader && <div className="sidebar-section">{item.section}</div>}
            <button
              type="button"
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="icon">{item.icon}</span> {item.label}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Sidebar;
