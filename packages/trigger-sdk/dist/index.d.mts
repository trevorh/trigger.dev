import * as _trigger_dev_core from '@trigger.dev/core';
import { AsyncMap, KeyValueStoreResponseBody, RunTaskBodyInput, CompleteTaskBodyV2Input, FailTaskBodyInput, SendEvent, SendEventOptions, StatusUpdate, UpdateTriggerSourceBodyV2, TriggerSource, UpdateWebhookBody, RegisterTriggerBodyV2, RegisterSourceEventV2, ScheduleMetadata, GetRunOptionsWithTaskDetails, GetRunsOptions, InvokeOptions, EphemeralEventDispatcherRequestBody, RuntimeEnvironmentType, DisplayProperty, TriggerMetadata, EventFilter, SuccessfulRunNotification, FailedRunNotification, HttpEndpointMetadata, RequestFilter, Prettify, HandleTriggerSource, RegisterTriggerSource, SerializableJson, ConnectionAuth, NormalizedResponse, HttpSourceResponseMetadata, IntervalOptions, CronOptions, ScheduledPayload, RegisterWebhookSource, DeserializedJson, ServerTask, CachedTask, InitialStatusUpdate, FetchRequestInit, FetchRetryOptions, FetchTimeoutOptions, FetchPollOperation, RunTaskOptions, IntegrationMetadata, IntegrationConfig, JobMetadata, RunNotification, MissingConnectionNotificationPayload, MissingConnectionResolvedNotificationPayload, ErrorWithStack, ApiEventLog, RedactString } from '@trigger.dev/core';
export { ConnectionAuth, DisplayProperty, EventFilter, NormalizedRequest, OverridableRunTaskOptions, Prettify, RedactString, RegisteredOptionsDiff, RunTaskOptions, SourceEventOption } from '@trigger.dev/core';
import { LogLevel, Logger } from '@trigger.dev/core-backend';
export { Logger } from '@trigger.dev/core-backend';
import * as zod from 'zod';
import { z, ZodType, TypeOf } from 'zod';
import { Buffer } from 'buffer';
import { BinaryToTextEncoding, BinaryLike, KeyObject } from 'crypto';

type ConcurrencyLimitOptions = {
    id: string;
    limit: number;
};
declare class ConcurrencyLimit {
    private options;
    constructor(options: ConcurrencyLimitOptions);
    get id(): string;
    get limit(): number;
}

type QueryKeyValueStoreFunction = (action: "DELETE" | "GET" | "HAS" | "SET", data: {
    key: string;
    value?: string;
}) => Promise<KeyValueStoreResponseBody>;
declare class KeyValueStoreClient implements AsyncMap {
    #private;
    private queryStore;
    private type;
    private namespace;
    constructor(queryStore: QueryKeyValueStoreFunction, type?: string | null, namespace?: string);
    delete(key: string): Promise<boolean>;
    get<T extends Json<T>>(key: string): Promise<T | undefined>;
    has(key: string): Promise<boolean>;
    set<T extends Json<T>>(key: string, value: T): Promise<T>;
}

type ApiClientOptions = {
    apiKey?: string;
    apiUrl?: string;
    logLevel?: LogLevel;
};
type EndpointRecord = {
    id: string;
    name: string;
    url: string;
};
declare class ApiClient {
    #private;
    constructor(options: ApiClientOptions);
    registerEndpoint(options: {
        url: string;
        name: string;
    }): Promise<EndpointRecord>;
    runTask(runId: string, task: RunTaskBodyInput, options?: {
        cachedTasksCursor?: string;
    }): Promise<VersionedResponseBody<{
        "2023-09-29": z.ZodObject<{
            task: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                noop: z.ZodBoolean;
                startedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
                completedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
                delayUntil: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
                status: z.ZodEnum<["PENDING", "WAITING", "RUNNING", "COMPLETED", "ERRORED", "CANCELED"]>;
                description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                params: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
                properties: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    text: z.ZodString;
                    url: z.ZodOptional<z.ZodString>;
                    imageUrl: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }, {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }>, "many">>>;
                outputProperties: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    text: z.ZodString;
                    url: z.ZodOptional<z.ZodString>;
                    imageUrl: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }, {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }>, "many">>>;
                output: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
                context: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
                error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                style: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                    style: z.ZodEnum<["normal", "minimal"]>;
                    variant: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                }, {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                }>>>;
                operation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                callbackUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                childExecutionMode: z.ZodNullable<z.ZodOptional<z.ZodEnum<["SEQUENTIAL", "PARALLEL"]>>>;
                idempotencyKey: z.ZodString;
                attempts: z.ZodNumber;
                forceYield: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                noop: boolean;
                status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                idempotencyKey: string;
                attempts: number;
                icon?: string | null | undefined;
                startedAt?: Date | null | undefined;
                completedAt?: Date | null | undefined;
                delayUntil?: Date | null | undefined;
                description?: string | null | undefined;
                params?: _trigger_dev_core.DeserializedJson | undefined;
                properties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                outputProperties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                output?: _trigger_dev_core.DeserializedJson | undefined;
                context?: _trigger_dev_core.DeserializedJson | undefined;
                error?: string | null | undefined;
                parentId?: string | null | undefined;
                style?: {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                } | null | undefined;
                operation?: string | null | undefined;
                callbackUrl?: string | null | undefined;
                childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
                forceYield?: boolean | null | undefined;
            }, {
                id: string;
                name: string;
                noop: boolean;
                status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                idempotencyKey: string;
                attempts: number;
                icon?: string | null | undefined;
                startedAt?: Date | null | undefined;
                completedAt?: Date | null | undefined;
                delayUntil?: Date | null | undefined;
                description?: string | null | undefined;
                params?: _trigger_dev_core.DeserializedJson | undefined;
                properties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                outputProperties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                output?: _trigger_dev_core.DeserializedJson | undefined;
                context?: _trigger_dev_core.DeserializedJson | undefined;
                error?: string | null | undefined;
                parentId?: string | null | undefined;
                style?: {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                } | null | undefined;
                operation?: string | null | undefined;
                callbackUrl?: string | null | undefined;
                childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
                forceYield?: boolean | null | undefined;
            }>;
            cachedTasks: z.ZodOptional<z.ZodObject<{
                tasks: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    idempotencyKey: z.ZodString;
                    status: z.ZodEnum<["PENDING", "WAITING", "RUNNING", "COMPLETED", "ERRORED", "CANCELED"]>;
                    noop: z.ZodDefault<z.ZodBoolean>;
                    output: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
                    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    noop: boolean;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }, {
                    id: string;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    noop?: boolean | undefined;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }>, "many">;
                cursor: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                tasks: {
                    id: string;
                    noop: boolean;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }[];
                cursor?: string | undefined;
            }, {
                tasks: {
                    id: string;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    noop?: boolean | undefined;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }[];
                cursor?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            task: {
                id: string;
                name: string;
                noop: boolean;
                status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                idempotencyKey: string;
                attempts: number;
                icon?: string | null | undefined;
                startedAt?: Date | null | undefined;
                completedAt?: Date | null | undefined;
                delayUntil?: Date | null | undefined;
                description?: string | null | undefined;
                params?: _trigger_dev_core.DeserializedJson | undefined;
                properties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                outputProperties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                output?: _trigger_dev_core.DeserializedJson | undefined;
                context?: _trigger_dev_core.DeserializedJson | undefined;
                error?: string | null | undefined;
                parentId?: string | null | undefined;
                style?: {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                } | null | undefined;
                operation?: string | null | undefined;
                callbackUrl?: string | null | undefined;
                childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
                forceYield?: boolean | null | undefined;
            };
            cachedTasks?: {
                tasks: {
                    id: string;
                    noop: boolean;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }[];
                cursor?: string | undefined;
            } | undefined;
        }, {
            task: {
                id: string;
                name: string;
                noop: boolean;
                status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                idempotencyKey: string;
                attempts: number;
                icon?: string | null | undefined;
                startedAt?: Date | null | undefined;
                completedAt?: Date | null | undefined;
                delayUntil?: Date | null | undefined;
                description?: string | null | undefined;
                params?: _trigger_dev_core.DeserializedJson | undefined;
                properties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                outputProperties?: {
                    label: string;
                    text: string;
                    url?: string | undefined;
                    imageUrl?: string[] | undefined;
                }[] | null | undefined;
                output?: _trigger_dev_core.DeserializedJson | undefined;
                context?: _trigger_dev_core.DeserializedJson | undefined;
                error?: string | null | undefined;
                parentId?: string | null | undefined;
                style?: {
                    style: "normal" | "minimal";
                    variant?: string | undefined;
                } | null | undefined;
                operation?: string | null | undefined;
                callbackUrl?: string | null | undefined;
                childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
                forceYield?: boolean | null | undefined;
            };
            cachedTasks?: {
                tasks: {
                    id: string;
                    status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
                    idempotencyKey: string;
                    noop?: boolean | undefined;
                    output?: _trigger_dev_core.DeserializedJson | undefined;
                    parentId?: string | null | undefined;
                }[];
                cursor?: string | undefined;
            } | undefined;
        }>;
    }, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        noop: z.ZodBoolean;
        startedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
        completedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
        delayUntil: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
        status: z.ZodEnum<["PENDING", "WAITING", "RUNNING", "COMPLETED", "ERRORED", "CANCELED"]>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        params: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
        properties: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            text: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            imageUrl: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }, {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }>, "many">>>;
        outputProperties: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            text: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            imageUrl: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }, {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }>, "many">>>;
        output: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
        context: z.ZodNullable<z.ZodOptional<z.ZodType<_trigger_dev_core.DeserializedJson, z.ZodTypeDef, _trigger_dev_core.DeserializedJson>>>;
        error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        style: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            style: z.ZodEnum<["normal", "minimal"]>;
            variant: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            style: "normal" | "minimal";
            variant?: string | undefined;
        }, {
            style: "normal" | "minimal";
            variant?: string | undefined;
        }>>>;
        operation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        callbackUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        childExecutionMode: z.ZodNullable<z.ZodOptional<z.ZodEnum<["SEQUENTIAL", "PARALLEL"]>>>;
        idempotencyKey: z.ZodString;
        attempts: z.ZodNumber;
        forceYield: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        noop: boolean;
        status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
        idempotencyKey: string;
        attempts: number;
        icon?: string | null | undefined;
        startedAt?: Date | null | undefined;
        completedAt?: Date | null | undefined;
        delayUntil?: Date | null | undefined;
        description?: string | null | undefined;
        params?: _trigger_dev_core.DeserializedJson | undefined;
        properties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        outputProperties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        output?: _trigger_dev_core.DeserializedJson | undefined;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        error?: string | null | undefined;
        parentId?: string | null | undefined;
        style?: {
            style: "normal" | "minimal";
            variant?: string | undefined;
        } | null | undefined;
        operation?: string | null | undefined;
        callbackUrl?: string | null | undefined;
        childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
        forceYield?: boolean | null | undefined;
    }, {
        id: string;
        name: string;
        noop: boolean;
        status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
        idempotencyKey: string;
        attempts: number;
        icon?: string | null | undefined;
        startedAt?: Date | null | undefined;
        completedAt?: Date | null | undefined;
        delayUntil?: Date | null | undefined;
        description?: string | null | undefined;
        params?: _trigger_dev_core.DeserializedJson | undefined;
        properties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        outputProperties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        output?: _trigger_dev_core.DeserializedJson | undefined;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        error?: string | null | undefined;
        parentId?: string | null | undefined;
        style?: {
            style: "normal" | "minimal";
            variant?: string | undefined;
        } | null | undefined;
        operation?: string | null | undefined;
        callbackUrl?: string | null | undefined;
        childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
        forceYield?: boolean | null | undefined;
    }>>>;
    completeTask(runId: string, id: string, task: CompleteTaskBodyV2Input): Promise<{
        id: string;
        name: string;
        noop: boolean;
        status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
        idempotencyKey: string;
        attempts: number;
        icon?: string | null | undefined;
        startedAt?: Date | null | undefined;
        completedAt?: Date | null | undefined;
        delayUntil?: Date | null | undefined;
        description?: string | null | undefined;
        params?: _trigger_dev_core.DeserializedJson | undefined;
        properties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        outputProperties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        output?: _trigger_dev_core.DeserializedJson | undefined;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        error?: string | null | undefined;
        parentId?: string | null | undefined;
        style?: {
            style: "normal" | "minimal";
            variant?: string | undefined;
        } | null | undefined;
        operation?: string | null | undefined;
        callbackUrl?: string | null | undefined;
        childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
        forceYield?: boolean | null | undefined;
    }>;
    failTask(runId: string, id: string, body: FailTaskBodyInput): Promise<{
        id: string;
        name: string;
        noop: boolean;
        status: "PENDING" | "WAITING" | "RUNNING" | "COMPLETED" | "ERRORED" | "CANCELED";
        idempotencyKey: string;
        attempts: number;
        icon?: string | null | undefined;
        startedAt?: Date | null | undefined;
        completedAt?: Date | null | undefined;
        delayUntil?: Date | null | undefined;
        description?: string | null | undefined;
        params?: _trigger_dev_core.DeserializedJson | undefined;
        properties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        outputProperties?: {
            label: string;
            text: string;
            url?: string | undefined;
            imageUrl?: string[] | undefined;
        }[] | null | undefined;
        output?: _trigger_dev_core.DeserializedJson | undefined;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        error?: string | null | undefined;
        parentId?: string | null | undefined;
        style?: {
            style: "normal" | "minimal";
            variant?: string | undefined;
        } | null | undefined;
        operation?: string | null | undefined;
        callbackUrl?: string | null | undefined;
        childExecutionMode?: "SEQUENTIAL" | "PARALLEL" | null | undefined;
        forceYield?: boolean | null | undefined;
    }>;
    sendEvent(event: SendEvent, options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    sendEvents(events: SendEvent[], options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }[]>;
    cancelEvent(eventId: string): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    cancelRunsForEvent(eventId: string): Promise<{
        cancelledRunIds: string[];
        failedToCancelRunIds: string[];
    }>;
    updateStatus(runId: string, id: string, status: StatusUpdate): Promise<{
        label: string;
        key: string;
        history: {
            label?: string | undefined;
            state?: "loading" | "success" | "failure" | undefined;
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        }[];
        data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        state?: "loading" | "success" | "failure" | undefined;
    }>;
    updateSource(client: string, key: string, source: UpdateTriggerSourceBodyV2): Promise<TriggerSource>;
    updateWebhook(key: string, webhookData: UpdateWebhookBody): Promise<TriggerSource>;
    registerTrigger(client: string, id: string, key: string, payload: RegisterTriggerBodyV2, idempotencyKey?: string): Promise<RegisterSourceEventV2>;
    registerSchedule(client: string, id: string, key: string, payload: ScheduleMetadata): Promise<{
        id: string;
        schedule: {
            options: {
                cron: string;
            };
            type: "cron";
            accountId?: string | undefined;
            metadata?: any;
        } | {
            options: {
                seconds: number;
            };
            type: "interval";
            accountId?: string | undefined;
            metadata?: any;
        };
        active: boolean;
        metadata?: any;
    }>;
    unregisterSchedule(client: string, id: string, key: string): Promise<{
        ok: boolean;
    }>;
    getAuth(client: string, id: string): Promise<{
        type: "oauth2" | "apiKey";
        accessToken: string;
        scopes?: string[] | undefined;
        additionalFields?: Record<string, string> | undefined;
    } | undefined>;
    getEvent(eventId: string): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        runs: {
            id: string;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            startedAt?: Date | null | undefined;
            completedAt?: Date | null | undefined;
        }[];
        createdAt: Date;
    }>;
    getRun(runId: string, options?: GetRunOptionsWithTaskDetails): Promise<{
        id: string;
        startedAt: Date | null;
        completedAt: Date | null;
        status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
        updatedAt: Date | null;
        tasks: _trigger_dev_core.RunTaskWithSubtasks[];
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        output?: any;
        nextCursor?: string | undefined;
    }>;
    cancelRun(runId: string): Promise<{
        id: string;
        startedAt: Date | null;
        completedAt: Date | null;
        status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
        updatedAt: Date | null;
        tasks: _trigger_dev_core.RunTaskWithSubtasks[];
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        output?: any;
        nextCursor?: string | undefined;
    }>;
    getRunStatuses(runId: string): Promise<{
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        run: {
            id: string;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            output?: any;
        };
    }>;
    getRuns(jobSlug: string, options?: GetRunsOptions): Promise<{
        runs: {
            id: string;
            startedAt: Date | null;
            completedAt: Date | null;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            updatedAt: Date | null;
        }[];
        nextCursor?: string | undefined;
    }>;
    invokeJob(jobId: string, payload: any, options?: InvokeOptions): Promise<{
        id: string;
    }>;
    cancelRunsForJob(jobId: string): Promise<{
        cancelledRunIds: string[];
        failedToCancelRunIds: string[];
    }>;
    createEphemeralEventDispatcher(payload: EphemeralEventDispatcherRequestBody): Promise<{
        id: string;
    }>;
    get store(): KeyValueStoreClient;
}
type VersionedResponseBodyMap = {
    [key: string]: z.ZodTypeAny;
};
type VersionedResponseBody<TVersions extends VersionedResponseBodyMap, TUnversioned extends z.ZodTypeAny> = {
    [TVersion in keyof TVersions]: {
        version: TVersion;
        body: z.infer<TVersions[TVersion]>;
    };
}[keyof TVersions] | {
    version: "unversioned";
    body: z.infer<TUnversioned>;
};

