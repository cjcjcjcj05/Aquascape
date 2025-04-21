# AquaDesign Testing Script

This script will guide you through testing all the new features we've implemented:
- User Profile Page
- Password Reset Functionality
- Email Verification

## Prerequisites
1. The application should be running
2. Make sure you can log in with your existing account

## Test 1: User Profile Page

1. Log in to your account
2. Click on the "Profile" button in the header
3. You should see your profile page with the following sections:
   - Personal Information (name, bio, location, website, avatar URL)
   - Account Information (username, email, verification status)
4. Try updating your profile information:
   - Add a display name
   - Add a bio
   - Add your location
   - Add a website URL
5. Click "Save Changes" - you should see a success toast
6. Refresh the page and verify the changes were saved

## Test 2: Email Verification

1. While on the profile page, look for your email verification status
2. If not verified, click the "Verify Email" button
3. You should see a success message with a link to preview the verification email
4. Click the preview link to see the email in Ethereal
5. In the email, click the verification link or copy-paste it into your browser
6. You should be taken to the verification confirmation page
7. After verification, go back to your profile and check that your email is now shown as verified

## Test 3: Password Reset Flow

1. Log out of your account
2. On the login page, click "Forgot password?"
3. Enter the email associated with your account and submit
4. You should see a confirmation that a reset link has been sent, with a preview link
5. Click the preview link to view the email in Ethereal
6. In the email, click the reset password link or copy-paste it into your browser
7. You should be taken to the reset password page
8. Enter a new password and confirm it
9. Submit the form and verify you see a success message
10. Try logging in with your new password

## Additional Tests

### Token Expiration
- Password reset tokens are set to expire after 1 hour (you can test this by waiting, or by manually modifying the expiry in the database)

### Form Validation
- Try submitting invalid data in the forms (e.g., mismatched passwords, invalid email formats)
- Verify that appropriate error messages are shown

### Navigation
- Verify that the navigation between pages works correctly
- Check that protected routes redirect to login when not authenticated

## Testing Notes

- For email verification and password reset, we're using Ethereal Email, which doesn't actually send emails but allows you to preview them
- The preview links will open in Ethereal where you can see the email content
- In a production environment, real emails would be sent to the users