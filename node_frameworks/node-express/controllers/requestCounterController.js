let requestedAddresses = {}

export function countRequest(req, res, next) {
    req.message = "Hello from middleware"
    if (requestedAddresses[req.originalUrl])
        requestedAddresses[req.originalUrl]++
    else
        requestedAddresses[req.originalUrl] = 1
    console.log(requestedAddresses)
    next()
}

export function logRequest(req, res, next) {
    console.log(req.message)
    console.log(req.host + req.baseUrl + req.originalUrl)
    next()
}

export function checkAuthorized(req, res, next) {
    console.log("Checking for authorization...")
    next()
}

export function getRequestStats(req, res) {
    res.json(requestedAddresses)
}