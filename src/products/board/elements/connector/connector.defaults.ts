import type { ConnectorDefaults } from "./connector.types";

/** Connector geometry, in world units (quick-connect dots in screen px). */
export const CONNECTOR_DEFAULTS = {
  lineWidth: 2,
  stub: 24,
  headRoom: 10,
  headLength: 12,
  headAngle: Math.PI / 7,
  reach: 4,
  quickConnectOffset: 18,
  quickConnectRadius: 7,
} as const satisfies ConnectorDefaults;
