import { AsyncLocalStorage } from 'node:async_hooks';
import { currentDate, REGISTER_SOURCE_EVENT_V2, RegisterSourceEventSchemaV2, API_VERSIONS, supportsFeature, ServerTaskSchema, RunTaskResponseWithCachedTasksBodySchema, ApiEventLogSchema, CancelRunsForEventSchema, JobRunStatusRecordSchema, TriggerSourceSchema, RegisterScheduleResponseBodySchema, ConnectionAuthSchema, GetEventSchema, urlWithSearchParams, GetRunSchema, GetRunStatusesSchema, GetRunsSchema, InvokeJobResponseSchema, CancelRunsForJobSchema, EphemeralEventDispatcherResponseBodySchema, RequestWithRawBodySchema, deepMergeFilters, ScheduledPayloadSchema, WebhookSourceRequestHeadersSchema, HttpEndpointRequestHeadersSchema, HttpSourceRequestHeadersSchema, PreprocessRunBodySchema, RunJobBodySchema, InitializeTriggerBodySchema, MISSING_CONNECTION_NOTIFICATION, MissingConnectionNotificationPayloadSchema, MISSING_CONNECTION_RESOLVED_NOTIFICATION, MissingConnectionResolvedNotificationPayloadSchema, ErrorWithStackSchema, calculateRetryAt, assertExhaustive, KeyValueStoreResponseBodySchema, REGISTER_WEBHOOK, RegisterWebhookPayloadSchema } from '@trigger.dev/core';
import { Logger, BloomFilter } from '@trigger.dev/core-backend';
import EventEmitter from 'node:events';
import { env } from 'node:process';
import { z } from 'zod';
import crypto, { webcrypto, createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import cronstrue from 'cronstrue';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _TypedAsyncLocalStorage = class _TypedAsyncLocalStorage {
  constructor() {
    this.storage = new AsyncLocalStorage();
  }
  runWith(context, fn) {
    return this.storage.run(context, fn);
  }
  getStore() {
    return this.storage.getStore();
  }
};
__name(_TypedAsyncLocalStorage, "TypedAsyncLocalStorage");
var TypedAsyncLocalStorage = _TypedAsyncLocalStorage;

// src/runLocalStorage.ts
var runLocalStorage = new TypedAsyncLocalStorage();

// src/utils.ts
function slugifyId(input) {
  const replaceSpacesWithDash = input.toLowerCase().replace(/\s+/g, "-");
  const removeNonUrlSafeChars = replaceSpacesWithDash.replace(/[^a-zA-Z0-9-._~]/g, "");
  return removeNonUrlSafeChars;
}
__name(slugifyId, "slugifyId");

// src/job.ts
var _validate, validate_fn;
var _Job = class _Job {
  constructor(options) {
    // Make sure the id is valid (must only contain alphanumeric characters and dashes)
    // Make sure the version is valid (must be a valid semver version)
    __privateAdd(this, _validate);
    this.options = options;
    __privateMethod(this, _validate, validate_fn).call(this);
  }
  /**
  * Attaches the job to a client. This is called automatically when you define a job using `client.defineJob()`.
  */
  attachToClient(client) {
    client.attach(this);
    return this;
  }
  get id() {
    return slugifyId(this.options.id);
  }
  get enabled() {
    return typeof this.options.enabled === "boolean" ? this.options.enabled : true;
  }
  get name() {
    return this.options.name;
  }
  get trigger() {
    return this.options.trigger;
  }
  get version() {
    return this.options.version;
  }
  get logLevel() {
    return this.options.logLevel;
  }
  get integrations() {
    return Object.keys(this.options.integrations ?? {}).reduce((acc, key) => {
      const integration = this.options.integrations[key];
      acc[key] = {
        id: integration.id,
        metadata: integration.metadata,
        authSource: integration.authSource
      };
      return acc;
    }, {});
  }
  toJSON() {
    const internal = this.options.__internal;
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      event: this.trigger.event,
      trigger: this.trigger.toJSON(),
      integrations: this.integrations,
      startPosition: "latest",
      enabled: this.enabled,
      preprocessRuns: this.trigger.preprocessRuns,
      internal,
      concurrencyLimit: typeof this.options.concurrencyLimit === "number" ? this.options.concurrencyLimit : typeof this.options.concurrencyLimit === "object" ? {
        id: this.options.concurrencyLimit.id,
        limit: this.options.concurrencyLimit.limit
      } : void 0
    };
  }
  async invoke(param1, param2 = void 0, param3 = void 0) {
    const triggerClient = this.client;
    if (!triggerClient) {
      throw new Error("Cannot invoke a job that is not attached to a client. Make sure you attach the job to a client before invoking it.");
    }
    const runStore = runLocalStorage.getStore();
    if (typeof param1 === "string") {
      if (!runStore) {
        throw new Error("Cannot invoke a job from outside of a run when passing a cacheKey. Make sure you are running the job from within a run or use the invoke method without the cacheKey.");
      }
      const options = param3 ?? {};
      return await runStore.io.runTask(param1, async (task) => {
        const result = await triggerClient.invokeJob(this.id, param2, {
          idempotencyKey: task.idempotencyKey,
          ...options
        });
        task.outputProperties = [
          {
            label: "Run",
            text: result.id,
            url: `/orgs/${runStore.ctx.organization.slug}/projects/${runStore.ctx.project.slug}/jobs/${this.id}/runs/${result.id}/trigger`
          }
        ];
        return result;
      }, {
        name: `Manually Invoke '${this.name}'`,
        params: param2,
        properties: [
          {
            label: "Job",
            text: this.id,
            url: `/orgs/${runStore.ctx.organization.slug}/projects/${runStore.ctx.project.slug}/jobs/${this.id}`
          },
          {
            label: "Env",
            text: runStore.ctx.environment.slug
          }
        ]
      });
    }
    if (runStore) {
      throw new Error("Cannot invoke a job from within a run without a cacheKey.");
    }
    return await triggerClient.invokeJob(this.id, param1, param2);
  }
  async invokeAndWaitForCompletion(cacheKey, payload, timeoutInSeconds = 60 * 60, options = {}) {
    const triggerClient = this.client;
    if (!triggerClient) {
      throw new Error("Cannot invoke a job that is not attached to a client. Make sure you attach the job to a client before invoking it.");
    }
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      throw new Error("Cannot invoke a job from outside of a run using invokeAndWaitForCompletion. Make sure you are running the job from within a run or use the invoke method instead.");
    }
    const { io, ctx } = runStore;
    return await io.runTask(cacheKey, async (task) => {
      const parsedPayload = this.trigger.event.parseInvokePayload ? this.trigger.event.parseInvokePayload(payload) ? payload : void 0 : payload;
      const result = await triggerClient.invokeJob(this.id, parsedPayload, {
        idempotencyKey: task.idempotencyKey,
        callbackUrl: task.callbackUrl ?? void 0,
        ...options
      });
      task.outputProperties = [
        {
          label: "Run",
          text: result.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}/runs/${result.id}/trigger`
        }
      ];
      return {};
    }, {
      name: `Manually Invoke '${this.name}' and wait for completion`,
      params: payload,
      properties: [
        {
          label: "Job",
          text: this.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}`
        },
        {
          label: "Env",
          text: ctx.environment.slug
        }
      ],
      callback: {
        enabled: true,
        timeoutInSeconds
      }
    });
  }
  async batchInvokeAndWaitForCompletion(cacheKey, batch) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      throw new Error("Cannot invoke a job from outside of a run using batchInvokeAndWaitForCompletion.");
    }
    if (batch.length === 0) {
      return [];
    }
    if (batch.length > 25) {
      throw new Error(`Cannot batch invoke more than 25 items. You tried to batch invoke ${batch.length} items.`);
    }
    const { io, ctx } = runStore;
    const results = await io.parallel(cacheKey, batch, async (item, index) => {
      return await this.invokeAndWaitForCompletion(String(index), item.payload, item.timeoutInSeconds ?? 60 * 60, item.options);
    }, {
      name: `Batch Invoke '${this.name}'`,
      properties: [
        {
          label: "Job",
          text: this.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}`
        },
        {
          label: "Env",
          text: ctx.environment.slug
        }
      ]
    });
    return results;
  }
};
_validate = new WeakSet();
validate_fn = /* @__PURE__ */ __name(function() {
  if (!this.version.match(/^(\d+)\.(\d+)\.(\d+)$/)) {
    throw new Error(`Invalid job version: "${this.version}". Job versions must be valid semver versions.`);
  }
}, "#validate");
__name(_Job, "Job");
var Job = _Job;

// package.json
var version = "2.3.18";

// src/errors.ts
var _ResumeWithTaskError = class _ResumeWithTaskError {
  constructor(task) {
    this.task = task;
  }
};
__name(_ResumeWithTaskError, "ResumeWithTaskError");
var ResumeWithTaskError = _ResumeWithTaskError;
var _ResumeWithParallelTaskError = class _ResumeWithParallelTaskError {
  constructor(task, childErrors) {
    this.task = task;
    this.childErrors = childErrors;
  }
};
__name(_ResumeWithParallelTaskError, "ResumeWithParallelTaskError");
var ResumeWithParallelTaskError = _ResumeWithParallelTaskError;
var _RetryWithTaskError = class _RetryWithTaskError {
  constructor(cause, task, retryAt) {
    this.cause = cause;
    this.task = task;
    this.retryAt = retryAt;
  }
};
__name(_RetryWithTaskError, "RetryWithTaskError");
var RetryWithTaskError = _RetryWithTaskError;
var _CanceledWithTaskError = class _CanceledWithTaskError {
  constructor(task) {
    this.task = task;
  }
};
__name(_CanceledWithTaskError, "CanceledWithTaskError");
var CanceledWithTaskError = _CanceledWithTaskError;
var _YieldExecutionError = class _YieldExecutionError {
  constructor(key) {
    this.key = key;
  }
};
__name(_YieldExecutionError, "YieldExecutionError");
var YieldExecutionError = _YieldExecutionError;
var _AutoYieldExecutionError = class _AutoYieldExecutionError {
  constructor(location, timeRemaining, timeElapsed) {
    this.location = location;
    this.timeRemaining = timeRemaining;
    this.timeElapsed = timeElapsed;
  }
};
__name(_AutoYieldExecutionError, "AutoYieldExecutionError");
var AutoYieldExecutionError = _AutoYieldExecutionError;
var _AutoYieldWithCompletedTaskExecutionError = class _AutoYieldWithCompletedTaskExecutionError {
  constructor(id, properties, data, output) {
    this.id = id;
    this.properties = properties;
    this.data = data;
    this.output = output;
  }
};
__name(_AutoYieldWithCompletedTaskExecutionError, "AutoYieldWithCompletedTaskExecutionError");
var AutoYieldWithCompletedTaskExecutionError = _AutoYieldWithCompletedTaskExecutionError;
var _ParsedPayloadSchemaError = class _ParsedPayloadSchemaError {
  constructor(schemaErrors) {
    this.schemaErrors = schemaErrors;
  }
};
__name(_ParsedPayloadSchemaError, "ParsedPayloadSchemaError");
var ParsedPayloadSchemaError = _ParsedPayloadSchemaError;
function isTriggerError(err) {
  return err instanceof ResumeWithTaskError || err instanceof RetryWithTaskError || err instanceof CanceledWithTaskError || err instanceof YieldExecutionError || err instanceof AutoYieldExecutionError || err instanceof AutoYieldWithCompletedTaskExecutionError || err instanceof ResumeWithParallelTaskError;
}
__name(isTriggerError, "isTriggerError");
var _ErrorWithTask = class _ErrorWithTask extends Error {
  constructor(cause, message) {
    super(message);
    this.cause = cause;
  }
};
__name(_ErrorWithTask, "ErrorWithTask");
var ErrorWithTask = _ErrorWithTask;
var retry = {
  standardBackoff: {
    limit: 8,
    factor: 1.8,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 3e4,
    randomize: true
  },
  exponentialBackoff: {
    limit: 8,
    factor: 2,
    minTimeoutInMs: 1e3,
    maxTimeoutInMs: 3e4,
    randomize: true
  }
};

// src/status.ts
var _TriggerStatus = class _TriggerStatus {
  constructor(id, io) {
    this.id = id;
    this.io = io;
  }
  async update(key, status) {
    const properties = [];
    if (status.label) {
      properties.push({
        label: "Label",
        text: status.label
      });
    }
    if (status.state) {
      properties.push({
        label: "State",
        text: status.state
      });
    }
    return await this.io.runTask(key, async (task) => {
      return await this.io.triggerClient.updateStatus(this.io.runId, this.id, status);
    }, {
      name: status.label ?? `Status update`,
      icon: "bell",
      params: {
        ...status
      },
      properties
    });
  }
};
__name(_TriggerStatus, "TriggerStatus");
var TriggerStatus = _TriggerStatus;
var EventSpecificationExampleSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  payload: z.any()
});
function waitForEventSchema(schema) {
  return z.object({
    id: z.string(),
    name: z.string(),
    source: z.string(),
    payload: schema,
    timestamp: z.coerce.date(),
    context: z.any().optional(),
    accountId: z.string().optional()
  });
}
__name(waitForEventSchema, "waitForEventSchema");

// src/store/keyValueStore.ts
var _namespacedKey, namespacedKey_fn, _sharedProperties, sharedProperties_fn;
var _KeyValueStore = class _KeyValueStore {
  constructor(apiClient, type = null, namespace = "") {
    __privateAdd(this, _namespacedKey);
    __privateAdd(this, _sharedProperties);
    this.apiClient = apiClient;
    this.type = type;
    this.namespace = namespace;
  }
  async delete(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.delete(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.delete(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param2));
    }, {
      name: "Key-Value Store Delete",
      icon: "database-minus",
      params: {
        key: param2
      },
      properties: __privateMethod(this, _sharedProperties, sharedProperties_fn).call(this, param2),
      style: {
        style: "minimal"
      }
    });
  }
  async get(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.get(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.get(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param2));
    }, {
      name: "Key-Value Store Get",
      icon: "database-export",
      params: {
        key: param2
      },
      properties: __privateMethod(this, _sharedProperties, sharedProperties_fn).call(this, param2),
      style: {
        style: "minimal"
      }
    });
  }
  async has(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.has(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.has(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param2));
    }, {
      name: "Key-Value Store Has",
      icon: "database-search",
      params: {
        key: param2
      },
      properties: __privateMethod(this, _sharedProperties, sharedProperties_fn).call(this, param2),
      style: {
        style: "minimal"
      }
    });
  }
  async set(param1, param2, param3) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.set(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param1), param2);
    }
    const { io } = runStore;
    if (!param2 || typeof param2 !== "string") {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    const value = param3;
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.set(__privateMethod(this, _namespacedKey, namespacedKey_fn).call(this, param2), value);
    }, {
      name: "Key-Value Store Set",
      icon: "database-plus",
      params: {
        key: param2,
        value
      },
      properties: [
        ...__privateMethod(this, _sharedProperties, sharedProperties_fn).call(this, param2),
        ...typeof value !== "object" || value === null ? [
          {
            label: "value",
            text: String(value) ?? "undefined"
          }
        ] : []
      ],
      style: {
        style: "minimal"
      }
    });
  }
};
_namespacedKey = new WeakSet();
namespacedKey_fn = /* @__PURE__ */ __name(function(key) {
  const parts = [];
  if (this.type) {
    parts.push(this.type);
  }
  if (this.namespace) {
    parts.push(this.namespace);
  }
  parts.push(key);
  return parts.join(":");
}, "#namespacedKey");
_sharedProperties = new WeakSet();
sharedProperties_fn = /* @__PURE__ */ __name(function(key1) {
  return [
    {
      label: "namespace",
      text: this.type ?? "env"
    },
    {
      label: "key",
      text: key1
    }
  ];
}, "#sharedProperties");
__name(_KeyValueStore, "KeyValueStore");
var KeyValueStore = _KeyValueStore;
var _JSONOutputSerializer = class _JSONOutputSerializer {
  serialize(value) {
    return JSON.stringify(value);
  }
  deserialize(value) {
    return value ? JSON.parse(value) : void 0;
  }
};
__name(_JSONOutputSerializer, "JSONOutputSerializer");
var JSONOutputSerializer = _JSONOutputSerializer;
var _addToCachedTasks, addToCachedTasks_fn, _detectAutoYield, detectAutoYield_fn, _forceYield, forceYield_fn, _getTimeElapsed, getTimeElapsed_fn, _getRemainingTimeInMillis, getRemainingTimeInMillis_fn;
var _IO = class _IO {
  constructor(options) {
    __privateAdd(this, _addToCachedTasks);
    __privateAdd(this, _detectAutoYield);
    __privateAdd(this, _forceYield);
    __privateAdd(this, _getTimeElapsed);
    __privateAdd(this, _getRemainingTimeInMillis);
    __publicField(this, "_outputSerializer", new JSONOutputSerializer());
    __publicField(this, "_visitedCacheKeys", /* @__PURE__ */ new Set());
    /**
    * `io.brb()` is an alias of `io.yield()`
    */
    __publicField(this, "brb", this.yield.bind(this));
    this._id = options.id;
    this._jobId = options.jobId;
    this._apiClient = options.apiClient;
    this._triggerClient = options.client;
    this._logger = options.logger ?? new Logger("trigger.dev", options.logLevel);
    this._cachedTasks = /* @__PURE__ */ new Map();
    this._jobLogger = options.jobLogger;
    this._jobLogLevel = options.jobLogLevel;
    this._timeOrigin = options.timeOrigin;
    this._executionTimeout = options.executionTimeout;
    this._envStore = new KeyValueStore(options.apiClient);
    this._jobStore = new KeyValueStore(options.apiClient, "job", options.jobId);
    this._runStore = new KeyValueStore(options.apiClient, "run", options.id);
    this._stats = {
      initialCachedTasks: 0,
      lazyLoadedCachedTasks: 0,
      executedTasks: 0,
      cachedTaskHits: 0,
      cachedTaskMisses: 0,
      noopCachedTaskHits: 0,
      noopCachedTaskMisses: 0
    };
    if (options.cachedTasks) {
      options.cachedTasks.forEach((task) => {
        this._cachedTasks.set(task.idempotencyKey, task);
      });
      this._stats.initialCachedTasks = options.cachedTasks.length;
    }
    this._taskStorage = new AsyncLocalStorage();
    this._context = options.context;
    this._yieldedExecutions = options.yieldedExecutions ?? [];
    if (options.noopTasksSet) {
      this._noopTasksBloomFilter = BloomFilter.deserialize(options.noopTasksSet, BloomFilter.NOOP_TASK_SET_SIZE);
    }
    this._cachedTasksCursor = options.cachedTasksCursor;
    this._serverVersion = options.serverVersion ?? "unversioned";
  }
  get stats() {
    return this._stats;
  }
  /** @internal */
  get runId() {
    return this._id;
  }
  /** @internal */
  get triggerClient() {
    return this._triggerClient;
  }
  /** Used to send log messages to the [Run log](https://trigger.dev/docs/documentation/guides/viewing-runs). */
  get logger() {
    return new IOLogger(async (level, message, data) => {
      let logLevel = "info";
      if (data instanceof Error) {
        data = {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }
      if (Logger.satisfiesLogLevel(logLevel, this._jobLogLevel)) {
        await this.runTask([
          message,
          level
        ], async (task) => {
          switch (level) {
            case "LOG": {
              this._jobLogger?.log(message, data);
              logLevel = "log";
              break;
            }
            case "DEBUG": {
              this._jobLogger?.debug(message, data);
              logLevel = "debug";
              break;
            }
            case "INFO": {
              this._jobLogger?.info(message, data);
              logLevel = "info";
              break;
            }
            case "WARN": {
              this._jobLogger?.warn(message, data);
              logLevel = "warn";
              break;
            }
            case "ERROR": {
              this._jobLogger?.error(message, data);
              logLevel = "error";
              break;
            }
          }
        }, {
          name: "log",
          icon: "log",
          description: message,
          params: data,
          properties: [
            {
              label: "Level",
              text: level
            }
          ],
          style: {
            style: "minimal",
            variant: level.toLowerCase()
          },
          noop: true
        });
      }
    });
  }
  /** `io.random()` is identical to `Math.random()` when called without options but ensures your random numbers are not regenerated on resume or retry. It will return a pseudo-random floating-point number between optional `min` (default: 0, inclusive) and `max` (default: 1, exclusive). Can optionally `round` to the nearest integer.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param min Sets the lower bound (inclusive). Can't be higher than `max`.
  * @param max Sets the upper bound (exclusive). Can't be lower than `min`.
  * @param round Controls rounding to the nearest integer. Any `max` integer will become inclusive when enabled. Rounding with floating-point bounds may cause unexpected skew and boundary inclusivity.
  */
  async random(cacheKey, { min = 0, max = 1, round = false } = {}) {
    return await this.runTask(cacheKey, async (task) => {
      if (min > max) {
        throw new Error(`Lower bound can't be higher than upper bound - min: ${min}, max: ${max}`);
      }
      if (min === max) {
        await this.logger.warn(`Lower and upper bounds are identical. The return value is not random and will always be: ${min}`);
      }
      const withinBounds = (max - min) * Math.random() + min;
      if (!round) {
        return withinBounds;
      }
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        await this.logger.warn("Rounding enabled with floating-point bounds. This may cause unexpected skew and boundary inclusivity.");
      }
      const rounded = Math.round(withinBounds);
      return rounded;
    }, {
      name: "random",
      icon: "dice-5-filled",
      params: {
        min,
        max,
        round
      },
      properties: [
        ...min === 0 ? [] : [
          {
            label: "min",
            text: String(min)
          }
        ],
        ...max === 1 ? [] : [
          {
            label: "max",
            text: String(max)
          }
        ],
        ...round === false ? [] : [
          {
            label: "round",
            text: String(round)
          }
        ]
      ],
      style: {
        style: "minimal"
      }
    });
  }
  /** `io.wait()` waits for the specified amount of time before continuing the Job. Delays work even if you're on a serverless platform with timeouts, or if your server goes down. They utilize [resumability](https://trigger.dev/docs/documentation/concepts/resumability) to ensure that the Run can be resumed after the delay.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param seconds The number of seconds to wait. This can be very long, serverless timeouts are not an issue.
  */
  async wait(cacheKey, seconds) {
    return await this.runTask(cacheKey, async (task) => {
    }, {
      name: "wait",
      icon: "clock",
      params: {
        seconds
      },
      noop: true,
      delayUntil: new Date(Date.now() + seconds * 1e3),
      style: {
        style: "minimal"
      }
    });
  }
  async waitForEvent(cacheKey, event, options) {
    const timeoutInSeconds = options?.timeoutInSeconds ?? 60 * 60;
    return await this.runTask(cacheKey, async (task, io) => {
      if (!task.callbackUrl) {
        throw new Error("No callbackUrl found on task");
      }
      await this.triggerClient.createEphemeralEventDispatcher({
        url: task.callbackUrl,
        name: event.name,
        filter: event.filter,
        contextFilter: event.contextFilter,
        source: event.source,
        accountId: event.accountId,
        timeoutInSeconds
      });
      return {};
    }, {
      name: "Wait for Event",
      icon: "custom-event",
      params: {
        name: event.name,
        source: event.source,
        filter: event.filter,
        contextFilter: event.contextFilter,
        accountId: event.accountId
      },
      callback: {
        enabled: true,
        timeoutInSeconds
      },
      properties: [
        {
          label: "Event",
          text: event.name
        },
        {
          label: "Timeout",
          text: `${timeoutInSeconds}s`
        },
        ...event.source ? [
          {
            label: "Source",
            text: event.source
          }
        ] : [],
        ...event.accountId ? [
          {
            label: "Account ID",
            text: event.accountId
          }
        ] : []
      ],
      parseOutput: (output) => {
        return waitForEventSchema(event.schema ?? z.any()).parse(output);
      }
    });
  }
  /** `io.waitForRequest()` allows you to pause the execution of a run until the url provided in the callback is POSTed to.
  *  This is useful for integrating with external services that require a callback URL to be provided, or if you want to be able to wait until an action is performed somewhere else in your system.
  *  @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  *  @param callback A callback function that will provide the unique URL to POST to.
  *  @param options Options for the callback.
  *  @param options.timeoutInSeconds How long to wait for the request to be POSTed to the callback URL before timing out. Defaults to 1hr.
  *  @returns The POSTed request JSON body.
  *  @example
  * ```ts
   const result = await io.waitForRequest<{ message: string }>(
     "wait-for-request",
     async (url, task) => {
       // Save the URL somewhere so you can POST to it later
       // Or send it to an external service that will POST to it
     },
     { timeoutInSeconds: 60 } // wait 60 seconds
   );
   * ```
  */
  async waitForRequest(cacheKey, callback, options) {
    const timeoutInSeconds = options?.timeoutInSeconds ?? 60 * 60;
    return await this.runTask(cacheKey, async (task, io) => {
      if (!task.callbackUrl) {
        throw new Error("No callbackUrl found on task");
      }
      task.outputProperties = [
        {
          label: "Callback URL",
          text: task.callbackUrl
        }
      ];
      return callback(task.callbackUrl);
    }, {
      name: "Wait for Request",
      icon: "clock",
      callback: {
        enabled: true,
        timeoutInSeconds: options?.timeoutInSeconds
      },
      properties: [
        {
          label: "Timeout",
          text: `${timeoutInSeconds}s`
        }
      ]
    });
  }
  /** `io.createStatus()` allows you to set a status with associated data during the Run. Statuses can be used by your UI using the react package 
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param initialStatus The initial status you want this status to have. You can update it during the rub using the returned object.
     * @returns a TriggerStatus object that you can call `update()` on, to update the status.
     * @example 
     * ```ts
     * client.defineJob(
    //...
      run: async (payload, io, ctx) => {
        const generatingImages = await io.createStatus("generating-images", {
          label: "Generating Images",
          state: "loading",
          data: {
            progress: 0.1,
          },
        });
  
        //...do stuff
  
        await generatingImages.update("completed-generation", {
          label: "Generated images",
          state: "success",
          data: {
            progress: 1.0,
            urls: ["http://..."]
          },
        });
  
      //...
    });
     * ```
    */
  async createStatus(cacheKey, initialStatus) {
    const id = typeof cacheKey === "string" ? cacheKey : cacheKey.join("-");
    const status = new TriggerStatus(id, this);
    await status.update(cacheKey, initialStatus);
    return status;
  }
  /** `io.backgroundFetch()` fetches data from a URL that can take longer that the serverless timeout. The actual `fetch` request is performed on the Trigger.dev platform, and the response is sent back to you.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param url The URL to fetch from.
  * @param requestInit The options for the request
  * @param retry The options for retrying the request if it fails
  * An object where the key is a status code pattern and the value is a retrying strategy.
  * Supported patterns are:
  * - Specific status codes: 429
  * - Ranges: 500-599
  * - Wildcards: 2xx, 3xx, 4xx, 5xx
  */
  async backgroundFetch(cacheKey, url, requestInit, options) {
    const urlObject = new URL(url);
    return await this.runTask(cacheKey, async (task) => {
      console.log("task context", task.context);
      return task.output;
    }, {
      name: `fetch ${urlObject.hostname}${urlObject.pathname}`,
      params: {
        url,
        requestInit,
        retry: options?.retry,
        timeout: options?.timeout
      },
      operation: "fetch",
      icon: "background",
      noop: false,
      properties: [
        {
          label: "url",
          text: url,
          url
        },
        {
          label: "method",
          text: requestInit?.method ?? "GET"
        },
        {
          label: "background",
          text: "true"
        },
        ...options?.timeout ? [
          {
            label: "timeout",
            text: `${options.timeout.durationInMs}ms`
          }
        ] : []
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.backgroundPoll()` will fetch data from a URL on an interval. The actual `fetch` requests are performed on the Trigger.dev server, so you don't have to worry about serverless function timeouts.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param params The options for the background poll
  * @param params.url The URL to fetch from.
  * @param params.requestInit The options for the request, like headers and method
  * @param params.responseFilter An [EventFilter](https://trigger.dev/docs/documentation/guides/event-filter) that allows you to specify when to stop polling.
  * @param params.interval The interval in seconds to poll the URL in seconds. Defaults to 10 seconds which is the minimum.
  * @param params.timeout The timeout in seconds for each request in seconds. Defaults to 10 minutes. Minimum is 60 seconds and max is 1 hour
  * @param params.requestTimeout An optional object that allows you to timeout individual fetch requests
  * @param params.requestTimeout An optional object that allows you to timeout individual fetch requests
  * @param params.requestTimeout.durationInMs The duration in milliseconds to timeout the request
  * 
  * @example
  * ```ts
  * const result = await io.backgroundPoll<{ id: string; status: string; }>("poll", {
     url: `http://localhost:3030/api/v1/runs/${run.id}`,
     requestInit: {
       headers: {
         Accept: "application/json",
         Authorization: redactString`Bearer ${process.env["TRIGGER_API_KEY"]!}`,
       },
     },
     interval: 10,
     timeout: 600,
     responseFilter: {
       status: [200],
       body: {
         status: ["SUCCESS"],
       },
     },
   });
   * ```
  */
  async backgroundPoll(cacheKey, params) {
    const urlObject = new URL(params.url);
    return await this.runTask(cacheKey, async (task) => {
      return task.output;
    }, {
      name: `poll ${urlObject.hostname}${urlObject.pathname}`,
      params,
      operation: "fetch-poll",
      icon: "clock-bolt",
      noop: false,
      properties: [
        {
          label: "url",
          text: params.url
        },
        {
          label: "interval",
          text: `${params.interval}s`
        },
        {
          label: "timeout",
          text: `${params.timeout}s`
        }
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.backgroundFetchResponse()` fetches data from a URL that can take longer that the serverless timeout. The actual `fetch` request is performed on the Trigger.dev platform, and the response is sent back to you.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param url The URL to fetch from.
  * @param requestInit The options for the request
  * @param retry The options for retrying the request if it fails
  * An object where the key is a status code pattern and the value is a retrying strategy.
  * Supported patterns are:
  * - Specific status codes: 429
  * - Ranges: 500-599
  * - Wildcards: 2xx, 3xx, 4xx, 5xx
  */
  async backgroundFetchResponse(cacheKey, url, requestInit, options) {
    const urlObject = new URL(url);
    return await this.runTask(cacheKey, async (task) => {
      return task.output;
    }, {
      name: `fetch response ${urlObject.hostname}${urlObject.pathname}`,
      params: {
        url,
        requestInit,
        retry: options?.retry,
        timeout: options?.timeout
      },
      operation: "fetch-response",
      icon: "background",
      noop: false,
      properties: [
        {
          label: "url",
          text: url,
          url
        },
        {
          label: "method",
          text: requestInit?.method ?? "GET"
        },
        {
          label: "background",
          text: "true"
        },
        ...options?.timeout ? [
          {
            label: "timeout",
            text: `${options.timeout.durationInMs}ms`
          }
        ] : []
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.sendEvent()` allows you to send an event from inside a Job run. The sent event will trigger any Jobs that are listening for that event (based on the name).
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param event The event to send. The event name must match the name of the event that your Jobs are listening for.
  * @param options Options for sending the event.
  */
  async sendEvent(cacheKey, event, options) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.sendEvent(event, options);
    }, {
      name: "Send Event",
      params: {
        event,
        options
      },
      icon: "send",
      properties: [
        {
          label: "name",
          text: event.name
        },
        ...event?.id ? [
          {
            label: "ID",
            text: event.id
          }
        ] : [],
        ...sendEventOptionsProperties(options)
      ]
    });
  }
  /** `io.sendEvents()` allows you to send multiple events from inside a Job run. The sent events will trigger any Jobs that are listening for those events (based on the name).
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param event The events to send. The event names must match the names of the events that your Jobs are listening for.
  * @param options Options for sending the events.
  */
  async sendEvents(cacheKey, events, options) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.sendEvents(events, options);
    }, {
      name: "Send Multiple Events",
      params: {
        events,
        options
      },
      icon: "send",
      properties: [
        {
          label: "Total Events",
          text: String(events.length)
        },
        ...sendEventOptionsProperties(options)
      ]
    });
  }
  async getEvent(cacheKey, id) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.getEvent(id);
    }, {
      name: "getEvent",
      params: {
        id
      },
      properties: [
        {
          label: "id",
          text: id
        }
      ]
    });
  }
  /** `io.cancelEvent()` allows you to cancel an event that was previously sent with `io.sendEvent()`. This will prevent any Jobs from running that are listening for that event if the event was sent with a delay
  * @param cacheKey
  * @param eventId
  * @returns
  */
  async cancelEvent(cacheKey, eventId) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.cancelEvent(eventId);
    }, {
      name: "cancelEvent",
      params: {
        eventId
      },
      properties: [
        {
          label: "id",
          text: eventId
        }
      ]
    });
  }
  async updateSource(cacheKey, options) {
    return this.runTask(cacheKey, async (task) => {
      return await this._apiClient.updateSource(this._triggerClient.id, options.key, options);
    }, {
      name: "Update Source",
      description: "Update Source",
      properties: [
        {
          label: "key",
          text: options.key
        }
      ],
      params: options,
      redact: {
        paths: [
          "secret"
        ]
      }
    });
  }
  async updateWebhook(cacheKey, options) {
    return this.runTask(cacheKey, async (task) => {
      return await this._apiClient.updateWebhook(options.key, options);
    }, {
      name: "Update Webhook Source",
      icon: "refresh",
      properties: [
        {
          label: "key",
          text: options.key
        }
      ],
      params: options
    });
  }
  /** `io.registerInterval()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular interval.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
  * @param id A unique id for the interval. This is used to identify and unregister the interval later.
  * @param options The options for the interval.
  * @returns A promise that has information about the interval.
  * @deprecated Use `DynamicSchedule.register` instead.
  */
  async registerInterval(cacheKey, dynamicSchedule, id, options) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.register(id, {
        type: "interval",
        options
      });
    }, {
      name: "register-interval",
      properties: [
        {
          label: "schedule",
          text: dynamicSchedule.id
        },
        {
          label: "id",
          text: id
        },
        {
          label: "seconds",
          text: options.seconds.toString()
        }
      ],
      params: options
    });
  }
  /** `io.unregisterInterval()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerInterval()`.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
  * @param id A unique id for the interval. This is used to identify and unregister the interval later.
  * @deprecated Use `DynamicSchedule.unregister` instead.
  */
  async unregisterInterval(cacheKey, dynamicSchedule, id) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.unregister(id);
    }, {
      name: "unregister-interval",
      properties: [
        {
          label: "schedule",
          text: dynamicSchedule.id
        },
        {
          label: "id",
          text: id
        }
      ]
    });
  }
  /** `io.registerCron()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular CRON schedule.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
  * @param id A unique id for the schedule. This is used to identify and unregister the schedule later.
  * @param options The options for the CRON schedule.
  * @deprecated Use `DynamicSchedule.register` instead.
  */
  async registerCron(cacheKey, dynamicSchedule, id, options) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.register(id, {
        type: "cron",
        options
      });
    }, {
      name: "register-cron",
      properties: [
        {
          label: "schedule",
          text: dynamicSchedule.id
        },
        {
          label: "id",
          text: id
        },
        {
          label: "cron",
          text: options.cron
        }
      ],
      params: options
    });
  }
  /** `io.unregisterCron()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerCron()`.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
  * @param id A unique id for the interval. This is used to identify and unregister the interval later.
  * @deprecated Use `DynamicSchedule.unregister` instead.
  */
  async unregisterCron(cacheKey, dynamicSchedule, id) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.unregister(id);
    }, {
      name: "unregister-cron",
      properties: [
        {
          label: "schedule",
          text: dynamicSchedule.id
        },
        {
          label: "id",
          text: id
        }
      ]
    });
  }
  /** `io.registerTrigger()` allows you to register a [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) with the specified trigger params.
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param trigger The [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) to register.
  * @param id A unique id for the trigger. This is used to identify and unregister the trigger later.
  * @param params The params for the trigger.
  * @deprecated Use `DynamicTrigger.register` instead.
  */
  async registerTrigger(cacheKey, trigger, id, params) {
    return await this.runTask(cacheKey, async (task) => {
      const registration = await this.runTask("register-source", async (subtask1) => {
        return trigger.register(id, params);
      }, {
        name: "register-source"
      });
      return {
        id: registration.id,
        key: registration.source.key
      };
    }, {
      name: "register-trigger",
      properties: [
        {
          label: "trigger",
          text: trigger.id
        },
        {
          label: "id",
          text: id
        }
      ],
      params
    });
  }
  async getAuth(cacheKey, clientId) {
    if (!clientId) {
      return;
    }
    return this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.getAuth(clientId);
    }, {
      name: "get-auth"
    });
  }
  async parallel(cacheKey, items, callback, options) {
    const results = await this.runTask(cacheKey, async (task) => {
      const outcomes = await Promise.allSettled(items.map((item, index) => spaceOut(() => callback(item, index), index, 15)));
      if (outcomes.every((outcome) => outcome.status === "fulfilled")) {
        return outcomes.map((outcome) => outcome.value);
      }
      const nonInternalErrors = outcomes.filter((outcome) => outcome.status === "rejected" && !isTriggerError(outcome.reason)).map((outcome) => outcome);
      if (nonInternalErrors.length > 0) {
        throw nonInternalErrors[0].reason;
      }
      const internalErrors = outcomes.filter((outcome) => outcome.status === "rejected" && isTriggerError(outcome.reason)).map((outcome) => outcome).map((outcome) => outcome.reason);
      throw new ResumeWithParallelTaskError(task, internalErrors);
    }, {
      name: "parallel",
      parallel: true,
      ...options ?? {}
    });
    return results;
  }
  /** `io.runTask()` allows you to run a [Task](https://trigger.dev/docs/documentation/concepts/tasks) from inside a Job run. A Task is a resumable unit of a Run that can be retried, resumed and is logged. [Integrations](https://trigger.dev/docs/integrations) use Tasks internally to perform their actions.
  *
  * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
  * @param callback The callback that will be called when the Task is run. The callback receives the Task and the IO as parameters.
  * @param options The options of how you'd like to run and log the Task.
  * @param onError The callback that will be called when the Task fails. The callback receives the error, the Task and the IO as parameters. If you wish to retry then return an object with a `retryAt` property.
  * @returns A Promise that resolves with the returned value of the callback.
  */
  async runTask(cacheKey, callback, options, onError) {
    const parentId = this._taskStorage.getStore()?.taskId;
    if (parentId) {
      this._logger.debug("Using parent task", {
        parentId,
        cacheKey,
        options
      });
    }
    const isSubtaskNoop = options?.noop === true && parentId !== void 0;
    if (!isSubtaskNoop) {
      __privateMethod(this, _detectAutoYield, detectAutoYield_fn).call(this, "start_task", 500);
    }
    const idempotencyKey = await generateIdempotencyKey([
      this._id,
      parentId ?? "",
      cacheKey
    ].flat());
    if (this._visitedCacheKeys.has(idempotencyKey)) {
      if (typeof cacheKey === "string") {
        throw new Error(`Task with cacheKey "${cacheKey}" has already been executed in this run. Each task must have a unique cacheKey.`);
      } else {
        throw new Error(`Task with cacheKey "${cacheKey.join("-")}" has already been executed in this run. Each task must have a unique cacheKey.`);
      }
    }
    this._visitedCacheKeys.add(idempotencyKey);
    const cachedTask = this._cachedTasks.get(idempotencyKey);
    if (cachedTask && cachedTask.status === "COMPLETED") {
      this._logger.debug("Using completed cached task", {
        idempotencyKey
      });
      this._stats.cachedTaskHits++;
      return options?.parseOutput ? options.parseOutput(cachedTask.output) : cachedTask.output;
    }
    if (options?.noop && this._noopTasksBloomFilter) {
      if (this._noopTasksBloomFilter.test(idempotencyKey)) {
        this._logger.debug("task idempotency key exists in noopTasksBloomFilter", {
          idempotencyKey
        });
        this._stats.noopCachedTaskHits++;
        return {};
      }
    }
    const runOptions = {
      ...options ?? {},
      parseOutput: void 0
    };
    const response = await this._apiClient.runTask(this._id, {
      idempotencyKey,
      displayKey: typeof cacheKey === "string" ? cacheKey : void 0,
      noop: false,
      ...runOptions ?? {},
      parentId
    }, {
      cachedTasksCursor: this._cachedTasksCursor
    });
    const task = response.version === API_VERSIONS.LAZY_LOADED_CACHED_TASKS ? response.body.task : response.body;
    if (task.forceYield) {
      this._logger.debug("Forcing yield after run task", {
        idempotencyKey
      });
      __privateMethod(this, _forceYield, forceYield_fn).call(this, "after_run_task");
    }
    if (response.version === API_VERSIONS.LAZY_LOADED_CACHED_TASKS) {
      this._cachedTasksCursor = response.body.cachedTasks?.cursor;
      for (const cachedTask2 of response.body.cachedTasks?.tasks ?? []) {
        if (!this._cachedTasks.has(cachedTask2.idempotencyKey)) {
          this._cachedTasks.set(cachedTask2.idempotencyKey, cachedTask2);
          this._logger.debug("Injecting lazy loaded task into task cache", {
            idempotencyKey: cachedTask2.idempotencyKey
          });
          this._stats.lazyLoadedCachedTasks++;
        }
      }
    }
    if (task.status === "CANCELED") {
      this._logger.debug("Task canceled", {
        idempotencyKey,
        task
      });
      throw new CanceledWithTaskError(task);
    }
    if (task.status === "COMPLETED") {
      if (task.noop) {
        this._logger.debug("Noop Task completed", {
          idempotencyKey
        });
        this._noopTasksBloomFilter?.add(task.idempotencyKey);
      } else {
        this._logger.debug("Cache miss", {
          idempotencyKey
        });
        this._stats.cachedTaskMisses++;
        __privateMethod(this, _addToCachedTasks, addToCachedTasks_fn).call(this, task);
      }
      return options?.parseOutput ? options.parseOutput(task.output) : task.output;
    }
    if (task.status === "ERRORED") {
      this._logger.debug("Task errored", {
        idempotencyKey,
        task
      });
      throw new ErrorWithTask(task, task.error ?? task?.output ? JSON.stringify(task.output) : "Task errored");
    }
    __privateMethod(this, _detectAutoYield, detectAutoYield_fn).call(this, "before_execute_task", 1500);
    const executeTask = /* @__PURE__ */ __name(async () => {
      try {
        const result = await callback(task, this);
        if (task.status === "WAITING" && task.callbackUrl) {
          this._logger.debug("Waiting for remote callback", {
            idempotencyKey,
            task
          });
          return {};
        }
        const output = this._outputSerializer.serialize(result);
        this._logger.debug("Completing using output", {
          idempotencyKey,
          task
        });
        __privateMethod(this, _detectAutoYield, detectAutoYield_fn).call(this, "before_complete_task", 500, task, output);
        const completedTask = await this._apiClient.completeTask(this._id, task.id, {
          output,
          properties: task.outputProperties ?? void 0
        });
        if (completedTask.forceYield) {
          this._logger.debug("Forcing yield after task completed", {
            idempotencyKey
          });
          __privateMethod(this, _forceYield, forceYield_fn).call(this, "after_complete_task");
        }
        this._stats.executedTasks++;
        if (completedTask.status === "CANCELED") {
          throw new CanceledWithTaskError(completedTask);
        }
        __privateMethod(this, _detectAutoYield, detectAutoYield_fn).call(this, "after_complete_task", 500);
        const deserializedOutput = this._outputSerializer.deserialize(output);
        return options?.parseOutput ? options.parseOutput(deserializedOutput) : deserializedOutput;
      } catch (error) {
        if (isTriggerError(error)) {
          throw error;
        }
        let skipRetrying = false;
        if (onError) {
          try {
            const onErrorResult = onError(error, task, this);
            if (onErrorResult) {
              if (onErrorResult instanceof Error) {
                error = onErrorResult;
              } else {
                skipRetrying = !!onErrorResult.skipRetrying;
                if (onErrorResult.retryAt && !skipRetrying) {
                  const parsedError2 = ErrorWithStackSchema.safeParse(onErrorResult.error);
                  throw new RetryWithTaskError(parsedError2.success ? parsedError2.data : {
                    message: "Unknown error"
                  }, task, onErrorResult.retryAt);
                }
              }
            }
          } catch (innerError) {
            if (isTriggerError(innerError)) {
              throw innerError;
            }
            error = innerError;
          }
        }
        if (error instanceof ErrorWithTask) {
          await this._apiClient.failTask(this._id, task.id, {
            error: error.cause.output
          });
          throw error;
        }
        const parsedError = ErrorWithStackSchema.safeParse(error);
        if (options?.retry && !skipRetrying) {
          const retryAt = calculateRetryAt(options.retry, task.attempts - 1);
          if (retryAt) {
            throw new RetryWithTaskError(parsedError.success ? parsedError.data : {
              message: "Unknown error"
            }, task, retryAt);
          }
        }
        if (parsedError.success) {
          await this._apiClient.failTask(this._id, task.id, {
            error: parsedError.data
          });
        } else {
          const message = typeof error === "string" ? error : JSON.stringify(error);
          await this._apiClient.failTask(this._id, task.id, {
            error: {
              name: "Unknown error",
              message
            }
          });
        }
        throw error;
      }
    }, "executeTask");
    if (task.status === "WAITING") {
      this._logger.debug("Task waiting", {
        idempotencyKey,
        task
      });
      if (task.callbackUrl) {
        await this._taskStorage.run({
          taskId: task.id
        }, executeTask);
      }
      throw new ResumeWithTaskError(task);
    }
    if (task.status === "RUNNING" && typeof task.operation === "string") {
      this._logger.debug("Task running operation", {
        idempotencyKey,
        task
      });
      throw new ResumeWithTaskError(task);
    }
    return this._taskStorage.run({
      taskId: task.id
    }, executeTask);
  }
  /**
  * `io.yield()` allows you to yield execution of the current run and resume it in a new function execution. Similar to `io.wait()` but does not create a task and resumes execution immediately.
  */
  yield(cacheKey) {
    if (!supportsFeature("yieldExecution", this._serverVersion)) {
      console.warn("[trigger.dev] io.yield() is not support by the version of the Trigger.dev server you are using, you will need to upgrade your self-hosted Trigger.dev instance.");
      return;
    }
    if (this._yieldedExecutions.includes(cacheKey)) {
      return;
    }
    throw new YieldExecutionError(cacheKey);
  }
  /** `io.try()` allows you to run Tasks and catch any errors that are thrown, it's similar to a normal `try/catch` block but works with [io.runTask()](https://trigger.dev/docs/sdk/io/runtask).
  * A regular `try/catch` block on its own won't work as expected with Tasks. Internally `runTask()` throws some special errors to control flow execution. This is necessary to deal with resumability, serverless timeouts, and retrying Tasks.
  * @param tryCallback The code you wish to run
  * @param catchCallback Thhis will be called if the Task fails. The callback receives the error
  * @returns A Promise that resolves with the returned value or the error
  */
  async try(tryCallback, catchCallback) {
    try {
      return await tryCallback();
    } catch (error) {
      if (isTriggerError(error)) {
        throw error;
      }
      return await catchCallback(error);
    }
  }
  get store() {
    return {
      env: this._envStore,
      job: this._jobStore,
      run: this._runStore
    };
  }
};
_addToCachedTasks = new WeakSet();
addToCachedTasks_fn = /* @__PURE__ */ __name(function(task) {
  this._cachedTasks.set(task.idempotencyKey, task);
}, "#addToCachedTasks");
_detectAutoYield = new WeakSet();
detectAutoYield_fn = /* @__PURE__ */ __name(function(location, threshold = 1500, task1, output) {
  const timeRemaining = __privateMethod(this, _getRemainingTimeInMillis, getRemainingTimeInMillis_fn).call(this);
  if (timeRemaining && timeRemaining < threshold) {
    if (task1) {
      throw new AutoYieldWithCompletedTaskExecutionError(task1.id, task1.outputProperties ?? [], {
        location,
        timeRemaining,
        timeElapsed: __privateMethod(this, _getTimeElapsed, getTimeElapsed_fn).call(this)
      }, output);
    } else {
      throw new AutoYieldExecutionError(location, timeRemaining, __privateMethod(this, _getTimeElapsed, getTimeElapsed_fn).call(this));
    }
  }
}, "#detectAutoYield");
_forceYield = new WeakSet();
forceYield_fn = /* @__PURE__ */ __name(function(location1) {
  const timeRemaining = __privateMethod(this, _getRemainingTimeInMillis, getRemainingTimeInMillis_fn).call(this);
  if (timeRemaining) {
    throw new AutoYieldExecutionError(location1, timeRemaining, __privateMethod(this, _getTimeElapsed, getTimeElapsed_fn).call(this));
  }
}, "#forceYield");
_getTimeElapsed = new WeakSet();
getTimeElapsed_fn = /* @__PURE__ */ __name(function() {
  return performance.now() - this._timeOrigin;
}, "#getTimeElapsed");
_getRemainingTimeInMillis = new WeakSet();
getRemainingTimeInMillis_fn = /* @__PURE__ */ __name(function() {
  if (this._executionTimeout) {
    return this._executionTimeout - (performance.now() - this._timeOrigin);
  }
  return void 0;
}, "#getRemainingTimeInMillis");
__name(_IO, "IO");
var IO = _IO;
async function generateIdempotencyKey(keyMaterial) {
  const keys = keyMaterial.map((key2) => {
    if (typeof key2 === "string") {
      return key2;
    }
    return stableStringify(key2);
  });
  const key = keys.join(":");
  const hash = await webcrypto.subtle.digest("SHA-256", Buffer.from(key));
  return Buffer.from(hash).toString("hex");
}
__name(generateIdempotencyKey, "generateIdempotencyKey");
function stableStringify(obj) {
  function sortKeys(obj2) {
    if (typeof obj2 !== "object" || obj2 === null) {
      return obj2;
    }
    if (Array.isArray(obj2)) {
      return obj2.map(sortKeys);
    }
    const sortedKeys = Object.keys(obj2).sort();
    const sortedObj2 = {};
    for (const key of sortedKeys) {
      sortedObj2[key] = sortKeys(obj2[key]);
    }
    return sortedObj2;
  }
  __name(sortKeys, "sortKeys");
  const sortedObj = sortKeys(obj);
  return JSON.stringify(sortedObj);
}
__name(stableStringify, "stableStringify");
var _IOLogger = class _IOLogger {
  constructor(callback) {
    this.callback = callback;
  }
  /** Log: essential messages */
  log(message, properties) {
    return this.callback("LOG", message, properties);
  }
  /** For debugging: the least important log level */
  debug(message, properties) {
    return this.callback("DEBUG", message, properties);
  }
  /** Info: the second least important log level */
  info(message, properties) {
    return this.callback("INFO", message, properties);
  }
  /** Warnings: the third most important log level  */
  warn(message, properties) {
    return this.callback("WARN", message, properties);
  }
  /** Error: The second most important log level */
  error(message, properties) {
    return this.callback("ERROR", message, properties);
  }
};
__name(_IOLogger, "IOLogger");
var IOLogger = _IOLogger;
async function spaceOut(callback, index, delay) {
  await new Promise((resolve) => setTimeout(resolve, index * delay));
  return await callback();
}
__name(spaceOut, "spaceOut");
function sendEventOptionsProperties(options) {
  return [
    ...options?.accountId ? [
      {
        label: "Account ID",
        text: options.accountId
      }
    ] : [],
    ...options?.deliverAfter ? [
      {
        label: "Deliver After",
        text: `${options.deliverAfter}s`
      }
    ] : [],
    ...options?.deliverAt ? [
      {
        label: "Deliver At",
        text: options.deliverAt.toISOString()
      }
    ] : []
  ];
}
__name(sendEventOptionsProperties, "sendEventOptionsProperties");

