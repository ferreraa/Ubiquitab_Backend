import { 
    APIGatewayProxyEvent, 
    APIGatewayProxyResult 
  } from 'aws-lambda';


  export const handler = async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const queries = JSON.stringify(event.queryStringParameters);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello, CDK! You've hit ${event.path} in login\n`
    }
  }

