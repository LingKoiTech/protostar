'use client';
import type { PipelineNode, PipelineEdge, NodeStatus } from '../lib/pipeline';
import {
  COL_W, ROW_H, NODE_W, NODE_H, GATE_R, PAD_X, PAD_Y,
  LANE_ORDER, nodeColor, nodePos,
} from '../lib/pipeline';

interface Props {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  statuses: Record<string, NodeStatus>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PHASE_COLORS: Record<string, string> = {
  intake: '#eff6ff',
  artifacts: '#f0fdf4',
  execution: '#fefce8',
};

const PHASE_LABEL: Record<string, string> = {
  intake: '需求',
  artifacts: '产物与批准',
  execution: '执行',
};

export default function PipelineGraph({ nodes, edges, statuses, selectedId, onSelect }: Props) {
  const maxCol = Math.max(...nodes.map(n => n.col));
  const svgW = PAD_X * 2 + (maxCol + 1) * COL_W;
  const svgH = PAD_Y * 2 + LANE_ORDER.length * ROW_H;

  // 计算各阶段的列范围
  const phaseMap: Record<string, { minCol: number; maxCol: number }> = {};
  for (const n of nodes) {
    const p = phaseMap[n.phase] ?? { minCol: n.col, maxCol: n.col };
    phaseMap[n.phase] = { minCol: Math.min(p.minCol, n.col), maxCol: Math.max(p.maxCol, n.col) };
  }

  // 节点位置索引
  const posMap: Record<string, { cx: number; cy: number }> = {};
  for (const n of nodes) posMap[n.id] = nodePos(n);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', minWidth: svgW }}>
        {/* 阶段背景 */}
        {Object.entries(phaseMap).map(([phase, { minCol, maxCol: mc }]) => (
          <g key={phase}>
            <rect
              x={PAD_X + minCol * COL_W - 8}
              y={PAD_Y - 24}
              width={(mc - minCol + 1) * COL_W}
              height={LANE_ORDER.length * ROW_H + 8}
              rx={8}
              fill={PHASE_COLORS[phase] ?? '#f9fafb'}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={PAD_X + minCol * COL_W - 4}
              y={PAD_Y - 10}
              fontSize={11}
              fill="#6b7280"
              fontFamily="system-ui, sans-serif"
            >
              {PHASE_LABEL[phase] ?? phase}
            </text>
          </g>
        ))}

        {/* Lane 标签 */}
        {LANE_ORDER.map((lane, i) => (
          <text
            key={lane}
            x={8}
            y={PAD_Y + i * ROW_H + NODE_H / 2 + 4}
            fontSize={10}
            fill="#9ca3af"
            fontFamily="system-ui, sans-serif"
            writingMode="horizontal-tb"
          >
            {lane === 'approver' ? '审批' : '流程'}
          </text>
        ))}

        {/* 边 */}
        {edges.map((e, i) => {
          const a = posMap[e.from];
          const b = posMap[e.to];
          if (!a || !b) return null;
          const fromNode = nodes.find(n => n.id === e.from)!;
          const toNode = nodes.find(n => n.id === e.to)!;

          // 起点：节点右侧或下方
          let x1 = a.cx + (fromNode.type === 'gate' ? GATE_R : NODE_W / 2);
          let y1 = a.cy;
          // 终点：节点左侧或上方
          let x2 = b.cx - (toNode.type === 'gate' ? GATE_R : NODE_W / 2);
          let y2 = b.cy;

          // 跨 lane 时走折线
          const path = a.cy === b.cy
            ? `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`
            : `M${a.cx},${a.cy + (fromNode.type === 'gate' ? GATE_R : NODE_H / 2)} V${(a.cy + b.cy) / 2} H${b.cx} V${b.cy - (toNode.type === 'gate' ? GATE_R : NODE_H / 2)}`;

          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* 箭头 marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* 节点 */}
        {nodes.map(n => {
          const { cx, cy } = posMap[n.id];
          const color = nodeColor(n.type, statuses[n.id]);
          const isSelected = n.id === selectedId;
          const isGate = n.type === 'gate';

          return (
            <g
              key={n.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(n.id)}
            >
              {isGate ? (
                // 菱形
                <polygon
                  points={`${cx},${cy - GATE_R} ${cx + GATE_R},${cy} ${cx},${cy + GATE_R} ${cx - GATE_R},${cy}`}
                  fill="white"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))' : undefined}
                />
              ) : (
                // 圆角矩形
                <rect
                  x={cx - NODE_W / 2}
                  y={cy - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill="white"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  filter={isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))' : undefined}
                />
              )}

              {/* 左侧色条 */}
              {!isGate && (
                <rect
                  x={cx - NODE_W / 2}
                  y={cy - NODE_H / 2}
                  width={4}
                  height={NODE_H}
                  rx={2}
                  fill={color}
                />
              )}

              {/* label */}
              <text
                x={cx + (isGate ? 0 : 4)}
                y={cy - 6}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill="#1e293b"
                fontFamily="system-ui, sans-serif"
              >
                {n.label}
              </text>
              <text
                x={cx + (isGate ? 0 : 4)}
                y={cy + 10}
                textAnchor="middle"
                fontSize={10}
                fill="#64748b"
                fontFamily="system-ui, sans-serif"
              >
                {n.sublabel}
              </text>

              {/* 状态点 */}
              {statuses[n.id] && (
                <circle
                  cx={cx + (isGate ? GATE_R - 6 : NODE_W / 2 - 6)}
                  cy={cy - (isGate ? GATE_R - 6 : NODE_H / 2 - 6)}
                  r={5}
                  fill={nodeColor(n.type, statuses[n.id])}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
