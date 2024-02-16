import { RtmClient } from "@zexcore/rtm-client";
import { ZexcoreOptions } from "./models/options";
import { RTMClientOptions } from "@zexcore/rtm-client/dist/RTMClientOptions";
import { AuthenticationId } from "./models/AuthenticationId";
import { Event, LogMessage, LogMessageKind, Project } from "@zexcore/types";

let client: RtmClient;
let authentication: AuthenticationId | undefined = undefined;
let options: ZexcoreOptions | undefined;
let rtmOptions: RTMClientOptions | undefined;

/**
 * Initializes the zexcore and RTM client API for logging. Returns only after project is loaded.
 */
export async function initialize(
  _options: ZexcoreOptions,
  _rtmOptions?: RTMClientOptions
) {
  return new Promise((resolve, reject) => {
    options = _options;
    rtmOptions = {
      ...(_rtmOptions ? _rtmOptions : {}),
      authenticationData: "api:" + _options.apiKey,
      async onOpen() {
        _rtmOptions?.onOpen?.();
        const proj = await getProject();
        resolve(proj);
      },
    };
    try {
      client = new RtmClient(_options.endpoint, rtmOptions);
    } catch (err: any) {
      reject(err);
    }
  });
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
  if (!client.Authenticated)
    throw new Error("Please authenticate using API key first. ");
  const proj = await client.CallWait<Project>(
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
  try {
    if (!msg.kind) msg.kind = LogMessageKind.Information;
    await client.Call("libLogMessage", {
      ...msg,
      project: options?.projectId!,
      created: new Date().getTime(),
    });
  } catch (err: any) {}
}

/**
 * Sends the specified log message.
 * @param msg
 */
export async function logEvent(
  msg: Omit<Partial<Event>, "id" | "project" | "timestamp">
) {
  try {
    await client.Call("libLogEvent", {
      ...msg,
      project: options?.projectId!,
    });
  } catch (err: any) {}
}

/**
 * Hooks the logMessage with console.* functions to automatically send console logs to the API. In adition to message kinds, messages are also tagged with the specified tags.
 */
export function hookWithConsole(tags?: string[]) {
  // Bind to console.
  let _info = console.info.bind(console);
  console.info = function (...args: any[]) {
    // default &  console.log()
    if (args[1] === false) {
      args.splice(1, 1);
      _info.apply(console, args);
      return;
    }
    _info.apply(console, args);
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
    if (args[1] === false) {
      args.splice(1, 1);
      _log.apply(console, args);
      return;
    }
    _log.apply(console, args);
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
    if (args[1] === false) {
      args.splice(1, 1);
      _logW.apply(console, args);
      return;
    }
    _logW.apply(console, args);
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
    if (args[1] === false) {
      args.splice(1, 1);
      _logE.apply(console, args);
      return;
    }
    _logE.apply(console, args);
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
