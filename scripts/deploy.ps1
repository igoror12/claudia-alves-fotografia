# scripts/deploy.ps1
# ─────────────────────────────────────────────────────────────────
# Helper local para os passos 1, 6 e validação do DEPLOY.md.
# Não substitui a configuração no dashboard Vercel (Storage, Domains).
#
# Uso (PowerShell na pasta do projeto):
#   .\scripts\deploy.ps1 init     # passo 1: limpa .git fantasma + git init + commit inicial
#   .\scripts\deploy.ps1 db       # passo 6: prisma db push + seed
#   .\scripts\deploy.ps1 verify   # smoke tests: build local + lint
#   .\scripts\deploy.ps1 all      # corre tudo em sequência
# ─────────────────────────────────────────────────────────────────

param(
  [Parameter(Position = 0)]
  [ValidateSet("init", "db", "verify", "all")]
  [string]$Step = "all"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

function Write-Section($Title) {
  Write-Host ""
  Write-Host "─── $Title ───────────────────────────────────────" -ForegroundColor Cyan
}

function Step-Init {
  Write-Section "Passo 1: Inicializar repositório git"
  Push-Location $Root
  try {
    if (Test-Path .git) {
      Write-Host "A remover .git fantasma..." -ForegroundColor Yellow
      Remove-Item -Recurse -Force .git
    }
    git init -b main
    git add .
    git commit -m "Initial commit: site Cláudia Alves Fotografia"
    Write-Host "✓ Repositório inicializado." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximo passo manual: cria o repo no GitHub e corre:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/<user>/claudia-alves-fotografia.git"
    Write-Host "  git push -u origin main"
  }
  finally {
    Pop-Location
  }
}

function Step-Db {
  Write-Section "Passo 6: Sincronizar schema + seed"
  Push-Location $Root
  try {
    if (-not (Test-Path .env.production) -and -not (Test-Path .env)) {
      Write-Host "Falta .env.production. Corre primeiro:" -ForegroundColor Red
      Write-Host "  vercel link"
      Write-Host "  vercel env pull .env.production"
      throw "Sem env file."
    }

    # Carrega o env file para a sessão actual
    $envFile = if (Test-Path .env.production) { ".env.production" } else { ".env" }
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $name = $Matches[1]
        $value = $Matches[2].Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
      }
    }

    Write-Host "A correr prisma db push..."
    npx prisma db push --schema prisma/schema.prisma --accept-data-loss
    Write-Host "A correr seed..."
    npx tsx prisma/seed.ts
    Write-Host "✓ Base de dados pronta." -ForegroundColor Green
  }
  finally {
    Pop-Location
  }
}

function Step-Verify {
  Write-Section "Validação: build local + lint"
  Push-Location $Root
  try {
    if (-not (Test-Path node_modules)) {
      Write-Host "A instalar dependências..."
      npm install --no-audit --no-fund
    }
    Write-Host "A correr lint..."
    npm run lint
    Write-Host "A correr build..."
    npm run build
    Write-Host "✓ Build OK. Tudo pronto para deploy." -ForegroundColor Green
  }
  finally {
    Pop-Location
  }
}

switch ($Step) {
  "init"   { Step-Init }
  "db"     { Step-Db }
  "verify" { Step-Verify }
  "all" {
    Step-Init
    Step-Verify
    Write-Host ""
    Write-Host "Faz agora os passos 2-5 do DEPLOY.md (Vercel UI)." -ForegroundColor Yellow
    Write-Host "Depois corre: .\scripts\deploy.ps1 db" -ForegroundColor Yellow
  }
}
