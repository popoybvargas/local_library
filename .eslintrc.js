module.exports = {
    extends: [ "standard" ],
    rules:
    {
        "brace-style": [ "error", "allman", { "allowSingleLine": true } ],
        "camelcase": "warn",
        "eol-last": [ "error", "never" ],
        // allow async-await
        'generator-star-spacing': 'off',
        "indent": "off",
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        "no-tabs": "off",
        "no-trailing-spaces": [ "error", { "skipBlankLines": true, "ignoreComments": true } ],
        "no-unused-vars": "warn",
        "prefer-promise-reject-errors": [ "error", { "allowEmptyReject": true } ],
        "semi": [ "error", "always" ],
        "space-before-function-paren": [ "warn", "always" ],
        "space-in-parens": [ "error", "always", { "exceptions": [ "{}", "[]", "()", "empty" ] } ],
        "space-unary-ops": [ "error", { "words": true, "nonwords": true, "overrides": { "++": false, "-": false } } ]
    }
};