// src/store/keyValueStoreClient.ts
var _serializer, _namespacedKey2, namespacedKey_fn2;
var _KeyValueStoreClient = class _KeyValueStoreClient {
  constructor(queryStore, type = null, namespace = "") {
    __privateAdd(this, _namespacedKey2);
    __privateAdd(this, _serializer, void 0);
    this.queryStore = queryStore;
    this.type = type;
    this.namespace = namespace;
    __privateSet(this, _serializer, new JSONOutputSerializer());
  }
  async delete(key) {
    const result = await this.queryStore("DELETE", {
      key: __privateMethod(this, _namespacedKey2, namespacedKey_fn2).call(this, key)
    });
    if (result.action !== "DELETE") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return result.deleted;
  }
  async get(key) {
    const result = await this.queryStore("GET", {
      key: __privateMethod(this, _namespacedKey2, namespacedKey_fn2).call(this, key)
    });
    if (result.action !== "GET") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return __privateGet(this, _serializer).deserialize(result.value);
  }
  async has(key) {
    const result = await this.queryStore("HAS", {
      key: __privateMethod(this, _namespacedKey2, namespacedKey_fn2).call(this, key)
    });
    if (result.action !== "HAS") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return result.has;
  }
  async set(key, value) {
    const result = await this.queryStore("SET", {
      key: __privateMethod(this, _namespacedKey2, namespacedKey_fn2).call(this, key),
      value: __privateGet(this, _serializer).serialize(value)
    });
    if (result.action !== "SET") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return __privateGet(this, _serializer).deserialize(result.value);
  }
};
_serializer = new WeakMap();
_namespacedKey2 = new WeakSet();
namespacedKey_fn2 = /* @__PURE__ */ __name(function(key) {
  const parts = [];
  if (this.type) {
    parts.push(this.type);
  }
  if (this.namespace) {
    parts.push(this.namespace);
  }
  parts.push(key);
  return parts.join(":");
}, "#namespacedKey");
__name(_KeyValueStoreClient, "KeyValueStoreClient");
var KeyValueStoreClient = _KeyValueStoreClient;

