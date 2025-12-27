import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { AuthenticationError, handleError } from "./errors";
import { JWTPayload } from "./types";

export type AuthenticatedRequest = NextRequest & {
  user: JWTPayload;
};

export const authMiddleware = async (req: NextRequest): Promise<JWTPayload> => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    throw new AuthenticationError("Invalid or expired token");
  }

  return payload;
};

export const withAuth = (
  handler: (req: AuthenticatedRequest, context: any) => Promise<Response>
) => {
  return async (req: NextRequest, context: any) => {
    try {
      const user = await authMiddleware(req);
      (req as AuthenticatedRequest).user = user;
      return await handler(req as AuthenticatedRequest, context);
    } catch (error) {
      return handleError(error);
    }
  };
};
