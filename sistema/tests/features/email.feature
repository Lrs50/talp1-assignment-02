Feature: Email Notifications for Assessments
  As a student
  I want to receive a daily email notification
  When my assessments are added or updated
  So that I stay informed about my progress across all my classes

  Scenario: Send daily email when assessment is added
    Given the current time is 14:30 on a weekday
    And there are students in the system:
      | name | email |
      | Kevin Anderson | kevin@example.com |
      | Laura Davis | laura@example.com |
    And they are enrolled in class "Advanced Python 201"
    When I add an assessment for "Kevin Anderson" with goal "Writes efficient code" and grade "MA"
    Then a notification should be queued for the daily batch
    And when the daily email is sent at 23:59
    Then an email should be sent to Kevin Anderson with subject "Your Grades Have Been Updated"
    And the email should contain the assessment change for "Writes efficient code": — → MA
    And the email should be grouped by class "Advanced Python 201"

  Scenario: Reject sending email before daily batch window
    Given the current time is 09:00 on a weekday
    And an assessment has been added for a student
    When I check if an email has been sent immediately
    Then no email should have been sent instantly
    And the notification should remain in the queue for the daily batch

  Scenario: Batch multiple assessments in a single daily email (per student)
    Given the current time is morning on a weekday
    And there are students in class "Cloud Architecture 202":
      | name | email |
      | Marcus Foster | marcus@example.com |
      | Nicole Hughes | nicole@example.com |
      | Oscar Johnson | oscar@example.com |
    When I add assessments throughout the day:
      | student | goal | grade | time |
      | Marcus Foster | Designs scalable systems | MA | 10:00 |
      | Marcus Foster | Implements load balancing | MPA | 14:30 |
      | Nicole Hughes | Designs scalable systems | MANA | 11:00 |
      | Oscar Johnson | Configures databases | MPA | 18:00 |
    And when the daily email is sent at 23:59
    Then an email should be sent to Marcus Foster with all his changes (2 goals)
    And an email should be sent to Nicole Hughes with her changes (1 goal)
    And an email should be sent to Oscar Johnson with his changes (1 goal)
    And each email should show changes grouped by class "Cloud Architecture 202"

  Scenario: Send updated assessment in daily email notification
    Given there is an assessment for "Patricia Green" with goal "Tests edge cases" and grade "MANA" in class "Data Science 101"
    And Patricia Green has email "patricia@example.com"
    And the current time is 15:00 on a weekday
    When I update the assessment to grade "MPA"
    Then a notification should be queued for the daily batch
    And when the daily email is sent at 23:59
    Then an email should be sent to Patricia Green
    And the email should show the assessment updated from MANA to MPA for goal "Tests edge cases"
    And the email should be grouped by class "Data Science 101"

  Scenario: Do not send email when no assessments change
    Given the current date is a weekday
    And no new assessments have been added or updated since yesterday
    When the daily email batch is triggered at 23:59
    Then no email should be sent

  Scenario: Include all assessment changes grouped by class and goal
    Given the current time is morning on a weekday
    And there is a class "Capstone Project 203" with 5 enrolled students
    And 3 of those students have enrollments in other classes as well
    When assessments are added and updated throughout the day for 3 students in different classes
    And when the daily email is sent at 23:59
    Then an email should be sent to each of the 3 affected students
    And each email should show only that student's changes
    And each email should group changes by class name
    And each email should show goal names and grade transitions (old → new)
