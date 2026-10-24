import { FollowBar } from "./follow-bar";
import { FollowFrame } from "./follow-frame";
import { useFollowCollaborator } from "./use-follow-collaborator";

/** Following someone: the camera tracks their view, framed in their colour, with the bar. */
export function CollaboratorFollow() {
  const followed = useFollowCollaborator();
  if (!followed) return null;
  return (
    <>
      <FollowFrame color={followed.collaborator.color} />
      <FollowBar {...followed} />
    </>
  );
}
