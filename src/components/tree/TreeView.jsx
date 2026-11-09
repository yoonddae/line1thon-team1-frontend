import { useId } from 'react';
import treeBase from '@/assets/images/tree-base.svg';
import { BRANCH_SLOTS, TREE_VIEWBOX } from './treeSlots';
import { GRADE, GRADE_COLOR } from '@/constants/study';
import { formatShortDate } from '@/utils/date';

// 잎 자리의 중심 좌표 (rotate 는 중심 그대로, matrix 는 변환 적용)
const slotCenter = (slot) => {
  const m = slot.transform?.match(/^matrix\(([^)]+)\)/);
  if (!m) return [slot.cx, slot.cy];
  const [a, b, c, d, e, f] = m[1].split(/[\s,]+/).map(Number);
  return [a * slot.cx + c * slot.cy + e, b * slot.cx + d * slot.cy + f];
};

// position(1~24) → [가지 index, 가지 안 index]
const BRANCH_START = [1, 6, 13, 20];
export const branchOf = (position) => BRANCH_START.findLastIndex((start) => position >= start);

const branchViewBox = (branchIndex) => {
  const centers = BRANCH_SLOTS[branchIndex].map(slotCenter);
  const xs = centers.map(([x]) => x);
  const ys = centers.map(([, y]) => y);
  const pad = 48;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const size = Math.max(Math.max(...xs) - minX + pad, Math.max(...ys) - minY + pad);
  return [minX, minY, size, size];
};

/**
 * 나무 + 잎 (T3 leaves 를 position 순서대로 24자리에 배치)
 * - branchIndex 를 주면 그 가지만 확대해서 보여주고 날짜를 표시해요 (가지 확대 화면)
 * - onLeafClick(leaf) 로 잎 선택, onBranchClick(index) 로 가지 선택
 */
export default function TreeView({ leaves = [], branchIndex, onLeafClick, onBranchClick, className = '' }) {
  const uid = useId();
  const zoomed = branchIndex !== undefined;
  const [vx, vy, vw, vh] = zoomed ? branchViewBox(branchIndex) : TREE_VIEWBOX;
  const leafByPosition = Object.fromEntries(leaves.map((leaf) => [leaf.position, leaf]));

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className={className} role="img" aria-label="나무">
      <image href={treeBase} x={TREE_VIEWBOX[0]} y={TREE_VIEWBOX[1]} width={TREE_VIEWBOX[2]} height={TREE_VIEWBOX[3]} />

      {BRANCH_SLOTS.map((slots, b) => {
        if (zoomed && b !== branchIndex) return null;
        return (
          <g
            key={b}
            onClick={!zoomed && onBranchClick ? () => onBranchClick(b) : undefined}
            className={!zoomed && onBranchClick ? 'cursor-pointer' : undefined}
          >
            {slots.map((slot, i) => {
              const position = BRANCH_START[b] + i;
              const leaf = leafByPosition[position];
              if (!leaf) return null;

              const color = GRADE_COLOR[leaf.grade] ?? GRADE_COLOR[GRADE.GREEN];
              const [cx, cy] = slotCenter(slot);
              const gradId = `${uid}-${position}`;
              const scale = leaf.grade === GRADE.BUD ? 0.45 : 1;

              return (
                <g
                  key={position}
                  onClick={
                    zoomed && onLeafClick
                      ? (e) => {
                          e.stopPropagation();
                          onLeafClick(leaf);
                        }
                      : undefined
                  }
                  className={zoomed && onLeafClick ? 'cursor-pointer' : undefined}
                >
                  <defs>
                    <linearGradient
                      id={gradId}
                      x1={slot.g[0]}
                      y1={slot.g[1]}
                      x2={slot.g[2]}
                      y2={slot.g[3]}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor={color.from} />
                      <stop offset="1" stopColor={color.to} />
                    </linearGradient>
                  </defs>
                  <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
                    <ellipse
                      cx={slot.cx}
                      cy={slot.cy}
                      rx={slot.rx}
                      ry={slot.ry}
                      transform={slot.transform ?? undefined}
                      fill={color.base}
                    />
                    <path d={slot.d} fill={`url(#${gradId})`} />
                  </g>

                  {leaf.reviewAvailable && (
                    <g>
                      <circle cx={cx + 14} cy={cy - 18} r={7} fill="#FF6D6D" stroke="white" strokeWidth={1.5} />
                      <text x={cx + 14} y={cy - 14.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                        !
                      </text>
                    </g>
                  )}

                </g>
              );
            })}
          </g>
        );
      })}

      {/* 가지 확대: 잎 날짜를 바깥쪽에 잎보다 위에 그려요 */}
      {zoomed && <DateLabels branchIndex={branchIndex} leafByPosition={leafByPosition} />}
    </svg>
  );
}

function DateLabels({ branchIndex, leafByPosition }) {
  const slots = BRANCH_SLOTS[branchIndex];
  const centers = slots.map(slotCenter);
  const mx = centers.reduce((sum, [x]) => sum + x, 0) / centers.length;
  const my = centers.reduce((sum, [, y]) => sum + y, 0) / centers.length;

  return (
    <g pointerEvents="none">
      {slots.map((slot, i) => {
        const leaf = leafByPosition[BRANCH_START[branchIndex] + i];
        if (!leaf) return null;
        const [cx, cy] = centers[i];
        const dx = cx - mx;
        const dy = cy - my;
        const len = Math.hypot(dx, dy) || 1;
        return (
          <text
            key={i}
            x={cx + (dx / len) * 40}
            y={cy + (dy / len) * 40 + 4}
            textAnchor="middle"
            fontSize={10}
            fill="#5C5B58"
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {formatShortDate(leaf.studiedAt)}
          </text>
        );
      })}
    </g>
  );
}
