/**
 * iHaru ih-* icon geometry, generated from assets/icons/ih.
 * ihIcons.test.ts checks these paths against the raw SVG files.
 * currentColor is the ink. Callers tint it; the default is IH_ICON_INK.
 */

export const IH_ICON_INK = '#2D3436';

export const IH_ICON_NAMES = [
  'ih-activity-fill',
  'ih-activity',
  'ih-add-circle',
  'ih-art',
  'ih-backup',
  'ih-bike',
  'ih-camera',
  'ih-chart',
  'ih-check',
  'ih-cheer',
  'ih-chevron',
  'ih-close',
  'ih-code',
  'ih-computer',
  'ih-dance',
  'ih-delete',
  'ih-document',
  'ih-exercise',
  'ih-friend',
  'ih-garden',
  'ih-gift',
  'ih-homework',
  'ih-info',
  'ih-lightbulb',
  'ih-lock-open',
  'ih-lock',
  'ih-math',
  'ih-meal',
  'ih-movie',
  'ih-music',
  'ih-nap',
  'ih-notification',
  'ih-outside',
  'ih-party',
  'ih-pets',
  'ih-piano',
  'ih-pin',
  'ih-plan-fill',
  'ih-plan',
  'ih-play',
  'ih-privacy',
  'ih-puzzle',
  'ih-reading',
  'ih-rest',
  'ih-restore',
  'ih-roleplay',
  'ih-science',
  'ih-settings-fill',
  'ih-settings',
  'ih-snack',
  'ih-sparkle',
  'ih-star',
  'ih-study',
  'ih-swim',
  'ih-today-fill',
  'ih-today',
  'ih-travel',
  'ih-verified',
  'ih-warn',
] as const;

export type IhIconName = (typeof IH_ICON_NAMES)[number];

export type IhIconTag = 'path' | 'rect' | 'circle' | 'g' | 'mask';

export type IhAttrs = {
  d?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  cx?: number;
  cy?: number;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
  fillOpacity?: number;
  strokeOpacity?: number;
  fillRule?: 'evenodd' | 'nonzero';
};

export type IhIconNode = {
  tag: IhIconTag;
  id?: string;
  mask?: string;
  attrs: IhAttrs;
  children?: IhIconNode[];
};

