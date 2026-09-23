import {
  type SectionKey,
  type NodeStyleConfig,
  type SectionTemplateConfig,
  type TemplateConfig,
  type ReportTemplate,
  ALL_SECTION_KEYS,
} from './types';

export const getDefaultNodeCss = (sectionKey: SectionKey, nodeKey: string): string => {
  if (sectionKey === 'metadata') {
    switch (nodeKey) {
      case 'root':
        return 'background: linear-gradient(135deg, #0b3c83 0%, #1e3a8a 100%);\ncolor: #ffffff;\npadding: 16px 20px;\nborder-radius: 6px;\ntext-align: center;\nmargin-bottom: 16px;';
      case 'title':
        return 'font-size: 22px;\nfont-weight: 800;\ncolor: #ffffff;\nmargin: 0;';
      case 'subtitle':
        return 'font-size: 14px;\ncolor: #bee3f8;\nmargin-top: 6px;\nmargin-bottom: 0;';
      case 'date':
        return 'font-size: 12px;\ncolor: #e2e8f0;\nmargin-top: 4px;\ndisplay: block;';
      default:
        return '';
    }
  }

  if (sectionKey === 'logos') {
    switch (nodeKey) {
      case 'root':
        return 'background-color: #ffffff;\nborder: 1px solid #e2e8f0;\nborder-radius: 6px;\npadding: 12px;\nmargin-bottom: 8px;';
      case 'header':
        return 'border-bottom: 2px solid #cbd5e1;\npadding-bottom: 4px;\nmargin-bottom: 8px;';
      case 'title':
        return 'font-size: 16px;\nfont-weight: 700;\ncolor: #334155;\nmargin: 0;';
      case 'subtitle':
        return 'font-size: 11px;\ncolor: #64748b;\nmargin: 2px 0 0 0;';
      case 'content':
        return 'display: flex;\nflex-wrap: wrap;\nalign-items: center;\njustify-content: center;\ngap: 16px;';
      case 'item':
        return 'background-color: transparent;\nborder: none;\npadding: 4px;\ndisplay: flex;\nflex-direction: column;\nalign-items: center;\ntext-align: center;\nwidth: auto;';
      case 'image':
        return 'max-height: 38px;\nwidth: auto;\nobject-fit: contain;\nmargin-bottom: 4px;';
      case 'itemTitle':
        return 'font-size: 11px;\nfont-weight: 600;\ncolor: #64748b;\nbackground: transparent;\npadding: 0;';
      default:
        return '';
    }
  }

  // Standard content sections
  switch (nodeKey) {
    case 'root':
      return 'background-color: #ebf8ff;\nborder: 1px solid #2b6cb0;\nborder-radius: 6px;\npadding: 12px;\nmargin-bottom: 12px;';
    case 'header':
      return 'border-bottom: 3px solid #0b3c83;\npadding-bottom: 6px;\nmargin-bottom: 10px;';
    case 'title':
      return 'font-size: 18px;\nfont-weight: 700;\ncolor: #0b3c83;\nmargin: 0;';
    case 'subtitle':
      return 'font-size: 12px;\ncolor: #2b6cb0;\nmargin: 4px 0 0 0;';
    case 'content':
      return 'display: grid;\ngrid-template-columns: repeat(2, minmax(0, 1fr));\ngap: 8px;';
    case 'item':
      return 'background-color: #ffffff;\nborder: 1px solid #e2e8f0;\nborder-radius: 4px;\npadding: 8px;\ndisplay: flex;\nflex-direction: column;';
    case 'image':
      return 'width: 100%;\nmax-width: 180px;\nheight: 90px;\nborder-radius: 3px;\nobject-fit: cover;\nmargin-bottom: 6px;\nalign-self: center;';
    case 'itemTitle':
      return 'font-size: 13px;\nfont-weight: 700;\ncolor: #2d3748;\nbackground-color: #f7fafc;\npadding: 4px 6px;\nborder-radius: 3px;\nmargin-bottom: 4px;\ngrid-column: 1 / -1;';
    case 'itemDesc':
      return 'font-size: 12px;\ncolor: #4a5568;\nline-height: 1.4;\nmargin: 0;';
    case 'group':
      return 'background-color: rgba(255, 255, 255, 0.6);\nborder: 1px solid #cbd5e0;\nborder-radius: 4px;\npadding: 8px;\nmargin-bottom: 8px;';
    case 'groupTitle':
      return 'font-size: 13px;\nfont-weight: 700;\ncolor: #0b3c83;\nmargin: 0 0 6px 0;';
    default:
      return '';
  }
};

