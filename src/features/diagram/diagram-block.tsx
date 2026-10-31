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
  Lightbulb,
  X,
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

function splitIntoLines(text: string, maxLineLen = 22): string[] {
  if (text.length <= maxLineLen) return [text];
  const words = text.split(" ");
  if (words.length === 1) return [text.slice(0, 20) + "…"];

  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + " " + word).length <= maxLineLen) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function getNodeMetrics(label: string, shape?: string) {
  const lines = splitIntoLines(label, 22);
  const maxLineLen = Math.max(...lines.map((l) => l.length));

  if (shape === "circle") {
    const r = Math.max(34, Math.min(56, maxLineLen * 3.6 + 12));
    return { type: "circle" as const, r, width: r * 2, height: r * 2, lines };
  }
  if (shape === "diamond") {
    const w = Math.max(100, maxLineLen * 7.5 + 36);
    const h = lines.length > 1 ? 64 : 50;
    return { type: "diamond" as const, w, h, lines };
  }
  // Capsule moderne dynamique multi-lignes qui ne coupe JAMAIS le texte
  const width = Math.max(120, maxLineLen * 7.5 + 34);
  const height = lines.length === 1 ? 40 : lines.length === 2 ? 54 : 68;
  const rx = lines.length === 1 ? 20 : 16;
  return { type: "pill" as const, width, height, rx, lines };
}

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Ajout de nouveau nœud principal
  const handleAddNode = () => {
    const newId = `node_${Date.now().toString(36)}`;
    const newNode: DiagramNode = {
      id: newId,
      label: `Nouveau concept ${nodes.length + 1}`,
      category: "Concept Clé",
      description: "Définissez ici l'enjeu principal, les exemples et les liens méthodologiques.",
      color: "#0ea5e9",
      x: 400 + (Math.random() - 0.5) * 140,
      y: 240 + (Math.random() - 0.5) * 100,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  // Brancher directement une sous-idée depuis une bulle existante
  const handleAddChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const childId = `node_${Date.now().toString(36)}`;
    const existingChildren = edges.filter((e) => e.from === parentId).length;
    const offsetX = (existingChildren % 2 === 0 ? 1 : -1) * (110 + existingChildren * 35);
    const newX = Math.max(90, Math.min(710, parent.x + offsetX));
    const newY = Math.min(440, parent.y + 110);

    const newNode: DiagramNode = {
      id: childId,
      label: `Sous-idée ${nodes.length + 1}`,
      category: "Sous-concept",
      description: `Sous-thématique rattachée à « ${parent.label} ». Développez les arguments clés et définitions ici.`,
      color: parent.color || "#0ea5e9",
      x: newX,
      y: newY,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { from: parentId, to: childId, style: "solid" }]);
    setSelectedNodeId(childId);
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
        const dy = target.y - source.y;
        const cpY1 = source.y + dy * 0.45;
        const cpY2 = target.y - dy * 0.45;
        const pathD = source.x === target.x
          ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
          : `M ${source.x} ${source.y} C ${source.x} ${cpY1}, ${target.x} ${cpY2}, ${target.x} ${target.y}`;
        const labelText = edge.label
          ? `<text x="${(source.x + target.x) / 2}" y="${(source.y + target.y) / 2 - 6}" text-anchor="middle" fill="#64748b" font-size="10" font-family="sans-serif">${escapeXml(edge.label)}</text>`
          : "";
        return `<g>
    <path d="${pathD}" fill="none" stroke="#64748b" stroke-width="2.5"${strokeDash} />
    ${labelText}
  </g>`;
      })
      .join("\n  ");

    const nodeElements = nodes
      .map((node) => {
        const fill = node.color || "#0ea5e9";
        const label = escapeXml(node.label);
        const metrics = getNodeMetrics(node.label, node.shape);
        let shapeSvg = "";
        if (metrics.type === "circle") {
          shapeSvg = `<circle r="${metrics.r}" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        } else if (metrics.type === "diamond") {
          shapeSvg = `<polygon points="0,-${metrics.h / 2} ${metrics.w / 2},0 0,${metrics.h / 2} -${metrics.w / 2},0" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        } else {
          shapeSvg = `<rect x="-${metrics.width / 2}" y="-${metrics.height / 2}" width="${metrics.width}" height="${metrics.height}" rx="${metrics.rx}" fill="${fill}" stroke="#ffffff" stroke-width="2" />`;
        }

        const textLines = metrics.lines.map((l, i) => `<tspan x="0" dy="${i === 0 ? -(metrics.lines.length - 1) * 6.5 : 13}">${escapeXml(l)}</tspan>`).join("");
        return `<g transform="translate(${node.x},${node.y})">
    ${shapeSvg}
    <text y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">${textLines}</text>
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAnimated(!isAnimated)}
              title="Activer/Désactiver les flux animés"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-all border-none",
                isAnimated
                  ? "bg-sky-500/15 text-sky-400 font-semibold shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <span>{isAnimated ? "Flux animé" : "Statique"}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoOrganize}
              title="Organiser automatiquement les nœuds"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-800/60 px-3 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all border-none"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Réorganiser</span>
            </button>

            <button
              type="button"
              onClick={handleAddNode}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-sky-500/20 px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/30 transition-all border-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter nœud</span>
            </button>

            {/* Zoom */}
            <div className="flex items-center rounded-xl bg-slate-800/60 px-1 py-0.5 border-none">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
                className="p-1 hover:text-white text-slate-400 transition-colors"
                title="Zoom arrière"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] px-1.5 text-slate-300 font-mono">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.15) * 100) / 100))}
                className="p-1 hover:text-white text-slate-400 transition-colors"
                title="Zoom avant"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Espace de dessin SVG interactif */}
        <div className="relative overflow-hidden rounded-2xl border-none bg-transparent flex items-center justify-center p-0 min-h-[380px]">
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>

              {/* Lueur de sélection */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Arêtes / Relations avec courbes douces */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isDashed = edge.style === "dashed";
              const isAnim = isAnimated || edge.style === "animated";
              const dy = toNode.y - fromNode.y;
              const cpY1 = fromNode.y + dy * 0.45;
              const cpY2 = toNode.y - dy * 0.45;
              const pathD = fromNode.x === toNode.x
                ? `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`
                : `M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${cpY1}, ${toNode.x} ${cpY2}, ${toNode.x} ${toNode.y}`;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2.5"
                    strokeDasharray={isDashed ? "5,5" : undefined}
                    className={cn(isAnim && "transition-all")}
                  />
                  {edge.label && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 6}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      className="px-1 font-medium select-none pointer-events-none fill-slate-400"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nœuds interactifs : capsules adaptatives sans coupure de texte */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const fill = node.color || (isSelected ? "#0284c7" : "#0ea5e9");
              const metrics = getNodeMetrics(node.label, node.shape);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                  className="cursor-grab active:cursor-grabbing transition-transform"
                  filter={isSelected ? "url(#glow)" : undefined}
                >
                  {metrics.type === "circle" ? (
                    <circle
                      r={metrics.r}
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                  ) : metrics.type === "diamond" ? (
                    <polygon
                      points={`0,-${metrics.h / 2} ${metrics.w / 2},0 0,${metrics.h / 2} -${metrics.w / 2},0`}
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                  ) : (
                    <rect
                      x={-metrics.width / 2}
                      y={-metrics.height / 2}
                      width={metrics.width}
                      height={metrics.height}
                      rx={metrics.rx}
                      fill={fill}
                      stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.25)"}
                      strokeWidth={isSelected ? "2.5" : "1"}
                      className="drop-shadow-lg"
                    />
                  )}

                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    className="select-none pointer-events-none drop-shadow-sm font-sans"
                  >
                    {metrics.lines.map((line, idx) => (
                      <tspan
                        key={idx}
                        x="0"
                        dy={idx === 0 ? -(metrics.lines.length - 1) * 6.5 : 13}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {/* Boutons d'action rapides sur la bulle sélectionnée */}
                  {isSelected ? (
                    <g transform={`translate(0, ${(metrics.height ?? 50) / 2 + 15})`}>
                      {/* Bouton + Sous-idée */}
                      <g
                        transform="translate(-46, 0)"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleAddChildNode(node.id);
                        }}
                        className="cursor-pointer hover:scale-105 transition-transform"
                      >
                        <rect
                          x="-42"
                          y="-11"
                          width="84"
                          height="22"
                          rx="11"
                          fill="#0284c7"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="drop-shadow-md"
                        />
                        <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="700">
                          + Sous-idée
                        </text>
                      </g>

                      {/* Bouton Détails / Approfondir */}
                      <g
                        transform="translate(46, 0)"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setIsDrawerOpen(true);
                        }}
                        className="cursor-pointer hover:scale-105 transition-transform"
                      >
                        <rect
                          x="-42"
                          y="-11"
                          width="84"
                          height="22"
                          rx="11"
                          fill="#1e293b"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1.2"
                          className="drop-shadow-md"
                        />
                        <text y="4" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">
                          Détails ↗
                        </text>
                      </g>
                    </g>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Panel / Drawer latéral rétractable d'approfondissement (fermé par défaut) */}
        {isDrawerOpen && selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
            <aside className="w-full max-w-md h-auto max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border border-slate-800 animate-in slide-in-from-right duration-250 space-y-5">
              <div className="space-y-5">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: selectedNode.color || "#0ea5e9" }}
                    />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                        Fiche Concept · {selectedNode.category || "Notion"}
                      </span>
                      <h4 className="text-lg font-bold text-white leading-snug">
                        {selectedNode.label}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Fermer le panneau"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Formulaire & Contenu approfondi */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Titre de la notion
                    </label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, label: val } : n)));
                      }}
                      className="w-full rounded-xl bg-slate-800/80 px-3.5 py-2.5 text-sm text-white font-medium outline-none focus:ring-1 focus:ring-sky-500 border-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Approfondissement & Analyse détaillée
                    </label>
                    <textarea
                      rows={4}
                      value={selectedNode.description || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, description: val } : n)));
                      }}
                      placeholder="Rédigez les définitions, arguments et cas d'usage académiques..."
                      className="w-full rounded-xl bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-sky-500 border-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Palette de couleurs */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Thème couleur du concept
                    </label>
                    <div className="flex items-center gap-2.5 pt-1">
                      {["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, color: col } : n)))}
                          className={cn(
                            "h-7 w-7 rounded-full transition-transform border-2",
                            selectedNode.color === col
                              ? "scale-115 border-white shadow-md ring-2 ring-sky-400/40"
                              : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                          )}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Synthèse pédagogique */}
                  <div className="rounded-xl bg-slate-800/50 p-4">
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-400">
                      <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>À retenir pour l'examen</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedNode.description || "Cette notion est centrale dans la démarche. Vous pouvez créer des sous-branches pour illustrer vos démonstrations."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions du bas */}
              <div className="pt-5 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleAddChildNode(selectedNode.id);
                    setIsDrawerOpen(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/20 py-2.5 px-3 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-all border-none"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>+ Brancher une sous-idée</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 p-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-all border-none"
                  title="Supprimer ce nœud"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        )}

        <p className="mt-2 text-center text-[11px] text-faint">
          Astuce : Glissez les nœuds pour ajuster la disposition · Cliquez sur un nœud pour modifier son texte ou sa couleur.
        </p>
      </div>
    </div>
  );
}
