import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateJWT = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No token or invalid token format');
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as string | JwtPayload;
    if(typeof user==='object'){
        return user;
    }
    else{
        console.error('Jwt does not contain a valid user id');
        return null;
    }
  } catch (err) {
    console.error('Error verifying JWT token:', err);
    return null;
  }
};
