package utez.edu.mx.sinv.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    // ========== EXCEPCIONES PERSONALIZADAS ========== //
    public static class NotAcceptableException extends RuntimeException {
        public NotAcceptableException(String message) { super(message); }
    }

    public static class PaymentRequiredException extends RuntimeException {
        public PaymentRequiredException(String message) { super(message); }
    }

    public static class RequestTimeoutException extends RuntimeException {
        public RequestTimeoutException(String message) { super(message); }
    }

    public static class ConflictException extends RuntimeException {
        public ConflictException(String message) { super(message); }
    }

    public static class ServiceUnavailableException extends RuntimeException {
        public ServiceUnavailableException(String message) { super(message); }
    }

    public static class GatewayTimeoutException extends RuntimeException {
        public GatewayTimeoutException(String message) { super(message); }
    }

    public static class BadGatewayException extends RuntimeException {
        public BadGatewayException(String message) { super(message); }
    }

    // ========== MANEJADORES PRINCIPALES ========== //

    // 400 - Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body("Error 400: Solicitud incorrecta - " + ex.getMessage());
    }

    // 403 - Forbidden
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleForbidden(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Error 403: Acceso denegado - " + ex.getMessage());
    }

    // 404 - Not Found
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<String> handleNotFound(NoHandlerFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Error 404: Recurso no encontrado - " + ex.getMessage());
    }

    // 406 - Not Acceptable
    @ExceptionHandler(NotAcceptableException.class)
    public ResponseEntity<String> handleNotAcceptable(NotAcceptableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                .body("Error 406: No aceptable - " + ex.getMessage());
    }

    // 408 - Request Timeout
    @ExceptionHandler(RequestTimeoutException.class)
    public ResponseEntity<String> handleRequestTimeout(RequestTimeoutException ex) {
        return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT)
                .body("Error 408: Tiempo de espera agotado - " + ex.getMessage());
    }

    // 409 - Conflict
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<String> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Error 409: Conflicto en la solicitud - " + ex.getMessage());
    }

    // 500 - Internal Server Error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleInternalError(Exception ex) {
        return ResponseEntity.internalServerError()
                .body("Error 500: Error interno del servidor - " + ex.getMessage());
    }

    // 502 - Bad Gateway
    @ExceptionHandler(BadGatewayException.class)
    public ResponseEntity<String> handleBadGateway(BadGatewayException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body("Error 502: Error de puerta de enlace - " + ex.getMessage());
    }

    // 503 - Service Unavailable
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<String> handleServiceUnavailable(ServiceUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Error 503: Servicio no disponible - " + ex.getMessage());
    }

    // 504 - Gateway Timeout
    @ExceptionHandler(GatewayTimeoutException.class)
    public ResponseEntity<String> handleGatewayTimeout(GatewayTimeoutException ex) {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body("Error 504: Tiempo de espera de puerta de enlace - " + ex.getMessage());
    }
}