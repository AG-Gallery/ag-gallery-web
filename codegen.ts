import 'dotenv/config'

import type { CodegenConfig } from '@graphql-codegen/cli'

const storeDomain = process.env.SHOPIFY_DOMAIN as string
const storefrontAccessToken = process.env
  .SHOPIFY_STOREFRONT_PUBLIC_TOKEN as string
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07'

if (!storeDomain || !storefrontAccessToken) {
  throw new Error('Missing SHOPIFY_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN')
}

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`https://${storeDomain}/api/${apiVersion}/graphql.json`]: {
        headers: {
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
          'Content-Type': 'application/json',
        },
      },
    },
  ],
  documents: ['src/**/*.{graphql,gql}'],
  generates: {
    // Base schema types
    'src/queries/graphql/generated/types.ts': {
      plugins: ['typescript'],
    },
    // Generates TanStack Query hooks
    'src/queries/graphql/generated/react-query.ts': {
      documents: 'src/queries/graphql/queries/**/*.graphql',
      plugins: ['typescript-operations', 'typescript-react-query'],
      config: {
        reactQueryVersion: 5,
        exposeQueryKeys: true,
        exposeDocument: true,
        addInfiniteQuery: true,
        useSuspenseQuery: false,
        fetcher: { func: 'src/queries/graphql/fetcher#fetcher' },
      },
    },
    // 'src/graphql/generated/react-query.ts': {
    //   documents: 'src/graphql/queries/**/*.graphql',
    //   plugins: ['typescript-operations', 'typescript-react-query'],
    //   config: {
    //     reactQueryVersion: 5,
    //     exposeQueryKeys: true,
    //     exposeDocument: true,
    //     addInfiniteQuery: true,
    //     // Uses server proxy
    //     fetcher: {
    //       endpoint: "'/api/shopify/graphql'",
    //       fetchParams: {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //       },
    //     },
    //   },
    // },
  },
  ignoreNoDocuments: true,
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
}

export default config
