import { OpenAIApi } from 'openai';
import { Prompt } from '../types';

export default class ListModels implements Prompt {
  async run(openai: OpenAIApi) {
    const result = await openai.listModels();
    return result.data.data.map(it => it.id).sort();
  }
}
