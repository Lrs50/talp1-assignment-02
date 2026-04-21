module.exports = {
  default: {
    paths: ['features/students.feature', 'features/assessments.feature'],
    require: ['step_definitions/students.js', 'step_definitions/assessments.js'],
    format: ['progress']
  }
}
