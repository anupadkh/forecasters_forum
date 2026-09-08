data format

```json
{"meta":{"title":"Best Way To work Today","date":"","subtitle":"Looks like the end of Life","name":""},"realized":[],"keyMessages":[],"driversTitle":"Regional Drivers","drivers":[],"sevenDay":[],"extended":[],"oceanWatch":[],"logos":[],"savedAt":1788318695403}
```

design format

```json
{
  "version": "1.0.1",
  "id": "standard",
  "name": "Standard Professional",
  "description": "Clean, balanced 2-column layout with distinct sections.",
  "pageBackground": "#ffffff",
  "pageFontFamily": "Inter, Arial, sans-serif",
  "pageTextColor": "#2d3748",
  "sections": {
    "meta": {
      "layout": { "direction": "column", "columns": 1 },
      "nodes": {
        "title": { "fontSize": "24px", "fontWeight": "600", "color": "#1a202c", "textAlign": "left" },
        "subtitle": { "fontSize": "14px", "color": "#718096", "textAlign": "left" }
      }
    },
    "realized": {
      "layout": { "direction": "column", "columns": 2 },
      "nodes": {
        "root": { "id": "realized-root", "className": "realized-container" },
        "itemTitle": { "fontSize": "16px", "fontWeight": "600", "color": "#2d3748", "backgroundColor": "#f7fafc", "textAlign": "left", "padding": "8px", "borderBottom": "1px solid #e2e8f0", "borderRadius": "4px 4px 0 0" },
        "itemDesc": { "fontSize": "14px", "color": "#4a5568", "textAlign": "left", "padding": "8px", "lineHeight": "1.5" }
      }
    },
    "keyMessages": {
      "layout": { "direction": "row", "columns": 3 },
      "nodes": {
        "itemTitle": { "fontSize": "14px", "fontWeight": "600", "color": "#2d3748", "textAlign": "left", "padding": "6px" },
        "itemDesc": { "fontSize": "14px", "color": "#4a5568", "textAlign": "left", "padding": "6px", "lineHeight": "1.5" }
      }
    },
    "sevenDay": {
      "layout": { "direction": "row", "columns": 2 },
      "nodes": {
        "itemTitle": { "fontSize": "14px", "fontWeight": "600", "color": "#2d3748", "textAlign": "left", "padding": "6px" },
        "itemDesc": { "fontSize": "14px", "color": "#4a5568", "textAlign": "left", "padding": "6px", "lineHeight": "1.5" }
      }
    },
    "oceanWatch": {
      "layout": { "direction": "row", "columns": 2 },
      "nodes": {
        "itemTitle": { "fontSize": "14px", "fontWeight": "600", "color": "#2d3748", "textAlign": "left", "padding": "6px" },
        "itemDesc": { "fontSize": "14px", "color": "#4a5568", "textAlign": "left", "padding": "6px", "lineHeight": "1.5" }
      }
    },
    "extended": {
      "layout": { "direction": "column", "columns": 1 },
      "nodes": {
        "itemTitle": { "fontSize": "16px", "fontWeight": "600", "color": "#2d3748", "backgroundColor": "#f7fafc", "textAlign": "left", "padding": "8px", "borderBottom": "1px solid #e2e8f0", "borderRadius": "4px 4px 0 0" },
        "itemDesc": { "fontSize": "14px", "color": "#4a5568", "textAlign": "left", "padding": "8px", "lineHeight": "1.5" }
      }
    },
    "image": { "id": "section-image", "width": "120px", "height": "120px" }
  },
  "globalCss": ""
}
```