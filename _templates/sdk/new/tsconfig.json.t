---
to: packages/sdk-<%= name %>/tsconfig.json
---
{
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "declaration": true,
        "outDir": "./dist",
        "strict": true,
        "esModuleInterop": true
    },
    "exclude": [
        "node_modules",
        "dist/",
        "test/"
    ]
}