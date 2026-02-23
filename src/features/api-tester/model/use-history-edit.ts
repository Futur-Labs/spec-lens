import { useState } from 'react';

import type { HistoryEntry } from '@/entities/history';

export function useHistoryEdit(entry: HistoryEntry) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPathParams, setEditedPathParams] = useState(entry.request.pathParams);
  const [editedQueryParams, setEditedQueryParams] = useState(entry.request.queryParams);
  const [editedHeaders, setEditedHeaders] = useState(entry.request.headers);
  const [editedBody, setEditedBody] = useState(entry.request.body);

  const toggleEditMode = () => {
    if (!isEditMode) {
      setEditedPathParams(entry.request.pathParams);
      setEditedQueryParams(entry.request.queryParams);
      setEditedHeaders(entry.request.headers);
      setEditedBody(entry.request.body);
    }
    setIsEditMode(!isEditMode);
  };

  const getEditedParams = () => ({
    pathParams: editedPathParams,
    queryParams: editedQueryParams,
    headers: editedHeaders,
    body: editedBody,
  });

  return {
    isEditMode,
    editedPathParams,
    editedQueryParams,
    editedHeaders,
    editedBody,
    setEditedPathParams,
    setEditedQueryParams,
    setEditedHeaders,
    setEditedBody,
    toggleEditMode,
    getEditedParams,
  };
}