declare class TriggerStatus {
    private id;
    private io;
    constructor(id: string, io: IO);
    update(key: IntegrationTaskKey, status: StatusUpdate): Promise<{
        label: string;
        key: string;
        history: {
            label?: string | undefined;
            state?: "loading" | "success" | "failure" | undefined;
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        }[];
        data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        state?: "loading" | "success" | "failure" | undefined;
    }>;
}

type EventMap = {
  [key: string]: (...args: any[]) => void
}

/**
 * Type-safe event emitter.
 *
 * Use it like this:
 *
 * ```typescript
 * type MyEvents = {
 *   error: (error: Error) => void;
 *   message: (from: string, content: string) => void;
 * }
 *
 * const myEmitter = new EventEmitter() as TypedEmitter<MyEvents>;
 *
 * myEmitter.emit("error", "x")  // <- Will catch this type error;
 * ```
 */
interface TypedEventEmitter<Events extends EventMap> {
  addListener<E extends keyof Events> (event: E, listener: Events[E]): this
  on<E extends keyof Events> (event: E, listener: Events[E]): this
  once<E extends keyof Events> (event: E, listener: Events[E]): this
  prependListener<E extends keyof Events> (event: E, listener: Events[E]): this
  prependOnceListener<E extends keyof Events> (event: E, listener: Events[E]): this

  off<E extends keyof Events>(event: E, listener: Events[E]): this
  removeAllListeners<E extends keyof Events> (event?: E): this
  removeListener<E extends keyof Events> (event: E, listener: Events[E]): this

  emit<E extends keyof Events> (event: E, ...args: Parameters<Events[E]>): boolean
  // The sloppy `eventNames()` return type is to mitigate type incompatibilities - see #5
  eventNames (): (keyof Events | string | symbol)[]
  rawListeners<E extends keyof Events> (event: E): Events[E][]
  listeners<E extends keyof Events> (event: E): Events[E][]
  listenerCount<E extends keyof Events> (event: E): number

  getMaxListeners (): number
  setMaxListeners (maxListeners: number): this
}

