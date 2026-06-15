const container = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.querySelector('.close-lightbox');
const splashScreen = document.getElementById('splashScreen');

let galleryDataCache = [];

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

	 const target = Array.from(
		  document.querySelectorAll('.folder-group')
		  ).find(el => el.id.toLowerCase() === normalizedId);

	 if (!target) return;

	 target.classList.add('highlight-folder');

	 const categorySection = target.closest('.category-section');

	 if (categorySection) {
		  categorySection.classList.remove('collapsed');
		  }

	 target.classList.remove('collapsed');

	 target.scrollIntoView({
		  behavior: 'smooth',
		  block: 'start'
		  });
}

function renderGallery(data) {
	 container.innerHTML = '';

	 if (!data.length) {
		  container.innerHTML =
			  '<p class="no-results">No images found.</p>';
		  return;
		  }

	 data.forEach(categoryData => {
		  const categorySection = document.createElement('div');
		  categorySection.className = 'category-section';

		  const categoryHeader = document.createElement('div');
		  categoryHeader.className = 'category-header';

		  const totalImages = categoryData.folders.reduce(
			   (sum, folder) => sum + folder.images.length,
			   0
			   );

		  categoryHeader.innerHTML = `
		   <span>📁 ${categoryData.category}</span>
		    <span class="image-count">${totalImages} images</span>
		     `;

		  categoryHeader.addEventListener('click', () =>
			   categorySection.classList.toggle('collapsed')
			   );

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

			   copyBtn.addEventListener('click', e => {
				    e.stopPropagation();
				    copyFolderLink(
					     categoryData.category,
					     folder.folderName
					     );
				    });

			   const imageCount = document.createElement('span');
			   imageCount.className = 'image-count';
			   imageCount.textContent =
				   `${folder.images.length} images`;

			   folderInfo.appendChild(folderNameSpan);
			   folderInfo.appendChild(copyBtn);

			   folderHeader.appendChild(folderInfo);
			   folderHeader.appendChild(imageCount);

			   folderHeader.addEventListener('click', e => {
				    if (!e.target.closest('.copy-link-btn')) {
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

				    const overlay = document.createElement('div');
				    overlay.className = 'image-overlay';

				    const nameElem = document.createElement('div');
				    nameElem.className = 'image-name';
				    nameElem.textContent = image.name;

				    overlay.appendChild(nameElem);

				    card.appendChild(img);
				    card.appendChild(overlay);

				    card.addEventListener('click', () =>
					     openLightbox(image.path, image.name)
					     );

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
	 const baseUrl =
		 window.location.origin +
		 window.location.pathname;

	 const folderUrl =
		 `${baseUrl}?category=${encodeURIComponent(category)}` +
		 `&folder=${encodeURIComponent(folderName)}`;

	 navigator.clipboard.writeText(folderUrl);

	 showCopyNotification(folderUrl);
}

function showCopyNotification(url) {
	 const notification = document.createElement('div');

	 notification.className = 'copy-notification';

	 notification.innerHTML = `
	  <span>Link copied!</span>
	   <span class="copy-url-preview">${url}</span>
	    `;

	 document.body.appendChild(notification);

	 setTimeout(
		  () => notification.classList.add('show'),
		  10
		  );

	 setTimeout(() => {
		  notification.classList.remove('show');

		  setTimeout(
			   () => notification.remove(),
			   300
			   );
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

closeLightbox.addEventListener(
	 'click',
	 closeLightboxFn
);

document.addEventListener('keydown', e => {
	 if (
		  e.key === 'Escape' &&
		  lightbox.classList.contains('active')
		  ) {
		  closeLightboxFn();
		  }
});

async function loadGallery() {
	 try {
		  const response = await fetch(
			   './gallery.json?v=' + Date.now()
			   );

		  if (!response.ok) {
			   throw new Error(
				    `Failed to load gallery.json`
				    );
			   }

		  galleryDataCache =
			  await response.json();

		  renderGallery(galleryDataCache);

		  highlightFolderFromUrl();
		  } catch (err) {
			   console.error(err);

			   container.innerHTML = `
			    <p class="error">
			     Unable to load gallery.json
			      </p>
			       `;
			   } finally {
				    if (splashScreen) {
					     setTimeout(
						      () => splashScreen.classList.add('hide'),
						      500
						      );
					     }
				    }
}

window.addEventListener('load', () => {
	 container.innerHTML =
		 '<p class="loading">Loading gallery...</p>';

	 searchInput.addEventListener(
		  'input',
		 event => {
			  const value = event.target.value;

			  if (!value.trim()) {
				   renderGallery(galleryDataCache);
				   } else {
					    filterGallery(value);
					    }
			  }
		  );

	 loadGallery();
});

function filterGallery(query) {
	 const value =
		 query.trim().toLowerCase();

	 const filteredData =
		 galleryDataCache
	 .map(category => {
		  const matchingFolders =
			  category.folders
		  .map(folder => {
			   const folderMatch =
				   folder.folderName
			   .toLowerCase()
			   .includes(value);

			   const matchingImages =
				  folder.images.filter(
					  image =>
					  image.name
					   .toLowerCase()
					   .includes(value)
					   );

			   if (
				    folderMatch ||
				    matchingImages.length
				    ) {
				    return {
					     ...folder,
					     images:
					     folderMatch
					     ? folder.images
					     : matchingImages
					     };
				    }

			   return null;
			   })
		  .filter(Boolean);

		  return matchingFolders.length
		  ? {
			   category:
			  category.category,
			   folders:
			   matchingFolders
			   }
		  : null;
		  })
	 .filter(Boolean);

	 renderGallery(filteredData);
}
