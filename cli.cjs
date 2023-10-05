#!/usr/bin/env node

const execSync = require('child_process').execSync

// This will give the directory of cli.cjs, which is assumed to be the root of your project.
const projectRoot = __dirname

// Run the npm script using the project root as the working directory
execSync('npm run dev', { stdio: 'inherit', cwd: projectRoot })
