# Live projects (idea, not planned yet)

_Parked idea. It depends on Projects (folders, `.cproject`, shared styles) shipping first, and gets its own design and plan when it's picked up._

## The idea

Today a live session shares one file: the host opens a board or a design, presses **Share**, and guests edit that file. A **live project** would share the whole project instead: guests see the project home, browse its folders and open any of its boards and designs, without the host opening each one and sending a new link.

## Comments

- **Worth it, but after Projects is stable.** It fits agency work (a teammate reviewing a client's month of posts), but single-file sessions already cover "look at this one file". Build it when people ask to move between files during a session.
- **Send files on demand, not all at once.** A session today uploads the whole file (images included) to each guest when they join. A project can hold dozens of files, so the host should send the file list first and a file only when a guest opens it.
- **One connection, many documents.** Guests keep one connection to the host, carrying several documents: the project (its styles) and each open file. The current session protocol carries one document, so it needs a document id on its messages.
- **The project's styles as their own synced document.** Projects v1 should keep the `.cproject` styles in memory as a Yjs document (written to the file on save), like boards and designs. Live projects then sync style edits the same way they sync elements, with nothing new to invent.
- **Who can change the folder.** Creating, moving, renaming and deleting files touch the host's disk. Start with only the host doing that; guests with **Can edit** edit the files' content and the project styles, guests with **Can view** only look.
- **Files the host doesn't have open.** The host's app has to open (and autosave) any file a guest opens, even if the host isn't looking at it, and close it when no one is.
- **Ending the session** closes every file guests had open, as it does today for one file.

## Open questions for when it's planned

- Can a guest create a new file in the project, or only the host?
- Does following someone (avatars in the top bar) jump to the file they're in?
- Does a single-file session of a project file let the guest see that it belongs to a project at all?
