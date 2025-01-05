/**
 * A database of known tools that can be added to a project.
 */
export interface Database {
  /** The name of the tool. */
  name: string;
  /** The type of the source. */
  type: 'crate' | 'url';
  /**
   * The source of the tool.
   * - For crates, this is the name of the crate.
   * - For url, this is the URL of the installation script.
   */
  source: string;
}