// src/apiClient.ts
var _apiUrl, _options, _logger, _storeClient, _queryKeyValueStore, queryKeyValueStore_fn, _apiKey, apiKey_fn;
var _ApiClient = class _ApiClient {
  constructor(options) {
    __privateAdd(this, _queryKeyValueStore);
    __privateAdd(this, _apiKey);
    __privateAdd(this, _apiUrl, void 0);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _logger, void 0);
    __privateAdd(this, _storeClient, void 0);
    __privateSet(this, _options, options);
    __privateSet(this, _apiUrl, __privateGet(this, _options).apiUrl ?? env.TRIGGER_API_URL ?? "https://api.trigger.dev");
    __privateSet(this, _logger, new Logger("trigger.dev", __privateGet(this, _options).logLevel));
    __privateSet(this, _storeClient, new KeyValueStoreClient(__privateMethod(this, _queryKeyValueStore, queryKeyValueStore_fn).bind(this)));
  }
  async registerEndpoint(options) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Registering endpoint", {
      url: options.url,
      name: options.name
    });
    const response = await fetch(`${__privateGet(this, _apiUrl)}/api/v1/endpoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: options.url,
        name: options.name
      })
    });
    if (response.status >= 400 && response.status < 500) {
      const body = await response.json();
      throw new Error(body.error);
    }
    if (response.status !== 200) {
      throw new Error(`Failed to register entry point, got status code ${response.status}`);
    }
    return await response.json();
  }
  async runTask(runId, task, options = {}) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Running Task", {
      task
    });
    return await zodfetchWithVersions({
      [API_VERSIONS.LAZY_LOADED_CACHED_TASKS]: RunTaskResponseWithCachedTasksBodySchema
    }, ServerTaskSchema, `${__privateGet(this, _apiUrl)}/api/v1/runs/${runId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": task.idempotencyKey,
        "X-Cached-Tasks-Cursor": options.cachedTasksCursor ?? "",
        "Trigger-Version": API_VERSIONS.LAZY_LOADED_CACHED_TASKS
      },
      body: JSON.stringify(task)
    });
  }
  async completeTask(runId, id, task) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Complete Task", {
      task
    });
    return await zodfetch(ServerTaskSchema, `${__privateGet(this, _apiUrl)}/api/v1/runs/${runId}/tasks/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Trigger-Version": API_VERSIONS.SERIALIZED_TASK_OUTPUT
      },
      body: JSON.stringify(task)
    });
  }
  async failTask(runId, id, body) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Fail Task", {
      id,
      runId,
      body
    });
    return await zodfetch(ServerTaskSchema, `${__privateGet(this, _apiUrl)}/api/v1/runs/${runId}/tasks/${id}/fail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
  }
  async sendEvent(event, options = {}) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    const _apiUrl2 = __privateGet(this, _apiUrl);
    __privateGet(this, _logger).debug("Sending event [trevor]", {
      event
    });
    __privateGet(this, _logger).debug("ISending event [apiKey, apiUrl]", {
      apiKey,
      _apiUrl: _apiUrl2
    });
    return await zodfetch(ApiEventLogSchema, `${__privateGet(this, _apiUrl)}/api/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        event,
        options
      })
    });
  }
  async sendEvents(events, options = {}) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Sending multiple events", {
      events
    });
    return await zodfetch(ApiEventLogSchema.array(), `${__privateGet(this, _apiUrl)}/api/v1/events/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        events,
        options
      })
    });
  }
  async cancelEvent(eventId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Cancelling event", {
      eventId
    });
    return await zodfetch(ApiEventLogSchema, `${__privateGet(this, _apiUrl)}/api/v1/events/${eventId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async cancelRunsForEvent(eventId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Cancelling runs for event", {
      eventId
    });
    return await zodfetch(CancelRunsForEventSchema, `${__privateGet(this, _apiUrl)}/api/v1/events/${eventId}/cancel-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async updateStatus(runId, id, status) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Update status", {
      id,
      status
    });
    return await zodfetch(JobRunStatusRecordSchema, `${__privateGet(this, _apiUrl)}/api/v1/runs/${runId}/statuses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(status)
    });
  }
  async updateSource(client, key, source) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("activating http source", {
      source
    });
    const response = await zodfetch(TriggerSourceSchema, `${__privateGet(this, _apiUrl)}/api/v2/${client}/sources/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(source)
    });
    return response;
  }
  async updateWebhook(key, webhookData) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("activating webhook", {
      webhookData
    });
    const response = await zodfetch(TriggerSourceSchema, `${__privateGet(this, _apiUrl)}/api/v1/webhooks/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(webhookData)
    });
    return response;
  }
  async registerTrigger(client, id, key, payload, idempotencyKey) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("registering trigger", {
      id,
      payload
    });
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    };
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const response = await zodfetch(RegisterSourceEventSchemaV2, `${__privateGet(this, _apiUrl)}/api/v2/${client}/triggers/${id}/registrations/${key}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload)
    });
    return response;
  }
  async registerSchedule(client, id, key, payload) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("registering schedule", {
      id,
      payload
    });
    const response = await zodfetch(RegisterScheduleResponseBodySchema, `${__privateGet(this, _apiUrl)}/api/v1/${client}/schedules/${id}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        id: key,
        ...payload
      })
    });
    return response;
  }
  async unregisterSchedule(client, id, key) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("unregistering schedule", {
      id
    });
    const response = await zodfetch(z.object({
      ok: z.boolean()
    }), `${__privateGet(this, _apiUrl)}/api/v1/${client}/schedules/${id}/registrations/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
    return response;
  }
  async getAuth(client, id) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("getting auth", {
      id
    });
    const response = await zodfetch(ConnectionAuthSchema, `${__privateGet(this, _apiUrl)}/api/v1/${client}/auth/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    }, {
      optional: true
    });
    return response;
  }
  async getEvent(eventId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Getting Event", {
      eventId
    });
    return await zodfetch(GetEventSchema, `${__privateGet(this, _apiUrl)}/api/v2/events/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRun(runId, options) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Getting Run", {
      runId
    });
    return await zodfetch(GetRunSchema, urlWithSearchParams(`${__privateGet(this, _apiUrl)}/api/v2/runs/${runId}`, options), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async cancelRun(runId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Cancelling Run", {
      runId
    });
    return await zodfetch(GetRunSchema, `${__privateGet(this, _apiUrl)}/api/v1/runs/${runId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRunStatuses(runId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Getting Run statuses", {
      runId
    });
    return await zodfetch(GetRunStatusesSchema, `${__privateGet(this, _apiUrl)}/api/v2/runs/${runId}/statuses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRuns(jobSlug, options) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Getting Runs", {
      jobSlug
    });
    return await zodfetch(GetRunsSchema, urlWithSearchParams(`${__privateGet(this, _apiUrl)}/api/v1/jobs/${jobSlug}/runs`, options), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async invokeJob(jobId, payload, options = {}) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    const _apiUrl2 = __privateGet(this, _apiUrl);
    __privateGet(this, _logger).debug("Invoking Job [trevor]", {
      jobId
    });
    __privateGet(this, _logger).debug("Invoking Job [apiKey, apiUrl]", {
      apiKey,
      _apiUrl: _apiUrl2
    });
    const body = {
      payload,
      context: options.context ?? {},
      options: {
        accountId: options.accountId,
        callbackUrl: options.callbackUrl
      }
    };
    __privateGet(this, _logger).debug("Invoking Job [zodFetch][before][body]", {
      body: JSON.stringify(body)
    });
    return await zodfetch(InvokeJobResponseSchema, `${__privateGet(this, _apiUrl)}/api/v1/jobs/${jobId}/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...options.idempotencyKey ? {
          "Idempotency-Key": options.idempotencyKey
        } : {}
      },
      body: JSON.stringify(body)
    });
  }
  async cancelRunsForJob(jobId) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Cancelling Runs for Job", {
      jobId
    });
    return await zodfetch(CancelRunsForJobSchema, `${__privateGet(this, _apiUrl)}/api/v1/jobs/${jobId}/cancel-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async createEphemeralEventDispatcher(payload) {
    const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
    __privateGet(this, _logger).debug("Creating ephemeral event dispatcher", {
      payload
    });
    const response = await zodfetch(EphemeralEventDispatcherResponseBodySchema, `${__privateGet(this, _apiUrl)}/api/v1/event-dispatchers/ephemeral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    return response;
  }
  get store() {
    return __privateGet(this, _storeClient);
  }
};
_apiUrl = new WeakMap();
_options = new WeakMap();
_logger = new WeakMap();
_storeClient = new WeakMap();
_queryKeyValueStore = new WeakSet();
queryKeyValueStore_fn = /* @__PURE__ */ __name(async function(action, data) {
  const apiKey = await __privateMethod(this, _apiKey, apiKey_fn).call(this);
  __privateGet(this, _logger).debug("accessing key-value store", {
    action,
    data
  });
  const encodedKey = encodeURIComponent(data.key);
  const STORE_URL = `${__privateGet(this, _apiUrl)}/api/v1/store/${encodedKey}`;
  const authHeader = {
    Authorization: `Bearer ${apiKey}`
  };
  let requestInit;
  switch (action) {
    case "DELETE": {
      requestInit = {
        method: "DELETE",
        headers: authHeader
      };
      break;
    }
    case "GET": {
      requestInit = {
        method: "GET",
        headers: authHeader
      };
      break;
    }
    case "HAS": {
      const headResponse = await fetchHead(STORE_URL, {
        headers: authHeader
      });
      return {
        action: "HAS",
        key: encodedKey,
        has: !!headResponse.ok
      };
    }
    case "SET": {
      const MAX_BODY_BYTE_LENGTH = 256 * 1024;
      if ((data.value?.length ?? 0) > MAX_BODY_BYTE_LENGTH) {
        throw new Error(`Max request body size exceeded: ${MAX_BODY_BYTE_LENGTH} bytes`);
      }
      requestInit = {
        method: "PUT",
        headers: {
          ...authHeader,
          "Content-Type": "text/plain"
        },
        body: data.value
      };
      break;
    }
    default: {
      assertExhaustive(action);
    }
  }
  const response = await zodfetch(KeyValueStoreResponseBodySchema, STORE_URL, requestInit);
  return response;
}, "#queryKeyValueStore");
_apiKey = new WeakSet();
apiKey_fn = /* @__PURE__ */ __name(async function() {
  const apiKey = getApiKey(__privateGet(this, _options).apiKey);
  if (apiKey.status === "invalid") {
    throw new Error("Invalid API key");
  } else if (apiKey.status === "missing") {
    throw new Error("Missing API key");
  }
  return apiKey.apiKey;
}, "#apiKey");
__name(_ApiClient, "ApiClient");
var ApiClient = _ApiClient;
function getApiKey(key) {
  const apiKey = key ?? env.TRIGGER_API_KEY;
  if (!apiKey) {
    return {
      status: "missing"
    };
  }
  const isValid = apiKey.match(/^tr_[a-z]+_[a-zA-Z0-9]+$/);
  if (!isValid) {
    return {
      status: "invalid",
      apiKey
    };
  }
  return {
    status: "valid",
    apiKey
  };
}
__name(getApiKey, "getApiKey");
async function zodfetchWithVersions(versionedSchemaMap, unversionedSchema, url, requestInit, options, retryCount = 0) {
  const log = new Logger("trigger.dev", "debug");
  log.debug("[zodFetchWithVersions][starting][beforeFetch]", {
    url
  });
  const response = await fetch(url, requestInitWithCache(requestInit));
  log.debug("[zodFetchWithVersions][afterFetch]", {
    statusCode: response.status,
    method: requestInit?.method
  });
  if ((!requestInit || requestInit.method === "GET") && response.status === 404 && options?.optional) {
    return;
  }
  if (response.status >= 400 && response.status < 500) {
    const _body2 = await response.text();
    log.debug("[zodFetchWithVersions][afterFetch][400..500]", {
      statusCode: response.status,
      responseBodyText: _body2
    });
    let body;
    if (response) {
      try {
        body = JSON.parse(_body2);
      } catch {
        body = {
          error: {
            message: "zodFetch -- 400 to 500"
          }
        };
      }
    }
    throw new Error(body);
  }
  if (response.status >= 500 && retryCount < 6) {
    const delay = exponentialBackoff(retryCount + 1, 2, 50, 1150, 50);
    log.debug("[zodFetchWithVersions][afterFetch][500..][beforeSetTimeout]", {
      statusCode: response.status
    });
    await new Promise((resolve) => setTimeout(resolve, delay));
    return zodfetchWithVersions(versionedSchemaMap, unversionedSchema, url, requestInit, options, retryCount + 1);
  }
  if (response.status !== 200) {
    throw new Error(options?.errorMessage ?? `Failed to fetch ${url}, got status code ${response.status}`);
  }
  log.debug("zodFetchWithVersions][responseJsonParse][before]");
  let jsonBody;
  const _body = await response.text();
  try {
    jsonBody = JSON.parse(_body);
  } catch {
    jsonBody = {
      error: "JSON.parse FAILED"
    };
    log.debug("[zodFetchWithVersions][responseJsonParse][jsonParseFailed]");
  }
  log.debug("[zodFetchWithVersions][responseJsonParse][afterParseTryBlock]", {
    statusCode: response.status,
    responseBodyJson: jsonBody
  });
  const version2 = response.headers.get("trigger-version");
  if (!version2) {
    return {
      version: "unversioned",
      body: unversionedSchema.parse(jsonBody)
    };
  }
  const versionedSchema = versionedSchemaMap[version2];
  if (!versionedSchema) {
    throw new Error(`Unknown version ${version2}`);
  }
  log.debug("[zodFetchWithVersions][beforeReturn]");
  return {
    version: version2,
    body: versionedSchema.parse(jsonBody)
  };
}
__name(zodfetchWithVersions, "zodfetchWithVersions");
function requestInitWithCache(requestInit) {
  try {
    const withCache = {
      ...requestInit,
      cache: "no-cache"
    };
    const _ = new Request("http://localhost", withCache);
    return withCache;
  } catch (error) {
    return requestInit ?? {};
  }
}
__name(requestInitWithCache, "requestInitWithCache");
async function fetchHead(url, requestInitWithoutMethod, retryCount = 0) {
  const requestInit = {
    ...requestInitWithoutMethod,
    method: "HEAD"
  };
  const response = await fetch(url, requestInitWithCache(requestInit));
  if (response.status >= 500 && retryCount < 6) {
    const delay = exponentialBackoff(retryCount + 1, 2, 50, 1150, 50);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchHead(url, requestInitWithoutMethod, retryCount + 1);
  }
  return response;
}
__name(fetchHead, "fetchHead");
async function zodfetch(schema, url, requestInit, options, retryCount = 0) {
  const log = new Logger("trigger.dev", "debug");
  log.debug("[zodFetch][starting][beforeFetch]", {
    url
  });
  const response = await fetch(url, requestInitWithCache(requestInit));
  log.debug("[zodFetch][afterFetch]", {
    statusCode: response.status,
    method: requestInit?.method
  });
  if ((!requestInit || requestInit.method === "GET") && response.status === 404 && options?.optional) {
    return;
  }
  if (response.status >= 400 && response.status < 500) {
    const _body = await response.text();
    log.debug("[zodFetch][afterFetch][400..500]", {
      statusCode: response.status,
      responseBodyText: _body
    });
    let body;
    if (response) {
      try {
        body = JSON.parse(_body);
      } catch {
        body = {
          error: {
            message: "zodFetch -- 400 to 500"
          }
        };
      }
    }
    throw new Error(body);
  }
  if (response.status >= 500 && retryCount < 6) {
    const delay = exponentialBackoff(retryCount + 1, 2, 50, 1150, 50);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return zodfetch(schema, url, requestInit, options, retryCount + 1);
  }
  if (response.status !== 200) {
    throw new Error(options?.errorMessage ?? `Failed to fetch ${url}, got status code ${response.status}`);
  }
  const jsonBody = await response.json();
  log.debug("[zodFetch][beforeSchemaParse][responseJsonParse] succeeded", {
    statusCode: response.status,
    responseBodyJson: jsonBody
  });
  return schema.parse(jsonBody);
}
__name(zodfetch, "zodfetch");
function exponentialBackoff(retryCount, exponential, minDelay, maxDelay, jitter) {
  const delay = Math.min(Math.pow(exponential, retryCount) * minDelay, maxDelay);
  const jitterValue = Math.random() * jitter;
  return delay + jitterValue;
}
__name(exponentialBackoff, "exponentialBackoff");

// src/concurrencyLimit.ts
var _ConcurrencyLimit = class _ConcurrencyLimit {
  constructor(options) {
    this.options = options;
  }
  get id() {
    return this.options.id;
  }
  get limit() {
    return this.options.limit;
  }
};
__name(_ConcurrencyLimit, "ConcurrencyLimit");
var ConcurrencyLimit = _ConcurrencyLimit;

// src/utils/formatSchemaErrors.ts
function formatSchemaErrors(errors) {
  return errors.map((error) => {
    const { path, message } = error;
    return {
      path: path.map(String),
      message
    };
  });
}
__name(formatSchemaErrors, "formatSchemaErrors");

// src/httpEndpoint.ts
var _HttpEndpoint = class _HttpEndpoint {
  constructor(options) {
    this.options = options;
  }
  get id() {
    return this.options.id;
  }
  onRequest(options) {
    return new HttpTrigger({
      endpointId: this.id,
      event: this.options.event,
      filter: options?.filter,
      verify: this.options.verify
    });
  }
  // @internal
  async handleRequest(request) {
    if (!this.options.respondWith)
      return;
    return this.options.respondWith.handler(request, () => {
      const clonedRequest = request.clone();
      return this.options.verify(clonedRequest);
    });
  }
  toJSON() {
    return {
      id: this.id,
      icon: this.options.event.icon,
      version: "1",
      enabled: this.options.enabled ?? true,
      event: this.options.event,
      immediateResponseFilter: this.options.respondWith?.filter,
      skipTriggeringRuns: this.options.respondWith?.skipTriggeringRuns,
      source: this.options.event.source
    };
  }
};
__name(_HttpEndpoint, "HttpEndpoint");
var HttpEndpoint = _HttpEndpoint;
var _a;
var HttpTrigger = (_a = class {
  constructor(options) {
    this.options = options;
  }
  toJSON() {
    return {
      type: "static",
      title: this.options.endpointId,
      properties: this.options.event.properties,
      rule: {
        event: `httpendpoint.${this.options.endpointId}`,
        payload: this.options.filter ?? {},
        source: this.options.event.source
      },
      link: `http-endpoints/${this.options.endpointId}`,
      help: {
        noRuns: {
          text: "To start triggering runs click here to setup your HTTP Endpoint with the external API service you want to receive webhooks from.",
          link: `http-endpoints/${this.options.endpointId}`
        }
      }
    };
  }
  get event() {
    return this.options.event;
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    const clonedRequest = payload.clone();
    return this.options.verify(clonedRequest);
  }
}, __name(_a, "HttpTrigger"), _a);
function httpEndpoint(options) {
  const id = slugifyId(options.id);
  return new HttpEndpoint({
    id,
    enabled: options.enabled,
    respondWith: options.respondWith,
    verify: options.verify,
    event: {
      name: id,
      title: options.title ?? "HTTP Trigger",
      source: options.source,
      icon: options.icon ?? "webhook",
      properties: options.properties,
      examples: options.examples ? options.examples : [
        {
          id: "basic-request",
          name: "Basic Request",
          icon: "http-post",
          payload: {
            url: "https://cloud.trigger.dev",
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            rawBody: JSON.stringify({
              foo: "bar"
            })
          }
        }
      ],
      parsePayload: (rawPayload) => {
        const result = RequestWithRawBodySchema.safeParse(rawPayload);
        if (!result.success) {
          throw new ParsedPayloadSchemaError(formatSchemaErrors(result.error.issues));
        }
        return new Request(new URL(result.data.url), {
          method: result.data.method,
          headers: result.data.headers,
          body: result.data.rawBody
        });
      }
    }
  });
}
__name(httpEndpoint, "httpEndpoint");

// src/ioWithIntegrations.ts
function createIOWithIntegrations(io, auths, integrations) {
  if (!integrations) {
    return io;
  }
  const connections = Object.entries(integrations).reduce((acc, [connectionKey, integration]) => {
    let auth = auths?.[connectionKey];
    acc[connectionKey] = {
      integration,
      auth
    };
    return acc;
  }, {});
  return new Proxy(io, {
    get(target, prop, receiver) {
      if (prop === "__io") {
        return io;
      }
      if (typeof prop === "string" && prop in connections) {
        const { integration, auth } = connections[prop];
        return integration.cloneForRun(io, prop, auth);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value == "function" ? value.bind(target) : value;
    }
  });
}
__name(createIOWithIntegrations, "createIOWithIntegrations");
var _client, _options2;
var _DynamicTrigger = class _DynamicTrigger {
  /** `DynamicTrigger` allows you to define a trigger that can be configured dynamically at runtime.
  * @param client The `TriggerClient` instance to use for registering the trigger.
  * @param options The options for the dynamic trigger.
  * */
  constructor(client, options) {
    __privateAdd(this, _client, void 0);
    __privateAdd(this, _options2, void 0);
    __privateSet(this, _client, client);
    __privateSet(this, _options2, options);
    this.source = options.source;
    client.attachDynamicTrigger(this);
  }
  toJSON() {
    return {
      type: "dynamic",
      id: __privateGet(this, _options2).id
    };
  }
  get id() {
    return __privateGet(this, _options2).id;
  }
  get event() {
    return __privateGet(this, _options2).event;
  }
  // @internal
  registeredTriggerForParams(params, options = {}) {
    const key = slugifyId(this.source.key(params));
    return {
      rule: {
        event: this.event.name,
        source: this.event.source,
        payload: deepMergeFilters(this.source.filter(params), this.event.filter ?? {}, options.filter ?? {})
      },
      source: {
        version: "2",
        key,
        channel: this.source.channel,
        params,
        //todo add other options here
        options: {
          event: typeof this.event.name === "string" ? [
            this.event.name
          ] : this.event.name
        },
        integration: {
          id: this.source.integration.id,
          metadata: this.source.integration.metadata,
          authSource: this.source.integration.authSource
        }
      },
      accountId: options.accountId
    };
  }
  /** Use this method to register a new configuration with the DynamicTrigger.
  * @param key The key for the configuration. This will be used to identify the configuration when it is triggered.
  * @param params The params for the configuration.
  * @param options Options for the configuration.
  * @param options.accountId The accountId to associate with the configuration.
  * @param options.filter The filter to use for the configuration.
  *
  */
  async register(key, params, options = {}) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return __privateGet(this, _client).registerTrigger(this.id, key, this.registeredTriggerForParams(params, options));
    }
    const { io } = runStore;
    return await io.runTask([
      key,
      "register"
    ], async (task) => {
      return __privateGet(this, _client).registerTrigger(this.id, key, this.registeredTriggerForParams(params, options), task.idempotencyKey);
    }, {
      name: "Register Dynamic Trigger",
      properties: [
        {
          label: "Dynamic Trigger ID",
          text: this.id
        },
        {
          label: "ID",
          text: key
        }
      ],
      params
    });
  }
  attachToJob(triggerClient, job) {
    triggerClient.attachJobToDynamicTrigger(job, this);
  }
  get preprocessRuns() {
    return true;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
};
_client = new WeakMap();
_options2 = new WeakMap();
__name(_DynamicTrigger, "DynamicTrigger");
var DynamicTrigger = _DynamicTrigger;
var _options3;
var _EventTrigger = class _EventTrigger {
  constructor(options) {
    __privateAdd(this, _options3, void 0);
    __privateSet(this, _options3, options);
  }
  toJSON() {
    return {
      type: "static",
      title: __privateGet(this, _options3).name ?? __privateGet(this, _options3).event.title,
      rule: {
        event: __privateGet(this, _options3).name ?? __privateGet(this, _options3).event.name,
        source: __privateGet(this, _options3).source ?? "trigger.dev",
        payload: deepMergeFilters(__privateGet(this, _options3).filter ?? {}, __privateGet(this, _options3).event.filter ?? {})
      }
    };
  }
  get event() {
    return __privateGet(this, _options3).event;
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    if (__privateGet(this, _options3).verify) {
      if (payload instanceof Request) {
        const clonedRequest = payload.clone();
        return __privateGet(this, _options3).verify(clonedRequest);
      }
    }
    return {
      success: true
    };
  }
};
_options3 = new WeakMap();
__name(_EventTrigger, "EventTrigger");
var EventTrigger = _EventTrigger;
function eventTrigger(options) {
  return new EventTrigger({
    name: options.name,
    filter: options.filter,
    source: options.source,
    event: {
      name: options.name,
      title: "Event",
      source: options.source ?? "trigger.dev",
      icon: "custom-event",
      examples: options.examples,
      parsePayload: (rawPayload) => {
        if (options.schema) {
          const results = options.schema.safeParse(rawPayload);
          if (!results.success) {
            throw new ParsedPayloadSchemaError(formatSchemaErrors(results.error.issues));
          }
          return results.data;
        }
        return rawPayload;
      }
    }
  });
}
__name(eventTrigger, "eventTrigger");
var examples = [
  {
    id: "now",
    name: "Now",
    icon: "clock",
    payload: {
      ts: currentDate.marker,
      lastTimestamp: currentDate.marker
    }
  }
];
var _IntervalTrigger = class _IntervalTrigger {
  constructor(options) {
    this.options = options;
  }
  get event() {
    return {
      name: "trigger.scheduled",
      title: "Schedule",
      source: "trigger.dev",
      icon: "schedule-interval",
      examples,
      parsePayload: ScheduledPayloadSchema.parse,
      properties: [
        {
          label: "Interval",
          text: `${this.options.seconds}s`
        }
      ]
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
  toJSON() {
    return {
      type: "scheduled",
      schedule: {
        type: "interval",
        options: {
          seconds: this.options.seconds
        }
      }
    };
  }
};
__name(_IntervalTrigger, "IntervalTrigger");
var IntervalTrigger = _IntervalTrigger;
function intervalTrigger(options) {
  return new IntervalTrigger(options);
}
__name(intervalTrigger, "intervalTrigger");
var _CronTrigger = class _CronTrigger {
  constructor(options) {
    this.options = options;
  }
  get event() {
    const humanReadable = cronstrue.toString(this.options.cron, {
      throwExceptionOnParseError: false
    }).concat(" (UTC)");
    return {
      name: "trigger.scheduled",
      title: "Cron Schedule",
      source: "trigger.dev",
      icon: "schedule-cron",
      examples,
      parsePayload: ScheduledPayloadSchema.parse,
      properties: [
        {
          label: "cron",
          text: this.options.cron
        },
        {
          label: "Schedule",
          text: humanReadable
        }
      ]
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
  toJSON() {
    return {
      type: "scheduled",
      schedule: {
        type: "cron",
        options: {
          cron: this.options.cron
        }
      }
    };
  }
};
__name(_CronTrigger, "CronTrigger");
var CronTrigger = _CronTrigger;
function cronTrigger(options) {
  return new CronTrigger(options);
}
__name(cronTrigger, "cronTrigger");
var _DynamicSchedule = class _DynamicSchedule {
  /**
  * @param client The `TriggerClient` instance to use for registering the trigger.
  * @param options The options for the schedule.
  */
  constructor(client, options) {
    this.client = client;
    this.options = options;
    client.attachDynamicSchedule(this.options.id);
  }
  get id() {
    return this.options.id;
  }
  get event() {
    return {
      name: "trigger.scheduled",
      title: "Dynamic Schedule",
      source: "trigger.dev",
      icon: "schedule-dynamic",
      examples,
      parsePayload: ScheduledPayloadSchema.parse
    };
  }
  async register(key, metadata) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return this.client.registerSchedule(this.id, key, metadata);
    }
    const { io } = runStore;
    return await io.runTask([
      key,
      "register"
    ], async (task) => {
      return this.client.registerSchedule(this.id, key, metadata);
    }, {
      name: "Register Schedule",
      icon: metadata.type === "cron" ? "schedule-cron" : "schedule-interval",
      properties: [
        {
          label: "Dynamic Schedule",
          text: this.id
        },
        {
          label: "Schedule ID",
          text: key
        }
      ],
      params: metadata
    });
  }
  async unregister(key) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return this.client.unregisterSchedule(this.id, key);
    }
    const { io } = runStore;
    return await io.runTask([
      key,
      "unregister"
    ], async (task) => {
      return this.client.unregisterSchedule(this.id, key);
    }, {
      name: "Unregister Schedule",
      icon: "schedule",
      properties: [
        {
          label: "Dynamic Schedule",
          text: this.id
        },
        {
          label: "Schedule ID",
          text: key
        }
      ]
    });
  }
  attachToJob(triggerClient, job) {
    triggerClient.attachDynamicScheduleToJob(this.options.id, job);
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
  toJSON() {
    return {
      type: "dynamic",
      id: this.options.id
    };
  }
};
__name(_DynamicSchedule, "DynamicSchedule");
var DynamicSchedule = _DynamicSchedule;

// src/triggerClient.ts
var registerWebhookEvent = /* @__PURE__ */ __name((key) => ({
  name: `${REGISTER_WEBHOOK}.${key}`,
  title: "Register Webhook",
  source: "internal",
  icon: "webhook",
  parsePayload: RegisterWebhookPayloadSchema.parse
}), "registerWebhookEvent");
var registerSourceEvent = {
  name: REGISTER_SOURCE_EVENT_V2,
  title: "Register Source",
  source: "internal",
  icon: "register-source",
  parsePayload: RegisterSourceEventSchemaV2.parse
};
var _options4, _registeredJobs, _registeredSources, _registeredWebhooks, _registeredHttpSourceHandlers, _registeredWebhookSourceHandlers, _registeredDynamicTriggers, _jobMetadataByDynamicTriggers, _registeredSchedules, _registeredHttpEndpoints, _authResolvers, _envStore, _eventEmitter, _client2, _internalLogger, _preprocessRun, preprocessRun_fn, _executeJob, executeJob_fn, _convertErrorToExecutionResponse, convertErrorToExecutionResponse_fn, _createRunContext, createRunContext_fn, _createPreprocessRunContext, createPreprocessRunContext_fn, _handleHttpSourceRequest, handleHttpSourceRequest_fn, _handleHttpEndpointRequestForResponse, handleHttpEndpointRequestForResponse_fn, _handleWebhookRequest, handleWebhookRequest_fn, _resolveConnections, resolveConnections_fn, _resolveConnection, resolveConnection_fn, _buildJobsIndex, buildJobsIndex_fn, _buildJobIndex, buildJobIndex_fn, _buildJobIntegrations, buildJobIntegrations_fn, _buildJobIntegration, buildJobIntegration_fn, _logIOStats, logIOStats_fn, _standardResponseHeaders, standardResponseHeaders_fn, _serializeRunMetadata, serializeRunMetadata_fn, _deliverSuccessfulRunNotification, deliverSuccessfulRunNotification_fn, _deliverFailedRunNotification, deliverFailedRunNotification_fn;
var _TriggerClient = class _TriggerClient {
  constructor(options) {
    __privateAdd(this, _preprocessRun);
    __privateAdd(this, _executeJob);
    __privateAdd(this, _convertErrorToExecutionResponse);
    __privateAdd(this, _createRunContext);
    __privateAdd(this, _createPreprocessRunContext);
    __privateAdd(this, _handleHttpSourceRequest);
    __privateAdd(this, _handleHttpEndpointRequestForResponse);
    __privateAdd(this, _handleWebhookRequest);
    __privateAdd(this, _resolveConnections);
    __privateAdd(this, _resolveConnection);
    __privateAdd(this, _buildJobsIndex);
    __privateAdd(this, _buildJobIndex);
    __privateAdd(this, _buildJobIntegrations);
    __privateAdd(this, _buildJobIntegration);
    __privateAdd(this, _logIOStats);
    __privateAdd(this, _standardResponseHeaders);
    __privateAdd(this, _serializeRunMetadata);
    __privateAdd(this, _deliverSuccessfulRunNotification);
    __privateAdd(this, _deliverFailedRunNotification);
    __privateAdd(this, _options4, void 0);
    __privateAdd(this, _registeredJobs, {});
    __privateAdd(this, _registeredSources, {});
    __privateAdd(this, _registeredWebhooks, {});
    __privateAdd(this, _registeredHttpSourceHandlers, {});
    __privateAdd(this, _registeredWebhookSourceHandlers, {});
    __privateAdd(this, _registeredDynamicTriggers, {});
    __privateAdd(this, _jobMetadataByDynamicTriggers, {});
    __privateAdd(this, _registeredSchedules, {});
    __privateAdd(this, _registeredHttpEndpoints, {});
    __privateAdd(this, _authResolvers, {});
    __privateAdd(this, _envStore, void 0);
    __privateAdd(this, _eventEmitter, new EventEmitter());
    __privateAdd(this, _client2, void 0);
    __privateAdd(this, _internalLogger, void 0);
    __publicField(this, "on", __privateGet(this, _eventEmitter).on.bind(__privateGet(this, _eventEmitter)));
    this.id = options.id;
    __privateSet(this, _options4, options);
    __privateSet(this, _client2, new ApiClient(__privateGet(this, _options4)));
    __privateSet(this, _internalLogger, new Logger("trigger.dev", __privateGet(this, _options4).verbose ? "debug" : "log", [
      "output",
      "noopTasksSet"
    ]));
    __privateSet(this, _envStore, new KeyValueStore(__privateGet(this, _client2)));
  }
  async handleRequest(request, timeOrigin = performance.now()) {
    __privateGet(this, _internalLogger).debug("handling request", {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method
    });
    const apiKey = request.headers.get("x-trigger-api-key");
    const triggerVersion = request.headers.get("x-trigger-version");
    const authorization = this.authorized(apiKey);
    __privateGet(this, _internalLogger).debug("[handleRequest][beforeAuthorizationSwitch]", {
      url: request.url,
      method: request.method,
      authorization
    });
    switch (authorization) {
      case "authorized": {
        break;
      }
      case "missing-client": {
        return {
          status: 401,
          body: {
            message: "Unauthorized: client missing apiKey"
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "missing-header": {
        return {
          status: 401,
          body: {
            message: "Unauthorized: missing x-trigger-api-key header"
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "unauthorized": {
        return {
          status: 401,
          body: {
            message: `Forbidden: client apiKey mismatch: Make sure you are using the correct API Key for your environment`
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
    }
    __privateGet(this, _internalLogger).debug("[handleRequest][finishedAuthorizationSwitch]", {
      url: request.url,
      method: request.method,
      authorization
    });
    if (request.method !== "POST") {
      return {
        status: 405,
        body: {
          message: "Method not allowed (only POST is allowed)"
        },
        headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
      };
    }
    const action = request.headers.get("x-trigger-action");
    __privateGet(this, _internalLogger).debug("[handleRequest][action]", {
      url: request.url,
      method: request.method,
      authorization,
      triggerAction: action
    });
    if (!action) {
      return {
        status: 400,
        body: {
          message: "Missing x-trigger-action header"
        },
        headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
      };
    }
    __privateGet(this, _internalLogger).debug("[handleRequest][action][beginSwitch]", {
      url: request.url,
      method: request.method,
      authorization,
      triggerAction: action
    });
    switch (action) {
      case "PING": {
        const endpointId = request.headers.get("x-trigger-endpoint-id");
        if (!endpointId) {
          return {
            status: 200,
            body: {
              ok: false,
              error: "Missing endpoint ID"
            },
            headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
          };
        }
        if (this.id !== endpointId) {
          return {
            status: 200,
            body: {
              ok: false,
              error: `Endpoint ID mismatch error. Expected ${this.id}, got ${endpointId}`
            },
            headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
          };
        }
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "INDEX_ENDPOINT": {
        const body = {
          jobs: __privateMethod(this, _buildJobsIndex, buildJobsIndex_fn).call(this),
          sources: Object.values(__privateGet(this, _registeredSources)),
          webhooks: Object.values(__privateGet(this, _registeredWebhooks)),
          dynamicTriggers: Object.values(__privateGet(this, _registeredDynamicTriggers)).map((trigger) => ({
            id: trigger.id,
            jobs: __privateGet(this, _jobMetadataByDynamicTriggers)[trigger.id] ?? [],
            registerSourceJob: {
              id: dynamicTriggerRegisterSourceJobId(trigger.id),
              version: trigger.source.version
            }
          })),
          dynamicSchedules: Object.entries(__privateGet(this, _registeredSchedules)).map(([id, jobs]) => ({
            id,
            jobs
          })),
          httpEndpoints: Object.entries(__privateGet(this, _registeredHttpEndpoints)).map(([id, endpoint]) => endpoint.toJSON())
        };
        return {
          status: 200,
          body,
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "INITIALIZE_TRIGGER": {
        const json = await request.json();
        const body = InitializeTriggerBodySchema.safeParse(json);
        if (!body.success) {
          return {
            status: 400,
            body: {
              message: "Invalid trigger body"
            }
          };
        }
        const dynamicTrigger = __privateGet(this, _registeredDynamicTriggers)[body.data.id];
        if (!dynamicTrigger) {
          return {
            status: 404,
            body: {
              message: "Dynamic trigger not found"
            }
          };
        }
        return {
          status: 200,
          body: dynamicTrigger.registeredTriggerForParams(body.data.params),
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "EXECUTE_JOB": {
        const _body = await request.text();
        __privateGet(this, _internalLogger).debug("[handleRequest][action][EXECUTE_JOB]", {
          url: request.url,
          method: request.method,
          authorization,
          triggerAction: action,
          bodyText: _body
        });
        let json = {};
        try {
          json = JSON.parse(_body);
        } catch {
          __privateGet(this, _internalLogger).debug("[handleRequest][action][EXECUTE_JOB][jsonParseFailed]", {
            url: request.url,
            method: request.method,
            authorization,
            triggerAction: action,
            bodyText: _body
          });
        }
        __privateGet(this, _internalLogger).debug("[handleRequest][action][EXECUTE_JOB][beforeSchemaSafeParse]", {
          url: request.url,
          method: request.method,
          authorization,
          triggerAction: action,
          bodyText: _body
        });
        const execution = RunJobBodySchema.safeParse(json);
        __privateGet(this, _internalLogger).debug("[handleRequest][action][EXECUTE_JOB][afterSchemaSafeParse]", {
          url: request.url,
          method: request.method,
          authorization,
          triggerAction: action,
          bodyText: _body,
          schemaExecution: JSON.stringify(execution)
        });
        if (!execution.success) {
          return {
            status: 400,
            body: {
              message: "Invalid execution"
            }
          };
        }
        const job = __privateGet(this, _registeredJobs)[execution.data.job.id];
        if (!job) {
          return {
            status: 404,
            body: {
              message: "Job not found"
            }
          };
        }
        __privateGet(this, _internalLogger).debug("[handleRequest][action][EXECUTE_JOB][beforeExecuteJob]", {
          url: request.url,
          method: request.method,
          authorization,
          triggerAction: action
        });
        const results = await __privateMethod(this, _executeJob, executeJob_fn).call(this, execution.data, job, timeOrigin, triggerVersion);
        __privateGet(this, _internalLogger).debug("executed job", {
          results,
          job: job.id,
          version: job.version,
          triggerVersion
        });
        const standardHeaders = __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin);
        standardHeaders["x-trigger-run-metadata"] = __privateMethod(this, _serializeRunMetadata, serializeRunMetadata_fn).call(this, job);
        return {
          status: 200,
          body: results,
          headers: standardHeaders
        };
      }
      case "PREPROCESS_RUN": {
        const json = await request.json();
        const body = PreprocessRunBodySchema.safeParse(json);
        if (!body.success) {
          return {
            status: 400,
            body: {
              message: "Invalid body"
            }
          };
        }
        const job = __privateGet(this, _registeredJobs)[body.data.job.id];
        if (!job) {
          return {
            status: 404,
            body: {
              message: "Job not found"
            }
          };
        }
        const results = await __privateMethod(this, _preprocessRun, preprocessRun_fn).call(this, body.data, job);
        return {
          status: 200,
          body: {
            abort: results.abort,
            properties: results.properties
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "DELIVER_HTTP_SOURCE_REQUEST": {
        const headers = HttpSourceRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error) {
          }
        }
        const sourceRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const dynamicId = headers.data["x-ts-dynamic-id"];
        const secret = headers.data["x-ts-secret"];
        const params = headers.data["x-ts-params"];
        const data = headers.data["x-ts-data"];
        const auth = headers.data["x-ts-auth"];
        const inputMetadata = headers.data["x-ts-metadata"];
        const source = {
          key,
          dynamicId,
          secret,
          params,
          data,
          auth,
          metadata: inputMetadata
        };
        const { response, events, metadata } = await __privateMethod(this, _handleHttpSourceRequest, handleHttpSourceRequest_fn).call(this, source, sourceRequest);
        return {
          status: 200,
          body: {
            events,
            response,
            metadata
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "DELIVER_HTTP_ENDPOINT_REQUEST_FOR_RESPONSE": {
        const headers = HttpEndpointRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error) {
          }
        }
        const sourceRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const { response } = await __privateMethod(this, _handleHttpEndpointRequestForResponse, handleHttpEndpointRequestForResponse_fn).call(this, {
          key
        }, sourceRequest);
        return {
          status: 200,
          body: response,
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "DELIVER_WEBHOOK_REQUEST": {
        const headers = WebhookSourceRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error2) {
          }
        }
        const webhookRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const secret = headers.data["x-ts-secret"];
        const params = headers.data["x-ts-params"];
        const ctx = {
          key,
          secret,
          params
        };
        const { response, verified, error } = await __privateMethod(this, _handleWebhookRequest, handleWebhookRequest_fn).call(this, webhookRequest, ctx);
        return {
          status: 200,
          body: {
            response,
            verified,
            error
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "VALIDATE": {
        return {
          status: 200,
          body: {
            ok: true,
            endpointId: this.id
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "PROBE_EXECUTION_TIMEOUT": {
        const json = await request.json();
        const timeout = json?.timeout ?? 15 * 60 * 1e3;
        await new Promise((resolve) => setTimeout(resolve, timeout));
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
      case "RUN_NOTIFICATION": {
        const rawJson = await request.json();
        const runNotification = rawJson;
        if (runNotification.ok) {
          await __privateMethod(this, _deliverSuccessfulRunNotification, deliverSuccessfulRunNotification_fn).call(this, runNotification);
        } else {
          await __privateMethod(this, _deliverFailedRunNotification, deliverFailedRunNotification_fn).call(this, runNotification);
        }
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
        };
      }
    }
    return {
      status: 405,
      body: {
        message: "Method not allowed"
      },
      headers: __privateMethod(this, _standardResponseHeaders, standardResponseHeaders_fn).call(this, timeOrigin)
    };
  }
  defineJob(options) {
    const existingRegisteredJob = __privateGet(this, _registeredJobs)[options.id];
    if (existingRegisteredJob && options.__internal !== true) {
      console.warn(`[@trigger.dev/sdk] Warning: The Job "${existingRegisteredJob.id}" you're attempting to define has already been defined. Please assign a different ID to the job.`);
    }
    const job = new Job(options);
    this.attach(job);
    return job;
  }
  defineAuthResolver(integration, resolver) {
    __privateGet(this, _authResolvers)[integration.id] = resolver;
    return this;
  }
  defineDynamicSchedule(options) {
    return new DynamicSchedule(this, options);
  }
  defineDynamicTrigger(options) {
    return new DynamicTrigger(this, options);
  }
  /**
  * An [HTTP endpoint](https://trigger.dev/docs/documentation/concepts/http-endpoints) allows you to create a [HTTP Trigger](https://trigger.dev/docs/documentation/concepts/triggers/http), which means you can trigger your Jobs from any webhooks.
  * @param options The Endpoint options
  * @returns An HTTP Endpoint, that can be used to create an HTTP Trigger.
  * @link https://trigger.dev/docs/documentation/concepts/http-endpoints
  */
  defineHttpEndpoint(options, suppressWarnings = false) {
    const existingHttpEndpoint = __privateGet(this, _registeredHttpEndpoints)[options.id];
    if (!suppressWarnings && existingHttpEndpoint) {
      console.warn(`[@trigger.dev/sdk] Warning: The HttpEndpoint "${existingHttpEndpoint.id}" you're attempting to define has already been defined. Please assign a different ID to the HttpEndpoint.`);
    }
    const endpoint = httpEndpoint(options);
    __privateGet(this, _registeredHttpEndpoints)[endpoint.id] = endpoint;
    return endpoint;
  }
  defineConcurrencyLimit(options) {
    return new ConcurrencyLimit(options);
  }
  attach(job) {
    __privateGet(this, _registeredJobs)[job.id] = job;
    job.trigger.attachToJob(this, job);
    job.client = this;
  }
  attachDynamicTrigger(trigger) {
    __privateGet(this, _registeredDynamicTriggers)[trigger.id] = trigger;
    this.defineJob({
      id: dynamicTriggerRegisterSourceJobId(trigger.id),
      name: `Register dynamic trigger ${trigger.id}`,
      version: trigger.source.version,
      trigger: new EventTrigger({
        event: registerSourceEvent,
        filter: {
          dynamicTriggerId: [
            trigger.id
          ]
        }
      }),
      integrations: {
        integration: trigger.source.integration
      },
      run: async (event, io, ctx) => {
        const updates = await trigger.source.register(event.source.params, event, io, ctx);
        if (!updates) {
          return;
        }
        return await io.updateSource("update-source", {
          key: event.source.key,
          ...updates
        });
      },
      __internal: true
    });
  }
  attachJobToDynamicTrigger(job, trigger) {
    const jobs = __privateGet(this, _jobMetadataByDynamicTriggers)[trigger.id] ?? [];
    jobs.push({
      id: job.id,
      version: job.version
    });
    __privateGet(this, _jobMetadataByDynamicTriggers)[trigger.id] = jobs;
  }
  attachSource(options) {
    __privateGet(this, _registeredHttpSourceHandlers)[options.key] = async (s, r) => {
      return await options.source.handle(s, r, __privateGet(this, _internalLogger));
    };
    let registeredSource = __privateGet(this, _registeredSources)[options.key];
    if (!registeredSource) {
      registeredSource = {
        version: "2",
        channel: options.source.channel,
        key: options.key,
        params: options.params,
        options: {},
        integration: {
          id: options.source.integration.id,
          metadata: options.source.integration.metadata,
          authSource: options.source.integration.authSource
        },
        registerSourceJob: {
          id: options.key,
          version: options.source.version
        }
      };
    }
    const newOptions = deepMergeOptions({
      event: typeof options.event.name === "string" ? [
        options.event.name
      ] : options.event.name
    }, options.options ?? {});
    registeredSource.options = deepMergeOptions(registeredSource.options, newOptions);
    __privateGet(this, _registeredSources)[options.key] = registeredSource;
    this.defineJob({
      id: options.key,
      name: options.key,
      version: options.source.version,
      trigger: new EventTrigger({
        event: registerSourceEvent,
        filter: {
          source: {
            key: [
              options.key
            ]
          }
        }
      }),
      integrations: {
        integration: options.source.integration
      },
      run: async (event, io, ctx) => {
        const updates = await options.source.register(options.params, event, io, ctx);
        if (!updates) {
          return;
        }
        return await io.updateSource("update-source", {
          key: options.key,
          ...updates
        });
      },
      __internal: true
    });
  }
  attachDynamicSchedule(key) {
    const jobs = __privateGet(this, _registeredSchedules)[key] ?? [];
    __privateGet(this, _registeredSchedules)[key] = jobs;
  }
  attachDynamicScheduleToJob(key, job) {
    const jobs = __privateGet(this, _registeredSchedules)[key] ?? [];
    jobs.push({
      id: job.id,
      version: job.version
    });
    __privateGet(this, _registeredSchedules)[key] = jobs;
  }
  attachWebhook(options) {
    const { source } = options;
    __privateGet(this, _registeredWebhookSourceHandlers)[options.key] = {
      verify: source.verify.bind(source),
      generateEvents: source.generateEvents.bind(source)
    };
    let registeredWebhook = __privateGet(this, _registeredWebhooks)[options.key];
    if (!registeredWebhook) {
      registeredWebhook = {
        key: options.key,
        params: options.params,
        config: options.config,
        integration: {
          id: source.integration.id,
          metadata: source.integration.metadata,
          authSource: source.integration.authSource
        },
        httpEndpoint: {
          id: options.key
        }
      };
    } else {
      registeredWebhook.config = deepMergeOptions(registeredWebhook.config, options.config);
    }
    __privateGet(this, _registeredWebhooks)[options.key] = registeredWebhook;
    this.defineJob({
      id: `webhook.register.${options.key}`,
      name: `webhook.register.${options.key}`,
      version: source.version,
      trigger: new EventTrigger({
        event: registerWebhookEvent(options.key)
      }),
      integrations: {
        integration: source.integration
      },
      run: async (registerPayload, io, ctx) => {
        return await io.try(async () => {
          __privateGet(this, _internalLogger).debug("[webhook.register] Start");
          const crudOptions = {
            io,
            // this is just a more strongly typed payload
            ctx: registerPayload
          };
          if (!registerPayload.active) {
            __privateGet(this, _internalLogger).debug("[webhook.register] Not active, run create");
            await io.try(async () => {
              await source.crud.create(crudOptions);
            }, async (error) => {
              __privateGet(this, _internalLogger).debug("[webhook.register] Error during create, re-trying with delete first", {
                error
              });
              await io.runTask("create-retry", async () => {
                await source.crud.delete(crudOptions);
                await source.crud.create(crudOptions);
              });
            });
            return await io.updateWebhook("update-webhook-success", {
              key: options.key,
              active: true,
              config: registerPayload.config.desired
            });
          }
          __privateGet(this, _internalLogger).debug("[webhook.register] Already active, run update");
          if (source.crud.update) {
            await source.crud.update(crudOptions);
          } else {
            __privateGet(this, _internalLogger).debug("[webhook.register] Run delete and create instead of update");
            await source.crud.delete(crudOptions);
            await source.crud.create(crudOptions);
          }
          return await io.updateWebhook("update-webhook-success", {
            key: options.key,
            active: true,
            config: registerPayload.config.desired
          });
        }, async (error) => {
          __privateGet(this, _internalLogger).debug("[webhook.register] Error", {
            error
          });
          await io.updateWebhook("update-webhook-error", {
            key: options.key,
            active: false
          });
          throw error;
        });
      },
      __internal: true
    });
  }
  async registerTrigger(id, key, options, idempotencyKey) {
    return __privateGet(this, _client2).registerTrigger(this.id, id, key, options, idempotencyKey);
  }
  async getAuth(id) {
    return __privateGet(this, _client2).getAuth(this.id, id);
  }
  /** You can call this function from anywhere in your backend to send an event. The other way to send an event is by using [`io.sendEvent()`](https://trigger.dev/docs/sdk/io/sendevent) from inside a `run()` function.
  * @param event The event to send.
  * @param options Options for sending the event.
  * @returns A promise that resolves to the event details
  */
  async sendEvent(event, options) {
    return __privateGet(this, _client2).sendEvent(event, options);
  }
  /** You can call this function from anywhere in your backend to send multiple events. The other way to send multiple events is by using [`io.sendEvents()`](https://trigger.dev/docs/sdk/io/sendevents) from inside a `run()` function.
  * @param events The events to send.
  * @param options Options for sending the events.
  * @returns A promise that resolves to an array of event details
  */
  async sendEvents(events, options) {
    return __privateGet(this, _client2).sendEvents(events, options);
  }
  async cancelEvent(eventId) {
    return __privateGet(this, _client2).cancelEvent(eventId);
  }
  async cancelRunsForEvent(eventId) {
    return __privateGet(this, _client2).cancelRunsForEvent(eventId);
  }
  async updateStatus(runId, id, status) {
    return __privateGet(this, _client2).updateStatus(runId, id, status);
  }
  async registerSchedule(id, key, schedule) {
    return __privateGet(this, _client2).registerSchedule(this.id, id, key, schedule);
  }
  async unregisterSchedule(id, key) {
    return __privateGet(this, _client2).unregisterSchedule(this.id, id, key);
  }
  async getEvent(eventId) {
    return __privateGet(this, _client2).getEvent(eventId);
  }
  async getRun(runId, options) {
    return __privateGet(this, _client2).getRun(runId, options);
  }
  async cancelRun(runId) {
    return __privateGet(this, _client2).cancelRun(runId);
  }
  async getRuns(jobSlug, options) {
    return __privateGet(this, _client2).getRuns(jobSlug, options);
  }
  async getRunStatuses(runId) {
    return __privateGet(this, _client2).getRunStatuses(runId);
  }
  async invokeJob(jobId, payload, options) {
    return __privateGet(this, _client2).invokeJob(jobId, payload, options);
  }
  async cancelRunsForJob(jobId) {
    return __privateGet(this, _client2).cancelRunsForJob(jobId);
  }
  async createEphemeralEventDispatcher(payload) {
    return __privateGet(this, _client2).createEphemeralEventDispatcher(payload);
  }
  get store() {
    return {
      env: __privateGet(this, _envStore)
    };
  }
  authorized(apiKey) {
    if (typeof apiKey !== "string") {
      return "missing-header";
    }
    const localApiKey = __privateGet(this, _options4).apiKey ?? env.TRIGGER_API_KEY;
    if (!localApiKey) {
      return "missing-client";
    }
    return apiKey === localApiKey ? "authorized" : "unauthorized";
  }
  apiKey() {
    return __privateGet(this, _options4).apiKey ?? env.TRIGGER_API_KEY;
  }
};
_options4 = new WeakMap();
_registeredJobs = new WeakMap();
_registeredSources = new WeakMap();
_registeredWebhooks = new WeakMap();
_registeredHttpSourceHandlers = new WeakMap();
_registeredWebhookSourceHandlers = new WeakMap();
_registeredDynamicTriggers = new WeakMap();
_jobMetadataByDynamicTriggers = new WeakMap();
_registeredSchedules = new WeakMap();
_registeredHttpEndpoints = new WeakMap();
_authResolvers = new WeakMap();
_envStore = new WeakMap();
_eventEmitter = new WeakMap();
_client2 = new WeakMap();
_internalLogger = new WeakMap();
_preprocessRun = new WeakSet();
preprocessRun_fn = /* @__PURE__ */ __name(async function(body, job) {
  __privateMethod(this, _createPreprocessRunContext, createPreprocessRunContext_fn).call(this, body);
  const parsedPayload = job.trigger.event.parsePayload(body.event.payload ?? {});
  const properties = job.trigger.event.runProperties?.(parsedPayload) ?? [];
  return {
    abort: false,
    properties
  };
}, "#preprocessRun");
_executeJob = new WeakSet();
executeJob_fn = /* @__PURE__ */ __name(async function(body1, job1, timeOrigin, triggerVersion) {
  __privateGet(this, _internalLogger).debug("executing job", {
    execution: body1,
    job: job1.id,
    version: job1.version,
    triggerVersion
  });
  const context = __privateMethod(this, _createRunContext, createRunContext_fn).call(this, body1);
  const io = new IO({
    id: body1.run.id,
    jobId: job1.id,
    cachedTasks: body1.tasks,
    cachedTasksCursor: body1.cachedTaskCursor,
    yieldedExecutions: body1.yieldedExecutions ?? [],
    noopTasksSet: body1.noopTasksSet,
    apiClient: __privateGet(this, _client2),
    logger: __privateGet(this, _internalLogger),
    client: this,
    context,
    jobLogLevel: job1.logLevel ?? __privateGet(this, _options4).logLevel ?? "info",
    jobLogger: __privateGet(this, _options4).ioLogLocalEnabled ? new Logger(job1.id, job1.logLevel ?? __privateGet(this, _options4).logLevel ?? "info") : void 0,
    serverVersion: triggerVersion,
    timeOrigin,
    executionTimeout: body1.runChunkExecutionLimit
  });
  const resolvedConnections = await __privateMethod(this, _resolveConnections, resolveConnections_fn).call(this, context, job1.options.integrations, body1.connections);
  if (!resolvedConnections.ok) {
    return {
      status: "UNRESOLVED_AUTH_ERROR",
      issues: resolvedConnections.issues
    };
  }
  const ioWithConnections = createIOWithIntegrations(io, resolvedConnections.data, job1.options.integrations);
  try {
    const parsedPayload = job1.trigger.event.parsePayload(body1.event.payload ?? {});
    if (!context.run.isTest) {
      const verified = await job1.trigger.verifyPayload(parsedPayload);
      if (!verified.success) {
        return {
          status: "ERROR",
          error: {
            message: `Payload verification failed. ${verified.reason}`
          }
        };
      }
    }
    const output = await runLocalStorage.runWith({
      io,
      ctx: context
    }, () => {
      return job1.options.run(parsedPayload, ioWithConnections, context);
    });
    if (__privateGet(this, _options4).verbose) {
      __privateMethod(this, _logIOStats, logIOStats_fn).call(this, io.stats);
    }
    return {
      status: "SUCCESS",
      output
    };
  } catch (error) {
    if (__privateGet(this, _options4).verbose) {
      __privateMethod(this, _logIOStats, logIOStats_fn).call(this, io.stats);
    }
    if (error instanceof ResumeWithParallelTaskError) {
      return {
        status: "RESUME_WITH_PARALLEL_TASK",
        task: error.task,
        childErrors: error.childErrors.map((childError) => {
          return __privateMethod(this, _convertErrorToExecutionResponse, convertErrorToExecutionResponse_fn).call(this, childError, body1);
        })
      };
    }
    return __privateMethod(this, _convertErrorToExecutionResponse, convertErrorToExecutionResponse_fn).call(this, error, body1);
  }
}, "#executeJob");
_convertErrorToExecutionResponse = new WeakSet();
convertErrorToExecutionResponse_fn = /* @__PURE__ */ __name(function(error, body2) {
  if (error instanceof AutoYieldExecutionError) {
    return {
      status: "AUTO_YIELD_EXECUTION",
      location: error.location,
      timeRemaining: error.timeRemaining,
      timeElapsed: error.timeElapsed,
      limit: body2.runChunkExecutionLimit
    };
  }
  if (error instanceof AutoYieldWithCompletedTaskExecutionError) {
    return {
      status: "AUTO_YIELD_EXECUTION_WITH_COMPLETED_TASK",
      id: error.id,
      properties: error.properties,
      output: error.output,
      data: {
        ...error.data,
        limit: body2.runChunkExecutionLimit
      }
    };
  }
  if (error instanceof YieldExecutionError) {
    return {
      status: "YIELD_EXECUTION",
      key: error.key
    };
  }
  if (error instanceof ParsedPayloadSchemaError) {
    return {
      status: "INVALID_PAYLOAD",
      errors: error.schemaErrors
    };
  }
  if (error instanceof ResumeWithTaskError) {
    return {
      status: "RESUME_WITH_TASK",
      task: error.task
    };
  }
  if (error instanceof RetryWithTaskError) {
    return {
      status: "RETRY_WITH_TASK",
      task: error.task,
      error: error.cause,
      retryAt: error.retryAt
    };
  }
  if (error instanceof CanceledWithTaskError) {
    return {
      status: "CANCELED",
      task: error.task
    };
  }
  if (error instanceof ErrorWithTask) {
    const errorWithStack2 = ErrorWithStackSchema.safeParse(error.cause.output);
    if (errorWithStack2.success) {
      return {
        status: "ERROR",
        error: errorWithStack2.data,
        task: error.cause
      };
    }
    return {
      status: "ERROR",
      error: {
        message: JSON.stringify(error.cause.output)
      },
      task: error.cause
    };
  }
  if (error instanceof RetryWithTaskError) {
    const errorWithStack2 = ErrorWithStackSchema.safeParse(error.cause);
    if (errorWithStack2.success) {
      return {
        status: "ERROR",
        error: errorWithStack2.data,
        task: error.task
      };
    }
    return {
      status: "ERROR",
      error: {
        message: "Unknown error"
      },
      task: error.task
    };
  }
  const errorWithStack = ErrorWithStackSchema.safeParse(error);
  if (errorWithStack.success) {
    return {
      status: "ERROR",
      error: errorWithStack.data
    };
  }
  const message = typeof error === "string" ? error : JSON.stringify(error);
  return {
    status: "ERROR",
    error: {
      name: "Unknown error",
      message
    }
  };
}, "#convertErrorToExecutionResponse");
_createRunContext = new WeakSet();
createRunContext_fn = /* @__PURE__ */ __name(function(execution) {
  const { event, organization, project, environment, job, run, source } = execution;
  return {
    event: {
      id: event.id,
      name: event.name,
      context: event.context,
      timestamp: event.timestamp
    },
    organization,
    project: project ?? {
      id: "unknown",
      name: "unknown",
      slug: "unknown"
    },
    environment,
    job,
    run,
    account: execution.account,
    source
  };
}, "#createRunContext");
_createPreprocessRunContext = new WeakSet();
createPreprocessRunContext_fn = /* @__PURE__ */ __name(function(body3) {
  const { event, organization, environment, job, run, account } = body3;
  return {
    event: {
      id: event.id,
      name: event.name,
      context: event.context,
      timestamp: event.timestamp
    },
    organization,
    environment,
    job,
    run,
    account
  };
}, "#createPreprocessRunContext");
_handleHttpSourceRequest = new WeakSet();
handleHttpSourceRequest_fn = /* @__PURE__ */ __name(async function(source, sourceRequest) {
  __privateGet(this, _internalLogger).debug("Handling HTTP source request", {
    source
  });
  if (source.dynamicId) {
    const dynamicTrigger = __privateGet(this, _registeredDynamicTriggers)[source.dynamicId];
    if (!dynamicTrigger) {
      __privateGet(this, _internalLogger).debug("No dynamic trigger registered for HTTP source", {
        source
      });
      return {
        response: {
          status: 200,
          body: {
            ok: true
          }
        },
        events: []
      };
    }
    const results2 = await dynamicTrigger.source.handle(source, sourceRequest, __privateGet(this, _internalLogger));
    if (!results2) {
      return {
        events: [],
        response: {
          status: 200,
          body: {
            ok: true
          }
        }
      };
    }
    return {
      events: results2.events,
      response: results2.response ?? {
        status: 200,
        body: {
          ok: true
        }
      },
      metadata: results2.metadata
    };
  }
  const handler = __privateGet(this, _registeredHttpSourceHandlers)[source.key];
  if (!handler) {
    __privateGet(this, _internalLogger).debug("No handler registered for HTTP source", {
      source
    });
    return {
      response: {
        status: 200,
        body: {
          ok: true
        }
      },
      events: []
    };
  }
  const results = await handler(source, sourceRequest);
  if (!results) {
    return {
      events: [],
      response: {
        status: 200,
        body: {
          ok: true
        }
      }
    };
  }
  return {
    events: results.events,
    response: results.response ?? {
      status: 200,
      body: {
        ok: true
      }
    },
    metadata: results.metadata
  };
}, "#handleHttpSourceRequest");
_handleHttpEndpointRequestForResponse = new WeakSet();
handleHttpEndpointRequestForResponse_fn = /* @__PURE__ */ __name(async function(data, sourceRequest1) {
  __privateGet(this, _internalLogger).debug("Handling HTTP Endpoint request for response", {
    data
  });
  const httpEndpoint2 = __privateGet(this, _registeredHttpEndpoints)[data.key];
  if (!httpEndpoint2) {
    __privateGet(this, _internalLogger).debug("No handler registered for HTTP Endpoint", {
      data
    });
    return {
      response: {
        status: 200,
        body: {
          ok: true
        }
      }
    };
  }
  const handledResponse = await httpEndpoint2.handleRequest(sourceRequest1);
  if (!handledResponse) {
    __privateGet(this, _internalLogger).debug("There's no HTTP Endpoint respondWith.handler()", {
      data
    });
    return {
      response: {
        status: 200,
        body: {
          ok: true
        }
      }
    };
  }
  let body;
  try {
    body = await handledResponse.text();
  } catch (error) {
    __privateGet(this, _internalLogger).error(`Error reading httpEndpoint ${httpEndpoint2.id} respondWith.handler Response`, {
      error
    });
  }
  const response = {
    status: handledResponse.status,
    headers: handledResponse.headers ? Object.fromEntries(handledResponse.headers.entries()) : void 0,
    body
  };
  __privateGet(this, _internalLogger).info(`httpEndpoint ${httpEndpoint2.id} respondWith.handler response`, {
    response
  });
  return {
    response
  };
}, "#handleHttpEndpointRequestForResponse");
_handleWebhookRequest = new WeakSet();
handleWebhookRequest_fn = /* @__PURE__ */ __name(async function(request, ctx) {
  __privateGet(this, _internalLogger).debug("Handling webhook request", {
    ctx
  });
  const okResponse = {
    status: 200,
    body: {
      ok: true
    }
  };
  const handlers = __privateGet(this, _registeredWebhookSourceHandlers)[ctx.key];
  if (!handlers) {
    __privateGet(this, _internalLogger).debug("No handler registered for webhook", {
      ctx
    });
    return {
      response: okResponse,
      verified: false
    };
  }
  const { verify, generateEvents } = handlers;
  const verifyResult = await verify(request, this, ctx);
  if (!verifyResult.success) {
    return {
      response: okResponse,
      verified: false,
      error: verifyResult.reason
    };
  }
  await generateEvents(request, this, ctx);
  return {
    response: okResponse,
    verified: true
  };
}, "#handleWebhookRequest");
_resolveConnections = new WeakSet();
resolveConnections_fn = /* @__PURE__ */ __name(async function(ctx1, integrations, connections) {
  if (!integrations) {
    return {
      ok: true,
      data: {}
    };
  }
  const resolvedAuthResults = await Promise.all(Object.keys(integrations).map(async (key) => {
    const integration = integrations[key];
    const auth = (connections ?? {})[key];
    const result = await __privateMethod(this, _resolveConnection, resolveConnection_fn).call(this, ctx1, integration, auth);
    if (result.ok) {
      return {
        ok: true,
        auth: result.auth,
        key
      };
    } else {
      return {
        ok: false,
        error: result.error,
        key
      };
    }
  }));
  const allResolved = resolvedAuthResults.every((result) => result.ok);
  if (allResolved) {
    return {
      ok: true,
      data: resolvedAuthResults.reduce((acc, result) => {
        acc[result.key] = result.auth;
        return acc;
      }, {})
    };
  } else {
    return {
      ok: false,
      issues: resolvedAuthResults.reduce((acc, result) => {
        if (result.ok) {
          return acc;
        }
        const integration = integrations[result.key];
        acc[result.key] = {
          id: integration.id,
          error: result.error
        };
        return acc;
      }, {})
    };
  }
}, "#resolveConnections");
_resolveConnection = new WeakSet();
resolveConnection_fn = /* @__PURE__ */ __name(async function(ctx2, integration, auth) {
  if (auth) {
    return {
      ok: true,
      auth
    };
  }
  const authResolver = __privateGet(this, _authResolvers)[integration.id];
  if (!authResolver) {
    if (integration.authSource === "HOSTED") {
      return {
        ok: false,
        error: `Something went wrong: Integration ${integration.id} is missing auth credentials from Trigger.dev`
      };
    }
    return {
      ok: true,
      auth: void 0
    };
  }
  try {
    const resolvedAuth = await authResolver(ctx2, integration);
    if (!resolvedAuth) {
      return {
        ok: false,
        error: `Auth could not be resolved for ${integration.id}: auth resolver returned null or undefined`
      };
    }
    return {
      ok: true,
      auth: resolvedAuth.type === "apiKey" ? {
        type: "apiKey",
        accessToken: resolvedAuth.token,
        additionalFields: resolvedAuth.additionalFields
      } : {
        type: "oauth2",
        accessToken: resolvedAuth.token,
        additionalFields: resolvedAuth.additionalFields
      }
    };
  } catch (resolverError) {
    if (resolverError instanceof Error) {
      return {
        ok: false,
        error: `Auth could not be resolved for ${integration.id}: auth resolver threw. ${resolverError.name}: ${resolverError.message}`
      };
    } else if (typeof resolverError === "string") {
      return {
        ok: false,
        error: `Auth could not be resolved for ${integration.id}: auth resolver threw an error: ${resolverError}`
      };
    }
    return {
      ok: false,
      error: `Auth could not be resolved for ${integration.id}: auth resolver threw an unknown error: ${JSON.stringify(resolverError)}`
    };
  }
}, "#resolveConnection");
_buildJobsIndex = new WeakSet();
buildJobsIndex_fn = /* @__PURE__ */ __name(function() {
  return Object.values(__privateGet(this, _registeredJobs)).map((job) => __privateMethod(this, _buildJobIndex, buildJobIndex_fn).call(this, job));
}, "#buildJobsIndex");
_buildJobIndex = new WeakSet();
buildJobIndex_fn = /* @__PURE__ */ __name(function(job2) {
  const internal = job2.options.__internal;
  return {
    id: job2.id,
    name: job2.name,
    version: job2.version,
    event: job2.trigger.event,
    trigger: job2.trigger.toJSON(),
    integrations: __privateMethod(this, _buildJobIntegrations, buildJobIntegrations_fn).call(this, job2),
    startPosition: "latest",
    enabled: job2.enabled,
    preprocessRuns: job2.trigger.preprocessRuns,
    internal,
    concurrencyLimit: typeof job2.options.concurrencyLimit === "number" ? job2.options.concurrencyLimit : typeof job2.options.concurrencyLimit === "object" ? {
      id: job2.options.concurrencyLimit.id,
      limit: job2.options.concurrencyLimit.limit
    } : void 0
  };
}, "#buildJobIndex");
_buildJobIntegrations = new WeakSet();
buildJobIntegrations_fn = /* @__PURE__ */ __name(function(job3) {
  return Object.keys(job3.options.integrations ?? {}).reduce((acc, key) => {
    const integration = job3.options.integrations[key];
    acc[key] = __privateMethod(this, _buildJobIntegration, buildJobIntegration_fn).call(this, integration);
    return acc;
  }, {});
}, "#buildJobIntegrations");
_buildJobIntegration = new WeakSet();
buildJobIntegration_fn = /* @__PURE__ */ __name(function(integration1) {
  const authSource = __privateGet(this, _authResolvers)[integration1.id] ? "RESOLVER" : integration1.authSource;
  return {
    id: integration1.id,
    metadata: integration1.metadata,
    authSource
  };
}, "#buildJobIntegration");
_logIOStats = new WeakSet();
logIOStats_fn = /* @__PURE__ */ __name(function(stats) {
  __privateGet(this, _internalLogger).debug("IO stats", {
    stats
  });
}, "#logIOStats");
_standardResponseHeaders = new WeakSet();
standardResponseHeaders_fn = /* @__PURE__ */ __name(function(start) {
  return {
    "Trigger-Version": API_VERSIONS.LAZY_LOADED_CACHED_TASKS,
    "Trigger-SDK-Version": version,
    "X-Trigger-Request-Timing": `dur=${performance.now() - start / 1e3}`
  };
}, "#standardResponseHeaders");
_serializeRunMetadata = new WeakSet();
serializeRunMetadata_fn = /* @__PURE__ */ __name(function(job4) {
  const metadata = {};
  if (__privateGet(this, _eventEmitter).listenerCount("runSucceeeded") > 0 || typeof job4.options.onSuccess === "function") {
    metadata["successSubscription"] = true;
  }
  if (__privateGet(this, _eventEmitter).listenerCount("runFailed") > 0 || typeof job4.options.onFailure === "function") {
    metadata["failedSubscription"] = true;
  }
  return JSON.stringify(metadata);
}, "#serializeRunMetadata");
_deliverSuccessfulRunNotification = new WeakSet();
deliverSuccessfulRunNotification_fn = /* @__PURE__ */ __name(async function(notification) {
  __privateGet(this, _internalLogger).debug("delivering successful run notification", {
    notification
  });
  __privateGet(this, _eventEmitter).emit("runSucceeeded", notification);
  const job = __privateGet(this, _registeredJobs)[notification.job.id];
  if (!job) {
    return;
  }
  if (typeof job.options.onSuccess === "function") {
    await job.options.onSuccess(notification);
  }
}, "#deliverSuccessfulRunNotification");
_deliverFailedRunNotification = new WeakSet();
deliverFailedRunNotification_fn = /* @__PURE__ */ __name(async function(notification1) {
  __privateGet(this, _internalLogger).debug("delivering failed run notification", {
    notification: notification1
  });
  __privateGet(this, _eventEmitter).emit("runFailed", notification1);
  const job = __privateGet(this, _registeredJobs)[notification1.job.id];
  if (!job) {
    return;
  }
  if (typeof job.options.onFailure === "function") {
    await job.options.onFailure(notification1);
  }
}, "#deliverFailedRunNotification");
__name(_TriggerClient, "TriggerClient");
var TriggerClient = _TriggerClient;
function dynamicTriggerRegisterSourceJobId(id) {
  return `register-dynamic-trigger-${id}`;
}
__name(dynamicTriggerRegisterSourceJobId, "dynamicTriggerRegisterSourceJobId");
function deepMergeOptions(obj1, obj2) {
  const mergedOptions = {
    ...obj1
  };
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (key in mergedOptions) {
        mergedOptions[key] = [
          ...mergedOptions[key],
          ...obj2[key]
        ];
      } else {
        mergedOptions[key] = obj2[key];
      }
    }
  }
  return mergedOptions;
}
__name(deepMergeOptions, "deepMergeOptions");
var _ExternalSource = class _ExternalSource {
  constructor(channel, options) {
    this.options = options;
    this.channel = channel;
  }
  async handle(source, rawEvent, logger) {
    return this.options.handler({
      source: {
        ...source,
        params: source.params
      },
      rawEvent
    }, logger, this.options.integration);
  }
  filter(params, options) {
    return this.options.filter?.(params, options) ?? {};
  }
  properties(params) {
    return this.options.properties?.(params) ?? [];
  }
  async register(params, registerEvent, io, ctx) {
    const { result: event, ommited: source } = omit(registerEvent, "source");
    const { result: sourceWithoutChannel, ommited: channel } = omit(source, "channel");
    const { result: channelWithoutType } = omit(channel, "type");
    const updates = await this.options.register({
      ...event,
      source: {
        ...sourceWithoutChannel,
        ...channelWithoutType
      },
      params
    }, io, ctx);
    return updates;
  }
  key(params) {
    const parts = [
      this.options.id,
      this.channel
    ];
    parts.push(this.options.key(params));
    parts.push(this.integration.id);
    return parts.join("-");
  }
  get integration() {
    return this.options.integration;
  }
  get integrationConfig() {
    return {
      id: this.integration.id,
      metadata: this.integration.metadata
    };
  }
  get id() {
    return this.options.id;
  }
  get version() {
    return this.options.version;
  }
};
__name(_ExternalSource, "ExternalSource");
var ExternalSource = _ExternalSource;
var _ExternalSourceTrigger = class _ExternalSourceTrigger {
  constructor(options) {
    this.options = options;
  }
  get event() {
    return this.options.event;
  }
  toJSON() {
    return {
      type: "static",
      title: "External Source",
      rule: {
        event: this.event.name,
        payload: deepMergeFilters(this.options.source.filter(this.options.params, this.options.options), this.event.filter ?? {}, this.options.params.filter ?? {}),
        source: this.event.source
      },
      properties: this.options.source.properties(this.options.params)
    };
  }
  attachToJob(triggerClient, job) {
    triggerClient.attachSource({
      key: slugifyId(this.options.source.key(this.options.params)),
      source: this.options.source,
      event: this.options.event,
      params: this.options.params,
      options: this.options.options
    });
  }
  get preprocessRuns() {
    return true;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
};
__name(_ExternalSourceTrigger, "ExternalSourceTrigger");
var ExternalSourceTrigger = _ExternalSourceTrigger;
function omit(obj, key) {
  const result = {};
  for (const k of Object.keys(obj)) {
    if (k === key)
      continue;
    result[k] = obj[k];
  }
  return {
    result,
    ommited: obj[key]
  };
}
__name(omit, "omit");
function missingConnectionNotification(integrations) {
  return new MissingConnectionNotification({
    integrations
  });
}
__name(missingConnectionNotification, "missingConnectionNotification");
function missingConnectionResolvedNotification(integrations) {
  return new MissingConnectionResolvedNotification({
    integrations
  });
}
__name(missingConnectionResolvedNotification, "missingConnectionResolvedNotification");
var _MissingConnectionNotification = class _MissingConnectionNotification {
  constructor(options) {
    this.options = options;
  }
  get event() {
    return {
      name: MISSING_CONNECTION_NOTIFICATION,
      title: "Missing Connection Notification",
      source: "trigger.dev",
      icon: "connection-alert",
      parsePayload: MissingConnectionNotificationPayloadSchema.parse,
      properties: [
        {
          label: "Integrations",
          text: this.options.integrations.map((i) => i.id).join(", ")
        }
      ]
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
  toJSON() {
    return {
      type: "static",
      title: this.event.title,
      rule: {
        event: this.event.name,
        source: "trigger.dev",
        payload: {
          client: {
            id: this.options.integrations.map((i) => i.id)
          }
        }
      }
    };
  }
};
__name(_MissingConnectionNotification, "MissingConnectionNotification");
var MissingConnectionNotification = _MissingConnectionNotification;
var _MissingConnectionResolvedNotification = class _MissingConnectionResolvedNotification {
  constructor(options) {
    this.options = options;
  }
  get event() {
    return {
      name: MISSING_CONNECTION_RESOLVED_NOTIFICATION,
      title: "Missing Connection Resolved Notification",
      source: "trigger.dev",
      icon: "connection-alert",
      parsePayload: MissingConnectionResolvedNotificationPayloadSchema.parse,
      properties: [
        {
          label: "Integrations",
          text: this.options.integrations.map((i) => i.id).join(", ")
        }
      ]
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
  toJSON() {
    return {
      type: "static",
      title: this.event.title,
      rule: {
        event: this.event.name,
        source: "trigger.dev",
        payload: {
          client: {
            id: this.options.integrations.map((i) => i.id)
          }
        }
      }
    };
  }
};
__name(_MissingConnectionResolvedNotification, "MissingConnectionResolvedNotification");
var MissingConnectionResolvedNotification = _MissingConnectionResolvedNotification;

// src/triggers/invokeTrigger.ts
var _options5;
var _InvokeTrigger = class _InvokeTrigger {
  constructor(options) {
    __privateAdd(this, _options5, void 0);
    __privateSet(this, _options5, options);
  }
  toJSON() {
    return {
      type: "invoke"
    };
  }
  get event() {
    return {
      name: "invoke",
      title: "Manual Invoke",
      source: "trigger.dev",
      examples: __privateGet(this, _options5).examples ?? [],
      icon: "trigger",
      parsePayload: (rawPayload) => {
        if (__privateGet(this, _options5).schema) {
          const results = __privateGet(this, _options5).schema.safeParse(rawPayload);
          if (!results.success) {
            throw new ParsedPayloadSchemaError(formatSchemaErrors(results.error.issues));
          }
          return results.data;
        }
        return rawPayload;
      },
      parseInvokePayload: (rawPayload) => {
        if (__privateGet(this, _options5).schema) {
          const results = __privateGet(this, _options5).schema.safeParse(rawPayload);
          if (!results.success) {
            throw new ParsedPayloadSchemaError(formatSchemaErrors(results.error.issues));
          }
          return results.data;
        }
        return rawPayload;
      }
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload() {
    return {
      success: true
    };
  }
};
_options5 = new WeakMap();
__name(_InvokeTrigger, "InvokeTrigger");
var InvokeTrigger = _InvokeTrigger;
function invokeTrigger(options) {
  return new InvokeTrigger(options ?? {});
}
__name(invokeTrigger, "invokeTrigger");
var _shortHash, shortHash_fn;
var _WebhookSource = class _WebhookSource {
  constructor(options) {
    __privateAdd(this, _shortHash);
    this.options = options;
  }
  async generateEvents(request, client, ctx) {
    return this.options.generateEvents({
      request,
      client,
      ctx
    });
  }
  filter(params, config) {
    return this.options.filter?.(params, config) ?? {};
  }
  properties(params) {
    return this.options.properties?.(params) ?? [];
  }
  get crud() {
    return this.options.crud;
  }
  async register(params, registerEvent, io, ctx) {
    if (!this.options.register) {
      return;
    }
    const updates = await this.options.register({
      ...registerEvent,
      params
    }, io, ctx);
    return updates;
  }
  async verify(request, client, ctx) {
    if (this.options.verify) {
      const clonedRequest = request.clone();
      return this.options.verify({
        request: clonedRequest,
        client,
        ctx
      });
    }
    return {
      success: true
    };
  }
  key(params) {
    const parts = [
      "webhook"
    ];
    parts.push(this.options.key(params));
    parts.push(this.integration.id);
    return `${this.options.id}-${__privateMethod(this, _shortHash, shortHash_fn).call(this, parts.join(""))}`;
  }
  get integration() {
    return this.options.integration;
  }
  get integrationConfig() {
    return {
      id: this.integration.id,
      metadata: this.integration.metadata
    };
  }
  get id() {
    return this.options.id;
  }
  get version() {
    return this.options.version;
  }
};
_shortHash = new WeakSet();
shortHash_fn = /* @__PURE__ */ __name(function(str) {
  const hash = createHash("sha1").update(str).digest("hex");
  return hash.slice(0, 7);
}, "#shortHash");
__name(_WebhookSource, "WebhookSource");
var WebhookSource = _WebhookSource;
var _WebhookTrigger = class _WebhookTrigger {
  constructor(options) {
    this.options = options;
  }
  get event() {
    return this.options.event;
  }
  get source() {
    return this.options.source;
  }
  get key() {
    return slugifyId(this.options.source.key(this.options.params));
  }
  toJSON() {
    return {
      type: "static",
      title: "Webhook",
      rule: {
        event: this.event.name,
        payload: deepMergeFilters(this.options.source.filter(this.options.params, this.options.config), this.event.filter ?? {}),
        source: this.event.source
      },
      properties: this.options.source.properties(this.options.params),
      link: `http-endpoints/${this.key}`
    };
  }
  filter(eventFilter) {
    const { event, ...optionsWithoutEvent } = this.options;
    const { filter, ...eventWithoutFilter } = event;
    return new _WebhookTrigger({
      ...optionsWithoutEvent,
      event: {
        ...eventWithoutFilter,
        filter: deepMergeFilters(filter ?? {}, eventFilter)
      }
    });
  }
  attachToJob(triggerClient, job) {
    triggerClient.defineHttpEndpoint({
      id: this.key,
      source: "trigger.dev",
      icon: this.event.icon,
      verify: async () => ({
        success: true
      })
    }, true);
    triggerClient.attachWebhook({
      key: this.key,
      source: this.options.source,
      event: this.options.event,
      params: this.options.params,
      config: this.options.config
    });
  }
  get preprocessRuns() {
    return true;
  }
  async verifyPayload(payload) {
    return {
      success: true
    };
  }
};
__name(_WebhookTrigger, "WebhookTrigger");
var WebhookTrigger = _WebhookTrigger;
async function verifyRequestSignature({ request, headerName, headerEncoding = "hex", secret, algorithm }) {
  if (!secret) {
    return {
      success: false,
      reason: "Missing secret \u2013 you've probably not set an environment variable."
    };
  }
  const headerValue = request.headers.get(headerName);
  if (!headerValue) {
    return {
      success: false,
      reason: "Missing header"
    };
  }
  switch (algorithm) {
    case "sha256":
      const success = verifyHmacSha256(headerValue, headerEncoding, secret, await request.text());
      if (success) {
        return {
          success
        };
      } else {
        return {
          success: false,
          reason: "Failed sha256 verification"
        };
      }
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
__name(verifyRequestSignature, "verifyRequestSignature");
function verifyHmacSha256(headerValue, headerEncoding, secret, body) {
  const bodyDigest = crypto.createHmac("sha256", secret).update(body).digest(headerEncoding);
  const signature = headerValue?.replace("hmac-sha256=", "").replace("sha256=", "") ?? "";
  return signature === bodyDigest;
}
__name(verifyHmacSha256, "verifyHmacSha256");

// src/index.ts
function redactString(strings, ...interpolations) {
  return {
    __redactedString: true,
    strings: strings.raw,
    interpolations
  };
}
__name(redactString, "redactString");

export { CronTrigger, DynamicSchedule, DynamicTrigger, EventSpecificationExampleSchema, EventTrigger, ExternalSource, ExternalSourceTrigger, IO, IOLogger, IntervalTrigger, InvokeTrigger, JSONOutputSerializer, Job, MissingConnectionNotification, MissingConnectionResolvedNotification, TriggerClient, WebhookSource, WebhookTrigger, cronTrigger, eventTrigger, intervalTrigger, invokeTrigger, isTriggerError, missingConnectionNotification, missingConnectionResolvedNotification, omit, redactString, retry, slugifyId, verifyHmacSha256, verifyRequestSignature, waitForEventSchema };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map