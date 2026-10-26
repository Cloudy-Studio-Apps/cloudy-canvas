# Effects

Figma's Effects section and more: drop and inner shadows, layer and background blur, noise, texture and glass, drawn on the GPU, with effect styles.

- **Tier:** core
- **Requires:** core; after: mask
- **Contributes:** designCanvas: `effectRenderers`, `effects`; designEditor: `overlays`, `propertySections`; `designEffectTypes`, `designStyleTypes`
- **Points it owns:** `designEffectTypes` (`ui/effects.points.ts`): the effect types in the "+" menu; shader-effect and plugins add theirs
- **MCP tools:** —
- **Files:** `effect.types.ts`, `create-effect.ts`, `effect-args.ts` (what agents give), `design-effects.ts`, `renderers/` (the shaders), `ui/` (the section, editors, fields, `effects.points.ts`).

## How it works

- **Effects** (`effects/`, Figma's Effects section and more): `DesignNode.effects` (`NodeEffect`s, bottom to top) of the built-in `DesignEffect` types (`effect.types.ts`, defaults in `EFFECT_DEFAULTS`, `createEffect`): `drop-shadow` (color, opacity, x, y, blur, spread, `showBehind`), `inner-shadow`, `layer-blur` (even or `progressive` from `start` to `end`), `background-blur` (shows through translucent fills), `noise` (`mono`/`duo`/`multi`), `texture`, `glass` (light angle and intensity, refraction, depth, dispersion, frost, splay) and `shader`. `designEffects` is the `effects` hook (a visible node with visible effects: a scope over it and what it holds) and `treeSlots` (`core/tree/`, shared with `designMasks`) nests effect scopes and masks along the tree (a blurred mask feathers). Renderers in `renderers/` (noise and layer-space shaders read `LOCAL_GLSL`/`localUniforms`). UI: the module's point `designEffectTypes` (`ui/effects.points.ts`; plugins reach it as `api.design.effects.effectTypes`) of `EffectTypeEntry`s, written with `defineEffectType` (menu label and icon, `create`, `summary`, `editor`), the Effects section (`ui/effects-section.tsx`: the "+" menu, rows that drag to reorder, eye, remove, the editor in a popover; drags in editors are one undo step), the editors (`ui/editors/`, fields in `ui/fields/`: `ScrubField` scrubs by its label, presets for shadows and glass) and `EffectHandles` (an overlay while an editor is open: a shadow's offset and blur, a progressive blur's ends, glass's light; `effect-edit-store`). Agents: `effects` in `create_nodes`/`update_nodes`, read by each type's reader (`setEffectReader`, `readNodeEffects` in core); summaries list them. The Figma import maps shadows, blurs, noise and texture (`fig-effects.ts`), from effect styles too. Plugins get `api.design.effects`.
