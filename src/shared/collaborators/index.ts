// Collaborators in the app's chrome (agents now, people in shared rooms later): their avatars,
// the menu list, what they're doing and following them. The canvas side (cursors, selections,
// the follow camera) is `@canvas-ui`'s `CollaboratorLayer`.
export type * from "./collaborator-avatar.types";
export type * from "./collaborator-list.types";
export type * from "./collaborator-stack.types";
export type * from "./use-follow-toggle.types";
export { CollaboratorAvatar } from "./collaborator-avatar";
export { CollaboratorList } from "./collaborator-list";
export { CollaboratorStack } from "./collaborator-stack";
export { collaboratorPlaceText, collaboratorStatusText } from "./collaborator-status-text";
export { useCollaborators } from "./use-collaborators";
export { useFollowToggle } from "./use-follow-toggle";
