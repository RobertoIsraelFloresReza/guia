package utez.edu.mx.sinv.exception;

public class PaymentRequiredException extends Throwable {
    public PaymentRequiredException(String message) {
        super(message);
    }

    public PaymentRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
    public PaymentRequiredException(Throwable cause) {
        super(cause);
    }

    public PaymentRequiredException() {
        super("Payment is required to access this resource.");
    }

    public PaymentRequiredException(String message, boolean enableSuppression, boolean writableStackTrace) {
        super(message, null, enableSuppression, writableStackTrace);
    }
    public PaymentRequiredException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
    public PaymentRequiredException(Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(String.valueOf(cause), null, enableSuppression, writableStackTrace);
    }
    public PaymentRequiredException(String message, Throwable cause, boolean enableSuppression) {
        super(message, cause, enableSuppression, false);
    }

    public PaymentRequiredException(String message, boolean enableSuppression) {
        super(message, null, enableSuppression, false);
    }
}
