Feature: Email Notifications for Assessments
  As an instructor
  I want to receive batched daily email notifications
  When assessments are added or updated
  So that I stay informed about student progress without being overwhelmed

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
    Then an email should be sent to all instructors with subject "Student Assessments Report"
    And the email should contain assessment for "Kevin Anderson" with goal "Writes efficient code"

  Scenario: Reject sending email before daily batch window
    Given the current time is 09:00 on a weekday
    And an assessment has been added for a student
    When I check if an email has been sent immediately
    Then no email should have been sent instantly
    And the notification should remain in the queue for the daily batch

  Scenario: Batch multiple assessments in a single daily email
    Given the current time is morning on a weekday
    And there are students in class "Cloud Architecture 202":
      | name |
      | Marcus Foster |
      | Nicole Hughes |
      | Oscar Johnson |
    When I add assessments throughout the day:
      | student | goal | grade | time |
      | Marcus Foster | Designs scalable systems | MA | 10:00 |
      | Nicole Hughes | Implements load balancing | MPA | 14:30 |
      | Oscar Johnson | Configures databases | MANA | 18:00 |
    And when the daily email is sent at 23:59
    Then an email should contain all 3 assessments
    And the email should be sent once with all batched notifications

  Scenario: Send updated assessment in daily email notification
    Given there is an assessment for "Patricia Green" with goal "Tests edge cases" and grade "MANA"
    And the current time is 15:00 on a weekday
    When I update the assessment to grade "MPA"
    Then a notification should be queued for the daily batch
    And when the daily email is sent at 23:59
    Then the email should show the assessment for "Patricia Green" with updated grade "MPA"

  Scenario: Do not send email when no assessments change
    Given the current date is a weekday
    And no new assessments have been added or updated since yesterday
    When the daily email batch is triggered at 23:59
    Then no email should be sent

  Scenario: Include all assessment changes in one comprehensive daily report
    Given the current time is morning on a weekday
    And there is a class "Capstone Project 203" with 5 enrolled students
    When assessments are added and updated throughout the day for 3 students
    And when the daily email is sent at 23:59
    Then the email should list all changes (additions and updates)
    And the email should group assessments by student
    And the email should group students by class
