export interface DatabaseToolOptions {
  /** The git information of the tool. */
  git?: {
    /** The git repository of the tool. */
    url?: string;
    /** The branch of the git repository. */
    branch?: string;
  };
  asset?: {
    page?: string;
  };
}

/**
 * A database of known tools that can be added to a project.
 */
export interface DatabaseTool {
  /** The label of the tool for display. */
  name: string;
  /** A unique string identifier for the tool. */
  id: string;
  /** The type of the source. */
  type: 'crate' | 'url' | 'asset';
  /**
   * The source of the tool.
   * - For crates, this is the name of the crate.
   * - For url, this is the URL of the installation script.
   */
  source?: string;
  /** Additional options for the tool. */
  options?: DatabaseToolOptions;
}
