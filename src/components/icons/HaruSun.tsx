/**
 * 하루 해님. Celebration modal uses the cheer face at about 120pt.
 */

import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import {
  HARU_BODY,
  HARU_COLORS,
  HARU_FACES,
  HARU_RAY,
  HARU_VIEWBOX,
  HaruMood,
  HaruShape,
} from './haruSunGeometry';

type HaruSunProps = {
  mood?: HaruMood;
  size?: number;
};

function FaceShape({ shape, index }: { shape: HaruShape; index: number }) {
  if (shape.tag === 'circle') {
    return (
      <Circle
        key={index}
        cx={shape.cx}
        cy={shape.cy}
        r={shape.r}
        fill={shape.fill}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        opacity={shape.opacity}
        strokeLinecap="round"
      />
    );
  }
  if (shape.tag === 'ellipse') {
    return (
      <Ellipse
        key={index}
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={shape.fill}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
    );
  }
  return (
    <Path
      key={index}
      d={shape.d}
      fill={shape.fill}
      stroke={shape.stroke}
      strokeWidth={shape.strokeWidth}
      strokeLinecap="round"
    />
  );
}

export function HaruSun({ mood = 'cheer', size = 120 }: HaruSunProps) {
  const face = HARU_FACES[mood];

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${HARU_VIEWBOX} ${HARU_VIEWBOX}`}
      accessible={false}
      pointerEvents="none"
    >
      {HARU_RAY.angles.map((angle) => (
        <Rect
          key={angle}
          x={HARU_RAY.x}
          y={HARU_RAY.y}
          width={HARU_RAY.width}
          height={HARU_RAY.height}
          rx={HARU_RAY.rx}
          fill={HARU_COLORS.ray}
          transform={`rotate(${angle} ${HARU_RAY.origin} ${HARU_RAY.origin})`}
        />
      ))}
      <Circle cx={HARU_BODY.cx} cy={HARU_BODY.cy} r={HARU_BODY.r} fill={HARU_COLORS.body} />
      <Circle
        cx={HARU_BODY.cx}
        cy={HARU_BODY.cy}
        r={HARU_BODY.r}
        fill="none"
        stroke={HARU_COLORS.outline}
        strokeWidth={HARU_BODY.strokeWidth}
      />
      {face.map((shape, index) => (
        <FaceShape key={index} shape={shape} index={index} />
      ))}
    </Svg>
  );
}
