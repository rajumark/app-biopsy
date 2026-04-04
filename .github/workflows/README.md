# CI/CD Workflows

## Workflows

### 1. Release Workflow (release.yml)

Triggers on push to main/master branches and checks commit messages for platform-specific releases.

**Commit Message Triggers:**
- `l` - Build for Linux (.AppImage, .deb, .rpm)
- `w` - Build for Windows (.exe)
- `m` - Build for macOS (.dmg for both Intel and Apple Silicon)
- `#go` - Build for all platforms

**Usage Examples:**
```bash
git commit -m "fix: update dependencies l" # Linux only
git commit -m "feat: add new feature w" # Windows only
git commit -m "feat: add dark mode m" # macOS (Intel + Apple Silicon)
git commit -m "chore: update readme l w m" # Linux, Windows, macOS
git commit -m "major release #go" # All platforms
```

**Platforms and Artifacts:**
- **Linux**: `.AppImage`, `.deb`, `.rpm`
- **Windows**: `.exe`
- **macOS**: `.dmg` (Intel and Apple Silicon)

### 2. Build All Platforms (build-all.yml)

Builds for all platforms simultaneously. Triggers on:
- Manual workflow dispatch
- Git tags (e.g., `v1.0.0`)

**Usage:**
```bash
# Create a tag to trigger automatic release
git tag v1.0.0
git push origin v1.0.0
```

### 3. Publish Workflow (publish.yml)

Manually publish artifacts to GitHub releases. Allows selective publishing.

**Parameters:**
- `platform`: Which platform artifacts to publish (all, linux, windows, macos)
- `release_tag`: Release tag (e.g., v1.0.0)
- `prerelease`: Mark as pre-release (default: false)

## Platform Matrix

| Platform | Runner | Architecture | Artifact Name |
| -------- | ------ | ------------ | ------------- |
| Linux | ubuntu-latest | x64 | appbiopsy-linux-packages |
| Windows | windows-latest | x64 | appbiopsy-windows-packages |
| macOS Intel | macos-latest | x64 | appbiopsy-macos-intel-packages |
| macOS Apple Silicon | macos-latest | arm64 | appbiopsy-macos-arm-packages |

## Release Process

### Automated Release (via commit messages)
1. Make changes to your code
2. Commit with platform triggers in the message
3. Push to main/master branch
4. CI/CD will automatically build and create a release

### Full Release (All Platforms)
1. Update version in `package.json`
2. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. CI/CD will build for all platforms and create a release

### Manual Publishing
1. Go to Actions tab in GitHub
2. Select "Publish" workflow
3. Fill in the required parameters:
   - Platform to publish
   - Release tag
   - Pre-release flag (optional)
4. Click "Run workflow"

## Artifacts

### Build Artifacts
- Stored for 30 days
- Available for download from the Actions tab
- Used for creating releases

### Release Artifacts
- Attached to GitHub releases
- Available for download from the Releases tab
- Permanent (until manually deleted)

## Notes

- Make sure to set `RELEASE_TOKEN` secret in your GitHub repository with `repo` permissions
- The workflows use Node.js 22 for building
- All builds are performed using `npm run make`
- Release version is automatically detected from `package.json`
