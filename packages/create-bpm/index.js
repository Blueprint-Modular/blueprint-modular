#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

async function main() {
  const nameArg = process.argv[2]

  let projectName = nameArg
  if (!projectName) {
    const res = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nom de votre app BPM ?',
      initial: 'mon-app'
    })
    projectName = res.name
  }

  if (!projectName) process.exit(1)

  const target = path.resolve(process.cwd(), projectName)
  const template = path.join(__dirname, 'template')

  console.log(`\n🚀 Création de ${projectName}...`)

  // Copie le template
  fs.cpSync(template, target, { recursive: true })

  // Met à jour le nom dans package.json
  const pkgPath = path.join(target, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.name = projectName
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  console.log(`📦 Installation des dépendances...`)
  execSync('npm install', { cwd: target, stdio: 'inherit' })

  console.log(`\n✅ ${projectName} est prêt !`)
  console.log(`\n   cd ${projectName}`)
  console.log(`   npm run dev\n`)
}

main().catch(console.error)
