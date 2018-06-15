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
    class Proxy {

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
    Proxy.isUsed = false;

    // Spliter
    class Spliter {

        static parse(str) {
            return this.parser.parseFromString(str, 'text/html');
        }

        static clearCache() {
            this.cache = {};
        }

        static get(url) {
            url = Proxy.isUsed ? Proxy.getProxyString(url) : url;
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
                result.push(els[i].getAttribute(attr));
            }
            return result;
        }

        static findBatch(url, obj) {
            let df = this.getDOM(url);
            let list = {};
            let result = [];
            let lenAll = 0;
            for (let o in obj) {
                list[o] = [];
                let sel = obj[o].selector;
                let attr = obj[o].attr;
                let els = df.querySelectorAll(sel);
                lenAll = els.length;
                if (!attr) {
                    list[o] = els;
                } else {
                    for (let i = 0, len = els.length; i < len; i += 1) {
                        if (attr === 'innerText' || attr === 'innerHTML') {
                            list[o].push(els[i][attr]);
                        } else {
                            list[o].push(els[i].getAttribute(attr));
                        }
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

        static findArr(urlArr, selector, attr, isBatch = false) {
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

        static findRangeBatch(urlTemplate, config, obj) {
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
            url = Proxy.isUsed ? Proxy.getProxyString(url) : url;
            return GL.fetch(url).then(r => r.text());
        }

        static getJSON(url) {
            url = Proxy.isUsed ? Proxy.getProxyString(url) : url;
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
                            result.push(els[i].getAttribute(attr));
                        }
                        res(result);
                    }
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

        static findBatch(urlTemplate, start, end, selector, attr, aditionalArr) {
            return new GL.Promise((res, rej) => {
                let pr = [];
                let result = [];
                if ((typeof start === 'number') && (typeof end === 'number')) {
                    for (let i = start; i <= end; i += 1) {
                        let url = StringBuilder.build(urlTemplate, i);
                        pr.push(this.find(url, selector, attr));
                    }
                }
                if (aditionalArr) {
                    aditionalArr.forEach(i => {
                        let url = StringBuilder.build(urlTemplate, i);
                        pr.push(this.find(url, selector, attr));
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
    SpliterAsin.cache = {};
    SpliterAsin.parser = new DOMParser();

    // Pager
    class Pager {

        constructor(urlArr, selector, attr) {
            this.urlArr = urlArr;
            this.selector = selector;
            this.attr = attr;
            this.result = [];
            this.isExistsNext = true;
            this.pagesSize = urlArr.length;
            this.pagesLoaded = 0;
            this.pagesLeft = urlArr.length;
        }

        next(n = 1) {
            if (!this.isExistsNext) {
                return [];
            }
            if (this.pagesLoaded + n > this.pagesSize) {
                n = this.pagesSize - this.pagesLoaded;
            }
            //
            let a = this.urlArr;
            let p = this.pagesLoaded;
            let arr = [];
            for (let i = p; i < p + n; i += 1) {
                arr.push(a[i]);
            }
            let res = Spliter.findArr(arr, this.selector, this.attr);
            this.result = this.result.concat(res);
            //
            this.pagesLoaded += n;
            if (this.pagesLoaded > this.pagesSize) {
                this.pagesLoaded = this.pagesSize;
            }
            this.pagesLeft -= n;
            if (this.pagesLeft <= 0) {
                this.pagesLeft = 0;
                this.isExistsNext = false;
            }
            return res;
        }

    };

    class PagerT {

        constructor(urlTemplate, start = null, end = null, selector, attr, aditionalArr) {
            this.urlTemplate = urlTemplate;
            this.start = start;
            this.end = end;
            this.selector = selector;
            this.attr = attr;
            this.aditionalArr = aditionalArr;
            //
            this.result = [];
            this.isExistsNext = true;
            this.pagesLoaded = 0;
            this.pagesSize = 0;
            if (this.start !== null && this.end !== null) {
                this.pagesSize += this.end - this.start + 1;
            }
            if (this.aditionalArr) {
                this.pagesSize += this.aditionalArr.length;
            }
            this.pagesLeft = this.pagesSize;
            //
            this._isFirstLoop = true;
            this._loopType = (!aditionalArr) ? 1 : (!start ? 2 : 3);
        }

        next(n = 1) {
            if (!this.isExistsNext) {
                return [];
            }
            let loops = [0, goLoop1, goLoop2, goLoop3];
            let res = loops[this._loopType]();
            this.result = this.result.concat(res);
            return res;
            //
            function goLoop1() {
                if (this._isFirstLoop) {
                    this._isFirstLoop = false;
                    this._indS = this.start;
                    this._indE = n;
                } else {
                    this._indS += n;
                    this._indE += n;
                }
                if (this._indS > this.end) {
                    this._indS = this.end;
                }
                if (this._indE >= this.end) {
                    this._indE = this.end;
                    this.isExistsNext = false;
                }
                let res = proxyFindBatch(this.urlTemplate, this._indS, this._indE, this.selector, this.attr);
                this.pagesLoaded += this._indE - this._indS + 1;
                this.pagesLeft = this.pagesSize - this.pagesLoaded;
                return res;
            }

            function goLoop2() {
                if (this._isFirstLoop) {
                    this._isFirstLoop = false;
                    this._indS = 0;
                    this._indE = n - 1;
                } else {
                    this._indS += n;
                    this._indE += n;
                }
                if (this._indS > this.aditionalArr.length) {
                    this._indS = this.aditionalArr.length;
                }
                if (this._indE >= this.aditionalArr.length - 1) {
                    this._indE = this.aditionalArr.length - 1;
                    this.isExistsNext = false;
                }
                let a = this.aditionalArr;
                let s = this._indS;
                let e = this._indE;
                let arr = [];
                for (let i = s; i <= e; i += 1) {
                    arr.push(a[i]);
                }
                let res = proxyFindBatch(this.urlTemplate, null, null, this.selector, this.attr, arr);
                this.pagesLoaded += arr.length;
                this.pagesLeft = this.pagesSize - this.pagesLoaded;
                return res;
            }

            function goLoop3() {
                if (this._isFirstLoop) {
                    this._isFirstLoop = false;
                    this._indS = this.start;
                    this._indE = n;
                    this._indReS = null;
                    this._indReE = null;
                } else {
                    this._indS += n;
                    this._indE += n;
                    this._indReS = (this._indReS === null) ? null : this._indReS + n;
                    this._indReE = (this._indReE === null) ? null : this._indReE + n;
                }
                if (this._indS > this.end) {
                    if (this._indReS === null) {
                        this._indReS = this._indS - this.end - 1;
                    }
                    this._indS = this.end;
                }
                if (this._indE > this.end) {
                    if (this._indReE === null) {
                        this._indReE = this._indE - this.end - 1;
                    }
                    this._indE = this.end;
                }
                if (this._indReS > this.aditionalArr.length) {
                    this._indReS = this.aditionalArr.length;
                }
                if (this._indReE >= this.aditionalArr.length - 1) {
                    this._indReE = this.aditionalArr.length - 1;
                    this.isExistsNext = false;
                }
                if (this._indReE === null) {
                    let res = proxyFindBatch(this.urlTemplate, this._indS, this._indE, this.selector, this.attr);
                    this.pagesLoaded += this._indE - this._indS + 1;
                    this.pagesLeft = this.pagesSize - this.pagesLoaded;
                    return res;
                } else {
                    if (this._indReS === null) {
                        this._indReS = 0;
                        let arr2 = [];
                        for (let i = this._indReS; i <= this._indReE; i += 1) {
                            arr2.push(this.aditionalArr[i]);
                        }
                        let res = proxyFindBatch(this.urlTemplate, this._indS, this._indE, this.selector, this.attr, arr2);
                        this.pagesLoaded += this._indE - this._indS + 1 + arr2.length;
                        this.pagesLeft = this.pagesSize - this.pagesLoaded;
                        return res;
                    } else {
                        let arr2 = [];
                        for (let i = this._indReS; i <= this._indReE; i += 1) {
                            arr2.push(this.aditionalArr[i]);
                        }
                        let res = proxyFindBatch(this.urlTemplate, null, null, this.selector, this.attr, arr2);
                        this.pagesLoaded += arr2.length;
                        this.pagesLeft = this.pagesSize - this.pagesLoaded;
                        return res;
                    }
                }
            }
        }

    };

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

    // MAIN OBJECT
    const version = '3.0.0';
    GL.golem = {
        version: version,
        utils: {
            StringBuilder: StringBuilder,
            UrlBuilder: UrlBuilder,
            Analytics: Analytics
        },
        Proxy: Proxy,
        Spliter: Spliter,
        //SpliterAsin: SpliterAsin,
        Pager: Pager,
        init: i => GL[i] = GL.golem
    };
})(window);
