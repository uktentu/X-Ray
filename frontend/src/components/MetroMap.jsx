import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SourceNode from './SourceNode';
import DependencyNode from './DependencyNode';

const nodeTypes = {
    source: SourceNode,
    dependency: DependencyNode,
};

const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#64748b', strokeWidth: 2 },
    type: 'smoothstep',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b',
    },
};

import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};

const MetroMap = ({ nodes: initialNodes, edges: initialEdges, onNodeClick, searchTerm }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onLayout = useCallback(
        (direction) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges, setNodes, setEdges]
    );

    React.useEffect(() => {
        if (initialNodes.length > 0) {
            let processedNodes = [...initialNodes];

            // Apply search highlighting
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                processedNodes = processedNodes.map(node => {
                    const match = node.id.toLowerCase().includes(lowerTerm) ||
                        (node.data && node.data.label && node.data.label.toLowerCase().includes(lowerTerm));
                    return {
                        ...node,
                        style: {
                            ...node.style,
                            opacity: match ? 1 : 0.1,
                            transition: 'opacity 0.3s ease'
                        }
                    };
                });
            } else {
                // Reset opacity
                processedNodes = processedNodes.map(node => ({
                    ...node,
                    style: {
                        ...node.style,
                        opacity: 1,
                        transition: 'opacity 0.3s ease'
                    }
                }));
            }

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                processedNodes,
                initialEdges,
                'LR'
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges, searchTerm]);

    return (
        <div className="w-full h-full bg-slate-950 relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#1e293b" gap={20} />
                <Controls className="bg-slate-800 border-slate-700 fill-slate-400" />
                <MiniMap
                    nodeStrokeColor={(n) => {
                        if (n.type === 'source') return '#3b82f6';
                        if (n.type === 'dependency') return '#a855f7';
                        return '#eee';
                    }}
                    nodeColor={(n) => {
                        return '#1e293b';
                    }}
                    maskColor="rgba(30, 41, 59, 0.7)"
                    className="bg-slate-900 border border-slate-800"
                />
            </ReactFlow>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={() => onLayout('TB')}
                    className="px-4 py-2 bg-slate-800 text-slate-200 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-medium shadow-lg"
                >
                    Vertical Layout
                </button>
                <button
                    onClick={() => onLayout('LR')}
                    className="px-4 py-2 bg-slate-800 text-slate-200 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-medium shadow-lg"
                >
                    Horizontal Layout
                </button>
            </div>
        </div>
    );
};

export default MetroMap;
