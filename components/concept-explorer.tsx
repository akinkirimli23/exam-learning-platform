'use client';

import {
  ChevronDown,
  ChevronRight,
  Expand,
  Lightbulb,
  Maximize2,
  Move,
  Network,
  TriangleAlert,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { flattenConceptNodes, type ConceptNode } from '@/shared/topic-engine';

const NODE_WIDTH = 218;
const NODE_HEIGHT = 72;
const COLUMN_GAP = 108;
const ROW_GAP = 24;
const CANVAS_MARGIN = 56;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.45;

type PositionedNode = {
  node: ConceptNode;
  x: number;
  y: number;
  depth: number;
  branch: number;
  parentId?: string;
};

type Layout = {
  nodes: PositionedNode[];
  edges: Array<{ from: PositionedNode; to: PositionedNode }>;
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
};

function createLayout(root: ConceptNode, expandedIds: Set<string>): Layout {
  const pressureMap = root.id === 'pressure';
  const nodeWidth = pressureMap ? 228 : NODE_WIDTH;
  const nodeHeight = pressureMap ? 52 : NODE_HEIGHT;
  const columnGap = pressureMap ? 76 : COLUMN_GAP;
  const rowGap = pressureMap ? 8 : ROW_GAP;
  const margin = pressureMap ? 26 : CANVAS_MARGIN;
  let row = 0;
  let deepest = 0;

  type TreePosition = PositionedNode & { visibleChildren: TreePosition[] };

  function place(
    concept: ConceptNode,
    depth: number,
    branch: number,
    parentId?: string,
  ): TreePosition {
    deepest = Math.max(deepest, depth);
    const visibleChildren = expandedIds.has(concept.id)
      ? concept.children.map((child, index) =>
          place(child, depth + 1, depth === 0 ? index : branch, concept.id),
        )
      : [];
    const y = visibleChildren.length
      ? (visibleChildren[0].y + visibleChildren[visibleChildren.length - 1].y) / 2
      : margin + row++ * (nodeHeight + rowGap);

    return {
      node: concept,
      x: margin + depth * (nodeWidth + columnGap),
      y,
      depth,
      branch,
      parentId,
      visibleChildren,
    };
  }

  const tree = place(root, 0, -1);
  const nodes: PositionedNode[] = [];
  const edges: Layout['edges'] = [];

  function collect(current: TreePosition) {
    const { visibleChildren: _children, ...positioned } = current;
    nodes.push(positioned);
    current.visibleChildren.forEach((child) => {
      const { visibleChildren: _grandchildren, ...childPositioned } = child;
      edges.push({ from: positioned, to: childPositioned });
      collect(child);
    });
  }

  collect(tree);

  return {
    nodes,
    edges,
    width: margin * 2 + (deepest + 1) * nodeWidth + deepest * columnGap,
    height: Math.max(pressureMap ? 0 : 520, margin * 2 + row * nodeHeight + Math.max(0, row - 1) * rowGap),
    nodeWidth,
    nodeHeight,
  };
}

function buildParentMap(root: ConceptNode) {
  const parents = new Map<string, string>();
  const visit = (node: ConceptNode) => {
    node.children.forEach((child) => {
      parents.set(child.id, node.id);
      visit(child);
    });
  };
  visit(root);
  return parents;
}

function getNodePath(nodeId: string, nodeById: Map<string, ConceptNode>, parentById: Map<string, string>) {
  const path: ConceptNode[] = [];
  let currentId: string | undefined = nodeId;
  while (currentId) {
    const current = nodeById.get(currentId);
    if (current) path.unshift(current);
    currentId = parentById.get(currentId);
  }
  return path;
}

export function ConceptExplorer({ conceptMap }: { conceptMap: ConceptNode }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([conceptMap.id]),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(conceptMap.id);
  const [scale, setScale] = useState(0.75);
  const [pan, setPan] = useState({ x: 36, y: 36 });
  const [fitRequest, setFitRequest] = useState(0);
  const [dragging, setDragging] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragRef = useRef({ pointerId: -1, startX: 0, startY: 0, panX: 0, panY: 0 });

  const allNodes = useMemo(() => flattenConceptNodes(conceptMap), [conceptMap]);
  const nodeById = useMemo(() => new Map(allNodes.map((item) => [item.id, item])), [allNodes]);
  const parentById = useMemo(() => buildParentMap(conceptMap), [conceptMap]);
  const layout = useMemo(() => createLayout(conceptMap, expandedIds), [conceptMap, expandedIds]);
  const layoutRef = useRef(layout);
  const selectedNode = selectedId ? nodeById.get(selectedId) ?? null : null;
  const selectedPath = selectedNode
    ? getNodePath(selectedNode.id, nodeById, parentById)
    : [];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    setExpandedIds(new Set([conceptMap.id]));
    setSelectedId(null);
    setActiveId(conceptMap.id);
  }, [conceptMap]);

  const closeExplorer = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeExplorer();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeExplorer, open]);

  const fitMap = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const currentLayout = layoutRef.current;
    const availableWidth = Math.max(280, viewport.clientWidth - 72);
    const availableHeight = Math.max(280, viewport.clientHeight - 72);
    const nextScale = Math.min(1, availableWidth / currentLayout.width, availableHeight / currentLayout.height);
    const boundedScale = Math.max(
      conceptMap.id === 'pressure' ? (viewport.clientWidth < 760 ? 0.72 : 0.16) : MIN_SCALE,
      nextScale,
    );
    setScale(boundedScale);
    setPan({
      x: conceptMap.id === 'pressure' && viewport.clientWidth < 760
        ? 12 : Math.max(28, (viewport.clientWidth - currentLayout.width * boundedScale) / 2),
      y: conceptMap.id === 'pressure' && viewport.clientWidth < 760
        ? 12 : Math.max(28, (viewport.clientHeight - currentLayout.height * boundedScale) / 2),
    });
  }, [conceptMap.id]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(fitMap);
    return () => window.cancelAnimationFrame(frame);
  }, [fitMap, fitRequest, open]);

  useEffect(() => {
    if (!open) return;
    const handleResize = () => fitMap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMap, open]);

  const requestFit = () => setFitRequest((value) => value + 1);

  const toggleNode = (nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const focusNode = (nodeId: string) => {
    setActiveId(nodeId);
    window.requestAnimationFrame(() => nodeRefs.current.get(nodeId)?.focus());
  };

  const revealNode = (nodeId: string) => {
    const ancestors: string[] = [];
    let current = parentById.get(nodeId);
    while (current) {
      ancestors.push(current);
      current = parentById.get(current);
    }
    setExpandedIds((ids) => new Set([...ids, ...ancestors]));
    setSelectedId(nodeId);
    focusNode(nodeId);
  };

  const handleNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: PositionedNode) => {
    const index = layout.nodes.findIndex((candidate) => candidate.node.id === item.node.id);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      const next = layout.nodes[Math.max(0, Math.min(layout.nodes.length - 1, index + offset))];
      focusNode(next.node.id);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusNode(event.key === 'Home' ? layout.nodes[0].node.id : layout.nodes.at(-1)!.node.id);
    } else if (event.key === 'ArrowRight' && item.node.children.length) {
      event.preventDefault();
      if (!expandedIds.has(item.node.id)) toggleNode(item.node.id);
      else focusNode(item.node.children[0].id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (expandedIds.has(item.node.id) && item.node.children.length) toggleNode(item.node.id);
      else if (item.parentId) focusNode(item.parentId);
    }
  };

  const changeScale = (amount: number) => {
    const minimum = conceptMap.id === 'pressure' ? 0.16 : MIN_SCALE;
    setScale((current) => Math.min(MAX_SCALE, Math.max(minimum, current + amount)));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      changeScale(event.deltaY > 0 ? -0.08 : 0.08);
      return;
    }
    setPan((current) => ({ x: current.x - event.deltaX, y: current.y - event.deltaY }));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging || dragRef.current.pointerId !== event.pointerId) return;
    setPan({
      x: dragRef.current.panX + event.clientX - dragRef.current.startX,
      y: dragRef.current.panY + event.clientY - dragRef.current.startY,
    });
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    setDragging(false);
    dragRef.current.pointerId = -1;
  };

  const openExplorer = () => {
    setOpen(true);
    requestFit();
  };

  const expandAll = () => {
    setExpandedIds(new Set(allNodes.filter((item) => item.children.length).map((item) => item.id)));
    if (conceptMap.id !== 'pressure') requestFit();
  };

  const showMainBranches = () => {
    setExpandedIds(new Set([conceptMap.id]));
    setActiveId(conceptMap.id);
    requestFit();
  };

  const modal = open ? (
    <div className="concept-modal" role="presentation">
      <section
        ref={dialogRef}
        className="concept-shell"
        data-topic={conceptMap.id}
        role="dialog"
        aria-modal="true"
        aria-labelledby="concept-map-title"
      >
        <header className="concept-header">
          <div className="concept-heading-mark" aria-hidden="true"><Network size={22} /></div>
          <div>
            <span>INTERACTIVE CONCEPT EXPLORER</span>
            <h2 id="concept-map-title">{conceptMap.title} Kavram Haritası</h2>
            <p>Bir düğüm seçerek açıklamasını incele; dalları açarak ilişkileri keşfet.</p>
          </div>
          <button ref={closeRef} className="concept-close" onClick={closeExplorer} aria-label="Kavram haritasını kapat">
            <X size={22} />
          </button>
        </header>

        <div className="concept-toolbar" aria-label="Kavram haritası araçları">
          <div className="concept-toolbar-group">
            <button onClick={expandAll}><Expand size={16} /> Tümünü aç</button>
            <button onClick={showMainBranches}><Network size={16} /> Ana dallar</button>
          </div>
          <div className="concept-map-instructions"><Move size={15} /> Sürükle veya kaydır · Ctrl + kaydır ile yakınlaştır</div>
          <div className="concept-toolbar-group concept-zoom-controls">
            <button onClick={() => changeScale(-0.1)} aria-label="Uzaklaştır"><ZoomOut size={17} /></button>
            <output aria-live="polite">%{Math.round(scale * 100)}</output>
            <button onClick={() => changeScale(0.1)} aria-label="Yakınlaştır"><ZoomIn size={17} /></button>
            <button onClick={requestFit} aria-label="Haritayı ekrana sığdır"><Maximize2 size={17} /></button>
          </div>
        </div>

        <div className="concept-workspace">
          <div
            ref={viewportRef}
            className={`concept-viewport${dragging ? ' is-dragging' : ''}`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div
              className="concept-canvas"
              style={{
                width: layout.width,
                height: layout.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              }}
            >
              <svg className="concept-edges" width={layout.width} height={layout.height} aria-hidden="true">
                {layout.edges.map(({ from, to }) => {
                  const startX = from.x + layout.nodeWidth;
                  const startY = from.y + layout.nodeHeight / 2;
                  const endX = to.x;
                  const endY = to.y + layout.nodeHeight / 2;
                  const control = (endX - startX) * 0.48;
                  return (
                    <path
                      key={`${from.node.id}-${to.node.id}`}
                      data-branch={to.branch}
                      data-depth={to.depth}
                      d={`M ${startX} ${startY} C ${startX + control} ${startY}, ${endX - control} ${endY}, ${endX} ${endY}`}
                    />
                  );
                })}
              </svg>

              <div role="tree" aria-label={`${conceptMap.title} kavramları`}>
                {layout.nodes.map((item) => {
                  const hasChildren = item.node.children.length > 0;
                  const isExpanded = expandedIds.has(item.node.id);
                  const isSelected = selectedId === item.node.id;
                  return (
                    <div
                      key={item.node.id}
                      className="concept-node-wrap"
                      data-branch={item.branch}
                      data-depth={item.depth}
                      style={{ left: item.x, top: item.y, width: layout.nodeWidth, height: layout.nodeHeight }}
                    >
                      <button
                        ref={(element) => {
                          if (element) nodeRefs.current.set(item.node.id, element);
                          else nodeRefs.current.delete(item.node.id);
                        }}
                        className={`concept-node${isSelected ? ' is-selected' : ''}`}
                        role="treeitem"
                        aria-level={item.depth + 1}
                        aria-expanded={hasChildren ? isExpanded : undefined}
                        aria-selected={isSelected}
                        tabIndex={activeId === item.node.id ? 0 : -1}
                        onFocus={() => setActiveId(item.node.id)}
                        onClick={() => {
                          setSelectedId(item.node.id);
                          if (conceptMap.id === 'pressure' && item.node.children.length) toggleNode(item.node.id);
                        }}
                        onKeyDown={(event) => handleNodeKeyDown(event, item)}
                      >
                        <span>{item.node.title}</span>
                        <small>{item.node.shortDescription}</small>
                      </button>
                      {hasChildren && (
                        <button
                          className="concept-toggle"
                          tabIndex={-1}
                          aria-label={`${item.node.title} alt başlıklarını ${isExpanded ? 'daralt' : 'genişlet'}`}
                          onClick={() => toggleNode(item.node.id)}
                        >
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className={`concept-detail${selectedNode ? ' is-open' : ''}`} aria-live="polite">
            {selectedNode && (
              <>
                <div className="concept-detail-top">
                  <div className="concept-breadcrumb" aria-label="Kavram yolu">
                    {selectedPath.map((part, index) => (
                      <span key={part.id}>{index > 0 && <ChevronRight size={12} />}{part.title}</span>
                    ))}
                  </div>
                  <button onClick={() => setSelectedId(null)} aria-label="Açıklama panelini kapat"><X size={19} /></button>
                </div>
                <div className="concept-detail-body">
                  <span className="concept-detail-label">KAVRAM AÇIKLAMASI</span>
                  <h3>{selectedNode.title}</h3>
                  <p className="concept-detail-lead">{selectedNode.shortDescription}</p>
                  <p>{selectedNode.detailedDescription}</p>

                  {selectedNode.formula && (
                    <section className="concept-info-card formula-card">
                      <span>Formül</span>
                      <strong>{selectedNode.formula}</strong>
                    </section>
                  )}
                  {selectedNode.example && (
                    <section className="concept-info-card">
                      <Lightbulb size={18} />
                      <div><span>Örnek</span><p>{selectedNode.example}</p></div>
                    </section>
                  )}
                  {selectedNode.commonMistake && (
                    <section className="concept-info-card mistake-card">
                      <TriangleAlert size={18} />
                      <div><span>Sık yapılan hata</span><p>{selectedNode.commonMistake}</p></div>
                    </section>
                  )}
                  {selectedNode.relatedConceptIds.length > 0 && (
                    <section className="concept-related">
                      <span>İlişkili kavramlar</span>
                      <div>
                        {selectedNode.relatedConceptIds.map((relatedId) => {
                          const related = nodeById.get(relatedId);
                          return related ? (
                            <button key={related.id} onClick={() => revealNode(related.id)}>
                              {related.title}<ChevronRight size={13} />
                            </button>
                          ) : null;
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
        <p className="sr-only" aria-live="polite">
          {layout.nodes.length} kavram görünür. Ok tuşlarıyla düğümler arasında gezinebilirsin.
        </p>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button ref={launcherRef} className="concept-launcher" onClick={openExplorer}>
        <span className="concept-launcher-icon"><Network size={20} /></span>
        <span><strong>Tam kavram haritası</strong><small>{conceptMap.children.length} ana dalda bağlantıları keşfet</small></span>
        <ChevronRight size={18} />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
