import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MetroMap from './components/MetroMap';
import CodeDrawer from './components/CodeDrawer';
import { mockData } from './mockData';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [showSource, setShowSource] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [hideOrphans, setHideOrphans] = useState(false);

  const handleScan = async ({ projectPath, targetGroupId, gitUrl, branch }) => {
    setLoading(true);
    try {
      console.log("Sending request to backend:", { projectPath, targetGroupId, gitUrl, branch });
      const response = await fetch('http://localhost:8080/api/scan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath, targetGroupId, gitUrl, branch }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data from backend:", data);

      if (!data.nodes || data.nodes.length === 0) {
        alert("No dependencies found! Check the project path and target group ID.");
      }

      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (error) {
      console.error("Scan failed:", error);
      alert("Scan failed: " + error.message + ". Is the backend running on port 8080?");
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Filter nodes based on visibility toggles and package filter
  let filteredNodes = nodes.filter(node => {
    if (node.type === 'source' && !showSource) return false;
    if (node.type === 'dependency' && !showDependencies) return false;

    if (packageFilter) {
      // Simple check: does the ID start with the filter?
      // Or maybe check the label?
      if (!node.id.toLowerCase().includes(packageFilter.toLowerCase())) return false;
    }

    return true;
  });

  // Filter edges: only show edges where both source and target are visible
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(edge =>
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );

  // Hide orphans if enabled
  if (hideOrphans) {
    const connectedNodeIds = new Set();
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
  }

  return (
    <div className="flex w-full h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        onScan={handleScan}
        loading={loading}
        onSearch={setSearchTerm}
        onToggleSource={setShowSource}
        onToggleDependency={setShowDependencies}
        onPackageFilter={setPackageFilter}
        onToggleOrphans={setHideOrphans}
      />

      <div className="flex-1 relative">
        <MetroMap
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodeClick={onNodeClick}
          searchTerm={searchTerm}
        />

        {nodes.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Ready to Scan</h2>
              <p className="text-slate-500">Enter a project path and target group ID to start.</p>
            </div>
          </div>
        )}
      </div>

      <CodeDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        node={selectedNode}
      />
    </div>
  );
}

export default App;
