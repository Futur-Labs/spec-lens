import { ParameterGroup, type ApiSpec, type ParameterObject } from '@/entities/api-spec';
import { CollapsibleSection } from '@/shared/ui/section';

export function EndpointParametersSection({
  parameters,
  spec,
}: {
  parameters: ParameterObject[];
  spec: ApiSpec;
}) {
  if (parameters.length === 0) {
    return;
  }

  const pathParams = parameters.filter((p) => p.in === 'path');
  const queryParams = parameters.filter((p) => p.in === 'query');
  const headerParams = parameters.filter((p) => p.in === 'header');

  return (
    <CollapsibleSection title='Parameters'>
      {pathParams.length > 0 && (
        <ParameterGroup title='Path Parameters' params={pathParams} spec={spec} />
      )}
      {queryParams.length > 0 && (
        <ParameterGroup title='Query Parameters' params={queryParams} spec={spec} />
      )}
      {headerParams.length > 0 && (
        <ParameterGroup title='Header Parameters' params={headerParams} spec={spec} />
      )}
    </CollapsibleSection>
  );
}