export const IH_ICONS: Record<IhIconName, IhIconNode[]> = {
  'ih-activity-fill': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
      },
    },
  ],
  'ih-activity': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 3.5,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.1,
        y: 13.1,
        width: 7.4,
        height: 7.4,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-add-circle': [
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 12,
        r: 8.4,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 12,
        r: 8.4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 8v8M8 12h8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-art': [
    {
      tag: 'path',
      attrs: {
        d: "M12 3.3c-4.9 0-8.7 3.8-8.7 8.6 0 4.6 3.7 8.6 8.2 8.6 1.3 0 2.1-.9 2.1-1.9 0-.6-.3-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.9-1.8h2.1c2.4 0 4.2-1.8 4.2-4.1 0-3.7-3.8-6.7-8.7-6.7z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.3c-4.9 0-8.7 3.8-8.7 8.6 0 4.6 3.7 8.6 8.2 8.6 1.3 0 2.1-.9 2.1-1.9 0-.6-.3-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.9-1.8h2.1c2.4 0 4.2-1.8 4.2-4.1 0-3.7-3.8-6.7-8.7-6.7z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 7.6,
        cy: 11.2,
        r: 1.4,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 10.4,
        cy: 7.5,
        r: 1.4,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15,
        cy: 7.6,
        r: 1.4,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 8.3,
        cy: 15.4,
        r: 1.4,
        fill: "currentColor",
      },
    },
  ],
  'ih-backup': [
    {
      tag: 'path',
      attrs: {
        d: "M5 14.6v3.2A2.4 2.4 0 0 0 7.4 20.2h9.2A2.4 2.4 0 0 0 19 17.8v-3.2H5z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.8v9.4M8.4 7.2 12 3.8 15.6 7.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M5 14.6v3.2A2.4 2.4 0 0 0 7.4 20.2h9.2A2.4 2.4 0 0 0 19 17.8v-3.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-bike': [
    {
      tag: 'circle',
      attrs: {
        cx: 6.8,
        cy: 16.2,
        r: 4,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.4,
        cy: 16.2,
        r: 4,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 6.8,
        cy: 16.2,
        r: 4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.4,
        cy: 16.2,
        r: 4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M6.8 16.2 11.2 9.6h5.4L17.4 16.2M11.2 9.6 12.6 16.2M11.2 9.6 8.4 16.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9.6 8.4h3.6M16.6 9.6l2.2-2.6h1.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-camera': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 8.2,
        width: 17,
        height: 12,
        rx: 3.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 8.2,
        width: 17,
        height: 12,
        rx: 3.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 14.2,
        r: 4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 6,
        y: 4.6,
        width: 5.2,
        height: 3.8,
        rx: 1.3,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 18.2,
        cy: 11.2,
        r: 1.15,
        fill: "currentColor",
      },
    },
  ],
  'ih-chart': [
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 12,
        width: 4,
        height: 8,
        rx: 1.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 10,
        y: 8,
        width: 4,
        height: 12,
        rx: 1.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 16,
        y: 4,
        width: 4,
        height: 16,
        rx: 1.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 12,
        width: 4,
        height: 8,
        rx: 1.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 10,
        y: 8,
        width: 4,
        height: 12,
        rx: 1.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 16,
        y: 4,
        width: 4,
        height: 16,
        rx: 1.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-check': [
    {
      tag: 'path',
      attrs: {
        d: "M5 12.6l4.4 4.4L19 7.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-cheer': [
    {
      tag: 'path',
      attrs: {
        d: "M6.5 17.5a5.5 5.5 0 0 1 11 0z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.5 17.5h17M6.5 17.5a5.5 5.5 0 0 1 11 0M12 5v2.6M5.6 8.6l1.8 1.8M18.4 8.6l-1.8 1.8M8 20.5h8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-chevron': [
    {
      tag: 'path',
      attrs: {
        d: "M9.4 5.4 16.2 12 9.4 18.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-close': [
    {
      tag: 'path',
      attrs: {
        d: "M6.5 6.5l11 11M17.5 6.5l-11 11",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-code': [
    {
      tag: 'rect',
      attrs: {
        x: 3.4,
        y: 5,
        width: 17.2,
        height: 14,
        rx: 3,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.4,
        y: 5,
        width: 17.2,
        height: 14,
        rx: 3,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.2 10 6 12l2.2 2M15.8 10 18 12l-2.2 2M13.2 9.2l-2.4 5.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-computer': [
    {
      tag: 'rect',
      attrs: {
        x: 4.5,
        y: 3.8,
        width: 15,
        height: 11.2,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4.5,
        y: 3.8,
        width: 15,
        height: 11.2,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.4 16.6h17.2L19 20.2H5z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.4 16.6h17.2L19 20.2H5z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 5.8,
        r: 0.8,
        fill: "currentColor",
      },
    },
  ],
  'ih-dance': [
    {
      tag: 'path',
      attrs: {
        d: "M7.6 8.2c-2.4-2.8-5.6.4-3.2 2.8 1.2 1.2 3.2 1.2 4.4 0 1.2 1.2 3.2 1.2 4.4 0 2.4-2.4-.8-5.6-3.2-2.8L8.8 9.4z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.8 9.4c-1.2-2.8-5.2-3.6-5.6-.6-.3 2.2 1.8 3.2 3.6 2.2M8.8 9.4c1.2-2.8 5.2-3.6 5.6-.6.3 2.2-1.8 3.2-3.6 2.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.8 10.8c-1.2 3.4-3.6 7.2-6 8.4M8.8 10.8c1.6 3.6 2.2 7.6 5.2 8.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.2,
        cy: 17.6,
        r: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M19.4 17.6V8.6l3-.8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.2,
        cy: 17.6,
        r: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-delete': [
    {
      tag: 'path',
      attrs: {
        d: "M7.2 8.2 8 19.2a2.2 2.2 0 0 0 2.2 2h3.6a2.2 2.2 0 0 0 2.2-2l.8-11",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M4.4 8.2h15.2M9.2 8.2V5.6A1.6 1.6 0 0 1 10.8 4h2.4A1.6 1.6 0 0 1 14.8 5.6V8.2M7.2 8.2 8 19.2a2.2 2.2 0 0 0 2.2 2h3.6a2.2 2.2 0 0 0 2.2-2l.8-11M10.2 11.6v6M13.8 11.6v6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-document': [
    {
      tag: 'rect',
      attrs: {
        x: 6,
        y: 3.4,
        width: 12,
        height: 17.2,
        rx: 2.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 6,
        y: 3.4,
        width: 12,
        height: 17.2,
        rx: 2.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9 9h6M9 13h6M9 17h4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-exercise': [
    {
      tag: 'circle',
      attrs: {
        cx: 15.2,
        cy: 4.8,
        r: 2.1,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.2,
        cy: 4.8,
        r: 2.1,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M13.4 8.8 11.4 13.4M13.4 8.8l3 2.2 2.4-.6M13.4 8.8l-3.4 1.2M11.4 13.4l3.2 2-.4 4.4M11.4 13.4l-1.8 3.4-3.6.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.5 9h2M3 12.5h1.5",
        stroke: "currentColor",
        strokeOpacity: 0.45,
        strokeWidth: 2,
        strokeLinecap: "round",
        fill: "none",
      },
    },
  ],
  'ih-friend': [
    {
      tag: 'mask',
      id: "m-friend",
      attrs: {
      },
      children: [
        {
          tag: 'rect',
          attrs: {
            width: 24,
            height: 24,
            fill: "#fff",
          },
        },
        {
          tag: 'circle',
          attrs: {
            cx: 15.6,
            cy: 11.2,
            r: 5.4,
            fill: "none",
            stroke: "#000",
            strokeWidth: 4,
          },
        },
      ],
    },
    {
      tag: 'g',
      mask: "url(#m-friend)",
      attrs: {
      },
      children: [
        {
          tag: 'circle',
          attrs: {
            cx: 8.4,
            cy: 11.2,
            r: 5.4,
            fill: "currentColor",
            fillOpacity: 0.18,
          },
        },
        {
          tag: 'circle',
          attrs: {
            cx: 8.4,
            cy: 11.2,
            r: 5.4,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
        {
          tag: 'circle',
          attrs: {
            cx: 6.8,
            cy: 10.4,
            r: 1,
            fill: "currentColor",
          },
        },
        {
          tag: 'circle',
          attrs: {
            cx: 9.6,
            cy: 10.4,
            r: 1,
            fill: "currentColor",
          },
        },
        {
          tag: 'path',
          attrs: {
            d: "M7 13q1.4 1.4 2.8 0",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
      ],
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.6,
        cy: 11.2,
        r: 5.4,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.6,
        cy: 11.2,
        r: 5.4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 14,
        cy: 10.4,
        r: 1,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 16.8,
        cy: 10.4,
        r: 1,
        fill: "currentColor",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M14.2 13q1.4 1.4 2.8 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-garden': [
    {
      tag: 'path',
      attrs: {
        d: "M7.2 14.2h9.6l-1 6.2a2 2 0 0 1-2 1.6H10.2a2 2 0 0 1-2-1.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M7.2 14.2h9.6l-1 6.2a2 2 0 0 1-2 1.6H10.2a2 2 0 0 1-2-1.6zM12 14.2V7.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 10.4c-3.2-.8-4.4-3.8-1.6-5.6.4 2.6 1.6 4.4 1.6 5.6M12 9.2c3.2-.6 4.6-3.4 2-5.2.2 2.6-1 4.4-2 5.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-gift': [
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 10.2,
        width: 16,
        height: 10.2,
        rx: 2.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 10.2,
        width: 16,
        height: 10.2,
        rx: 2.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 7,
        width: 17,
        height: 4.2,
        rx: 2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 7v13.4M12 7c-2.8-3.6-6.2-.8-3.2 1.4M12 7c2.8-3.6 6.2-.8 3.2 1.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-homework': [
    {
      tag: 'mask',
      id: "m-hw",
      attrs: {
      },
      children: [
        {
          tag: 'rect',
          attrs: {
            width: 24,
            height: 24,
            fill: "#fff",
          },
        },
        {
          tag: 'path',
          attrs: {
            d: "M12.4 20.6 20 13",
            stroke: "#000",
            strokeWidth: 6,
            strokeLinecap: "round",
            fill: "none",
          },
        },
      ],
    },
    {
      tag: 'g',
      mask: "url(#m-hw)",
      attrs: {
      },
      children: [
        {
          tag: 'rect',
          attrs: {
            x: 3.5,
            y: 3,
            width: 12,
            height: 16,
            rx: 3,
            fill: "currentColor",
            fillOpacity: 0.18,
          },
        },
        {
          tag: 'rect',
          attrs: {
            x: 3.5,
            y: 3,
            width: 12,
            height: 16,
            rx: 3,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
        {
          tag: 'path',
          attrs: {
            d: "M7 8h5M7 12h3",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
      ],
    },
    {
      tag: 'path',
      attrs: {
        d: "M12.6 20.4 13.3 17.5 18.8 12a1.6 1.6 0 0 1 2.3 2.3l-5.5 5.5z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-info': [
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 12,
        r: 8.4,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 12,
        r: 8.4,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 11v5.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 8.2,
        r: 1.15,
        fill: "currentColor",
      },
    },
  ],
  'ih-lightbulb': [
    {
      tag: 'path',
      attrs: {
        d: "M8 13.4A4.8 4.8 0 1 1 16 13.4C16 16 14.4 17 14.4 19.2h-4.8C9.6 17 8 16 8 13.4z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8 13.4A4.8 4.8 0 1 1 16 13.4C16 16 14.4 17 14.4 19.2h-4.8C9.6 17 8 16 8 13.4zM9.8 19.2h4.4M10.4 21h3.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-lock-open': [
    {
      tag: 'rect',
      attrs: {
        x: 5.5,
        y: 10.8,
        width: 13,
        height: 9.8,
        rx: 3,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 5.5,
        y: 10.8,
        width: 13,
        height: 9.8,
        rx: 3,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.6 10.8V6.2a3.6 3.6 0 0 1 7.2 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 15.6,
        r: 1.2,
        fill: "currentColor",
      },
    },
  ],
  'ih-lock': [
    {
      tag: 'rect',
      attrs: {
        x: 5.5,
        y: 10.4,
        width: 13,
        height: 10.2,
        rx: 3,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 5.5,
        y: 10.4,
        width: 13,
        height: 10.2,
        rx: 3,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.4 10.4V8.2a3.6 3.6 0 0 1 7.2 0v2.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 15.4,
        r: 1.2,
        fill: "currentColor",
      },
    },
  ],
  'ih-math': [
    {
      tag: 'mask',
      id: "m-math",
      attrs: {
      },
      children: [
        {
          tag: 'rect',
          attrs: {
            width: 24,
            height: 24,
            fill: "#fff",
          },
        },
        {
          tag: 'rect',
          attrs: {
            x: 9.5,
            y: 9.5,
            width: 11,
            height: 11,
            rx: 2.5,
            fill: "none",
            stroke: "#000",
            strokeWidth: 4,
          },
        },
      ],
    },
    {
      tag: 'g',
      mask: "url(#m-math)",
      attrs: {
      },
      children: [
        {
          tag: 'rect',
          attrs: {
            x: 3.5,
            y: 3.5,
            width: 11,
            height: 11,
            rx: 2.5,
            fill: "currentColor",
            fillOpacity: 0.18,
          },
        },
        {
          tag: 'rect',
          attrs: {
            x: 3.5,
            y: 3.5,
            width: 11,
            height: 11,
            rx: 2.5,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
        {
          tag: 'path',
          attrs: {
            d: "M6.2 9h5.6M9 6.2v5.6",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
        },
      ],
    },
    {
      tag: 'rect',
      attrs: {
        x: 9.5,
        y: 9.5,
        width: 11,
        height: 11,
        rx: 2.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 9.5,
        y: 9.5,
        width: 11,
        height: 11,
        rx: 2.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12.3 15h5.4M16.4 12.4v.2M12.8 17.6v.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-meal': [
    {
      tag: 'path',
      attrs: {
        d: "M12 7c2.4-3.2 7.2-.6 7.2 5.4 0 5.4-3.6 9.2-7.2 9.2S4.8 17.8 4.8 12.4C4.8 6.4 9.6 3.8 12 7z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 7c2.4-3.2 7.2-.6 7.2 5.4 0 5.4-3.6 9.2-7.2 9.2S4.8 17.8 4.8 12.4C4.8 6.4 9.6 3.8 12 7zM12 7c.2-2.2 1.6-3.6 3.6-4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M15.6 4.2c.2 1.8-1 3.2-2.4 3.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-movie': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 10,
        width: 17,
        height: 10.5,
        rx: 2.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 10,
        width: 17,
        height: 10.5,
        rx: 2.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M4.2 10.2 6.6 4.2l13.6 4.8-2.4 6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.2 3.7l1.1 2.8M12.2 5.1l1.1 2.8M16.2 6.5l1.1 2.8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M7.5 14h9M7.5 17h6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-music': [
    {
      tag: 'circle',
      attrs: {
        cx: 6.8,
        cy: 17.3,
        r: 2.6,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 16.8,
        cy: 15.3,
        r: 2.6,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9.4 17.3V7l10-2.4v10.7M9.4 10.2l10-2.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 6.8,
        cy: 17.3,
        r: 2.6,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 16.8,
        cy: 15.3,
        r: 2.6,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-nap': [
    {
      tag: 'path',
      attrs: {
        d: "M19.8 14.6A8.2 8.2 0 1 1 9.4 4.2a6.6 6.6 0 0 0 10.4 10.4z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M19.8 14.6A8.2 8.2 0 1 1 9.4 4.2a6.6 6.6 0 0 0 10.4 10.4z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M14.5 3.5h3.8l-3.8 4.2h3.8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-notification': [
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6a4.4 4.4 0 0 1 4.4 4.4c0 2.2.7 3.8 1.5 5.1.6 1 .9 1.8.9 2.5H5.2c0-.7.3-1.5.9-2.5.8-1.3 1.5-2.9 1.5-5.1A4.4 4.4 0 0 1 12 3.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6a4.4 4.4 0 0 1 4.4 4.4c0 2.2.7 3.8 1.5 5.1.6 1 .9 1.8.9 2.5H5.2c0-.7.3-1.5.9-2.5.8-1.3 1.5-2.9 1.5-5.1A4.4 4.4 0 0 1 12 3.6zM9.2 16.6a2.8 2.8 0 0 0 5.6 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-outside': [
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6c3.4 0 5.8 2.2 6.2 5 2.2.2 3.6 2.2 3.6 4.4 0 2.6-2.2 4.6-5 4.6H7.2c-2.8 0-5-2-5-4.6 0-2.2 1.4-4.2 3.6-4.4C6.2 5.8 8.6 3.6 12 3.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6c3.4 0 5.8 2.2 6.2 5 2.2.2 3.6 2.2 3.6 4.4 0 2.6-2.2 4.6-5 4.6H7.2c-2.8 0-5-2-5-4.6 0-2.2 1.4-4.2 3.6-4.4C6.2 5.8 8.6 3.6 12 3.6z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M10.2 17.6h3.6L14.6 21H9.4z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-party': [
    {
      tag: 'path',
      attrs: {
        d: "M3.8 20.2 8.4 8.6l7 7z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.8 20.2 8.4 8.6l7 7zM6.2 14.2l3.6 3.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M13 3.8v2.4M19.6 10.6H22M17.2 6.8l1.7-1.7M12.3 9.8c.9-.9 2.3-.9 3.1 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 20,
        cy: 15.8,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 9.6,
        cy: 4.4,
        r: 1.2,
        fill: "currentColor",
      },
    },
  ],
  'ih-pets': [
    {
      tag: 'path',
      attrs: {
        d: "M7.4 10.4c-3.4-.6-5.2 3-3.4 6.2 2 1.2 3.8-1.2 3.8-3.2z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M16.6 10.4c3.4-.6 5.2 3 3.4 6.2-2 1.2-3.8-1.2-3.8-3.2z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 13.2,
        r: 6.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 13.2,
        r: 6.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M7.4 10.4c-3.4-.6-5.2 3-3.4 6.2 2 1.2 3.8-1.2 3.8-3.2zM16.6 10.4c3.4-.6 5.2 3 3.4 6.2-2 1.2-3.8-1.2-3.8-3.2z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 14.2,
        r: 1.15,
        fill: "currentColor",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9.8 16.4q2.2 1.6 4.4 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-piano': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 7.5,
        width: 17,
        height: 13,
        rx: 2.5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 7.5,
        width: 17,
        height: 13,
        rx: 2.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9.2 7.5v13M14.8 7.5v13",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 7.4,
        y: 7.5,
        width: 3.2,
        height: 7.4,
        rx: 1,
        fill: "currentColor",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 13.4,
        y: 7.5,
        width: 3.2,
        height: 7.4,
        rx: 1,
        fill: "currentColor",
      },
    },
  ],
  'ih-pin': [
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 9,
        r: 5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 9,
        r: 5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 14v6.5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 10.4,
        cy: 7.6,
        r: 1.1,
        fill: "currentColor",
      },
    },
  ],
  'ih-plan-fill': [
    {
      tag: 'path',
      attrs: {
        fill: "currentColor",
        fillRule: "evenodd",
        d: "M8 3.2A3.2 3.2 0 0 0 4.8 6.4v11.4A3.2 3.2 0 0 0 8 21h11.2a3.2 3.2 0 0 0 3.2-3.2V6.4A3.2 3.2 0 0 0 19.2 3.2H8zM11.2 8.6h7.2c.6 0 1.1.5 1.1 1.1v.6c0 .6-.5 1.1-1.1 1.1h-7.2c-.6 0-1.1-.5-1.1-1.1v-.6c0-.6.5-1.1 1.1-1.1zm0 4.2h7.2c.6 0 1.1.5 1.1 1.1v.6c0 .6-.5 1.1-1.1 1.1h-7.2c-.6 0-1.1-.5-1.1-1.1v-.6c0-.6.5-1.1 1.1-1.1zm0 4.2h5c.6 0 1.1.5 1.1 1.1v.6c0 .6-.5 1.1-1.1 1.1h-5c-.6 0-1.1-.5-1.1-1.1v-.6c0-.6.5-1.1 1.1-1.1zM5.2 7.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zm0 4.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zm0 4.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z",
      },
    },
  ],
  'ih-plan': [
    {
      tag: 'rect',
      attrs: {
        x: 5.2,
        y: 3.5,
        width: 15.2,
        height: 17,
        rx: 2.8,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 5.2,
        y: 3.5,
        width: 15.2,
        height: 17,
        rx: 2.8,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.6 3.5v17M11.4 9.6h6.4M11.4 13.2h6.4M11.4 16.8h4.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 4.6,
        cy: 8,
        r: 1.3,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 4.6,
        cy: 12,
        r: 1.3,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 4.6,
        cy: 16,
        r: 1.3,
        fill: "currentColor",
      },
    },
  ],
  'ih-play': [
    {
      tag: 'path',
      attrs: {
        d: "M7.2 7.5h9.6a4.7 4.7 0 0 1 4.6 5.6l-.7 3.5a2.2 2.2 0 0 1-3.7 1.1L15 15.8H9l-2 1.9a2.2 2.2 0 0 1-3.7-1.1l-.7-3.5a4.7 4.7 0 0 1 4.6-5.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M7.2 7.5h9.6a4.7 4.7 0 0 1 4.6 5.6l-.7 3.5a2.2 2.2 0 0 1-3.7 1.1L15 15.8H9l-2 1.9a2.2 2.2 0 0 1-3.7-1.1l-.7-3.5a4.7 4.7 0 0 1 4.6-5.6zM8 10.3v3.4M6.3 12h3.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.6,
        cy: 11,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.8,
        cy: 13.2,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 7.5V5.2c0-.8.6-1.4 1.4-1.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-privacy': [
    {
      tag: 'path',
      attrs: {
        d: "M12 3.4 19.4 6.6v5.6c0 4.4-3.2 7.4-7.4 8.4-4.2-1-7.4-4-7.4-8.4V6.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.4 19.4 6.6v5.6c0 4.4-3.2 7.4-7.4 8.4-4.2-1-7.4-4-7.4-8.4V6.6zM12 10.6v3.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 8.4,
        r: 1.15,
        fill: "currentColor",
      },
    },
  ],
  'ih-puzzle': [
    {
      tag: 'path',
      attrs: {
        d: "M8.4 4.2h4.2c0 1.8 1.4 3 3 3s3-1.2 3-3H20a1.6 1.6 0 0 1 1.6 1.6v3.6c-1.8 0-3 1.4-3 3s1.2 3 3 3V19a1.6 1.6 0 0 1-1.6 1.6h-3.6c0-1.8-1.4-3-3-3s-3 1.2-3 3H8.4A1.6 1.6 0 0 1 6.8 19v-3.2c1.6 0 2.8-1.3 2.8-3s-1.2-3-2.8-3V5.8A1.6 1.6 0 0 1 8.4 4.2z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.4 4.2h4.2c0 1.8 1.4 3 3 3s3-1.2 3-3H20a1.6 1.6 0 0 1 1.6 1.6v3.6c-1.8 0-3 1.4-3 3s1.2 3 3 3V19a1.6 1.6 0 0 1-1.6 1.6h-3.6c0-1.8-1.4-3-3-3s-3 1.2-3 3H8.4A1.6 1.6 0 0 1 6.8 19v-3.2c1.6 0 2.8-1.3 2.8-3s-1.2-3-2.8-3V5.8A1.6 1.6 0 0 1 8.4 4.2z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-reading': [
    {
      tag: 'path',
      attrs: {
        d: "M12 6.6C10 5.2 7.2 4.6 3.5 5v13.5c3.7-.4 6.5.2 8.5 1.6 2-1.4 4.8-2 8.5-1.6V5c-3.7-.4-6.5.2-8.5 1.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 6.6C10 5.2 7.2 4.6 3.5 5v13.5c3.7-.4 6.5.2 8.5 1.6 2-1.4 4.8-2 8.5-1.6V5c-3.7-.4-6.5.2-8.5 1.6zM12 6.6v13.5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M15.5 5.3v4.9l1.5-1.1 1.5 1.1V5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-rest': [
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 8.2,
        width: 17,
        height: 11.2,
        rx: 5.6,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 3.5,
        y: 8.2,
        width: 17,
        height: 11.2,
        rx: 5.6,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 11.2c.8 0 1.4.4 2 1.2.6-.8 1.3-1.2 2-1.2 1.2 0 2 1 2 2.2 0 2.2-2.4 3.6-4 4.8-1.6-1.2-4-2.6-4-4.8 0-1.2.8-2.2 2-2.2z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-restore': [
    {
      tag: 'path',
      attrs: {
        d: "M5 14.6v3.2A2.4 2.4 0 0 0 7.4 20.2h9.2A2.4 2.4 0 0 0 19 17.8v-3.2H5z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.8v9.4M8.4 9.8 12 13.2 15.6 9.8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M5 14.6v3.2A2.4 2.4 0 0 0 7.4 20.2h9.2A2.4 2.4 0 0 0 19 17.8v-3.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-roleplay': [
    {
      tag: 'path',
      attrs: {
        d: "M4.6 16.8 6.6 6.4 9.2 14.4 12 5.2 14.8 14.4 17.4 6.4 19.4 16.8z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M4.6 16.8 6.6 6.4 9.2 14.4 12 5.2 14.8 14.4 17.4 6.4 19.4 16.8H4.6zM4.6 16.8h14.8v2.4a2 2 0 0 1-2 2H6.6a2 2 0 0 1-2-2z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 6.6,
        cy: 6.4,
        r: 1.15,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 17.4,
        cy: 6.4,
        r: 1.15,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 5.2,
        r: 1.15,
        fill: "currentColor",
      },
    },
  ],
  'ih-science': [
    {
      tag: 'path',
      attrs: {
        d: "M8.2 14.2h7.6l.8 4.4A2.4 2.4 0 0 1 14.3 21H9.7a2.4 2.4 0 0 1-2.3-2.4z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9 3.5h6M10.2 3.5v7.2L7.2 15.8a5 5 0 0 0 9.6 0L13.8 10.7V3.5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 10.6,
        cy: 17.2,
        r: 1.1,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 13.8,
        cy: 16.2,
        r: 0.9,
        fill: "currentColor",
      },
    },
  ],
  'ih-settings-fill': [
    {
      tag: 'path',
      attrs: {
        fill: "currentColor",
        fillRule: "evenodd",
        d: "M10.27 6.05 10.21 3.59 13.79 3.59 13.73 6.05 16.29 7.53 18.39 6.25 20.18 9.34 18.02 10.52 18.02 13.48 20.18 14.66 18.39 17.75 16.29 16.47 13.73 17.95 13.79 20.41 10.21 20.41 10.27 17.95 7.71 16.47 5.61 17.75 3.82 14.66 5.98 13.48 5.98 10.52 3.82 9.34 5.61 6.25 7.71 7.53z M12 9.4A2.6 2.6 0 1 0 12 14.6 2.6 2.6 0 0 0 12 9.4z",
      },
    },
  ],
  'ih-settings': [
    {
      tag: 'path',
      attrs: {
        d: "M10.27 6.05 10.21 3.59 13.79 3.59 13.73 6.05 16.29 7.53 18.39 6.25 20.18 9.34 18.02 10.52 18.02 13.48 20.18 14.66 18.39 17.75 16.29 16.47 13.73 17.95 13.79 20.41 10.21 20.41 10.27 17.95 7.71 16.47 5.61 17.75 3.82 14.66 5.98 13.48 5.98 10.52 3.82 9.34 5.61 6.25 7.71 7.53z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M10.27 6.05 10.21 3.59 13.79 3.59 13.73 6.05 16.29 7.53 18.39 6.25 20.18 9.34 18.02 10.52 18.02 13.48 20.18 14.66 18.39 17.75 16.29 16.47 13.73 17.95 13.79 20.41 10.21 20.41 10.27 17.95 7.71 16.47 5.61 17.75 3.82 14.66 5.98 13.48 5.98 10.52 3.82 9.34 5.61 6.25 7.71 7.53z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 12,
        r: 2.5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-snack': [
    {
      tag: 'path',
      attrs: {
        d: "M20.6 12.6A8.6 8.6 0 1 1 11.4 3.4a2.6 2.6 0 0 0 3 2.9 2.6 2.6 0 0 0 3.1 3.1 2.6 2.6 0 0 0 3.1 3.2z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M20.6 12.6A8.6 8.6 0 1 1 11.4 3.4a2.6 2.6 0 0 0 3 2.9 2.6 2.6 0 0 0 3.1 3.1 2.6 2.6 0 0 0 3.1 3.2z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 8.4,
        cy: 10,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12.3,
        cy: 14.6,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 16,
        cy: 15.6,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 8.2,
        cy: 15.4,
        r: 1.2,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 9.3,
        r: 1,
        fill: "currentColor",
      },
    },
  ],
  'ih-sparkle': [
    {
      tag: 'path',
      attrs: {
        d: "M10.5 3.5c.6 4 2.6 6 6.5 6.6-3.9.6-5.9 2.6-6.5 6.6-.6-4-2.6-6-6.5-6.6 3.9-.6 5.9-2.6 6.5-6.6z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M10.5 3.5c.6 4 2.6 6 6.5 6.6-3.9.6-5.9 2.6-6.5 6.6-.6-4-2.6-6-6.5-6.6 3.9-.6 5.9-2.6 6.5-6.6zM18 15.2v5M15.5 17.7h5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-star': [
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M12 3.6l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-study': [
    {
      tag: 'path',
      attrs: {
        d: "M15.6 4.6 19.4 8.4 9.2 18.6 4.6 19.4 5.4 14.8z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M15.6 4.6 19.4 8.4 9.2 18.6 4.6 19.4 5.4 14.8zM13.4 6.8l3.8 3.8M7.2 16.8 9.2 18.6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-swim': [
    {
      tag: 'circle',
      attrs: {
        cx: 8.2,
        cy: 8.8,
        r: 3.6,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.8,
        cy: 8.8,
        r: 3.6,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 8.2,
        cy: 8.8,
        r: 3.6,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.8,
        cy: 8.8,
        r: 3.6,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M11.8 8.8h.4M5.2 6.6c-.8.4-1.4 1.2-1.6 2.2M18.8 6.6c.8.4 1.4 1.2 1.6 2.2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.6 16.4q2.2 2.4 4.4 0t4.4 0 4.4 0 4.4 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M3.6 19.8q2.2 2.4 4.4 0t4.4 0 4.4 0 4.4 0",
        stroke: "currentColor",
        strokeOpacity: 0.45,
        strokeWidth: 2,
        strokeLinecap: "round",
        fill: "none",
      },
    },
  ],
  'ih-today-fill': [
    {
      tag: 'path',
      attrs: {
        fill: "currentColor",
        fillRule: "evenodd",
        d: "M7.5 3.5c.6 0 1 .4 1 1V6h7V4.5c0-.6.4-1 1-1s1 .4 1 1V6h.6A3.4 3.4 0 0 1 21 9.4v9.2A3.4 3.4 0 0 1 17.6 22H6.4A3.4 3.4 0 0 1 3 18.6V9.4A3.4 3.4 0 0 1 6.4 6H7V4.5c0-.6.4-1 1-1zM5 10.2h14v8.4A1.4 1.4 0 0 1 17.6 20H6.4A1.4 1.4 0 0 1 5 18.6zM8.2 13.2h5.2c.7 0 1.2.5 1.2 1.2v3.2c0 .7-.5 1.2-1.2 1.2H8.2c-.7 0-1.2-.5-1.2-1.2v-3.2c0-.7.5-1.2 1.2-1.2z",
      },
    },
  ],
  'ih-today': [
    {
      tag: 'rect',
      attrs: {
        x: 4.5,
        y: 5.2,
        width: 15,
        height: 15.2,
        rx: 3.2,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4.5,
        y: 5.2,
        width: 15,
        height: 15.2,
        rx: 3.2,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.2 3.8v4M15.8 3.8v4M4.5 10.2h15",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 8.4,
        y: 13,
        width: 4.4,
        height: 4.4,
        rx: 1.2,
        fill: "currentColor",
      },
    },
  ],
  'ih-travel': [
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 8.4,
        width: 16,
        height: 11.4,
        rx: 3,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 8.4,
        width: 16,
        height: 11.4,
        rx: 3,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M9 8.4V6.2a3 3 0 0 1 6 0V8.4M4 13.6h16",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 8.2,
        cy: 16.6,
        r: 1,
        fill: "currentColor",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 15.8,
        cy: 16.6,
        r: 1,
        fill: "currentColor",
      },
    },
  ],
  'ih-verified': [
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 4,
        width: 16,
        height: 16,
        rx: 5,
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'rect',
      attrs: {
        x: 4,
        y: 4,
        width: 16,
        height: 16,
        rx: 5,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M8.2 12.2 10.8 14.8 16 9.4",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
  ],
  'ih-warn': [
    {
      tag: 'path',
      attrs: {
        d: "M10.3 4.4a2 2 0 0 1 3.4 0l7.2 12.5a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3z",
        fill: "currentColor",
        fillOpacity: 0.18,
      },
    },
    {
      tag: 'path',
      attrs: {
        d: "M10.3 4.4a2 2 0 0 1 3.4 0l7.2 12.5a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3zM12 9.5v3.8",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    },
    {
      tag: 'circle',
      attrs: {
        cx: 12,
        cy: 16.6,
        r: 1.2,
        fill: "currentColor",
      },
    },
  ],
};

const IH_ICON_NAME_SET: ReadonlySet<string> = new Set(IH_ICON_NAMES);

/** Accepts `ih-homework` or `homework`. Unknown names return null. */
export function resolveIhIconName(name: string | null | undefined): IhIconName | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (IH_ICON_NAME_SET.has(trimmed)) return trimmed as IhIconName;
  const prefixed = trimmed.startsWith('ih-') ? trimmed : `ih-${trimmed}`;
  if (IH_ICON_NAME_SET.has(prefixed)) return prefixed as IhIconName;
  return null;
}
