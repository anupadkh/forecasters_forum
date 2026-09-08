To help you replicate or rebuild this exact layout, here is the design breakdown including the color palette, typography styles, and the proportions for each content block based on your 794 px wide document canvas.
------------------------------
## 🎨 1. Color Palette (Hex Codes)
The infographic uses a clean, professional corporate scheme built around varied shades of blue for structure and warm accent tones for data:

* Primary Dark Blue: #0B3C83 (Used for main section header bars, like "5. Ocean Watch")
* Secondary Medium Blue: #2B6CB0 (Used for sub-headers and map annotations)
* Light Blue Backgrounds: #EBF8FF (Used for background cards and text containers)
* Accent Red/Orange: #DD6B20 to #E53E3E (Used for temperature alerts, heat stress icons, and highlights)
* Accent Green: #38A169 (Used for rainfall outlook panels)
* Neutral Dark Gray: #2D3748 (Used for standard body text to keep it highly readable)

------------------------------
## 🔤 2. Font Typographies
While the final fonts depend on what is installed on your computer, the layout uses standard clean, highly legible Sans-Serif fonts typical of official weather bulletins:

* Main Header Font: A bold, condensed geometric sans-serif similar to Arial Black, Helvetica Neue (Bold), or Trebuchet MS (e.g., "Weekly SAHF Forecasters' Forum").
* Section Titles: A clean, bold sans-serif like Arial Bold or Myriad Pro Bold (e.g., "1. Realized Weather").
* Body Text: A narrow, high-readability sans-serif like Arial Narrow, Calibri, or Open Sans set to regular weight.

------------------------------
## 📐 3. Block Sizes & Proportions (794 px Canvas)
To fit comfortably within your printer's 756 px maximum printable width, the content is divided into five distinct horizontal rows.
Here are the target dimensions for each block section:
## Row 1: The Main Header

* Width: 756 px
* Height: ~80 px
* Details: Dark blue background spanning the full printable width with white text centered.

## Row 2: Map & Key Messages (The Largest Section)

* Total Width: 756 px
* Left Column (Realized Weather): 210 px wide
* Right Column (Map Area): 530 px wide
* Key Messages Box (Bottom of Map): 530 px wide × 80 px high

## Row 3: Outlook Grids (Rows 2, 3, and 4)
This row splits into three equal columns to show regional forecasts:

* Each Column Width: 244 px (with a 12 px gap between columns to total 756 px)
* Height: ~220 px
* Sub-grids inside columns: The internal sub-blocks (e.g., Myanmar, Maldives panels) split evenly into widths of 116 px each.

## Row 4: Ocean Watch Section

* Width: 756 px
* Left Split (Observed): 372 px wide
* Right Split (Forecast): 372 px wide
* Height: ~150 px

## Row 5: Footer Logos

* Width: 756 px
* Height: ~45 px
* Details: A single continuous row holding small, transparent partner brand logos centered.

Would you like the exact CSS flexbox styles to easily code this layout structure, or do you need help calculating font sizes to make sure they remain legible?

## User controls for each section

* Controls where image and text follow left/right or top/down.
* If top/down then how many columns(to display siblings) in each row? e.g. 7 Day Country Outlook : top-down (image-description) ; no. of columns(2); no or rows(2)
* Should Subtitle be shown.
* Should Titles be numbered.
* Ordering of each grid children- drag and drop. Maybe open a new page or modal for changing the order.

## Extra Additions:

* Drag and drop images
* Add new description grid
