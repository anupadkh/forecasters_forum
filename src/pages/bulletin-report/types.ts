export const TEMPLATES_STORAGE_KEY = 'bulletin:saved-templates';
export const ACTIVE_TEMPLATE_KEY = 'bulletin:active-template-id';
export const REPORT_SOURCE_KEY = 'bulletin:report-source';
export const DRAFT_KEY = 'unSavedDraft';

export type SectionKey =
  | 'metadata'
  | 'realized'
  | 'keyMessages'
  | 'drivers'
  | 'sevenDay'
  | 'extended'
  | 'oceanWatch'
  | 'logos';

export const ALL_SECTION_KEYS: SectionKey[] = [
  'metadata',
  'realized',
  'keyMessages',
  'drivers',
  'sevenDay',
  'extended',
  'oceanWatch',
  'logos',
];

export const SECTION_NAMES: Record<SectionKey, string> = {
  metadata: 'Bulletin Header / Metadata',
  realized: 'Realized Weather',
  keyMessages: 'Key Messages',
  drivers: 'Regional Drivers',
  sevenDay: '7-day Outlook',
  extended: 'Extended Range Outlook',
  oceanWatch: 'Ocean Watch',
  logos: 'Logos & Footer',
};

export type NodeKey =
  | 'root'
  | 'header'
  | 'title'
  | 'subtitle'
  | 'content'
  | 'group'
  | 'groupTitle'
  | 'item'
  | 'image'
  | 'itemTitle'
  | 'itemDesc'
  | 'date';

export type NodeStyleConfig = {
  id: string;
  className: string;
  hidden?: boolean;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  margin?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  customCss?: string;
};

export type SectionLayoutConfig = {
  direction: 'row' | 'column';
  columns: number;
  columnWidths?: string;
  numbered: boolean;
};

export type SectionTemplateConfig = {
  layout: SectionLayoutConfig;
  nodes: Record<string, NodeStyleConfig>;
};

export type TemplateConfig = {
  id: string;
  name: string;
  description: string;
  isBuiltIn?: boolean;
  pageBackground: string;
  pageFontFamily: string;
  pageTextColor: string;
  globalCss: string;
  sections: Record<SectionKey, SectionTemplateConfig>;
};

export type TreeNodeDef = {
  key: string;
  label: string;
  role: string;
  tag?: string;
  children?: TreeNodeDef[];
};

export const SECTION_TREE_HIERARCHIES: Record<SectionKey, TreeNodeDef> = {
  metadata: {
    key: 'root',
    label: 'Main Header Banner',
    role: 'Root Parent',
    tag: '<header>',
    children: [
      { key: 'title', label: 'Main Bulletin Title', role: 'Sibling 1', tag: '<h1>' },
      { key: 'subtitle', label: 'Bulletin Subtitle', role: 'Sibling 2', tag: '<p>' },
      { key: 'date', label: 'Date / Edition', role: 'Sibling 3', tag: '<time>' },
    ],
  },
  realized: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Grid Flow',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'item',
            label: 'Weather Item Card',
            role: 'Child Card',
            tag: '<div>',
            children: [
              { key: 'image', label: 'Weather Image', role: 'Sibling 1', tag: '<img>' },
              { key: 'itemTitle', label: 'Item Title', role: 'Sibling 2', tag: '<h3>' },
              { key: 'itemDesc', label: 'Item Description', role: 'Sibling 3', tag: '<p>' },
            ],
          },
        ],
      },
    ],
  },
  keyMessages: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Grid Flow',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'item',
            label: 'Message Item Card',
            role: 'Child Card',
            tag: '<div>',
            children: [
              { key: 'image', label: 'Message Image', role: 'Sibling 1', tag: '<img>' },
              { key: 'itemDesc', label: 'Message Text', role: 'Sibling 2', tag: '<p>' },
            ],
          },
        ],
      },
    ],
  },
  drivers: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Grid Flow',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'item',
            label: 'Driver Item Card',
            role: 'Child Card',
            tag: '<div>',
            children: [
              { key: 'image', label: 'Driver Image', role: 'Sibling 1', tag: '<img>' },
              { key: 'itemDesc', label: 'Driver Text', role: 'Sibling 2', tag: '<p>' },
            ],
          },
        ],
      },
    ],
  },
  sevenDay: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Grid Flow',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'item',
            label: 'Country Outlook Card',
            role: 'Child Card',
            tag: '<div>',
            children: [
              { key: 'image', label: 'Card Image', role: 'Sibling 1', tag: '<img>' },
              { key: 'itemTitle', label: 'Country Title', role: 'Sibling 2', tag: '<h3>' },
              { key: 'itemDesc', label: 'Forecast Desc', role: 'Sibling 3', tag: '<p>' },
            ],
          },
        ],
      },
    ],
  },
  extended: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Flow Container',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'group',
            label: 'Outlook Group Box',
            role: 'Child Group',
            tag: '<div>',
            children: [
              { key: 'groupTitle', label: 'Group Title', role: 'Sibling 1', tag: '<h3>' },
              { key: 'image', label: 'Group Chart / Map', role: 'Sibling 2', tag: '<img>' },
              { key: 'item', label: 'Outlook Point Item', role: 'Sibling 3', tag: '<li>' },
              { key: 'itemDesc', label: 'Point Text', role: 'Sibling 4', tag: '<span>' },
            ],
          },
        ],
      },
    ],
  },
  oceanWatch: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Content Flow Container',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'group',
            label: 'Ocean Condition Group',
            role: 'Child Group',
            tag: '<div>',
            children: [
              { key: 'groupTitle', label: 'Group Title', role: 'Sibling 1', tag: '<h3>' },
              {
                key: 'item',
                label: 'Ocean Condition Card',
                role: 'Sibling 2',
                tag: '<div>',
                children: [
                  { key: 'image', label: 'Ocean Map / Image', role: 'Sibling 1', tag: '<img>' },
                  { key: 'itemDesc', label: 'Condition Desc', role: 'Sibling 2', tag: '<p>' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  logos: {
    key: 'root',
    label: 'Section Container',
    role: 'Root Parent',
    tag: '<article>',
    children: [
      {
        key: 'header',
        label: 'Section Header',
        role: 'Child Branch',
        tag: '<header>',
        children: [
          { key: 'title', label: 'Section Title', role: 'Sibling 1', tag: '<h2>' },
          { key: 'subtitle', label: 'Section Subtitle', role: 'Sibling 2', tag: '<p>' },
        ],
      },
      {
        key: 'content',
        label: 'Logos Grid Flow',
        role: 'Child Branch',
        tag: '<div>',
        children: [
          {
            key: 'item',
            label: 'Partner Logo Item',
            role: 'Child Card',
            tag: '<div>',
            children: [
              { key: 'image', label: 'Logo Image', role: 'Sibling 1', tag: '<img>' },
              { key: 'itemTitle', label: 'Partner Label', role: 'Sibling 2', tag: '<span>' },
            ],
          },
        ],
      },
    ],
  },
};

export type ReportTemplateId = string;

export type ReportTemplateNode = {
  sectionId: string;
  sectionClassName: string;
  headerId: string;
  headerClassName: string;
  contentId: string;
  contentClassName: string;
  itemClassName: string;
  groupClassName: string;
};

export type ReportTemplate = {
  id: string;
  label: string;
  description: string;
  nodes: Record<SectionKey, ReportTemplateNode>;
};
