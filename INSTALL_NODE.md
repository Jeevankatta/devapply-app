# Installing Node.js for DevApply Frontend

## Quick Installation Guide

### Method 1: Official Installer (Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Install:**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option (usually checked by default)
   - Click "Install"

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run: `node --version`
   - Run: `npm --version`
   - You should see version numbers

### Method 2: Using winget (Windows Package Manager)

If you have Windows 10/11 with winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

### Method 3: Using Chocolatey

If you have Chocolatey installed:

```powershell
choco install nodejs
```

## After Installation

1. **Restart your terminal/PowerShell** (important!)

2. **Verify it works:**
   ```powershell
   node --version
   npm --version
   ```

3. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

4. **Install dependencies:**
   ```powershell
   npm install
   ```

5. **Start the development server:**
   ```powershell
   npm run dev
   ```

## Troubleshooting

If `npm` still not recognized after installation:
- Restart your computer
- Or manually add Node.js to PATH:
  - Usually installed at: `C:\Program Files\nodejs\`
  - Add this to your system PATH environment variable
