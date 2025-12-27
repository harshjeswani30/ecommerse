export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AuthenticationError) {
    return Response.json(
      { error: "Unauthorized", message: error.message },
      { status: 401 }
    );
  }

  if (error instanceof AuthorizationError) {
    return Response.json(
      { error: "Forbidden", message: error.message },
      { status: 403 }
    );
  }

  if (error instanceof ValidationError) {
    return Response.json(
      { error: "Bad Request", message: error.message, details: error.details },
      { status: 400 }
    );
  }

  console.error(error);
  return Response.json(
    { error: "Internal Server Error", message: "Something went wrong" },
    { status: 500 }
  );
};
