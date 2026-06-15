// DOM ELEMENTS
const container = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.querySelector('.close-lightbox');
const splashScreen = document.getElementById('splashScreen');

let galleryDataCache = [];
let objectUrls = [];
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);
const IMAGES_ROOT = 'images';

function isImageFile(filename) {
    const ext = String(filename).split('.').pop().toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

function cleanupObjectUrls() {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
}

function parseDirectoryListing(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a[href]'));
    return links
        .map(link => ({ href: link.getAttribute('href'), text: link.textContent }))
        .filter(item => item.href && item.href !== '../' && !item.href.startsWith('?'))
        .map(item => ({
            href: new URL(item.href, baseUrl).href,
            raw: item.href
        }));
}

async function fetchDirectory(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`Failed to fetch directory ${url}: ${response.status}`);
    }
    return response.text();
}

async function crawlDirectory(url, relativePath = '') {
    const html = await fetchDirectory(url);
    const entries = parseDirectoryListing(html, url);
    const images = [];

    for (const entry of entries) {
        const isDirectory = entry.href.endsWith('/');
        if (isDirectory) {
            const nextRelativePath = relativePath + entry.raw;
            images.push(...await crawlDirectory(entry.href, nextRelativePath));
            continue;
        }

        const fileName = entry.href.split('/').pop();
        if (!isImageFile(fileName)) continue;

        const imageRelativePath = (relativePath + fileName).replace(/\\/g, '/');
        images.push({
            url: entry.href,
            relativePath: imageRelativePath
        });
    }

    return images;
}

function buildGalleryFromImages(images) {
    const categoriesMap = new Map();

    images.forEach(image => {
        const parts = image.relativePath.split('/').filter(Boolean);
        if (parts.length < 3) return;

        const [category, folderName, ...rest] = parts;
        const imageName = rest.join('/');
        if (!imageName) return;

        if (!categoriesMap.has(category)) {
            categoriesMap.set(category, new Map());
        }

        const folderMap = categoriesMap.get(category);
        if (!folderMap.has(folderName)) {
            folderMap.set(folderName, []);
        }

        folderMap.get(folderName).push({
            name: imageName,
            path: image.url
        });
    });

    const galleryData = [];
    categoriesMap.forEach((foldersMap, category) => {
        const folders = [];
        foldersMap.forEach((images, folderName) => {
            folders.push({ folderName, images });
        });
        galleryData.push({ category, folders });
    });

    return galleryData;
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category'),
        folder: params.get('folder')
    };
}

function highlightFolderFromUrl() {
    const { category, folder } = getQueryParams();
    if (!category || !folder) return;

    const normalizedId = `folder-${category.toLowerCase()}-${folder.toLowerCase()}`;
    const target = Array.from(document.querySelectorAll('.folder-group')).find(el => el.id.toLowerCase() === normalizedId);
    if (!target) return;

    target.classList.add('highlight-folder');
    const categorySection = target.closest('.category-section');
    if (categorySection) {
        categorySection.classList.remove('collapsed');
    }
    target.classList.remove('collapsed');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGallery(data) {
    container.innerHTML = '';

    if (!data.length) {
        container.innerHTML = '<p class="no-results">No images found in /images/. Add category/item folders there and refresh.</p>';
        return;
    }

    data.forEach(categoryData => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';

        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        const totalImages = categoryData.folders.reduce((sum, folder) => sum + folder.images.length, 0);
        categoryHeader.innerHTML = `
            <span>📁 ${categoryData.category}</span>
            <span class="image-count">${totalImages} images</span>
        `;
        categoryHeader.addEventListener('click', () => categorySection.classList.toggle('collapsed'));

        const foldersContainer = document.createElement('div');
        foldersContainer.className = 'folders-container';

        categoryData.folders.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder-group';
            folderDiv.id = `folder-${categoryData.category}-${folder.folderName}`;

            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            const folderInfo = document.createElement('div');
            folderInfo.className = 'folder-info';
            const folderNameSpan = document.createElement('span');
            folderNameSpan.className = 'folder-name';
            folderNameSpan.textContent = `📂 ${folder.folderName}`;
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-link-btn';
            copyBtn.textContent = 'Copy Link';
            copyBtn.title = `Copy link for ${folder.folderName}`;
            copyBtn.addEventListener('click', event => {
                event.stopPropagation();
                copyFolderLink(categoryData.category, folder.folderName);
            });
            const imageCount = document.createElement('span');
            imageCount.className = 'image-count';
            imageCount.textContent = `${folder.images.length} images`;
            folderInfo.appendChild(folderNameSpan);
            folderInfo.appendChild(copyBtn);
            folderHeader.appendChild(folderInfo);
            folderHeader.appendChild(imageCount);
            folderHeader.addEventListener('click', event => {
                if (!event.target.closest('.copy-link-btn')) {
                    folderDiv.classList.toggle('collapsed');
                }
            });

            const imagesGrid = document.createElement('div');
            imagesGrid.className = 'images-grid';

            folder.images.forEach(image => {
                const card = document.createElement('div');
                card.className = 'image-card';
                const img = document.createElement('img');
                img.src = image.path;
                img.alt = image.name;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="250"%3E%3Crect fill="%23ddd" width="250" height="250"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                };
                const overlay = document.createElement('div');
                overlay.className = 'image-overlay';
                const nameElem = document.createElement('div');
                nameElem.className = 'image-name';
                nameElem.textContent = image.name;
                overlay.appendChild(nameElem);
                card.appendChild(img);
                card.appendChild(overlay);
                card.addEventListener('click', () => openLightbox(image.path, image.name));
                imagesGrid.appendChild(card);
            });

            folderDiv.appendChild(folderHeader);
            folderDiv.appendChild(imagesGrid);
            foldersContainer.appendChild(folderDiv);
        });

        categorySection.appendChild(categoryHeader);
        categorySection.appendChild(foldersContainer);
        container.appendChild(categorySection);
    });
}

