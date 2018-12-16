import $ from 'jquery';
import {handleCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let inputCode = $('#codePlaceholder').val();
        let functionArguments = '[' + $('#argsPlaceholder').val() + ']';
        //functionArguments = JSON.parse(functionArguments);
        const finalCode = handleCode(inputCode, eval(functionArguments));
        let presentationHtml = '';
        finalCode.forEach(function (row){
            presentationHtml = presentationHtml.concat(row.replace(/\s\s\s\s/g, '&nbsp;&nbsp;&nbsp;&nbsp;')) + '<br>\n';
        });
        document.getElementById('result').innerHTML = presentationHtml;
    });
});