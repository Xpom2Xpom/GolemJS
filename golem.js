'use strict';

((GL) => {
    //Messages
    class Messager {}
    Messager.ERROR_PARENT_SELECTOR = 'Parrent selector does not exists';
    Messager.NO_URL = 'Has not url for finding';
    Messager.NO_FROM_EP = 'Has not "from" entry point';
    Messager.NO_TO_EP = 'Has not "to" end point';
    Messager.NO_ARG = 'Arguments should be from 1 to 3';

    //Config
    const CONFIG_URL = '_url';
    const CONFIG_FROM = '_from';
    const CONFIG_TO = '_to';
    const CONFIG_MORE = '_more';
    const CONFIG_PARENT_SELECTOR = '_ps';

    // StringBuilder
    class StringBuilder {

        static remove(str, sym) {
            let re = new RegExp(sym, 'g');
            return str.replace(re, '');
        }

        static removeArr(arr, sym) {
            let result = [];
            arr.forEach(str => {
                result.push(this.remove(str, sym));
            });
            return result;
        }

        static parse(str, sep = ' ', pos = 1) {
            let arr = str.split(sep);
            let typePos = typeof pos;
            if (typePos === 'number') {
                return arr[pos - 1];
            }
            let result = [];
            pos.forEach(i => {
                result.push(arr[i - 1]);
            });
            return result;
        }

        static parseArr(arr, sep, pos) {
            let result = [];
            arr.forEach(val => {
                result.push(this.parse(val, sep, pos));
            });
            return result;
        }

        static build(template, value = 'Replaced value', sym = '{1}', leftSym = '{', rightSym = '}') {
            let typeValue = typeof value;
            if ((typeValue === 'string') || (typeValue === 'number')) {
                return template.replace(sym, value);
            }
            value.forEach((i, n) => {
                let ii = n + 1;
                let rep = leftSym + ii + rightSym;
                template = template.replace(rep, i);
            });
            return template;
        }

        static buildArr(template, ...arr) {
            let tmp = template;
            let result = [];
            arr.forEach((tarArr, index) => {
                result.push(this.build(tmp[index], tarArr));
            });
            return result;
        }

        static buildArrStepByStep(template, ...arr) {
            let tmp = template;
            let result = [];
            let arr2 = [];
            for (let i = 0, len = arr[0].length; i < len; i += 1) {
                arr2[i] = [];
            }
            for (let i = 0, len = arr.length; i < len; i += 1) {
                for (let j = 0, len2 = arr[i].length; j < len2; j += 1) {
                    arr2[j][i] = arr[i][j];
                }
            }
            arr2.forEach(tarArr => {
                result.push(this.build(tmp, tarArr));
            });
            return result;
        }
    }

    // UrlBuilder
    class UrlBuilder {

        static build(template, value, sym, leftSym, rightSym) {
            StringBuilder.build(template, value, sym, leftSym, rightSym);
        }

        static trim(url) {
            url = url.replace('http://', '');
            url = url.replace('https://', '');
            url = url.replace('file://', '');
            url = url.split('?')[0];
            return url;
        }

        static trimArr(urlArr) {
            let result = [];
            urlArr.forEach(url => {
                result.push(this.trim(url));
            });
            return result;
        }

        static parse(url, pos = 1, sep = '/') {
            url = this.trim(url);
            return StringBuilder.parse(url, sep, pos);
        }

        static parseArr(urlArr, pos, sep) {
            let result = [];
            urlArr.forEach(url => {
                result.push(this.parse(url, pos, sep));
            });
            return result;
        }

        static getParams(url) {
            let str = url.split('?')[1];
            if (!str) {
                return null;
            }
            let set = str.split('&');
            let result = {};
            set.forEach(v => {
                let tmp = v.split('=');
                result[tmp[0]] = tmp[1];
            });
            return result;
        }

        static templateFromUrl(url, index, sym = '{1}', leftSym = '{', rightSym = '}') {
            let ssl = url.indexOf('https://') >= 0;
            let typeIndex = typeof index;
            url = this.trim(url);
            let arr = url.split('/');
            if (typeIndex === 'number') {
                arr[index - 1] = sym;
            } else {
                index.forEach((val, n) => {
                    let ii = n + 1;
                    arr[val - 1] = leftSym + ii + rightSym;
                });
            }
            let newUrl = arr.join('/');
            let protocol = ssl ? 'https://' : 'http://';
            return protocol + newUrl;
        }

        static urlsFromUrl(etalon, pos1, urls, pos2) {
            etalon = this.trim(etalon);
            urls = this.trimArr(urls);
            let template = this.templateFromUrl(etalon, pos1);
            let params = this.parseArr(urls, pos2);
            let result = [];
            params.forEach(param => {
                result.push(StringBuilder.build(template, param));
            });
            return result;
        }

        static urlsFromTemplate(template, urls, pos) {
            let params = this.parseArr(urls, pos);
            let result = [];
            params.forEach(param => {
                result.push(this.build(template, param));
            });
            return result;
        }
    }

    // Proxy
    class ProxyServer {

        static init(port = '80', host = 'localhost', queryStringSign = 'q', isSSL = false) {
            this.isUsed = true;
            this.protocol = isSSL ? 'https' : 'http';
            this.host = host;
            this.port = port;
            this.queryStringSign = queryStringSign;
            this.isSSL = isSSL;
        }

        static getProxyStringFromParams(url) {
            return `${this.protocol}://${this.host}:${this.port}?${this.queryStringSign}=${encodeURIComponent(url)}`;
        }

        static initWithTemplate(tml, replaceSign = '{1}') {
            this.isUsed = true;
            this.tml = tml;
            this.replaceSign = replaceSign;
        }

        static getProxyStringFromTemplate(url) {
            return this.tml && this.replaceSign ? this.tml.replace(this.replaceSign, encodeURIComponent(url)) : '';
        }

        static getProxyString(url) {
            if (!this.isUsed) {
                return url;
            }

            return this.tml ? this.getProxyStringFromTemplate(url) : this.getProxyStringFromParams(url);
        }

        static cancel() {
            this.isUsed = false;
        }
    }
    ProxyServer.isUsed = false;

    // Cacher
    class Cacher {

        static set(url, df) {
            this.cache[url] = df;
        }

        static get(url) {
            return this.cache[url];
        }

        static clear() {
            this.cache = {};
        }

    }
    Cacher.cache = {};

    // Spliter
    class Spliter {

        static parse(str) {
            return this.parser.parseFromString(str, 'text/html');
        }

        static get(url) {
            url = ProxyServer.getProxyString(url);
            let x = new GL.XMLHttpRequest();
            x.open('GET', url, false);
            x.send(null);
            return x.responseText;
        }

        static getDOM(url) {
            let dfCached = Cacher.get(url);
            if (dfCached) {
                return dfCached;
            }

            let txt = this.get(url);
            let df = this.parse(txt);
            Cacher.set(url, df);
            return df;
        }

        static find(url, selector, attr) {
            let df = this.getDOM(url);
            let els = df.querySelectorAll(selector);
            if (!attr) {
                return els;
            }
            let result = [];
            for (let i = 0, len = els.length; i < len; i += 1) {
                result.push(els[i][attr]);
            }
            return result;
        }

        static findArr(urlArr, selector, attr) {
            let result = [];
            urlArr.forEach(url => {
                let res = this.find(url, selector, attr);
                result = result.concat(res);
            });
            return result;
        }

        /*
        obj = {
            _parentSelector: 'CSS PARENT SELECTOR',
            name1: '?<CSS SELECTOR> <ELEMENT ATTRIBUTE>',
            name2: '?<CSS SELECTOR> <ELEMENT ATTRIBUTE>',
            ...
        }
        return [{name1,name2}, {name1,name2},...]
        */
        static findBatch(url, objParam) {
            let df = this.getDOM(url);

            let ps = objParam._parentSelector || objParam[CONFIG_PARENT_SELECTOR];
            let obj = Object.assign({}, objParam);
            delete obj._parentSelector;
            delete obj[CONFIG_PARENT_SELECTOR];

            if (!ps) {
                handleSyntaxError(Messager.ERROR_PARENT_SELECTOR);
            }

            let parentEls = df.querySelectorAll(ps);
            let result = this._getFromParent(parentEls, obj);
            return result;
        }

        static _getFromParent(parentEls, obj) {
            let result = [];

            for (let i = 0, len = parentEls.length; i < len; i += 1) {
                let newObj = {};
                let isExists = false;
                for (let o in obj) {
                    let objStr = obj[o];
                    let objArr = objStr.split(' ');
                    let attr = objArr.pop();
                    let selector = objArr.join(' ');
                    let parentEl = parentEls[i];
                    let childEl = selector ? parentEl.querySelector(selector) : parentEl;
                    let prop;
                    if (childEl) {
                        prop = childEl[attr];
                    } else {
                        continue;
                    }
                    newObj[o] = prop;
                    isExists = true;
                }

                if (isExists) {
                    result.push(newObj);
                    isExists = false;
                } else {
                    continue;
                }
            }

            return result;
        }

        static findArrBatch(urlArr, obj) {
            let result = [];
            urlArr.forEach(url => {
                let res = this.findBatch(url, obj);
                result = result.concat(res);
            });
            return result;
        }

        // config = {from: int, to: int, ?more: [string]}
        static findRange(urlTemplate, config, obj) {
            let result = [];
            let start = config.from;
            let end = config.to;
            let aditionalArr = config.more;

            if ((typeof start === 'number') && (typeof end === 'number')) {
                for (let i = start; i <= end; i += 1) {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.findBatch(url, obj);
                    result = result.concat(res);
                }
            }

            if (aditionalArr) {
                aditionalArr.forEach(i => {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.findBatch(url, obj);
                    result = result.concat(res);
                });
            }

            return result;
        }
    }
    Spliter.parser = new DOMParser();

    // SpliterAsyn
    class SpliterAsyn {

        static parse(str) {
            return this.parser.parseFromString(str, 'text/html');
        }

        static get(url) {
            url = ProxyServer.getProxyString(url);
            return GL.fetch(url).then(r => r.text());
        }

        static getJSON(url) {
            url = ProxyServer.getProxyString(url);
            return GL.fetch(url).then(r => r.json());
        }

        static getDOM(url) {
            return new GL.Promise((res, rej) => {
                let cache = Cacher.get(url);
                if (cache) {
                    res(cache);
                } else {
                    this.get(url).then(txt => {
                        let df = this.parse(txt);
                        Cacher.set(url, df);
                        res(df);
                    });
                }
            });
        }

        static find(url, selector, attr) {
            return new GL.Promise((res, rej) => {
                this.getDOM(url).then(df => {
                    let els = df.querySelectorAll(selector);
                    if (!attr) {
                        res(els);
                    } else {
                        let result = [];
                        for (let i = 0, len = els.length; i < len; i += 1) {
                            result.push(els[i][attr]);
                        }
                        res(result);
                    }
                });
            });
        }

        /*
        obj = {
            ?_parentSelector: 'CSS PARENT SELECTOR',
            name1: {
                selector: '<CSS SELECTOR>',
                attr: 'ELEMENT ATTRIBUTE'
            },
            name2: {
                selector: '<CSS SELECTOR>',
                attr: 'ELEMENT ATTRIBUTE'
            },
            ...
        }
        return [{name1,name2}, {name1,name2},...]
        */
        static findBatch(url, obj, parentSel) {
            return new GL.Promise((res, rej) => {
                let result = [];
                let ps = obj._parentSelector || obj._ps || parentSel;
                delete obj._parentSelector;
                delete obj._ps;

                if (!ps) {
                    rej({message: 'does not exists parentSelector'});
                }

                this.getDOM(url).then((df) => {
                    let parentEls = df.querySelectorAll(ps);
                    for (let i = 0, len = parentEls.length; i < len; i += 1) {
                        let newObj = {};
                        for (let o in obj) {
                            let typeP = typeof obj[o];
                            let sel;
                            let attr;
                            if (typeP === 'string') {
                                let arrP = obj[o].split(' ');
                                attr = arrP.pop();
                                sel = arrP.join(' ');
                            } else {
                                sel = obj[o].selector;
                                attr = obj[o].attr;
                            }
                            let pEl = parentEls[i];
                            let propEl = sel ? pEl.querySelector(sel) : pEl;
                            let prop = propEl[attr];
                            newObj[o] = prop;
                        }
                        result.push(newObj);
                    }

                    res(result);
                });
            });
        }

        static findArr(urlArr, selector, attr) {
            return new GL.Promise((res, rej) => {
                let pr = [];
                let result = [];
                urlArr.forEach(url => {
                    pr.push(this.find(url, selector, attr));
                });
                GL.Promise.all(pr).then(data => {
                    data.forEach(d => {
                        result = result.concat(d);
                    });
                    res(result);
                });
            });
        }

        static findArrBatch(urlArr, obj) {
            return new GL.Promise((res, rej) => {
                let pr = [];
                let result = [];
                let ps = obj._parentSelector || obj._ps;
                urlArr.forEach(url => {
                    pr.push(this.findBatch(url, obj, ps));
                });
                GL.Promise.all(pr).then(data => {
                    data.forEach(d => {
                        result = result.concat(d);
                    });
                    res(result);
                });
            });
        }

        // config = {from: int, to: int, ?more: [string]}
        static findRangeBatch(urlTemplate, config, obj) {
            return new GL.Promise((res, rej) => {
                let pr = [];
                let result = [];
                let start = config.from;
                let end = config.to;
                let aditionalArr = config.more;
                let ps = config.parentSelector || config.ps || obj._parentSelector || obj._ps;

                if ((typeof start === 'number') && (typeof end === 'number')) {
                    for (let i = start; i <= end; i += 1) {
                        let url = StringBuilder.build(urlTemplate, i);
                        pr.push(this.findBatch(url, obj, ps));
                    }
                }

                if (aditionalArr) {
                    aditionalArr.forEach(i => {
                        let url = StringBuilder.build(urlTemplate, i);
                        pr.push(this.findBatch(url, obj, ps));
                    });
                }

                GL.Promise.all(pr).then(data => {
                    data.forEach(d => {
                        result = result.concat(d);
                    });
                    res(result);
                });
            });
        }
    }
    SpliterAsyn.parser = new DOMParser();

    // localStorage
    class Storage {

        static set(storageName, val) {
            GL.localStorage.setItem(storageName, val);
        }

        static setObj(storageName, obj) {
            let storageObj = JSON.stringify(obj);
            GL.localStorage.setItem(storageName, storageObj);
        }

        static get(storageName) {
            return GL.localStorage.getItem(storageName);
        }

        static getObj(storageName) {
            let obj = GL.localStorage.getItem(storageName);
            return JSON.parse(obj);
        }

        static remove(storageName) {
            GL.localStorage.removeItem(storageName);
        }

        static clear() {
            GL.localStorage.clear();
        }
    }

    // Error handlers
    function handleSyntaxError(message) {
        throw new SyntaxError(message);
    }

    // Global aliases
    function findAs() {
        let len = arguments.length;

        if (len === 1) {
            let arg = arguments[0];
            let url = arg[CONFIG_URL];
            let config = {
                from: arg[CONFIG_FROM],
                to: arg[CONFIG_TO],
                more: arg[CONFIG_MORE]
            };

            if (!url) {
                handleSyntaxError(Messager.NO_URL);
            }
            if (!config.from) {
                console.log(Messager.NO_FROM_EP);
            }
            if (!config.to) {
                console.log(Messager.NO_TO_EP);
            }

            let obj = Object.assign({}, arg);
            delete obj[CONFIG_URL];
            delete obj[CONFIG_FROM];
            delete obj[CONFIG_TO];
            delete obj[CONFIG_MORE];

            let res = Spliter.findRange(url, config, obj);
            return res;
        }

        if (len === 2) {
            let url = arguments[0];
            let obj = arguments[1];
            let urlType = typeof url;

            if (urlType === 'string') {
                let res = Spliter.findBatch(url, obj);
                return res;
            }

            let res = Spliter.findArrBatch(url, obj);
            return res;
        }

        if (len === 3) {
            let url = arguments[0];
            let selector = arguments[1];
            let attr = arguments[2];
            let type = typeof url;

            if (type === 'string') {
                let res = Spliter.find(url, selector, attr);
                return res;
            }

            let res = Spliter.findArr(url, selector, attr);
            return res;
        }

        handleSyntaxError(Messager.NO_ARG);
    };

    function fetchAs() {
        return new GL.Promise((res, rej) => {
            let len = arguments.length;

            if (len === 1) {
                let arg = arguments[0];
                let url = arg[CONFIG_URL];
                let config = {
                    from: arg[CONFIG_FROM],
                    to: arg[CONFIG_TO],
                    more: arg[CONFIG_MORE]
                };

                if (!url) {
                    rej(Messager.NO_URL);
                }
                if (!config.from) {
                    console.log(Messager.NO_FROM_EP);
                }
                if (!config.to) {
                    console.log(Messager.NO_TO_EP);
                }

                delete arg[CONFIG_URL];
                delete arg[CONFIG_FROM];
                delete arg[CONFIG_TO];
                delete arg[CONFIG_MORE];

                SpliterAsyn.findRange(url, config, arg).then(els => res(els));
                return;
            }

            if (len === 2) {
                let url = arguments[0];
                let obj = arguments[1];
                let type = typeof url;

                if (type === 'string') {
                    SpliterAsyn.findBatch(url, obj).then(els => res(els));
                    return;
                }

                SpliterAsyn.findArrBatch(url, obj).then(els => res(els));
                return;
            }

            if (len === 3) {
                let url = arguments[0];
                let selector = arguments[1];
                let attr = arguments[2];
                let type = typeof url;

                if (type === 'string') {
                    SpliterAsyn.find(url, selector, attr).then(els => res(els));
                    return;
                }

                SpliterAsyn.findArr(url, selector, attr).then(els => res(els));
                return;
            }

            rej({message: Messager.NO_ARG});
        });
    };

    function clearCache() {
        Cacher.clear();
    }

    // MAIN OBJECT
    const version = '0.4.0';
    GL.golem = {
        version: version,
        utils: {
            StringBuilder: StringBuilder,
            UrlBuilder: UrlBuilder
        },
        Proxy: ProxyServer,
        Storage: Storage,
        // alieses
        find: findAs,
        fetch: fetchAs,
        clearCache: clearCache,
        // init
        init: i => GL[i] = GL.golem
    };
})(window);
