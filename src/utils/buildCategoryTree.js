export function buildCategoryTree(categories) {
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parentId) {
      if (map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      }
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
}
