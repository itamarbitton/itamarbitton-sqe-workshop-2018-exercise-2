import {enviromentSub} from './substitution';
export {performCodeEvaluation};


function evaluateIfStatement(parsedCode, env, code) {
    const test = enviromentSub(parsedCode.test, env);
    const lineNum = parsedCode.loc.start.line - 1;
    if(eval(test)){
        code[lineNum] = `<span style="background-color: #b6ff33">${code[lineNum]}</span>`;
        code = evaluate(parsedCode.consequent, cloneEnv(env), code);
    }else{
        code[lineNum] = `<span style="background-color: #ff5733">${code[lineNum]}</span>`;
        if (parsedCode.alternate) {
            code = (parsedCode.alternate.type === 'IfStatement') ?
                evaluateIfStatement(parsedCode.alternate, cloneEnv(env), code) :
                evaluate(parsedCode.alternate, cloneEnv(env), code);
        }
    }
    return code;
}


function evaluateBlockStatement(parsedCode, env, code) {
    const blockStatements = parsedCode.body;
    blockStatements.forEach(function (statement){
        code = evaluate(statement, env, code);
    });
    return code;
}

let codeRet = ['AssignmentExpression', 'ReturnStatement'];
let whileLoops = ['DoWhileStatement', 'WhileStatement'];
let simpleCases = ['Program', 'FunctionDeclaration', 'ExpressionStatement'].concat(whileLoops, codeRet);


function handleSimple(parsedCode, env, code){
    if(codeRet.includes(parsedCode.type)) {return code;}
    else if(whileLoops.includes(parsedCode.type)){return evaluate(parsedCode.body, cloneEnv(env) , code);}
    else if('FunctionDeclaration' === parsedCode.type){return evaluate(parsedCode.body, env, code);}
    else if('ExpressionStatement' === parsedCode.type){return evaluate(parsedCode.expression, env, code);}
    else
        return evaluate(parsedCode.body[0], env, code);
}

function evaluate(parsedCode, env, code){
    const complexCases = {
        BlockStatement: evaluateBlockStatement,
        IfStatement: evaluateIfStatement,
    };
    if(simpleCases.includes(parsedCode.type))
        return handleSimple(parsedCode, env, code);
    let complexEval = complexCases[parsedCode.type];
    return complexEval.call(undefined, parsedCode, env, code);
}

function cloneEnv(env){
    return JSON.parse(JSON.stringify(env));
}

function getFuncArgAndValues(parsedCode, args, env){
    let func = parsedCode.body[0];
    for (let i = 0; i < func.params.length; i++){
        if(Array.isArray(args[i]))
            env[func.params[i].name] = JSON.stringify(args[i]);
        else
            env[func.params[i].name] = args[i];
    }
    return env;
}

function performCodeEvaluation(parsedCode, lines, args, env){
    const initialVector = getFuncArgAndValues(parsedCode, args, env);
    return evaluate(parsedCode, initialVector, lines);
}
