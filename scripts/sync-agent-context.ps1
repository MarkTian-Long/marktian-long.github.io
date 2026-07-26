param(
  [switch]$Quiet,
  [switch]$Write
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]
$info = New-Object System.Collections.Generic.List[string]
$canonicalSkillsRoot = Join-Path $repoRoot ".agents/skills"
$policyManifest = Join-Path $repoRoot "scripts/repository-policy.json"
if (Test-Path $policyManifest) {
  $projectOwnedSkills = @(
    (Get-Content -LiteralPath $policyManifest -Raw -Encoding UTF8 |
      ConvertFrom-Json).projectSkills
  )
} else {
  $projectOwnedSkills = @()
  $errors.Add("Missing scripts/repository-policy.json") | Out-Null
}

if (-not (Test-Path $canonicalSkillsRoot)) {
  $commonGitDir = (& git -C $repoRoot rev-parse --git-common-dir 2>$null)
  if ($LASTEXITCODE -eq 0 -and $commonGitDir) {
    $resolvedGitDir = if ([IO.Path]::IsPathRooted($commonGitDir)) {
      [IO.Path]::GetFullPath($commonGitDir)
    } else {
      [IO.Path]::GetFullPath((Join-Path $repoRoot $commonGitDir))
    }
    $primaryWorkspace = Split-Path $resolvedGitDir -Parent
    $primarySkills = Join-Path $primaryWorkspace ".agents/skills"
    if (Test-Path $primarySkills) {
      $canonicalSkillsRoot = $primarySkills
    }
  }
}

function Add-Result {
  param(
    [string]$Level,
    [string]$Message
  )

  switch ($Level) {
    "ERROR" { $script:errors.Add($Message) | Out-Null }
    "WARN" { $script:warnings.Add($Message) | Out-Null }
    default { $script:info.Add($Message) | Out-Null }
  }
}

function Test-FileContains {
  param(
    [string]$Path,
    [string]$Pattern,
    [string]$Label
  )

  if (-not (Test-Path $Path)) {
    Add-Result "ERROR" "$Label is missing: $Path"
    return
  }

  $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  if ($content -notmatch [regex]::Escape($Pattern)) {
    Add-Result "ERROR" "$Label does not reference $Pattern"
  } else {
    Add-Result "OK" "$Label references $Pattern"
  }
}

function Get-SkillState {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return "missing"
  }

  $item = Get-Item -LiteralPath $Path -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    return "junction"
  }

  return "directory"
}

