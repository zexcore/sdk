import { RTMClient, createClient } from "@zexcore/rtm-client";
import { ZexcoreOptions } from "./models/options";
import { RTMClientOptions } from "@zexcore/rtm-client/dist/RTMClientOptions";
import { AuthenticationId } from "./models/AuthenticationId";
import { Project } from "./models/Project";
import { LogMessage } from "./models/LogMessage";
import { LogMessageKind } from "./models/LogMessageKind";

let client: RTMClient;
let authentication: AuthenticationId | undefined = undefined;
let options: ZexcoreOptions | undefined;
let rtmOptions: RTMClientOptions | undefined;
let project: Project | undefined;

/**
 * Initializes the zexcore and RTM client API for logging.
 */
export async function initialize(
  _options: ZexcoreOptions,
  _rtmOptions?: RTMClientOptions
) {
  options = _options;
  rtmOptions = {
    ...(_rtmOptions ? _rtmOptions : {}),
    authenticationData: "api:" + _options.apiKey,
  };
  client = createClient(_options.endpoint, _rtmOptions);
  project = await getProject();
  return project;
}

/**
 * Returns the current authentication token.
 * @returns
 */
export function getAuthenticationId() {
  return authentication || undefined;
}

/**
 * Return the current project information.
 */
export async function getProject() {
  if (!options?.projectId) throw new Error("Project ID is not set. ");
  if (!client) throw new Error("Please initialize the client first. ");
  if (!client.isAuthenticated)
    throw new Error("Please authenticate using API key first. ");
  const proj = await client.callWait<Project>(
    "libGetProject",
    options?.projectId
  );
  if (!proj) throw new Error("Invalid project id. ");
  return proj;
}

/**
 * Sends the specified log message.
 * @param msg
 */
export async function logMessage(
  msg: Omit<Partial<LogMessage>, "project" | "created">
) {
  if (!msg.kind) msg.kind = LogMessageKind.Information;
  await client.call("libLogMessage", {
    ...msg,
    project: project!.id,
    created: new Date().getTime(),
  });
}

/**
 * Hooks the logMessage with console.* functions to automatically send console logs to the API. In adition to message kinds, messages are also tagged with the specified tags.
 */
export function hookWithConsole(tags?: string[]) {
  // Bind to console.

  let _info = console.info.bind(console);
  console.info = function (...args: any[]) {
    // default &  console.log()
    _info.apply(console, args);
    if (args[args.length - 1] === false) {
      return;
    }
    let _stack = "";
    if (args.length > 1) {
      for (let ag of args.slice(1)) {
        _stack += ag;
      }
    }
    // Log on zexcore
    logMessage({
      kind: LogMessageKind.Information,
      message: args[0],
      tags: tags,
      stack: Boolean(_stack) ? _stack : undefined,
    });
  };

  let _log = console.log.bind(console);
  console.log = function (...args: any[]) {
    // default &  console.log()
    _log.apply(console, args);
    if (args[args.length - 1] === false) {
      return;
    }
    let _stack = "";
    if (args.length > 1) {
      for (let ag of args.slice(1)) {
        _stack += ag;
      }
    }
    // Log on zexcore
    logMessage({
      kind: LogMessageKind.Information,
      message: args[0],
      tags: tags,
      stack: Boolean(_stack) ? _stack : undefined,
    });
  };
  // Bind to console.
  let _logW = console.warn.bind(console);
  console.warn = function (...args: any[]) {
    // default &  console.log()
    _logW.apply(console, args);
    if (args[args.length - 1] === false) {
      return;
    }
    let _stack = "";
    if (args.length > 1) {
      for (let ag of args.slice(1)) {
        _stack += ag;
      }
    }
    // Log on zexcore
    logMessage({
      kind: LogMessageKind.Warning,
      message: args[0],
      tags: tags,
      stack: Boolean(_stack) ? _stack : undefined,
    });
  };
  // Bind to console.
  let _logE = console.error.bind(console);
  console.error = function (...args: any[]) {
    // default &  console.log()
    _logE.apply(console, args);
    if (args[args.length - 1] === false) {
      return;
    }
    let _stack = "";
    if (args.length > 1) {
      for (let ag of args.slice(1)) {
        _stack += ag;
      }
    }
    // Log on zexcore
    logMessage({
      kind: LogMessageKind.Error,
      message: args[0],
      stack: Boolean(_stack) ? _stack : undefined,
      tags: tags,
    });
  };
}
