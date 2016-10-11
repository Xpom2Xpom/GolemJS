'use strict';

(function(GL) {

    // StringBuilder

    function strTrim(str, sym) {
        if (typeof sym === 'string') {
            let re = new RegExp(sym, 'g');
            return str.replace(re, '');
        }
        let res = str;
        sym.forEach( val => {
            let re = new RegExp(val, 'g');
            res = res.replace(re, '');
        });
        return res;
    }

    function strTrimArr(arr, sym){
        let result = [];
        arr.forEach(str => {
            result.push(strTrim(str, sym));
        });
        return result;
    }

    function strParse(str, sep, pos) {
        let arr = str.split(sep);
        let typePos = typeof pos;
        if (typePos === 'number') {
            return arr[pos - 1];
        }
        let result = [];
        pos.forEach( i => {
            result.push(arr[i - 1]);
        });
        return result;
    }
    
    function strParseArr(arr, sep, pos) {
        let result = [];
        arr.forEach( val => {
            result.push(strParse(val, sep, pos));
        });
        return result;
    }

    function strBuild(template, value) {
        let typeValue = typeof value;
        if((typeValue === 'string') || (typeValue === 'number')) {
            return template.replace('{1}', value);
        }
        value.forEach( (i, n) => {
            let ii = n + 1;
            let rep = '{' + ii + '}';
            template = template.replace(rep, i);
        });
        return template;
    }

    function strBuildArr(template, ...arr) {
        let tmp = template;
        let result = [];
        let arr2 = [];
        for (let i = 0, len = arr[0].length; i < len; i +=1) {
            arr2[i] = [];
        }
        for (let i = 0, len = arr.length; i < len; i +=1) {
            for (let j = 0, len2 = arr[i].length; j < len2; j +=1) {
                arr2[j][i] = arr[i][j];
            }
        }
        arr2.forEach( tarArr => {
            result.push(strBuild(tmp, tarArr));
        });
        return result;

    }

    function strBuildArrStepByStep(template, ...arr) {
        let tmp = template;
        let result = [];
        arr.forEach( tarArr => {
            result.push(strBuild(tmp, tarArr));
        });
        return result;

    }

    let StringBuilder = {
        trim: strTrim,
        trimArr: strTrimArr,
        parse: strParse,
        parseArr: strParseArr,
        build: strBuild,
        buildArr: strBuildArr,
        buildArrStep: strBuildArrStepByStep
    };

    // UrlBuilder

    function urlTrim(url) {
        url = url.replace('http://', '');
        url = url.replace('https://', '');
        url = url.split('?')[0];
        return url;
    }

    function urlTrimArr(urlArr) {
        let result = [];
        urlArr.forEach( url => {
            result.push(urlTrim(url));
        });
        return result;
    }

    function urlParse(url, pos, sep = '/') {
        url = urlTrim(url);
        return strParse(url, sep, pos);
    }

    function urlParseArr(urlArr, pos, sep){
        let result = [];
        urlArr.forEach( url => {
            result.push(urlParse(url, pos, sep));
        });
        return result;
    }

    function templateFromUrl(url, index, ssl) {
        let typeIndex = typeof index;
        url = urlTrim(url);
        let arr = url.split('/');
        if (typeIndex === 'number') {
            arr[index - 1] = '{1}';
        } else {
            index.forEach( (val, n) => {
                let ii = n + 1;
                arr[val - 1] = '{' + ii + '}';
            });
        }
        let newUrl = arr.join('/');
        let protocol = ssl ? 'https://' : 'http://';
        return protocol + newUrl;
    }

    function urlsFromUrl(etalon, pos1, urls, pos2) {
        etalon = urlTrim(etalon);
        urls = urlTrimArr(urls);
        let template = templateFromUrl(etalon, pos1);
        let params = urlParseArr(urls, pos2);
        let result = [];
        params.forEach( param => {
            result.push(strBuild(template, param));
        });
        return result;
    }

    function urlsFromTemplate(template, urls, pos) {
        let params = urlParseArr(urls, pos);
        let result = [];
        params.forEach( param => {
            result.push(strBuild(template, param));
        });
        return result;
    }

    let UrlBuilder = {
        trim: urlTrim,
        trimArr: urlTrimArr,
        parse: urlParse,
        parseArr: urlParseArr,
        templateFromUrl: templateFromUrl,
        urlsFromUrl: urlsFromUrl,
        urlsFromTemplate: urlsFromTemplate
    };

    // SimpleProxy

    function proxyInit(host = 'localhost', port = '80', q = 'q', isSSL) {
        let con = SimpleProxy.config;
        let protocol = isSSL ? 'https://' : 'http://';
        con.port = ':' + port + '/?';
        con.host = protocol + host;
        con.q = q + '=';
    }

    function proxyGet(url) {
        let con = SimpleProxy.config;
        url = con.host + con.port + con.q + url;
        let x = new XMLHttpRequest();
        x.open('GET', url, false);
        x.send(null);
        return x.responseText;
    }

    function proxyGetDOM(url) {
        if (SimpleProxy.cashe[url]) {
            return SimpleProxy.cashe[url];
        }
        let res = proxyGet(url);
        res = res.replace(/src=/g, 'asrc=');
        res = res.split('<body')[1];
        res = res.replace('</body>', '');
        let df = document.createElement('div');
        df.innerHTML = res;
        SimpleProxy.cashe[url] = df;
        return df;
    }

    function proxyFind(url, selector, attr) {
        let df = proxyGetDOM(url);
        let els = df.querySelectorAll(selector);
        if (!attr) {
            return els;
        }
        attr = (attr === 'src') ? 'asrc' : attr;
        let result = [];
        for (let i = 0, len = els.length; i < len; i += 1) {
            if (attr === 'inner') {
                result.push(els[i].innerHTML);
            } else {
                result.push(els[i].getAttribute(attr));
            }
        }
        return result;
    }

    function proxyFindBatch(urlTemplate, start, end, selector, attr, aditionalArr) {
        let result = [];
        if ((typeof start === 'number') && (typeof end === 'number')) {
            for (let i = start; i <= end; i += 1) {
                getPeace(i);
            }
        }
        if (aditionalArr) {
            aditionalArr.forEach( i => {
                getPeace(i);
            });
        }
        return result;
        function getPeace(i){
            let url = strBuild(urlTemplate, i);
            let res = proxyFind(url, selector, attr);
            result = result.concat(res);
        }
    }

    function proxyFindMany(urlArr, selector, attr){
        let result = [];
        urlArr.forEach( url => {
            let res = proxyFind(url, selector, attr);
            result = result.concat(res);
        });
        return result;
    }

    // Pager
    let Pager = function Pager(urlTemplateOrArray, start, end, selector, attr, aditionalArr) {
        if ((typeof start === 'number' && typeof end === 'number') || aditionalArr) {
            return new PagerT(urlTemplateOrArray, start, end, selector, attr, aditionalArr);
        }
        return new PagerM(urlTemplateOrArray, selector, attr);
    };

    class PagerM {

        constructor(urlArr, selector, attr) {
            this.urlArr = urlArr;
            this.selector = selector;
            this.attr = attr;
            this.result = [];
            this.isExistsNext = true;
            this.pagesLoaded = 0;
            this.pagesSize = urlArr.length;
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
            let res = proxyFindMany(arr, this.selector, this.attr);
            this.result = this.result.concat(res);
            //
            this.pagesLoaded += n;
            if (this.pagesLoaded > this.pagesSize) {
                this.pagesLoaded = this.pagesSize;
            }
            this.pagesLeft -= n;
            if (this.pagesLeft <=  0) {
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
            function goLoop1(){
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

    let SimpleProxy = {
        cashe: {},
        config: {
            port: '',
            host: '',
            q: ''
        },
        init: proxyInit,
        get: proxyGet,
        getDOM: proxyGetDOM,
        find: proxyFind,
        findBatch: proxyFindBatch,
        findMany: proxyFindMany,
        Pager: Pager
    };

    // LoadScreen

    let LoadScreen = (function(){
        let screenId = null;
        let config = {
            id: 'xp_loadScreen'
        };
        let styles = {
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: '10',
            color: 'white',
            backgroundColor: 'blue'
        };
        let userStyles = null;
        function changeId(id){
            if (id && (typeof id === 'string')) {
                config.id = id;
            }
        }
        function setStyles(el){
            for (let v in styles) {
                el.style[v] = styles[v];
            }
            if (userStyles) {
                for (let c in userStyles) {
                    el.style[c] = userStyles[c];
                }
            }
        }
        function setStylesUser(conf) {
            userStyles = conf;
        }
        function show(message){
            if (screenId === null) {
                screenId = config.id;
                let el = document.createElement('div');
                el.setAttribute('id', screenId);
                let firstEl = document.body.firstChild;
                setStyles(el);
                document.body.insertBefore(el, firstEl);
            }
            let el = document.getElementById(screenId);
            message = message || '<h1 style="text-align:center">LOADING...</h1>';
            el.innerHTML = message;
            el.style.display = 'block';
        }
        function hide() {
            let el = document.getElementById(screenId);
            el.style.display = 'none';
        }
        return {
            changeId: changeId,
            setStyles: setStylesUser,
            show: show,
            hide: hide
        };
    })();

    // Analitics

    let Analytics = (function () {

        function statistics(arr) {
            let len = arr.length;
            let o = {};
            arr.forEach( (val, i) => {
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
                    percent: (o[i]/len*100).toFixed(2)
                });
            }
            newArr.sort(function (a, b) {
                return b.repeat - a.repeat;
            });

            // aset
            class aset {

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
                    this.result.forEach( (val, ii) => {
                        res += '"' + val.value + '"' + sep2 + val.repeat + sep2 + val.percent + '%';
                        if (ii < len - 1) {
                            res += sep1;
                        }
                    });
                    return res;
                }

            }

            // res
            return new aset(arr, newArr);
        }

        return {
            statistics: statistics
        };
    })();

    // MAIN OBJECT

    let GMInfo = {
        version: '2.0.0.1'
    };
    GL.gm = {
        info: GMInfo,
        StringBuilder: StringBuilder,
        str: StringBuilder,
        UrlBuilder: UrlBuilder,
        url: UrlBuilder,
        SimpleProxy: SimpleProxy,
        proxy: SimpleProxy,
        LoadScreen: LoadScreen,
        ls: LoadScreen,
        analytics: Analytics
    };
})(window);