interface TriggerContext {
    /** Job metadata */
    job: {
        id: string;
        version: string;
    };
    /** Environment metadata */
    environment: {
        slug: string;
        id: string;
        type: RuntimeEnvironmentType;
    };
    /** Organization metadata */
    organization: {
        slug: string;
        id: string;
        title: string;
    };
    /** Project metadata */
    project: {
        slug: string;
        id: string;
        name: string;
    };
    /** Run metadata */
    run: {
        id: string;
        isTest: boolean;
        startedAt: Date;
        isRetry: boolean;
    };
    /** Event metadata */
    event: {
        id: string;
        name: string;
        context: any;
        timestamp: Date;
    };
    /** Source metadata */
    source?: {
        id: string;
        metadata?: any;
    };
    /** Account metadata */
    account?: {
        id: string;
        metadata?: any;
    };
}
interface TriggerPreprocessContext {
    job: {
        id: string;
        version: string;
    };
    environment: {
        slug: string;
        id: string;
        type: RuntimeEnvironmentType;
    };
    organization: {
        slug: string;
        id: string;
        title: string;
    };
    run: {
        id: string;
        isTest: boolean;
    };
    event: {
        id: string;
        name: string;
        context: any;
        timestamp: Date;
    };
    account?: {
        id: string;
        metadata?: any;
    };
}
interface TaskLogger {
    debug(message: string, properties?: Record<string, any>): Promise<void>;
    info(message: string, properties?: Record<string, any>): Promise<void>;
    warn(message: string, properties?: Record<string, any>): Promise<void>;
    error(message: string, properties?: Record<string, any>): Promise<void>;
}
type PreprocessResults = {
    abort: boolean;
    properties: DisplayProperty[];
};
type TriggerEventType<TTrigger extends Trigger<any>> = TTrigger extends Trigger<infer TEventSpec> ? ReturnType<TEventSpec["parsePayload"]> : never;
type TriggerInvokeType<TTrigger extends Trigger<any>> = TTrigger extends Trigger<EventSpecification<any, infer TInvoke>> ? TInvoke : any;
type VerifyResult = {
    success: true;
} | {
    success: false;
    reason?: string;
};
interface Trigger<TEventSpec extends EventSpecification<any>> {
    event: TEventSpec;
    toJSON(): TriggerMetadata;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpec>, any>): void;
    preprocessRuns: boolean;
    verifyPayload: (payload: ReturnType<TEventSpec["parsePayload"]>) => Promise<VerifyResult>;
}
type TriggerPayload<TTrigger> = TTrigger extends Trigger<EventSpecification<infer TEvent>> ? TEvent : never;
declare const EventSpecificationExampleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    payload: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    icon?: string | undefined;
    payload?: any;
}, {
    id: string;
    name: string;
    icon?: string | undefined;
    payload?: any;
}>;
type EventSpecificationExample = z.infer<typeof EventSpecificationExampleSchema>;
type TypedEventSpecificationExample<TEvent> = {
    id: string;
    name: string;
    icon?: string;
    payload: TEvent;
};
interface EventSpecification<TEvent extends any, TInvoke extends any = TEvent> {
    name: string | string[];
    title: string;
    source: string;
    icon: string;
    properties?: DisplayProperty[];
    schema?: any;
    examples?: Array<EventSpecificationExample>;
    filter?: EventFilter;
    parsePayload: (payload: unknown) => TEvent;
    parseInvokePayload?: (payload: unknown) => TInvoke;
    runProperties?: (payload: TEvent) => DisplayProperty[];
}
type EventTypeFromSpecification<TEventSpec extends EventSpecification<any>> = TEventSpec extends EventSpecification<infer TEvent> ? TEvent : never;
type SchemaParserIssue = {
    path: PropertyKey[];
    message: string;
};
type SchemaParserResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: {
        issues: SchemaParserIssue[];
    };
};
type SchemaParser<T extends unknown = unknown> = {
    safeParse: (a: unknown) => SchemaParserResult<T>;
};
type WaitForEventResult<TEvent> = {
    id: string;
    name: string;
    source: string;
    payload: TEvent;
    timestamp: Date;
    context?: any;
    accountId?: string;
};
declare function waitForEventSchema(schema: z.ZodTypeAny): z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    source: z.ZodString;
    payload: z.ZodTypeAny;
    timestamp: z.ZodDate;
    context: z.ZodOptional<z.ZodAny>;
    accountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    timestamp: Date;
    source: string;
    payload?: any;
    context?: any;
    accountId?: string | undefined;
}, {
    id: string;
    name: string;
    timestamp: Date;
    source: string;
    payload?: any;
    context?: any;
    accountId?: string | undefined;
}>;
type NotificationEvents = {
    runSucceeeded: (notification: SuccessfulRunNotification<any>) => void;
    runFailed: (notification: FailedRunNotification) => void;
};
type NotificationsEventEmitter = TypedEventEmitter<NotificationEvents>;

type HttpEndpointOptions<TEventSpecification extends EventSpecification<any>> = {
    id: string;
    enabled?: boolean;
    event: TEventSpecification;
    respondWith?: RespondWith;
    verify: VerifyCallback;
};
type RequestOptions = {
    filter?: RequestFilter;
};
declare class HttpEndpoint<TEventSpecification extends EventSpecification<any>> {
    private readonly options;
    constructor(options: HttpEndpointOptions<TEventSpecification>);
    get id(): string;
    onRequest(options?: RequestOptions): HttpTrigger<EventSpecification<Request>>;
    toJSON(): HttpEndpointMetadata;
}
type TriggerOptions$1<TEventSpecification extends EventSpecification<any>> = {
    endpointId: string;
    event: TEventSpecification;
    filter?: EventFilter;
    verify: VerifyCallback;
};
declare class HttpTrigger<TEventSpecification extends EventSpecification<any>> implements Trigger<TEventSpecification> {
    private readonly options;
    constructor(options: TriggerOptions$1<TEventSpecification>);
    toJSON(): TriggerMetadata;
    get event(): TEventSpecification;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: Request): Promise<VerifyResult>;
}
type RespondWith = {
    /** Only Requests that match this filter will cause the `handler` function to run.
     * For example, you can use this to only respond to `GET` Requests. */
    filter?: RequestFilter;
    /** If you set this to `true`, the Request that comes in won't go on to Trigger any Runs.
     * This is useful if you want to Respond to the Request, but don't want to Trigger any Runs. */
    skipTriggeringRuns?: boolean;
    /** This is a function that's called when a Request comes in.
     * It's passed the Request object, and expects you to return a Response object. */
    handler: (request: Request, verify: () => Promise<VerifyResult>) => Promise<Response>;
};
type VerifyCallback = (request: Request) => Promise<VerifyResult>;
type EndpointOptions = {
    /** Used to uniquely identify the HTTP Endpoint inside your Project. */
    id: string;
    enabled?: boolean;
    /** Usually you would use the domain name of the service, e.g. `cal.com`. */
    source: string;
    /** An optional title, displayed in the dashboard. */
    title?: string;
    /** An optional icon name that's displayed in the dashboard.
     * Lots of company names are supported, e.g. `github`, `twilio`.
     * You can also reference the name of any [Tabler icon](https://tabler-icons.io/), e.g. `brand-google-maps`, `brand-twitch`. */
    icon?: string;
    /** Used to provide example payloads that are accepted by the job.
     * This will be available in the dashboard and can be used to trigger test runs. */
    examples?: EventSpecificationExample[];
    /** Properties that are displayed in the dashboard. */
    properties?: DisplayProperty[];
    /** This optional object allows you to immediately Respond to a Request. This is useful for some APIs where they do a `GET` Request when the webhook is first setup and expect a specific Response.
  
        Only use this if you really need to Respond to the Request that comes in. Most of the time you don't. */
    respondWith?: RespondWith;
    /** This is compulsory, and is used to verify that the received webhook is authentic.
     * It's a function that expects you to return a result object like:
      
    In 90% of cases, you'll want to use the `verifyRequestSignature` helper function we provide.
  
      @example
      ```ts
      //if it's valid
      return { success: true }
      //if it's invalid, reason is optional
      return { success: false, reason: "No header" }
      ```
  
     */
    verify: VerifyCallback;
};

declare class KeyValueStore {
    #private;
    private apiClient;
    private type;
    private namespace;
    constructor(apiClient: ApiClient, type?: string | null, namespace?: string);
    delete(cacheKey: string | any[], key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    get<T extends Json<T> = any>(cacheKey: string | any[], key: string): Promise<T | undefined>;
    get<T extends Json<T> = any>(key: string): Promise<T | undefined>;
    has(cacheKey: string | any[], key: string): Promise<boolean>;
    has(key: string): Promise<boolean>;
    set<T extends Json<T>>(cacheKey: string | any[], key: string, value: T): Promise<T>;
    set<T extends Json<T>>(key: string, value: T): Promise<T>;
}

type HttpSourceEvent = {
    url: string;
    method: string;
    headers: Record<string, string>;
    rawBody?: Buffer | null;
};
type SmtpSourceEvent = {
    from: string;
    to: string;
    subject: string;
    body: string;
};
type SqsSourceEvent = {
    body: string;
};
type ExternalSourceChannelMap = {
    HTTP: {
        event: Request;
        register: {
            url: string;
        };
    };
    SMTP: {
        event: SmtpSourceEvent;
        register: {};
    };
    SQS: {
        event: SqsSourceEvent;
        register: {};
    };
};
type ChannelNames = keyof ExternalSourceChannelMap;
type TriggerOptionDiff = {
    desired: string[];
    missing: string[];
    orphaned: string[];
};
type TriggerOptionDiffs<TTriggerOptionDefinitions extends Record<string, string[]> = any> = TriggerOptionsRecordWithEvent<TriggerOptionDiff, TTriggerOptionDefinitions>;
type TriggerOptionsRecordWithEvent<TValue, TTriggerOptionDefinitions extends Record<string, string[]>> = {
    event: TValue;
} & TriggerOptionRecord<TValue, TTriggerOptionDefinitions>;
type TriggerOptionRecord<TValue, TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    [K in keyof TTriggerOptionDefinitions]: TValue;
};
type RegisterFunctionEvent$1<TChannel extends ChannelNames, TParams extends any, TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    options: TriggerOptionDiffs<TTriggerOptionDefinitions>;
    source: {
        active: boolean;
        data?: any;
        secret: string;
    } & ExternalSourceChannelMap[TChannel]["register"];
    params: TParams;
};
type RegisterSourceEvent<TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    id: string;
    source: RegisterTriggerSource;
    dynamicTriggerId?: string;
    options: TriggerOptionDiffs<TTriggerOptionDefinitions>;
};
type RegisterFunctionOutput$1<TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    secret?: string;
    data?: SerializableJson;
    options: TriggerOptionsRecordWithEvent<string[], TTriggerOptionDefinitions>;
};
type RegisterFunction$1<TIntegration extends TriggerIntegration, TParams extends any, TChannel extends ChannelNames, TTriggerOptionDefinitions extends Record<string, string[]> = any> = (event: RegisterFunctionEvent$1<TChannel, TParams, TTriggerOptionDefinitions>, io: IOWithIntegrations<{
    integration: TIntegration;
}>, ctx: TriggerContext) => Promise<RegisterFunctionOutput$1<TTriggerOptionDefinitions> | undefined>;
type HandlerEvent<TChannel extends ChannelNames, TParams extends any = any> = {
    rawEvent: ExternalSourceChannelMap[TChannel]["event"];
    source: Prettify<Omit<HandleTriggerSource, "params"> & {
        params: TParams;
    }>;
};
type HandlerFunction<TChannel extends ChannelNames, TParams extends any, TTriggerIntegration extends TriggerIntegration> = (event: HandlerEvent<TChannel, TParams>, logger: Logger, integration: TTriggerIntegration, auth?: ConnectionAuth) => Promise<{
    events: SendEvent[];
    response?: NormalizedResponse;
    metadata?: HttpSourceResponseMetadata;
} | void>;
type KeyFunction$1<TParams extends any> = (params: TParams) => string;
type FilterFunction$1<TParams extends any, TTriggerOptionDefinitions extends Record<string, string[]> = any> = (params: TParams, options?: TTriggerOptionDefinitions) => EventFilter;
type ExternalSourceOptions<TChannel extends ChannelNames, TIntegration extends TriggerIntegration, TParams extends any, TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    id: string;
    version: string;
    schema: SchemaParser<TParams>;
    optionSchema?: SchemaParser<TTriggerOptionDefinitions>;
    integration: TIntegration;
    register: RegisterFunction$1<TIntegration, TParams, TChannel, TTriggerOptionDefinitions>;
    filter?: FilterFunction$1<TParams, TTriggerOptionDefinitions>;
    handler: HandlerFunction<TChannel, TParams, TIntegration>;
    key: KeyFunction$1<TParams>;
    properties?: (params: TParams) => DisplayProperty[];
};
declare class ExternalSource<TIntegration extends TriggerIntegration, TParams extends any, TChannel extends ChannelNames = ChannelNames, TTriggerOptionDefinitions extends Record<string, string[]> = any> {
    private options;
    channel: TChannel;
    constructor(channel: TChannel, options: ExternalSourceOptions<TChannel, TIntegration, TParams, TTriggerOptionDefinitions>);
    handle(source: HandleTriggerSource, rawEvent: ExternalSourceChannelMap[TChannel]["event"], logger: Logger): Promise<void | {
        events: {
            name: string;
            payload?: any;
            context?: any;
            id?: string | undefined;
            timestamp?: Date | undefined;
            source?: string | undefined;
            payloadType?: "JSON" | "REQUEST" | undefined;
        }[];
        response?: {
            status: number;
            body?: any;
            headers?: Record<string, string> | undefined;
        } | undefined;
        metadata?: _trigger_dev_core.DeserializedJson | undefined;
    }>;
    filter(params: TParams, options?: TTriggerOptionDefinitions): EventFilter;
    properties(params: TParams): DisplayProperty[];
    register(params: TParams, registerEvent: RegisterSourceEvent<TTriggerOptionDefinitions>, io: IO, ctx: TriggerContext): Promise<RegisterFunctionOutput$1<TTriggerOptionDefinitions> | undefined>;
    key(params: TParams): string;
    get integration(): TIntegration;
    get integrationConfig(): {
        id: string;
        metadata: {
            id: string;
            name: string;
            instructions?: string | undefined;
        };
    };
    get id(): string;
    get version(): string;
}
type ExternalSourceParams<TExternalSource extends ExternalSource<any, any, any>> = TExternalSource extends ExternalSource<any, infer TParams, any> ? TParams : never;
type ExternalSourceTriggerOptions<TEventSpecification extends EventSpecification<any>, TEventSource extends ExternalSource<any, any, any>, TTriggerOptionDefinitions extends Record<string, string[]> = any> = {
    event: TEventSpecification;
    source: TEventSource;
    params: ExternalSourceParams<TEventSource>;
    options: TriggerOptionRecord<string[], TTriggerOptionDefinitions>;
};
declare class ExternalSourceTrigger<TEventSpecification extends EventSpecification<any>, TEventSource extends ExternalSource<any, any, any>> implements Trigger<TEventSpecification> {
    private options;
    constructor(options: ExternalSourceTriggerOptions<TEventSpecification, TEventSource>);
    get event(): TEventSpecification;
    toJSON(): TriggerMetadata;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<TEventSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
}
declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, key: K): {
    result: Omit<T, K>;
    ommited: T[K];
};

