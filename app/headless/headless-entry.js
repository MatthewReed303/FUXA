const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * FUXA Headless Entry Point
 * 
 * This script is the entry point for standalone binaries.
 * It ensures the project data directory exists in the user's home folder
 * and then launches the FUXA server.
 */

async function bootstrap() {
    console.log('FUXA Headless starting...');

    // 1. Determine the user data directory (similar to Electron app)
    const homeDir = os.homedir();
    const fuxaDataDir = path.join(homeDir, 'fuxa-headless-data');
    const appDataDir = path.join(fuxaDataDir, '_appdata');
    
    // 2. Ensure the directory exists
    if (!fs.existsSync(fuxaDataDir)) {
        console.log(`Creating initial data directory: ${fuxaDataDir}`);
        try {
            fs.mkdirSync(fuxaDataDir, { recursive: true });
            
            // Create all required FUXA subdirectories in the user data folder
            const subDirs = [
                '_appdata',
                '_db',
                '_images',
                '_logs',
                '_pkg',
                '_reports',
                '_webcam_snapshots',
                '_widgets'
            ];

            for (const subDir of subDirs) {
                const subDirPath = path.join(fuxaDataDir, subDir);
                if (!fs.existsSync(subDirPath)) {
                    fs.mkdirSync(subDirPath, { recursive: true });
                }
            }
        } catch (err) {
            console.error(`Failed to create data directory: ${err.message}`);
            process.exit(1);
        }
    } else {
        console.log(`Using existing data directory: ${fuxaDataDir}`);
    }

    // 3. Resolve the server path
    // Under pkg, files are in the virtual filesystem. 
    // The build puts server/ in the same root as the entry point.
    let serverPath = path.join(__dirname, 'server', 'main.js');
    if (!fs.existsSync(serverPath)) {
         serverPath = path.join(__dirname, 'main.js');
    }

    if (!fs.existsSync(serverPath)) {
        console.error(`Could not find FUXA server at: ${serverPath}`);
        process.exit(1);
    }

    // 4. Launch the server
    console.log(`Launching FUXA server with userDir: ${fuxaDataDir}`);
    
    // Set the userDir environment variable so the server knows where to look for settings.js
    process.env.userDir = fuxaDataDir;
    
    const args = [
        '--userDir', fuxaDataDir,
        ...process.argv.slice(2)
    ];

    // Modify process.argv so nopt in the server picks up our userDir
    process.argv = [process.argv[0], serverPath, ...args];
    
    try {
        require(serverPath);
    } catch (err) {
        console.error(`Failed to start FUXA server: ${err.message}`);
        process.exit(1);
    }
}

bootstrap();
