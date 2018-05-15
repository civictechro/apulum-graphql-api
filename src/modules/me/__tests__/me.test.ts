import axios from 'axios';

import { Connection } from 'typeorm';
import { createTypeormConn } from '../../../utils/createTypeormConn';
import { User } from '../../../entity/User';
import * as casual from 'casual';

import { loginAndQueryMeTest, noCookieTest } from '../queries/queries';

let conn: Connection;
let email = casual.email;
let pass = casual.password;
let userId: string;

beforeAll(async() => {
  conn = await createTypeormConn();
  const user = await User.create({
    email: email,
    password: pass,
    confirmed: true,
  }).save();
  userId = user.id;
})

afterAll(async () => {
  conn.close();
});

describe('Me query', () => {
  test('return null if no cookie', async() => {
    noCookieTest(true);
  });

  test('can get current user', async() => {
    loginAndQueryMeTest(email, pass, userId);
  });
});
