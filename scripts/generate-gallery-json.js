const fs = require('fs');
const path = require('path');

const IMAGES_DIR = './images';
const OUTPUT_FILE = './gallery.json';
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

function getFilesInDirectory(dir) {
    try {
        return fs.readdirSync(dir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
        });
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
        return [];
    }
}

function getDirectories(dir) {
    try {
        return fs.readdirSync(dir).filter(file => {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
    } catch (error) {
        console.error(`Error reading directories in ${dir}:`, error.message);
        return [];
    }
}

function generateGalleryJSON() {
    const galleryData = [];
    
    // Get all categories (first level folders in images/)
    const categories = getDirectories(IMAGES_DIR);
    
    console.log(`Found ${categories.length} categories:`, categories);
    
    categories.forEach(category => {
        const categoryPath = path.join(IMAGES_DIR, category);
        const folders = getDirectories(categoryPath);
        
        console.log(`\nCategory: ${category} - ${folders.length} folders`);
        
        const folderData = folders.map(folderName => {
            const folderPath = path.join(categoryPath, folderName);
            const imageFiles = getFilesInDirectory(folderPath);
            
            console.log(`  Folder: ${folderName} - ${imageFiles.length} images`);
            
            const images = imageFiles.map(imageFile => {
                const imageExt = path.extname(imageFile);
                const imageName = path.basename(imageFile, imageExt);
                const imagePath = path.join(IMAGES_DIR, category, folderName, imageFile)
                    .replace(/\\/g, '/'); // Use forward slashes for web
                
                return {
                    name: imageName,
                    path: imagePath
                };
            });
            
            return {
                folderName: folderName,
                images: images
            };
        });
        
        galleryData.push({
            category: category,
            folders: folderData
        });
    });
    
    // Write to file with pretty formatting
    const jsonContent = JSON.stringify(galleryData, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');
    
    const totalImages = galleryData.reduce(
        (sum, cat) => sum + cat.folders.reduce((s, f) => s + f.images.length, 0), 
        0
    );
    
    console.log(`\n✅ Generated ${OUTPUT_FILE}`);
    console.log(`📊 Total: ${galleryData.length} categories, ${galleryData.reduce((sum, c) => sum + c.folders.length, 0)} folders, ${totalImages} images`);
    
    return galleryData;
}

// Run the generator
try {
    generateGalleryJSON();
    console.log('\n✨ Gallery JSON generated successfully!');
    process.exit(0);
} catch (error) {
    console.error('\n❌ Error generating gallery JSON:', error.message);
    process.exit(1);
}
