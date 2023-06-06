import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const browserTargets = [
    'ie >= 11',
    '> 0.5%',
    'not dead'
];


const plugins = [
    terser(),
    resolve(),
    babel({
        presets: [['@babel/preset-env', { targets: browserTargets }]],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        plugins: [
            '@babel/plugin-transform-classes'
        ]
    })
];

export default {
    input: 'src/index.js',
    output: [{
        file: 'dist/browser.js',
        format: 'iife',
        name: 'Cptn',
    }, {
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