/** Options for a DynamicTrigger  */
type DynamicTriggerOptions<TEventSpec extends EventSpecification<any>, TExternalSource extends ExternalSource<any, any, any>> = {
    /** Used to uniquely identify a DynamicTrigger */
    id: string;
    /** An event from an [Integration](https://trigger.dev/docs/integrations) package that you want to attach to the DynamicTrigger. The event types will come through to the payload in your Job's run. */
    event: TEventSpec;
    /** An external source fron an [Integration](https://trigger.dev/docs/integrations) package
     * @example
     * ```ts
     *  import { events } from "@trigger.dev/github";
     *
     *  const dynamicOnIssueOpened = client.defineDynamicTrigger({
          id: "github-issue-opened",
          event: events.onIssueOpened,
          source: github.sources.repo,
        });
     * ```
      */
    source: TExternalSource;
};
/** `DynamicTrigger` allows you to define a trigger that can be configured dynamically at runtime. */
declare class DynamicTrigger<TEventSpec extends EventSpecification<any>, TExternalSource extends ExternalSource<any, any, any>> implements Trigger<TEventSpec> {
    #private;
    source: TExternalSource;
    /** `DynamicTrigger` allows you to define a trigger that can be configured dynamically at runtime.
     * @param client The `TriggerClient` instance to use for registering the trigger.
     * @param options The options for the dynamic trigger.
     * */
    constructor(client: TriggerClient, options: DynamicTriggerOptions<TEventSpec, TExternalSource>);
    toJSON(): TriggerMetadata;
    get id(): string;
    get event(): TEventSpec;
    /** Use this method to register a new configuration with the DynamicTrigger.
     * @param key The key for the configuration. This will be used to identify the configuration when it is triggered.
     * @param params The params for the configuration.
     * @param options Options for the configuration.
     * @param options.accountId The accountId to associate with the configuration.
     * @param options.filter The filter to use for the configuration.
     *
     */
    register(key: string, params: ExternalSourceParams<TExternalSource>, options?: {
        accountId?: string;
        filter?: EventFilter;
    }): Promise<RegisterSourceEventV2>;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpec>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<TEventSpec["parsePayload"]>): Promise<{
        success: true;
    }>;
}

type ScheduledEventSpecification = EventSpecification<ScheduledPayload>;
declare class IntervalTrigger implements Trigger<ScheduledEventSpecification> {
    private options;
    constructor(options: IntervalOptions);
    get event(): {
        name: string;
        title: string;
        source: string;
        icon: string;
        examples: {
            id: string;
            name: string;
            icon: string;
            payload: {
                ts: string;
                lastTimestamp: string;
            };
        }[];
        parsePayload: (data: unknown, params?: Partial<zod.ParseParams> | undefined) => {
            ts: Date;
            lastTimestamp?: Date | undefined;
        };
        properties: {
            label: string;
            text: string;
        }[];
    };
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<ScheduledEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<ScheduledEventSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
    toJSON(): TriggerMetadata;
}
/** `intervalTrigger()` is set as a [Job's trigger](/sdk/job) to trigger a Job at a recurring interval.
 * @param options An object containing options about the interval.
 */
declare function intervalTrigger(options: IntervalOptions): IntervalTrigger;
declare class CronTrigger implements Trigger<ScheduledEventSpecification> {
    private options;
    constructor(options: CronOptions);
    get event(): {
        name: string;
        title: string;
        source: string;
        icon: string;
        examples: {
            id: string;
            name: string;
            icon: string;
            payload: {
                ts: string;
                lastTimestamp: string;
            };
        }[];
        parsePayload: (data: unknown, params?: Partial<zod.ParseParams> | undefined) => {
            ts: Date;
            lastTimestamp?: Date | undefined;
        };
        properties: {
            label: string;
            text: string;
        }[];
    };
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<ScheduledEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<ScheduledEventSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
    toJSON(): TriggerMetadata;
}
/** `cronTrigger()` is set as a [Job's trigger](https://trigger.dev/docs/sdk/job) to trigger a Job on a recurring schedule using a CRON expression.
 * @param options An object containing options about the CRON schedule.
 */
declare function cronTrigger(options: CronOptions): CronTrigger;
/** DynamicSchedule options
 * @param id Used to uniquely identify a DynamicSchedule
 */
type DynamicIntervalOptions = {
    id: string;
};
/** DynamicSchedule` allows you to define a scheduled trigger that can be configured dynamically at runtime. */
declare class DynamicSchedule implements Trigger<ScheduledEventSpecification> {
    private client;
    private options;
    /**
     * @param client The `TriggerClient` instance to use for registering the trigger.
     * @param options The options for the schedule.
     */
    constructor(client: TriggerClient, options: DynamicIntervalOptions);
    get id(): string;
    get event(): {
        name: string;
        title: string;
        source: string;
        icon: string;
        examples: {
            id: string;
            name: string;
            icon: string;
            payload: {
                ts: string;
                lastTimestamp: string;
            };
        }[];
        parsePayload: (data: unknown, params?: Partial<zod.ParseParams> | undefined) => {
            ts: Date;
            lastTimestamp?: Date | undefined;
        };
    };
    register(key: string, metadata: ScheduleMetadata): Promise<{
        id: string;
        schedule: {
            options: {
                cron: string;
            };
            type: "cron";
            accountId?: string | undefined;
            metadata?: any;
        } | {
            options: {
                seconds: number;
            };
            type: "interval";
            accountId?: string | undefined;
            metadata?: any;
        };
        active: boolean;
        metadata?: any;
    }>;
    unregister(key: string): Promise<{
        ok: boolean;
    }>;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<ScheduledEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<ScheduledEventSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
    toJSON(): TriggerMetadata;
}

