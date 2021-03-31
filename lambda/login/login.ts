import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyEventQueryStringParameters, 
  APIGatewayProxyResult 
} from 'aws-lambda';
import * as bcrypt from "bcrypt";
import { validate } from 'email-validator';
import * as DB from 'ubiquitab_db';

DB.config(process.env.usersTableName!, {})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const queries = event.queryStringParameters;

  if( !checkInput(queries) ) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "incorrect query parameters",
    };
  }

  let wrongCredentials: APIGatewayProxyResult = {
    statusCode: 401,
    headers: { "Content-Type": "text/plain" },
    body: "incorrect credentials",
  };

  try {
    let user = await DB.getUser(queries!.email!);
    if( await bcrypt.compare(queries!.password!, user.hash) ) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello, CDK ${user.name}\n`
      }
    }
    else {
      return wrongCredentials;
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    return wrongCredentials;
  }

}


function checkInput(queries: APIGatewayProxyEventQueryStringParameters | null): boolean {
  if(queries == null) return false;
  if( typeof queries.email    === 'undefined' ||
      typeof queries.password === 'undefined')
    return false;

   if( !validate(queries.email) ) return false;
   if(queries.password.length < 8 || queries.password.length > 70) return false;

  return true;
}
