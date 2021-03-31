import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult,
  APIGatewayProxyEventQueryStringParameters
} from 'aws-lambda';
import { validate } from 'email-validator';
import * as DB from 'ubiquitab_db';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

DB.config(process.env.usersTableName!, {})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const queries = event.queryStringParameters;

  if( !checkInput(queries) ) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: `incorrect query parameters`
    }
  }


  try {
    let id = uuidv4();
    let hash = await bcrypt.hash(queries!.password!, 12);
    let user = new DB.User(id, queries!.email!, queries!.name!, hash);
    let answer = await DB.putNewUser(user);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello, CDK! You've hit ${event.path} in register\n`
    }
  } catch (error) {
    return {
      statusCode: 520,
      headers: { "Content-Type": "text/plain" },
      body: `${error}`
    }
  }
}

function checkInput(queries: APIGatewayProxyEventQueryStringParameters | null): boolean {
  if(queries == null) return false;
  if( typeof queries.email    === 'undefined' ||
      typeof queries.name     === 'undefined' ||
      typeof queries.password === 'undefined')
    return false;

   if( !validate(queries.email) ) return false;
   if(queries.name.length < 2 || queries.name.length > 25) return false;
   if(queries.password.length < 8 || queries.password.length > 70) return false;

  return true;
}