# dbSimsPDX
A backend game of life. 
The goal of the game is to retire with a net worth of $1,000,000, which is a total of the player's bank account and value of all assets.
Upon signup, players start the game at 18 years of age and are each alotted a random amount of cash in their bank accounts. 
Players can purchase assets and additional education with money in their bank account.
Pursing additional education will allow players to advance their careers and earn more money.
Time explanation

## Getting Started // NEEDS EDITING and add HEROKU?
1. Install [Node.js](https://nodejs.org/en/)
2. Run `git clone https://github.com/dbSimsPDX/backend-engine.git`
3. Run `npm install`

Heroku link?

## How to play

### Player Signup
```
POST /signup
```
- create a user account with username and password
- the user starts the age at 18 years of 

### User Signin
```
POST /signin
```
- signin to existing user account with username and password
- age and bank account updated

### Purchase Asset
The player can purchase assets like houses and vehicles, which add to their net worth. The value of houses will appreciate over time while the value of vehicles in constant.
```
GET /assets
```
- returns all available assets available for purchase

POST /:id/assets
- purchase asset for listed cost

### Career Options
The player can earn additional money in their bank account by working. Available career tracks are dependent on the education level of the player. Players can be promoted at their current jobs by logging time.
```
GET /careers
```
- returns all available career options for reference

<!--POST /:id/education
- purchase education at listed cost-->

### Purchase Education
The player can purchase additional education, which will lead to higher income potential.
```
GET /education
```
- returns all available education options for purchase

POST /:id/education
- purchase education at listed cost

### Purchase Activities
The player can choose to purchase activities, which could result in random benefits or pitfalls.
```
GET /activities
```
- returns all available activities available for purchase

POST /:id/activities
- purchase activities at listed cost

### Delete Player
```
DELETE /:id
```
- deletes user account

<!--## ADMIN Options

post new asset
put/patch
delete
get/get all

post new education
put/patch
delete
get/get all

post new job
put/patch
delete
get/get all

post new activity
put/patch
delete
get/get all-->


