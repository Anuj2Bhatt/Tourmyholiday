const fs = require('fs');
const path = require('path');

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = ['.js', '.jsx']) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            // Skip node_modules and .git
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(findFiles(filePath, extensions));
            }
        } else {
            const ext = path.extname(file);
            if (extensions.includes(ext)) {
                results.push(filePath);
            }
        }
    });
    
    return results;
}

// Function to remove console.log statements
function removeConsoleLogs(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Remove console.log statements
        content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
        content = content.replace(/console\.error\([^)]*\);?\s*/g, '');
        content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');
        content = content.replace(/console\.info\([^)]*\);?\s*/g, '');
        
        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

// Main execution
const files = findFiles('.');
let cleanedCount = 0;
let totalFiles = files.length;

files.forEach(file => {
    if (removeConsoleLogs(file)) {
        cleanedCount++;
    }
});

