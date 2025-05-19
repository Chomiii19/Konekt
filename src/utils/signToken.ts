import jwt from "jsonwebtoken";

const signToken = (payload: string): string => {
  return jwt.sign({ payload }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN),
  });
};

export default signToken;
