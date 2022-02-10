import "./index.css"
import "./dsjs/connection"
import { DSFunctionExecutor } from "./dsjs_es6/ServerFunctionExecutor-es6"
import { TServerMethods1 } from "./dsjs_es6/ServerFunctions"

var loginRequired = true;

function onLoad() {
    showTime();
    //loginRequired = <#loginRequired>;
    //setConnection('<#host>', '<#port>', '<#urlpath>');
    if (process.env.NODE_ENV === 'production'){
        setConnection('DOMAIN', null, 'DllPath');
    }
    else {
        setConnection('localhost', 9000, '');
    }
    if (loginRequired) {
        showLogin(true);
    }
    else {
        showLogin(false);
    }

    // add listen events
    document.querySelector("#loginForm").addEventListener('submit', onLogin);

    const btnReverseString = document.querySelector("#btnReverseString")
    btnReverseString.addEventListener("click", onReverseStringClick)

    const btnReverseStringFetch = document.querySelector("#btnReverseStringFetch")
    btnReverseStringFetch.addEventListener("click", doReverseStringClick)
}

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(onLoad)

function onLogin(e) {
    e.preventDefault();
    if (loginRequired) {
        if (AdminInst == null) {
            if (!setCredentials(document.getElementById('userField').value, document.getElementById('passwrdField').value)) {
                loginCorrect(false);
                return;
            }
            else {
                loginCorrect(true);
                showLogin(false);
            }
        }
    }
    else
        showLogin(false);
}

function loginCorrect(isCorrect) {
    var errorDiv = document.getElementById('loginError');
    if (errorDiv != null) {
        errorDiv.innerHTML = isCorrect ? "" : "login incorrect";
    }
}

function showLogin(show) {
    var loginDiv = document.getElementById('logindiv');
    var contentDiv = document.getElementById('contentdiv');
    if (show) {
        // show div
        loginDiv.style.display = "block";
        contentDiv.style.display = "none";
    }
    else {
        // show div
        loginDiv.style.display = "none";
        contentDiv.style.display = "block";
    }
}

function showTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var timeElement = document.getElementById('timeElement');
    if (timeElement != null) {
        timeElement.innerText =
            (h <= 9 ? "0" : "") + h + ":" +
            (m <= 9 ? "0" : "") + m + ":" +
            (s <= 9 ? "0" : "") + s;
    }
}

function serverMethods() {
    return new TServerMethods1(connectionInfo);
}

function onReverseStringClick() {
    if (loginRequired && (AdminInst == null)) {
        showLogin(true);
        return;
    }
    var valueField = document.getElementById('valueField');
    serverMethods().ReverseString(valueField.value, s=>{valueField.value = s.result});
}

function doReverseStringClick(){
    if (loginRequired && (AdminInst == null)) {
        showLogin(true);
        return;
    }

    const valueField2 = document.querySelector("#valueField2")
    const executor = new DSFunctionExecutor("TServerMethods1", connectionInfo);
    executor.executePromiseMethod("ReverseString", "GET", [valueField2.value]).then(value => valueField2.value = value)
}