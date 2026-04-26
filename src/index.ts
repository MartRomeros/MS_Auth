import ServerlessHttp from 'serverless-http';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;

export const handler = ServerlessHttp(app);

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
