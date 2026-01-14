# LODDGO GitHub Setup Script
# Run this script after creating the GitHub repository

Write-Host "=== LODDGO GitHub Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Skipping remote setup." -ForegroundColor Yellow
        exit
    }
    git remote remove origin
}

# Get GitHub username
Write-Host "Your Git username is: firegrader" -ForegroundColor Green
$githubUsername = Read-Host "Enter your GitHub username (or press Enter to use 'firegrader')"
if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    $githubUsername = "firegrader"
}

# Get repository name
$repoName = Read-Host "Enter repository name (or press Enter to use 'LODDGO')"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "LODDGO"
}

# Set up remote
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
Write-Host ""
Write-Host "Setting up remote: $remoteUrl" -ForegroundColor Cyan
git remote add origin $remoteUrl

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch from '$currentBranch' to 'main'..." -ForegroundColor Cyan
    git branch -M main
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create the repository on GitHub: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: $repoName" -ForegroundColor White
Write-Host "   - DO NOT initialize with README/license (you already have files)" -ForegroundColor White
Write-Host ""
Write-Host "2. After creating the repository, run:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Or run this script again and it will attempt to push automatically." -ForegroundColor Gray
