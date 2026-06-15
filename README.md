# Galleria Neelambari

An elegant, responsive image gallery website designed to showcase artwork, photography, collections, and visual archives. The gallery automatically scans images from a local `/images` directory, organizes them into categories and folders, and provides a modern viewing experience with search, lightbox previews, and shareable folder links.

---

## Features

### Automatic Image Discovery

* Scans the `/images` directory automatically.
* Detects image files recursively.
* No manual image configuration required.

### Category & Folder Organization

Images are organized using the folder structure:

```text
images/
├── Category1/
│   ├── FolderA/
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │
│   └── FolderB/
│       └── image3.jpg
│
└── Category2/
    └── FolderC/
        └── image4.webp
```

Result:

```text
Category1
 ├─ FolderA
 └─ FolderB

Category2
 └─ FolderC
```

---

### Search Functionality

Search by:

* Folder name
* Image name
* Category content

Results update instantly while typing.

---

### Lightbox Viewer

* Click any image to open fullscreen preview.
* Displays image name/caption.
* Press `ESC` to close.
* Click the close button to exit.

---

### Shareable Folder Links

Each folder contains a **Copy Link** button.

Example:

```text
https://your-site.com/?category=Paintings&folder=Portraits
```

Opening the link:

* Automatically expands the selected category.
* Highlights the target folder.
* Scrolls directly to it.

---

### Responsive Design

Optimized for:

* Desktop
* Laptop
* Tablet
* Mobile phones

Responsive image grid automatically adapts to screen size.

---

### Splash Screen

A premium loading screen featuring:

* Cover image support
* Animated loader
* Elegant Cinzel typography
* Smooth fade-out transition

---

### Dark Luxury Theme

Color palette:

* Deep Burgundy
* Gold accents
* Dark backgrounds
* Animated gradients
* Elegant visual effects

Inspired by luxury gallery and museum aesthetics.

---

## Supported Image Formats

The gallery automatically recognizes:

```text
jpg
jpeg
png
gif
webp
bmp
svg
```

---

## Installation

### 1. Clone or Download

```bash
git clone https://github.com/your-repository/galleria-neelambari.git
```

or download the ZIP.

---

### 2. Add Your Images

Place images inside:

```text
images/
```

Example:

```text
images/
├── Paintings/
│   ├── Traditional/
│   ├── Abstract/
│
├── Photography/
│   ├── Nature/
│   ├── Wildlife/
│
└── Sketches/
    ├── Pencil/
    └── Charcoal/
```

---

### 3. Add Branding Assets

Place your files:

```text
icons/
├── logo.png
└── cover photo.png
```

Optional:
If these files are missing, the site automatically displays a fallback lotus icon.

---

### 4. Run a Local Web Server

The gallery requires a web server because browsers block directory crawling from local files.

Python:

```bash
python -m http.server 8000
```

Node.js:

```bash
npx serve .
```

Then open:

```text
http://localhost:8000
```

---

## Project Structure

```text
project/
│
├── index.html
├── style.css
├── app.js
│
├── icons/
│   ├── logo.png
│   └── cover photo.png
│
└── images/
    ├── Category/
    │   ├── Folder/
    │   │   ├── image1.jpg
    │   │   └── image2.jpg
```

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Styling

* CSS Variables
* Flexbox
* CSS Grid
* Animations
* Responsive Design

### Typography

Google Fonts:

```text
Cinzel
```

Used for premium gallery branding.

---

## Browser Compatibility

Tested with:

* Google Chrome
* Microsoft Edge
* Firefox
* Brave
* Opera

Modern browser support recommended.

---

## Customization

### Change Site Name

In `index.html`:

```html
<h1>Galleria Neelambari</h1>
```

---

### Change Theme Colors

In `style.css`:

```css
:root {
    --primary-color: #8b0000;
    --gold: #d4af37;
    --bg-color: #0a0000;
}
```

---

### Change Splash Screen Duration

In `app.js`:

```javascript
setTimeout(() => splashScreen.classList.add('hide'), 500);
```

Adjust the value (milliseconds) as needed.

---

## Notes

* The gallery depends on web-server directory listing support.
* Apache, Nginx, IIS, Python HTTP Server, and many local servers work correctly.
* Ensure directory browsing is enabled if using a custom server.

---

## Future Enhancements

Potential improvements:

* Image metadata support
* Tag-based filtering
* Download button
* Slideshow mode
* Image zoom
* Favorites collection
* Multi-language support
* Admin upload panel

---

## License

This project is provided for personal and commercial gallery use. Modify and distribute as needed.

---

**Galleria Neelambari** — A luxurious digital gallery experience for organizing and showcasing visual collections.
