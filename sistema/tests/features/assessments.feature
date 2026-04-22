Feature: Class Assessment Management
  As a professor
  I want to view and manage student assessments per class
  So that I can track each student's progress within their enrolled classes

  Background:
    Given the assessments data is clean

  Scenario: Professor views the assessment matrix for a class
    Given a class "Software Engineering" exists for year 2024 semester 1
    And a student "Alice Silva" with CPF "11111111111" and email "alice@example.com" exists
    And "Alice Silva" is enrolled in class "Software Engineering"
    When I request the assessments for class "Software Engineering"
    Then the assessment response should contain student "Alice Silva"
    And the assessment response should include goal "Requirements"

  Scenario: Professor sets an assessment for a student in a class
    Given a class "Database Systems" exists for year 2024 semester 1
    And a student "Bruno Lima" with CPF "22222222221" and email "bruno@example.com" exists
    And "Bruno Lima" is enrolled in class "Database Systems"
    When I set the assessment for "Bruno Lima" to "MA" on goal "Requirements" in class "Database Systems"
    Then the assessment response should return success
    And the grade "MA" should be recorded for "Bruno Lima" on goal "Requirements" in class "Database Systems"

  Scenario: Professor updates an existing assessment in a class
    Given a class "Algorithms" exists for year 2024 semester 1
    And a student "Carla Reis" with CPF "33333333331" and email "carla@example.com" exists
    And "Carla Reis" is enrolled in class "Algorithms"
    And "Carla Reis" has class grade "MANA" on goal "Tests" in class "Algorithms"
    When I set the assessment for "Carla Reis" to "MPA" on goal "Tests" in class "Algorithms"
    Then the assessment response should return success
    And the grade "MPA" should be recorded for "Carla Reis" on goal "Tests" in class "Algorithms"

  Scenario: Assessment matrix is empty when no students are enrolled
    Given a class "Empty Course" exists for year 2024 semester 1
    When I request the assessments for class "Empty Course"
    Then the assessment response should contain 0 students

  Scenario: Professor adds a new goal
    When I add the goal "Architecture"
    Then the assessment response should return success
    And the goals list should contain "Architecture"

  Scenario: Professor removes a goal
    When I add the goal "Temporary Goal"
    And I remove the goal "Temporary Goal"
    Then the assessment response should return success
    And the goals list should not contain "Temporary Goal"
