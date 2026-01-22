import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Brain, Sparkles } from 'lucide-react';
import { MindMapNode } from '../types';

interface Props {
  data: MindMapNode;
}

interface Position {
  x: number;
  y: number;
}

export default function MindMap({ data }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.3));
  };

  const handleReset = () => {
    setZoom(0.8);
    setPan({ x: 50, y: 100 });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (node: MindMapNode) => {
      allIds.add(node.id);
      if (node.children) {
        node.children.forEach(collectIds);
      }
    };
    collectIds(data);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded(new Set(['root']));
  };

  // Initialize with better default view
  useEffect(() => {
    setZoom(0.8);
    setPan({ x: 50, y: 100 });
  }, [data]);

  // Count visible leaf nodes in a subtree
  const countVisibleLeaves = (node: MindMapNode): number => {
    if (!node.children || node.children.length === 0 || !expanded.has(node.id)) {
      return 1;
    }
    return node.children.reduce((sum, child) => sum + countVisibleLeaves(child), 0);
  };

  // Calculate positions using a proper tree layout algorithm
  const calculateNodePositions = (): Map<string, Position> => {
    const positions = new Map<string, Position>();
    const horizontalSpacing = 300;
    const verticalSpacing = 100;
    
    const layoutNode = (
      node: MindMapNode,
      level: number,
      minY: number,
      maxY: number
    ): number => {
      const x = 150 + level * horizontalSpacing;
      
      if (!node.children || node.children.length === 0 || !expanded.has(node.id)) {
        // Leaf node - place it at the midpoint
        const y = (minY + maxY) / 2;
        positions.set(node.id, { x, y });
        return y;
      }
      
      // Calculate space needed for each child
      const totalLeaves = countVisibleLeaves(node);
      const availableHeight = maxY - minY;
      const spacePerLeaf = Math.max(verticalSpacing, availableHeight / totalLeaves);
      
      let currentY = minY;
      const childYPositions: number[] = [];
      
      // Layout each child
      node.children.forEach((child) => {
        const childLeaves = countVisibleLeaves(child);
        const childHeight = childLeaves * spacePerLeaf;
        const childMinY = currentY;
        const childMaxY = currentY + childHeight;
        
        const childY = layoutNode(child, level + 1, childMinY, childMaxY);
        childYPositions.push(childY);
        
        currentY = childMaxY;
      });
      
      // Position this node at the center of its children
      const avgChildY = childYPositions.reduce((sum, y) => sum + y, 0) / childYPositions.length;
      positions.set(node.id, { x, y: avgChildY });
      
      return avgChildY;
    };
    
    // Calculate total height needed
    const totalLeaves = countVisibleLeaves(data);
    const totalHeight = Math.max(800, totalLeaves * verticalSpacing);
    
    // Start layout from root
    layoutNode(data, 0, 0, totalHeight);
    
    return positions;
  };

  const positions = calculateNodePositions();

  const renderConnections = (node: MindMapNode, parentPos?: Position) => {
    if (!expanded.has(node.id) || !node.children) return null;

    const nodePos = positions.get(node.id);
    if (!nodePos) return null;

    return node.children.map((child) => {
      const childPos = positions.get(child.id);
      if (!childPos) return null;

      return (
        <g key={`line-${node.id}-${child.id}`}>
          {/* Glow effect */}
          <path
            d={`M ${nodePos.x + 100} ${nodePos.y + 30} 
                C ${nodePos.x + 150} ${nodePos.y + 30},
                  ${childPos.x - 50} ${childPos.y + 30},
                  ${childPos.x} ${childPos.y + 30}`}
            stroke="url(#connectionGradient)"
            strokeWidth="6"
            fill="none"
            opacity="0.3"
            className="transition-all duration-300"
            filter="blur(4px)"
          />
          {/* Main line */}
          <path
            d={`M ${nodePos.x + 100} ${nodePos.y + 30} 
                C ${nodePos.x + 150} ${nodePos.y + 30},
                  ${childPos.x - 50} ${childPos.y + 30},
                  ${childPos.x} ${childPos.y + 30}`}
            stroke="url(#connectionGradient)"
            strokeWidth="3"
            fill="none"
            className="transition-all duration-300"
            strokeDasharray="5,5"
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="10"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          {renderConnections(child, childPos)}
        </g>
      );
    });
  };

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const pos = positions.get(node.id);
    if (!pos) return null;

    const gradients = [
      { from: '#6366f1', to: '#8b5cf6', shadow: 'rgba(99, 102, 241, 0.5)' },
      { from: '#10b981', to: '#14b8a6', shadow: 'rgba(16, 185, 129, 0.5)' },
      { from: '#f59e0b', to: '#ef4444', shadow: 'rgba(245, 158, 11, 0.5)' },
      { from: '#ec4899', to: '#f43f5e', shadow: 'rgba(236, 72, 153, 0.5)' },
      { from: '#3b82f6', to: '#06b6d4', shadow: 'rgba(59, 130, 246, 0.5)' },
    ];
    const gradient = gradients[level % gradients.length];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isRoot = level === 0;

    return (
      <g key={node.id}>
        <foreignObject
          x={pos.x}
          y={pos.y}
          width={isRoot ? "240" : "220"}
          height={isRoot ? "80" : "70"}
          className="overflow-visible"
        >
          <div
            onClick={() => hasChildren && toggleNode(node.id)}
            className={`
              relative group
              ${hasChildren ? 'cursor-pointer' : 'cursor-default'}
              transition-all duration-300
            `}
            style={{
              animation: 'fadeInRight 0.5s ease-out',
              animationDelay: `${level * 0.1}s`,
            }}
          >
            {/* Main card */}
            <div
              className={`
                rounded-2xl shadow-2xl
                border-2 border-white/30
                backdrop-blur-md
                hover:scale-110 hover:shadow-2xl
                transition-all duration-300
                ${isRoot ? 'p-5' : 'p-4'}
              `}
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                boxShadow: `0 10px 40px ${gradient.shadow}, 0 0 20px ${gradient.shadow}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-white font-bold leading-tight break-words ${isRoot ? 'text-base' : 'text-sm'}`}>
                    {node.label}
                  </p>
                  {hasChildren && (
                    <div className="flex items-center space-x-1 mt-2">
                      <div className={`h-1.5 w-1.5 rounded-full bg-white/60 ${isExpanded ? 'animate-pulse' : ''}`} />
                      <p className="text-white/80 text-xs font-medium">
                        {node.children!.length} {node.children!.length === 1 ? 'child' : 'children'}
                      </p>
                    </div>
                  )}
                </div>
                
                {hasChildren && (
                  <div className="flex-shrink-0 bg-white/25 rounded-full p-1.5 backdrop-blur-sm">
                    <svg
                      className={`w-3 h-3 text-white transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Level indicator for root */}
              {isRoot && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ROOT
                </div>
              )}
            </div>

            {/* Enhanced glow effect */}
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              }}
            />

            {/* Pulse ring on hover */}
            {hasChildren && (
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{
                  border: `2px solid ${gradient.from}`,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            )}
          </div>
        </foreignObject>

        {/* Render children */}
        {hasChildren && isExpanded && node.children!.map((child) => renderNode(child, level + 1))}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Interactive Mind Map</h1>
                <p className="text-white/70 text-sm">Visualize concepts and their relationships</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-yellow-500/30 shadow-lg">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-semibold">AI Generated</span>
            </div>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div className="relative bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Controls Panel */}
          <div className="absolute top-6 right-6 z-10 flex flex-col space-y-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
              <button
                onClick={handleZoomIn}
                className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 rounded-xl border border-white/20 transition-all duration-300 group mb-2"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-white group-hover:scale-125 transition-transform" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 rounded-xl border border-white/20 transition-all duration-300 group mb-2"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-white group-hover:scale-125 transition-transform" />
              </button>
              <button
                onClick={handleReset}
                className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/40 hover:to-emerald-500/40 rounded-xl border border-white/20 transition-all duration-300 group"
                title="Reset View"
              >
                <Maximize2 className="w-5 h-5 text-white group-hover:scale-125 transition-transform" />
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
              <button
                onClick={expandAll}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-xl border border-white/20 transition-all duration-300 mb-2"
                title="Expand All"
              >
                <span className="text-white text-xs font-semibold">Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/40 hover:to-red-500/40 rounded-xl border border-white/20 transition-all duration-300"
                title="Collapse All"
              >
                <span className="text-white text-xs font-semibold">Collapse</span>
              </button>
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-6 right-6 z-10 bg-white/10 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 shadow-xl">
            <span className="text-white text-sm font-bold">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Node count indicator */}
          <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 shadow-xl">
            <span className="text-white text-sm font-medium">
              {expanded.size} / {countTotalNodes(data)} nodes visible
            </span>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className={`w-full h-[700px] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} relative`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            <svg
              ref={svgRef}
              width="3000"
              height="3000"
              viewBox="0 0 3000 3000"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              {/* Enhanced Grid pattern */}
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="rgba(255, 255, 255, 0.15)" />
                </pattern>
                <pattern
                  id="grid-large"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="2" fill="rgba(255, 255, 255, 0.2)" />
                </pattern>
                
                {/* Gradient for connections */}
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.6)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#grid-large)" />

              {/* Connections */}
              {renderConnections(data)}

              {/* Nodes */}
              {renderNode(data)}
            </svg>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">🖱️</span>
              </div>
              <p className="text-white/70 font-medium">Pan Canvas</p>
            </div>
            <p className="text-white font-semibold">Click and drag to move around</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-white/70 font-medium">Zoom Control</p>
            </div>
            <p className="text-white font-semibold">Use buttons to zoom in/out</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-pink-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">📂</span>
              </div>
              <p className="text-white/70 font-medium">Expand Nodes</p>
            </div>
            <p className="text-white font-semibold">Click nodes to show/hide children</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to count total nodes
function countTotalNodes(node: MindMapNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += countTotalNodes(child);
    });
  }
  return count;
}
