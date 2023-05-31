import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

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
    resolve({ browser: true, modulesOnly: true }),
    commonjs(),
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
    output: {
        file: isBrowser ? 'dist/browser.js' : 'dist/index.js',
        format: isBrowser ? 'iife' : 'es',
        name: 'Cptn'
    },
    plugins
};
