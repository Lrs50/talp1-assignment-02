export default {
  default: {
    paths: ['features/**/*.feature'],
    require: ['step_definitions/**/*.ts'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    parallel: 2
  }
}
