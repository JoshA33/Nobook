const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');
const read = name => readFileSync(join(__dirname, '../app/src/main/res/raw', `${name}.js`), 'utf8');
const pause = () => new Promise(resolve => setTimeout(resolve, 50));
function page(path = '/reel/123', html = '') {
  const dom = new JSDOM(html, { url: `https://www.facebook.com${path}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.isFeed = () => false;
  w.alert = () => {};
  w.console.error = () => {};
  const observers = [];
  const Observer = w.MutationObserver;
  w.MutationObserver = class extends Observer {
    constructor(callback) { super(callback); observers.push(this); }
  };
  const close = w.close.bind(w);
  w.close = () => { observers.forEach(observer => observer.disconnect()); close(); };
  return dom;
}
function rect(el, x, y, width, height) {
  el.getBoundingClientRect = () => ({ left: x, top: y, right: x+width, bottom: y+height, width, height });
}
test('upload previews and MediaSource URLs do not trigger downloads', async () => {
  const dom = page('/');
  const w = dom.window;
  const original = () => 'blob:preview';
  w.URL.createObjectURL = original;
  let downloads = 0;
  w.DownloadBridge = { downloadBase64File: () => downloads++ };
  w.eval(read('scripts'));
  assert.equal(w.URL.createObjectURL, original);
  w.URL.createObjectURL(new w.Blob(['image']));
  w.URL.createObjectURL({ mediaSource: true });
  await pause();
  assert.equal(downloads, 0);
  dom.window.close();
});
test('explicit blob download still saves once', async () => {
  const dom = page('/', '<a download href="blob:test"><span>Save</span></a>');
  const w = dom.window;
  let downloads = 0;
  w.DownloadBridge = { downloadBase64File: () => downloads++ };
  w.fetch = async () => ({ ok: true, blob: async () => new w.Blob(['pdf'], { type: 'application/pdf' }) });
  w.eval(read('scripts'));
  w.document.querySelector('span').click();
  await pause();
  assert.equal(downloads, 1);
  dom.window.close();
});
test('partially visible video wins over fully visible avatar and uses currentSrc', async () => {
  const dom = page('/reel/123', '<div role="dialog"><img src="https://fbcdn.net/avatar.webp"><video></video></div>');
  const w = dom.window;
  const video = w.document.querySelector('video');
  rect(video, 0, -100, 600, 900);
  rect(w.document.querySelector('img'), 0, 0, 200, 200);
  Object.defineProperty(video, 'currentSrc', { value: 'https://fbcdn.net/clip.mp4' });
  const urls = [];
  let downloads = 0;
  w.fetch = async url => { urls.push(url); return { ok: true, blob: async () => new w.Blob(['video'], { type: 'video/mp4' }) }; };
  w.DownloadBridge = { downloadBase64File: () => downloads++ };
  w.eval(read('download_content'));
  await pause();
  const button = w.document.querySelector('#nobook-global-downloader');
  assert.ok(button.classList.contains('visible'));
  button.click(); button.click();
  await pause();
  assert.deepEqual(urls, ['https://fbcdn.net/clip.mp4']);
  assert.equal(downloads, 1);
  dom.window.close();
});
test('unavailable video never falls back to downloading an avatar', async () => {
  const dom = page('/reel/123', '<img src="https://fbcdn.net/avatar.webp"><video></video>');
  const w = dom.window;
  rect(w.document.querySelector('video'), 0, 0, 600, 600);
  rect(w.document.querySelector('img'), 0, 0, 200, 200);
  let fetches = 0;
  w.fetch = async () => { fetches++; throw Error('unexpected fetch'); };
  w.eval(read('download_content'));
  await pause();
  w.document.querySelector('button').click();
  await pause();
  assert.equal(fetches, 0);
  dom.window.close();
});
test('failed downloads can be retried and HTTP error bodies are not saved', async () => {
  const dom = page('/videos/123', '<video src="https://fbcdn.net/clip.mp4"></video>');
  const w = dom.window;
  rect(w.document.querySelector('video'), 0, 0, 600, 600);
  let attempts = 0, downloads = 0;
  w.fetch = async () => ({ ok: ++attempts > 1, status: 403, blob: async () => new w.Blob(['video'], { type: 'video/mp4' }) });
  w.DownloadBridge = { downloadBase64File: () => downloads++ };
  w.eval(read('download_content'));
  await pause();
  w.document.querySelector('button').click();
  await pause();
  assert.equal(downloads, 0);
  w.document.querySelector('button').click();
  await pause();
  assert.equal(downloads, 1);
  dom.window.close();
});

test('desktop ad labels support Arabic and Thai without hiding ordinary captions', async () => {
  const dom = page('/', '<article role="article" id="arabic"><a aria-label="مُموَّل"></a></article><article role="article" id="thai"><a aria-label="ได้รับการสนับสนุน"></a></article><article role="article" id="normal"><p>Sponsored research is useful</p></article>');
  const w = dom.window;
  w.isDesktopMode = () => true;
  w.eval(read('adblock'));
  assert.equal(w.document.querySelector('#arabic').style.display, 'none');
  assert.equal(w.document.querySelector('#thai').style.display, 'none');
  assert.notEqual(w.document.querySelector('#normal').style.display, 'none');
  const article = w.document.createElement('article');
  article.setAttribute('role', 'article');
  w.document.body.appendChild(article);
  article.innerHTML = '<a aria-label="Sponsored"></a>';
  await pause();
  assert.equal(article.style.display, 'none');
  dom.window.close();
});

test('mobile ad labels match Unicode and do not match words within captions', () => {
  const dom = page('/', '<div class="vertically-snappable" id="ad"><span>مُموَّل</span></div><div class="vertically-snappable" id="normal"><span>This is an Ad about art</span></div>');
  const w = dom.window;
  w.isDesktopMode = () => false;
  w.IntersectionObserver = class { observe() {} unobserve() {} };
  w.eval(read('adblock'));
  assert.equal(w.document.querySelector('#ad').dataset.adHidden, 'true');
  assert.equal(w.document.querySelector('#normal').dataset.adHidden, undefined);
  dom.window.close();
});
