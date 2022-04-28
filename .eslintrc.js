module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: [
		'xo',
		'xo-react',
		'plugin:import/recommended',
	],
	globals: {
		jest: 'readonly',
		describe: 'readonly',
		test: 'readonly',
		expect: 'readonly',
		beforeEach: 'readonly',
		afterEach: 'readonly',
		web: 'readonly',
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
	},
	plugins: [
		'react',
		'import',
	],
	rules: {
		'comma-dangle': ['error', 'always-multiline'],
		'no-eq-null': 'off',
		eqeqeq: ['error', 'allow-null'],
		'valid-jsdoc': ['error', {requireParamDescription: false, requireReturnDescription: false}],

		// Static analysis:

		// Ensure imports point to files/modules that can be resolved
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
		'import/no-unresolved': ['error', {commonjs: true, caseSensitive: true}],

		// Ensure named imports coupled with named exports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/named.md#when-not-to-use-it
		'import/named': 'error',

		// Ensure default import coupled with default export
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/default.md#when-not-to-use-it
		'import/default': 'off',

		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/namespace.md
		'import/namespace': 'off',

		// Helpful warnings:

		// Disallow invalid exports, e.g. multiple defaults
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/export.md
		'import/export': 'error',

		// Do not allow a default import name to match a named export
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-named-as-default.md
		'import/no-named-as-default': 'error',

		// Warn on accessing default export property names that are also named exports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-named-as-default-member.md
		'import/no-named-as-default-member': 'error',

		// Disallow use of jsdoc-marked-deprecated imports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-deprecated.md
		'import/no-deprecated': 'off',

		// Forbid mutable exports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-mutable-exports.md
		'import/no-mutable-exports': 'error',

		// Module systems:

		// disallow require()
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-commonjs.md
		'import/no-commonjs': 'off',

		// Disallow AMD require/define
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-amd.md
		'import/no-amd': 'error',

		// No Node.js builtin modules
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-nodejs-modules.md
		'import/no-nodejs-modules': 'off',

		// Style guide:

		// disallow non-import statements appearing before import statements
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/first.md
		'import/first': 'error',

		// Disallow non-import statements appearing before import statements
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/imports-first.md
		// deprecated: use `import/first`
		'import/imports-first': 'off',

		// Disallow duplicate imports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
		'import/no-duplicates': 'error',

		// Disallow namespace imports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-namespace.md
		'import/no-namespace': 'off',

		// Ensure consistent use of file extension within the import path
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/extensions.md
		'import/extensions': ['error', 'ignorePackages', {
			js: 'never',
			mjs: 'never',
			jsx: 'never',
		}],

		// Ensure absolute imports are above relative imports and that unassigned imports are ignored
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
		'import/order': ['error', {groups: [['builtin', 'external', 'internal']]}],

		// Require a newline after the last import/require in a group
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/newline-after-import.md
		'import/newline-after-import': 'error',

		// Require modules with a single export to use a default export
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/prefer-default-export.md
		'import/prefer-default-export': 'error',

		// Restrict which files can be imported in a given folder
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-restricted-paths.md
		'import/no-restricted-paths': 'off',

		// Forbid modules to have too many dependencies
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/max-dependencies.md
		'import/max-dependencies': ['off', {max: 10}],

		// Forbid import of modules using absolute paths
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-absolute-path.md
		'import/no-absolute-path': 'error',

		// Prevent importing the submodules of other modules
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-internal-modules.md
		'import/no-internal-modules': ['off', {
			allow: [],
		}],

		// Warn if a module could be mistakenly parsed as a script by a consumer
		// leveraging Unambiguous JavaScript Grammar
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/unambiguous.md
		// this should not be enabled until this proposal has at least been *presented* to TC39.
		// At the moment, it's not a thing.
		'import/unambiguous': 'off',

		// Forbid Webpack loader syntax in imports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-webpack-loader-syntax.md
		'import/no-webpack-loader-syntax': 'error',

		// Prevent unassigned imports
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unassigned-import.md
		// importing for side effects is perfectly acceptable, if you need side effects.
		'import/no-unassigned-import': 'off',

		// Prevent importing the default as if it were named
		// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-named-default.md
		'import/no-named-default': 'error',

		// Reports if a module's default export is unnamed
		// https://github.com/benmosher/eslint-plugin-import/blob/d9b712ac7fd1fddc391f7b234827925c160d956f/docs/rules/no-anonymous-default-export.md
		'import/no-anonymous-default-export': ['off', {
			allowArray: false,
			allowArrowFunction: false,
			allowAnonymousClass: false,
			allowAnonymousFunction: false,
			allowLiteral: false,
			allowObject: false,
		}],

		// This rule enforces that all exports are declared at the bottom of the file
		// https://github.com/benmosher/eslint-plugin-import/blob/98acd6afd04dcb6920b81330114e146dc8532ea4/docs/rules/exports-last.md
		'import/exports-last': 'off',

		// Reports when named exports are not grouped together in a single export declaration
		// or when multiple assignments to CommonJS module.exports or exports object are present
		// in a single file.
		// https://github.com/benmosher/eslint-plugin-import/blob/44a038c06487964394b1e15b64f3bd34e5d40cde/docs/rules/group-exports.md
		'import/group-exports': 'off',

		// Forbid default exports. this is a terrible rule, do not use it.
		// https://github.com/benmosher/eslint-plugin-import/blob/44a038c06487964394b1e15b64f3bd34e5d40cde/docs/rules/no-default-export.md
		'import/no-default-export': 'off',

		// Prohibit named exports. this is a terrible rule, do not use it.
		// https://github.com/benmosher/eslint-plugin-import/blob/1ec80fa35fa1819e2d35a70e68fb6a149fb57c5e/docs/rules/no-named-export.md
		'import/no-named-export': 'off',

		// Forbid a module from importing itself
		// https://github.com/benmosher/eslint-plugin-import/blob/44a038c06487964394b1e15b64f3bd34e5d40cde/docs/rules/no-self-import.md
		'import/no-self-import': 'error',

		// Forbid cyclical dependencies between modules
		// https://github.com/benmosher/eslint-plugin-import/blob/d81f48a2506182738409805f5272eff4d77c9348/docs/rules/no-cycle.md
		'import/no-cycle': ['error', {maxDepth: '∞'}],

		// Ensures that there are no useless path segments
		// https://github.com/benmosher/eslint-plugin-import/blob/ebafcbf59ec9f653b2ac2a0156ca3bcba0a7cf57/docs/rules/no-useless-path-segments.md
		'import/no-useless-path-segments': ['error', {commonjs: true}],

		// Dynamic imports require a leading comment with a webpackChunkName
		// https://github.com/benmosher/eslint-plugin-import/blob/ebafcbf59ec9f653b2ac2a0156ca3bcba0a7cf57/docs/rules/dynamic-import-chunkname.md
		'import/dynamic-import-chunkname': ['off', {
			importFunctions: [],
			webpackChunknameFormat: '[0-9a-zA-Z-_/.]+',
		}],

		// Use this rule to prevent imports to folders in relative parent paths.
		// https://github.com/benmosher/eslint-plugin-import/blob/c34f14f67f077acd5a61b3da9c0b0de298d20059/docs/rules/no-relative-parent-imports.md
		'import/no-relative-parent-imports': 'off',

		// Reports modules without any exports, or with unused exports
		// https://github.com/benmosher/eslint-plugin-import/blob/f63dd261809de6883b13b6b5b960e6d7f42a7813/docs/rules/no-unused-modules.md
		'import/no-unused-modules': ['off', {
			ignoreExports: [],
			missingExports: true,
			unusedExports: true,
		}],
	},
};
