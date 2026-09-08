import {
  type SectionKey,
  type SectionLayoutConfig,
  type NodeStyleConfig,
  type SectionTemplateConfig,
  type TemplateConfig,
  type ReportTemplate,
  ALL_SECTION_KEYS,
} from './types';

export const defaultLayoutConfig = (sectionKey: SectionKey): SectionLayoutConfig => ({
  direction: sectionKey === 'logos' ? 'row' : 'column',
  columns: sectionKey === 'logos' ? 4 : sectionKey === 'sevenDay' ? 2 : 2,
  numbered: sectionKey !== 'metadata' && sectionKey !== 'logos',
});

export const createDefaultNodes = (prefix: string, sectionKey: SectionKey): Record<string, NodeStyleConfig> => {
  const p = `${prefix}-${sectionKey}`;
  const base: Record<string, NodeStyleConfig> = {
    root: {
      id: `${p}-section`,
      className: `${prefix}-section ${prefix}-${sectionKey}-root`,
      backgroundColor: '#ebf8ff',
      borderColor: '#2b6cb0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      padding: '12px',
      margin: '0 0 12px 0',
      customCss: '',
    },
    header: {
      id: `${p}-header`,
      className: `${prefix}-section-header`,
      borderWidth: '0 0 3px 0',
      borderStyle: 'solid',
      borderColor: '#0b3c83',
      padding: '0 0 6px 0',
      margin: '0 0 10px 0',
      customCss: '',
    },
    title: {
      id: `${p}-title`,
      className: `${prefix}-section-title`,
      fontSize: '18px',
      fontWeight: '700',
      color: '#0b3c83',
      margin: '0',
      customCss: '',
    },
    subtitle: {
      id: `${p}-subtitle`,
      className: `${prefix}-section-subtitle`,
      fontSize: '12px',
      color: '#2b6cb0',
      margin: '4px 0 0 0',
      customCss: '',
    },
    content: {
      id: `${p}-content`,
      className: `${prefix}-section-content`,
      padding: '0',
      margin: '0',
      customCss: '',
    },
    item: {
      id: `${p}-item`,
      className: `${prefix}-item ${prefix}-${sectionKey}-item`,
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      padding: '8px',
      margin: '0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e2e8f0',
      customCss: '',
    },
    image: {
      id: `${p}-img`,
      className: `${prefix}-item-image`,
      width: '180px',
      height: '90px',
      borderRadius: '3px',
      customCss: 'object-fit: cover;',
    },
    itemTitle: {
      id: `${p}-item-title`,
      className: `${prefix}-item-title`,
      fontSize: '13px',
      fontWeight: '700',
      color: '#2d3748',
      backgroundColor: '#f7fafc',
      padding: '4px 6px',
      borderRadius: '3px',
      borderWidth: '0',
      borderColor: '#2b6cb0',
      borderStyle: 'none',
      textAlign: 'left',
      customCss: '',
    },
    itemDesc: {
      id: `${p}-item-desc`,
      className: `${prefix}-item-desc`,
      fontSize: '12px',
      color: '#4a5568',
      margin: '4px 0 0 0',
      customCss: 'line-height: 1.4;',
    },
  };

  if (sectionKey === 'metadata') {
    base.root = {
      id: `${p}-banner`,
      className: `${prefix}-main-header`,
      backgroundColor: '#0b3c83',
      color: '#ffffff',
      padding: '16px 20px',
      borderRadius: '6px',
      textAlign: 'center',
      borderWidth: '0',
      borderColor: 'transparent',
      borderStyle: 'none',
      margin: '0 0 16px 0',
      customCss: '',
    };
    base.title = {
      id: `${p}-main-title`,
      className: `${prefix}-main-title`,
      fontSize: '22px',
      fontWeight: '800',
      color: '#ffffff',
      margin: '0',
      customCss: '',
    };
    base.subtitle = {
      id: `${p}-main-subtitle`,
      className: `${prefix}-main-subtitle`,
      fontSize: '14px',
      color: '#bee3f8',
      margin: '6px 0 0 0',
      customCss: '',
    };
    base.date = {
      id: `${p}-main-date`,
      className: `${prefix}-main-date`,
      fontSize: '12px',
      color: '#e2e8f0',
      margin: '4px 0 0 0',
      customCss: '',
    };
  }

  if (sectionKey === 'extended' || sectionKey === 'oceanWatch') {
    base.group = {
      id: `${p}-group`,
      className: `${prefix}-group ${prefix}-${sectionKey}-group`,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#cbd5e0',
      borderRadius: '4px',
      padding: '8px',
      margin: '0 0 8px 0',
      customCss: '',
    };
    base.groupTitle = {
      id: `${p}-group-title`,
      className: `${prefix}-group-title`,
      fontSize: '13px',
      fontWeight: '700',
      color: '#0b3c83',
      margin: '0 0 6px 0',
      customCss: '',
    };
  }

  return base;
};

