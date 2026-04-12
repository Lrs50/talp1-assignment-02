Feature: Student Assessment Management
  As an instructor
  I want to assess students per learning goal in each class
  So that I can track their progress towards the course objectives

  Scenario: Add an assessment successfully
    Given there is a class "Software Engineering 101" with enrolled student "David Martinez"
    And I am on the assessments page for class "Software Engineering 101"
    When I fill in the assessment form with:
      | field | value |
      | student | David Martinez |
      | goal | Understands OOP concepts |
      | grade | MA |
    And I click the "Add Assessment" button
    Then I should see the message "Assessment recorded successfully"
    And the assessment for "David Martinez" with goal "Understands OOP concepts" should show "MA"

  Scenario: Reject adding an assessment with invalid grade
    Given there is a class "Database Design 102" with enrolled student "Emma Thompson"
    And I am on the assessments page for class "Database Design 102"
    When I fill in the assessment form with:
      | field | value |
      | student | Emma Thompson |
      | goal | Normalizes database schemas |
      | grade | Excellent |
    And I click the "Add Assessment" button
    Then I should see the error "Grade must be one of: MANA, MPA, MA"
    And the assessment should not be recorded

  Scenario: List assessments for a class
    Given there is a class "Web Development 103" with enrolled students:
      | name |
      | Frank Garcia |
      | Grace Lee |
    And assessments exist:
      | student | goal | grade |
      | Frank Garcia | Builds responsive layouts | MA |
      | Frank Garcia | Understands REST APIs | MPA |
      | Grace Lee | Builds responsive layouts | MPA |
    When I am on the assessments page for class "Web Development 103"
    Then I should see 3 assessments in the list
    And I should see assessment for "Frank Garcia" with goal "Builds responsive layouts" and grade "MA"
    And I should see assessment for "Grace Lee" with goal "Understands REST APIs" as "Not assessed"

  Scenario: Update a student's assessment
    Given there is an assessment with:
      | field | value |
      | student | Henry Brown |
      | class | Mobile Development 104 |
      | goal | Creates multi-screen apps |
      | grade | MANA |
    And I am on the assessments page for class "Mobile Development 104"
    When I click the edit button for the assessment
    And I change the grade to "MPA"
    And I click the "Save" button
    Then I should see the message "Assessment updated successfully"
    And the assessment for "Henry Brown" with goal "Creates multi-screen apps" should show "MPA"

  Scenario: Reject updating an assessment with invalid grade
    Given there is an assessment with:
      | field | value |
      | student | Iris White |
      | class | Cloud Computing 105 |
      | goal | Deploys to cloud platforms |
      | grade | MA |
    And I am on the assessments page for class "Cloud Computing 105"
    When I click the edit button for the assessment
    And I change the grade to "Needs Improvement"
    And I click the "Save" button
    Then I should see the error "Grade must be one of: MANA, MPA, MA"
    And the assessment grade should remain "MA"

  Scenario: Remove an assessment
    Given there is an assessment with:
      | field | value |
      | student | Jacob Miller |
      | class | Data Science 106 |
      | goal | Analyzes datasets |
      | grade | MPA |
    And I am on the assessments page for class "Data Science 106"
    When I click the delete button for the assessment
    And I confirm the deletion
    Then I should see the message "Assessment removed successfully"
    And the assessment for "Jacob Miller" with goal "Analyzes datasets" should not appear in the list
