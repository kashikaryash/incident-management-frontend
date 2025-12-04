import React, { useState, useMemo, useEffect } from "react";

const CategorySelectorTree = ({ categories, onSelect }) => {
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");

  const tree = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const roots = [];

    categories.forEach((c) => {
      if (c.parentId == null) roots.push(map[c.id]);
      else map[c.parentId]?.children.push(map[c.id]);
    });

    return roots;
  }, [categories]);

  const filterTree = (nodes, term) => {
    if (!term) return nodes;

    const res = [];
    for (const n of nodes) {
      const children = filterTree(n.children, term);
      if (n.name.toLowerCase().includes(term) || children.length > 0) {
        res.push({ ...n, children });
      }
    }
    return res;
  };

  const filteredTree = useMemo(
    () => filterTree(tree, search.toLowerCase()),
    [search, tree]
  );

  useEffect(() => {
    const init = {};
    const expandTwoLevels = (nodes, depth = 0) => {
      nodes.forEach((n) => {
        if (depth < 2) init[n.id] = true;
        expandTwoLevels(n.children, depth + 1);
      });
    };
    expandTwoLevels(tree);
    setExpanded(init);
  }, [tree]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const Node = ({ node, level }) => {
    const hasChildren = node.children.length > 0;
    const open = expanded[node.id];

    return (
      <div>
        <div
          className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
          style={{ marginLeft: level * 20 }}
          onClick={() => !hasChildren && onSelect(node)}
        >
          {hasChildren && (
            <button
              className="w-5 h-5 border rounded text-xs mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {open ? "−" : "+"}
            </button>
          )}
          <span>{node.name}</span>
        </div>

        {hasChildren &&
          open &&
          node.children.map((c) => (
            <Node key={c.id} node={c} level={level + 1} />
          ))}
      </div>
    );
  };

  return (
    <div>
      <input
        className="border rounded w-full p-2 mb-2"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredTree.map((root) => (
        <Node key={root.id} node={root} level={0} />
      ))}
    </div>
  );
};

export default CategorySelectorTree;
