Feature: Assessments Management
  As a professor
  I want to view and update student assessments
  So that I can track each student's progress on goals

  Background:
    Given the assessments data is clean

  Scenario: Professor views the assessments table with all students
    Given there are students registered:
      | name        | CPF         | email             |
      | Alice Silva | 12345678901 | alice@example.com |
      | Bob Santos  | 98765432100 | bob@example.com   |
    When I request the assessments table
    Then the response should list 2 students
    And the goals list should include "Requisitos"
    And the goals list should include "Testes"

  Scenario: Professor sets an assessment for a student/goal cell
    Given a student "Carlos Lima" with CPF "11122233344" and email "carlos@example.com" is registered
    When I set the grade "MA" for student "Carlos Lima" on goal "Requisitos"
    Then the response should return success
    And the grade "MA" should be stored for "Carlos Lima" on goal "Requisitos"

  Scenario: Professor updates an existing assessment
    Given a student "Diana Costa" with CPF "55566677788" and email "diana@example.com" is registered
    And "Diana Costa" has grade "MANA" on goal "Testes"
    When I set the grade "MPA" for student "Diana Costa" on goal "Testes"
    Then the response should return success
    And the grade "MPA" should be stored for "Diana Costa" on goal "Testes"

  Scenario: Table is empty when no students exist
    Given there are no students registered
    When I request the assessments table
    Then the response should list 0 students
