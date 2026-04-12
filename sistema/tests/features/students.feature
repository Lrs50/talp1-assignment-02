Feature: Student Management
  As a user
  I want to manage student records
  So that I can keep track of student information

  Scenario: Add a student successfully
    Given I am on the students page
    When I fill in the form with:
      | field | value |
      | name  | João Silva |
      | CPF   | 12345678901 |
      | email | joao@example.com |
    And I click the "Add Student" button
    Then I should see the message "Student added successfully"
    And the student "João Silva" should appear in the list

  Scenario: Reject adding a student with missing required fields
    Given I am on the students page
    When I fill in the form with:
      | field | value |
      | name  | Maria Santos |
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
      | name  | Pedro Costa |
      | CPF   | 98765432100 |
      | email | pedro@example.com |
    And I click the "Add Student" button
    Then I should see the error "This CPF is already registered"
    And the student should not be added

  Scenario: List all registered students
    Given there are students in the system:
      | name | CPF | email |
      | Ana Silva | 11111111111 | ana@example.com |
      | Bruno Santos | 22222222222 | bruno@example.com |
      | Clara Oliveira | 33333333333 | clara@example.com |
    When I am on the students page
    Then I should see 3 students in the list
    And the list should contain "Ana Silva"
    And the list should contain "Bruno Santos"
    And the list should contain "Clara Oliveira"

  Scenario: Edit a student's data successfully
    Given there is a student with:
      | field | value |
      | name  | Ricardo Ferreira |
      | CPF   | 44444444444 |
      | email | ricardo@example.com |
    And I am on the students page
    When I click the edit button for "Ricardo Ferreira"
    And I update the email to "ricardo.new@example.com"
    And I click the "Save" button
    Then I should see the message "Student updated successfully"
    And the student "Ricardo Ferreira" should have email "ricardo.new@example.com"

  Scenario: Reject editing a student with incomplete data
    Given there is a student with:
      | field | value |
      | name  | Fernanda Costa |
      | CPF   | 55555555555 |
      | email | fernanda@example.com |
    And I am on the students page
    When I click the edit button for "Fernanda Costa"
    And I clear the name field
    And I click the "Save" button
    Then I should see the error "Name is required"
    And the student's name should remain "Fernanda Costa"

  Scenario: Remove a student
    Given there is a student with:
      | field | value |
      | name  | Gustavo Almeida |
      | CPF   | 66666666666 |
      | email | gustavo@example.com |
    And I am on the students page
    When I click the delete button for "Gustavo Almeida"
    And I confirm the deletion
    Then I should see the message "Student removed successfully"
    And the student "Gustavo Almeida" should not be in the list

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
