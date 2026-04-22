Feature: Class Management
  As a professor
  I want to manage classes
  So that I can organise student learning groups

  Background:
    Given the class data is clean

  Scenario: Professor creates a new class
    When I create a class with topic "Software Engineering" year 2024 and semester 1
    Then the class response should indicate success
    And a class "Software Engineering" should exist in the system

  Scenario: Professor adds a student to a class
    Given a class "Mathematics 101" exists for year 2024 semester 1
    And a student "Alice Silva" with CPF "11111111111" and email "alice@example.com" exists
    When I add student "Alice Silva" to class "Mathematics 101"
    Then the class response should indicate success
    And "Alice Silva" should be enrolled in "Mathematics 101"

  Scenario: Professor removes a student from a class
    Given a class "Physics 101" exists for year 2024 semester 1
    And a student "Bob Santos" with CPF "22222222222" and email "bob@example.com" exists
    And "Bob Santos" is enrolled in class "Physics 101"
    When I remove student "Bob Santos" from class "Physics 101"
    Then the class response should indicate success
    And "Bob Santos" should not be enrolled in "Physics 101"

  Scenario: Professor views a class detail with students and assessments
    Given a class "Chemistry 101" exists for year 2024 semester 1
    And a student "Carol Lima" with CPF "33333333333" and email "carol@example.com" exists
    And "Carol Lima" is enrolled in class "Chemistry 101"
    And "Carol Lima" has class grade "MA" on goal "Requisitos" in class "Chemistry 101"
    When I request the detail of class "Chemistry 101"
    Then the class detail should contain student "Carol Lima"
    And the class detail should contain grade "MA" for "Carol Lima" on goal "Requisitos"

  Scenario: Professor sets an assessment for a student inside a class
    Given a class "Biology 101" exists for year 2024 semester 1
    And a student "Diana Costa" with CPF "44444444444" and email "diana@example.com" exists
    And "Diana Costa" is enrolled in class "Biology 101"
    When I set class grade "MPA" for "Diana Costa" on goal "Testes" in class "Biology 101"
    Then the class response should indicate success
    And the class grade "MPA" should be stored for "Diana Costa" on goal "Testes" in class "Biology 101"

  Scenario: Professor deletes a class
    Given a class "History 101" exists for year 2024 semester 1
    When I delete class "History 101"
    Then the class response should indicate success
    And class "History 101" should no longer exist
