import { OpenAIApi } from 'openai';
import { stripIndent } from 'common-tags';
import { Prompt } from '../types';

type Options = {
  query: string;
};

export default class SearchTerm implements Prompt<Options> {
  readonly commandOptions = {
    query: {
      description: '검색 질의',
    },
  };

  async run(openai: OpenAIApi, options: Options) {
    const result = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: stripIndent`
            너는 세상에서 제일 검색을 잘하는 사람이야.
            사용자가 문장이나 자연어 형태로 질의를 전달하면 너는 그것을 검색 엔진에서 원하는 결과를 얻기에 적절한 형태의 검색어로 가공할거야.
            질의를 검색어로 가공하는 역할만 하고, 질의 자체에 답변은 절대 하지 않을거야.
            최대 3개의 검색어를 제시하고, 만약 적절한 변환이 불가능하면 없다고 말해.
          `,
        },
        { role: 'user', content: `질의: ${options.query}` },
      ],
      max_tokens: 100,
      temperature: 0,
    });
    return result.data.choices[0].message?.content;
  }
}
