module.exports = {
	'extends': 'eslint-config-google',
	'parserOptions': {
		'ecmaVersion': 8,
		'sourceType': 'module',
	},
	'env': {
		'node': true,
		'es6': true,
	},
	'rules': {
		'linebreak-style': 'ignore',
		'indent': ['error', 'tab'],
		'no-tabs': ['error', {allowIndentationTabs: true}],
	},
};