type WebhookCRUDContext<TParams extends any, TConfig extends Record<string, string[]>> = {
    active: boolean;
    params: TParams;
    config: {
        current: Partial<TConfig>;
        desired: TConfig;
    };
    url: string;
    secret: string;
};
type WebhookCRUDFunction<TIntegration extends TriggerIntegration, TParams extends any, TConfig extends Record<string, string[]>> = (options: {
    io: IOWithIntegrations<{
        integration: TIntegration;
    }>;
    ctx: WebhookCRUDContext<TParams, TConfig>;
}) => Promise<any>;
interface WebhookCRUD<TIntegration extends TriggerIntegration, TParams extends any, TConfig extends Record<string, string[]>> {
    create: WebhookCRUDFunction<TIntegration, TParams, TConfig>;
    read?: WebhookCRUDFunction<TIntegration, TParams, TConfig>;
    update?: WebhookCRUDFunction<TIntegration, TParams, TConfig>;
    delete: WebhookCRUDFunction<TIntegration, TParams, TConfig>;
}
type WebhookConfig<TConfigKeys extends string> = {
    [K in TConfigKeys]: string[];
};
type RegisterFunctionEvent<TParams extends any, TConfig extends Record<string, string[]>> = {
    source: {
        active: boolean;
        data?: any;
        secret: string;
        url: string;
    };
    params: TParams;
    config: TConfig;
};
type WebhookRegisterEvent<TConfig extends Record<string, string[]>> = {
    id: string;
    source: RegisterWebhookSource;
    dynamicTriggerId?: string;
    config: TConfig;
};
type RegisterFunctionOutput<TConfig extends Record<string, string[]>> = {
    secret?: string;
    data?: SerializableJson;
    config: TConfig;
};
type RegisterFunction<TIntegration extends TriggerIntegration, TParams extends any, TConfig extends Record<string, string[]>> = (event: RegisterFunctionEvent<TParams, TConfig>, io: IOWithIntegrations<{
    integration: TIntegration;
}>, ctx: TriggerContext) => Promise<RegisterFunctionOutput<TConfig> | undefined>;
type WebhookHandlerEvent<TParams extends any = any> = {
    rawEvent: Request;
    source: Prettify<Omit<HandleTriggerSource, "params"> & {
        params: TParams;
    }>;
};
type WebhookDeliveryContext = {
    key: string;
    secret: string;
    params: any;
};
type EventGenerator<TParams extends any, TConfig extends Record<string, string[]>, TIntegration extends TriggerIntegration> = (options: {
    request: Request;
    client: TriggerClient;
    ctx: WebhookDeliveryContext;
}) => Promise<any>;
type KeyFunction<TParams extends any> = (params: TParams) => string;
type FilterFunction<TParams extends any, TConfig extends Record<string, string[]>> = (params: TParams, config?: TConfig) => EventFilter;
type WebhookOptions<TIntegration extends TriggerIntegration, TParams extends any, TConfig extends Record<string, string[]>> = {
    id: string;
    version: string;
    integration: TIntegration;
    schemas: {
        params: SchemaParser<TParams>;
        config?: SchemaParser<TConfig>;
    };
    key: KeyFunction<TParams>;
    crud: WebhookCRUD<TIntegration, TParams, TConfig>;
    filter?: FilterFunction<TParams, TConfig>;
    register?: RegisterFunction<TIntegration, TParams, TConfig>;
    verify?: (options: {
        request: Request;
        client: TriggerClient;
        ctx: WebhookDeliveryContext;
    }) => Promise<VerifyResult>;
    generateEvents: EventGenerator<TParams, TConfig, TIntegration>;
    properties?: (params: TParams) => DisplayProperty[];
};
declare class WebhookSource<TIntegration extends TriggerIntegration, TParams extends any = any, TConfig extends Record<string, string[]> = Record<string, string[]>> {
    #private;
    private options;
    constructor(options: WebhookOptions<TIntegration, TParams, TConfig>);
    generateEvents(request: Request, client: TriggerClient, ctx: WebhookDeliveryContext): Promise<any>;
    filter(params: TParams, config?: TConfig): EventFilter;
    properties(params: TParams): DisplayProperty[];
    get crud(): WebhookCRUD<TIntegration, TParams, TConfig>;
    register(params: TParams, registerEvent: WebhookRegisterEvent<TConfig>, io: IO, ctx: TriggerContext): Promise<RegisterFunctionOutput<TConfig> | undefined>;
    verify(request: Request, client: TriggerClient, ctx: WebhookDeliveryContext): Promise<VerifyResult>;
    key(params: TParams): string;
    get integration(): TIntegration;
    get integrationConfig(): {
        id: string;
        metadata: {
            id: string;
            name: string;
            instructions?: string | undefined;
        };
    };
    get id(): string;
    get version(): string;
}
type GetWebhookParams<TWebhook extends WebhookSource<any, any, any>> = TWebhook extends WebhookSource<any, infer TParams, any> ? TParams : never;
type GetWebhookConfig<TWebhook extends WebhookSource<any, any, any>> = TWebhook extends WebhookSource<any, any, infer TConfig> ? TConfig : never;
type WebhookTriggerOptions<TEventSpecification extends EventSpecification<any>, TEventSource extends WebhookSource<any, any, any>, TConfig extends Record<string, string[]> = Record<string, string[]>> = {
    event: TEventSpecification;
    source: TEventSource;
    params: GetWebhookParams<TEventSource>;
    config: TConfig;
};
declare class WebhookTrigger<TEventSpecification extends EventSpecification<any>, TEventSource extends WebhookSource<any, any, any>> implements Trigger<TEventSpecification> {
    private options;
    constructor(options: WebhookTriggerOptions<TEventSpecification, TEventSource>);
    get event(): TEventSpecification;
    get source(): TEventSource;
    get key(): string;
    toJSON(): TriggerMetadata;
    filter(eventFilter: EventFilter): WebhookTrigger<Omit<TEventSpecification, "filter"> & {
        filter: EventFilter;
    }, TEventSource>;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<TEventSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
}

type TriggerClientOptions = {
    /** The `id` property is used to uniquely identify the client.
     */
    id: string;
    /** The `apiKey` property is the API Key for your Trigger.dev environment. We
        recommend using an environment variable to store your API Key. */
    apiKey?: string;
    /** The `apiUrl` property is an optional property that specifies the API URL. You
        only need to specify this if you are not using Trigger.dev Cloud and are
        running your own Trigger.dev instance. */
    apiUrl?: string;
    /** The `logLevel` property is an optional property that specifies the level of
        logging for the TriggerClient. The level is inherited by all Jobs that use this Client, unless they also specify a `logLevel`. */
    logLevel?: LogLevel;
    /** Very verbose log messages, defaults to false. */
    verbose?: boolean;
    /** Default is unset and off. If set to true it will log to the server's console as well as the Trigger.dev platform */
    ioLogLocalEnabled?: boolean;
};
type AuthResolverResult = {
    type: "apiKey" | "oauth";
    token: string;
    additionalFields?: Record<string, string>;
};
type TriggerAuthResolver = (ctx: TriggerContext, integration: TriggerIntegration) => Promise<AuthResolverResult | void | undefined>;
/** A [TriggerClient](https://trigger.dev/docs/documentation/concepts/client-adaptors) is used to connect to a specific [Project](https://trigger.dev/docs/documentation/concepts/projects) by using an [API Key](https://trigger.dev/docs/documentation/concepts/environments-apikeys). */
declare class TriggerClient {
    #private;
    id: string;
    constructor(options: Prettify<TriggerClientOptions>);
    on: <E extends keyof NotificationEvents>(event: E, listener: NotificationEvents[E]) => NotificationsEventEmitter;
    handleRequest(request: Request, timeOrigin?: number): Promise<NormalizedResponse>;
    defineJob<TTrigger extends Trigger<EventSpecification<any>>, TIntegrations extends Record<string, TriggerIntegration> = {}, TOutput extends any = any>(options: JobOptions<TTrigger, TIntegrations, TOutput>): Job<TTrigger, TIntegrations, TOutput>;
    defineAuthResolver(integration: TriggerIntegration, resolver: TriggerAuthResolver): TriggerClient;
    defineDynamicSchedule(options: DynamicIntervalOptions): DynamicSchedule;
    defineDynamicTrigger<TEventSpec extends EventSpecification<any>, TExternalSource extends ExternalSource<any, any, any>>(options: DynamicTriggerOptions<TEventSpec, TExternalSource>): DynamicTrigger<TEventSpec, TExternalSource>;
    /**
     * An [HTTP endpoint](https://trigger.dev/docs/documentation/concepts/http-endpoints) allows you to create a [HTTP Trigger](https://trigger.dev/docs/documentation/concepts/triggers/http), which means you can trigger your Jobs from any webhooks.
     * @param options The Endpoint options
     * @returns An HTTP Endpoint, that can be used to create an HTTP Trigger.
     * @link https://trigger.dev/docs/documentation/concepts/http-endpoints
     */
    defineHttpEndpoint(options: EndpointOptions, suppressWarnings?: boolean): HttpEndpoint<EventSpecification<Request, Request>>;
    defineConcurrencyLimit(options: ConcurrencyLimitOptions): ConcurrencyLimit;
    attach(job: Job<Trigger<any>, any>): void;
    attachDynamicTrigger(trigger: DynamicTrigger<any, any>): void;
    attachJobToDynamicTrigger(job: Job<Trigger<any>, any>, trigger: DynamicTrigger<any, any>): void;
    attachSource(options: {
        key: string;
        source: ExternalSource<any, any>;
        event: EventSpecification<any>;
        params: any;
        options?: Record<string, string[]>;
    }): void;
    attachDynamicSchedule(key: string): void;
    attachDynamicScheduleToJob(key: string, job: Job<Trigger<any>, any>): void;
    attachWebhook<TIntegration extends TriggerIntegration, TParams extends any, TConfig extends Record<string, string[]>>(options: {
        key: string;
        source: WebhookSource<TIntegration, TParams, TConfig>;
        event: EventSpecification<any>;
        params: any;
        config: TConfig;
    }): void;
    registerTrigger(id: string, key: string, options: RegisterTriggerBodyV2, idempotencyKey?: string): Promise<{
        id: string;
        options: {
            event: {
                desired: string[];
                missing: string[];
                orphaned: string[];
            };
        } & Record<string, {
            desired: string[];
            missing: string[];
            orphaned: string[];
        }>;
        source: {
            key: string;
            secret: string;
            active: boolean;
            channel: {
                url: string;
                type: "HTTP";
            } | {
                type: "SMTP";
            } | {
                type: "SQS";
            };
            params?: any;
            data?: DeserializedJson | undefined;
            clientId?: string | undefined;
        };
        dynamicTriggerId?: string | undefined;
    }>;
    getAuth(id: string): Promise<{
        type: "oauth2" | "apiKey";
        accessToken: string;
        scopes?: string[] | undefined;
        additionalFields?: Record<string, string> | undefined;
    } | undefined>;
    /** You can call this function from anywhere in your backend to send an event. The other way to send an event is by using [`io.sendEvent()`](https://trigger.dev/docs/sdk/io/sendevent) from inside a `run()` function.
     * @param event The event to send.
     * @param options Options for sending the event.
     * @returns A promise that resolves to the event details
     */
    sendEvent(event: SendEvent, options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[]) & (string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    /** You can call this function from anywhere in your backend to send multiple events. The other way to send multiple events is by using [`io.sendEvents()`](https://trigger.dev/docs/sdk/io/sendevents) from inside a `run()` function.
     * @param events The events to send.
     * @param options Options for sending the events.
     * @returns A promise that resolves to an array of event details
     */
    sendEvents(events: SendEvent[], options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[]) & (string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }[]>;
    cancelEvent(eventId: string): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[]) & (string | number | boolean | {
            [key: string]: DeserializedJson;
        } | DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    cancelRunsForEvent(eventId: string): Promise<{
        cancelledRunIds: string[];
        failedToCancelRunIds: string[];
    }>;
    updateStatus(runId: string, id: string, status: StatusUpdate): Promise<{
        label: string;
        key: string;
        history: {
            label?: string | undefined;
            state?: "loading" | "success" | "failure" | undefined;
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        }[];
        data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
        state?: "loading" | "success" | "failure" | undefined;
    }>;
    registerSchedule(id: string, key: string, schedule: ScheduleMetadata): Promise<{
        id: string;
        schedule: {
            options: {
                cron: string;
            };
            type: "cron";
            accountId?: string | undefined;
            metadata?: any;
        } | {
            options: {
                seconds: number;
            };
            type: "interval";
            accountId?: string | undefined;
            metadata?: any;
        };
        active: boolean;
        metadata?: any;
    }>;
    unregisterSchedule(id: string, key: string): Promise<{
        ok: boolean;
    }>;
    getEvent(eventId: string): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        runs: {
            id: string;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            startedAt?: Date | null | undefined;
            completedAt?: Date | null | undefined;
        }[];
        createdAt: Date;
    }>;
    getRun(runId: string, options?: GetRunOptionsWithTaskDetails): Promise<{
        id: string;
        startedAt: Date | null;
        completedAt: Date | null;
        status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
        updatedAt: Date | null;
        tasks: _trigger_dev_core.RunTaskWithSubtasks[];
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        output?: any;
        nextCursor?: string | undefined;
    }>;
    cancelRun(runId: string): Promise<{
        id: string;
        startedAt: Date | null;
        completedAt: Date | null;
        status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
        updatedAt: Date | null;
        tasks: _trigger_dev_core.RunTaskWithSubtasks[];
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        output?: any;
        nextCursor?: string | undefined;
    }>;
    getRuns(jobSlug: string, options?: GetRunsOptions): Promise<{
        runs: {
            id: string;
            startedAt: Date | null;
            completedAt: Date | null;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            updatedAt: Date | null;
        }[];
        nextCursor?: string | undefined;
    }>;
    getRunStatuses(runId: string): Promise<{
        statuses: {
            label: string;
            key: string;
            history: {
                label?: string | undefined;
                state?: "loading" | "success" | "failure" | undefined;
                data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            }[];
            data?: Record<string, _trigger_dev_core.SerializableJson> | undefined;
            state?: "loading" | "success" | "failure" | undefined;
        }[];
        run: {
            id: string;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            output?: any;
        };
    }>;
    invokeJob(jobId: string, payload: any, options?: InvokeOptions): Promise<{
        id: string;
    }>;
    cancelRunsForJob(jobId: string): Promise<{
        cancelledRunIds: string[];
        failedToCancelRunIds: string[];
    }>;
    createEphemeralEventDispatcher(payload: EphemeralEventDispatcherRequestBody): Promise<{
        id: string;
    }>;
    get store(): {
        env: KeyValueStore;
    };
    authorized(apiKey?: string | null): "authorized" | "unauthorized" | "missing-client" | "missing-header";
    apiKey(): string | undefined;
}

