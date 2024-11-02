import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export const getAjv = () => {
  const ajv = addFormats(new Ajv({ strictSchema: false }), [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex',
  ]);
  return ajv;
};
