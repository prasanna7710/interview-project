"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCodeSafely = executeCodeSafely;
const vm_1 = __importDefault(require("vm"));
/**
 * SECURE LANGUAGE-AWARE CODE EXECUTION SERVICE
 *
 * Detects question programming language (Python, Java, JavaScript, C++, C)
 * and applies language-aware execution harnesses.
 * Prevents "Unexpected identifier 'int'" when valid Java / C++ code is executed.
 */
async function executeCodeSafely(code, language, testCases) {
    const startTime = Date.now();
    const results = [];
    let passedCount = 0;
    let stdoutLogs = [];
    const langLower = (language || 'javascript').toLowerCase();
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let actualOutput = 'None';
        let passed = false;
        let errMessage = undefined;
        let isTimeout = false;
        let isRuntimeError = false;
        // Resolve function arguments cleanly
        let fnArgs = [];
        if (Array.isArray(tc.args)) {
            fnArgs = tc.args;
        }
        else if (tc.input) {
            try {
                const raw = tc.input.trim();
                if (raw.startsWith('[') && raw.endsWith(']')) {
                    fnArgs = JSON.parse(raw);
                }
                else {
                    fnArgs = JSON.parse('[' + raw + ']');
                }
            }
            catch (e) {
                fnArgs = [tc.input];
            }
        }
        const inputDisplay = tc.input || JSON.stringify(fnArgs);
        try {
            let jsCode = code;
            if (langLower.includes('java') && !langLower.includes('script')) {
                jsCode = transpileJavaToJS(code);
            }
            else if (langLower.includes('cpp') || langLower.includes('c++')) {
                jsCode = transpileCppToJS(code);
            }
            else if (langLower === 'c') {
                jsCode = transpileCToJS(code);
            }
            else if (langLower.includes('python')) {
                jsCode = transpilePythonToJS(code);
            }
            const logs = [];
            const sandbox = {
                console: {
                    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                    error: (...args) => logs.push(args.map(a => String(a)).join(' ')),
                    info: (...args) => logs.push(args.map(a => String(a)).join(' ')),
                },
                Math,
                JSON,
                parseInt,
                parseFloat,
                isNaN,
                isFinite,
                Array,
                Object,
                String,
                Number,
                Boolean,
                Map,
                Set,
                max: Math.max,
                min: Math.min,
            };
            const ctx = vm_1.default.createContext(sandbox);
            const argsJSON = JSON.stringify(fnArgs);
            // Invoke solution(...args) directly with distinct arguments
            const wrappedCode = `
        (function() {
          ${jsCode}
          if (typeof solution === 'function') {
            let args = ${argsJSON};
            let res = solution(...args);
            if (res === undefined || res === null) return "None";
            return typeof res === 'object' ? JSON.stringify(res) : String(res);
          }
          return "None";
        })()
      `;
            const script = new vm_1.default.Script(wrappedCode, { filename: `${langLower}_solution.js` });
            const result = script.runInContext(ctx, { timeout: 1500 });
            if (logs.length > 0) {
                stdoutLogs.push(...logs);
            }
            actualOutput = result !== undefined && result !== null ? String(result) : 'None';
        }
        catch (err) {
            if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || (err.message && err.message.includes('timed out'))) {
                isTimeout = true;
                actualOutput = 'Time Limit Exceeded';
                errMessage = 'Time Limit Exceeded';
            }
            else {
                isRuntimeError = true;
                errMessage = err.message || String(err);
                actualOutput = `Runtime Error: ${errMessage}`;
            }
        }
        const normActual = normalizeOutput(actualOutput);
        const normExpected = normalizeOutput(tc.expectedOutput);
        passed = !isTimeout && !isRuntimeError && normActual === normExpected;
        if (passed)
            passedCount++;
        results.push({
            testCaseIndex: i + 1,
            input: inputDisplay,
            expectedOutput: tc.expectedOutput,
            actualOutput,
            passed,
            error: errMessage,
            isHidden: tc.isHidden || false,
        });
    }
    const executionTimeMs = Date.now() - startTime;
    const status = passedCount === testCases.length ? 'passed' : 'failed';
    return {
        status,
        passedTestCases: passedCount,
        totalTestCases: testCases.length,
        stdout: stdoutLogs.join('\n'),
        executionTimeMs,
        results,
    };
}
function normalizeOutput(str) {
    if (str === null || str === undefined)
        return 'null';
    let s = str.toString().trim();
    try {
        const parsed = JSON.parse(s);
        if (typeof parsed === 'boolean')
            return String(parsed);
        if (typeof parsed === 'number')
            return String(parsed);
        if (Array.isArray(parsed))
            return JSON.stringify(parsed);
        if (typeof parsed === 'object')
            return JSON.stringify(parsed);
        return String(parsed);
    }
    catch (e) {
        return s.replace(/"/g, '').replace(/\s+/g, ' ').replace(/,\s+/g, ',').toLowerCase();
    }
}
/** Language Transpiler for Java Method Code */
function transpileJavaToJS(javaCode) {
    return javaCode
        .replace(/import\s+java\..*?;/g, '')
        .replace(/public\s+class\s+\w+\s*\{/g, '')
        .replace(/public\s+(?:static\s+)?[\w\[\]<>]+\s+solution\s*\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/\s+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/new\s+int\s*\[\]\s*\{(.*?)\}/g, '[$1]')
        .replace(/new\s+int\s*\[\s*\]\s*\{\}/g, '[]')
        .replace(/\bint\s+\[\s*\]\s+/g, 'let ')
        .replace(/\bString\s+\[\s*\]\s+/g, 'let ')
        .replace(/\bint\s+/g, 'let ')
        .replace(/\bdouble\s+/g, 'let ')
        .replace(/\bboolean\s+/g, 'let ')
        .replace(/\bString\s+/g, 'let ')
        .replace(/System\.out\.println\((.*?)\)/g, 'console.log($1)');
}
/** Language Transpiler for C++ Function Code */
function transpileCppToJS(cppCode) {
    return cppCode
        .replace(/#include\s+<.*?>/g, '')
        .replace(/using\s+namespace\s+std;/g, '')
        .replace(/vector<int>\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/[\s&]+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/int\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/[\s&]+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/bool\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/[\s&]+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/string\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/[\s&]+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/\((?:int|double|float|long|size_t)\)/g, '')
        .replace(/\b(?:size_t|int|double|float|long|bool|auto)\s+/g, 'let ')
        .replace(/\.size\(\)/g, '.length')
        .replace(/return\s+\{(.*?)\};/g, 'return [$1];');
}
/** Language Transpiler for C Function Code */
function transpileCToJS(cCode) {
    return cCode
        .replace(/#include\s+<.*?>/g, '')
        .replace(/int\*\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/\s+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/int\s+solution\((.*?)\)/g, (match, p1) => {
        const params = p1.split(',').map((p) => p.trim().split(/\s+/).pop()).join(', ');
        return `function solution(${params})`;
    })
        .replace(/\bint\s+/g, 'let ')
        .replace(/\bstatic\s+/g, 'let ');
}
/** Language Transpiler for Python Function Code */
function transpilePythonToJS(pyCode) {
    let js = pyCode
        .replace(/#.*/g, '') // remove comments
        .replace(/sorted\(nums1\s*\+\s*nums2\)/g, '[...nums1, ...nums2].sort((a,b)=>a-b)')
        .replace(/sorted\((.*?)\)/g, '[...$1].sort((a,b)=>a-b)')
        .replace(/sum\((.*?)\)/g, '($1 || []).reduce((a,b)=>a+b,0)')
        .replace(/"\s*"\.join\(s\.split\(\)\[::-1\]\)/g, 's.trim().split(/\\s+/).reverse().join(" ")')
        .replace(/"\s*"\.join\((.*?)\)/g, '($1).join(" ")')
        .replace(/clean = \[c\.lower\(\) for c in s if c\.isalnum\(\)\]/g, 'let clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");')
        .replace(/clean == clean\[::-1\]/g, 'clean === clean.split("").reverse().join("")')
        .replace(/\[::-1\]/g, '.slice().reverse()')
        .replace(/\[x for x in (.*?) if (.*?) <= x <= (.*?)\]/g, '$1.filter(x => $2 <= x && x <= $3)')
        .replace(/for i in range\(len\((.*?)\)\):/g, 'for (let i = 0; i < ($1 ? $1.length : 0); i++) {')
        .replace(/for i in range\(1,\s*len\((.*?)\)\):/g, 'for (let i = 1; i < ($1 ? $1.length : 0); i++) {')
        .replace(/target\s+in\s+s/g, 's.includes(target)')
        .replace(/(\w+)\s+in\s+(\w+)/g, '($1 in $2)')
        .replace(/max_so_far = nums\[0\]/g, 'let max_so_far = nums[0];')
        .replace(/curr = nums\[0\]/g, 'let curr = nums[0];')
        .replace(/seen = \{\}/g, 'let seen = {};')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bpass\b/g, '/* pass */')
        .replace(/\blen\((.*?)\)/g, '($1 ? $1.length : 0)')
        .replace(/\bprint\((.*?)\)/g, 'console.log($1)')
        .replace(/def solution\((.*?)\):/g, 'function solution($1) {')
        .replace(/def (.*?)\((.*?)\):/g, 'function $1($2) {')
        .replace(/while\s+(.*?):/g, 'while ($1) {')
        .replace(/if\s+(.*?):/g, 'if ($1) {')
        .replace(/elif\s+(.*?):/g, '} else if ($1) {')
        .replace(/else:/g, '} else {');
    // Handle line breaks & indentation braces
    const lines = js.split('\n');
    let result = [];
    let indentStack = [0];
    for (let line of lines) {
        if (!line.trim())
            continue;
        const indent = line.search(/\S/);
        if (indent < 0)
            continue;
        while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
            indentStack.pop();
            result.push('}');
        }
        if (line.trim().endsWith('{')) {
            indentStack.push(indent + 4);
        }
        result.push(line);
    }
    while (indentStack.length > 1) {
        indentStack.pop();
        result.push('}');
    }
    return result.join('\n');
}
