export default class CoreAPIError extends Error {
  constructor(message: string, error?: Error) {
    super(message);

    this.name = 'CoreAPI Error';
    if (error !== undefined) {
      this.name = `${this.name}: ${message}`;
      this.stack = error.stack;
    }
  }
}