type IOTask = ServerTask;
type IOOptions = {
    id: string;
    jobId: string;
    apiClient: ApiClient;
    client: TriggerClient;
    context: TriggerContext;
    timeOrigin: number;
    logger?: Logger;
    logLevel?: LogLevel;
    jobLogger?: Logger;
    jobLogLevel: LogLevel;
    cachedTasks?: Array<CachedTask>;
    cachedTasksCursor?: string;
    yieldedExecutions?: Array<string>;
    noopTasksSet?: string;
    serverVersion?: string | null;
    executionTimeout?: number;
};
type JsonPrimitive = string | number | boolean | null | undefined | Date | symbol;
type JsonArray = Json[];
type JsonRecord<T> = {
    [Property in keyof T]: Json;
};
type Json<T = any> = JsonPrimitive | JsonArray | JsonRecord<T>;
type RunTaskErrorCallback = (error: unknown, task: IOTask, io: IO) => {
    retryAt?: Date;
    error?: Error;
    jitter?: number;
    skipRetrying?: boolean;
} | Error | undefined | void;
type IOStats = {
    initialCachedTasks: number;
    lazyLoadedCachedTasks: number;
    executedTasks: number;
    cachedTaskHits: number;
    cachedTaskMisses: number;
    noopCachedTaskHits: number;
    noopCachedTaskMisses: number;
};
interface OutputSerializer {
    serialize(value: any): string;
    deserialize<T>(value: string): T;
}
declare class JSONOutputSerializer implements OutputSerializer {
    serialize(value: any): string;
    deserialize(value?: string): any;
}
type BackgroundFetchResponse<T> = {
    status: number;
    data: T;
    headers: Record<string, string>;
};
declare class IO {
    #private;
    private _id;
    private _jobId;
    private _apiClient;
    private _triggerClient;
    private _logger;
    private _jobLogger?;
    private _jobLogLevel;
    private _cachedTasks;
    private _taskStorage;
    private _cachedTasksCursor?;
    private _context;
    private _yieldedExecutions;
    private _noopTasksBloomFilter;
    private _stats;
    private _serverVersion;
    private _timeOrigin;
    private _executionTimeout?;
    private _outputSerializer;
    private _visitedCacheKeys;
    private _envStore;
    private _jobStore;
    private _runStore;
    get stats(): IOStats;
    constructor(options: IOOptions);
    /** Used to send log messages to the [Run log](https://trigger.dev/docs/documentation/guides/viewing-runs). */
    get logger(): IOLogger;
    /** `io.random()` is identical to `Math.random()` when called without options but ensures your random numbers are not regenerated on resume or retry. It will return a pseudo-random floating-point number between optional `min` (default: 0, inclusive) and `max` (default: 1, exclusive). Can optionally `round` to the nearest integer.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param min Sets the lower bound (inclusive). Can't be higher than `max`.
     * @param max Sets the upper bound (exclusive). Can't be lower than `min`.
     * @param round Controls rounding to the nearest integer. Any `max` integer will become inclusive when enabled. Rounding with floating-point bounds may cause unexpected skew and boundary inclusivity.
     */
    random(cacheKey: string | any[], { min, max, round, }?: {
        min?: number;
        max?: number;
        round?: boolean;
    }): Promise<number>;
    /** `io.wait()` waits for the specified amount of time before continuing the Job. Delays work even if you're on a serverless platform with timeouts, or if your server goes down. They utilize [resumability](https://trigger.dev/docs/documentation/concepts/resumability) to ensure that the Run can be resumed after the delay.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param seconds The number of seconds to wait. This can be very long, serverless timeouts are not an issue.
     */
    wait(cacheKey: string | any[], seconds: number): Promise<void>;
    waitForEvent<T extends z.ZodTypeAny = z.ZodTypeAny>(cacheKey: string | any[], event: {
        name: string;
        schema?: T;
        filter?: EventFilter;
        source?: string;
        contextFilter?: EventFilter;
        accountId?: string;
    }, options?: {
        timeoutInSeconds?: number;
    }): Promise<WaitForEventResult<z.output<T>>>;
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
    waitForRequest<T extends Json<T> | unknown = unknown>(cacheKey: string | any[], callback: (url: string) => Promise<unknown>, options?: {
        timeoutInSeconds?: number;
    }): Promise<T>;
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
    createStatus(cacheKey: IntegrationTaskKey, initialStatus: InitialStatusUpdate): Promise<TriggerStatus>;
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
    backgroundFetch<TResponseData>(cacheKey: string | any[], url: string, requestInit?: FetchRequestInit, options?: {
        retry?: FetchRetryOptions;
        timeout?: FetchTimeoutOptions;
    }): Promise<TResponseData>;
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
    backgroundPoll<TResponseData>(cacheKey: string | any[], params: FetchPollOperation): Promise<TResponseData>;
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
    backgroundFetchResponse<TResponseData>(cacheKey: string | any[], url: string, requestInit?: FetchRequestInit, options?: {
        retry?: FetchRetryOptions;
        timeout?: FetchTimeoutOptions;
    }): Promise<BackgroundFetchResponse<TResponseData>>;
    /** `io.sendEvent()` allows you to send an event from inside a Job run. The sent event will trigger any Jobs that are listening for that event (based on the name).
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param event The event to send. The event name must match the name of the event that your Jobs are listening for.
     * @param options Options for sending the event.
     */
    sendEvent(cacheKey: string | any[], event: SendEvent, options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    /** `io.sendEvents()` allows you to send multiple events from inside a Job run. The sent events will trigger any Jobs that are listening for those events (based on the name).
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param event The events to send. The event names must match the names of the events that your Jobs are listening for.
     * @param options Options for sending the events.
     */
    sendEvents(cacheKey: string | any[], events: SendEvent[], options?: SendEventOptions): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }[]>;
    getEvent(cacheKey: string | any[], id: string): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        runs: {
            id: string;
            status: "PENDING" | "CANCELED" | "QUEUED" | "WAITING_ON_CONNECTIONS" | "PREPROCESSING" | "STARTED" | "SUCCESS" | "FAILURE" | "TIMED_OUT" | "ABORTED" | "UNRESOLVED_AUTH" | "INVALID_PAYLOAD" | "EXECUTING" | "WAITING_TO_CONTINUE" | "WAITING_TO_EXECUTE";
            startedAt?: Date | null | undefined;
            completedAt?: Date | null | undefined;
        }[];
        createdAt: Date;
    }>;
    /** `io.cancelEvent()` allows you to cancel an event that was previously sent with `io.sendEvent()`. This will prevent any Jobs from running that are listening for that event if the event was sent with a delay
     * @param cacheKey
     * @param eventId
     * @returns
     */
    cancelEvent(cacheKey: string | any[], eventId: string): Promise<{
        id: string;
        name: string;
        payload: ((string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[]) & (string | number | boolean | {
            [key: string]: _trigger_dev_core.DeserializedJson;
        } | _trigger_dev_core.DeserializedJson[] | undefined)) | null;
        timestamp: Date;
        context?: _trigger_dev_core.DeserializedJson | undefined;
        deliverAt?: Date | null | undefined;
        deliveredAt?: Date | null | undefined;
        cancelledAt?: Date | null | undefined;
    }>;
    updateSource(cacheKey: string | any[], options: {
        key: string;
    } & UpdateTriggerSourceBodyV2): Promise<{
        id: string;
        key: string;
    }>;
    updateWebhook(cacheKey: string | any[], options: {
        key: string;
    } & UpdateWebhookBody): Promise<{
        id: string;
        key: string;
    }>;
    /** `io.registerInterval()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular interval.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
     * @param id A unique id for the interval. This is used to identify and unregister the interval later.
     * @param options The options for the interval.
     * @returns A promise that has information about the interval.
     * @deprecated Use `DynamicSchedule.register` instead.
     */
    registerInterval(cacheKey: string | any[], dynamicSchedule: DynamicSchedule, id: string, options: IntervalOptions): Promise<{
        id: string;
        schedule: {
            options: {
                cron: string;
            };
            type: "cron";
            accountId?: string | undefined;
            metadata?: any;
        } | {
            options: {
                seconds: number;
            };
            type: "interval";
            accountId?: string | undefined;
            metadata?: any;
        };
        active: boolean;
        metadata?: any;
    }>;
    /** `io.unregisterInterval()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerInterval()`.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
     * @param id A unique id for the interval. This is used to identify and unregister the interval later.
     * @deprecated Use `DynamicSchedule.unregister` instead.
     */
    unregisterInterval(cacheKey: string | any[], dynamicSchedule: DynamicSchedule, id: string): Promise<{
        ok: boolean;
    }>;
    /** `io.registerCron()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular CRON schedule.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
     * @param id A unique id for the schedule. This is used to identify and unregister the schedule later.
     * @param options The options for the CRON schedule.
     * @deprecated Use `DynamicSchedule.register` instead.
     */
    registerCron(cacheKey: string | any[], dynamicSchedule: DynamicSchedule, id: string, options: CronOptions): Promise<{
        id: string;
        schedule: {
            options: {
                cron: string;
            };
            type: "cron";
            accountId?: string | undefined;
            metadata?: any;
        } | {
            options: {
                seconds: number;
            };
            type: "interval";
            accountId?: string | undefined;
            metadata?: any;
        };
        active: boolean;
        metadata?: any;
    }>;
    /** `io.unregisterCron()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerCron()`.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
     * @param id A unique id for the interval. This is used to identify and unregister the interval later.
     * @deprecated Use `DynamicSchedule.unregister` instead.
     */
    unregisterCron(cacheKey: string | any[], dynamicSchedule: DynamicSchedule, id: string): Promise<{
        ok: boolean;
    }>;
    /** `io.registerTrigger()` allows you to register a [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) with the specified trigger params.
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param trigger The [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) to register.
     * @param id A unique id for the trigger. This is used to identify and unregister the trigger later.
     * @param params The params for the trigger.
     * @deprecated Use `DynamicTrigger.register` instead.
     */
    registerTrigger<TTrigger extends DynamicTrigger<EventSpecification<any>, ExternalSource<any, any, any>>>(cacheKey: string | any[], trigger: TTrigger, id: string, params: ExternalSourceParams<TTrigger["source"]>): Promise<{
        id: string;
        key: string;
    } | undefined>;
    getAuth(cacheKey: string | any[], clientId?: string): Promise<ConnectionAuth | undefined>;
    parallel<T extends Json<T> | void, TItem>(cacheKey: string | any[], items: Array<TItem>, callback: (item: TItem, index: number) => Promise<T>, options?: Pick<RunTaskOptions, "name" | "properties">): Promise<Array<T>>;
    /** `io.runTask()` allows you to run a [Task](https://trigger.dev/docs/documentation/concepts/tasks) from inside a Job run. A Task is a resumable unit of a Run that can be retried, resumed and is logged. [Integrations](https://trigger.dev/docs/integrations) use Tasks internally to perform their actions.
     *
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param callback The callback that will be called when the Task is run. The callback receives the Task and the IO as parameters.
     * @param options The options of how you'd like to run and log the Task.
     * @param onError The callback that will be called when the Task fails. The callback receives the error, the Task and the IO as parameters. If you wish to retry then return an object with a `retryAt` property.
     * @returns A Promise that resolves with the returned value of the callback.
     */
    runTask<T extends Json<T> | void>(cacheKey: string | any[], callback: (task: ServerTask, io: IO) => Promise<T>, options?: RunTaskOptions & {
        parseOutput?: (output: unknown) => T;
    }, onError?: RunTaskErrorCallback): Promise<T>;
    /**
     * `io.yield()` allows you to yield execution of the current run and resume it in a new function execution. Similar to `io.wait()` but does not create a task and resumes execution immediately.
     */
    yield(cacheKey: string): void;
    /**
     * `io.brb()` is an alias of `io.yield()`
     */
    brb: (cacheKey: string) => void;
    /** `io.try()` allows you to run Tasks and catch any errors that are thrown, it's similar to a normal `try/catch` block but works with [io.runTask()](https://trigger.dev/docs/sdk/io/runtask).
     * A regular `try/catch` block on its own won't work as expected with Tasks. Internally `runTask()` throws some special errors to control flow execution. This is necessary to deal with resumability, serverless timeouts, and retrying Tasks.
     * @param tryCallback The code you wish to run
     * @param catchCallback Thhis will be called if the Task fails. The callback receives the error
     * @returns A Promise that resolves with the returned value or the error
     */
    try<TResult, TCatchResult>(tryCallback: () => Promise<TResult>, catchCallback: (error: unknown) => Promise<TCatchResult>): Promise<TResult | TCatchResult>;
    get store(): {
        env: KeyValueStore;
        job: KeyValueStore;
        run: KeyValueStore;
    };
}
type CallbackFunction = (level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "LOG", message: string, properties?: Record<string, any>) => Promise<void>;
declare class IOLogger implements TaskLogger {
    private callback;
    constructor(callback: CallbackFunction);
    /** Log: essential messages */
    log(message: string, properties?: Record<string, any>): Promise<void>;
    /** For debugging: the least important log level */
    debug(message: string, properties?: Record<string, any>): Promise<void>;
    /** Info: the second least important log level */
    info(message: string, properties?: Record<string, any>): Promise<void>;
    /** Warnings: the third most important log level  */
    warn(message: string, properties?: Record<string, any>): Promise<void>;
    /** Error: The second most important log level */
    error(message: string, properties?: Record<string, any>): Promise<void>;
}

