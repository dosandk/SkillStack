export default {
  rules: {
    // type: only what's defined in .gitmessage
    'type-enum': [2, 'always', ['feat', 'fix', 'docs']],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // scope: optional, but if present — lowercase kebab
    'scope-case': [2, 'always', 'lower-case'],

    // subject line
    'subject-empty': [2, 'never'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 50],

    // header = type + scope + subject combined
    'header-max-length': [2, 'always', 50],

    // body: blank line required between subject and body
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 72],

    // footer
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 72]
  },
  helpUrl: ''
};
