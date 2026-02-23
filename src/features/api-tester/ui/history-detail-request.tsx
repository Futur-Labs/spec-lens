import { File as FileIcon } from 'lucide-react';

import { FileFieldInput } from './file-field-input';
import { HistoryKeyValueTable } from './history-key-value-table';
import {
  type FormField,
  getAvailableContentTypes,
  getCategoryFromContentType,
  getFormFields,
} from '../lib/content-type';
import { formatBody } from '../lib/format-body';
import { useEndpoints, useSpec, VariableAutocompleteInput } from '@/entities/api-spec';
import type { HistoryEntry } from '@/entities/history';
import { useJsonValidation } from '@/shared/lib';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

export function HistoryDetailRequest({
  entry,
  isEditMode,
  editedPathParams,
  editedQueryParams,
  editedHeaders,
  editedBody,
  onChangePathParams,
  onChangeQueryParams,
  onChangeHeaders,
  onChangeBody,
}: {
  entry: HistoryEntry;
  isEditMode: boolean;
  editedPathParams: Record<string, string>;
  editedQueryParams: Record<string, string>;
  editedHeaders: Record<string, string>;
  editedBody: string;
  onChangePathParams: (v: Record<string, string>) => void;
  onChangeQueryParams: (v: Record<string, string>) => void;
  onChangeHeaders: (v: Record<string, string>) => void;
  onChangeBody: (v: string) => void;
}) {
  const colors = useColors();
  const spec = useSpec();
  const endpoints = useEndpoints();
  const { jsonError, fixSuggestion, formattedJson, validate } = useJsonValidation();

  // 현재 spec에서 매칭되는 endpoint의 available content types 조회
  const matchedEndpoint = endpoints.find(
    (ep) => ep.path === entry.path && ep.method === entry.method,
  );
  const availableContentTypes = matchedEndpoint ? getAvailableContentTypes(matchedEndpoint) : [];

  // Content-Type 기반 body 에디터 전환
  const currentHeaders = isEditMode ? editedHeaders : entry.request.headers;
  const contentType = currentHeaders['Content-Type'] || '';
  const contentTypeCategory = getCategoryFromContentType(contentType);
  const isFormBody = contentTypeCategory === 'form' || contentTypeCategory === 'multipart';

  // multipart일 때 스키마 기반 form fields (파일 필드 포함)
  const formFields =
    matchedEndpoint && spec ? getFormFields(matchedEndpoint, spec, contentType) : [];

  // form body를 Record로 파싱 (파일 필드는 history에 저장되지 않으므로 자연스럽게 제외)
  const parseBodyAsRecord = (body: string): Record<string, string> => {
    try {
      const parsed = JSON.parse(body || '{}');
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  };

  const hasPathParams = Object.keys(entry.request.pathParams).length > 0;
  const hasQueryParams = Object.keys(entry.request.queryParams).length > 0;
  const hasHeaders = Object.keys(entry.request.headers).length > 0;
  const hasBody = !!entry.request.body?.trim();

  const handleBodyChange = (value: string) => {
    onChangeBody(value);
    validate(value);
  };

  const handleApplyFix = () => {
    if (!fixSuggestion) return;
    onChangeBody(fixSuggestion);
    validate(fixSuggestion);
  };

  const handleFormat = () => {
    if (!formattedJson) return;
    onChangeBody(formattedJson);
    validate(formattedJson);
  };

  return (
    <>
      {hasPathParams && (
        <CollapsibleSection
          title='Path Parameters'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedPathParams : entry.request.pathParams).length})
            </span>
          }
          defaultExpanded={hasPathParams}
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedPathParams : entry.request.pathParams}
            editable={isEditMode}
            inputType='variable'
            onChange={onChangePathParams}
            emptyMessage='No path parameters'
          />
        </CollapsibleSection>
      )}

      {hasQueryParams && (
        <CollapsibleSection
          title='Query Parameters'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedQueryParams : entry.request.queryParams).length})
            </span>
          }
          defaultExpanded={hasQueryParams}
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedQueryParams : entry.request.queryParams}
            editable={isEditMode}
            inputType='variable'
            onChange={onChangeQueryParams}
            emptyMessage='No query parameters'
          />
        </CollapsibleSection>
      )}

      {hasHeaders && (
        <CollapsibleSection
          title='Request Headers'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedHeaders : entry.request.headers).length})
            </span>
          }
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedHeaders : entry.request.headers}
            editable={isEditMode}
            inputType='header'
            onChange={onChangeHeaders}
            emptyMessage='No headers'
            availableContentTypes={availableContentTypes}
          />
        </CollapsibleSection>
      )}

      {hasBody && (
        <CollapsibleSection
          title={
            isFormBody
              ? `Request Body (${contentTypeCategory === 'multipart' ? 'Multipart Form' : 'Form Data'})`
              : 'Request Body'
          }
          defaultExpanded={hasBody}
        >
          {isFormBody ? (
            <HistoryFormBody
              data={parseBodyAsRecord(isEditMode ? editedBody : entry.request.body)}
              editable={isEditMode}
              formFields={formFields}
              colors={colors}
              onChange={(updated: Record<string, string>) => onChangeBody(JSON.stringify(updated, null, 2))}
            />
          ) : isEditMode ? (
            <div>
              <VariableAutocompleteInput
                value={editedBody}
                onChange={handleBodyChange}
                multiline
                placeholder='Request body'
                style={{
                  width: '100%',
                  minHeight: '12rem',
                  padding: '1rem',
                  backgroundColor: colors.bg.input,
                  border: `1px solid ${jsonError ? colors.feedback.error : colors.border.default}`,
                  borderRadius: '0.6rem',
                  color: colors.text.primary,
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {jsonError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginTop: '0.4rem',
                    color: colors.feedback.error,
                    fontSize: '1.1rem',
                  }}
                >
                  <span>{jsonError}</span>
                  {fixSuggestion && (
                    <button
                      onClick={handleApplyFix}
                      style={{
                        padding: '0.2rem 0.6rem',
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.feedback.error}`,
                        borderRadius: '0.3rem',
                        color: colors.feedback.error,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      Auto Fix
                    </button>
                  )}
                </div>
              )}
              {!jsonError && formattedJson && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginTop: '0.4rem',
                  }}
                >
                  <button
                    onClick={handleFormat}
                    style={{
                      padding: '0.2rem 0.6rem',
                      backgroundColor: 'transparent',
                      border: `1px solid ${colors.text.tertiary}`,
                      borderRadius: '0.3rem',
                      color: colors.text.tertiary,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Format JSON
                  </button>
                </div>
              )}
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                backgroundColor: colors.bg.subtle,
                borderRadius: '0.6rem',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                color: colors.text.primary,
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {formatBody(entry.request.body)}
            </pre>
          )}
        </CollapsibleSection>
      )}
    </>
  );
}

/** multipart/form body 에디터 - 스키마 기반 필드(파일 포함) + 텍스트 key-value */
function HistoryFormBody({
  data,
  editable,
  formFields,
  colors,
  onChange,
}: {
  data: Record<string, string>;
  editable: boolean;
  formFields: FormField[];
  colors: ReturnType<typeof useColors>;
  onChange: (updated: Record<string, string>) => void;
}) {
  // 스키마에 binary 필드가 있는 경우 파일 입력 포함 렌더링
  const binaryFields = formFields.filter((f) => f.format === 'binary');
  const textFields = formFields.filter((f) => f.format !== 'binary');
  const schemaFieldNames = new Set(formFields.map((f) => f.name));

  // 스키마에 정의되지 않은 커스텀 필드
  const customEntries = Object.entries(data).filter(([k]) => !schemaFieldNames.has(k));

  const inputStyle = {
    flex: 1,
    width: '100%',
    padding: '0.8rem 1.2rem',
    backgroundColor: colors.bg.input,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.6rem',
    color: colors.text.primary,
    fontSize: '1.3rem',
    outline: 'none',
  } as const;

  if (binaryFields.length === 0) {
    // 파일 필드가 없으면 기존 HistoryKeyValueTable로 렌더링
    return (
      <HistoryKeyValueTable
        data={data}
        editable={editable}
        inputType='variable'
        onChange={onChange}
        emptyMessage='No form fields'
      />
    );
  }

  if (!editable) {
    // 읽기 모드: binary 필드 이름 → 스키마 정보 매핑
    const binaryFieldMap = new Map(binaryFields.map((f) => [f.name, f]));
    const dataEntries = Object.entries(data);

    // data에 없는 binary 필드 (body에 키 자체가 없는 경우)
    const missingBinaryFields = binaryFields.filter((f) => !(f.name in data));
    const hasContent = dataEntries.length > 0 || missingBinaryFields.length > 0;

    if (!hasContent) {
      return (
        <div style={{ color: colors.text.tertiary, fontSize: '1.2rem', padding: '1rem 0' }}>
          No form fields
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {dataEntries.map(([key, value]) => {
          const binaryField = binaryFieldMap.get(key);

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.7rem 1rem',
                borderBottom: `1px solid ${colors.border.subtle}`,
                fontSize: '1.2rem',
                fontFamily: 'monospace',
              }}
            >
              <span
                style={{
                  color: colors.feedback.info,
                  fontWeight: 600,
                  minWidth: '14rem',
                  flexShrink: 0,
                }}
              >
                {key}
              </span>
              {binaryField ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.8rem',
                    backgroundColor: `${colors.text.tertiary}12`,
                    border: `1px solid ${colors.border.subtle}`,
                    borderRadius: '0.4rem',
                    color: colors.text.tertiary,
                    fontSize: '1.1rem',
                    fontFamily: 'inherit',
                  }}
                >
                  <FileIcon size={12} />
                  File{binaryField.multiple ? ' (multiple)' : ''}
                </span>
              ) : (
                <span style={{ color: colors.text.primary, wordBreak: 'break-all' }}>{value}</span>
              )}
            </div>
          );
        })}

        {/* data에 키가 없는 binary 필드 (스키마에만 존재) */}
        {missingBinaryFields.map((field) => (
          <div
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.7rem 1rem',
              borderBottom: `1px solid ${colors.border.subtle}`,
              fontSize: '1.2rem',
              fontFamily: 'monospace',
            }}
          >
            <span
              style={{
                color: colors.feedback.info,
                fontWeight: 600,
                minWidth: '14rem',
                flexShrink: 0,
              }}
            >
              {field.name}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.8rem',
                backgroundColor: `${colors.text.tertiary}12`,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: '0.4rem',
                color: colors.text.tertiary,
                fontSize: '1.1rem',
                fontFamily: 'inherit',
              }}
            >
              <FileIcon size={12} />
              File{field.multiple ? ' (multiple)' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // 편집 모드: 스키마 기반 필드 (파일 + 텍스트) 렌더링
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {/* 스키마에 정의된 텍스트 필드 */}
      {textFields.map((field) => (
        <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '140px', flexShrink: 0 }}>
            <span
              style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: colors.text.primary }}
            >
              {field.name}
            </span>
            {field.required && (
              <span style={{ color: colors.feedback.error, marginLeft: '0.2rem' }}>*</span>
            )}
            {field.description && (
              <div
                style={{
                  fontSize: '1rem',
                  color: colors.text.tertiary,
                  marginTop: '0.2rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={field.description}
              >
                {field.description}
              </div>
            )}
          </div>
          <input
            className='placeholder-md'
            value={data[field.name] || ''}
            onChange={(e) => onChange({ ...data, [field.name]: e.target.value })}
            placeholder={field.example || field.type}
            style={inputStyle}
          />
        </div>
      ))}

      {/* 스키마에 정의된 파일 필드 */}
      {binaryFields.map((field) => (
        <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '140px', flexShrink: 0 }}>
            <span
              style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: colors.text.primary }}
            >
              {field.name}
            </span>
            {field.required && (
              <span style={{ color: colors.feedback.error, marginLeft: '0.2rem' }}>*</span>
            )}
            {field.description && (
              <div
                style={{
                  fontSize: '1rem',
                  color: colors.text.tertiary,
                  marginTop: '0.2rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={field.description}
              >
                {field.description}
              </div>
            )}
          </div>
          <FileFieldInput fieldName={field.name} multiple={field.multiple} />
        </div>
      ))}

      {/* 커스텀 필드 */}
      {customEntries.map(([key, value]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '140px', flexShrink: 0 }}>
            <span
              style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: colors.text.primary }}
            >
              {key}
            </span>
          </div>
          <input
            className='placeholder-md'
            value={value}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            style={inputStyle}
          />
        </div>
      ))}
    </div>
  );
}
