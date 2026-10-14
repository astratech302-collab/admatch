import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isSameOriginRequest} from '../lib/request-origin';
const request=(url:string,headers:Record<string,string>)=>new Request(url,{method:'POST',headers});
test('browser mutations accept incoming Host when Next uses internal localhost URL',()=>{
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{
    Host:'127.0.0.1:3000',Origin:'http://127.0.0.1:3000','Sec-Fetch-Site':'same-origin'
  })),true);
});
test('same-origin event mutations and localhost URLs are accepted',()=>{
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/events',{
    Host:'localhost:3000',Origin:'http://localhost:3000'
  })),true);
});
test('cross-origin, incorrect port/protocol, malformed and null origins stay rejected',()=>{
  for(const origin of ['https://attacker.example','http://127.0.0.1:3001','https://127.0.0.1:3000','null','not-a-url','http://127.0.0.1:3000/path']){
    assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{Host:'127.0.0.1:3000',Origin:origin})),false,origin);
  }
});
test('spoofed forwarded hostname does not authorise a foreign origin',()=>{
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{
    Host:'127.0.0.1:3000',Origin:'https://attacker.example','X-Forwarded-Host':'attacker.example','X-Forwarded-Proto':'https'
  })),false);
});
test('cross-site fetch metadata is rejected even without Origin',()=>{
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{'Sec-Fetch-Site':'cross-site'})),false);
});
test('local tools without Origin and requests without Host remain supported',()=>{
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{})),true);
  assert.equal(isSameOriginRequest(request('http://localhost:3000/api/manage',{Origin:'http://localhost:3000'})),true);
});
