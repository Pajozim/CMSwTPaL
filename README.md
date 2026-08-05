# 🚀 CMS with text, pictures and lines

> A headless, browser-based Content Management System that lets you visually and precisely construct a static instruction HTML page with ease.

**🔗 Try the live demo:** [https://pajozim.github.io/CMSwTPaL/](https://pajozim.github.io/CMSwTPaL/)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com/)

---

## ✨ Key Features

*   **Visual Drag-and-Drop Builder:** Create and organize content using a simple interface.
*   **Rich Text Editing:** Integrated with Quill.js for powerful, WYSIWYG text editing.
*   **Interactive Annotations:** Draw and manage interactive lines and hotspots on images using LeaderLine and InteractJS.
*   **Dynamic Media Management:** Upload, organize and embed images directly into your content.
*   **Static Export:** Generate an `index.html` inside the `ready-for-upload/` folder, bundled with all assets for instant deployment.
*   **Zero Server Setup:** Everything runs in your browser, making it perfect for local, offline-first authoring.
*   **Theme Switcher:** Choose between four color themes to match your style.

---

## 🛠️ Built With

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3
*   **Libraries:**
    *   [Quill.js](https://quilljs.com/) - For rich text editing .
    *   [SortableJS](https://sortablejs.github.io/Sortable/) - For drag-and-drop functionality.
    *   [InteractJS](https://interactjs.io/) - For advanced interactions like resizing and dragging.
    *   [LeaderLine](https://anseki.github.io/leader-line/) - For creating dynamic lines and connections.
    *   [JSZip](https://stuk.github.io/jszip/) - For creating downloadable project archives.

---

## 🚀 Getting Started

### Prerequisites
*   A modern web browser (e.g., Chrome, Firefox, Opera, Edge).

### Installation & Usage
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Pajozim/CMSwTPaL
    ```

    Or download the ZIP via the "<> Code" button on GitHub.

2.  **Navigate to the project folder:**
    ```bash
    cd CMSwTPaL
    ```

    Or double-click the CMSwTPaL/ folder in your file explorer.

3. Open `admin.html` in your browser — no server required. (Ignore `index.html` — it's only for the GitHub Pages demo.)
4. Build your content visually: edit text, upload images, arrange elements, and draw connections by clicking on the green stripes inside textbubbles.
   > ⚠️ **Image path requirement:** Place your images to `ready-for-upload/assets/images/` — the CMS references this folder for all image paths to keep exports clean and CORS-free.
5. **Auto-save:** Your progress is automatically saved to `localStorage` — close the tab anytime, and pick up where you left off. You can also manually save and load your progress.
6. Click **Export** — this downloads an `index.html` file for public use.
   > ⚠️ **Important:** Save this file **inside your `ready-for-upload/` folder**, replacing the existing one. The folder already contains the required structure — keeping `index.html` there ensures all paths work correctly.
7. Preview `index.html` from the `ready-for-upload/` folder in your browser to verify everything looks correct.
8. Upload the entire `ready-for-upload/` folder to your web server.

---
<!--
## 📸 Screenshots & Demos

*Visuals are crucial for making your project stand out .*
> **Tip:** Replace the placeholder links with actual screenshots or a GIF of your CMS in action.

| CMS Editor View | Exported Static Page |
| :---: | :---: |
| ![CMS Editor](path/to/your/editor-screenshot.png) | ![Static Output](path/to/your/output-screenshot.png) |
| *Build your content with drag-and-drop.* | *The clean, final output ready for any server.* |

---


## 💡 What I Learned & Challenges Solved

*   **Managed complex DOM state:** Built a robust system for synchronizing a JavaScript data model with a dynamic user interface.
*   **Browser-based file handling:** Used the `FileReader` API to upload images and storing them as object URLs for instant display.
*   **Static export:** Used `document.cloneNode()` to generate a clean, standalone `index.html` from the live DOM — no server required.
*   **Complex UI interactions:** Successfully integrated multiple libraries (Quill, Sortable, InteractJS, LeaderLine) to work together seamlessly.

---
-->

## 🤝 Contributing

This project is a work in progress, and contributions are welcome!
Please feel free to submit a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<!--
---

### 🌐 How to Make Your Project More Known

Based on the search results, here are concrete steps to increase visibility and make a strong impression on recruiters :

1.  **Polish Your Repository**
    *   **Complete the README:** Use a template like the one above. A detailed, well-written README is often the first thing visitors and recruiters see. It demonstrates your professionalism and communication skills .
    *   **Add Visuals:** Include screenshots, GIFs, or a link to a live demo. Visuals stop people from scrolling and are shared more often .
    *   **Clean Code:** Ensure your code is well-organized, commented, and free of clutter. Only keep projects you are proud of public .

2.  **Pin Your Best Work**
    *   On your GitHub profile, pin this CMS project along with your other strongest repositories. This ensures they are the first thing a recruiter sees .

3.  **Promote Your Project**
    *   **Share on Social Media:** Write a short post on LinkedIn, Dev.to, or Twitter/X explaining what you built and what you learned. Use hashtags like `#javascript`, `#webdev`, or `#buildinpublic` .
    *   **Write a Blog Post:** Create a tutorial or case study about building this CMS. This establishes you as a knowledgeable developer and drives traffic to your repository .
    *   **Create a Live Demo:** Host the CMS itself or a demo page on a free service like GitHub Pages, Vercel, or Netlify. An interactive demo makes your project tangible .

4.  **Engage with the Community**
    *   Star and follow projects that inspire you. Leave comments and contribute small fixes or improvements to other open-source projects. This builds genuine connections and often leads to others checking out your work .
    *   Be patient and consistent. Growing a strong GitHub profile takes time, but it can be a powerful asset in your job search .
-->