export const createDefaultNodes = (prefix: string, sectionKey: SectionKey): Record<string, NodeStyleConfig> => {
  const p = `${prefix}-${sectionKey}`;
  const base: Record<string, NodeStyleConfig> = {
    root: {
      id: `${p}-section`,
      className: `${prefix}-section ${p}-root`,
      customCss: getDefaultNodeCss(sectionKey, 'root'),
    },
    header: {
      id: `${p}-header`,
      className: `${p}-header`,
      customCss: getDefaultNodeCss(sectionKey, 'header'),
    },
    title: {
      id: `${p}-title`,
      className: `${p}-title`,
      customCss: getDefaultNodeCss(sectionKey, 'title'),
    },
    subtitle: {
      id: `${p}-subtitle`,
      className: `${p}-subtitle`,
      customCss: getDefaultNodeCss(sectionKey, 'subtitle'),
    },
    content: {
      id: `${p}-content`,
      className: `${p}-content`,
      customCss: getDefaultNodeCss(sectionKey, 'content'),
    },
    item: {
      id: `${p}-item`,
      className: `${p}-item`,
      customCss: getDefaultNodeCss(sectionKey, 'item'),
    },
    image: {
      id: `${p}-img`,
      className: `${p}-img`,
      customCss: getDefaultNodeCss(sectionKey, 'image'),
    },
    itemTitle: {
      id: `${p}-item-title`,
      className: `${p}-item-title`,
      customCss: getDefaultNodeCss(sectionKey, 'itemTitle'),
    },
    itemDesc: {
      id: `${p}-item-desc`,
      className: `${p}-item-desc`,
      customCss: getDefaultNodeCss(sectionKey, 'itemDesc'),
    },
  };

  if (sectionKey === 'metadata') {
    base.root = {
      id: `${p}-banner`,
      className: `${prefix}-main-header ${p}-banner`,
      customCss: getDefaultNodeCss('metadata', 'root'),
    };
    base.title = {
      id: `${p}-main-title`,
      className: `${p}-main-title`,
      customCss: getDefaultNodeCss('metadata', 'title'),
    };
    base.subtitle = {
      id: `${p}-main-subtitle`,
      className: `${p}-main-subtitle`,
      customCss: getDefaultNodeCss('metadata', 'subtitle'),
    };
    base.date = {
      id: `${p}-main-date`,
      className: `${p}-main-date`,
      customCss: getDefaultNodeCss('metadata', 'date'),
    };
  }

  if (sectionKey === 'extended' || sectionKey === 'oceanWatch') {
    base.group = {
      id: `${p}-group`,
      className: `${p}-group`,
      customCss: getDefaultNodeCss(sectionKey, 'group'),
    };
    base.groupTitle = {
      id: `${p}-group-title`,
      className: `${p}-group-title`,
      customCss: getDefaultNodeCss(sectionKey, 'groupTitle'),
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
    if (compact.sections.realized.nodes.content) {
      compact.sections.realized.nodes.content.customCss = 'display: grid;\ngrid-template-columns: 1fr;\ngap: 6px;';
    }
    if (compact.sections.keyMessages.nodes.content) {
      compact.sections.keyMessages.nodes.content.customCss = 'display: grid;\ngrid-template-columns: 1fr;\ngap: 6px;';
    }
    if (compact.sections.drivers.nodes.content) {
      compact.sections.drivers.nodes.content.customCss = 'display: grid;\ngrid-template-columns: 1fr;\ngap: 6px;';
    }
    if (compact.sections.sevenDay.nodes.content) {
      compact.sections.sevenDay.nodes.content.customCss = 'display: grid;\ngrid-template-columns: 1fr;\ngap: 6px;';
    }
    if (compact.sections.realized.nodes.image) {
      compact.sections.realized.nodes.image.customCss = 'width: 120px;\nheight: 70px;\nborder-radius: 3px;\nobject-fit: cover;\nmargin-bottom: 4px;';
    }
    compact.globalCss = '/* Executive Compact Template Styles */\n.report-page {\n  font-size: 13px;\n}\n.report-section {\n  padding: 8px 10px;\n  margin-bottom: 8px;\n}';
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
    if (wide.sections.realized.nodes.content) {
      wide.sections.realized.nodes.content.customCss = 'display: grid;\ngrid-template-columns: repeat(3, minmax(0, 1fr));\ngap: 8px;';
    }
    if (wide.sections.sevenDay.nodes.content) {
      wide.sections.sevenDay.nodes.content.customCss = 'display: grid;\ngrid-template-columns: repeat(3, minmax(0, 1fr));\ngap: 8px;';
    }
    if (wide.sections.realized.nodes.root) {
      wide.sections.realized.nodes.root.customCss = 'background-color: #f7fafc;\nborder: 1px solid #4a5568;\nborder-radius: 6px;\npadding: 12px;\nmargin-bottom: 12px;';
    }
    wide.globalCss = '/* Wide Infographic Grid Global Rules */\n.report-items {\n  gap: 12px;\n}';
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
    if (modern.sections.metadata.nodes.root) {
      modern.sections.metadata.nodes.root.customCss = 'background: #1e1b4b;\ncolor: #ffffff;\npadding: 18px 24px;\nborder-radius: 8px;\ntext-align: center;\nmargin-bottom: 16px;\nbox-shadow: 0 4px 12px rgba(30, 27, 75, 0.25);';
    }
    if (modern.sections.metadata.nodes.title) {
      modern.sections.metadata.nodes.title.customCss = 'font-size: 24px;\nfont-weight: 800;\ncolor: #38bdf8;\nmargin: 0;';
    }
    if (modern.sections.realized.nodes.root) {
      modern.sections.realized.nodes.root.customCss = 'background-color: #ffffff;\nborder: 2px solid #6366f1;\nborder-radius: 8px;\npadding: 14px;\nmargin-bottom: 12px;\nbox-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);';
    }
    if (modern.sections.realized.nodes.title) {
      modern.sections.realized.nodes.title.customCss = 'font-size: 18px;\nfont-weight: 700;\ncolor: #4338ca;\nmargin: 0;';
    }
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
    { title: 'RIMES Secretariat', name: 'RIMES Secretariat', image: 'https://picsum.photos/120/40?random=1', url: 'https://picsum.photos/120/40?random=1' },
    { title: 'SAHF Regional Hub', name: 'SAHF Regional Hub', image: 'https://picsum.photos/120/40?random=2', url: 'https://picsum.photos/120/40?random=2' },
    { title: 'WMO Partner', name: 'WMO Partner', image: 'https://picsum.photos/120/40?random=3', url: 'https://picsum.photos/120/40?random=3' },
  ],
};
