import { LogMessageKind } from "./LogMessageKind";

/**
 * Represents a log message.
 */

export type LogMessage = {
  project: string;
  created: number;
  kind: LogMessageKind;
  tags: string[];
  stack?: string;
  message: string;
};
