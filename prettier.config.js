//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  importOrder: [
    '<TYPES>',
    '',
    '^react$',
    '^react-dom$',
    '',
    '^@tanstack',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '',
    '^[.]/',
    '/src/',
    '',
    '\\.css$',
    '',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
}

export default config
