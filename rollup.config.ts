import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"

const config = [
    {
        input: `src/index.ts`,
        plugins: [del({ targets: ["dist"], runOnce: true }), esbuild()],
        output: [
            {
                file: `dist/index.mjs`,
                format: 'esm',
                sourcemap: false,
            },
            {
                file: `dist/index.cjs`,
                format: 'cjs',
                sourcemap: false,
            },
        ]
    },
    {
        input: `src/index.ts`,
        plugins: [dts()],
        output: [{
            file: `dist/index.d.mts`,
            format: 'esm',
        },
        {
            file: `dist/index.d.cts`,
            format: 'cjs',
        },
        {
            file: `dist/index.d.ts`,
            format: 'esm',
        }
        ],
    }
];

export default config;