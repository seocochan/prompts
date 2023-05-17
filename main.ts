import 'dotenv/config';
import * as path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import { glob } from 'glob';
import { Command } from 'commander';
import { Prompt } from './types';

type ClassConstructor<T = unknown> = {
  new (...args: unknown[]): T;
};

async function main() {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const program = new Command();
  await Promise.all(
    glob.sync(path.join(__dirname, 'prompts/*.ts')).map(async filepath => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const Prompt = (await import(filepath)).default as ClassConstructor;
      const command = path.basename(filepath, path.extname(filepath));
      const prompt = new Prompt() as Prompt<any>;
      let builder = program.command(command);
      if (prompt.commandOptions) {
        Object.entries(prompt.commandOptions).map(([key, opt]) => {
          builder = builder.option(`--${opt.name || key} <value>`, opt.description, opt.defaultValue);
        });
      }
      builder.action(async arg => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await prompt.run(openai, arg);
        console.log(result);
      });
    })
  );
  program.parse(process.argv);
}

main().catch(e => console.error(e));
