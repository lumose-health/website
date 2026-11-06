type Flags = {
  /** Show the rename pill in the hero. */
  showRename: boolean;
  /** Use vendor and provider logos. Initials are shown when this is off. */
  logosCleared: boolean;
  /** Show the notice under the AI provider section. */
  showProviderNotice: boolean;
};

export const flags: Flags = {
  showRename: true,
  logosCleared: true,
  showProviderNotice: true,
};
