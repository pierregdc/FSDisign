"use client";

import { useMemo, useRef, useState } from "react";
import {
  Copy,
  Cpu,
  GitBranch,
  Layers,
  Network,
  Plus,
  RotateCcw,
  Trash2,
  Workflow,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot, type ViewportMode } from "@/features/canva";
import { cn } from "@/lib/utils";

type DiagramBlockData = Extract<UIBlock, { type: "diagram" }>;

type DiagramNode = DiagramBlockData["nodes"][number] & {
  x: number;
  y: number;
};

type DiagramEdge = NonNullable<DiagramBlockData["edges"]>[number];

export function DiagramBlockView({ block }: { block: DiagramBlockData }) {
  // Calcul initial des positions selon le type de diagramme
  const initialNodes = useMemo(() => {
    const total = block.nodes.length;
    const isMindmap = block.diagramType === "mindmap" || block.diagramType === "concept";

    return block.nodes.map((node, i) => {
      if (typeof node.x === "number" && typeof node.y === "number") {
        return { ...node, x: node.x, y: node.y };
      }

      if (isMindmap) {
        if (i === 0) return { ...node, x: 400, y: 250 };
        const remaining = total - 1;
        const angle = ((i - 1) / remaining) * 2 * Math.PI - Math.PI / 2;
        let rx = 220;
        let ry = 155;
        if (remaining > 16) {
          const tier = (i - 1) % 3;
          rx = tier === 0 ? 165 : tier === 1 ? 250 : 330;
          ry = tier === 0 ? 110 : tier === 1 ? 165 : 215;
        } else if (remaining > 8) {
          const tier = (i - 1) % 2;
          rx = tier === 0 ? 175 : 270;
          ry = tier === 0 ? 120 : 180;
        }
        return {
          ...node,
          x: Math.round(400 + rx * Math.cos(angle)),
          y: Math.round(250 + ry * Math.sin(angle)),
        };
      }

      // Par défaut : disposition en flux hiérarchique / réseau / séquence
      const cols = Math.min(4, Math.ceil(Math.sqrt(total * 1.5)));
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        ...node,
        x: 120 + col * 200,
        y: 80 + row * 120,
      };
    });
  }, [block.nodes, block.diagramType]);

  const [nodes, setNodes] = useState<DiagramNode[]>(initialNodes);
  const [edges, setEdges] = useState<DiagramEdge[]>(block.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(Boolean(block.animated ?? true));
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Déplacement à la souris (Drag & Drop)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Conversion précise des coordonnées d'écran vers l'espace viewBox SVG 800x500
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(460, y)) } : n))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignorer
      }
    }
  };

  // Réorganisation automatique
  const handleAutoOrganize = () => {
    const isMindmap = block.diagramType === "mindmap" || block.diagramType === "concept";
    const total = nodes.length;

    setNodes((prev) =>
      prev.map((node, i) => {
        if (isMindmap) {
          if (i === 0) return { ...node, x: 400, y: 250 };
          const remaining = total - 1;
          const angle = ((i - 1) / remaining) * 2 * Math.PI - Math.PI / 2;
          let rx = 220;
          let ry = 155;
          if (remaining > 16) {
            const tier = (i - 1) % 3;
            rx = tier === 0 ? 165 : tier === 1 ? 250 : 330;
            ry = tier === 0 ? 110 : tier === 1 ? 165 : 215;
          } else if (remaining > 8) {
            const tier = (i - 1) % 2;
            rx = tier === 0 ? 175 : 270;
            ry = tier === 0 ? 120 : 180;
          }
          return {
            ...node,
            x: Math.round(400 + rx * Math.cos(angle)),
            y: Math.round(250 + ry * Math.sin(angle)),
          };
        }
        const cols = Math.min(4, Math.ceil(Math.sqrt(total * 1.5)));
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          ...node,
          x: 120 + col * 200,
          y: 80 + row * 120,
        };
      })
    );
  };

  // Ajout de nouveau nœud / branche
  const handleAddNode = () => {
    const newId = `node_${Date.now().toString(36)}`;
    const parentNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
    const newNode: DiagramNode = {
      id: newId,
      label: `Nœud ${nodes.length + 1}`,
      x: parentNode ? Math.min(720, parentNode.x + 80) : 400,
      y: parentNode ? Math.min(440, parentNode.y + 60) : 250,
      color: "#0139b7",
      shape: "round",
    };

    setNodes([...nodes, newNode]);
    if (parentNode) {
      setEdges([
        ...edges,
        {
          from: parentNode.id,
          to: newId,
          label: "Lien",
          arrow: true,
          style: "solid",
        },
      ]);
    }
    setSelectedNodeId(newId);
  };

  // Suppression du nœud sélectionné
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes(nodes.filter((n) => n.id !== selectedNodeId));
    setEdges(edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Duplication
  const handleDuplicateSelected = () => {
    const target = nodes.find((n) => n.id === selectedNodeId);
    if (!target) return;
    const copyId = `copy_${Date.now().toString(36)}`;
    const copyNode: DiagramNode = {
      ...target,
      id: copyId,
      label: `${target.label} (copie)`,
      x: Math.min(740, target.x + 40),
      y: Math.min(450, target.y + 40),
    };
    setNodes([...nodes, copyNode]);
    setSelectedNodeId(copyId);
  };

  // Génération du SVG pour export réel avec formes et flèches complètes
  const generatedSvgString = useMemo(() => {
    const escapeXml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edgePaths = edges
      .map((edge) => {
        const source = nodeMap.get(edge.from);
        const target = nodeMap.get(edge.to);
        if (!source || !target) return "";
        const isDashed = edge.style === "dashed";
        const strokeDash = isDashed ? ' stroke-dasharray="5,5"' : "";
        const labelText = edge.label
          ? `<text x="${(source.x + target.x) / 2}" y="${(source.y + target.y) / 2 - 6}" text-anchor="middle" fill="#64748b" font-size="10" font-family="sans-serif">${escapeXml(edge.label)}</text>`
          : "";
        return `<g>
    <line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#94a3b8" stroke-width="2"${strokeDash} marker-end="url(#arrow)" />
    ${labelText}
  </g>`;
      })
      .join("\n  ");

    const nodeElements = nodes
      .map((node) => {
        const fill = node.color || "#0139b7";
        const label = escapeXml(node.label.length > 14 ? node.label.slice(0, 13) + "…" : node.label);
        let shapeSvg = `<circle r="28" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        if (node.shape === "rect") {
          shapeSvg = `<rect x="-55" y="-24" width="110" height="48" rx="8" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        } else if (node.shape === "diamond") {
          shapeSvg = `<polygon points="0,-30 45,0 0,30 -45,0" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        }

        return `<g transform="translate(${node.x},${node.y})">
    ${shapeSvg}
    <text y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">${label}</text>
  </g>`;
      })
      .join("\n  ");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" style="background:#ffffff">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
  ${edgePaths}
  ${nodeElements}
</svg>`;
  }, [nodes, edges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const getDiagramIcon = () => {
    switch (block.diagramType) {
      case "mindmap":
      case "concept":
        return <GitBranch className="h-4 w-4 text-accent" />;
      case "network":
        return <Network className="h-4 w-4 text-emerald-600" />;
      case "architecture":
        return <Layers className="h-4 w-4 text-indigo-600" />;
      case "circuit":
        return <Cpu className="h-4 w-4 text-amber-600" />;
      case "sequence":
      case "process":
      case "flowchart":
      default:
        return <Workflow className="h-4 w-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
      <CanvaToolbar
        title={block.title || `Diagramme (${block.diagramType})`}
        svgCode={generatedSvgString}
        jsonData={{ type: "diagram", diagramType: block.diagramType, nodes, edges }}
        htmlContent={`<div class="max-w-4xl mx-auto space-y-4">
          <div class="text-center">
            <h2 class="text-xl font-bold">${block.title || `Diagramme (${block.diagramType})`}</h2>
            <p class="text-xs text-slate-500">${block.description || ""}</p>
          </div>
          <div class="rounded-xl border border-slate-200 p-4 bg-white flex justify-center">
            ${generatedSvgString}
          </div>
        </div>`}
        viewport={viewport}
        onChangeViewport={setViewport}
        versions={versions}
        onSaveVersion={(name) =>
          setVersions([{ id: crypto.randomUUID(), name, timestamp: Date.now(), data: { nodes, edges } }, ...versions])
        }
        onRestoreVersion={(v) => {
          const d = v.data as { nodes: DiagramNode[]; edges: DiagramEdge[] };
          if (d?.nodes) setNodes(d.nodes);
          if (d?.edges) setEdges(d.edges);
        }}
      />

      {/* Conteneur principal du Diagramme */}
      <div className="rounded-2xl border-0 bg-transparent p-0 sm:p-1 shadow-none">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              {getDiagramIcon()}
              <span>{block.title || `Diagramme intelligent (${block.diagramType})`}</span>
            </h3>
            {block.description && (
              <p className="mt-0.5 text-xs text-muted leading-relaxed">{block.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAnimated(!isAnimated)}
              title="Activer/Désactiver les flux animés"
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors",
                isAnimated
                  ? "border-accent/30 bg-accent/10 text-accent font-semibold"
                  : "border-line bg-panel text-muted hover:text-ink"
              )}
            >
              <span>{isAnimated ? "Flux animé" : "Statique"}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoOrganize}
              title="Organiser automatiquement les nœuds"
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-panel px-2.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Réorganiser</span>
            </button>

            <button
              type="button"
              onClick={handleAddNode}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-accent/10 border border-accent/20 px-2.5 text-[11px] font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Ajouter nœud</span>
            </button>

            {/* Zoom */}
            <div className="flex items-center border border-line rounded-lg bg-panel">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
                className="p-1 hover:text-ink text-muted"
                title="Zoom arrière"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] px-1 text-faint font-mono">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.15) * 100) / 100))}
                className="p-1 hover:text-ink text-muted"
                title="Zoom avant"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Espace de dessin SVG interactif */}
        <div className="relative overflow-hidden rounded-xl border-0 bg-transparent flex items-center justify-center p-0 min-h-[350px]">
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: draggingNodeId ? "none" : "transform 0.2s ease-out",
            }}
            className="w-full h-auto max-h-[500px] select-none cursor-crosshair touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <marker
                id="diagram-arrow"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>

              {/* Lueur de sélection */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0139b7" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Arêtes / Relations */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isDashed = edge.style === "dashed";
              const isAnim = isAnimated || edge.style === "animated";

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray={isDashed ? "5,5" : undefined}
                    markerEnd="url(#diagram-arrow)"
                    className={cn(isAnim && "animate-pulse")}
                  />
                  {edge.label && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 6}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      className="bg-card px-1 font-medium select-none pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nœuds interactifs */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const fill = node.color || (isSelected ? "#0139b7" : "#3b82f6");

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                  className="cursor-grab active:cursor-grabbing transition-transform"
                  filter={isSelected ? "url(#glow)" : undefined}
                >
                  {node.shape === "rect" ? (
                    <rect
                      x="-52"
                      y="-22"
                      width="104"
                      height="44"
                      rx="10"
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "#cbd5e1"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                  ) : node.shape === "diamond" ? (
                    <polygon
                      points="0,-30 45,0 0,30 -45,0"
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "#cbd5e1"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                  ) : (
                    <circle
                      r="28"
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "#cbd5e1"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                  )}

                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                    className="select-none pointer-events-none drop-shadow-sm font-sans"
                  >
                    {node.label.length > 17 ? node.label.slice(0, 16) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Panneau d'édition du nœud sélectionné */}
        {selectedNode && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-panel p-3 border border-line text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Nœud sélectionné :</span>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => {
                  const val = e.target.value;
                  setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, label: val } : n)));
                }}
                className="rounded-md border border-line bg-card px-2 py-1 text-xs text-ink outline-none focus:border-accent w-44"
              />
              <input
                type="color"
                value={selectedNode.color || "#0139b7"}
                onChange={(e) => {
                  const col = e.target.value;
                  setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, color: col } : n)));
                }}
                title="Couleur du nœud"
                className="h-6 w-7 cursor-pointer rounded border border-line p-0 bg-transparent"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDuplicateSelected}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2 py-1 text-[11px] text-muted hover:text-ink transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>Dupliquer</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-2 text-center text-[11px] text-faint">
          Astuce : Glissez les nœuds pour ajuster la disposition · Cliquez sur un nœud pour modifier son texte ou sa couleur.
        </p>
      </div>
    </div>
  );
}
