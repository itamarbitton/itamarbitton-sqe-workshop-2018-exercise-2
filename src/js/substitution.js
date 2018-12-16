import * as escodegen from 'escodegen';

export {performCodeSubstitution, enviromentSub, retrieveGlobalVars};

function retrieveGlobalVars(parsedCode, env, code) {
    let lines = code.split('\n');
    let parsedProgram = parsedCode.body;
    let acc = [];
    parsedProgram.forEach(function (element){
        if(element.type === 'ExpressionStatement' || element.type === 'VariableDeclaration' )
            acc = substitution(element, env, lines);
        else
            acc = element;
    });
    parsedProgram = acc;
    let retVal = '';
    if (Array.isArray(parsedProgram)){
        parsedProgram.forEach(function (row){retVal += row + '\n';});
        return retVal;
    }
    return code.substring(parsedProgram.range[0],parsedProgram.range[1]);
}

let args = [];

function putBracketsBefore(foundParanBefore, elements, i){
    let isRedundentParan = i < elements.length-1 && (elements[i+1]==='[');
    return (foundParanBefore && !isRedundentParan);
}

function isBracketsNeeded(elements, env, token, i){
    let foundParanBefore = i > 0 && ['*', '/'].includes(elements[i-1]);
    let foundParanAfter = i < elements.length-1 && ['*', '/'].includes(elements[i+1]);
    return putBracketsBefore(foundParanBefore, elements, i) || foundParanAfter;
}

function enviromentSub(parsedCode, env){
    const statement = escodegen.generate(parsedCode).replace(/\s+/g,' ').trim();
    let elements = statement.replace(/[(]/g, '( ')
        .replace(/[)]/g, ' )')
        .replace(/[[]/g, ' [ ')
        .replace(/[\]]/g, ' ] ')
        .split(' ');
    let ans = '';
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if(element in env){
            if(isBracketsNeeded(elements, env, element, i))
                ans += ' ('+env[element]+') ';
            else
                ans += ' '+env[element];
        }
        else{ans += ' '+element;}
    }
    return ans.trim();
}

function substituteFunction(parsedCode, env, code) {
    parsedCode.params.forEach(function(param){
        args.push(param.name);
    });
    let body = substitution(parsedCode.body, env, code);
    args = [];
    return body;
}

function substituteBlockStatement(parsedCode, env, code) {
    let stmts = parsedCode.body;
    stmts.forEach(function (statement){
        code = substitution(statement, env, code);
    });
    return code;
}

function substituteVariableDeclaration(parsedCode, env, code) {
    const declarations = parsedCode.declarations;
    declarations.forEach(function (declaration) {
        let name = escodegen.generate(declaration.id);
        let init = undefined;
        if(declaration.init)
            init = enviromentSub(declaration.init, env);
        else
            init = 'null';
        env[name] = init;
    });
    let lineNum = parsedCode.loc.start.line - 1;
    let line = code[lineNum];
    code[lineNum] = line.substring(0,parsedCode.loc.start.column) +
        line.substring(parsedCode.loc.end.column);
    return code;
}

function substituteAssignmentExpression(parsedCode, env, code) {
    let name = escodegen.generate(parsedCode.left);
    let value = enviromentSub(parsedCode.right, env);
    env[name] = value;

    let lineNum = parsedCode.loc.start.line - 1;
    let line = code[lineNum];
    let pre = line.substring(0,parsedCode.right.loc.start.column);
    let post = line.substring(parsedCode.right.loc.end.column);
    if(args.includes(name))
        code[lineNum] = pre + value +  post;
    else
        code[lineNum] = '';
    return code;
}

function substituteWhileStatement(parsedCode, env, code) {
    let test = enviromentSub(parsedCode.test, env);
    let lineNum = parsedCode.loc.start.line - 1;
    let line = code[lineNum];

    code[lineNum] = line.substring(0,parsedCode.test.loc.start.column)
        + test +
        line.substring(parsedCode.test.loc.end.column);
    return substitution(parsedCode.body, cloneEnv(env) , code);
}

function substituteIfStatement(parsedCode, env, code) {
    let test = enviromentSub(parsedCode.test, env);
    let lineNum = parsedCode.loc.start.line - 1;
    let line = code[lineNum];

    code[lineNum] = line.substring(0,parsedCode.test.loc.start.column)
        + test +
        line.substring(parsedCode.test.loc.end.column);
    code = substitution(parsedCode.consequent, cloneEnv(env), code);
    if (parsedCode.alternate) {
        code = (parsedCode.alternate.type === 'IfStatement') ?
            substituteIfStatement(parsedCode.alternate, cloneEnv(env), code) :
            substitution(parsedCode.alternate, cloneEnv(env), code);

    }
    return code;
}

function substituteReturnStatement(parsedCode, env, code) {
    if(parsedCode.argument){
        let ret = enviromentSub(parsedCode.argument, env);
        let lineNum = parsedCode.loc.start.line - 1;
        let line = code[lineNum];

        code[lineNum] = line.substring(0,parsedCode.argument.loc.start.column)
            + ret +
            line.substring(parsedCode.argument.loc.end.column);
    }
    return code;
}

function performCodeSubstitution(parsedCode, code, env) {
    Object.keys(env).forEach(function(key) {
        args.push(key);
    });
    let lines = code.split('\n');
    return substitution(parsedCode, {}, lines).reduce(
        function (acc, codeRow){
            let temp = codeRow.replace(/\s/g, '').trim();
            if(temp !== '')
                return acc.concat(codeRow);
            else
                return acc;
        }
        , []);
}
function cloneEnv(env){
    return JSON.parse(JSON.stringify(env));
}

function substitution(parsedCode, env, code){
    switch (parsedCode.type) {
    case 'Program':
        return substitution(parsedCode.body[0], env, code);
    case 'ExpressionStatement':
        return substitution(parsedCode.expression, env, code);
    }
    const subMap = {
        AssignmentExpression: substituteAssignmentExpression,
        BlockStatement: substituteBlockStatement,
        FunctionDeclaration: substituteFunction,
        IfStatement: substituteIfStatement,
        ReturnStatement: substituteReturnStatement,
        VariableDeclaration: substituteVariableDeclaration,
        WhileStatement: substituteWhileStatement,
        DoWhileStatement: substituteWhileStatement };
    let decision = subMap[parsedCode.type];
    return decision.call(undefined, parsedCode, env, code);
}



