Feature: Class Management
  As a user
  I want to manage classes
  So that I can organize student learning groups and track their progress

  Scenario: Create a class successfully
    Given I am on the classes page
    When I fill in the form with:
      | field | value |
      | topic | Mathematics 101 |
      | year | 2024 |
      | semester | 1 |
    And I click the "Create Class" button
    Then I should see the message "Class created successfully"
    And the class "Mathematics 101" should appear in the list

  Scenario: Reject creating a class with missing required fields
    Given I am on the classes page
    When I fill in the form with:
      | field | value |
      | topic |  |
      | year | 2024 |
      | semester | 1 |
    And I click the "Create Class" button
    Then I should see the error "Topic is required"
    And the class should not be created

  Scenario: List all classes
    Given there are classes in the system:
      | topic | year | semester |
      | Physics 101 | 2024 | 1 |
      | Chemistry 202 | 2024 | 2 |
      | Biology 303 | 2023 | 1 |
    When I am on the classes page
    Then I should see 3 classes in the list
    And the list should contain "Physics 101" from year 2024
    And the list should contain "Chemistry 202" from year 2024
    And the list should contain "Biology 303" from year 2023

  Scenario: Edit a class successfully
    Given there is a class with:
      | field | value |
      | topic | Literature 404 |
      | year | 2024 |
      | semester | 1 |
    And I am on the classes page
    When I click the edit button for "Literature 404"
    And I update the semester to 2
    And I click the "Save" button
    Then I should see the message "Class updated successfully"
    And the class "Literature 404" should have semester 2

  Scenario: Reject editing a class with invalid data
    Given there is a class with:
      | field | value |
      | topic | History 505 |
      | year | 2024 |
      | semester | 1 |
    And I am on the classes page
    When I click the edit button for "History 505"
    And I clear the topic field
    And I click the "Save" button
    Then I should see the error "Topic is required"
    And the class topic should remain "History 505"

  Scenario: Remove a class
    Given there is a class with:
      | field | value |
      | topic | Art 606 |
      | year | 2024 |
      | semester | 1 |
    And I am on the classes page
    When I click the delete button for "Art 606"
    And I confirm the deletion
    Then I should see the message "Class removed successfully"
    And the class "Art 606" should not be in the list

  Scenario: Enroll a student in a class successfully
    Given there is a student with:
      | field | value |
      | name | Alice Johnson |
      | CPF | 88888888888 |
      | email | alice@example.com |
    And there is a class "Engineering 707" in year 2024, semester 1
    And I am viewing the class "Engineering 707"
    When I click the "Enroll Student" button
    And I select "Alice Johnson" from the student list
    And I click the "Add" button
    Then I should see the message "Student enrolled successfully"
    And the student "Alice Johnson" should appear in the class enrollment list

  Scenario: Reject enrolling a student who is already in the class
    Given there is a student "Bob Wilson" enrolled in class "Economics 808"
    And I am viewing the class "Economics 808"
    When I click the "Enroll Student" button
    And I select "Bob Wilson" from the student list
    And I click the "Add" button
    Then I should see the error "This student is already enrolled in this class"
    And the enrollment should not be duplicated

  Scenario: Enroll multiple students at once
    Given there are students in the system:
      | name | CPF | email |
      | Emma Rodriguez | 99999999999 | emma@example.com |
      | Frank Lewis | 10101010101 | frank@example.com |
      | Grace Martinez | 11111111111 | grace@example.com |
    And there is a class "Software Testing 909" in year 2024, semester 2
    And I am viewing the class "Software Testing 909"
    When I click the "Enroll Multiple Students" button
    And I select the following students from the list:
      | name |
      | Emma Rodriguez |
      | Frank Lewis |
      | Grace Martinez |
    And I click the "Enroll All" button
    Then I should see the message "3 students enrolled successfully"
    And the enrollment list should contain "Emma Rodriguez"
    And the enrollment list should contain "Frank Lewis"
    And the enrollment list should contain "Grace Martinez"

  Scenario: Partial success when enrolling multiple students with duplicates
    Given there are students in the system:
      | name | CPF | email |
      | Henry Chen | 12121212121 | henry@example.com |
      | Isabella Lopez | 13131313131 | isabella@example.com |
    And "Henry Chen" is already enrolled in class "Database Systems 910"
    And I am viewing the class "Database Systems 910"
    When I click the "Enroll Multiple Students" button
    And I select the following students:
      | name |
      | Henry Chen |
      | Isabella Lopez |
    And I click the "Enroll All" button
    Then I should see the message "1 student enrolled successfully, 1 already enrolled"
    And "Isabella Lopez" should appear in the enrollment list
    And "Henry Chen" enrollment should not be duplicated
