import { generateExample } from './generate-example';
import { isReferenceObject, type ApiSpec, type ParameterObject } from '../model/api-types';

export function getParameterExample(params: ParameterObject[], spec: ApiSpec) {
  return params.reduce(
    (acc, param) => {
      if (param.schema && !isReferenceObject(param.schema)) {
        acc[param.name] = generateExample(param.schema, spec) ?? 'string';
      } else {
        acc[param.name] = 'string';
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}
