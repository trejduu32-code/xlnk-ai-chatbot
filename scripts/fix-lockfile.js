import { execSync } from 'child_process';

console.log('Running npm install to regenerate package-lock.json...');
try {
  execSync('npm install --package-lock-only', { stdio: 'inherit', cwd: '/vercel/share/v0-project' });
  console.log('package-lock.json regenerated successfully.');
} catch (error) {
  console.error('npm install failed:', error.message);
  process.exit(1);
}
