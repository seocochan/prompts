import type { OpenAIApi } from 'openai';

export type CommandOption = {
  name?: string;
  defaultValue?: string | boolean | string[];
  description?: string;
};

export type ObjectLiteral = Record<string, any>;

export type CommandOptions<T extends ObjectLiteral> = {
  [key in keyof T]: CommandOption;
};

export interface Prompt<TOptions extends ObjectLiteral = {}> {
  readonly commandOptions?: CommandOptions<TOptions>;
  run(openapi: OpenAIApi, options?: TOptions): any;
}
