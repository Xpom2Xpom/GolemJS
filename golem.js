'use strict';

((GL) => {

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

        static init(host = 'localhost', port = '80', q = 'q', isSSL = false) {
            this.isUsed = true;
            this.protocol = isSSL ? 'https://' : 'http://';
            this.host = host;
            this.port = port;
            this.queryString = q;
            this.isSSL = isSSL;
        }

        static getProxyString(url) {
            let str = this.protocol + this.host + ':' + this.port + '?' + this.queryString + '=' + url;
            return str;
        }

        static cancel() {
            this.isUsed = false;
        }
    }
    ProxyServer.isUsed = false;

    // Spliter
    class Spliter {

        static parse(str) {
            return this.parser.parseFromString(str, 'text/html');
        }

        static clearCache() {
            this.cache = {};
        }

        static get(url) {
            url = ProxyServer.isUsed ? ProxyServer.getProxyString(url) : url;
            let x = new GL.XMLHttpRequest();
            x.open('GET', url, false);
            x.send(null);
            return x.responseText;
        }

        static getDOM(url) {
            if (this.cache[url]) {
                return this.cache[url];
            }
            let txt = this.get(url);
            let df = this.parse(txt);
            this.cache[url] = df;
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

        /*
        obj = {
            ?_parentSelector: 'CSS PARENT SELECTOR',
            name1: {
                selector: '<CSS SELECTOR>', // or '' if _parentSelector is base elements
                attr: 'ELEMENT ATTRIBUTE'
            },
            name2: {
                selector: '<CSS SELECTOR>', // or '' if _parentSelector is base elements
                attr: 'ELEMENT ATTRIBUTE'
            },
            ...
        }
        return [{name1,name2}, {name1,name2},...]
        */
        static findBatch(url, obj, parentSel) {
            let df = this.getDOM(url);
            let list = {};
            let result = [];
            let lenAll = 0;
            if (obj._parentSelector || obj._ps || parentSel) {
                let ps = obj._parentSelector || obj._ps || parentSel;
                delete obj._parentSelector;
                delete obj._ps;
                let parentEls = df.querySelectorAll(ps);
                for (let i = 0, len = parentEls.length; i < len; i += 1) {
                    let newObj = {};
                    for (let o in obj) {
                        let typeP = typeof obj[o];
                        let sel;
                        let attr;
                        if (typeP === 'string') {
                            let arrP = obj[o].split(' ');
                            let lenP = arrP.length;
                            attr = arrP[lenP - 1];
                            arrP.pop();
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
                return result;
            }
            for (let o in obj) {
                list[o] = [];
                let sel = obj[o].selector;
                let attr = obj[o].attr;
                let els = df.querySelectorAll(sel);
                lenAll = els.length;
                if (!attr) {
                    list[o] = els;
                } else {
                    for (let i = 0; i < lenAll; i += 1) {
                        list[o].push(els[i][attr]);
                    }
                }
            }
            for (let i = 0; i < lenAll; i += 1) {
                let oo = {};
                for (let o in list) {
                    oo[o] = list[o][i];
                }
                result.push(oo);
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

        static findArrBatch(urlArr, obj) {
            let result = [];
            urlArr.forEach(url => {
                let res = this.findBatch(url, obj);
                result = result.concat(res);
            });
            return result;
        }

        static findRange(urlTemplate, start, end, selector, attr, aditionalArr) {
            let result = [];
            start = Number.parseInt(start);
            end = Number.parseInt(end);
            if ((typeof start === 'number') && (typeof end === 'number')) {
                for (let i = start; i <= end; i += 1) {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.find(url, selector, attr);
                    result = result.concat(res);
                }
            }
            if (aditionalArr) {
                aditionalArr.forEach(i => {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.find(url, selector, attr);
                    result = result.concat(res);
                });
            }
            return result;
        }

        // config = {from: int, to: int, ?more: [string]}
        static findRangeBatch(urlTemplate, config, obj) {
            let result = [];
            let start = config.from;
            let end = config.to;
            let aditionalArr = config.more;
            let ps = config.parentSelector || config.ps || obj._parentSelector || obj._ps;
            if ((typeof start === 'number') && (typeof end === 'number')) {
                for (let i = start; i <= end; i += 1) {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.findBatch(url, obj, ps);
                    result = result.concat(res);
                }
            }
            if (aditionalArr) {
                aditionalArr.forEach(i => {
                    let url = StringBuilder.build(urlTemplate, i);
                    let res = this.findBatch(url, obj, ps);
                    result = result.concat(res);
                });
            }
            return result;
        }
    }
    Spliter.cache = {};
    Spliter.parser = new DOMParser();

    // SpliterAsin
    class SpliterAsin {

        static parse(str) {
            return this.parser.parseFromString(str, 'text/html');
        }

        static clearCache() {
            this.cache = {};
        }

        static get(url) {
            url = ProxyServer.isUsed ? ProxyServer.getProxyString(url) : url;
            return GL.fetch(url).then(r => r.text());
        }

        static getJSON(url) {
            url = ProxyServer.isUsed ? ProxyServer.getProxyString(url) : url;
            return GL.fetch(url).then(r => r.json());
        }

        static getDOM(url) {
            return new GL.Promise((res, rej) => {
                if (this.cache[url]) {
                    res(this.cache[url]);
                } else {
                    this.get(url).then(txt => {
                        let df = this.parse(txt);
                        this.cache[url] = df;
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
            ?parentSelector: 'CSS PARENT SELECTOR',
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
        static findBatch(url, obj) {
            return new GL.Promise((res, rej) => {
                let result = [];
                if (!obj.parentSelector) {
                    rej({message: 'does not exists parentSelector'});
                }
                this.getDOM(url).then((df) => {
                    let ps = obj.parentSelector;
                    delete obj.parentSelector;
                    let parentEls = df.querySelectorAll(ps);
                    for (let i = 0, len = parentEls.length; i < len; i += 1) {
                        let newObj = {};
                        for (let o in obj) {
                            let sel = obj[o].selector;
                            let attr = obj[o].attr;
                            let pEl = parentEls[i];
                            let propEl = pEl.querySelector(sel);
                            let prop = propEl[attr];
                            newObj[o] = prop;
                        }
                        result.push(newObj);
                    }
                });
                res(result);
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
                urlArr.forEach(url => {
                    pr.push(this.findBatch(url, obj));
                });
                GL.Promise.all(pr).then(data => {
                    data.forEach(d => {
                        result = result.concat(d);
                    });
                    res(result);
                });
            });
        }
    }
    SpliterAsin.cache = {};
    SpliterAsin.parser = new DOMParser();

    // localStorage
    class Storage {

        static set(storageName, obj) {
            let storageObj = JSON.stringify(obj);
            GL.localStorage.setItem(storageName, storageObj);
        }

        static get(storageName) {
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

    // Analitics
    class Aset {
        constructor(target, result) {
            this.lengthTarget = target.length;
            this.lengthResult = result.length;
            this.target = target;
            this.result = result;
            this.max = result[0];
            this.min = result[result.length - 1];
        }

        getMax(n) {
            if (!n) {
                return this.max;
            }
            if (n > this.lengthResult - 1) {
                n = this.lengthResult;
            }
            let res = [];
            for (let i = 0, len = n; i < len; i += 1) {
                res[i] = this.result[i];
            }
            return res;
        }

        getMin(n) {
            if (!n) {
                return this.min;
            }
            if (n > this.lengthResult) {
                n = this.lengthResult;
            }
            let res = [];
            for (let i = this.lengthResult - 1, len = this.lengthResult - n; i >= len; i -= 1) {
                res.push(this.result[i]);
            }
            return res;
        }

        getMinAsString(n = 1, sep1, sep2) {
            return this.asString(sep1, sep2, this.getMax(n));
        }

        asString(sep1 = ', ', sep2 = ' - ') {
            let res = '';
            let len = this.result.length;
            this.result.forEach((val, ii) => {
                res += '"' + val.value + '"' + sep2 + val.repeat + sep2 + val.percent + '%';
                if (ii < len - 1) {
                    res += sep1;
                }
            });
            return res;
        }
    }

    class Analytics {

        static getAset(arr) {
            let len = arr.length;
            let o = {};
            arr.forEach((val, i) => {
                if (!o[val]) {
                    o[val] = 0;
                    for (let j = i; j < len; j += 1) {
                        if (val === arr[j]) {
                            o[val] += 1;
                        }
                    }
                }
            });

            // sort
            let newArr = [];
            for (let i in o) {
                newArr.push({
                    value: i,
                    repeat: o[i],
                    percent: (o[i] / len * 100).toFixed(2)
                });
            }
            newArr.sort(function(a, b) {
                return b.repeat - a.repeat;
            });

            // res
            return new Aset(arr, newArr);
        }
    }

    // Error handlers
    function handleSyntaxError(message){
        throw new SyntaxError(message);
    }

    // Global aliases
    function findAs(){
        let len = arguments.length;

        if (len === 1){
            let arg = arguments[0];
            let url = arg._url;
            let config = {
                from: arg._from,
                to: arg._to,
                more: arg._more
            };
            let ps = arg._parentSelector || arg._ps;

            if (!url){
                handleSyntaxError('has not url for finding');
            }
            if (!from){
                handleSyntaxError('has not "from" entry point');
            }
            if (!to){
                handleSyntaxError('has not "to" end point');
            }
            if (!ps){
                handleSyntaxError('has not "_parentSelector" entity in config');
            }

            delete arg._url;
            delete arg._from;
            delete arg._to;
            delete arg._more;
            delete arg._ps;
            delete arg._parentSelector;

            let res = Spliter.findRangeBatch(url, config, arg);
            return res;
        }

        if (len === 2){
            let url = arguments[0];
            let obj = arguments[1];
            let type = typeof url;

            if (type === 'string'){
                let res = Spliter.findBatch(url, obj);
                return res;
            }

            let res = Spliter.findArrBatch(url, obj);
            return res;
        }

        if (len === 3){
            let url = arguments[0];
            let selector = arguments[1];
            let attr = arguments[2];
            let type = typeof url;

            if (type === 'string'){
                let res = Spliter.find(url, selector, attr);
                return res;
            }

            let res = Spliter.findArr(url, selector, attr);
            return res;
        }

        handleSyntaxError('Arguments should be from 1 to 3');
    };

    // MAIN OBJECT
    const version = '0.2.0';
    GL.golem = {
        version: version,
        utils: {
            StringBuilder: StringBuilder,
            UrlBuilder: UrlBuilder,
            Analytics: Analytics
        },
        Proxy: ProxyServer,
        Spliter: Spliter,
        SpliterAsyn: SpliterAsin,
        Storage: Storage,
        // alieses
        find: findAs,
        init: i => GL[i] = GL.golem
    };
})(window);
