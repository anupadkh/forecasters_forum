import type { ChangeEvent } from 'react';

type Direction = 'row' | 'column';
type ContentType = 'title-image-description' | 'image-description' | 'title-description';
type TextAlign = 'left' | 'center' | 'right';

export type SectionSettings = {
  contentType: ContentType;
  direction: Direction;
  columns: number;
  showSubtitle: boolean;
  numbered: boolean;
  imageWidth: number;
  imageHeight: number;
  titleSize: number;
  bodySize: number;
  itemTitleAlign: TextAlign;
  itemTitleBackground: string;
  itemTitleColor: string;
  itemTitleBorderColor: string;
  itemTitleBorderWidth: number;
  itemTitleBorderRadius: number;
  customClass: string;
  customCss: string;
};

type ReportSettingsProps = {
  sectionTitle: string;
  settings: SectionSettings;
  onChange: <K extends keyof SectionSettings>(key: K, value: SectionSettings[K]) => void;
  onClose: () => void;
};

const numberChange = <K extends keyof SectionSettings>(
  onChange: ReportSettingsProps['onChange'],
  key: K,
) => (event: ChangeEvent<HTMLInputElement>) => onChange(key, Number(event.target.value) as SectionSettings[K]);

export default function ReportSettings({ sectionTitle, settings, onChange, onClose }: ReportSettingsProps) {
  return (
    <div className="report-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-config-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="report-config-title">Configure {sectionTitle}</h2>
        <label>Content type
          <select value={settings.contentType} onChange={(event) => onChange('contentType', event.target.value as ContentType)}>
            <option value="title-image-description">Title + image + description</option>
            <option value="image-description">Image + description</option>
            <option value="title-description">Title + description</option>
          </select>
        </label>
        <label>Flow
          <select value={settings.direction} onChange={(event) => onChange('direction', event.target.value as Direction)}>
            <option value="column">Top / down</option>
            <option value="row">Left / right</option>
          </select>
        </label>
        <label>Columns
          <select value={settings.columns} onChange={(event) => onChange('columns', Number(event.target.value))}>
            {[1, 2, 3, 4].map((columns) => <option key={columns} value={columns}>{columns}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={settings.showSubtitle} onChange={(event) => onChange('showSubtitle', event.target.checked)} /> Show subtitle</label>
        <label><input type="checkbox" checked={settings.numbered} onChange={(event) => onChange('numbered', event.target.checked)} /> Number title</label>
        <label>Image width (px)<input type="number" min="40" max="400" value={settings.imageWidth} onChange={numberChange(onChange, 'imageWidth')} /></label>
        <label>Image height (px)<input type="number" min="40" max="300" value={settings.imageHeight} onChange={numberChange(onChange, 'imageHeight')} /></label>
        <label>Section title size (px)<input type="number" min="10" max="36" value={settings.titleSize} onChange={numberChange(onChange, 'titleSize')} /></label>
        <label>Description size (px)<input type="number" min="8" max="24" value={settings.bodySize} onChange={numberChange(onChange, 'bodySize')} /></label>
        <label>Child title alignment
          <select value={settings.itemTitleAlign} onChange={(event) => onChange('itemTitleAlign', event.target.value as TextAlign)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label>Child title background<input type="color" value={settings.itemTitleBackground} onChange={(event) => onChange('itemTitleBackground', event.target.value)} /></label>
        <label>Child title color<input type="color" value={settings.itemTitleColor} onChange={(event) => onChange('itemTitleColor', event.target.value)} /></label>
        <label>Title border color<input type="color" value={settings.itemTitleBorderColor} onChange={(event) => onChange('itemTitleBorderColor', event.target.value)} /></label>
        <label>Title border width (px)<input type="number" min="0" max="10" value={settings.itemTitleBorderWidth} onChange={numberChange(onChange, 'itemTitleBorderWidth')} /></label>
        <label>Title border radius (px)<input type="number" min="0" max="30" value={settings.itemTitleBorderRadius} onChange={numberChange(onChange, 'itemTitleBorderRadius')} /></label>
        <label>Additional class
          <input type="text" value={settings.customClass} onChange={(event) => onChange('customClass', event.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'))} placeholder="my-section-style" />
        </label>
        <label>Custom CSS for this section
          <textarea value={settings.customCss} onChange={(event) => onChange('customCss', event.target.value)} placeholder="background: #ebf8ff;" rows={5} />
        </label>
        <button type="button" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}
