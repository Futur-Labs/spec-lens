import { useState } from 'react';

import { Check, ChevronDown, ChevronUp, Globe, Plus, Trash2 } from 'lucide-react';

import { getInputStyle, INPUT_CLASS_NAME } from '../lib/input-style';
import {
  environmentStoreActions,
  useActiveEnvironmentId,
  useEnvironments,
  type Environment,
  type EnvironmentVariable,
} from '@/entities/environment';
import { useColors } from '@/shared/theme';

const ENV_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function EnvironmentsTab() {
  const colors = useColors();
  const environments = useEnvironments();
  const activeEnvId = useActiveEnvironmentId();
  const inputStyle = getInputStyle(colors);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBaseUrl, setNewBaseUrl] = useState('');
  const [newColor, setNewColor] = useState(ENV_COLORS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;

    const env: Environment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newName.trim(),
      baseUrl: newBaseUrl.trim(),
      variables: [],
      color: newColor,
    };

    environmentStoreActions.addEnvironment(env);
    setNewName('');
    setNewBaseUrl('');
    setNewColor(ENV_COLORS[(environments.length + 1) % ENV_COLORS.length]);
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Info */}
      <div
        style={{
          padding: '0.8rem 1rem',
          backgroundColor: `${colors.feedback.info}15`,
          border: `1px solid ${colors.feedback.info}25`,
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: colors.feedback.info,
        }}
      >
        환경을 생성하면 서버 URL과 변수를 환경별로 관리할 수 있습니다. 환경 변수는 글로벌 변수보다
        우선합니다.
      </div>

      {/* Environment List */}
      {environments.map((env) => (
        <EnvironmentCard
          key={env.id}
          env={env}
          isActive={env.id === activeEnvId}
          isExpanded={env.id === expandedId}
          onToggleExpand={() => setExpandedId(expandedId === env.id ? null : env.id)}
          inputStyle={inputStyle}
          colors={colors}
        />
      ))}

      {/* Add Form */}
      {showAddForm ? (
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: colors.bg.overlay,
            border: `1px dashed ${colors.border.default}`,
            borderRadius: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Environment name (e.g. Development)'
              className={INPUT_CLASS_NAME}
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <input
              value={newBaseUrl}
              onChange={(e) => setNewBaseUrl(e.target.value)}
              placeholder='Base URL (e.g. https://api.dev.example.com)'
              className={INPUT_CLASS_NAME}
              style={{ ...inputStyle, flex: 2, fontFamily: 'monospace' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>

          {/* 색상 선택 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary }}>Color:</span>
            {ENV_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: newColor === c ? '2px solid white' : '2px solid transparent',
                  outline: newColor === c ? `2px solid ${c}` : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: '0.4rem',
                color: colors.text.secondary,
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: newName.trim() ? colors.interactive.primary : colors.bg.overlayHover,
                border: 'none',
                borderRadius: '0.4rem',
                color: colors.text.onBrand,
                fontSize: '1.2rem',
                fontWeight: 500,
                cursor: newName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '1rem',
            backgroundColor: 'transparent',
            border: `1px dashed ${colors.border.default}`,
            borderRadius: '0.6rem',
            color: colors.text.secondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          Add Environment
        </button>
      )}

      {environments.length === 0 && !showAddForm && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: colors.text.tertiary,
            fontSize: '1.2rem',
          }}
        >
          No environments yet. Create one to manage server URLs and variables per environment.
        </div>
      )}
    </div>
  );
}

function EnvironmentCard({
  env,
  isActive,
  isExpanded,
  onToggleExpand,
  inputStyle,
  colors,
}: {
  env: Environment;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  inputStyle: React.CSSProperties;
  colors: ReturnType<typeof useColors>;
}) {
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  const handleAddVariable = () => {
    if (!newVarName.trim()) return;

    const newVar: EnvironmentVariable = {
      name: newVarName.trim(),
      value: newVarValue,
    };

    environmentStoreActions.updateEnvironment(env.id, {
      variables: [...env.variables, newVar],
    });
    setNewVarName('');
    setNewVarValue('');
  };

  const handleRemoveVariable = (index: number) => {
    environmentStoreActions.updateEnvironment(env.id, {
      variables: env.variables.filter((_, i) => i !== index),
    });
  };

  const handleUpdateVariable = (index: number, updates: Partial<EnvironmentVariable>) => {
    const newVars = [...env.variables];
    newVars[index] = { ...newVars[index], ...updates };
    environmentStoreActions.updateEnvironment(env.id, { variables: newVars });
  };

  return (
    <div
      style={{
        border: `1px solid ${isActive ? `${env.color}40` : colors.border.subtle}`,
        borderRadius: '0.6rem',
        backgroundColor: isActive ? `${env.color}0a` : colors.bg.overlay,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1rem',
          cursor: 'pointer',
        }}
        onClick={onToggleExpand}
      >
        <div
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            backgroundColor: env.color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '1.3rem', fontWeight: 600, color: colors.text.primary, flex: 1 }}>
          {env.name}
        </span>

        {env.baseUrl && (
          <span
            style={{
              fontSize: '1rem',
              fontFamily: 'monospace',
              color: colors.text.tertiary,
              maxWidth: '20rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {env.baseUrl}
          </span>
        )}

        {env.variables.length > 0 && (
          <span
            style={{
              padding: '0.1rem 0.5rem',
              backgroundColor: `${env.color}18`,
              borderRadius: '0.3rem',
              fontSize: '1rem',
              color: env.color,
              fontWeight: 500,
            }}
          >
            {env.variables.length} vars
          </span>
        )}

        {/* Active toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            environmentStoreActions.setActiveEnvironment(isActive ? null : env.id);
          }}
          title={isActive ? 'Deactivate' : 'Activate'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.4rem',
            height: '2.4rem',
            borderRadius: '0.4rem',
            backgroundColor: isActive ? `${env.color}25` : 'transparent',
            border: `1px solid ${isActive ? env.color : colors.border.subtle}`,
            color: isActive ? env.color : colors.text.tertiary,
            cursor: 'pointer',
          }}
        >
          {isActive ? <Check size={14} /> : <Globe size={12} />}
        </button>

        {isExpanded ? (
          <ChevronUp size={14} color={colors.text.tertiary} />
        ) : (
          <ChevronDown size={14} color={colors.text.tertiary} />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          style={{
            borderTop: `1px solid ${colors.border.subtle}`,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
          }}
        >
          {/* Base URL */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '1.1rem',
                color: colors.text.secondary,
                fontWeight: 500,
                marginBottom: '0.4rem',
              }}
            >
              Base URL
            </label>
            <input
              value={env.baseUrl}
              onChange={(e) =>
                environmentStoreActions.updateEnvironment(env.id, { baseUrl: e.target.value })
              }
              placeholder='https://api.example.com'
              className={INPUT_CLASS_NAME}
              style={{ ...inputStyle, fontFamily: 'monospace', width: '100%' }}
            />
          </div>

          {/* Variables */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '1.1rem',
                color: colors.text.secondary,
                fontWeight: 500,
                marginBottom: '0.4rem',
              }}
            >
              Variables
            </label>

            {env.variables.map((v, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <span style={{ color: env.color, fontSize: '1.1rem' }}>@</span>
                <input
                  value={v.name}
                  onChange={(e) => handleUpdateVariable(i, { name: e.target.value })}
                  className={INPUT_CLASS_NAME}
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                />
                <input
                  value={v.value}
                  onChange={(e) => handleUpdateVariable(i, { value: e.target.value })}
                  placeholder='Value'
                  className={INPUT_CLASS_NAME}
                  style={{ ...inputStyle, flex: 2 }}
                />
                <button
                  onClick={() => handleRemoveVariable(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.feedback.error}40`,
                    borderRadius: '0.4rem',
                    cursor: 'pointer',
                    color: colors.feedback.error,
                  }}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}

            {/* Add Variable */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ color: colors.text.tertiary, fontSize: '1.1rem' }}>@</span>
              <input
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder='Name'
                className={INPUT_CLASS_NAME}
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
              />
              <input
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                placeholder='Value'
                className={INPUT_CLASS_NAME}
                style={{ ...inputStyle, flex: 2 }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
              />
              <button
                onClick={handleAddVariable}
                disabled={!newVarName.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: newVarName.trim() ? env.color : colors.bg.overlayHover,
                  border: 'none',
                  borderRadius: '0.4rem',
                  cursor: newVarName.trim() ? 'pointer' : 'not-allowed',
                  color: colors.text.onBrand,
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Delete Environment */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.4rem' }}>
            <button
              onClick={() => environmentStoreActions.removeEnvironment(env.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.feedback.error}40`,
                borderRadius: '0.4rem',
                color: colors.feedback.error,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              Delete Environment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
