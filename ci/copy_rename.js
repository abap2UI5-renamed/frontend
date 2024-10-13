const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Absolute path to the configuration file
const configPath = path.join(__dirname, 'config.yaml');

// Read the configuration file
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

// Function to recursively delete a directory
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

// Function to copy, rename, and replace content in files
function copyAndRenameFiles(src, dest, callback) {
    // Check if the destination directory exists, otherwise create it
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read all files and directories in the source directory
    fs.readdir(src, (err, items) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        let pending = items.length;
        if (!pending) return callback();

        items.forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item.replace(config.old_name, config.new_name));

            // Check if the file should be excluded
            const shouldExclude = config.exclude_patterns.some(pattern => item.includes(pattern)) && !item.endsWith('wapa.xml');

            // Check if it is a directory
            fs.stat(srcPath, (err, stats) => {
                if (err) {
                    console.error('Error getting file information:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // Recursively call for subdirectories
                    copyAndRenameFiles(srcPath, destPath, () => {
                        if (!--pending) callback();
                    });
                } else {
                    // Copy and rename file
                    fs.copyFile(srcPath, destPath, err => {
                        if (err) {
                            console.error('Error copying file:', err);
                            return;
                        }

                        if (!shouldExclude || item.endsWith('wapa.xml')) {
                            // Replace content (both lowercase and uppercase)
                            fs.readFile(destPath, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading file:', err);
                                    return;
                                }

                                const result = data
                                    .replace(new RegExp(config.old_name, 'g'), config.new_name)
                                    .replace(new RegExp(config.old_name.toUpperCase(), 'g'), config.new_name.toUpperCase());

                                // Save file in the destination directory
                                fs.writeFile(destPath, result, 'utf8', err => {
                                    if (err) {
                                        console.error('Error writing file:', err);
                                    } else {
                                        console.log(`File copied and content replaced: ${srcPath} -> ${destPath}`);
                                    }
                                    if (!--pending) callback();
                                });
                            });
                        } else {
                            console.log(`File copied without replacing content: ${srcPath} -> ${destPath}`);
                            if (!--pending) callback();
                        }
                    });
                }
            });
        });
    });
}

// Function to replace the content of all files ending with manifest.json in the 02 folder
function updateManifestJsonFiles(dest) {
    const targetDir = path.join(dest, '02');
    if (fs.existsSync(targetDir)) {
        fs.readdirSync(targetDir).forEach(file => {
            const curPath = path.join(targetDir, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                updateManifestJsonFiles(curPath);
            } else if (file.endsWith('manifest.json')) {
                fs.readFile(curPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading manifest.json:', err);
                        return;
                    }

                    const result = data.replace(new RegExp(`"uri": "/sap/bc/${config.old_name}"`, 'g'), `"uri": "/sap/bc/${config.new_name}"`);

                    fs.writeFile(curPath, result, 'utf8', err => {
                        if (err) {
                            console.error('Error writing manifest.json:', err);
                        } else {
                            console.log(`manifest.json updated: ${curPath}`);
                        }
                    });
                });
            }
        });
    }
}

// Clear the destination directory before copying
const destDir = path.resolve(__dirname, config.destination_path);
deleteFolderRecursive(destDir);
fs.mkdirSync(destDir, { recursive: true });

// Execute the script for all specified source directories
let pending = config.source_paths.length;
config.source_paths.forEach(srcPath => {
    const srcDir = path.resolve(__dirname, srcPath);
    const destSubDir = path.join(destDir, path.basename(srcPath));
    copyAndRenameFiles(srcDir, destSubDir, () => {
        if (!--pending) {
            // Update all files ending with manifest.json in the 02 folder
            updateManifestJsonFiles(destDir);
        }
    });
});