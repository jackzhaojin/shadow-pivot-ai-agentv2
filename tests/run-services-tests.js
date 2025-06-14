const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

function runServiceTests() {
  run('npm run test:user-guid');
  run('npm run test:spec-selection');
  if (!process.env.CODEX_ENV_NODE_VERSION) {
    run('npm run test:design-concepts');
    run('npm run test:design-evaluation');
  } else {
    console.log('⚠️  Skipping design-concepts and design-evaluation tests in Codex environment');
  }
}

if (require.main === module) {
  runServiceTests();
}

module.exports = { runServiceTests };
