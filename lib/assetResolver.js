const fs = require('fs');
const path = require('path');

function getAddonRoots(gamepath) {
  const roots = [gamepath];
  const addonsDir = path.join(gamepath, 'addons');
  let entries;
  try {
    entries = fs.readdirSync(addonsDir, { withFileTypes: true });
  } catch {
    return roots;
  }
  entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b))
    .forEach(name => roots.push(path.join(addonsDir, name)));
  return roots;
}

function createResolver(roots) {
  return function resolveAsset(relPath) {
    for (const root of roots) {
      const full = path.join(root, relPath);
      if (fs.existsSync(full)) return full;
    }
    return null;
  };
}

module.exports = { getAddonRoots, createResolver };
