/* eslint-disable max-lines-per-function */

import assert from 'assert';
import {handleCode} from '../src/js/code-analyzer';

describe('workshop no. 2', () => {
    it('test1', () => {
        let code =
            'function test1(x,y){\n' +
                'let i = x + y;\n' +
                'if(i > 2 * x)\n' +
                    'return i;\n' +
                'else if(i <= 2*y)\n' +
                    'return y;\n' +
                'return 1;\n' +
            '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[1,1]')));
        assert.equal(
            finalCode,
            '["function test1(x,y){","<span style=\\"background-color: #ff5733\\">if(x + y > 2 * x)</span>","return x + y;","<span style=\\"background-color: #b6ff33\\">else if(x + y <= 2 * y)</span>","return y;","return 1;","}"]'
        );
    });

    it('test2', () => {
        let code =
            'let firstGlobal = 1;\n' +
            'let secondGlobal = 1;\n' +
            'function test2(x,y){\n' +
            'let i = firstGlobal + secondGlobal;\n' +
            'if(i > x)\n' +
            'return i;\n' +
            'else if(i <= 2*y)\n' +
            'return y;\n' +
            'return 1;\n' +
            '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[2,2]')));
        assert.equal(
            finalCode,
            '["function test2(x,y){","<span style=\\"background-color: #ff5733\\">if(firstGlobal + secondGlobal > x)</span>","return firstGlobal + secondGlobal;","<span style=\\"background-color: #b6ff33\\">else if(firstGlobal + secondGlobal <= 2 * y)</span>","return y;","return 1;","}"]'
        );
    });


    it('test3', () => {
        let code =
        'let firstGlobal = 1;\n' +
        'let secondGlobal = 1;\n' +
        'function test3(x,y){\n' +
            'let i = firstGlobal + secondGlobal;\n' +
            'while(i > x){\n' +
                'if(1>0)\n' +
                    'return true;\n' +
                'else\n' +
                    'return false;\n' +
            '}\n' +
            'return i;\n' +
        '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[2,2]')));
        assert.equal(
            finalCode,
            '["function test3(x,y){","while(firstGlobal + secondGlobal > x){","<span style=\\"background-color: #b6ff33\\">if(1 > 0)</span>","return true;","else","return false;","}","return firstGlobal + secondGlobal;","}"]'
        );
    });

    it('test4', () => {
        let code =
        'let firstGlobal = 1;\n' +
        'let secondGlobal = 1;\n' +
        'function test4(x,y){\n' +
            'let i = firstGlobal + secondGlobal;\n' +
            'let j = i + i;\n' +
            'if(j > i)\n' +
                'return x[0];\n' +
            'else\n' +
                'return y[0];\n' +
        '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[[1],[2]]')));
        assert.equal(
            finalCode,
            '["function test4(x,y){","<span style=\\"background-color: #b6ff33\\">if(firstGlobal + secondGlobal + firstGlobal + secondGlobal > firstGlobal + secondGlobal)</span>","return x [ 0 ];","else","return y [ 0 ];","}"]'
        );
    });

    it('test5', () => {
        let code =
            'function foo(x, y, z){\n' +
                'let a = x + 1;\n' +
                'let b = a + y;\n' +
                'let c = 0;\n' +

                'if (b < z) {\n' +
                    'c = c + 5;\n' +
                    'return x + y + z + c;\n' +
                '} else if (b < z * 2) {\n' +
                    'c = c + x + 5;\n' +
                    'return x + y + z + c;\n' +
                '} else {\n' +
                    'c = c + z + 5;\n' +
                    'return x + y + z + c;\n' +
                '}\n' +
            '}';

        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[1,2,3]')));
        assert.equal(
            finalCode,
            '["function foo(x, y, z){","<span style=\\"background-color: #ff5733\\">if (x + 1 + y < z) {</span>","return x + y + z + 0 + 5;","<span style=\\"background-color: #b6ff33\\">} else if (x + 1 + y < z * 2) {</span>","return x + y + z + 0 + x + 5;","} else {","return x + y + z + 0 + z + 5;","}","}"]'
        );
    });

    it('test6', () => {
        let code =
            'function foo(x, y, z){\n' +
                'let a = x + 1;\n' +
                'let b = a + y;\n' +
                'let c = 0;\n' +
                'while (a < z) {\n' +
                    'c = a + b;\n' +
                    'z = c * 2;\n' +
                '}\n' +
                'return z;\n' +
            '}';


        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[1,1,1]')));
        assert.equal(
            finalCode,
            '["function foo(x, y, z){","while (x + 1 < z) {","z = (x + 1 + x + 1 + y)  * 2;","}","return z;","}"]'
        );
    });

    it('test7', () => {
        let code =
        'let before = 1;\n' +
        'function test7(x,y){\n' +
            'let i = before + after;\n' +
            'if(i > x + y)\n' +
                'return i;\n' +
            'else if(x+y <= i)\n' +
                'return x+y;\n' +
        '}\n' +
        'let after = 10;';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[5,5]')));
        assert.equal(
            finalCode,
            '["function test7(x,y){","<span style=\\"background-color: #b6ff33\\">if(before + after > x + y)</span>","return before + after;","else if(x + y <= before + after)","return x + y;","}"]'
        );
    });


    it('test8', () => {
        let code =
        'let a = 1;\n' +
        'let b = 2;\n' +
        'function test8(x,y){\n' +
            'let i, j=10;\n' +
            'if(a + b > x + y)\n' +
                'return j;\n' +
            'else if(x + y >= a + b)\n' +
                'return j+j;\n' +
            'return i;\n' +
        '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[5,5]')));
        assert.equal(
            finalCode,
            '["function test8(x,y){","<span style=\\"background-color: #ff5733\\">if(a + b > x + y)</span>","return 10;","<span style=\\"background-color: #b6ff33\\">else if(x + y >= a + b)</span>","return 10 + 10;","return null;","}"]'
        );
    });

    it('test9', () => {
        let code =
            'function test9(x,y){\n' +
                'if(x[1] > y)\n' +
                    'return x[2];\n' +
                'else\n' +
                    'return x[1];\n' +
            '}';
        let finalCode = JSON.stringify(handleCode(code, JSON.parse('[[1,2,3],10]')));
        assert.equal(
            finalCode,
            '["function test9(x,y){","<span style=\\"background-color: #ff5733\\">if(x [ 1 ]  > y)</span>","return x [ 2 ];","else","return x [ 1 ];","}"]'
        );
    });

    it('test10', () => {
        let code = 'function test10(i,j,k){\n' +
            'return;\n' +
            '}\n';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[1,2,3]'))),
            '["function test10(i,j,k){","return;","}"]'
        );
    });

    it('test11', () => {
        let code = 'function test11(i, j, k){\n' +
            'let a = i + 1;\n' +
            'let b = a + j;\n' +
            'let c = 0;\n' +
            'if (b < k) {\n' +
            'c = c + 5;\n' +
            'return i + j + k + c;\n' +
            '}\n' +
            'return k;\n' +
            '}\n';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[1,2,3]'))),
            '["function test11(i, j, k){","<span style=\\"background-color: #ff5733\\">if (i + 1 + j < k) {</span>","return i + j + k + 0 + 5;","}","return k;","}"]'
        );
    });

    it('test12', () => {
        let code =
            'let a = 13;\n' +
        'function test12(){\n' +
            'let b = [1,2,3];\n' +
            'if(b[0] < a)\n' +
                'return b[1];\n' +
            'else\n' +
                'return b[2];\n' +
        '}';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[1,2,3]'))),
            '["function test12(){","<span style=\\"background-color: #b6ff33\\">if([  1, 2, 3  ] [ 0 ]  < a)</span>","return [  1, 2, 3  ] [ 1 ];","else","return [  1, 2, 3  ] [ 2 ];","}"]'
        );
    });


    it('test13', () => {
        let code =
        'let glob = 5;\n' +
        'function test13(arr){\n' +
            'if(arr == null)\n' +
                'return true;\n' +
            'else\n' +
                'return false;\n' +
        '}';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[]'))),
            '["function test13(arr){","<span style=\\"background-color: #b6ff33\\">if(arr == null)</span>","return true;","else","return false;","}"]'
        );
    });

    it('test14', () => {
        let code =
            'function test14(x,y){\n' +
                'let z = x + y;\n' +
                'return z;\n' +
            '}';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[5,5]'))),
            '["function test14(x,y){","return x + y;","}"]'
        );
    });

    it('test15', () => {
        let code =
            'function test15(x){\n' +
                'let z = (x%2 == 0);\n' +
                'return z;\n' +
            '}';
        assert.equal(
            JSON.stringify(handleCode(code, JSON.parse('[5,5]'))),
            '["function test15(x){","return x % 2 == 0;","}"]'
        );
    });

});
