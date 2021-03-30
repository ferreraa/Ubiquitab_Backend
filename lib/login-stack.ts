import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class LoginStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
    });

    const getRegisterHandler = new lambda.Function(this, 'registerHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/register'),
      handler: 'register.handler',
      environment: {
        usersTableName: usersTable.tableName,
      }
    });

    usersTable.grantReadWriteData(getRegisterHandler);

    const getLoginHandler = new lambda.Function(this, 'loginHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/login'),
      handler: 'login.handler',
      environment: {
        usersTableName: usersTable.tableName,
      }
    });

    const api = new apigw.RestApi(this, 'ubiquitab-api', { });
    api.root.addMethod('ANY');

    const register = api.root.addResource('register');
    register.addMethod('POST', new LambdaIntegration(getRegisterHandler));

    const login = api.root.addResource('login');
    login.addMethod('POST', new LambdaIntegration(getLoginHandler));

   }
}
