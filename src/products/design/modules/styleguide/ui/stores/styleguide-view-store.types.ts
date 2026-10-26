/** What the Design system's sidebar works on: a category, or one group of it. */
export interface StyleguideSelection {
  category: string;
  group?: string;
}

export interface StyleguideViewState {
  selected: StyleguideSelection | null;
  select(selected: StyleguideSelection | null): void;
}
