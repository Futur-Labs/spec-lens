import type { ApiSpec, OperationObject } from '@/entities/api-spec';
import type { HttpMethod } from '@/shared/type';
import { HTTP_METHODS } from '@/shared/type';

import type { DiffResult, EndpointChange, EndpointKey, EndpointModification } from '../model/spec-diff-types';

type EndpointInfo = {
  method: HttpMethod;
  path: string;
  operation: OperationObject;
};

function extractEndpoints(spec: ApiSpec): Map<EndpointKey, EndpointInfo> {
  const map = new Map<EndpointKey, EndpointInfo>();

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) {
        const key: EndpointKey = `${method}:${path}`;
        map.set(key, { method, path, operation });
      }
    }
  }

  return map;
}

function compareOperations(oldOp: OperationObject, newOp: OperationObject): string[] {
  const changes: string[] = [];

  if (oldOp.summary !== newOp.summary) {
    changes.push('Summary changed');
  }

  if (oldOp.description !== newOp.description) {
    changes.push('Description changed');
  }

  if (oldOp.deprecated !== newOp.deprecated) {
    changes.push(newOp.deprecated ? 'Marked as deprecated' : 'No longer deprecated');
  }

  if (oldOp.operationId !== newOp.operationId) {
    changes.push('OperationId changed');
  }

  // Compare parameters count
  const oldParamCount = oldOp.parameters?.length ?? 0;
  const newParamCount = newOp.parameters?.length ?? 0;
  if (oldParamCount !== newParamCount) {
    changes.push(`Parameters: ${oldParamCount} → ${newParamCount}`);
  }

  // Compare request body presence
  const hadBody = !!oldOp.requestBody;
  const hasBody = !!newOp.requestBody;
  if (hadBody !== hasBody) {
    changes.push(hasBody ? 'Request body added' : 'Request body removed');
  }

  // Compare response codes
  const oldCodes = Object.keys(oldOp.responses).sort();
  const newCodes = Object.keys(newOp.responses).sort();
  if (JSON.stringify(oldCodes) !== JSON.stringify(newCodes)) {
    const addedCodes = newCodes.filter((c) => !oldCodes.includes(c));
    const removedCodes = oldCodes.filter((c) => !newCodes.includes(c));
    if (addedCodes.length > 0) changes.push(`Response codes added: ${addedCodes.join(', ')}`);
    if (removedCodes.length > 0) changes.push(`Response codes removed: ${removedCodes.join(', ')}`);
  }

  // Compare tags
  const oldTags = (oldOp.tags ?? []).sort().join(',');
  const newTags = (newOp.tags ?? []).sort().join(',');
  if (oldTags !== newTags) {
    changes.push('Tags changed');
  }

  // Compare security
  const oldSec = JSON.stringify(oldOp.security ?? null);
  const newSec = JSON.stringify(newOp.security ?? null);
  if (oldSec !== newSec) {
    changes.push('Security requirements changed');
  }

  return changes;
}

export function diffSpecs(oldSpec: ApiSpec, newSpec: ApiSpec): DiffResult {
  const oldEndpoints = extractEndpoints(oldSpec);
  const newEndpoints = extractEndpoints(newSpec);

  const added: EndpointChange[] = [];
  const removed: EndpointChange[] = [];
  const modified: EndpointModification[] = [];

  // Find added and modified
  for (const [key, newInfo] of newEndpoints) {
    const oldInfo = oldEndpoints.get(key);
    if (!oldInfo) {
      added.push({
        method: newInfo.method,
        path: newInfo.path,
        summary: newInfo.operation.summary,
      });
    } else {
      const changes = compareOperations(oldInfo.operation, newInfo.operation);
      if (changes.length > 0) {
        modified.push({
          method: newInfo.method,
          path: newInfo.path,
          summary: newInfo.operation.summary,
          changes,
        });
      }
    }
  }

  // Find removed
  for (const [key, oldInfo] of oldEndpoints) {
    if (!newEndpoints.has(key)) {
      removed.push({
        method: oldInfo.method,
        path: oldInfo.path,
        summary: oldInfo.operation.summary,
      });
    }
  }

  return {
    added,
    removed,
    modified,
    summary: {
      totalAdded: added.length,
      totalRemoved: removed.length,
      totalModified: modified.length,
      oldEndpointCount: oldEndpoints.size,
      newEndpointCount: newEndpoints.size,
    },
  };
}
