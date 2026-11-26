/**
 * In-house ih-* icon. Stroke and duotone ink come from the SVG
 * (`currentColor`); pass `color` to tint a tab or a settings row.
 * Unknown names draw ih-pin so a cell is never blank.
 */

import React, { useId } from 'react';
import Svg, { Circle, G, Mask, Path, Rect } from 'react-native-svg';
import {
  IH_ICON_INK,
  IH_ICONS,
  IhAttrs,
  IhIconNode,
  resolveIhIconName,
} from './ihIconPaths';

export type { IhIconName } from './ihIconPaths';

type IhIconProps = {
  /** `ih-homework` or `homework`. */
  name: string;
  size?: number;
  /** Overrides the SVG ink (#2D3436). */
  color?: string;
};

function paint(value: string | undefined, color: string): string | undefined {
  if (value === 'currentColor') return color;
  return value;
}

function painted(attrs: IhAttrs, color: string): IhAttrs {
  return {
    ...attrs,
    fill: paint(attrs.fill, color),
    stroke: paint(attrs.stroke, color),
  };
}

function renderNode(
  node: IhIconNode,
  color: string,
  idPrefix: string,
  key: string,
): React.ReactNode {
  const attrs = painted(node.attrs, color);
  const children = node.children?.map((child, index) =>
    renderNode(child, color, idPrefix, `${key}-${index}`),
  );

  switch (node.tag) {
    case 'path':
      return <Path key={key} {...attrs} />;
    case 'rect':
      return <Rect key={key} {...attrs} />;
    case 'circle':
      return <Circle key={key} {...attrs} />;
    case 'g': {
      const mask = node.mask?.replace(
        /url\(#([^)]+)\)/,
        (_, id: string) => `url(#${idPrefix}-${id})`,
      );
      return (
        <G key={key} mask={mask}>
          {children}
        </G>
      );
    }
    case 'mask':
      return (
        <Mask
          key={key}
          id={`${idPrefix}-${node.id}`}
          x={0}
          y={0}
          width={24}
          height={24}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
        >
          {children}
        </Mask>
      );
    default:
      return null;
  }
}

export function IhIcon({ name, size = 24, color = IH_ICON_INK }: IhIconProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const resolved = resolveIhIconName(name) ?? 'ih-pin';

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      pointerEvents="none"
    >
      {IH_ICONS[resolved].map((node, index) => renderNode(node, color, rawId, String(index)))}
    </Svg>
  );
}
