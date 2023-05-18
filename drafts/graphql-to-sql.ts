import 'dotenv/config';
import { Configuration, OpenAIApi } from 'openai';
import { stripIndent } from 'common-tags';

/**
 * NOTE: 지금 프롬프트로는 query2에 대한 처리를 잘 구분하지 못함.
 */

// 일부 타입은 작성 생략
const graphqlSchema = stripIndent`
  type Book {
    title: String
    author(where: AuthorFilter): Author
  }
  
  type Author {
    name: String
    books(BooksFilter): [Book]
  }
  
  type Query {
    books(filter: BooksFilter): [Book]
    authors(filter: AuthorsFilter): [Author]
  }
`;
// books를 필터링 해야하는 쿼리
const graphqlQuery1 = stripIndent`
  query GetBooksAndAuthors {
    books(filter: { author: { name: "seoco" }}) {
      title
      author {
        name
      }
    }
  }
`;
// author를 필터링 해야하는 쿼리
const graphqlQuery2 = stripIndent`
  query GetBooksAndAuthors {
    books {
      title
      author(filter: { name: "seoco" }) {
        name
      }
    }
  }
`;
// dbdiagram.io
const sqlSchema = stripIndent`
  Table books {
    id string [pk]
    title string
    author_id string
  }
  
  Table authors {
    id string [pk]
    name string
  }
  
  Ref: authors.id < books.author_id
`;
const db = 'postgresql';

export async function run() {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: stripIndent`
          You are responsible for converting GraphQL queries to SQL queries.
          You will be given the schemas for GraphQL and SQL.
          The interfaces-tables, fields-columns between them are mapped and named with the same semantic words,
          but the case strategy may be different.
          
          If there is a relation between tables, handle it as another SELECT query instead of a JOIN.
          The first SELECT query is called the parent SQL, and subsequent SELECT queries are called child SQL.
          The parent SQL always returns the 'id', and the child SQL is conditioned on '{parent_model.id} IN (...)'.
          As a result, there can be more than one SQL returned.
          If there are multiple SQLs returned, label them like 'SQL1', 'SQL2'.
          
          If a 'filter' is specified in a GraphQL query, it is converted to a WHERE in SQL.
          Be sure to pay attention to where the 'filter' is specified and specify conditions on the appropriate table.
          If the filter is applied to the query itself, it should be applied to parent SQL.
          If the filter is applied to a field, it should be applied only to child SQL.
          
          You must return a correct, operational, optimized and concise SQL queries.
        `,
      },
      {
        role: 'user',
        content: stripIndent`
          [GraphQL schema]:
          ${graphqlSchema}
          
          [GraphQL query]:
          ${graphqlQuery2}
          
          [SQL schema]:
          ${sqlSchema}
          
          [DB]: ${db}
          
          [SQL query]: {your answer}
        `,
      },
    ],
    max_tokens: 1000,
    temperature: 0,
  });
  return result.data.choices[0].message?.content;
}
run()
  .then(r => console.log(r))
  .catch(e => console.error(e));
