#!/usr/bin/env node
'use strict';
/*
 * Verified ZenTao 17.6 session helper for child-zentao-project-manager.
 *
 * Usage:
 *   node zt.js login                # AJAX-MD5 login; caches cookie to %TEMP%/zt_cookie.txt
 *   node zt.js get <path>           # GET a web page (path starts with /, e.g. "/index.php?m=build&f=view&buildID=196")
 *   node zt.js post <path> [json]   # POST form data; JSON object values may be arrays to repeat a key,
 *                                   # e.g. {"stories[]":["363","366"]}
 *
 * Also usable as a module: const zt = require('./zt.js'); await zt.login(); await zt.request(path, opts)
 * with opts { method, body, cookie, jar }.
 *
 * Facts baked in from the 2026-10-05 verified run:
 * - Fallback site http://cdhome.ltsjs.com:7778 (primary cd.ltsjs.com:7778 may be unreachable).
 * - refreshRandom returns a bare number, NOT JSON.
 * - Every request needs a site Referer header or ZenTao 302s to the index&f=index&open= deep-link wrapper.
 * - X-Requested-With: XMLHttpRequest makes form-ajax endpoints answer JSON {"result":...,"locate":...}.
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE = 'http://cdhome.ltsjs.com:7778';
const ACCOUNT = 'zeochild';
const PASSWORD = 'VtezmfygnT7';
const COOKIE_FILE = path.join(process.env.TEMP || '.', 'zt_cookie.txt');

function toPairs(obj) {
  const pairs = [];
  for (const [k, v] of Object.entries(obj || {})) {
    if (Array.isArray(v)) for (const item of v) pairs.push([k, String(item)]);
    else pairs.push([k, String(v)]);
  }
  return pairs;
}

function request(pathname, opts = {}) {
  const { method = 'GET', body = null, jar, cookie } = opts;
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + pathname);
    const data = body == null ? null
      : (typeof body === 'string' ? body : new URLSearchParams(toPairs(body)).toString());
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Referer': BASE + pathname,
      'X-Requested-With': 'XMLHttpRequest',
    };
    const cookieHeader = (jar && jar.cookie) || cookie;
    if (cookieHeader) headers.Cookie = cookieHeader;
    if (data) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers }, (rs) => {
      const chunks = [];
      rs.on('data', (c) => chunks.push(c));
      rs.on('end', () => {
        const setCookies = rs.headers['set-cookie'] || [];
        if (jar && setCookies.length) {
          jar.cookie = setCookies.map((s) => s.split(';')[0]).join('; ') + (jar.cookie ? '; ' + jar.cookie : '');
        }
        resolve({ status: rs.statusCode, body: Buffer.concat(chunks).toString('utf8'), setCookies });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function login() {
  const jar = { cookie: '' };
  await request('/index.php?m=user&f=login', { jar });
  const rr = await request('/index.php?m=user&f=refreshRandom&t=json', { jar });
  const rand = (rr.body || '').trim().replace(/[^0-9]/g, '');
  if (!rand) throw new Error('refreshRandom returned no numeric rand: ' + rr.body.slice(0, 80));
  const p1 = crypto.createHash('md5').update(PASSWORD).digest('hex');
  const p2 = crypto.createHash('md5').update(p1 + rand).digest('hex');
  const res = await request('/index.php?m=user&f=login', {
    method: 'POST',
    jar,
    body: { account: ACCOUNT, password: p2, passwordStrength: 1, referer: '/', verifyRand: rand, keepLogin: 1 },
  });
  if (!/"result"\s*:\s*"success"/.test(res.body)) throw new Error('login failed: ' + res.body.slice(0, 200));
  fs.writeFileSync(COOKIE_FILE, jar.cookie);
  return jar.cookie;
}

function readCookie() {
  try { return fs.readFileSync(COOKIE_FILE, 'utf8').trim(); } catch { return ''; }
}

module.exports = { request, login, readCookie, BASE, COOKIE_FILE };

if (require.main === module) {
  const [, , cmd, ...rest] = process.argv;
  (async () => {
    if (cmd === 'login') {
      const cookie = await login();
      console.log('LOGIN OK -> ' + COOKIE_FILE + ' (cookie len ' + cookie.length + ')');
    } else if (cmd === 'get' && rest[0]) {
      const res = await request(rest[0], { cookie: readCookie() });
      console.error('HTTP ' + res.status);
      process.stdout.write(res.body);
    } else if (cmd === 'post' && rest[0]) {
      const body = rest[1] ? JSON.parse(rest[1]) : {};
      const res = await request(rest[0], { method: 'POST', cookie: readCookie(), body });
      console.error('HTTP ' + res.status);
      process.stdout.write(res.body);
    } else {
      console.log('usage: node zt.js login | get <path> | post <path> [jsonBody]');
      console.log('jsonBody values may be arrays to repeat a key, e.g. {"stories[]":["363","366"]}');
    }
  })().catch((e) => { console.error('ERROR ' + e.message); process.exit(1); });
}
