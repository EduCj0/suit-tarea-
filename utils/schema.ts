import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import post from '../schemas/post.schema.json';
import postList from '../schemas/post-list.schema.json';
import user from '../schemas/user.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(post);
ajv.addSchema(postList);
ajv.addSchema(user);

/** Valida `data` contra el esquema con el $id dado y devuelve los errores legibles (vacío si es válido). */
export function validarEsquema(id: 'post' | 'post-list' | 'user', data: unknown): string[] {
  const validate = ajv.getSchema(id) as ValidateFunction;
  if (validate(data)) return [];
  return (validate.errors ?? []).map(e => `${e.instancePath || '(raíz)'} ${e.message}`);
}
