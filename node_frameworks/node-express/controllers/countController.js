let counts = {}

export function countRequest(req, res, next) {
    if (counts[req.originalUrl]) {
        counts[req.originalUrl]++
    } else {
        counts[req.originalUrl] = 1
    }
    console.log(counts)
    next()
}

export function getCounts(req, res) {
    res.json(counts)
}