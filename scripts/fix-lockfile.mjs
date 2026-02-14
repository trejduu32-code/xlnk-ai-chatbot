import { execSync } from 'child_process';

try {
  console.log('Removing old package-lock.json...');
  execSync('rm -f /vercel/share/v0-project/package-lock.json', { stdio: 'inherit' });
  
  console.log('Running npm install to regenerate lock file...');
  execSync('npm install --prefix /vercel/share/v0-project', { stdio: 'inherit', timeout: 120000 });
  
  console.log('Lock file regenerated successfully!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
