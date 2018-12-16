
import * as esprima from 'esprima';
import {performCodeSubstitution, retrieveGlobalVars} from './substitution';
import {performCodeEvaluation} from './evaluateAndPaint';
export {parseCode, handleCode};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{ loc: true ,range: true});
};

function handleCode(code, args){
    let env = {};
    code = retrieveGlobalVars(parseCode(code), env, code);

    let parsedCode = parseCode(code);
    let substitutedCode = performCodeSubstitution(parsedCode, code, env);

    let noLocalsCode = '';
    substitutedCode.forEach(function (row){
        noLocalsCode += row + '\n';
    });
    const parsedSubCode = parseCode(noLocalsCode);
    return performCodeEvaluation(parsedSubCode, substitutedCode, args, env);
}
