// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  designSidebar: [
    {
      type: 'category',
      label: 'Concepto',
      collapsed: false,
      items: ['gdd/game-concept'],
    },
    {
      type: 'category',
      label: 'Arte',
      collapsed: false,
      items: ['art/art-bible'],
    },
    {
      type: 'category',
      label: 'Game Design (GDDs)',
      collapsed: false,
      items: [
        'gdd/systems-index',
        'gdd/mission-data',
        'gdd/game-configuration',
        'gdd/pilot-entity',
        'gdd/mecha-entity',
        'gdd/risk-calculation',
        'gdd/financial-ledger',
        'gdd/mission-generation',
        'gdd/game-state-manager',
        'gdd/assignment-system',
        'gdd/mission-resolution',
        'gdd/damage-system',
        'gdd/repair-system',
        'gdd/weekly-cycle',
        'gdd/win-lose-detection',
        'gdd/main-hangar-ui',
        'gdd/mission-card-ui',
        'gdd/assignment-ui',
      ],
    },
    // Agregar nuevos GDDs acá a medida que se vayan creando
  ],
};

export default sidebars;
