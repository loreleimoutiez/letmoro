import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callbackCode, validAuthConfiguration } from '../src/auth/config.ts';

test('auth accepts only HTTPS public publishable configuration, never server secrets', () => {
  const publicKey = 'sb_publishable_synthetic_test_configuration';
  assert.equal(validAuthConfiguration('https://project.example', publicKey), true);
  for (const url of ['http://project.example', 'https://user:password@project.example', 'https://project.example?secret=value', 'bad']) assert.equal(validAuthConfiguration(url, publicKey), false);
  for (const key of ['', 'sb_secret_synthetic', 'service_role', 'eyJsynthetic']) assert.equal(validAuthConfiguration('https://project.example', key), false);
});
test('auth callback accepts only the exact native PKCE return target and one code', () => {
  assert.equal(callbackCode('letmoro://auth/callback?code=synthetic-one-time-code'), 'synthetic-one-time-code');
  for (const url of ['https://auth/callback?code=x', 'letmoro://evil/callback?code=x', 'letmoro://auth/wrong?code=x', 'letmoro://auth/callback#access_token=x', 'letmoro://user@auth/callback?code=x', 'letmoro://auth/callback?code=x&code=y', 'letmoro://auth/callback?error=denied&code=x']) assert.equal(callbackCode(url), null);
});