interface TriggerIntegration {
    id: string;
    metadata: IntegrationMetadata;
    authSource: "LOCAL" | "HOSTED";
    cloneForRun: (io: IO, connectionKey: string, auth?: ConnectionAuth) => TriggerIntegration;
}
type IOWithIntegrations<TIntegrations extends Record<string, TriggerIntegration>> = IO & TIntegrations;
type IntegrationTaskKey = string | any[];

type JobOptions<TTrigger extends Trigger<EventSpecification<any>>, TIntegrations extends Record<string, TriggerIntegration> = {}, TOutput extends any = any> = {
    /** The `id` property is used to uniquely identify the Job. Only change this if you want to create a new Job. */
    id: string;
    /** The `name` of the Job that you want to appear in the dashboard and logs. You can change this without creating a new Job. */
    name: string;
    /** The `version` property is used to version your Job. A new version will be created if you change this property. We recommend using [semantic versioning](https://www.baeldung.com/cs/semantic-versioning), e.g. `1.0.3`. */
    version: string;
    /** The `trigger` property is used to define when the Job should run. There are currently the following Trigger types:
        - [cronTrigger](https://trigger.dev/docs/sdk/crontrigger)
        - [intervalTrigger](https://trigger.dev/docs/sdk/intervaltrigger)
        - [eventTrigger](https://trigger.dev/docs/sdk/eventtrigger)
        - [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger)
        - [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule)
        - integration Triggers, like webhooks. See the [integrations](https://trigger.dev/docs/integrations) page for more information. */
    trigger: TTrigger;
    /** The `logLevel` property is an optional property that specifies the level of
        logging for the Job. The level is inherited from the client if you omit this property. */
    logLevel?: LogLevel;
    /** Imports the specified integrations into the Job. The integrations will be available on the `io` object in the `run()` function with the same name as the key. For example:
        ```ts
        client.defineJob({
          //... other options
          integrations: {
            slack,
            gh: github,
          },
          run: async (payload, io, ctx) => {
            //slack is available on io.slack
            io.slack.postMessage(...);
            //github is available on io.gh
            io.gh.addIssueLabels(...);
          }
        });
        ``` */
    integrations?: TIntegrations;
    /**
     * The `concurrencyLimit` property is used to limit the number of concurrent run executions of a job.
     * Can be a number which represents the limit or a `ConcurrencyLimit` instance which can be used to
     * group together multiple jobs to share the same concurrency limit.
     *
     * If undefined the job will be limited only by the server's global concurrency limit, or if you are using the
     * Trigger.dev Cloud service, the concurrency limit of your plan.
     */
    concurrencyLimit?: number | ConcurrencyLimit;
    /** The `enabled` property is used to enable or disable the Job. If you disable a Job, it will not run. */
    enabled?: boolean;
    /** This function gets called automatically when a Run is Triggered.
     * This is where you put the code you want to run for a Job. You can use normal code in here and you can also use Tasks. You can return a value from this function and it will be sent back to the Trigger API.
     * @param payload The payload of the event
     * @param io An object that contains the integrations that you specified in the `integrations` property and other useful functions like delays and running Tasks.
     * @param context An object that contains information about the Organization, Job, Run and more.
     */
    run: (payload: TriggerEventType<TTrigger>, io: IOWithIntegrations<TIntegrations>, context: TriggerContext) => Promise<TOutput>;
    onSuccess?: (notification: SuccessfulRunNotification<TOutput, TriggerEventType<TTrigger>>) => void;
    onFailure?: (notification: FailedRunNotification<TriggerEventType<TTrigger>>) => void;
};
type JobPayload<TJob> = TJob extends Job<Trigger<EventSpecification<infer TEvent>>, any> ? TEvent : never;
type JobIO<TJob> = TJob extends Job<any, infer TIntegrations> ? IOWithIntegrations<TIntegrations> : never;
/** A [Job](https://trigger.dev/docs/documentation/concepts/jobs) is used to define the [Trigger](https://trigger.dev/docs/documentation/concepts/triggers), metadata, and what happens when it runs. */
declare class Job<TTrigger extends Trigger<EventSpecification<any>>, TIntegrations extends Record<string, TriggerIntegration> = {}, TOutput extends any = any> {
    #private;
    readonly options: JobOptions<TTrigger, TIntegrations, TOutput>;
    client?: TriggerClient;
    constructor(options: JobOptions<TTrigger, TIntegrations, TOutput>);
    /**
     * Attaches the job to a client. This is called automatically when you define a job using `client.defineJob()`.
     */
    attachToClient(client: TriggerClient): this;
    get id(): string;
    get enabled(): boolean;
    get name(): string;
    get trigger(): TTrigger;
    get version(): string;
    get logLevel(): LogLevel | undefined;
    get integrations(): Record<string, IntegrationConfig>;
    toJSON(): JobMetadata;
    invoke(cacheKey: string, payload: TriggerInvokeType<TTrigger>, options?: InvokeOptions): Promise<{
        id: string;
    }>;
    invoke(payload: TriggerInvokeType<TTrigger>, options?: InvokeOptions): Promise<{
        id: string;
    }>;
    invokeAndWaitForCompletion(cacheKey: string | string[], payload: TriggerInvokeType<TTrigger>, timeoutInSeconds?: number, // 1 hour
    options?: Prettify<Pick<InvokeOptions, "accountId" | "context">>): Promise<RunNotification<TOutput>>;
    batchInvokeAndWaitForCompletion(cacheKey: string | string[], batch: Array<{
        payload: TriggerInvokeType<TTrigger>;
        timeoutInSeconds?: number;
        options?: Prettify<Pick<InvokeOptions, "accountId" | "context">>;
    }>): Promise<Array<RunNotification<TOutput>>>;
}

