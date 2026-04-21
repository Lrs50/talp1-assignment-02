Feature: Assessment Matrix Management
  As an instructor
  I want to view and update student assessments in a matrix format
  So that I can quickly see all students' progress on all goals in one class

  Background:
    Given I am logged in
    And I am on the assessments page

  # Matrix View Scenarios

  Scenario: View assessment matrix for a class
    Given there is a class "Software Engineering 101" with enrolled students:
      | name |
      | David Martinez |
      | Emma Thompson |
    And assessments exist for the class:
      | student | goal | grade |
      | David Martinez | Understands OOP concepts | MA |
      | David Martinez | Writes clean code | MPA |
      | Emma Thompson | Understands OOP concepts | MANA |
    When I select "Software Engineering 101" from the class dropdown
    Then I should see the assessment matrix with row headers "David Martinez" and "Emma Thompson"
    And I should see the column headers "Understands OOP concepts" and "Writes clean code"
    And the cell for David Martinez and "Understands OOP concepts" should show "MA"
    And the cell for David Martinez and "Writes clean code" should show "MPA"
    And the cell for Emma Thompson and "Understands OOP concepts" should show "MANA"
    And the cell for Emma Thompson and "Writes clean code" should be empty

  Scenario: Edit a grade in the assessment matrix (inline)
    Given there is a class "Database Design 102" with enrolled student "Frank Garcia"
    And the matrix shows "Frank Garcia" with "MANA" under goal "Normalizes schemas"
    When I click the cell for "Frank Garcia" / "Normalizes schemas"
    And I select "MA" from the grade dropdown
    Then the assessment should update immediately without leaving the page
    And the cell should display "MA"
    And I should see a visual confirmation (checkmark or highlight)
    And an email notification should be queued for the daily digest

  Scenario: Add a new assessment by clicking an empty cell
    Given there is a class "Web Development 103" with enrolled student "Grace Lee"
    And the cell for "Grace Lee" / "Builds responsive layouts" is empty
    When I click the empty cell
    And I select "MPA" from the grade dropdown
    Then the new assessment should be created immediately
    And the cell should display "MPA"
    And an email notification should be queued for the daily digest

  Scenario: Grade dropdown only shows valid options
    Given I am viewing a class with the assessment matrix displayed
    When I click any cell to edit a grade
    Then the dropdown should contain exactly three options:
      | option |
      | MANA |
      | MPA |
      | MA |
    And no other values should be selectable

  Scenario: Switch between classes using the class selector
    Given I have multiple classes:
      | topic | year | semester |
      | Physics 101 | 2024 | 1 |
      | Chemistry 202 | 2024 | 2 |
    And I am viewing the matrix for "Physics 101"
    When I click the class dropdown
    And I select "Chemistry 202"
    Then the matrix should update to show students enrolled in "Chemistry 202"
    And the column headers should reflect goals used in "Chemistry 202"

  Scenario: Handle a class with no enrolled students
    Given there is a class "Advanced Art 107" with no enrolled students
    When I select "Advanced Art 107" from the class dropdown
    Then I should see the message "No students enrolled in this class"
    And I should see an "Enroll Students" button

  Scenario: Clear a grade from the matrix (delete assessment)
    Given I am viewing the matrix for "Data Science 106"
    And "Jacob Miller" has "MPA" under goal "Analyzes datasets"
    When I click the cell for "Jacob Miller" / "Analyzes datasets"
    And I select the empty option to clear the grade
    Then the assessment should be deleted
    And the cell should become empty
    And an email notification should be queued for the daily digest

  # Enrollment Management (within Assessments context)

  Scenario: Enroll a student directly from the assessments matrix
    Given I am viewing the matrix for "Economics 108"
    When I click the "Enroll Student" button
    And I select "Bob Wilson" from the list of available students
    And I confirm the enrollment
    Then "Bob Wilson" should appear as a new row in the matrix (at the bottom)
    And all cells in "Bob Wilson"'s row should be empty

  Scenario: Remove a student from class (within assessments view)
    Given I am viewing the matrix for "History 109"
    And "Patricia Green" is enrolled and appears as a row
    When I click the remove button (X icon) next to "Patricia Green"
    And I confirm the removal
    Then "Patricia Green" should no longer appear in the matrix
    And I should see the message "Student removed from class"
    And all assessments for "Patricia Green" in this class should be deleted

  # Error Handling

  Scenario: Prevent invalid grade entry via dropdown
    Given I am viewing an assessment matrix
    When I click a cell to edit
    Then the dropdown should only allow selection of valid grades
    And I should not be able to enter custom/invalid values
    And the cell should retain its previous value if I cancel

  Scenario: Handle rapid grade changes
    Given I am viewing the matrix for "Mobile Development 104"
    And the cell for "Henry Brown" / "Creates multi-screen apps" shows "MANA"
    When I quickly click the cell, select "MPA", and immediately click another cell
    Then the first change should be saved before allowing the second edit
    And the first cell should show "MPA"
