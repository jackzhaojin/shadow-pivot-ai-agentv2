const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

function runEndpointTests() {
  if (!process.env.CODEX_ENV_NODE_VERSION) {
    run('npm run test:design-concepts');
    run('npm run test:design-evaluation');
    run('npm run test:figma-spec');
  } else {
    console.log('⚠️  Skipping endpoint tests in Codex environment');
  }
}

if (require.main === module) {
  runEndpointTests();
}

module.exports = { runEndpointTests };

