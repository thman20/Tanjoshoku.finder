# 誕生色 | Tanjoshoku - The 366 Birthday Colors

A highly interactive, editorial-style web experience that allows users to discover the traditional Japanese hue associated with their birth date. Tanjoshoku blends the minimalist elegance of wabi-sabi design with dynamic 2D physics interactions.

## ✨ Features

- **Editorial Aesthetic:** A sophisticated, minimal UI utilizing `Noto Serif JP` for Japanese typography and `Newsreader` for English editorial copy, layered over subtle washi paper textures.
- **Physics-Driven Interactions:** Powered by **Matter.js**, the user interface elements physically drop and transition out of the canvas, followed by an "antigravity" reveal of the user's specific birthday color tile.
- **Dynamic Color Contrast:** Includes a built-in luminance calculator (using the YIQ perceived brightness formula) that automatically adjusts typography colors to ensure perfect contrast against any generated background color.
- **No-Build Vanilla Architecture:** Built entirely with pure HTML, Vanilla JavaScript, and Tailwind CSS via CDN—no complex bundlers or frameworks required.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla JavaScript (ES Modules)
- **Styling:** Tailwind CSS (v4 CDN)
- **Physics Engine:** Matter.js
- **Typography:** Google Fonts (Noto Serif JP, Newsreader, Manrope)

## 🚀 Getting Started

Because the project relies on ES Modules and the `fetch()` API to read the `tanjoshoku_colors.json` data, you will need to serve the files locally to avoid CORS issues.

1. Clone the repository:
   ```bash
   git clone https://github.com/thman20/Tanjoshoku.finder.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Tanjoshoku.finder
   ```
3. Start a local server. You can use Python, Node, or an extension like VSCode Live Server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node (npx)
   npx serve .
   ```
4. Open `http://localhost:8000` in your browser.

## 🎨 Data Source

The color data is sourced from `tanjoshoku_colors.json`, containing 366 unique entries. The data was sourced from [Birthday Color](http://birthday-color.cafein.jp/). Each entry provides the traditional Japanese name, English translation, associated season, hex/RGB values, and thematic keywords.
