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

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class PaymentVerificationError extends Error {
  constructor(message: string = "Payment verification failed") {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

export class RazorpayError extends Error {
  constructor(message: string = "Razorpay error") {
    super(message);
    this.name = "RazorpayError";
  }
}

export class InvalidSignatureError extends Error {
  constructor(message: string = "Invalid signature") {
    super(message);
    this.name = "InvalidSignatureError";
  }
}

export class PaymentTimeoutError extends Error {
  constructor(message: string = "Payment timeout") {
    super(message);
    this.name = "PaymentTimeoutError";
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

  if (error instanceof NotFoundError) {
    return Response.json(
      { error: "Not Found", message: error.message },
      { status: 404 }
    );
  }

  if (error instanceof PaymentVerificationError) {
    return Response.json(
      { error: "Payment Verification Failed", message: error.message },
      { status: 402 }
    );
  }

  if (error instanceof RazorpayError) {
    return Response.json(
      { error: "Razorpay Error", message: error.message },
      { status: 402 }
    );
  }

  if (error instanceof InvalidSignatureError) {
    return Response.json(
      { error: "Invalid Signature", message: error.message },
      { status: 401 }
    );
  }

  if (error instanceof PaymentTimeoutError) {
    return Response.json(
      { error: "Payment Timeout", message: error.message },
      { status: 408 }
    );
  }

  console.error(error);
  return Response.json(
    { error: "Internal Server Error", message: "Something went wrong" },
    { status: 500 }
  );
};
