import { useId } from 'react';
import treeBase from '@/assets/images/tree-base.svg';
import { BRANCH_PATHS, BRANCH_SLOTS, BRANCH_VIEWBOXES, TREE_VIEWBOX } from './treeSlots';
import { GRADE, GRADE_COLOR } from '@/constants/study';
import { formatShortDate } from '@/utils/date';

// 잎 자리의 중심 좌표 (rotate 는 중심 그대로, matrix 는 변환 적용)
const slotMatrix = (slot) => {
  const m = slot.transform?.match(/^matrix\(([^)]+)\)/);
  return m ? m[1].split(/[\s,]+/).map(Number) : [1, 0, 0, 1, 0, 0];
};
const slotCenter = (slot) => {
  const [a, b, c, d, e, f] = slotMatrix(slot);
  return [a * slot.cx + c * slot.cy + e, b * slot.cx + d * slot.cy + f];
};
// 잎의 긴 축 방향 (단위 벡터)
const slotAxis = (slot) => {
  const [a, b, c, d] = slotMatrix(slot);
  const [x, y] = slot.rx >= slot.ry ? [a, b] : [c, d];
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
};

// position(1~24) → [가지 index, 가지 안 index]
const BRANCH_START = [1, 6, 13, 20];
export const branchOf = (position) => BRANCH_START.findLastIndex((start) => position >= start);


/**
 * 나무 + 잎 (T3 leaves 를 position 순서대로 24자리에 배치)
 * - branchIndex 를 주면 그 가지만 확대해서 보여주고 날짜를 표시해요 (가지 확대 화면)
 * - onLeafClick(leaf) 로 잎 선택, onBranchClick(index) 로 가지 선택
 * - newPosition: 방금 붙인 잎 자리. 그 잎이 자라나는 애니메이션을 보여줘요 (A8 잎 배치 완료)
 */
export default function TreeView({ leaves = [], branchIndex, onLeafClick, onBranchClick, newPosition, className = '', style }) {
  const uid = useId();
  const zoomed = branchIndex !== undefined;
  const [vx, vy, vw, vh] = zoomed ? BRANCH_VIEWBOXES[branchIndex] : TREE_VIEWBOX;
  const leafByPosition = Object.fromEntries(leaves.map((leaf) => [leaf.position, leaf]));

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className={className} style={style} role="img" aria-label="나무">
      {/* 가지 확대는 시안처럼 그 가지만 따로 그리고, 전체 나무는 나무 그림 위에 잎을 올려요 */}
      {zoomed ? (
        <path d={BRANCH_PATHS[branchIndex]} fill="#C55A34" />
      ) : (
        <image href={treeBase} x={TREE_VIEWBOX[0]} y={TREE_VIEWBOX[1]} width={TREE_VIEWBOX[2]} height={TREE_VIEWBOX[3]} />
      )}

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
                  className={
                    position === newPosition ? 'leaf-grow' : zoomed && onLeafClick ? 'cursor-pointer' : undefined
                  }
                  style={position === newPosition ? { transformOrigin: `${cx}px ${cy}px` } : undefined}
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

// 시안처럼 날짜는 잎 끝(가지에서 먼 쪽) 방향으로 잎 바로 바깥에 써요
const LABEL_DISTANCE = 40;

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
        let [ux, uy] = slotAxis(slot);
        // 긴 축 중 가지 묶음 바깥을 향하는 쪽으로
        if ((cx - mx) * ux + (cy - my) * uy < 0) [ux, uy] = [-ux, -uy];
        return (
          <text
            key={i}
            x={cx + ux * LABEL_DISTANCE}
            y={cy + uy * LABEL_DISTANCE}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={6.3}
            fill="#5C5B58"
          >
            {formatShortDate(leaf.studiedAt)}
          </text>
        );
      })}
    </g>
  );
}
