// fn is an async function. So it returns a promise. Thus you can attach a catch hanlder to it.
// We need not attach then handler because, all results are awaited inside async function.
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
