QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});

// tests
QUnit.test( "String Builder - remove", function( assert ) {
    let res = golem.utils.StringBuilder.remove('1a1b1c1', '1');
    assert.ok( res === "abc", "remove" );
});

QUnit.test( "String Builder - removeArr", function( assert ) {
    let res = golem.utils.StringBuilder.removeArr(['abc1', '11a'], '1');
    assert.ok(  res[0] === "abc", "removeArr" );
    assert.ok(  res[1] === "a", "removeArr" );
});

QUnit.test( "String Builder - parse", function( assert ) {
    let res = golem.utils.StringBuilder.parse('aaa.bbb.ccc', '.', 1);
    assert.ok(  res === "aaa", "parse pos = number" );
    let res2 = golem.utils.StringBuilder.parse('aaa.bbb.ccc', '.', [2, 3]);
    assert.ok(  res2[0] === "bbb", "parse pos = array" );
    assert.ok(  res2[1] === "ccc", "parse pos = array" );
});

QUnit.test( "String Builder - parseArr", function( assert ) {
    let res = golem.utils.StringBuilder.parseArr(['aaa.bbb', 'ccc.ddd'], '.', 2);
    assert.ok(  res[0] === "bbb", "parseArr pos = number" );
    assert.ok(  res[1] === "ddd", "parseArr pos = number" );
});

QUnit.test( "String Builder - build", function( assert ) {
    let res = golem.utils.StringBuilder.build('aaa {1} bbb', 'sss');
    assert.ok(  res === "aaa sss bbb", "build simple" );
    let res2 = golem.utils.StringBuilder.build('aaa {1} {2} bbb', ['111', '222']);
    assert.ok(  res2 === "aaa 111 222 bbb", "build simple with array" );
    let res3 = golem.utils.StringBuilder.build('aaa %x% bbb', 'sss', '%x%');
    assert.ok(  res3 === "aaa sss bbb", "build simple with custom symbol" );
});

QUnit.test( "String Builder - buildArr", function( assert ) {
    let res = golem.utils.StringBuilder.buildArr(['aaa {1} bbb', 'ccc {1} ddd'], 'sss', 'fff');
    assert.ok(  res[0] === "aaa sss bbb", "buildArr simple" );
    assert.ok(  res[1] === "ccc fff ddd", "buildArr simple" );
    let res2 = golem.utils.StringBuilder.buildArr(['aaa {1} {2} bbb', 'ccc {1} {2} ddd'], ['111', '222'], ['333', '444']);
    assert.ok(  res2[0] === "aaa 111 222 bbb", "buildArr simple with array" );
    assert.ok(  res2[1] === "ccc 333 444 ddd", "buildArr simple with array" );
});

QUnit.test( "String Builder - buildArrStepByStep", function( assert ) {
    let res = golem.utils.StringBuilder.buildArrStepByStep('aaa {1} {2} {3}', [1,2,3], [4,5,6], [7,8,9]);
    assert.ok(  res[0] === "aaa 1 4 7", "buildArrStepByStep" );
    assert.ok(  res[1] === "aaa 2 5 8", "buildArrStepByStep" );
    assert.ok(  res[2] === "aaa 3 6 9", "buildArrStepByStep" );
});