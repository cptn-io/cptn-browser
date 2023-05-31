import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const isBrowser = process.env.BUILD_TARGET === 'browser';

const browserTargets = [
    'ie >= 11',
    '> 0.5%',
    'not dead'
];

const nodeTargets = {
    node: 'current'
};

const plugins = [
    terser(),
    resolve(),
    replace({ preventAssignment: true, 'process.browser': isBrowser }),
    babel({
        presets: [['@babel/preset-env', { targets: isBrowser ? browserTargets : nodeTargets }]],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        plugins: isBrowser ? [
            '@babel/plugin-transform-classes'
        ] : []
    })
];

export default {
    input: 'src/index.js',
    output: isBrowser ? {
        file: 'dist/browser.js',
        format: 'iife',
        name: 'Cptn',
    } : [{
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'auto',
        name: 'Cptn'
    }, {
        file: 'dist/index.esm.mjs',
        format: 'es',
        exports: 'auto',
        name: 'Cptn'
    }],
    plugins
};
