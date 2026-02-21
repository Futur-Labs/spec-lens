import { FlexRow } from '@jigoooo/shared-ui';
import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { type FormField } from '../lib/content-type';
import { getIconButtonStyle } from '../lib/icon-button-style';
import { testParamsStoreActions, useRequestBody } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';

export function FormDataEditor({
  fields,
  label,
  onReset,
}: {
  fields: FormField[];
  label: string;
  onReset: () => void;
}) {
  const colors = useColors();
  const requestBody = useRequestBody();
  const iconButtonStyle = getIconButtonStyle(colors);

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // requestBody는 JSON string으로 저장된 key-value
  const currentValues: Record<string, string> = (() => {
    try {
      const parsed = JSON.parse(requestBody || '{}');
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  })();

  const updateValues = (newValues: Record<string, string>) => {
    testParamsStoreActions.setRequestBody(JSON.stringify(newValues, null, 2));
  };

  const handleFieldChange = (name: string, value: string) => {
    updateValues({ ...currentValues, [name]: value });
  };

  const handleRemoveField = (name: string) => {
    const { [name]: _, ...rest } = currentValues;
    updateValues(rest);
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    updateValues({ ...currentValues, [newFieldName.trim()]: newFieldValue });
    setNewFieldName('');
    setNewFieldValue('');
  };

  // 스키마 필드 + 추가된 커스텀 필드 합치기
  const schemaFieldNames = new Set(fields.map((f) => f.name));
  const customFieldNames = Object.keys(currentValues).filter((k) => !schemaFieldNames.has(k));

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

  return (
    <div>
      <FlexRow
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.8rem',
        }}
      >
        <span style={{ color: colors.text.secondary, fontSize: '1.2rem', fontWeight: 500 }}>
          {label}
        </span>
        <ResetButton title='Reset to default values' onClick={onReset} />
      </FlexRow>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {/* 스키마에 정의된 필드 */}
        {fields.map((field) => (
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
              value={currentValues[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.example || field.type}
              style={inputStyle}
            />
          </div>
        ))}

        {/* 사용자가 추가한 커스텀 필드 */}
        {customFieldNames.map((name) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '140px', flexShrink: 0 }}>
              <span
                style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: colors.text.primary }}
              >
                {name}
              </span>
            </div>
            <input
              className='placeholder-md'
              value={currentValues[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() => handleRemoveField(name)}
              style={iconButtonStyle}
              title='Remove field'
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* 새 필드 추가 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '0.4rem',
            padding: '0.6rem',
            border: `1px dashed ${colors.border.subtle}`,
            borderRadius: '0.6rem',
          }}
        >
          <span style={{ fontSize: '1rem', color: colors.text.tertiary, fontWeight: 500 }}>
            Add Field
          </span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input
              className='placeholder-md'
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder='Field name'
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddField();
              }}
            />
            <input
              className='placeholder-md'
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              placeholder='Value'
              style={{ ...inputStyle, flex: 2 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddField();
              }}
            />
            <button
              onClick={handleAddField}
              disabled={!newFieldName.trim()}
              style={{
                ...iconButtonStyle,
                opacity: newFieldName.trim() ? 1 : 0.4,
                cursor: newFieldName.trim() ? 'pointer' : 'not-allowed',
              }}
              title='Add field'
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
