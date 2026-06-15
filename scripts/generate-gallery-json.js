const fs = require('fs');
const path = require('path');

const IMAGES_DIR = './images';
const OUTPUT_FILE = './gallery.json';
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

function getFilesInDirectory(dir) {
    try {
        if (!fs.existsSync(dir)) {
            console.log(`Directory does not exist: ${dir}`);
            return [];
        }
        return fs.readdirSync(dir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
        }).sort();
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
        return [];
    }
}

function getDirectories(dir) {
    try {
        if (!fs.existsSync(dir)) {
            console.log(`Directory does not exist: ${dir}`);
            return [];
        }
        return fs.readdirSync(dir).filter(file => {
            return fs.statSync(path.join(dir, file)).isDirectory();
        }).sort();
    } catch (error) {
        console.error(`Error reading directories in ${dir}:`, error.message);
        return [];
    }
}

function generateGalleryJSON() {
    const galleryData = [];
    
    console.log('🔍 Scanning for images...');
    console.log(`Images directory: ${IMAGES_DIR}`);
    
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ Images directory not found at ${IMAGES_DIR}`);
        process.exit(1);
    }
    
    const categories = getDirectories(IMAGES_DIR);
    console.log(`Found ${categories.length} categories:`, categories);
    
    if (categories.length === 0) {
        console.error('❌ No category folders found in images/ directory');
        process.exit(1);
    }
    
    categories.forEach(category => {
        const categoryPath = path.join(IMAGES_DIR, category);
        const folders = getDirectories(categoryPath);
        
        console.log(`\n📁 Category: ${category} - ${folders.length} folders`);
        
        if (folders.length === 0) {
            console.log(`  ⚠️  No folders found in ${category}`);
            return;
        }
        
        const folderData = folders.map(folderName => {
            const folderPath = path.join(categoryPath, folderName);
            const imageFiles = getFilesInDirectory(folderPath);
            
            console.log(`  📂 Folder: ${folderName} - ${imageFiles.length} images`);
            
            if (imageFiles.length === 0) {
                console.log(`    ⚠️  No images found in ${folderName}`);
            }
            
            const images = imageFiles.map(imageFile => {
                const imageExt = path.extname(imageFile);
                const imageName = path.basename(imageFile, imageExt);
                const imagePath = path.join(IMAGES_DIR, category, folderName, imageFile)
                    .replace(/\\/g, '/');
                
                return {
                    name: imageName,
                    path: imagePath
                };
            });
            
            return {
                folderName: folderName,
                images: images
            };
        }).filter(folder => folder.images.length > 0);
        
        if (folderData.length > 0) {
            galleryData.push({
                category: category,
                folders: folderData
            });
        }
    });
    
    const jsonContent = JSON.stringify(galleryData, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');
    
    const totalCategories = galleryData.length;
    const totalFolders = galleryData.reduce((sum, c) => sum + c.folders.length, 0);
    const totalImages = galleryData.reduce(
        (sum, cat) => sum + cat.folders.reduce((s, f) => s + f.images.length, 0), 
        0
    );
    
    console.log(`\n✅ Successfully generated ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${totalCategories}`);
    console.log(`   - Folders: ${totalFolders}`);
    console.log(`   - Total Images: ${totalImages}`);
    
    return galleryData;
}

try {
    generateGalleryJSON();
    console.log('\n✨ Gallery JSON generated successfully!');
    process.exit(0);
} catch (error) {
    console.error('\n❌ Error generating gallery JSON:', error.message);
    console.error(error.stack);
    process.exit(1);
}
