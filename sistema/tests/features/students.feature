Feature: Student Management
  As a user
  I want to manage student records
  So that I can keep track of student information

  Scenario: Add a student successfully
    Given I am on the students page
    When I fill in the form with:
      | field | value |
      | name  | John Silva |
      | CPF   | 12345678901 |
      | email | john@example.com |
    And I click the "Add Student" button
    Then I should see the message "Student added successfully"
    And the student "John Silva" should appear in the list

  Scenario: Reject adding a student with missing required fields
    Given I am on the students page
    When I fill in the form with:
      | field | value |
      | name  | Maria Johnson |
      | CPF   |  |
      | email | maria@example.com |
    And I click the "Add Student" button
    Then I should see the error "CPF is required"
    And the student should not be added

  Scenario: Reject adding a student with duplicate CPF
    Given there is a student with CPF "98765432100"
    And I am on the students page
    When I fill in the form with:
      | field | value |
      | name  | Peter Davis |
      | CPF   | 98765432100 |
      | email | peter@example.com |
    And I click the "Add Student" button
    Then I should see the error "This CPF is already registered"
    And the student should not be added

  Scenario: List all registered students
    Given there are students in the system:
      | name | CPF | email |
      | Anna Wilson | 11111111111 | anna@example.com |
      | Bruno Garcia | 22222222222 | bruno@example.com |
      | Clara Robinson | 33333333333 | clara@example.com |
    When I am on the students page
    Then I should see 3 students in the list
    And the list should contain "Anna Wilson"
    And the list should contain "Bruno Garcia"
    And the list should contain "Clara Robinson"

  Scenario: Edit a student's data successfully
    Given there is a student with:
      | field | value |
      | name  | Richard Brown |
      | CPF   | 44444444444 |
      | email | richard@example.com |
    And I am on the students page
    When I click the edit button for "Richard Brown"
    And I update the email to "richard.new@example.com"
    And I click the "Save" button
    Then I should see the message "Student updated successfully"
    And the student "Richard Brown" should have email "richard.new@example.com"

  Scenario: Reject editing a student with incomplete data
    Given there is a student with:
      | field | value |
      | name  | Sarah Miller |
      | CPF   | 55555555555 |
      | email | sarah@example.com |
    And I am on the students page
    When I click the edit button for "Sarah Miller"
    And I clear the name field
    And I click the "Save" button
    Then I should see the error "Name is required"
    And the student's name should remain "Sarah Miller"

  Scenario: Remove a student
    Given there is a student with:
      | field | value |
      | name  | George Taylor |
      | CPF   | 66666666666 |
      | email | george@example.com |
    And I am on the students page
    When I click the delete button for "George Taylor"
    And I confirm the deletion
    Then I should see the message "Student removed successfully"
    And the student "George Taylor" should not be in the list

  Scenario: Reject adding a student with empty name field
    Given I am on the students page
    When I fill in the form with:
      | field | value |
      |  |  |
      | CPF   | 77777777777 |
      | email | test@example.com |
    And I click the "Add Student" button
    Then I should see the error "Name is required"
    And the student should not be added
