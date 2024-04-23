# College Football Pickem MVP & Scope Document

## User Story

As a sports fan interested in college football,

I want an interactive site to host a pickem' league,

so that my friends and I can compete with each other for bragging rights.

## Acceptance Criteria

GIVEN a web server with a database and hosted website:

1. WHEN I visit the pickem website, THEN a scoreboard is shown providing all of the user's picks from any year and week I select.
2. WHEN I access the API routes, THEN I can access the following data: all-time score for a user, yearly score for a user, weekly score for a user, week winner(s), week loser(s), season winner, season loser, average points per week for a user, pick accuracy (%) for a user
3. WHEN I interface with my database, THEN I see data stored for user logins, user picks, picked teams, and the weekly games
4. WHEN I review user passwords in the database, THEN all I see are encrypted hashes of their passwords

## Major Scope Details

1. Use JS for frontend and backend
2. Use MySQL based on the relational and consistent structure of data
3. Required data to store: Teams, Games, User Picks, User Information, Weekly Picks & Scores
4. Use ReactJS for front-end to implement future features
5. Use Express as the server base

## "Nice to Have" Feature List

1. Use ChartJS library for data visualization
2. Provide home page showing current weeks scoring summary
3. Create game dashboard showing the current weeks' games with live updates
4. Provide page for historical data access and selectable statistical analyses
5. Provide login page/dialog
6. Provide user dashboard screen
7. Create page for a user to submit pick form
8. Add groups and the ability to create leagues
9. Additional API routes for statistical data will be implemented...
