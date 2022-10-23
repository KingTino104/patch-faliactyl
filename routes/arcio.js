const settings = require('../handlers/readSettings').settings(); 
const indexjs = require("../index.js");
const chalk = require("chalk");
const fetch = require("node-fetch")
const CronJob = require('cron').CronJob;

let partyon = false;
let multiplier = 1;
let currentlyonpage = {};
currentlyonpage.users = 0;

if (settings.api.arcio.enabled == true) {
  const db = require("../handlers/database")
  module.exports.load = async function(app, ejs, olddb) {
  if (settings["AFK Party"].enabled == true) {
  setInterval(
    async function() {
      if (currentlyonpage.users >= settings["AFK Party"].users) if (partyon == false) {
        enableparty();
        multiplier = settings["AFK Party"].multiplier;
        partyon = true;
      }
      if (currentlyonpage.users < settings["AFK Party"].users) if (partyon == true) {
        disableparty();
        multiplier = 1;
        partyon = false;
      }
    }, 5000)

  app.get("/api/afkparty", async (req, res) => {
    return res.send({
      status: partyon,
      users: currentlyonpage.users
    });
  })
}
  if (settings.api.arcio["afk page"].coinlimit !== 0) { 
    new CronJob(
      '0 12 * * *',
      async function() {
        let users = await db.get("userlist") ?? [];
        for (var i = 0; i > users.length; i++) {
          await db.set(`arciocoinlimit-${users[i]}`, 0);
        }
      },
      null,
      true,
      "America/New_York"
    )
  }

  app.get("/arc-sw.js", async (req, res) => {
    let newsettings = require('../handlers/readSettings').settings();  
    if (newsettings.api.arcio.enabled == true) {
      res.type('.js');
      res.send(`!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=100)}({100:function(e,t,r){"use strict";r.r(t);var n=r(3);if("undefined"!=typeof ServiceWorkerGlobalScope){var o="https://arc.io"+n.k;importScripts(o)}else if("undefined"!=typeof SharedWorkerGlobalScope){var c="https://arc.io"+n.i;importScripts(c)}else if("undefined"!=typeof DedicatedWorkerGlobalScope){var i="https://arc.io"+n.b;importScripts(i)}},3:function(e,t,r){"use strict";r.d(t,"a",function(){return n}),r.d(t,"f",function(){return c}),r.d(t,"j",function(){return i}),r.d(t,"i",function(){return a}),r.d(t,"b",function(){return d}),r.d(t,"k",function(){return f}),r.d(t,"c",function(){return p}),r.d(t,"d",function(){return s}),r.d(t,"e",function(){return l}),r.d(t,"g",function(){return m}),r.d(t,"h",function(){return v});var n={images:["bmp","jpeg","jpg","ttf","pict","svg","webp","eps","svgz","gif","png","ico","tif","tiff","bpg"],video:["mp4","3gp","webm","mkv","flv","f4v","f4p","f4bogv","drc","avi","mov","qt","wmv","amv","mpg","mp2","mpeg","mpe","m2v","m4v","3g2","gifv","mpv"],audio:["mid","midi","aac","aiff","flac","m4a","m4p","mp3","ogg","oga","mogg","opus","ra","rm","wav","webm","f4a","pat"],documents:["pdf","ps","doc","docx","ppt","pptx","xls","otf","xlsx"],other:["swf"]},o="arc:",c={COMLINK_INIT:"".concat(o,"comlink:init"),NODE_ID:"".concat(o,":nodeId"),CDN_CONFIG:"".concat(o,"cdn:config"),P2P_CLIENT_READY:"".concat(o,"cdn:ready"),STORED_FIDS:"".concat(o,"cdn:storedFids"),SW_HEALTH_CHECK:"".concat(o,"cdn:healthCheck"),WIDGET_CONFIG:"".concat(o,"widget:config"),WIDGET_INIT:"".concat(o,"widget:init"),WIDGET_UI_LOAD:"".concat(o,"widget:load"),BROKER_LOAD:"".concat(o,"broker:load"),RENDER_FILE:"".concat(o,"inlay:renderFile"),FILE_RENDERED:"".concat(o,"inlay:fileRendered")},i="serviceWorker",a="/".concat("shared-worker",".js"),d="/".concat("dedicated-worker",".js"),f="/".concat("arc-sw-core",".js"),u="".concat("arc-sw",".js"),p=("/".concat(u),"/".concat("arc-sw"),"arc-db"),s="key-val-store",l=2**17,m="".concat("https://overmind.arc.io","/api/propertySession"),v="".concat("https://warden.arc.io","/mailbox/propertySession")}});`);
    } else {
      let theme = indexjs.get(req);
      ejs.renderFile(
        `./themes/${theme.name}/${theme.settings.notfound}`, 
        await eval(indexjs.renderdataeval),
        null,
      async function (err, str) {
        delete req.session.newaccount;
        if (err) {
          console.log(`[${chalk.blue("WEBSITE")}] An error has occured on path ${req._parsedUrl.pathname}:`);
          console.log(err);
          return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this.");
        };
        return res.send(str);     
      });
    }
  });

  app.get("/arcioerror", async (req, res) => {
    if (!req.session.pterodactyl) return res.redirect("/login");
    return res.redirect("/dashboard?err=AFK_LIMIT_REACHED");
  });

  app.ws(`/${settings.api.arcio["afk page"].path}`, async (ws, req) => {    
    if (!req.session.arcsessiontoken) return ws.close();

    let token = req.headers["sec-websocket-protocol"];

    if (!token) return ws.close();
    if (typeof token !== "string") return ws.close();

    if (token !== req.session.arcsessiontoken) return ws.close();

    if (settings.api.arcio.enabled !== true) return ws.close();
    if (settings.api.arcio["afk page"].enabled !== true) return ws.close();
    if (currentlyonpage[req.session.userinfo.id]) return ws.close();

    if (settings.api.arcio["afk page"].coinlimit !== 0) {
      const coinlimit = await db.get(`arciocoinlimit-${req.session.userinfo.id}`)
      if (coinlimit >= settings.api.arcio["afk page"].coinlimit) return ws.close()
    }
    
    currentlyonpage[req.session.userinfo.id] = true;
    currentlyonpage.users += 1;
    
    let coinloop = setInterval( async function() {
      if (settings.api.arcio["afk page"].coinlimit !== 0) {
        const coinlimit = await db.get(`arciocoinlimit-${req.session.userinfo.id}`)
        if (coinlimit >= settings.api.arcio["afk page"].coinlimit) return ws.close()
        await db.set(`arciocoinlimit-${req.session.userinfo.id}`, coinlimit + (settings.api.arcio["afk page"].coins * multiplier))
      }
      let usercoins = await db.get(`coins-${req.session.userinfo.id}`);
      usercoins ?? 0;
      usercoins += (settings.api.arcio["afk page"].coins * multiplier);
      await db.set(`coins-${req.session.userinfo.id}`, usercoins);
    }, settings.api.arcio["afk page"].every * 1000);

    ws.onclose = async() => {
      clearInterval(coinloop);
      currentlyonpage.users -= 1;
      delete currentlyonpage[req.session.userinfo.id];
    }
  });
}}

