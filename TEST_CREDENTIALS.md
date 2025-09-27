# Test User Credentials

Use these credentials to test the login functionality:

## Test Users

### EmilyQ (Primary Test User)
- **Email**: `emily@example.com`
- **Password**: `password123`
- **Username**: `EmilyQ`

### TestUser (Secondary Test User)
- **Email**: `test@example.com`
- **Password**: `password123`
- **Username**: `TestUser`

## How to Use

1. **Start the servers:**
   ```bash
   ./start-dev.sh
   ```

2. **Access the frontend:**
   - Go to http://localhost:3000
   - Click "Sign in" or go to http://localhost:3000/login

3. **Login with test credentials:**
   - Use either of the email/password combinations above
   - You'll be automatically logged in and redirected to the home page

4. **Test features:**
   - Create new posts (now requires authentication)
   - Vote on posts
   - Follow courses and tags
   - View personalized feed

## Backend API

- **Backend URL**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **Login Endpoint**: POST http://localhost:3001/api/auth/login
- **Register Endpoint**: POST http://localhost:3001/api/auth/register

## Notes

- Both test users have the same password for simplicity
- EmilyQ has pre-configured follows and preferences
- All posts created will be associated with the logged-in user
- JWT tokens expire after 7 days