export const createTemplateConfig = (
  id: string,
  name: string,
  description: string,
  prefix: string,
  isBuiltIn = false
): TemplateConfig => ({
  id,
  name,
  description,
  isBuiltIn,
  pageBackground: '#ffffff',
  pageFontFamily: 'Arial, sans-serif',
  pageTextColor: '#2d3748',
  globalCss: '/* Custom Global Rules for this template */\n.report-page {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n}',
  sections: Object.fromEntries(
    ALL_SECTION_KEYS.map((key) => [
      key,
      {
        layout: defaultLayoutConfig(key),
        nodes: createDefaultNodes(prefix, key),
      },
    ])
  ) as Record<SectionKey, SectionTemplateConfig>,
});

export const BUILTIN_TEMPLATES: TemplateConfig[] = [
  createTemplateConfig(
    'standard',
    'Standard SAHF Bulletin',
    'Balanced two-column report layout with classic navy headers and soft blue cards.',
    'standard',
    true
  ),
  (() => {
    const compact = createTemplateConfig(
      'compact',
      'Executive Compact',
      'Single-column high-density layout with streamlined spacing for rapid reviews.',
      'compact',
      true
    );
    compact.sections.realized.layout.columns = 1;
    compact.sections.keyMessages.layout.columns = 1;
    compact.sections.drivers.layout.columns = 1;
    compact.sections.sevenDay.layout.columns = 1;
    const imgNode = compact.sections.realized.nodes.image;
    if (imgNode) {
      imgNode.height = '70px';
      imgNode.width = '120px';
    }
    return compact;
  })(),
  (() => {
    const wide = createTemplateConfig(
      'wide',
      'Wide Infographic Grid',
      'Three-column panoramic layout optimized for dashboard displays and wide screens.',
      'wide',
      true
    );
    wide.sections.realized.layout.columns = 3;
    wide.sections.sevenDay.layout.columns = 3;
    const rootNode = wide.sections.realized.nodes.root;
    if (rootNode) {
      rootNode.backgroundColor = '#f7fafc';
      rootNode.borderColor = '#4a5568';
    }
    return wide;
  })(),
  (() => {
    const modern = createTemplateConfig(
      'modern-contrast',
      'Modern High-Contrast',
      'Bold indigo and slate aesthetics with rounded badges and elevated cards.',
      'modern',
      true
    );
    modern.pageBackground = '#f8fafc';
    if (modern.sections.metadata.nodes.root) modern.sections.metadata.nodes.root.backgroundColor = '#1e1b4b';
    if (modern.sections.metadata.nodes.title) modern.sections.metadata.nodes.title.color = '#38bdf8';
    if (modern.sections.realized.nodes.root) {
      modern.sections.realized.nodes.root.backgroundColor = '#ffffff';
      modern.sections.realized.nodes.root.borderColor = '#6366f1';
    }
    if (modern.sections.realized.nodes.title) modern.sections.realized.nodes.title.color = '#4338ca';
    return modern;
  })(),
];

