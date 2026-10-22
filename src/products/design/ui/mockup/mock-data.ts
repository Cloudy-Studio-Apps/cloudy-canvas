import type { MockFrame, MockLayer } from "./mock-data.types";

// Static content for the design editor mockup. Not real document data.

export const MOCK_PAGES = ["Cover", "Landing page", "Components"];

export const MOCK_LAYERS: MockLayer[] = [
  {
    id: "hero",
    name: "Hero · Desktop",
    type: "frame",
    children: [
      { id: "hero-nav", name: "Navigation", type: "component" },
      { id: "hero-title", name: "Headline", type: "text" },
      { id: "hero-copy", name: "Supporting copy", type: "text" },
      {
        id: "hero-cta",
        name: "Actions",
        type: "group",
        children: [
          { id: "hero-cta-primary", name: "Button / Primary", type: "component" },
          { id: "hero-cta-secondary", name: "Button / Secondary", type: "component" },
        ],
      },
      { id: "hero-image", name: "seal-illustration.png", type: "image" },
    ],
  },
  { id: "features", name: "Features", type: "frame" },
  { id: "pricing", name: "Pricing", type: "frame" },
  { id: "mobile", name: "Hero · Mobile", type: "frame" },
  { id: "footer", name: "Footer", type: "frame" },
  { id: "buttons", name: "Buttons", type: "component" },
  { id: "card-bg", name: "Card background", type: "rectangle" },
  { id: "moodboard", name: "Moodboard reference.jpg", type: "image" },
];

export const MOCK_FRAMES: MockFrame[] = [
  {
    id: "hero",
    name: "Hero · Desktop",
    x: 0,
    y: 0,
    w: 360,
    h: 225,
    fill: "#ffffff",
    blocks: [
      { x: 0.06, y: 0.07, w: 0.88, h: 0.06, color: "#eef1f5" },
      { x: 0.06, y: 0.28, w: 0.42, h: 0.1, color: "#2b3140" },
      { x: 0.06, y: 0.42, w: 0.36, h: 0.04, color: "#c9ced8" },
      { x: 0.06, y: 0.49, w: 0.3, h: 0.04, color: "#c9ced8" },
      { x: 0.06, y: 0.62, w: 0.14, h: 0.08, color: "#4c8bd6" },
      { x: 0.22, y: 0.62, w: 0.14, h: 0.08, color: "#eef1f5" },
      { x: 0.56, y: 0.24, w: 0.38, h: 0.62, color: "#dcebfa" },
    ],
  },
  {
    id: "features",
    name: "Features",
    x: 0,
    y: 265,
    w: 360,
    h: 170,
    fill: "#ffffff",
    blocks: [
      { x: 0.3, y: 0.1, w: 0.4, h: 0.08, color: "#2b3140" },
      { x: 0.06, y: 0.32, w: 0.26, h: 0.56, color: "#f6efe4" },
      { x: 0.37, y: 0.32, w: 0.26, h: 0.56, color: "#eef1f5" },
      { x: 0.68, y: 0.32, w: 0.26, h: 0.56, color: "#fbe9e2" },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    x: 400,
    y: 265,
    w: 260,
    h: 170,
    fill: "#2b3140",
    blocks: [
      { x: 0.08, y: 0.12, w: 0.5, h: 0.08, color: "#ffffff" },
      { x: 0.08, y: 0.32, w: 0.4, h: 0.56, color: "#3a4254" },
      { x: 0.52, y: 0.32, w: 0.4, h: 0.56, color: "#4c8bd6" },
    ],
  },
  {
    id: "mobile",
    name: "Hero · Mobile",
    x: 400,
    y: 0,
    w: 120,
    h: 225,
    fill: "#ffffff",
    blocks: [
      { x: 0.1, y: 0.06, w: 0.8, h: 0.05, color: "#eef1f5" },
      { x: 0.1, y: 0.18, w: 0.8, h: 0.3, color: "#dcebfa" },
      { x: 0.1, y: 0.54, w: 0.7, h: 0.06, color: "#2b3140" },
      { x: 0.1, y: 0.64, w: 0.55, h: 0.03, color: "#c9ced8" },
      { x: 0.1, y: 0.76, w: 0.8, h: 0.07, color: "#4c8bd6" },
    ],
  },
  {
    id: "footer",
    name: "Footer",
    x: 560,
    y: 0,
    w: 100,
    h: 100,
    fill: "#f6efe4",
    blocks: [
      { x: 0.12, y: 0.15, w: 0.5, h: 0.1, color: "#2b3140" },
      { x: 0.12, y: 0.4, w: 0.76, h: 0.06, color: "#d8c7a8" },
      { x: 0.12, y: 0.52, w: 0.6, h: 0.06, color: "#d8c7a8" },
    ],
  },
];
