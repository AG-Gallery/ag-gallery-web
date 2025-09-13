//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

const eslintConfig = [
  ...tanstackConfig,
  {
    rules: {
      'import/order': 'off',
      // Prettier plugin will handle sort order
      'sort-imports': [
        'error',
        { ignoreDeclarationSort: true, ignoreMemberSort: true },
      ],
    },
  },
]

export default [...eslintConfig]