export const REPORT_TEMPLATES: ReportTemplate[] = BUILTIN_TEMPLATES.map((t) => ({
  id: t.id,
  label: t.name,
  description: t.description,
  nodes: Object.fromEntries(
    ALL_SECTION_KEYS.map((k) => [
      k,
      {
        sectionId: t.sections[k]?.nodes?.root?.id || `${t.id}-section-${k}`,
        sectionClassName: t.sections[k]?.nodes?.root?.className || `${t.id}-section`,
        headerId: t.sections[k]?.nodes?.header?.id || `${t.id}-header-${k}`,
        headerClassName: t.sections[k]?.nodes?.header?.className || `${t.id}-header`,
        contentId: t.sections[k]?.nodes?.content?.id || `${t.id}-content-${k}`,
        contentClassName: t.sections[k]?.nodes?.content?.className || `${t.id}-content`,
        itemClassName: t.sections[k]?.nodes?.item?.className || `${t.id}-item`,
        groupClassName: t.sections[k]?.nodes?.group?.className || `${t.id}-group`,
      },
    ])
  ) as Record<SectionKey, any>,
}));

export const SAMPLE_BULLETIN_DATA = {
  meta: {
    name: "Weekly SAHF Forecasters' Forum #220",
    title: 'South Asia Weather & Ocean Outlook',
    subtitle: 'Record of Discussion & Actionable Regional Forecasts',
    date: '2026-09-04',
  },
  realized: [
    {
      title: 'Bhutan & Himalayas',
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&auto=format&fit=crop&q=60',
      desc: 'Partly to mostly cloudy with scattered thunderstorm precipitation in lowlands; light snowfall in elevations above 3500m.',
    },
    {
      title: 'Bangladesh & Northeast India',
      image: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=300&auto=format&fit=crop&q=60',
      desc: 'Heavy to very heavy widespread rainfall with lightning strikes; localized heat stress subsided across coastal plains.',
    },
  ],
  keyMessages: [
    {
      message: 'Active moisture convergence across the Bay of Bengal will elevate flash flood risk along coastal river basins.',
      image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=300&auto=format&fit=crop&q=60',
    },
    {
      message: 'Above normal surface temperatures persist in the northwest desert belts with heat advisory warnings in effect.',
      image: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?w=300&auto=format&fit=crop&q=60',
    },
  ],
  drivers: [
    {
      message: 'Cross-equatorial southwesterly surge bringing high precipitable water index across peninsular landmass.',
      image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300&auto=format&fit=crop&q=60',
    },
  ],
  sevenDay: [
    {
      title: 'Sri Lanka & Maldives',
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=300&auto=format&fit=crop&q=60',
      desc: 'Moderate squalls with sea swell height up to 2.8 meters; heavy showers in western slopes.',
    },
    {
      title: 'Nepal & Terai Basin',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=60',
      desc: 'Afternoon convective storm cells developing with hail risk in central river valleys.',
    },
  ],
  extended: [
    {
      title: 'Temperature & Heat Wave Outlook',
      image: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=300&auto=format&fit=crop&q=60',
      points: [
        { text: 'Near normal temperatures across Bangladesh and Eastern coastal plains.' },
        { text: '1.5°C to 2.5°C above normal anomaly over Western Pakistan and Rajasthan.' },
      ],
    },
  ],
  oceanWatch: [
    {
      title: 'Observed & Forecast Sea Surface Temperatures',
      items: [
        {
          desc: 'Equatorial Indian Ocean dipole remains in weak positive state with anomalies near +0.4°C.',
          image: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=300&auto=format&fit=crop&q=60',
        },
      ],
    },
  ],
  logos: [
    { title: 'RIMES Secretariat', image: 'https://picsum.photos/120/40?random=1' },
    { title: 'SAHF Regional Hub', image: 'https://picsum.photos/120/40?random=2' },
    { title: 'WMO Partner', image: 'https://picsum.photos/120/40?random=3' },
  ],
};
