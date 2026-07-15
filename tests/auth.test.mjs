import assert from 'node:assert/strict';
import test from 'node:test';
import { clearSessionCookie, constantTimeEqual, createSession, parseCookies, sessionCookie, verifySession } from '../src/auth.mjs';

const secret = 's'.repeat(32);
test('valid sessions verify and expire', () => { const token = createSession(secret, 60, 1000); assert.ok(verifySession(token, secret, 2000)); assert.equal(verifySession(token, secret, 62000), null); });
test('tampered sessions fail closed', () => { const token = createSession(secret, 60); assert.equal(verifySession(`${token}x`, secret), null); assert.equal(verifySession(token, 'x'.repeat(32)), null); });
test('token comparisons require exact bytes', () => { assert.equal(constantTimeEqual('abc', 'abc'), true); assert.equal(constantTimeEqual('abc', 'abcd'), false); });
test('cookies are HttpOnly and Strict', () => { const cookie = sessionCookie('token', 60, true); assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Secure/); assert.equal(parseCookies('a=1; pes_marketing_session=abc').pes_marketing_session, 'abc'); assert.match(clearSessionCookie(), /Max-Age=0/); });
