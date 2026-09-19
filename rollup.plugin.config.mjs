import { resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: resolve('src/plugin.ts'),

    plugins: [
        nodeResolve({
            browser: true
        }),

        commonjs(),

        typescript({
            tsconfig: './tsconfig.plugin.json'
        })
    ],

    output: {
        file: resolve('dist/plugin.js'),
        format: 'iife',
        name: 'PenpotFlutterDesignCompiler',
        inlineDynamicImports: true,
        sourcemap: false
    }
};