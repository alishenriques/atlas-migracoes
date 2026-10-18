declare module "mapshaper" {
  const mapshaper: {
    /** Runs mapshaper commands on in-memory inputs; resolves to the output files by name. */
    applyCommands(commands: string, inputs: Record<string, unknown>): Promise<Record<string, string | undefined>>;
  };
  export default mapshaper;
}
