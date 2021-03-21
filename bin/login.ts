#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LoginStack } from '../lib/login-stack';

const app = new cdk.App();
new LoginStack(app, 'LoginStack');
