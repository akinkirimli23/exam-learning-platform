import metadata from './question-bank-tests.json';
import { bankTestDefinitionSchema } from '@/shared/question-bank';

// Only public test metadata belongs to the client topic registry.
// Stems, solutions and answer keys live exclusively under server/content.
export const buoyancyBankTests = bankTestDefinitionSchema.array().parse(metadata);
