import "./index.css"
import "./dsjs/connection"
import "./dsjs/ServerFunctionExecutor"

class DSFunctionExecutor extends ServerFunctionExecutor {
    constructor(className, connectionInfo, owner) {
        super(className, connectionInfo, owner)
    }

    /**
     * This function executes the given method with the specified parameters and then
     * notifies the Promise when a response is received.
     * @param url the url to invoke
     * @param contentParam the parameter to pass through the content of the request (or null)
     * @param requestType must be one of: GET, POST, PUT, DELETE
     * @return This function will return the result that would have otherwise been passed to the Promise.
     */
    async #fetchMethodURL(url, contentParam, requestType) {
        requestType = validateRequestType(requestType);

        const fetchHeaders = new Headers();
        fetchHeaders.append("Accept", "application/json");
        fetchHeaders.append("Content-Type", "text/plain;charset=UTF-8");
        fetchHeaders.append("If-Modified-Since", "Mon, 1 Oct 1990 05:00:00 GMT");
        const sessId = getSessionID();
        if (sessId != null)
            fetchHeaders.append("Pragma", "dssession=" + sessId);
        if (this.authentication != null)
            fetchHeaders.append("Authorization", "Basic " + this.authentication);

        const fetchParams = {
            method: requestType,
            body: contentParam,
            headers: fetchHeaders,
        }
        try {
            const response = await fetch(url, fetchParams)
            this.#parseFetchSessionID(response);
            const responseText = await response.text();
            let JSONResultWrapper = null;
            try {
                JSONResultWrapper = JSON.parse(responseText);
            }
            catch (e) {
                JSONResultWrapper = responseText;
            }
            if (response.status == 403) {
                if (JSONResultWrapper != null && JSONResultWrapper.SessionExpired != null) {
                    //the session is no longer valid, so clear the stored session ID
                    //a new session will be creates the next time the user invokes a server function
                    setSessionData(null, null);
                }
            }
            //all other results (including other errors)
            //return JSONResultWrapper;
            const returnObject = JSONResultWrapper;
            if (returnObject != null && returnObject.result != null && Array.isArray(returnObject.result)) {
                return returnObject.result[0];
            }
            return returnObject;
        }
        catch (err) {
            console.error('Error:', err)
            return err
        }
    };

    /**
     * This function executes the given method with the specified parameters and then
     * notifies the callback when a response is received.
     * @param methodName the name of the method in the class to invoke
     * @param requestType must be one of: GET, POST, PUT, DELETE
     * @param params an array of parameter values to pass into the method, or a single parameter value
     * @param hasResult true if a result from the server call is expected, false to ignore any result returned.
     *                  This is an optional parameter and defaults to 'true'
     * @param requestFilters JSON Object containing pairs of key/value filters to add to the request (filters such as ss.r, for example.)
     * @param accept The string value to set for the Accept header of the HTTP request, or null to set application/json
     * @return This function will return the result that would have otherwise been passed to the Promise.
     */
    async fetchMethod(methodName, requestType, params, requestFilters) {
        const url = this.getMethodURL(methodName, requestType, params, requestFilters);
        return await this.#fetchMethodURL(url[0], url[1], requestType);
    };

    /**
     * Tries to get the session ID from the Pragma header field of the given request/response object
     * If successful, will set the value of the $$SessionID$$ and $$SessionExpires$$ variables accordingly.
     * @param response the response from the http request
     */
    #parseFetchSessionID(response) {
        if (response != null) {
            //pragma may store the Session ID value to use in future calls
            var pragmaStr = response.headers.get("Pragma");

            if (pragmaStr != null) {
                //Header looks like this, if set: Pragma: dssession=$$SessionID$$,dssessionexpires=$$SessionExpires$$
                var sessKey = "dssession=";
                var expireKey = "dssessionexpires=";
                var sessIndx = pragmaStr.indexOf("dssession=");

                if (sessIndx > -1) {
                    var commaIndx = pragmaStr.indexOf(",", sessIndx);
                    commaIndx = commaIndx < 0 ? pragmaStr.length : commaIndx;
                    sessIndx = sessIndx + sessKey.length;
                    var sessionId = pragmaStr.substr(sessIndx, (commaIndx - sessIndx));

                    var sessionExpires = null;
                    var expiresIndx = pragmaStr.indexOf(expireKey);
                    if (expiresIndx > -1) {
                        commaIndx = pragmaStr.indexOf(",", expiresIndx);
                        commaIndx = commaIndx < 0 ? pragmaStr.length : commaIndx;
                        expiresIndx = expiresIndx + expireKey.length;
                        var expiresMillis = parseInt(pragmaStr.substr(expiresIndx, (commaIndx - expiresIndx)));
                        if (expiresMillis != 0 && expiresMillis != NaN) {
                            sessionExpires = new Date();
                            sessionExpires.setMilliseconds(sessionExpires.getMilliseconds() + expiresMillis);
                        }
                    }

                    setSessionData(sessionId, sessionExpires);
                }
            }
        }
    }


    /**
     * This function executes the given method with the specified parameters and then
     * notifies the callback when a response is received.
     * @param url the url to invoke
     * @param contentParam the parameter to pass through the content of the request (or null)
     * @param requestType must be one of: GET, POST, PUT, DELETE
     * @return This function will return the result that would have 
     *         otherwise been passed to the Promise resolve
     */
    #executePromiseMethodURL(url, contentParam, requestType) {
        const request = getXmlHttpObject();
        return new Promise((resolve, reject) => {
            requestType = validateRequestType(requestType);

            request.open(requestType, url, true);

            request.onreadystatechange = function () {
                if (request.readyState == 4) {
                    let JSONResult = parseHTTPResponse(request);
                    if (JSONResult != null && JSONResult.result != null && Array.isArray(JSONResult.result)) {
                        resolve(JSONResult.result[0], request.status, this.owner);
                    }
                    else
                        reject("Error, status code = " + request.status + "Message : " + JSONResult);
                    /*
                        if (request.status >= 300) {
                            reject("Error, status code = " + request.status)
                        } else {
                            resolve(request.responseText);
                        }
                    */
                }
            };

            if (contentParam != null) {
                contentParam = JSON.stringify(contentParam);
            }

            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            request.setRequestHeader("If-Modified-Since", "Mon, 1 Oct 1990 05:00:00 GMT");

            var sessId = getSessionID();
            if (sessId != null) {
                request.setRequestHeader("Pragma", "dssession=" + sessId);
            }
            if (this.authentication != null) {
                request.setRequestHeader("Authorization", "Basic " + this.authentication);
            }
            request.send(contentParam);
        })
    };

    /**
     * This function executes the given method with the specified parameters and then
     * notifies the callback when a response is received.
     * @param methodName the name of the method in the class to invoke
     * @param requestType must be one of: GET, POST, PUT, DELETE
     * @param params an array of parameter values to pass into the method, or a single parameter value
     * @param requestFilters JSON Object containing pairs of key/value filters to add to the request (filters such as ss.r, for example.)
     * @param accept The string value to set for the Accept header of the HTTP request, or null to set application/json
     * @return if callback in null then this function will return the result that would have 
     *         otherwise been passed to the callback
     */
    async executePromiseMethod(methodName, requestType, params, requestFilters) {
        const url = this.getMethodURL(methodName, requestType, params, requestFilters);
        try {
            return await this.#executePromiseMethodURL(url[0], url[1], requestType);
        }
        catch (err) {
            return err
        }
    };
}


const btn = document.querySelector("#btn")
const num = document.querySelector("#num")

btn.addEventListener("click", function () {
    const a = parseInt(num.innerText, 10)
    num.innerText = a + 1
})
setConnection("localhost", "9000", "")

//var oldExecutor = new ServerFunctionExecutor("TServerMethods1", connectionInfo);
//console.log("EchoString : ", oldExecutor.executeMethod("EchoString", "GET", ["A B C"]))

var executor = new DSFunctionExecutor("TServerMethods1", connectionInfo);
executor.executePromiseMethod("EchoString", "GET", ["A B C"]).then(value=>console.log("XRH Promise : ", value))