Push-Location $repoRoot
try {
  $requiredFiles = @(
    "CONVENTIONS.md",
    "CLAUDE.md",
    "AGENTS.md",
    "docs/agent-context/README.md",
    "docs/agent-context/memory.md",
    "docs/agent-context/skills.md",
    "docs/agent-context/maintenance.md",
    "docs/agent-context/migration-plan-2026-07-10.md",
    "scripts/repository-policy.json"
  )

  foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
      Add-Result "OK" "Found $file"
    } else {
      Add-Result "ERROR" "Missing $file"
    }
  }

  Test-FileContains "CLAUDE.md" "docs/agent-context/README.md" "CLAUDE.md"
  Test-FileContains "CLAUDE.md" ".agents/skills/<name>/SKILL.md" "CLAUDE.md"
  Test-FileContains "AGENTS.md" "docs/agent-context/README.md" "AGENTS.md"
  Test-FileContains "AGENTS.md" ".agents/skills/<name>/SKILL.md" "AGENTS.md"

  $maintenance = "docs/agent-context/maintenance.md"
  if (Test-Path $maintenance) {
    $maintenanceContent = Get-Content -LiteralPath $maintenance -Raw -Encoding UTF8
    if ($maintenanceContent -match "monthly-review:\s*last=\d{4}-\d{2}-\d{2}\s+next=\d{4}-\d{2}-\d{2}") {
      Add-Result "OK" "Shared monthly-review marker exists"
    } else {
      Add-Result "ERROR" "Shared monthly-review marker is missing or malformed"
    }
  }

  if (-not (Test-Path $canonicalSkillsRoot)) {
    Add-Result "ERROR" "Canonical .agents/skills directory is missing from this worktree and the primary workspace"
  } else {
    Add-Result "OK" "Canonical .agents/skills directory exists at $canonicalSkillsRoot"
  }

  if (Test-Path ".codex/skills") {
    Add-Result "WARN" ".codex/skills exists; project policy says .agents/skills is canonical"
  }

  if (Test-Path ".Codex/skills") {
    Add-Result "WARN" ".Codex/skills exists; project policy says .agents/skills is canonical"
  }

  if (Test-Path "skills") {
    Add-Result "OK" "Root skills/ exists as ignored legacy compatibility"
  }

  if ((Test-Path $canonicalSkillsRoot) -and (Test-Path ".claude/skills")) {
    $agentSkills = Get-ChildItem $canonicalSkillsRoot -Directory
    foreach ($skill in $agentSkills) {
      $agentSkillDir = $skill.FullName
      $claudeSkillDir = Join-Path ".claude/skills" $skill.Name
      if ($Write -and ($projectOwnedSkills -contains $skill.Name)) {
        if (-not (Test-Path $claudeSkillDir)) {
          New-Item -ItemType Directory -Path $claudeSkillDir -Force | Out-Null
        }
        Get-ChildItem -LiteralPath $agentSkillDir -Recurse -File | ForEach-Object {
          $relativePath = $_.FullName.Substring($agentSkillDir.Length).TrimStart("\")
          $targetPath = Join-Path $claudeSkillDir $relativePath
          $targetParent = Split-Path $targetPath -Parent
          if (-not (Test-Path $targetParent)) {
            New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
          }
          Copy-Item -LiteralPath $_.FullName -Destination $targetPath -Force
        }
        Add-Result "OK" "Synchronized .claude/skills/$($skill.Name) from canonical"
      }
      $state = Get-SkillState $claudeSkillDir

      if ($state -eq "missing") {
        Add-Result "WARN" ".claude/skills/$($skill.Name) is missing"
        continue
      }

      if ($state -eq "junction") {
        Add-Result "OK" ".claude/skills/$($skill.Name) is a junction"
        continue
      }

      $agentSkillFile = Join-Path $agentSkillDir "SKILL.md"
      $claudeSkillFile = Join-Path $claudeSkillDir "SKILL.md"
      if ((Test-Path $agentSkillFile) -and (Test-Path $claudeSkillFile)) {
        $agentHash = (Get-FileHash -LiteralPath $agentSkillFile -Algorithm SHA256).Hash
        $claudeHash = (Get-FileHash -LiteralPath $claudeSkillFile -Algorithm SHA256).Hash
        if ($agentHash -eq $claudeHash) {
          if ($projectOwnedSkills -contains $skill.Name) {
            Add-Result "OK" ".claude/skills/$($skill.Name) is a matching tracked compatibility directory"
          } else {
            Add-Result "WARN" ".claude/skills/$($skill.Name) is a real vendor directory; expected a managed junction"
          }
        } else {
          Add-Result "WARN" ".claude/skills/$($skill.Name) is a real directory and differs from .agents/skills/$($skill.Name)"
        }
      } else {
        Add-Result "WARN" ".claude/skills/$($skill.Name) is a real directory; one side has no SKILL.md"
      }
    }
  }

  if (-not $Quiet) {
    foreach ($line in $info) { Write-Host "[OK] $line" }
    foreach ($line in $warnings) { Write-Host "[WARN] $line" }
    foreach ($line in $errors) { Write-Host "[ERROR] $line" }
    Write-Host ""
    Write-Host "Summary: $($info.Count) ok, $($warnings.Count) warnings, $($errors.Count) errors"
  }

  if ($errors.Count -gt 0) {
    exit 1
  }
}
finally {
  Pop-Location
}
