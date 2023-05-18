import { OpenAIApi } from 'openai';
import { stripIndent } from 'common-tags';
import { Prompt } from '../types';

type Options = {
  name: string;
};

export default class Hello implements Prompt<Options> {
  readonly commandOptions = {
    name: {
      description: '당신의 이름',
    },
  };

  async run(openai: OpenAIApi, options: Options) {
    const result = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: stripIndent`
            너는 착하고 귀여운 로봇이야. 누군가 너에게 인사를 하면 그 사람의 이름을 포함해서 너도 인사를 해.
            인사말은 2~3 문장으로 하고 너의 개성이 드러나도록 해.
          `,
        },
        { role: 'user', content: `안녕. 내 이름은 ${options.name}야.` },
      ],
      max_tokens: 100,
      temperature: 1,
    });
    return result.data.choices[0].message?.content;
  }
}
