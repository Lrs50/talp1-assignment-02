Feature: Email Notifications
  As a student
  I want to receive a daily summary email of my assessment updates
  So that I stay informed about my progress across all classes

  Background:
    Given the notification queue is empty

  Scenario: Professor updates an assessment — student receives one email that day
    Given a class "Web Dev 101" exists for year 2024 semester 1
    And a student "Kevin Anderson" with CPF "10000000001" and email "kevin@example.com" exists
    And "Kevin Anderson" is enrolled in class "Web Dev 101"
    When the professor sets the assessment for "Kevin Anderson" on goal "Requisitos" to "MA" in "Web Dev 101"
    Then the pending notification count for "Kevin Anderson" should be 1
    When the daily email batch runs
    Then the batch should have sent 1 email
    And the batch should include an email to "kevin@example.com"
    And the email to "kevin@example.com" should list goal "Requisitos" graded "MA"

  Scenario: Multiple assessments in the same day produce a single batched email
    Given a class "Cloud 201" exists for year 2024 semester 2
    And a student "Maria Santos" with CPF "20000000001" and email "maria@example.com" exists
    And "Maria Santos" is enrolled in class "Cloud 201"
    When the professor sets the assessment for "Maria Santos" on goal "Requisitos" to "MANA" in "Cloud 201"
    And the professor sets the assessment for "Maria Santos" on goal "Testes" to "MPA" in "Cloud 201"
    And the professor sets the assessment for "Maria Santos" on goal "Requisitos" to "MPA" in "Cloud 201"
    Then the pending notification count for "Maria Santos" should be 2
    When the daily email batch runs
    Then the batch should have sent 1 email
    And the email to "maria@example.com" should contain 2 goals

  Scenario: No email is sent when no assessment was changed
    When the daily email batch runs
    Then the batch should have sent 0 emails
