'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Share2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Folder as FolderIcon,
  ExternalLink,
  Loader2,
  Layers,
  Filter,
  Plus,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface GraphNode {
  id: string;
  title: string;
  summary: string;
  noteType: string;
  folderName: string;
  folderColor: string;
  tags: string[];
  updatedAt: string;
  connections: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  context?: string | null;
}

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState({ totalNotes: 0, totalRelationships: 0, isolatedNotes: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showIsolatedOnly, setShowIsolatedOnly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Connect dialog state
  const [isConnecting, setIsConnecting] = useState(false);
  const [targetConnectId, setTargetConnectId] = useState('');
  const [relationshipType, setRelationshipType] = useState('references');

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchGraphData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/graph');
      const data = res.data?.data;
      if (data) {
        // Initialize 2D coordinates in circular/random layout
        const width = 800;
        const height = 600;
        const initializedNodes = (data.nodes || []).map((n: GraphNode, i: number) => {
          const angle = (i / (data.nodes.length || 1)) * 2 * Math.PI;
          const radius = 180 + Math.random() * 100;
          return {
            ...n,
            x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
            y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
          };
        });

        setNodes(initializedNodes);
        setEdges(data.edges || []);
        setStats(data.stats || { totalNotes: 0, totalRelationships: 0, isolatedNotes: 0 });
      }
    } catch (err) {
      toast.error('Failed to load knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (showIsolatedOnly && node.connections > 0) return false;
      if (selectedFolder !== 'all' && node.folderName !== selectedFolder) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          node.title.toLowerCase().includes(q) ||
          node.summary?.toLowerCase().includes(q) ||
          node.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [nodes, showIsolatedOnly, selectedFolder, searchQuery]);

  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map((n) => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [edges, filteredNodeIds]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Unique Folders
  const folderNames = useMemo(() => {
    const set = new Set<string>();
    nodes.forEach((n) => {
      if (n.folderName) set.add(n.folderName);
    });
    return Array.from(set);
  }, [nodes]);

  // Handle Dragging Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'circle' && (e.target as HTMLElement).tagName !== 'text') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCreateRelationship = async () => {
    if (!selectedNode || !targetConnectId) {
      toast.error('Please select a target note to connect');
      return;
    }

    try {
      await axios.post('/api/graph', {
        sourceNoteId: selectedNode.id,
        targetNoteId: targetConnectId,
        relationshipType,
      });
      toast.success('Relationship created!');
      setIsConnecting(false);
      fetchGraphData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create relationship');
    }
  };

  const getNodeColor = (folderName: string, isSelected: boolean) => {
    if (isSelected) return '#3B82F6'; // active blue
    const colors: Record<string, string> = {
      Research: '#8B5CF6',
      Computer: '#10B981',
      Meeting: '#F59E0B',
      Personal: '#EC4899',
      Ideas: '#06B6D4',
    };
    for (const key in colors) {
      if (folderName.toLowerCase().includes(key.toLowerCase())) return colors[key];
    }
    return '#6366F1'; // default indigo
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs shrink-0">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Folders</option>
            {folderNames.map((fn) => (
              <option key={fn} value={fn}>
                📁 {fn}
              </option>
            ))}
          </select>

          <Button
            variant={showIsolatedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowIsolatedOnly(!showIsolatedOnly)}
            className="h-9 text-xs gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Isolated ({stats.isolatedNotes})
          </Button>
        </div>

        {/* Zoom Controls & Stats */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground mr-2 hidden md:inline">
            {filteredNodes.length} nodes • {filteredEdges.length} links
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="flex-1 relative bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-card/80 backdrop-blur-xs z-20">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            <p className="text-sm font-medium">Constructing interactive knowledge graph...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Share2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold">No notes available for graph</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Create notes and connect them using tags or internal references [[Note Title]] to visualize knowledge clusters.
            </p>
            <Link href="/dashboard/new">
              <Button size="sm">Create First Note</Button>
            </Link>
          </div>
        ) : null}

        {/* SVG Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} select-none`}
        >
          <svg className="w-full h-full">
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              className="transition-transform duration-75"
            >
              {/* Background Grid Pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.04"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#grid)" />

              {/* Render Edges (Links) */}
              {filteredEdges.map((edge) => {
                const s = nodeMap.get(edge.source);
                const t = nodeMap.get(edge.target);
                if (!s || !t || s.x === undefined || t.x === undefined) return null;

                const isConnectedToSelected =
                  selectedNode && (s.id === selectedNode.id || t.id === selectedNode.id);

                return (
                  <line
                    key={edge.id}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isConnectedToSelected ? '#3B82F6' : 'currentColor'}
                    strokeOpacity={isConnectedToSelected ? 0.8 : 0.15}
                    strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                    strokeDasharray={edge.type === 'references' ? '4 2' : 'none'}
                  />
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                if (node.x === undefined || node.y === undefined) return null;
                const isSelected = selectedNode?.id === node.id;
                const radius = Math.min(28, Math.max(14, 14 + node.connections * 2));
                const fillColor = getNodeColor(node.folderName, isSelected);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Outer Glow on hover / selected */}
                    <circle
                      r={radius + (isSelected ? 6 : 3)}
                      fill={fillColor}
                      fillOpacity={isSelected ? 0.3 : 0.08}
                      className="transition-all duration-200 group-hover:scale-125"
                    />

                    {/* Main Node Circle */}
                    <circle
                      r={radius}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="shadow-md transition-transform duration-200 group-hover:scale-110"
                    />

                    {/* Node Title Label */}
                    <text
                      y={radius + 14}
                      textAnchor="middle"
                      className={`text-[11px] font-medium pointer-events-none transition-colors ${
                        isSelected
                          ? 'fill-primary font-bold text-xs'
                          : 'fill-foreground/80 group-hover:fill-primary'
                      }`}
                    >
                      {node.title.length > 18 ? node.title.slice(0, 16) + '...' : node.title}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 sm:w-96 bg-card/95 backdrop-blur-md p-5 rounded-2xl border border-border shadow-xl z-30 space-y-4 max-h-[85%] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  📁 {selectedNode.folderName}
                </span>
                <h3 className="font-bold text-lg text-foreground mt-1 leading-snug">
                  {selectedNode.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Summary Preview
              </label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedNode.summary || 'No summary generated yet.'}
              </p>
            </div>

            {/* Tags */}
            {selectedNode.tags.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
              <span>{selectedNode.connections} connection{selectedNode.connections === 1 ? '' : 's'}</span>
              <span>Updated {formatDate(new Date(selectedNode.updatedAt))}</span>
            </div>

            {/* Connect to Another Note Modal */}
            {isConnecting ? (
              <div className="bg-muted/50 p-3 rounded-xl border border-border space-y-2">
                <label className="text-xs font-semibold">Connect &quot;{selectedNode.title}&quot; to:</label>
                <select
                  value={targetConnectId}
                  onChange={(e) => setTargetConnectId(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="">Select Target Note...</option>
                  {nodes
                    .filter((n) => n.id !== selectedNode.id)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title}
                      </option>
                    ))}
                </select>

                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="references">References</option>
                  <option value="related_to">Related To</option>
                  <option value="depends_on">Depends On</option>
                  <option value="contradicts">Contradicts</option>
                  <option value="part_of">Part Of</option>
                </select>

                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" onClick={handleCreateRelationship} className="h-7 text-xs flex-1">
                    Create Link
                  </Button>
                  <button
                    onClick={() => setIsConnecting(false)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Link href={`/dashboard/notes/${selectedNode.id}`} className="flex-1">
                <Button size="sm" className="w-full gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Editor
                </Button>
              </Link>
              {!isConnecting && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConnecting(true)}
                  className="text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Link
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

