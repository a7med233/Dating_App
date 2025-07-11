const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');

// Function to kill process on port 3000
const killPort3000 = () => {
  return new Promise((resolve) => {
    console.log('🔄 Checking for existing processes on port 3000...');
    
    // Use netstat to find processes on port 3000
    const netstat = spawn('netstat', ['-ano'], { shell: true });
    let output = '';
    
    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.on('close', () => {
      const lines = output.split('\n');
      const port3000Line = lines.find(line => line.includes(':3000') && line.includes('LISTENING'));
      
      if (port3000Line) {
        const parts = port3000Line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && !isNaN(pid)) {
          console.log(`🛑 Killing process ${pid} on port 3000...`);
          exec(`taskkill /PID ${pid} /F`, (error) => {
            if (error) {
              console.log('⚠️ Could not kill process, continuing anyway...');
            } else {
              console.log('✅ Process killed successfully');
            }
            resolve();
          });
        } else {
          resolve();
        }
      } else {
        console.log('✅ No process found on port 3000');
        resolve();
      }
    });
    
    netstat.on('error', () => {
      console.log('⚠️ Could not check for existing processes, continuing...');
      resolve();
    });
  });
};

// Main startup function
const startBackend = async () => {
  try {
    await killPort3000();
    
    // Wait a moment for the port to be released
    setTimeout(() => {
      console.log('🚀 Starting backend server...');
      
      // Start the backend server
      const backendProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'api'),
        stdio: 'inherit',
        shell: true
      });

      backendProcess.on('error', (error) => {
        console.error('❌ Error starting backend server:', error);
      });

      backendProcess.on('close', (code) => {
        console.log(`Backend server exited with code ${code}`);
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping backend server...');
        backendProcess.kill('SIGINT');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Stopping backend server...');
        backendProcess.kill('SIGTERM');
        process.exit(0);
      });
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error in startup process:', error);
  }
};

startBackend(); 