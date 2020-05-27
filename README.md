A microservice with Nodejs(Express) that will does the following:

1. Signup/register a user with just username and password.

2. Signin/Login a user with username and password.

3. Allows the user to complete Registration/Add more profile details at a later time after initial signup. Login is required for the user to complete registration.

4. User to add personal details following a specified route endpoint. /registration/personal-details
Personal Details should contain the following;
- First name
- Last name
- Email
- phone| Should be valid Nigerian number
- password| Strong password check, Password confirmation
- Date of birth (Must be 18years or older)

5. User to add employment details following a specified route endpoint. /registration/employment_details
Employment Details should contain:
- Sector
- Employement Status
- Empolyer
- Employer Address
- Office Email
- Office Phone
- Designation

6. User to add bank details following a specified route endpoint. /registration/bank_details
Bank Details should conatin:
- Account number (Account Number should be a valid nuban number)
- Bank
- BVN (BVN should be a Valid BVN)

PS:
This is an initial attempt to get the above done. Please feel free to suggest corrections and improvements where necessary.
Also don't forget to run: "npm install" so as to install all the dev dependencies.