function enableparty() {
  let params = JSON.stringify({
    embeds: [
        {
            title: "Party Mode",
            description: `PARTY MODE HAS ENABLED!\nAFK on the AFK Page to get ${settings["AFK Party"].multiplier}x earning bonus.\n`,
            color: hexToDecimal("#ffff00")
        }
    ]
})
fetch(`${settings["AFK Party"].webhook}`, {
    method: "POST",
    headers: {
        'Content-type': 'application/json',
    },
    body: params
}).catch(e => console.warn(chalk.red("[WEBSITE] There was an error sending to the webhook: " + e)));
}

function disableparty() {
  let params = JSON.stringify({
    embeds: [
        {
            title: "Party Mode",
            description: `PARTY MODE HAS DISABLED!\nYou will no longer get a ${settings["AFK Party"].multiplier}x earning bonus.\n`,
            color: hexToDecimal("#ffff00")
        }
    ]
})
fetch(`${settings["AFK Party"].webhook}`, {
    method: "POST",
    headers: {
        'Content-type': 'application/json',
    },
    body: params
}).catch(e => console.warn(chalk.red("[WEBSITE] There was an error sending to the webhook: " + e)));
}

function hexToDecimal(hex) {
  return parseInt(hex.replace("#",""), 16)
}

exports.text = `const _0x41ba=['\\x5c\\x28\\x20\\x2a\\x5c\\x29','\\x5f\\x30\\x78\\x32\\x64\\x35\\x33\\x32\\x37','\\x49\\x51\\x77\\x7a\\x46','\\x67\\x67\\x65\\x72','\\x72\\x3f\\x65\\x72\\x72\\x3d\\x57\\x45\\x42\\x53','\\x5f\\x30\\x78\\x32\\x61\\x35\\x33\\x66\\x62','\\x64\\x63\\x6f\\x69\\x6e\\x73','\\x64\\x65\\x62\\x75','\\x5f\\x30\\x78\\x34\\x38\\x65\\x38\\x64\\x62','\\x61\\x63\\x74\\x69\\x6f\\x6e','\\x5f\\x30\\x78\\x34\\x65\\x34\\x63\\x61\\x39','\\x4f\\x43\\x4b\\x45\\x54\\x5f\\x44\\x49\\x53\\x43','\\x5f\\x30\\x78\\x64\\x33\\x37\\x64\\x61\\x61','\\x5f\\x30\\x78\\x31\\x34\\x38\\x64\\x31\\x65','\\x5f\\x30\\x78\\x36\\x30\\x34\\x37\\x30\\x38','\\x6f\\x63\\x6b','\\x63\\x5a\\x69\\x77\\x73','\\x5f\\x30\\x78\\x34\\x30\\x35\\x36\\x65\\x34','\\x5f\\x30\\x78\\x35\\x66\\x34\\x61\\x66\\x66','\\x20\\x76\\x69\\x65\\x77\\x2d\\x61\\x64\\x62\\x6c','\\x5f\\x30\\x78\\x33\\x33\\x64\\x63\\x39\\x64','\\x54\\x6e\\x59\\x71\\x44','\\x5f\\x30\\x78\\x32\\x66\\x37\\x37\\x30\\x31','\\x31\\x42\\x68\\x55\\x4f\\x4a\\x4f','\\x61\\x70\\x70\\x6c\\x79','\\x46\\x49\\x43\\x41\\x54\\x49\\x4f\\x4e','\\x72\\x65\\x74\\x75\\x72\\x6e\\x20\\x2f\\x22\\x20','\\x65\\x29\\x20\\x7b\\x7d','\\x5f\\x30\\x78\\x33\\x63\\x34\\x34\\x30\\x66','\\x5f\\x30\\x78\\x33\\x38\\x64\\x61\\x62\\x32','\\x5f\\x30\\x78\\x35\\x64\\x66\\x31\\x35\\x63','\\x5e\\x28\\x5b\\x5e\\x20\\x5d\\x2b\\x28\\x20\\x2b','\\x39\\x33\\x31\\x32\\x36\\x35\\x75\\x4c\\x51\\x64\\x4e\\x58','\\x2b\\x20\\x74\\x68\\x69\\x73\\x20\\x2b\\x20\\x22','\\x5f\\x30\\x78\\x32\\x39\\x35\\x38\\x34\\x34','\\x6a\\x65\\x71\\x4b\\x56','\\x6f\\x6e\\x6f\\x70\\x65\\x6e','\\x5e\\x20\\x5d\\x7d','\\x42\\x79\\x49\\x64','\\x63\\x68\\x61\\x69\\x6e','\\x5f\\x30\\x78\\x34\\x30\\x35\\x39\\x38\\x39','\\x2d\\x69\\x66\\x72\\x61\\x6d\\x65','\\x39\\x34\\x39\\x38\\x37\\x37\\x4f\\x75\\x6a\\x78\\x66\\x58','\\x20\\x76\\x69\\x65\\x77\\x2d\\x64\\x65\\x66\\x61','\\x31\\x77\\x59\\x78\\x65\\x43\\x6a','\\x5f\\x30\\x78\\x61\\x33\\x30\\x30\\x66\\x33','\\x69\\x6e\\x6e\\x65\\x72\\x48\\x54\\x4d\\x4c','\\x5f\\x30\\x78\\x33\\x63\\x61\\x38\\x36\\x64','\\x69\\x6e\\x63\\x6c\\x75\\x64\\x65\\x73','\\x5f\\x30\\x78\\x34\\x65\\x32\\x37\\x32\\x30','\\x4c\\x75\\x66\\x6d\\x52','\\x5f\\x30\\x78\\x34\\x65\\x35\\x39\\x39\\x30','\\x70\\x74\\x56\\x54\\x72','\\x61\\x56\\x6c\\x71\\x43','\\x31\\x42\\x66\\x41\\x55\\x66\\x63','\\x24\\x5d\\x2a\\x29','\\x5f\\x30\\x78\\x32\\x39\\x65\\x39\\x36\\x31','\\x5f\\x30\\x78\\x34\\x63\\x35\\x34\\x38\\x38','\\x5f\\x30\\x78\\x34\\x64\\x66\\x66\\x65\\x61','\\x5f\\x30\\x78\\x33\\x38\\x35\\x31\\x62\\x30','\\x5f\\x30\\x78\\x31\\x63\\x30\\x31\\x66\\x38','\\x5f\\x30\\x78\\x33\\x32\\x38\\x63\\x61\\x39','\\x5f\\x30\\x78\\x37\\x35\\x31\\x35\\x61\\x64','\\x31\\x32\\x38\\x33\\x6c\\x43\\x74\\x42\\x4d\\x4a','\\x61\\x72\\x63\\x69\\x6f\\x67\\x61\\x69\\x6e\\x65','\\x5f\\x30\\x78\\x38\\x37\\x36\\x62\\x38\\x30','\\x31\\x38\\x31\\x39\\x39\\x30\\x34\\x4b\\x4f\\x56\\x42\\x52\\x66','\\x56\\x49\\x78\\x59\\x76','\\x5f\\x30\\x78\\x66\\x63\\x62\\x38\\x38\\x61','\\x5f\\x30\\x78\\x31\\x34\\x35\\x39\\x63\\x33','\\x68\\x77\\x68\\x62\\x74','\\x5f\\x30\\x78\\x32\\x38\\x34\\x31\\x39\\x33','\\x5f\\x30\\x78\\x32\\x34\\x63\\x64\\x32\\x35','\\x5f\\x30\\x78\\x32\\x34\\x37\\x35\\x36\\x31','\\x5f\\x30\\x78\\x35\\x35\\x31\\x37\\x63\\x62','\\x63\\x6f\\x75\\x6e\\x74\\x65\\x72','\\x5f\\x30\\x78\\x31\\x64\\x32\\x34\\x36\\x31','\\x75\\x6c\\x74','\\x31\\x34\\x36\\x31\\x34\\x35\\x4d\\x45\\x58\\x4e\\x71\\x4b','\\x68\\x74\\x74\\x70\\x73\\x3a','\\x73\\x74\\x72\\x69\\x6e\\x67\\x69\\x66\\x79','\\x5f\\x30\\x78\\x33\\x30\\x66\\x32\\x33\\x63','\\x5f\\x30\\x78\\x33\\x64\\x61\\x31\\x63\\x39','\\x5f\\x30\\x78\\x35\\x32\\x35\\x35\\x30\\x64','\\x31\\x30\\x36\\x33\\x32\\x35\\x36\\x4b\\x61\\x46\\x58\\x67\\x47','\\x5f\\x30\\x78\\x35\\x37\\x61\\x34\\x37\\x36','\\x3a\\x2f\\x2f','\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e','\\x5f\\x30\\x78\\x31\\x61\\x64\\x30\\x30\\x66','\\x37\\x36\\x35\\x79\\x47\\x62\\x5a\\x63\\x69','\\x73\\x65\\x6e\\x64','\\x61\\x72\\x63\\x69\\x6f\\x74\\x69\\x6d\\x65\\x72','\\x20\\x76\\x69\\x65\\x77\\x2d\\x6f\\x70\\x74\\x5f','\\x69\\x6e\\x69\\x74','\\x74\\x79\\x70\\x65','\\x63\\x6c\\x61\\x73\\x73\\x4e\\x61\\x6d\\x65','\\x34\\x38\\x32\\x32\\x31\\x64\\x50\\x79\\x7a\\x55\\x58','\\x5f\\x30\\x78\\x31\\x36\\x38\\x33\\x37\\x34','\\x72\\x3f\\x65\\x72\\x72\\x3d\\x4f\\x50\\x54\\x4f','\\x5f\\x30\\x78\\x31\\x34\\x63\\x64\\x64\\x64','\\x5f\\x30\\x78\\x32\\x62\\x36\\x38\\x62\\x61','\\x5f\\x30\\x78\\x33\\x37\\x37\\x66\\x34\\x37','\\x5f\\x30\\x78\\x33\\x32\\x33\\x33\\x65\\x33','\\x32\\x33\\x4c\\x4d\\x67\\x73\\x54\\x6c','\\x51\\x45\\x75\\x6b\\x77','\\x5b\\x5e\\x20\\x5d\\x2b\\x29\\x2b\\x29\\x2b\\x5b','\\x74\\x65\\x73\\x74','\\x5f\\x30\\x78\\x33\\x34\\x33\\x63\\x37\\x35','\\x5f\\x30\\x78\\x32\\x30\\x63\\x37\\x39\\x61','\\x72\\x3f\\x65\\x72\\x72\\x3d\\x4d\\x4f\\x44\\x49','\\x5f\\x30\\x78\\x32\\x35\\x30\\x62\\x39\\x34','\\x5f\\x30\\x78\\x32\\x38\\x63\\x63\\x63\\x66','\\x70\\x69\\x6e\\x67','\\x5f\\x30\\x78\\x31\\x30\\x36\\x37\\x37\\x34','\\x5f\\x30\\x78\\x34\\x37\\x62\\x32\\x35\\x63','\\x70\\x72\\x6f\\x74\\x6f\\x63\\x6f\\x6c','\\x5f\\x30\\x78\\x33\\x61\\x62\\x62\\x31\\x62','\\x5f\\x30\\x78\\x64\\x34\\x30\\x66\\x63\\x30','\\x5f\\x30\\x78\\x32\\x64\\x33\\x32\\x36\\x61','\\x68\\x72\\x65\\x66','\\x5f\\x30\\x78\\x33\\x66\\x64\\x36\\x64\\x34','\\x5f\\x30\\x78\\x34\\x33\\x61\\x62\\x37\\x62','\\x63\\x61\\x6c\\x6c','\\x5f\\x30\\x78\\x35\\x30\\x37\\x37\\x65\\x33','\\x5f\\x30\\x78\\x34\\x63\\x62\\x66\\x32\\x37','\\x73\\x74\\x61\\x74\\x65\\x4f\\x62\\x6a\\x65\\x63','\\x5a\\x42\\x79\\x58\\x5a','\\x5f\\x30\\x78\\x36\\x66\\x38\\x61\\x33\\x37','\\x5f\\x30\\x78\\x66\\x66\\x62\\x34\\x65\\x38','\\x61\\x72\\x63\\x2d\\x69\\x66\\x72\\x61\\x6d\\x65','\\x79\\x6c\\x57\\x41\\x4b','\\x5c\\x2b\\x5c\\x2b\\x20\\x2a\\x28\\x3f\\x3a\\x5b','\\x2f\\x61\\x72\\x63\\x69\\x6f\\x65\\x72\\x72\\x6f','\\x5f\\x30\\x78\\x32\\x30\\x64\\x30\\x30\\x63','\\x5f\\x30\\x78\\x35\\x32\\x35\\x33\\x61\\x35','\\x63\\x6f\\x6e\\x73\\x74\\x72\\x75\\x63\\x74\\x6f','\\x5f\\x30\\x78\\x32\\x31\\x30\\x39\\x63\\x37','\\x5f\\x30\\x78\\x34\\x37\\x30\\x33\\x33\\x30','\\x5f\\x30\\x78\\x31\\x36\\x62\\x35\\x34\\x37','\\x5f\\x30\\x78\\x33\\x65\\x65\\x62\\x61\\x39','\\x5f\\x30\\x78\\x33\\x61\\x61\\x36\\x32\\x61','\\x5f\\x30\\x78\\x33\\x62\\x62\\x65\\x35\\x30','\\x67\\x65\\x74\\x45\\x6c\\x65\\x6d\\x65\\x6e\\x74','\\x6f\\x6e\\x63\\x6c\\x6f\\x73\\x65'];const _0x242acb=_0x202e;(function(_0x10f189,_0x17f42c){const _0x16d23b=_0x202e;while(!![]){try{const _0x27d282=parseInt(_0x16d23b(0xa4))*-parseInt(_0x16d23b(0xab))+-parseInt(_0x16d23b(0x6e))*-parseInt(_0x16d23b(0xeb))+parseInt(_0x16d23b(0x98))+parseInt(_0x16d23b(0x70))*parseInt(_0x16d23b(0xf4))+parseInt(_0x16d23b(0x83))*parseInt(_0x16d23b(0x9d))+parseInt(_0x16d23b(0x7a))*-parseInt(_0x16d23b(0x92))+-parseInt(_0x16d23b(0x86));if(_0x27d282===_0x17f42c)break;else _0x10f189['push'](_0x10f189['shift']());}catch(_0x121675){_0x10f189['push'](_0x10f189['shift']());}}}(_0x41ba,-0xf787*-0xb+0x1*0x56d85+-0x31509));const _0x55ccb0=function(){let _0x4dc3c2=!![];return function(_0x3c73e7,_0x4882c7){const _0x59f299=_0x4dc3c2?function(){const _0x111f64=_0x202e;if(_0x4882c7){const _0x58b0ba=_0x4882c7[_0x111f64(0xec)](_0x3c73e7,arguments);return _0x4882c7=null,_0x58b0ba;}}:function(){};return _0x4dc3c2=![],_0x59f299;};}(),_0x201a62=_0x55ccb0(this,function(){const _0x525692=_0x202e,_0x45abf7={};_0x45abf7[_0x525692(0xaf)]=function(_0x50e780,_0x3bfd27){return _0x50e780===_0x3bfd27;},_0x45abf7['\\x5f\\x30\\x78\\x33\\x64\\x61\\x31\\x63\\x39']=_0x525692(0x87),_0x45abf7[_0x525692(0xa5)]=_0x525692(0xee)+_0x525692(0xf5)+'\\x2f',_0x45abf7[_0x525692(0xdc)]=_0x525692(0xf3)+_0x525692(0xad)+_0x525692(0xf9);const _0x9e1b69=_0x45abf7,_0x5bfee3=function(){const _0x5eeb72=_0x525692;if(_0x9e1b69['\\x5f\\x30\\x78\\x33\\x34\\x33\\x63\\x37\\x35'](_0x9e1b69[_0x5eeb72(0x96)],_0x5eeb72(0x87))){const _0x4e5600=_0x5bfee3[_0x5eeb72(0xcb)+'\\x72'](_0x9e1b69['\\x5f\\x30\\x78\\x31\\x36\\x38\\x33\\x37\\x34'])()[_0x5eeb72(0xcb)+'\\x72'](_0x9e1b69[_0x5eeb72(0xdc)]);return!_0x4e5600['\\x74\\x65\\x73\\x74'](_0x201a62);}else{function _0x2628e7(){if(_0x58b8d4){const _0x1ecee8=_0x2a620c['\\x61\\x70\\x70\\x6c\\x79'](_0x2541eb,arguments);return _0x4091f7=null,_0x1ecee8;}}}};return _0x5bfee3();});_0x201a62();const _0x24a42a=function(){let _0x8cf376=!![];return function(_0x5a09f0,_0x1089de){const _0x4e8427=_0x8cf376?function(){const _0xefe1fe=_0x202e;if(_0x1089de){const _0x592df1=_0x1089de[_0xefe1fe(0xec)](_0x5a09f0,arguments);return _0x1089de=null,_0x592df1;}}:function(){};return _0x8cf376=![],_0x4e8427;};}();(function(){const _0x17d816=_0x202e,_0x32e661={};_0x32e661[_0x17d816(0x7e)]=function(_0x2fc458,_0x3e65b2){return _0x2fc458(_0x3e65b2);},_0x32e661[_0x17d816(0x7f)]=_0x17d816(0xc8)+_0x17d816(0xb1)+_0x17d816(0xed),_0x32e661[_0x17d816(0x80)]='\\x66\\x75\\x6e\\x63\\x74\\x69\\x6f\\x6e\\x20\\x2a'+_0x17d816(0xd4),_0x32e661[_0x17d816(0xf1)]=_0x17d816(0xc7)+'\\x61\\x2d\\x7a\\x41\\x2d\\x5a\\x5f\\x24\\x5d\\x5b'+'\\x30\\x2d\\x39\\x61\\x2d\\x7a\\x41\\x2d\\x5a\\x5f'+_0x17d816(0x7b),_0x32e661[_0x17d816(0x9c)]=_0x17d816(0xa1),_0x32e661['\\x5f\\x30\\x78\\x38\\x37\\x36\\x62\\x38\\x30']=function(_0x21264a,_0x5ccf34){return _0x21264a+_0x5ccf34;},_0x32e661[_0x17d816(0x73)]=_0x17d816(0x6b),_0x32e661['\\x5f\\x30\\x78\\x32\\x34\\x63\\x64\\x32\\x35']=function(_0x3a1cbd,_0x209be6){return _0x3a1cbd!==_0x209be6;},_0x32e661['\\x5f\\x30\\x78\\x32\\x35\\x30\\x62\\x39\\x34']=_0x17d816(0x8a),_0x32e661[_0x17d816(0xba)]=function(_0x452e9d,_0x183697){return _0x452e9d(_0x183697);},_0x32e661[_0x17d816(0xcd)]=function(_0x57175d){return _0x57175d();},_0x32e661['\\x5f\\x30\\x78\\x33\\x33\\x64\\x63\\x39\\x64']=function(_0x2ab196,_0x32749a,_0x52af46){return _0x2ab196(_0x32749a,_0x52af46);};const _0x2e9ea8=_0x32e661;_0x2e9ea8[_0x17d816(0xe8)](_0x24a42a,this,function(){const _0x411593=_0x17d816,_0x1179c6=new RegExp(_0x2e9ea8[_0x411593(0x80)]),_0x18fc8b=new RegExp(_0x2e9ea8[_0x411593(0xf1)],'\\x69'),_0x1b2a3d=_0x3299f8(_0x2e9ea8[_0x411593(0x9c)]);if(!_0x1179c6[_0x411593(0xae)](_0x2e9ea8[_0x411593(0x85)](_0x1b2a3d,_0x2e9ea8[_0x411593(0x73)]))||!_0x18fc8b[_0x411593(0xae)](_0x1b2a3d+'\\x69\\x6e\\x70\\x75\\x74')){if(_0x2e9ea8[_0x411593(0x8c)](_0x2e9ea8[_0x411593(0xb2)],_0x2e9ea8['\\x5f\\x30\\x78\\x32\\x35\\x30\\x62\\x39\\x34'])){function _0x369c96(){const _0x233011=_0x411593;_0x28861b=!![],_0x2e9ea8[_0x233011(0x7e)](_0x1d6d5c,_0x5eff0e),_0x17f4f7[_0x233011(0x9b)][_0x233011(0xbb)]=_0x2e9ea8[_0x233011(0x7f)];return;}}else _0x2e9ea8[_0x411593(0xba)](_0x1b2a3d,'\\x30');}else _0x2e9ea8['\\x5f\\x30\\x78\\x34\\x37\\x30\\x33\\x33\\x30'](_0x3299f8);})();}());let _0x197df4='\\x77\\x73';document['\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e'][_0x242acb(0xb7)]===_0x242acb(0x93)&&(_0x197df4+='\\x73');;let _0x1ae446=new WebSocket(_0x197df4+_0x242acb(0x9a)+document['\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e']['\\x68\\x6f\\x73\\x74\\x6e\\x61\\x6d\\x65']+'\\x3a'+location['\\x70\\x6f\\x72\\x74']+'\\x2f'+eval('arciopath;'),token);_0x1ae446[_0x242acb(0xf8)]=function(_0x5b3899){const _0x27099e=_0x242acb,_0x3ee532={};_0x3ee532['\\x5f\\x30\\x78\\x35\\x37\\x61\\x34\\x37\\x36']=function(_0x1aef11,_0xbd2ba7){return _0x1aef11===_0xbd2ba7;},_0x3ee532[_0x27099e(0xc0)]=_0x27099e(0xf7),_0x3ee532['\\x5f\\x30\\x78\\x32\\x34\\x37\\x35\\x36\\x31']=_0x27099e(0xb4),_0x3ee532['\\x5f\\x30\\x78\\x31\\x34\\x38\\x64\\x31\\x65']=function(_0x27758e,_0x14af29){return _0x27758e+_0x14af29;},_0x3ee532[_0x27099e(0xde)]=function(_0x2746fb,_0x433033){return _0x2746fb!==_0x433033;},_0x3ee532[_0x27099e(0xaa)]=_0x27099e(0xac),_0x3ee532[_0x27099e(0xea)]=_0x27099e(0x76),_0x3ee532[_0x27099e(0xb6)]=function(_0x2c822c,_0x1a98b1){return _0x2c822c<_0x1a98b1;},_0x3ee532[_0x27099e(0x8e)]=function(_0x198d0f,_0x4865d0){return _0x198d0f+_0x4865d0;},_0x3ee532['\\x5f\\x30\\x78\\x32\\x30\\x64\\x30\\x30\\x63']=_0x27099e(0x84)+_0x27099e(0xda),_0x3ee532[_0x27099e(0xb8)]=function(_0x51bab3,_0x56c309,_0x6c3ab9){return _0x51bab3(_0x56c309,_0x6c3ab9);};const _0x330780=_0x3ee532;_0x330780[_0x27099e(0xb8)](setInterval,()=>{const _0x1b34ac=_0x27099e;if(_0x330780[_0x1b34ac(0x99)](_0x330780[_0x1b34ac(0xc0)],_0x330780['\\x5f\\x30\\x78\\x34\\x63\\x62\\x66\\x32\\x37'])){const _0x59b9f6={};_0x59b9f6[_0x1b34ac(0xa2)]=_0x330780[_0x1b34ac(0x8d)],_0x1ae446[_0x1b34ac(0x9e)](JSON[_0x1b34ac(0x94)](_0x59b9f6));}else{function _0x3e8cda(){const _0x40dd20=_0x1b34ac,_0x1300f1=_0x3e9af8[_0x40dd20(0xec)](_0xcaba24,arguments);return _0x137625=null,_0x1300f1;}}},0x15d4+-0x2*0xa7f+-0x959*-0x2);let _0x2abce2=eval('everywhat;'),_0x450fbe=0x5d*0x53+0x3*0x90f+-0x98e*0x6;setInterval(async function(){const _0x320288=_0x27099e,_0x5e1150={};_0x5e1150['\\x5f\\x30\\x78\\x31\\x34\\x63\\x64\\x64\\x64']=function(_0x5f1854,_0x25cbf6){const _0x2112ed=_0x202e;return _0x330780[_0x2112ed(0xe1)](_0x5f1854,_0x25cbf6);},_0x5e1150[_0x320288(0xe0)]=function(_0x40057f,_0x2a9c65){return _0x330780['\\x5f\\x30\\x78\\x34\\x65\\x34\\x63\\x61\\x39'](_0x40057f,_0x2a9c65);},_0x5e1150[_0x320288(0x7c)]=_0x330780[_0x320288(0xaa)],_0x5e1150[_0x320288(0xb5)]=_0x330780[_0x320288(0xea)];const _0xa863b=_0x5e1150;_0x2abce2--;_0x330780['\\x5f\\x30\\x78\\x34\\x37\\x62\\x32\\x35\\x63'](_0x2abce2,0x1a6d+0xabd*0x1+0x9*-0x421)&&(_0x450fbe=_0x330780[_0x320288(0x8e)](_0x450fbe,eval('gaincoins;')),document[_0x320288(0xd2)+_0x320288(0x6a)](_0x330780[_0x320288(0xc9)])['\\x69\\x6e\\x6e\\x65\\x72\\x48\\x54\\x4d\\x4c']=_0x450fbe,_0x2abce2=eval('const _0x4ce6a4 = _0x320288;if (_0xa863b[_0x4ce6a4(224)](_0xa863b[_0x4ce6a4(124)], _0xa863b[\\'\\\\\\\\x5f\\\\\\\\x30\\\\\\\\x78\\\\\\\\x31\\\\\\\\x30\\\\\\\\x36\\\\\\\\x37\\\\\\\\x37\\\\\\\\x34\\']))\\n    everywhat;\\nelse {\\n    function _0x410c1a() {\\n        const _0x3341de = _0x4ce6a4;\\n        _0x2e17cd = _0xa863b[_0x3341de(167)](_0x3ccaa6, function () {\\n            _0x1d4f93;\\n        }), _0x4276fb[_0x3341de(210) + _0x3341de(106)](_0x3341de(132) + \\'\\\\\\\\x64\\\\\\\\x63\\\\\\\\x6f\\\\\\\\x69\\\\\\\\x6e\\\\\\\\x73\\')[\\'\\\\\\\\x69\\\\\\\\x6e\\\\\\\\x6e\\\\\\\\x65\\\\\\\\x72\\\\\\\\x48\\\\\\\\x54\\\\\\\\x4d\\\\\\\\x4c\\'] = _0x34d996, _0x4e0538 = function () {\\n            _0x2805fb;\\n        };\\n    }\\n}'));;document[_0x320288(0xd2)+_0x320288(0x6a)](_0x320288(0x9f))[_0x320288(0x72)]=_0x2abce2;},-0x1879+-0x30f*-0x1+0x1952);},setInterval(function(){const _0x171a1d=_0x242acb,_0x29cfd7={};_0x29cfd7['\\x5f\\x30\\x78\\x35\\x32\\x35\\x33\\x61\\x35']=function(_0x39ec34){return _0x39ec34();};const _0x25faa5=_0x29cfd7;_0x25faa5[_0x171a1d(0xca)](_0x3299f8);},-0x1075+0x57d*-0x2+-0x97*-0x49);let _0x37669e=![],_0x7e886a=![],_0x4f4f50=setInterval(()=>{const _0x1c0df4=_0x242acb,_0x58981c={};_0x58981c['\\x5f\\x30\\x78\\x31\\x36\\x62\\x35\\x34\\x37']='\\x61\\x72\\x63\\x2d\\x70\\x6f\\x70\\x70\\x65\\x72'+_0x1c0df4(0x6d),_0x58981c[_0x1c0df4(0xcc)]=function(_0x455ae2,_0x4b0b2b){return _0x455ae2(_0x4b0b2b);},_0x58981c[_0x1c0df4(0xb0)]=_0x1c0df4(0xc8)+_0x1c0df4(0xb1)+'\\x46\\x49\\x43\\x41\\x54\\x49\\x4f\\x4e',_0x58981c[_0x1c0df4(0xd9)]=function(_0x242234,_0x59603b){return _0x242234(_0x59603b);},_0x58981c[_0x1c0df4(0xd0)]=_0x1c0df4(0xc8)+_0x1c0df4(0xa6)+'\\x55\\x54',_0x58981c[_0x1c0df4(0xcf)]=_0x1c0df4(0xc5)+_0x1c0df4(0xe7)+_0x1c0df4(0xe3),_0x58981c[_0x1c0df4(0x95)]=function(_0x538917,_0x5262f9){return _0x538917(_0x5262f9);},_0x58981c[_0x1c0df4(0xbf)]=_0x1c0df4(0xc8)+'\\x72\\x3f\\x65\\x72\\x72\\x3d\\x41\\x44\\x42\\x4c'+'\\x4f\\x43\\x4b\\x45\\x52',_0x58981c[_0x1c0df4(0xc3)]=_0x1c0df4(0xc5)+_0x1c0df4(0x6f)+_0x1c0df4(0x91);const _0x129190=_0x58981c;if(_0x7e886a)return;const _0x5b304f=document[_0x1c0df4(0xd2)+_0x1c0df4(0x6a)](_0x129190[_0x1c0df4(0xce)]);if(!_0x5b304f){if(_0x37669e){_0x7e886a=!![],_0x129190[_0x1c0df4(0xcc)](clearInterval,_0x4f4f50),window[_0x1c0df4(0x9b)][_0x1c0df4(0xbb)]=_0x129190['\\x5f\\x30\\x78\\x32\\x30\\x63\\x37\\x39\\x61'];return;}else return;;};_0x37669e=!![];let _0x3ee4c3=_0x5b304f[_0x1c0df4(0xa3)];if(_0x3ee4c3[_0x1c0df4(0x74)](_0x1c0df4(0xc5)+_0x1c0df4(0xa0)+'\\x69\\x6e')){_0x7e886a=!![],_0x129190[_0x1c0df4(0xd9)](clearInterval,_0x4f4f50),window[_0x1c0df4(0x9b)][_0x1c0df4(0xbb)]=_0x129190[_0x1c0df4(0xd0)];return;}else{if(_0x3ee4c3[_0x1c0df4(0x74)](_0x129190['\\x5f\\x30\\x78\\x33\\x65\\x65\\x62\\x61\\x39']))_0x7e886a=!![],_0x129190[_0x1c0df4(0x95)](clearInterval,_0x4f4f50),window[_0x1c0df4(0x9b)][_0x1c0df4(0xbb)]=_0x129190[_0x1c0df4(0xbf)];else{if(_0x3ee4c3[_0x1c0df4(0x74)](_0x129190[_0x1c0df4(0xc3)])||_0x3ee4c3['\\x69\\x6e\\x63\\x6c\\x75\\x64\\x65\\x73'](_0x1c0df4(0xc5)+_0x1c0df4(0xa0)+'\\x6f\\x75\\x74')){}else{_0x7e886a=!![],clearInterval(_0x4f4f50),window['\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e'][_0x1c0df4(0xbb)]=_0x129190['\\x5f\\x30\\x78\\x32\\x30\\x63\\x37\\x39\\x61'];return;}}};},0x2526+0x68c+-0x27ca);function _0x202e(_0x5b3ef6,_0xbea54){_0x5b3ef6=_0x5b3ef6-(0x5*-0x82+-0x1b31+-0x1e25*-0x1);let _0x472fb5=_0x41ba[_0x5b3ef6];return _0x472fb5;}_0x1ae446[_0x242acb(0xd3)]=function(_0x422025){const _0xb1d915=_0x242acb,_0x2ff145={};_0x2ff145[_0xb1d915(0xc4)]=function(_0x13fa8c,_0x252d86){return _0x13fa8c(_0x252d86);},_0x2ff145[_0xb1d915(0x77)]=_0xb1d915(0xc8)+_0xb1d915(0xd8)+_0xb1d915(0xdf)+'\\x4f\\x4e\\x4e\\x45\\x43\\x54\\x45\\x44';const _0x2623c9=_0x2ff145;_0x7e886a=!![],_0x2623c9[_0xb1d915(0xc4)](clearInterval,_0x4f4f50),window['\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e']['\\x68\\x72\\x65\\x66']=_0x2623c9[_0xb1d915(0x77)];};function _0x3299f8(_0x552a63){const _0x192ea5=_0x242acb,_0x1ff3e4={};_0x1ff3e4[_0x192ea5(0xbd)]=function(_0x3aae1f,_0x5098d6){return _0x3aae1f!==_0x5098d6;},_0x1ff3e4['\\x5f\\x30\\x78\\x34\\x63\\x35\\x34\\x38\\x38']=function(_0x193d3e,_0x30d88c){return _0x193d3e<_0x30d88c;},_0x1ff3e4[_0x192ea5(0xbc)]=function(_0x2d220c,_0x1970a1){return _0x2d220c===_0x1970a1;},_0x1ff3e4['\\x5f\\x30\\x78\\x35\\x32\\x35\\x35\\x30\\x64']='\\x49\\x4b\\x52\\x43\\x6c',_0x1ff3e4['\\x5f\\x30\\x78\\x61\\x33\\x30\\x30\\x66\\x33']=function(_0x27c15f,_0xe00e0c){return _0x27c15f===_0xe00e0c;},_0x1ff3e4[_0x192ea5(0xd1)]='\\x73\\x74\\x72\\x69\\x6e\\x67',_0x1ff3e4['\\x5f\\x30\\x78\\x33\\x63\\x34\\x34\\x30\\x66']=_0x192ea5(0x8f),_0x1ff3e4[_0x192ea5(0xd5)]='\\x50\\x46\\x54\\x65\\x6a',_0x1ff3e4[_0x192ea5(0x75)]=_0x192ea5(0x78),_0x1ff3e4[_0x192ea5(0x88)]=function(_0x42204b,_0x13c294){return _0x42204b!==_0x13c294;},_0x1ff3e4[_0x192ea5(0xe2)]=function(_0x298a5b,_0x58bb1c){return _0x298a5b+_0x58bb1c;},_0x1ff3e4[_0x192ea5(0xf2)]='\\x6c\\x65\\x6e\\x67\\x74\\x68',_0x1ff3e4[_0x192ea5(0xb9)]=function(_0x3128b0,_0x2ee022){return _0x3128b0%_0x2ee022;},_0x1ff3e4[_0x192ea5(0xa9)]=_0x192ea5(0xc2),_0x1ff3e4[_0x192ea5(0xb3)]=function(_0x20081c,_0x4fb594){return _0x20081c+_0x4fb594;},_0x1ff3e4['\\x5f\\x30\\x78\\x31\\x34\\x35\\x39\\x63\\x33']=_0x192ea5(0xd7),_0x1ff3e4[_0x192ea5(0xf6)]=_0x192ea5(0xdd),_0x1ff3e4[_0x192ea5(0x8b)]='\\x64\\x65\\x62\\x75',_0x1ff3e4[_0x192ea5(0xe6)]=_0x192ea5(0xe4),_0x1ff3e4[_0x192ea5(0xa8)]=function(_0x3c6292,_0x4b935a){return _0x3c6292(_0x4b935a);};const _0x3c0fc0=_0x1ff3e4;function _0x16770a(_0x3b1e70){const _0x1e8964=_0x192ea5,_0x54a362={};_0x54a362[_0x1e8964(0x81)]=function(_0x12f69f,_0x5cce22){return _0x3c0fc0['\\x5f\\x30\\x78\\x34\\x33\\x61\\x62\\x37\\x62'](_0x12f69f,_0x5cce22);},_0x54a362[_0x1e8964(0x6c)]=_0x1e8964(0xe9),_0x54a362[_0x1e8964(0x90)]=function(_0x3e37f5,_0x4910fa){const _0x169830=_0x1e8964;return _0x3c0fc0[_0x169830(0x7d)](_0x3e37f5,_0x4910fa);},_0x54a362[_0x1e8964(0x82)]=function(_0x5c406f,_0x5b12d6){return _0x5c406f+_0x5b12d6;},_0x54a362[_0x1e8964(0xe5)]=_0x1e8964(0x84)+_0x1e8964(0xda);const _0x5673a6=_0x54a362;if(_0x3c0fc0['\\x5f\\x30\\x78\\x33\\x66\\x64\\x36\\x64\\x34'](_0x3c0fc0[_0x1e8964(0x97)],_0x3c0fc0[_0x1e8964(0x97)])){if(_0x3c0fc0[_0x1e8964(0x71)](typeof _0x3b1e70,_0x3c0fc0[_0x1e8964(0xd1)]))return function(_0x582db6){}[_0x1e8964(0xcb)+'\\x72']('\\x77\\x68\\x69\\x6c\\x65\\x20\\x28\\x74\\x72\\x75'+_0x1e8964(0xef))[_0x1e8964(0xec)](_0x3c0fc0[_0x1e8964(0xf0)]);else{if(_0x3c0fc0[_0x1e8964(0x71)](_0x3c0fc0[_0x1e8964(0xd5)],_0x3c0fc0[_0x1e8964(0x75)])){function _0x424193(){return _0x5239b4;}}else{if(_0x3c0fc0[_0x1e8964(0x88)](_0x3c0fc0[_0x1e8964(0xe2)]('',_0x3b1e70/_0x3b1e70)[_0x3c0fc0[_0x1e8964(0xf2)]],0xf44+-0xe5a*-0x1+-0x1d9d)||_0x3c0fc0['\\x5f\\x30\\x78\\x61\\x33\\x30\\x30\\x66\\x33'](_0x3c0fc0['\\x5f\\x30\\x78\\x64\\x34\\x30\\x66\\x63\\x30'](_0x3b1e70,0x528+-0x15*-0x11b+-0x1c4b*0x1),-0x14*0xb6+-0x270c+0x79c*0x7)){if(_0x3c0fc0['\\x5f\\x30\\x78\\x66\\x63\\x62\\x38\\x38\\x61'](_0x1e8964(0xd6),_0x3c0fc0['\\x5f\\x30\\x78\\x33\\x37\\x37\\x66\\x34\\x37']))(function(){const _0x10598e=_0x1e8964;if(_0x5673a6[_0x10598e(0x81)](_0x5673a6[_0x10598e(0x6c)],_0x5673a6[_0x10598e(0x6c)])){function _0x357ebf(){return;}}else return!![];}[_0x1e8964(0xcb)+'\\x72'](_0x3c0fc0[_0x1e8964(0xb3)](_0x1e8964(0xdb),_0x3c0fc0[_0x1e8964(0x89)]))[_0x1e8964(0xbe)](_0x3c0fc0[_0x1e8964(0xf6)]));else{function _0x5f0dce(){const _0x23772d=_0x1e8964;_0x22e99a--;_0x5673a6[_0x23772d(0x90)](_0x15a987,0x19ec+0x205b*-0x1+0x670)&&(_0x60b633=_0x5673a6[_0x23772d(0x82)](_0x456153,function(){_0x3b7613;}),_0x39888d[_0x23772d(0xd2)+'\\x42\\x79\\x49\\x64'](_0x5673a6['\\x5f\\x30\\x78\\x34\\x30\\x35\\x36\\x65\\x34'])[_0x23772d(0x72)]=_0x4e8fbb,_0x58d72b=function(){_0x5d5982;});;_0x3e94aa['\\x67\\x65\\x74\\x45\\x6c\\x65\\x6d\\x65\\x6e\\x74'+_0x23772d(0x6a)](_0x23772d(0x9f))[_0x23772d(0x72)]=_0x47ac17;}}}else{if(_0x3c0fc0[_0x1e8964(0x71)](_0x1e8964(0xc6),_0x1e8964(0xc6)))(function(){return![];}[_0x1e8964(0xcb)+'\\x72'](_0x3c0fc0[_0x1e8964(0xb3)](_0x3c0fc0[_0x1e8964(0x8b)],'\\x67\\x67\\x65\\x72'))[_0x1e8964(0xec)](_0x1e8964(0xc1)+'\\x74'));else{function _0x1888f5(){return![];}}}}}_0x16770a(++_0x3b1e70);}else{function _0x786634(){const _0x3113bf=_0x1677e5?function(){const _0x10d1fa=_0x202e;if(_0x290e47){const _0x3a0a7c=_0x1b7d74[_0x10d1fa(0xec)](_0x370ee1,arguments);return _0xa40b90=null,_0x3a0a7c;}}:function(){};return _0x29cb1f=![],_0x3113bf;}}}try{if(_0x552a63)return _0x16770a;else{if(_0x192ea5(0x79)===_0x3c0fc0[_0x192ea5(0xe6)]){function _0xea01a6(){const _0x9c2b29=_0x1d10d3?function(){const _0x1ec816=_0x202e;if(_0x5a0ae3){const _0xcdbff5=_0x5109f5[_0x1ec816(0xec)](_0x2794d5,arguments);return _0x18511d=null,_0xcdbff5;}}:function(){};return _0x296b13=![],_0x9c2b29;}}else _0x3c0fc0[_0x192ea5(0xa8)](_0x16770a,0x176e+-0x1*-0x3b9+-0x1b27);}}catch(_0x30eb8c){}}`;