function copyFolderLink(category, folderName) {
    const baseUrl = window.location.origin + window.location.pathname;
    const folderUrl = `${baseUrl}?category=${encodeURIComponent(category)}&folder=${encodeURIComponent(folderName)}`;
    navigator.clipboard.writeText(folderUrl).then(() => {
        showCopyNotification(folderUrl);
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = folderUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopyNotification(folderUrl);
    });
}

function showCopyNotification(url) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `<span>Link copied!</span><span class="copy-url-preview">${url}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightboxFn() {
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightboxImg.src = '';
    }, 300);
    document.body.style.overflow = 'auto';
}

closeLightbox.addEventListener('click', closeLightboxFn);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightboxFn(); });

async function loadGallery() {
    try {
        const imagesUrl = `${window.location.origin}/${IMAGES_ROOT}/`;
        const images = await crawlDirectory(imagesUrl);
        cleanupObjectUrls();
        galleryDataCache = buildGalleryFromImages(images);
        renderGallery(galleryDataCache);
        highlightFolderFromUrl();
    } catch (err) {
        container.innerHTML = '<p class="error">Unable to auto-load the /images/ folder. Run the site through a local server and ensure /images/ is accessible.</p>';
        console.error(err);
    } finally {
        if (splashScreen) {
            setTimeout(() => splashScreen.classList.add('hide'), 500);
        }
    }
}

window.addEventListener('load', () => {
    container.innerHTML = '<p class="loading">Loading gallery from local images folder...</p>';
    searchInput.addEventListener('input', event => {
        const value = event.target.value;
        if (value.trim().length === 0) {
            renderGallery(galleryDataCache);
        } else {
            filterGallery(value);
        }
    });
    loadGallery();
});

function filterGallery(query) {
    const value = query.trim().toLowerCase();
    if (!value) {
        renderGallery(galleryDataCache);
        return;
    }

    const filteredData = galleryDataCache.map(category => {
        const matchingFolders = category.folders.map(folder => {
            const folderMatch = folder.folderName.toLowerCase().includes(value);
            const matchingImages = folder.images.filter(image => image.name.toLowerCase().includes(value));
            if (folderMatch || matchingImages.length > 0) {
                return {
                    ...folder,
                    images: folderMatch ? folder.images : matchingImages
                };
            }
            return null;
        }).filter(Boolean);

        return matchingFolders.length > 0 ? { category: category.category, folders: matchingFolders } : null;
    }).filter(Boolean);

    renderGallery(filteredData);
}