type EventTriggerOptions<TEventSpecification extends EventSpecification<any>> = {
    event: TEventSpecification;
    name?: string | string[];
    source?: string;
    filter?: EventFilter;
    verify?: EventTypeFromSpecification<TEventSpecification> extends Request ? VerifyCallback : never;
};
declare class EventTrigger<TEventSpecification extends EventSpecification<any>> implements Trigger<TEventSpecification> {
    #private;
    constructor(options: EventTriggerOptions<TEventSpecification>);
    toJSON(): TriggerMetadata;
    get event(): TEventSpecification;
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<TEventSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<TEventSpecification["parsePayload"]>): Promise<VerifyResult>;
}
/** Configuration options for an EventTrigger */
type TriggerOptions<TEvent> = {
    /** The name of the event you are subscribing to. Must be an exact match (case sensitive). To trigger on multiple possible events, pass in an array of event names */
    name: string | string[];
    /** A [Zod](https://trigger.dev/docs/documentation/guides/zod) schema that defines the shape of the event payload.
     * The default is `z.any()` which is `any`.
     * */
    schema?: SchemaParser<TEvent>;
    /** You can use this to filter events based on the source. */
    source?: string;
    /** Used to filter which events trigger the Job
     * @example
     * filter:
     * ```ts
     * {
     *    name: ["John", "Jane"],
     *    age: [18, 21]
     * }
     * ```
     *
     * This filter would match against an event with the following data:
     * ```json
     * {
     *    "name": "Jane",
     *    "age": 18,
     *    "location": "San Francisco"
     * }
     * ```
     */
    filter?: EventFilter;
    examples?: EventSpecificationExample[];
};
/** `eventTrigger()` is set as a [Job's trigger](https://trigger.dev/docs/sdk/job) to subscribe to an event a Job from [a sent event](https://trigger.dev/docs/sdk/triggerclient/instancemethods/sendevent)
 * @param options options for the EventTrigger
 */
declare function eventTrigger<TEvent extends any = any>(options: TriggerOptions<TEvent>): Trigger<EventSpecification<TEvent>>;

declare function missingConnectionNotification(integrations: Array<TriggerIntegration>): MissingConnectionNotification;
declare function missingConnectionResolvedNotification(integrations: Array<TriggerIntegration>): MissingConnectionResolvedNotification;
type MissingConnectionNotificationSpecification = EventSpecification<MissingConnectionNotificationPayload>;
type MissingConnectionNotificationOptions = {
    integrations: Array<TriggerIntegration>;
};
declare class MissingConnectionNotification implements Trigger<MissingConnectionNotificationSpecification> {
    private options;
    constructor(options: MissingConnectionNotificationOptions);
    get event(): {
        name: string;
        title: string;
        source: string;
        icon: string;
        parsePayload: (data: unknown, params?: Partial<zod.ParseParams> | undefined) => {
            id: string;
            type: "DEVELOPER";
            client: {
                id: string;
                scopes: string[];
                title: string;
                updatedAt: Date;
                createdAt: Date;
            };
            authorizationUrl: string;
        } | {
            id: string;
            type: "EXTERNAL";
            account: {
                id: string;
                metadata?: any;
            };
            client: {
                id: string;
                scopes: string[];
                title: string;
                updatedAt: Date;
                createdAt: Date;
            };
            authorizationUrl: string;
        };
        properties: {
            label: string;
            text: string;
        }[];
    };
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<MissingConnectionNotificationSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<MissingConnectionNotificationSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
    toJSON(): TriggerMetadata;
}
type MissingConnectionResolvedNotificationSpecification = EventSpecification<MissingConnectionResolvedNotificationPayload>;
declare class MissingConnectionResolvedNotification implements Trigger<MissingConnectionResolvedNotificationSpecification> {
    private options;
    constructor(options: MissingConnectionNotificationOptions);
    get event(): {
        name: string;
        title: string;
        source: string;
        icon: string;
        parsePayload: (data: unknown, params?: Partial<zod.ParseParams> | undefined) => {
            id: string;
            type: "DEVELOPER";
            client: {
                id: string;
                scopes: string[];
                title: string;
                updatedAt: Date;
                createdAt: Date;
                integrationIdentifier: string;
                integrationAuthMethod: string;
            };
            expiresAt: Date;
        } | {
            id: string;
            type: "EXTERNAL";
            account: {
                id: string;
                metadata?: any;
            };
            client: {
                id: string;
                scopes: string[];
                title: string;
                updatedAt: Date;
                createdAt: Date;
                integrationIdentifier: string;
                integrationAuthMethod: string;
            };
            expiresAt: Date;
        };
        properties: {
            label: string;
            text: string;
        }[];
    };
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<MissingConnectionResolvedNotificationSpecification>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(payload: ReturnType<MissingConnectionResolvedNotificationSpecification["parsePayload"]>): Promise<{
        success: true;
    }>;
    toJSON(): TriggerMetadata;
}

/** Configuration options for an InvokeTrigger */
type InvokeTriggerOptions<TSchema extends ZodType = z.ZodTypeAny> = {
    /** A [Zod](https://trigger.dev/docs/documentation/guides/zod) schema that defines the shape of the event payload.
     * The default is `z.any()` which is `any`.
     * */
    schema?: TSchema;
    examples?: EventSpecificationExample[];
};
declare class InvokeTrigger<TSchema extends ZodType = z.ZodTypeAny> implements Trigger<EventSpecification<TypeOf<TSchema>, z.input<TSchema>>> {
    #private;
    constructor(options: InvokeTriggerOptions<TSchema>);
    toJSON(): TriggerMetadata;
    get event(): {
        name: string;
        title: string;
        source: string;
        examples: {
            id: string;
            name: string;
            icon?: string | undefined;
            payload?: any;
        }[];
        icon: string;
        parsePayload: (rawPayload: unknown) => any;
        parseInvokePayload: (rawPayload: unknown) => any;
    };
    attachToJob(triggerClient: TriggerClient, job: Job<Trigger<EventSpecification<ZodType<TSchema>>>, any>): void;
    get preprocessRuns(): boolean;
    verifyPayload(): Promise<{
        success: true;
    }>;
}
declare function invokeTrigger<TSchema extends ZodType = z.ZodTypeAny>(options?: InvokeTriggerOptions<TSchema>): Trigger<EventSpecification<TypeOf<TSchema>, z.input<TSchema>>>;

declare function slugifyId(input: string): string;

/** Easily verify webhook payloads when they're using common signing methods. */
declare function verifyRequestSignature({ request, headerName, headerEncoding, secret, algorithm, }: {
    /** The web request that you want to verify. */
    request: Request;
    /** The name of the header that contains the signature. E.g. `X-Cal-Signature-256`. */
    headerName: string;
    /** The header encoding. Defaults to `hex`. */
    headerEncoding?: BinaryToTextEncoding;
    /** The secret that you use to hash the payload. For HttpEndpoints this will usually originally
        come from the Trigger.dev dashboard and should be stored in an environment variable. */
    secret: BinaryLike | KeyObject;
    /** The hashing algorithm that was used to create the signature. Currently only `sha256` is
        supported. */
    algorithm: "sha256";
}): Promise<VerifyResult>;
declare function verifyHmacSha256(headerValue: string, headerEncoding: BinaryToTextEncoding, secret: BinaryLike | KeyObject, body: string): boolean;

declare class ResumeWithTaskError {
    task: ServerTask;
    constructor(task: ServerTask);
}
declare class ResumeWithParallelTaskError {
    task: ServerTask;
    childErrors: Array<TriggerInternalError>;
    constructor(task: ServerTask, childErrors: Array<TriggerInternalError>);
}
declare class RetryWithTaskError {
    cause: ErrorWithStack;
    task: ServerTask;
    retryAt: Date;
    constructor(cause: ErrorWithStack, task: ServerTask, retryAt: Date);
}
declare class CanceledWithTaskError {
    task: ServerTask;
    constructor(task: ServerTask);
}
declare class YieldExecutionError {
    key: string;
    constructor(key: string);
}
declare class AutoYieldExecutionError {
    location: string;
    timeRemaining: number;
    timeElapsed: number;
    constructor(location: string, timeRemaining: number, timeElapsed: number);
}
declare class AutoYieldWithCompletedTaskExecutionError {
    id: string;
    properties: DisplayProperty[] | undefined;
    data: {
        location: string;
        timeRemaining: number;
        timeElapsed: number;
    };
    output?: string | undefined;
    constructor(id: string, properties: DisplayProperty[] | undefined, data: {
        location: string;
        timeRemaining: number;
        timeElapsed: number;
    }, output?: string | undefined);
}
type TriggerInternalError = ResumeWithTaskError | RetryWithTaskError | CanceledWithTaskError | YieldExecutionError | AutoYieldExecutionError | AutoYieldWithCompletedTaskExecutionError | ResumeWithParallelTaskError;
/** Use this function if you're using a `try/catch` block to catch errors.
 * It checks if a thrown error is a special internal error that you should ignore.
 * If this returns `true` then you must rethrow the error: `throw err;`
 * @param err The error to check
 * @returns `true` if the error is a Trigger Error, `false` otherwise.
 */
declare function isTriggerError(err: unknown): err is TriggerInternalError;

declare const retry: {
    readonly standardBackoff: {
        readonly limit: 8;
        readonly factor: 1.8;
        readonly minTimeoutInMs: 500;
        readonly maxTimeoutInMs: 30000;
        readonly randomize: true;
    };
    readonly exponentialBackoff: {
        readonly limit: 8;
        readonly factor: 2;
        readonly minTimeoutInMs: 1000;
        readonly maxTimeoutInMs: 30000;
        readonly randomize: true;
    };
};

type Task = ServerTask;

type SentEvent = ApiEventLog;
declare function redactString(strings: TemplateStringsArray, ...interpolations: string[]): RedactString;

export { type AuthResolverResult, type BackgroundFetchResponse, CronTrigger, type DynamicIntervalOptions, DynamicSchedule, DynamicTrigger, type DynamicTriggerOptions, type EventSpecification, type EventSpecificationExample, EventSpecificationExampleSchema, EventTrigger, type EventTypeFromSpecification, ExternalSource, type ExternalSourceParams, ExternalSourceTrigger, type ExternalSourceTriggerOptions, type GetWebhookConfig, type GetWebhookParams, type HandlerEvent, type HttpSourceEvent, IO, IOLogger, type IOOptions, type IOStats, type IOTask, type IOWithIntegrations, type IntegrationTaskKey, IntervalTrigger, InvokeTrigger, JSONOutputSerializer, Job, type JobIO, type JobOptions, type JobPayload, type Json, MissingConnectionNotification, MissingConnectionResolvedNotification, type NotificationEvents, type NotificationsEventEmitter, type OutputSerializer, type PreprocessResults, type RunTaskErrorCallback, type SchemaParser, type SchemaParserIssue, type SchemaParserResult, type SentEvent, type Task, type TaskLogger, type Trigger, type TriggerAuthResolver, TriggerClient, type TriggerClientOptions, type TriggerContext, type TriggerEventType, type TriggerIntegration, type TriggerInvokeType, type TriggerOptionRecord, type TriggerPayload, type TriggerPreprocessContext, type TypedEventSpecificationExample, type VerifyResult, type WaitForEventResult, type WebhookConfig, type WebhookDeliveryContext, type WebhookHandlerEvent, WebhookSource, WebhookTrigger, type WebhookTriggerOptions, cronTrigger, eventTrigger, intervalTrigger, invokeTrigger, isTriggerError, missingConnectionNotification, missingConnectionResolvedNotification, omit, redactString, retry, slugifyId, verifyHmacSha256, verifyRequestSignature, waitForEventSchema };
